from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import Dict, Optional
from datetime import datetime
import logging
import os

from ..database import get_db
from ..managed_node_system import ManagedNodeSystem
from ..models import User, NodeDeployment, Node
from ..auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/managed-nodes", tags=["managed-nodes"])

@router.post("/request-deployment")
async def request_node_deployment(
    node_config: Dict,
    keychain_signature: str,
    hive_username: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Request deployment of a new node (requires Keychain verification)"""
    try:
        node_system = ManagedNodeSystem(db)
        
        # Verify Keychain authorization
        is_authorized = await node_system.verify_keychain_authorization(
            hive_username, 
            keychain_signature
        )
        
        if not is_authorized:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Keychain authorization failed"
            )
        
        # Deploy node
        result = await node_system.deploy_node(current_user.id, node_config)
        
        if not result['success']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result['error']
            )
        
        return {
            "success": True,
            "message": "Node deployment request submitted",
            "node_id": result['node_id'],
            "deployment_id": result['deployment_id'],
            "instructions": result['instructions']
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error requesting node deployment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to request node deployment"
        )

@router.post("/admin/approve-deployment")
async def approve_node_deployment(
    deployment_id: int,
    admin_signature: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin approves a node deployment"""
    try:
        # Check if user is admin
        if current_user.role != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        node_system = ManagedNodeSystem(db)
        result = await node_system.approve_node_deployment(deployment_id, admin_signature)
        
        if not result['success']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result['error']
            )
        
        return {
            "success": True,
            "message": result['message']
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving node deployment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to approve deployment"
        )

@router.get("/admin/pending-deployments")
async def get_pending_deployments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of pending node deployments (admin only)"""
    try:
        # Check if user is admin
        if current_user.role != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        pending_deployments = db.query(NodeDeployment).filter(
            NodeDeployment.deployment_status == 'pending'
        ).all()
        
        deployment_list = []
        for deployment in pending_deployments:
            user = db.query(User).filter(User.id == deployment.user_id).first()
            deployment_list.append({
                'id': deployment.id,
                'node_id': deployment.node_id,
                'user_id': deployment.user_id,
                'hive_username': user.hive_username if user else None,
                'node_config': deployment.node_config,
                'created_at': deployment.created_at.isoformat(),
                'status': deployment.deployment_status
            })
        
        return {
            "success": True,
            "pending_deployments": deployment_list,
            "total": len(deployment_list)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting pending deployments: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get pending deployments"
        )

@router.get("/node/{node_id}/status")
async def get_node_status(
    node_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get status of a specific node"""
    try:
        node_system = ManagedNodeSystem(db)
        result = await node_system.get_node_status(node_id)
        
        if not result['success']:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result['error']
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting node status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get node status"
        )

@router.get("/admin/network-overview")
async def get_network_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get overview of the managed node network (admin only)"""
    try:
        # Check if user is admin
        if current_user.role != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        node_system = ManagedNodeSystem(db)
        result = await node_system.get_network_overview()
        
        if not result['success']:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result['error']
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting network overview: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get network overview"
        )

@router.post("/admin/revoke-node")
async def revoke_node(
    node_id: str,
    reason: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin revokes a node (admin only)"""
    try:
        # Check if user is admin
        if current_user.role != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Find and deactivate node
        node = db.query(Node).filter(Node.node_id == node_id).first()
        if not node:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Node not found"
            )
        
        node.is_active = False
        node.revoked_at = datetime.utcnow()
        node.revocation_reason = reason
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Node {node_id} has been revoked",
            "reason": reason
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error revoking node: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to revoke node"
        )

@router.post("/admin/update-node-config")
async def update_node_config(
    node_id: str,
    new_config: Dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Admin updates node configuration (admin only)"""
    try:
        # Check if user is admin
        if current_user.role != 'admin':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Find node
        node = db.query(Node).filter(Node.node_id == node_id).first()
        if not node:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Node not found"
            )
        
        # Update node configuration
        node.config = new_config
        node.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Node {node_id} configuration updated",
            "new_config": new_config
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating node config: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update node configuration"
        )

@router.get("/my-nodes")
async def get_user_nodes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all nodes owned by the current user"""
    try:
        user_nodes = db.query(Node).filter(Node.user_id == current_user.id).all()
        
        node_list = []
        for node in user_nodes:
            node_list.append({
                'node_id': node.node_id,
                'is_active': node.is_active,
                'stake_amount': node.stake_amount,
                'created_at': node.created_at.isoformat(),
                'total_delegations': db.query(Delegation).filter(
                    Delegation.validator_id == node.id
                ).count()
            })
        
        return {
            "success": True,
            "nodes": node_list,
            "total": len(node_list)
        }
        
    except Exception as e:
        logger.error(f"Error getting user nodes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user nodes"
        )

@router.post("/download-executable")
async def download_node_executable(
    node_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download the executable for a user's node"""
    try:
        # Verify user owns this node
        node = db.query(Node).filter(
            and_(
                Node.node_id == node_id,
                Node.user_id == current_user.id
            )
        ).first()
        
        if not node:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Node not found or access denied"
            )
        
        # Check if executable exists
        exe_path = f"node_executables/{node_id}.bat"
        if not os.path.exists(exe_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Executable not found"
            )
        
        return {
            "success": True,
            "download_url": f"/api/managed-nodes/download/{node_id}",
            "instructions": "Click the download link to get your node executable"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading executable: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to download executable"
        )

@router.get("/download/{node_id}")
async def serve_node_executable(
    node_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Serve the node executable file"""
    try:
        # Verify user owns this node
        node = db.query(Node).filter(
            and_(
                Node.node_id == node_id,
                Node.user_id == current_user.id
            )
        ).first()
        
        if not node:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Node not found or access denied"
            )
        
        # Return file path for download
        exe_path = f"node_executables/{node_id}.bat"
        if not os.path.exists(exe_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Executable not found"
            )
        
        # In production, implement proper file serving
        return {
            "success": True,
            "file_path": exe_path,
            "message": "File ready for download"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving executable: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to serve executable"
        ) 