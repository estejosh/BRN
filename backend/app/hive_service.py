from beem import Hive
from beem.account import Account
from beem.instance import set_shared_blockchain_instance
from beem.nodelist import NodeList
from beem.transactionbuilder import TransactionBuilder
from beem.operations import Transfer, Custom_json
import logging
from typing import Optional, Dict, Any
import json

logger = logging.getLogger(__name__)

class HiveService:
    def __init__(self):
        # Initialize Hive connection
        nodelist = NodeList()
        nodelist.update_nodes()
        self.hive = Hive(node=nodelist.get_nodes())
        set_shared_blockchain_instance(self.hive)
        
        # App account for delegated posting
        self.app_account = None
        self.app_posting_key = None
        
    def set_app_credentials(self, username: str, posting_key: str):
        """Set the app's posting credentials for delegated posting"""
        self.app_account = Account(username, blockchain_instance=self.hive)
        self.app_posting_key = posting_key
        
    def get_user_balance(self, username: str) -> Dict[str, float]:
        """Get user's Hive and HBD balances"""
        try:
            account = Account(username, blockchain_instance=self.hive)
            return {
                'hive': float(account.get_balance('HIVE')),
                'hbd': float(account.get_balance('HBD')),
                'vests': float(account.get_balance('VESTS'))
            }
        except Exception as e:
            logger.error(f"Error getting balance for {username}: {e}")
            return {'hive': 0.0, 'hbd': 0.0, 'vests': 0.0}
    
    def post_to_hive(self, username: str, title: str, body: str, 
                     tags: list = None, permlink: str = None) -> Optional[str]:
        """Post to Hive using delegated posting authority"""
        try:
            if not self.app_account or not self.app_posting_key:
                raise ValueError("App credentials not set")
                
            # Create post operation
            from beem.operations import Comment
            from beem.utils import construct_identifier
            
            if not permlink:
                permlink = construct_identifier(username, title)
                
            if not tags:
                tags = ['brn', 'social']
                
            # Create the post
            tx = TransactionBuilder(blockchain_instance=self.hive)
            tx.appendOps(Comment(
                parent_author="",
                parent_permlink="",
                author=username,
                permlink=permlink,
                title=title,
                body=body,
                json_metadata=json.dumps({"tags": tags, "app": "brn-app"})
            ))
            
            # Sign with app's posting key (delegated authority)
            tx.appendWif(self.app_posting_key)
            tx.sign()
            tx.broadcast()
            
            logger.info(f"Posted to Hive: {permlink}")
            return permlink
            
        except Exception as e:
            logger.error(f"Error posting to Hive: {e}")
            return None
    
    def transfer_tokens(self, from_user: str, to_user: str, 
                       amount: float, token: str = 'HIVE', 
                       memo: str = "") -> Optional[str]:
        """Transfer tokens between users"""
        try:
            if not self.app_account or not self.app_posting_key:
                raise ValueError("App credentials not set")
                
            # Create transfer operation
            tx = TransactionBuilder(blockchain_instance=self.hive)
            tx.appendOps(Transfer(
                _from=from_user,
                to=to_user,
                amount=f"{amount:.3f} {token}",
                memo=memo
            ))
            
            # Sign with app's active key (for transfers)
            tx.appendWif(self.app_posting_key)
            tx.sign()
            result = tx.broadcast()
            
            logger.info(f"Transferred {amount} {token} from {from_user} to {to_user}")
            return result['transaction_id']
            
        except Exception as e:
            logger.error(f"Error transferring tokens: {e}")
            return None
    
    def boost_post(self, username: str, permlink: str, 
                   amount: float, token: str = 'HIVE') -> Optional[str]:
        """Boost a post with tokens"""
        try:
            if not self.app_account or not self.app_posting_key:
                raise ValueError("App credentials not set")
                
            # Create boost operation (custom JSON for Hive Engine tokens)
            if token == 'BRN':
                # Use custom JSON for Hive Engine tokens
                json_data = {
                    "contractName": "tokens",
                    "contractAction": "transfer",
                    "contractPayload": {
                        "to": username,
                        "symbol": "BRN",
                        "quantity": str(amount),
                        "memo": f"Boost for {permlink}"
                    }
                }
                
                tx = TransactionBuilder(blockchain_instance=self.hive)
                tx.appendOps(Custom_json(
                    required_auths=[],
                    required_posting_auths=[username],
                    id="ssc-mainnet-hive",
                    json=json.dumps(json_data)
                ))
                
            else:
                # Use regular transfer for native tokens
                return self.transfer_tokens(
                    from_user=username,
                    to_user=username,  # Self-transfer for boost
                    amount=amount,
                    token=token,
                    memo=f"Boost for {permlink}"
                )
            
            tx.appendWif(self.app_posting_key)
            tx.sign()
            result = tx.broadcast()
            
            logger.info(f"Boosted post {permlink} with {amount} {token}")
            return result['transaction_id']
            
        except Exception as e:
            logger.error(f"Error boosting post: {e}")
            return None
    
    def check_delegation(self, username: str) -> Dict[str, Any]:
        """Check if user has delegated posting authority to the app"""
        try:
            account = Account(username, blockchain_instance=self.hive)
            delegations = account.get_vesting_delegations()
            
            app_delegation = None
            for delegation in delegations:
                if delegation['delegatee'] == self.app_account.name:
                    app_delegation = delegation
                    break
                    
            return {
                'has_delegation': app_delegation is not None,
                'delegation_amount': float(app_delegation['vesting_shares']) if app_delegation else 0.0,
                'delegation_date': app_delegation['min_delegation_time'] if app_delegation else None
            }
            
        except Exception as e:
            logger.error(f"Error checking delegation for {username}: {e}")
            return {'has_delegation': False, 'delegation_amount': 0.0, 'delegation_date': None}
    
    def get_hive_engine_balance(self, username: str, token: str = 'BRN') -> float:
        """Get user's Hive Engine token balance"""
        try:
            # This would require Hive Engine API calls
            # For now, return 0 (implement with actual HE API)
            return 0.0
        except Exception as e:
            logger.error(f"Error getting HE balance for {username}: {e}")
            return 0.0 