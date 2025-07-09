import asyncio
import json
import hashlib
import hmac
import secrets
from typing import Dict, List, Optional, Set
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import logging
import subprocess
import os
import sys
from pathlib import Path
from beem import Hive
from beem.account import Account
from beem.instance import set_shared_blockchain_instance
from .models import User, Node, Delegation, NodeDeployment

logger = logging.getLogger(__name__)

class ManagedNodeSystem:
    def __init__(self, db_session: Session):
        self.db = db_session
        self.hive = Hive(node='https://api.hive.blog')
        set_shared_blockchain_instance(self.hive)
        self.admin_hive_account = os.getenv('ADMIN_HIVE_ACCOUNT', 'brnadmin')
        self.min_stake_requirement = 1000  # Minimum BRN stake to run node
        self.node_verification_threshold = 0.75  # 75% of validators must approve
        
    async def deploy_node(self, user_id: str, node_config: Dict) -> Dict:
        """Deploy a new node for a verified user"""
        try:
            # Verify user has sufficient stake
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user or user.brn_balance < self.min_stake_requirement:
                raise ValueError(f"User must have at least {self.min_stake_requirement} BRN to run a node")
            
            # Generate node credentials
            node_credentials = self._generate_node_credentials()
            
            # Create node deployment
            deployment = NodeDeployment(
                user_id=user_id,
                node_id=node_credentials['node_id'],
                deployment_status='pending',
                node_config=json.dumps(node_config),
                credentials_hash=hashlib.sha256(
                    json.dumps(node_credentials, sort_keys=True).encode()
                ).hexdigest(),
                created_at=datetime.utcnow()
            )
            
            self.db.add(deployment)
            self.db.commit()
            
            # Generate executable package
            exe_path = await self._generate_node_executable(
                node_credentials, 
                node_config,
                user.hive_username
            )
            
            return {
                'success': True,
                'node_id': node_credentials['node_id'],
                'deployment_id': deployment.id,
                'executable_path': exe_path,
                'instructions': self._generate_deployment_instructions(node_credentials)
            }
            
        except Exception as e:
            logger.error(f"Error deploying node: {e}")
            return {'success': False, 'error': str(e)}
    
    def _generate_node_credentials(self) -> Dict:
        """Generate secure credentials for a new node"""
        node_id = f"node_{secrets.token_hex(8)}"
        api_key = secrets.token_hex(32)
        secret_key = secrets.token_hex(32)
        
        return {
            'node_id': node_id,
            'api_key': api_key,
            'secret_key': secret_key,
            'created_at': datetime.utcnow().isoformat()
        }
    
    async def _generate_node_executable(self, credentials: Dict, config: Dict, hive_username: str) -> str:
        """Generate a self-contained executable for the node"""
        try:
            # Create node executable template
            node_code = self._create_node_executable_code(credentials, config, hive_username)
            
            # Create executable directory
            exe_dir = Path("node_executables")
            exe_dir.mkdir(exist_ok=True)
            
            # Save node code
            node_file = exe_dir / f"{credentials['node_id']}.py"
            with open(node_file, 'w') as f:
                f.write(node_code)
            
            # Create requirements file for the node
            requirements_file = exe_dir / f"{credentials['node_id']}_requirements.txt"
            with open(requirements_file, 'w') as f:
                f.write(self._get_node_requirements())
            
            # Create batch file for easy execution
            batch_file = exe_dir / f"{credentials['node_id']}.bat"
            with open(batch_file, 'w') as f:
                f.write(self._create_batch_file(credentials['node_id']))
            
            return str(batch_file)
            
        except Exception as e:
            logger.error(f"Error generating executable: {e}")
            raise
    
    def _create_node_executable_code(self, credentials: Dict, config: Dict, hive_username: str) -> str:
        """Create the Python code for the node executable"""
        return f'''
import asyncio
import json
import hashlib
import hmac
import requests
import logging
from datetime import datetime
from beem import Hive
from beem.account import Account
from beem.instance import set_shared_blockchain_instance

# Node Configuration
NODE_ID = "{credentials['node_id']}"
API_KEY = "{credentials['api_key']}"
SECRET_KEY = "{credentials['secret_key']}"
HIVE_USERNAME = "{hive_username}"
CONSENSUS_SERVER = "http://localhost:8000"  # Your BRN consensus server

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BRNNode:
    def __init__(self):
        self.hive = Hive(node='https://api.hive.blog')
        set_shared_blockchain_instance(self.hive)
        self.account = Account(HIVE_USERNAME, blockchain_instance=self.hive)
        self.is_running = False
        self.last_block = 0
        
    async def start_node(self):
        """Start the BRN consensus node"""
        logger.info(f"Starting BRN Node: {{NODE_ID}}")
        self.is_running = True
        
        # Register with consensus server
        await self._register_with_consensus()
        
        # Start consensus loop
        while self.is_running:
            try:
                await self._process_consensus_round()
                await asyncio.sleep(3)  # 3-second block time
            except Exception as e:
                logger.error(f"Error in consensus loop: {{e}}")
                await asyncio.sleep(5)
    
    async def _register_with_consensus(self):
        """Register this node with the consensus server"""
        try:
            registration_data = {{
                'node_id': NODE_ID,
                'hive_username': HIVE_USERNAME,
                'api_key': API_KEY,
                'timestamp': datetime.utcnow().isoformat()
            }}
            
            # Sign registration with secret key
            signature = self._sign_data(registration_data)
            registration_data['signature'] = signature
            
            response = requests.post(
                f"{{CONSENSUS_SERVER}}/api/nodes/register",
                json=registration_data,
                headers={{'Authorization': f'Bearer {{API_KEY}}'}}
            )
            
            if response.status_code == 200:
                logger.info("Successfully registered with consensus server")
            else:
                logger.error(f"Failed to register: {{response.text}}")
                
        except Exception as e:
            logger.error(f"Error registering with consensus: {{e}}")
    
    async def _process_consensus_round(self):
        """Process a consensus round"""
        try:
            # Get pending transactions
            response = requests.get(
                f"{{CONSENSUS_SERVER}}/api/consensus/pending",
                headers={{'Authorization': f'Bearer {{API_KEY}}'}}
            )
            
            if response.status_code == 200:
                pending_txs = response.json().get('transactions', [])
                
                # Vote on transactions
                for tx in pending_txs:
                    await self._vote_on_transaction(tx)
                    
        except Exception as e:
            logger.error(f"Error processing consensus round: {{e}}")
    
    async def _vote_on_transaction(self, transaction: Dict):
        """Vote on a transaction"""
        try:
            # Verify transaction signature
            if not self._verify_transaction_signature(transaction):
                logger.warning(f"Invalid transaction signature: {{transaction.get('tx_hash')}}")
                return
            
            # Create vote
            vote_data = {{
                'node_id': NODE_ID,
                'transaction_hash': transaction.get('tx_hash'),
                'vote': 'approve',  # or 'reject'
                'timestamp': datetime.utcnow().isoformat()
            }}
            
            # Sign vote
            signature = self._sign_data(vote_data)
            vote_data['signature'] = signature
            
            # Submit vote
            response = requests.post(
                f"{{CONSENSUS_SERVER}}/api/consensus/vote",
                json=vote_data,
                headers={{'Authorization': f'Bearer {{API_KEY}}'}}
            )
            
            if response.status_code == 200:
                logger.info(f"Voted on transaction: {{transaction.get('tx_hash')}}")
            else:
                logger.error(f"Failed to submit vote: {{response.text}}")
                
        except Exception as e:
            logger.error(f"Error voting on transaction: {{e}}")
    
    def _sign_data(self, data: Dict) -> str:
        """Sign data with node's secret key"""
        data_string = json.dumps(data, sort_keys=True)
        return hmac.new(
            SECRET_KEY.encode(),
            data_string.encode(),
            hashlib.sha256
        ).hexdigest()
    
    def _verify_transaction_signature(self, transaction: Dict) -> bool:
        """Verify transaction signature"""
        try:
            # In production, implement proper signature verification
            return True
        except Exception as e:
            logger.error(f"Error verifying transaction signature: {{e}}")
            return False
    
    def stop_node(self):
        """Stop the node"""
        logger.info(f"Stopping BRN Node: {{NODE_ID}}")
        self.is_running = False

async def main():
    """Main function to run the node"""
    node = BRNNode()
    
    try:
        await node.start_node()
    except KeyboardInterrupt:
        logger.info("Received shutdown signal")
        node.stop_node()
    except Exception as e:
        logger.error(f"Node error: {{e}}")
        node.stop_node()

if __name__ == "__main__":
    asyncio.run(main())
'''
    
    def _get_node_requirements(self) -> str:
        """Get requirements for the node executable"""
        return '''beem==0.25.0
requests==2.31.0
asyncio==3.4.3
cryptography==41.0.7
'''
    
    def _create_batch_file(self, node_id: str) -> str:
        """Create a batch file for easy node execution"""
        return f'''@echo off
echo Starting BRN Node: {node_id}
echo.
echo Installing requirements...
pip install -r {node_id}_requirements.txt
echo.
echo Starting node...
python {node_id}.py
pause
'''
    
    def _generate_deployment_instructions(self, credentials: Dict) -> str:
        """Generate deployment instructions for the user"""
        return f"""
BRN Node Deployment Instructions
===============================

Node ID: {credentials['node_id']}

1. Download the executable package
2. Extract to a secure location
3. Run the .bat file to start the node
4. The node will automatically:
   - Install required dependencies
   - Connect to the BRN consensus network
   - Begin participating in consensus

Security Notes:
- Keep your node credentials secure
- Run on a dedicated machine if possible
- Monitor the node logs for any issues

For support, contact the BRN team.
"""
    
    async def verify_keychain_authorization(self, hive_username: str, keychain_signature: str) -> bool:
        """Verify that user authorized with Hive Keychain"""
        try:
            # Verify the signature was created by the user's posting key
            # This would involve checking the signature against the user's public posting key
            
            # For now, we'll simulate verification
            # In production, implement proper Hive signature verification
            logger.info(f"Verifying Keychain authorization for {hive_username}")
            
            # Check if user has sufficient stake
            user = self.db.query(User).filter(User.hive_username == hive_username).first()
            if not user or user.brn_balance < self.min_stake_requirement:
                logger.warning(f"User {hive_username} has insufficient stake")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error verifying Keychain authorization: {e}")
            return False
    
    async def approve_node_deployment(self, deployment_id: int, admin_signature: str) -> Dict:
        """Admin approves a node deployment"""
        try:
            # Verify admin signature
            if not self._verify_admin_signature(admin_signature):
                raise ValueError("Invalid admin signature")
            
            deployment = self.db.query(NodeDeployment).filter(
                NodeDeployment.id == deployment_id
            ).first()
            
            if not deployment:
                raise ValueError("Deployment not found")
            
            # Update deployment status
            deployment.deployment_status = 'approved'
            deployment.approved_at = datetime.utcnow()
            
            # Create node record
            node = Node(
                user_id=deployment.user_id,
                node_id=deployment.node_id,
                is_active=True,
                stake_amount=0,  # Will be set by user delegation
                created_at=datetime.utcnow()
            )
            
            self.db.add(node)
            self.db.commit()
            
            return {
                'success': True,
                'message': f"Node {deployment.node_id} approved and activated"
            }
            
        except Exception as e:
            logger.error(f"Error approving node deployment: {e}")
            return {'success': False, 'error': str(e)}
    
    def _verify_admin_signature(self, signature: str) -> bool:
        """Verify admin signature"""
        try:
            # In production, implement proper admin signature verification
            # This would verify the signature was created by the admin's posting key
            return True
        except Exception as e:
            logger.error(f"Error verifying admin signature: {e}")
            return False
    
    async def get_node_status(self, node_id: str) -> Dict:
        """Get status of a specific node"""
        try:
            node = self.db.query(Node).filter(Node.node_id == node_id).first()
            if not node:
                return {'success': False, 'error': 'Node not found'}
            
            # Get node statistics
            user = self.db.query(User).filter(User.id == node.user_id).first()
            
            return {
                'success': True,
                'node_id': node.node_id,
                'user_id': node.user_id,
                'hive_username': user.hive_username if user else None,
                'is_active': node.is_active,
                'stake_amount': node.stake_amount,
                'created_at': node.created_at.isoformat(),
                'total_delegations': self.db.query(Delegation).filter(
                    Delegation.validator_id == node.id
                ).count()
            }
            
        except Exception as e:
            logger.error(f"Error getting node status: {e}")
            return {'success': False, 'error': str(e)}
    
    async def get_network_overview(self) -> Dict:
        """Get overview of the managed node network"""
        try:
            total_nodes = self.db.query(Node).count()
            active_nodes = self.db.query(Node).filter(Node.is_active == True).count()
            total_stake = self.db.query(Node).with_entities(
                Node.stake_amount
            ).filter(Node.is_active == True).all()
            
            total_stake_amount = sum(node.stake_amount for node in total_stake) if total_stake else 0
            
            pending_deployments = self.db.query(NodeDeployment).filter(
                NodeDeployment.deployment_status == 'pending'
            ).count()
            
            return {
                'success': True,
                'total_nodes': total_nodes,
                'active_nodes': active_nodes,
                'total_stake': total_stake_amount,
                'pending_deployments': pending_deployments,
                'min_stake_requirement': self.min_stake_requirement
            }
            
        except Exception as e:
            logger.error(f"Error getting network overview: {e}")
            return {'success': False, 'error': str(e)} 