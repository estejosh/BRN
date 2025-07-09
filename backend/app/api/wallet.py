from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Optional
from datetime import datetime
import logging

from ..database import get_db
from ..decentralized_wallet import DecentralizedWallet
from ..layer2_consensus import Layer2Consensus
from ..models import User, Transaction
from ..auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/wallet", tags=["wallet"])

@router.post("/create")
async def create_wallet(
    password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new decentralized wallet for the user"""
    try:
        wallet_service = DecentralizedWallet(db)
        
        # Check if user already has a wallet
        if current_user.wallet_hash:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has a wallet"
            )
        
        # Generate wallet
        wallet_data = wallet_service.generate_wallet(current_user.id, password)
        
        if not wallet_data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate wallet"
            )
        
        return {
            "success": True,
            "wallet_hash": wallet_data["wallet_hash"],
            "public_keys": wallet_data["public_keys"],
            "backup_phrase": wallet_data["backup_phrase"],
            "message": "Wallet created successfully. Save your backup phrase securely!"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating wallet: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@router.get("/balance")
async def get_wallet_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's wallet balances (Hive + BRN)"""
    try:
        wallet_service = DecentralizedWallet(db)
        balances = wallet_service.get_wallet_balance(current_user.id)
        
        return {
            "success": True,
            "balances": balances,
            "user_id": current_user.id
        }
        
    except Exception as e:
        logger.error(f"Error getting wallet balance: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get wallet balance"
        )

@router.post("/transfer/brn")
async def transfer_brn(
    to_user_id: str,
    amount: float,
    password: str,
    memo: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Transfer BRN tokens to another user (Layer 2)"""
    try:
        # Validate amount
        if amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Amount must be positive"
            )
        
        # Check if recipient exists
        recipient = db.query(User).filter(User.id == to_user_id).first()
        if not recipient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recipient not found"
            )
        
        # Check sender balance
        wallet_service = DecentralizedWallet(db)
        balances = wallet_service.get_wallet_balance(current_user.id)
        
        if balances['brn'] < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient BRN balance"
            )
        
        # Create transaction data
        transaction_data = {
            'type': 'brn_transfer',
            'from': current_user.id,
            'to': to_user_id,
            'amount': amount,
            'timestamp': datetime.utcnow().isoformat(),
            'memo': memo or ''
        }
        
        # Sign and submit transaction
        tx_hash = wallet_service.sign_transaction(
            current_user.id, 
            password, 
            transaction_data
        )
        
        if not tx_hash:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process transaction"
            )
        
        return {
            "success": True,
            "transaction_hash": tx_hash,
            "amount": amount,
            "to_user": to_user_id,
            "message": "BRN transfer initiated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error transferring BRN: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process transfer"
        )

@router.post("/transfer/hive")
async def transfer_hive(
    to_username: str,
    amount: float,
    token: str,  # "HIVE" or "HBD"
    password: str,
    memo: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Transfer Hive tokens (Layer 1)"""
    try:
        # Validate token
        if token not in ["HIVE", "HBD"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token must be HIVE or HBD"
            )
        
        # Validate amount
        if amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Amount must be positive"
            )
        
        # Check if user has Hive account
        if not current_user.hive_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not connected to Hive account"
            )
        
        # Create transaction data
        transaction_data = {
            'type': 'hive_transfer',
            'from': current_user.hive_username,
            'to': to_username,
            'amount': amount,
            'token': token,
            'memo': memo or ''
        }
        
        # Sign and submit transaction
        wallet_service = DecentralizedWallet(db)
        tx_hash = wallet_service.sign_transaction(
            current_user.id, 
            password, 
            transaction_data
        )
        
        if not tx_hash:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process Hive transaction"
            )
        
        return {
            "success": True,
            "transaction_hash": tx_hash,
            "amount": amount,
            "token": token,
            "to_username": to_username,
            "message": "Hive transfer initiated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error transferring Hive: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process Hive transfer"
        )

@router.post("/stake/delegate")
async def delegate_stake(
    validator_id: str,
    amount: float,
    password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delegate stake to a validator node"""
    try:
        # Validate amount
        if amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stake amount must be positive"
            )
        
        # Check if validator exists and is active
        validator = db.query(User).filter(User.id == validator_id).first()
        if not validator:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Validator not found"
            )
        
        # Check user's BRN balance
        wallet_service = DecentralizedWallet(db)
        balances = wallet_service.get_wallet_balance(current_user.id)
        
        if balances['brn'] < amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient BRN balance for delegation"
            )
        
        # Create delegation transaction
        transaction_data = {
            'type': 'stake_delegation',
            'delegator': current_user.id,
            'validator': validator_id,
            'amount': amount,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Submit to Layer 2 consensus
        consensus = Layer2Consensus(db)
        success = consensus.submit_transaction(transaction_data)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to submit delegation transaction"
            )
        
        return {
            "success": True,
            "delegator": current_user.id,
            "validator": validator_id,
            "amount": amount,
            "message": "Stake delegation submitted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error delegating stake: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process delegation"
        )

@router.post("/validator/register")
async def register_validator(
    stake_amount: float,
    password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Register as a validator node"""
    try:
        # Validate stake amount
        if stake_amount < 1000:  # Minimum stake requirement
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Minimum stake amount is 1000 BRN"
            )
        
        # Check user's BRN balance
        wallet_service = DecentralizedWallet(db)
        balances = wallet_service.get_wallet_balance(current_user.id)
        
        if balances['brn'] < stake_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient BRN balance for validator registration"
            )
        
        # Create validator registration transaction
        transaction_data = {
            'type': 'validator_registration',
            'user_id': current_user.id,
            'stake_amount': stake_amount,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Submit to Layer 2 consensus
        consensus = Layer2Consensus(db)
        success = consensus.submit_transaction(transaction_data)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to submit validator registration"
            )
        
        return {
            "success": True,
            "user_id": current_user.id,
            "stake_amount": stake_amount,
            "message": "Validator registration submitted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering validator: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process validator registration"
        )

@router.get("/transactions")
async def get_transaction_history(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's transaction history"""
    try:
        transactions = db.query(Transaction).filter(
            Transaction.user_id == current_user.id
        ).order_by(
            Transaction.created_at.desc()
        ).offset(offset).limit(limit).all()
        
        transaction_list = []
        for tx in transactions:
            transaction_list.append({
                'id': tx.id,
                'type': tx.transaction_type,
                'amount': tx.amount,
                'description': tx.description,
                'created_at': tx.created_at.isoformat(),
                'tx_hash': tx.tx_hash
            })
        
        return {
            "success": True,
            "transactions": transaction_list,
            "total": len(transaction_list)
        }
        
    except Exception as e:
        logger.error(f"Error getting transaction history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get transaction history"
        )

@router.get("/network/stats")
async def get_network_stats(
    db: Session = Depends(get_db)
):
    """Get Layer 2 network statistics"""
    try:
        consensus = Layer2Consensus(db)
        stats = consensus.get_network_stats()
        
        return {
            "success": True,
            "network_stats": stats
        }
        
    except Exception as e:
        logger.error(f"Error getting network stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get network statistics"
        ) 