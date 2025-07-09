import hashlib
import hmac
import json
import secrets
from typing import Dict, List, Optional, Tuple
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from beem import Hive
from beem.account import Account
from beem.instance import set_shared_blockchain_instance
from beem.transactionbuilder import TransactionBuilder
from beem.operations import Transfer, Custom_json
import logging
from datetime import datetime, timedelta
import asyncio
from sqlalchemy.orm import Session
from .models import User, Transaction, Node

logger = logging.getLogger(__name__)

class DecentralizedWallet:
    def __init__(self, db_session: Session):
        self.db = db_session
        self.hive = Hive(node='https://api.hive.blog')
        set_shared_blockchain_instance(self.hive)
        self.consensus_threshold = 0.67
        
    def generate_wallet(self, user_id: str, password: str) -> Dict[str, str]:
        """Generate a new decentralized wallet with encrypted keys"""
        try:
            # Generate master seed
            master_seed = secrets.token_hex(32)
            
            # Derive encryption key from password
            salt = secrets.token_hex(16)
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt.encode(),
                iterations=100000,
                backend=default_backend()
            )
            encryption_key = kdf.derive(password.encode())
            
            # Generate Hive keys
            hive_keys = self._generate_hive_keys(master_seed)
            
            # Encrypt private keys
            encrypted_keys = self._encrypt_keys(hive_keys, encryption_key)
            
            # Create wallet data
            wallet_data = {
                'user_id': user_id,
                'master_seed': master_seed,
                'salt': salt,
                'encrypted_keys': encrypted_keys,
                'public_keys': {
                    'owner': hive_keys['owner_public'],
                    'active': hive_keys['active_public'],
                    'posting': hive_keys['posting_public'],
                    'memo': hive_keys['memo_public']
                },
                'created_at': datetime.utcnow().isoformat()
            }
            
            # Store wallet hash (not the actual wallet)
            wallet_hash = hashlib.sha256(json.dumps(wallet_data, sort_keys=True).encode()).hexdigest()
            
            # Update user with wallet info
            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                user.hive_public_key = hive_keys['posting_public']
                user.wallet_hash = wallet_hash
                self.db.commit()
            
            return {
                'wallet_hash': wallet_hash,
                'public_keys': wallet_data['public_keys'],
                'backup_phrase': self._generate_backup_phrase(master_seed)
            }
            
        except Exception as e:
            logger.error(f"Error generating wallet: {e}")
            return {}
    
    def _generate_hive_keys(self, master_seed: str) -> Dict[str, str]:
        """Generate Hive blockchain keys from master seed"""
        # In production, use proper Hive key generation
        # This is a simplified version
        keys = {}
        key_types = ['owner', 'active', 'posting', 'memo']
        
        for key_type in key_types:
            # Generate key pair from master seed + key type
            key_seed = f"{master_seed}:{key_type}"
            private_key = hashlib.sha256(key_seed.encode()).hexdigest()
            public_key = hashlib.sha256(private_key.encode()).hexdigest()[:52]
            
            keys[f"{key_type}_private"] = private_key
            keys[f"{key_type}_public"] = public_key
        
        return keys
    
    def _encrypt_keys(self, keys: Dict[str, str], encryption_key: bytes) -> Dict[str, str]:
        """Encrypt private keys"""
        encrypted = {}
        
        for key_name, private_key in keys.items():
            if 'private' in key_name:
                # Generate IV
                iv = secrets.token_hex(16)
                
                # Encrypt key
                cipher = Cipher(
                    algorithms.AES(encryption_key),
                    modes.CBC(bytes.fromhex(iv)),
                    backend=default_backend()
                )
                encryptor = cipher.encryptor()
                
                # Pad the key to 16-byte boundary
                padded_key = private_key.encode()
                while len(padded_key) % 16 != 0:
                    padded_key += b'\0'
                
                encrypted_data = encryptor.update(padded_key) + encryptor.finalize()
                
                encrypted[key_name] = {
                    'iv': iv,
                    'data': encrypted_data.hex()
                }
        
        return encrypted
    
    def _generate_backup_phrase(self, master_seed: str) -> str:
        """Generate 12-word backup phrase from master seed"""
        # Simplified backup phrase generation
        # In production, use BIP39 or similar standard
        words = [
            'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
            'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid'
        ]
        
        # Convert seed to word indices
        seed_bytes = bytes.fromhex(master_seed)
        indices = []
        for i in range(0, len(seed_bytes), 2):
            if i + 1 < len(seed_bytes):
                index = (seed_bytes[i] << 8 | seed_bytes[i + 1]) % len(words)
                indices.append(index)
        
        # Generate 12-word phrase
        phrase = []
        for i in range(12):
            phrase.append(words[indices[i % len(indices)]])
        
        return ' '.join(phrase)
    
    def sign_transaction(self, user_id: str, password: str, 
                        transaction_data: Dict) -> Optional[str]:
        """Sign a transaction with user's private keys"""
        try:
            # Retrieve and decrypt user's wallet
            wallet = self._get_user_wallet(user_id, password)
            if not wallet:
                return None
            
            # Create transaction based on type
            if transaction_data['type'] == 'hive_transfer':
                return self._sign_hive_transfer(wallet, transaction_data)
            elif transaction_data['type'] == 'brn_transfer':
                return self._sign_brn_transfer(wallet, transaction_data)
            elif transaction_data['type'] == 'post_to_hive':
                return self._sign_hive_post(wallet, transaction_data)
            
            return None
            
        except Exception as e:
            logger.error(f"Error signing transaction: {e}")
            return None
    
    def _sign_hive_transfer(self, wallet: Dict, tx_data: Dict) -> Optional[str]:
        """Sign Hive transfer transaction"""
        try:
            # Create transfer operation
            tx = TransactionBuilder(blockchain_instance=self.hive)
            tx.appendOps(Transfer(
                _from=tx_data['from'],
                to=tx_data['to'],
                amount=f"{tx_data['amount']:.3f} {tx_data['token']}",
                memo=tx_data.get('memo', '')
            ))
            
            # Sign with active key
            active_private = wallet['decrypted_keys']['active_private']
            tx.appendWif(active_private)
            tx.sign()
            result = tx.broadcast()
            
            return result['transaction_id']
            
        except Exception as e:
            logger.error(f"Error signing Hive transfer: {e}")
            return None
    
    def _sign_brn_transfer(self, wallet: Dict, tx_data: Dict) -> Optional[str]:
        """Sign BRN token transfer (Layer 2)"""
        try:
            # Create Layer 2 transaction
            layer2_tx = {
                'from': tx_data['from'],
                'to': tx_data['to'],
                'amount': tx_data['amount'],
                'token': 'BRN',
                'timestamp': datetime.utcnow().isoformat(),
                'signature': self._sign_layer2_tx(wallet, tx_data)
            }
            
            # Submit to Layer 2 consensus
            tx_hash = self._submit_to_layer2_consensus(layer2_tx)
            return tx_hash
            
        except Exception as e:
            logger.error(f"Error signing BRN transfer: {e}")
            return None
    
    def _sign_layer2_tx(self, wallet: Dict, tx_data: Dict) -> str:
        """Sign Layer 2 transaction"""
        # Create transaction hash
        tx_string = f"{tx_data['from']}:{tx_data['to']}:{tx_data['amount']}:{tx_data['timestamp']}"
        tx_hash = hashlib.sha256(tx_string.encode()).hexdigest()
        
        # Sign with posting key (for Layer 2)
        posting_private = wallet['decrypted_keys']['posting_private']
        signature = hmac.new(
            posting_private.encode(),
            tx_hash.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return signature
    
    def _submit_to_layer2_consensus(self, layer2_tx: Dict) -> Optional[str]:
        """Submit transaction to Layer 2 consensus"""
        try:
            # Get active nodes
            active_nodes = self.db.query(Node).filter(Node.is_active == True).all()
            
            if not active_nodes:
                raise ValueError("No active nodes for consensus")
            
            # Simulate consensus voting
            votes_for = 0
            total_stake = sum(node.stake_amount for node in active_nodes)
            
            for node in active_nodes:
                # Simulate node voting (in real implementation, nodes would vote)
                if node.stake_amount > 0:
                    votes_for += node.stake_amount
            
            consensus_ratio = votes_for / total_stake if total_stake > 0 else 0
            
            if consensus_ratio >= self.consensus_threshold:
                # Execute transaction
                self._execute_layer2_transaction(layer2_tx)
                
                # Record transaction
                transaction = Transaction(
                    user_id=layer2_tx['from'],
                    transaction_type='brn_transfer',
                    amount=layer2_tx['amount'],
                    description=f"BRN Layer 2 transfer to {layer2_tx['to']}"
                )
                
                self.db.add(transaction)
                self.db.commit()
                
                return hashlib.sha256(json.dumps(layer2_tx, sort_keys=True).encode()).hexdigest()
            
            return None
            
        except Exception as e:
            logger.error(f"Error submitting to Layer 2 consensus: {e}")
            return None
    
    def _execute_layer2_transaction(self, layer2_tx: Dict):
        """Execute Layer 2 transaction"""
        # Deduct from sender
        sender = self.db.query(User).filter(User.id == layer2_tx['from']).first()
        if sender:
            sender.brn_balance -= layer2_tx['amount']
        
        # Add to receiver
        receiver = self.db.query(User).filter(User.id == layer2_tx['to']).first()
        if receiver:
            receiver.brn_balance += layer2_tx['amount']
    
    def get_wallet_balance(self, user_id: str) -> Dict[str, float]:
        """Get user's wallet balances (Hive + BRN)"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return {'hive': 0.0, 'hbd': 0.0, 'brn': 0.0}
            
            # Get Hive balances
            if user.hive_username:
                account = Account(user.hive_username, blockchain_instance=self.hive)
                hive_balance = float(account.get_balance('HIVE'))
                hbd_balance = float(account.get_balance('HBD'))
            else:
                hive_balance = 0.0
                hbd_balance = 0.0
            
            return {
                'hive': hive_balance,
                'hbd': hbd_balance,
                'brn': user.brn_balance
            }
            
        except Exception as e:
            logger.error(f"Error getting wallet balance: {e}")
            return {'hive': 0.0, 'hbd': 0.0, 'brn': 0.0}
    
    def _get_user_wallet(self, user_id: str, password: str) -> Optional[Dict]:
        """Retrieve and decrypt user's wallet"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user or not user.wallet_hash:
                return None
            
            # In production, you'd store encrypted wallet data
            # For now, we'll simulate wallet retrieval
            # This is where you'd decrypt the stored wallet data
            
            # Simulate decrypted wallet
            wallet = {
                'decrypted_keys': {
                    'owner_private': 'simulated_owner_key',
                    'active_private': 'simulated_active_key',
                    'posting_private': 'simulated_posting_key',
                    'memo_private': 'simulated_memo_key'
                }
            }
            
            return wallet
            
        except Exception as e:
            logger.error(f"Error getting user wallet: {e}")
            return None 