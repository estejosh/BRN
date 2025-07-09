import asyncio
import json
import hashlib
import hmac
from typing import Dict, List, Optional, Set
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import logging
from .models import User, Transaction, Node, Delegation

logger = logging.getLogger(__name__)

class Layer2Consensus:
    def __init__(self, db_session: Session):
        self.db = db_session
        self.consensus_threshold = 0.67  # 67% stake required
        self.block_time = 3  # seconds
        self.pending_transactions: List[Dict] = []
        self.validators: Set[str] = set()
        self.current_block = 0
        self.is_running = False
        
    async def start_consensus_network(self):
        """Start the Layer 2 consensus network"""
        self.is_running = True
        logger.info("Starting Layer 2 consensus network...")
        
        # Start consensus loop
        asyncio.create_task(self._consensus_loop())
        
        # Start validator monitoring
        asyncio.create_task(self._monitor_validators())
        
    async def stop_consensus_network(self):
        """Stop the Layer 2 consensus network"""
        self.is_running = False
        logger.info("Stopping Layer 2 consensus network...")
    
    async def _consensus_loop(self):
        """Main consensus loop"""
        while self.is_running:
            try:
                # Process pending transactions
                if self.pending_transactions:
                    await self._process_block()
                
                # Wait for next block
                await asyncio.sleep(self.block_time)
                
            except Exception as e:
                logger.error(f"Error in consensus loop: {e}")
                await asyncio.sleep(1)
    
    async def _process_block(self):
        """Process a block of transactions"""
        try:
            # Get validators for this block
            validators = self._get_active_validators()
            if not validators:
                logger.warning("No active validators for consensus")
                return
            
            # Create block
            block = {
                'block_number': self.current_block,
                'timestamp': datetime.utcnow().isoformat(),
                'transactions': self.pending_transactions.copy(),
                'validator_votes': {},
                'total_stake': sum(v['stake_amount'] for v in validators)
            }
            
            # Simulate validator voting
            votes_for = 0
            total_stake = block['total_stake']
            
            for validator in validators:
                # In real implementation, validators would vote on each transaction
                # For now, we'll simulate approval
                votes_for += validator['stake_amount']
                block['validator_votes'][validator['node_id']] = 'approve'
            
            consensus_ratio = votes_for / total_stake if total_stake > 0 else 0
            
            if consensus_ratio >= self.consensus_threshold:
                # Execute transactions
                await self._execute_block_transactions(block)
                
                # Record block
                self._record_block(block)
                
                # Clear pending transactions
                self.pending_transactions.clear()
                
                self.current_block += 1
                logger.info(f"Block {self.current_block} processed with {len(block['transactions'])} transactions")
            else:
                logger.warning(f"Insufficient consensus: {consensus_ratio:.2%} < {self.consensus_threshold:.2%}")
                
        except Exception as e:
            logger.error(f"Error processing block: {e}")
    
    async def _execute_block_transactions(self, block: Dict):
        """Execute all transactions in a block"""
        for tx in block['transactions']:
            try:
                if tx['type'] == 'brn_transfer':
                    await self._execute_brn_transfer(tx)
                elif tx['type'] == 'stake_delegation':
                    await self._execute_stake_delegation(tx)
                elif tx['type'] == 'validator_registration':
                    await self._execute_validator_registration(tx)
                    
            except Exception as e:
                logger.error(f"Error executing transaction {tx.get('tx_hash', 'unknown')}: {e}")
    
    async def _execute_brn_transfer(self, tx: Dict):
        """Execute BRN token transfer"""
        try:
            # Verify transaction signature
            if not self._verify_transaction_signature(tx):
                logger.warning(f"Invalid signature for transaction {tx.get('tx_hash')}")
                return
            
            # Check sender balance
            sender = self.db.query(User).filter(User.id == tx['from']).first()
            if not sender or sender.brn_balance < tx['amount']:
                logger.warning(f"Insufficient balance for transaction {tx.get('tx_hash')}")
                return
            
            # Execute transfer
            sender.brn_balance -= tx['amount']
            
            receiver = self.db.query(User).filter(User.id == tx['to']).first()
            if receiver:
                receiver.brn_balance += tx['amount']
            
            # Record transaction
            transaction = Transaction(
                user_id=tx['from'],
                transaction_type='brn_transfer',
                amount=tx['amount'],
                description=f"BRN transfer to {tx['to']}",
                tx_hash=tx.get('tx_hash')
            )
            
            self.db.add(transaction)
            self.db.commit()
            
            logger.info(f"BRN transfer executed: {tx['amount']} from {tx['from']} to {tx['to']}")
            
        except Exception as e:
            logger.error(f"Error executing BRN transfer: {e}")
    
    async def _execute_stake_delegation(self, tx: Dict):
        """Execute stake delegation"""
        try:
            delegator = self.db.query(User).filter(User.id == tx['delegator']).first()
            validator = self.db.query(Node).filter(Node.id == tx['validator']).first()
            
            if not delegator or not validator:
                logger.warning(f"Invalid delegation: delegator or validator not found")
                return
            
            # Create or update delegation
            delegation = self.db.query(Delegation).filter(
                and_(
                    Delegation.delegator_id == tx['delegator'],
                    Delegation.validator_id == tx['validator']
                )
            ).first()
            
            if delegation:
                delegation.amount += tx['amount']
            else:
                delegation = Delegation(
                    delegator_id=tx['delegator'],
                    validator_id=tx['validator'],
                    amount=tx['amount']
                )
                self.db.add(delegation)
            
            # Update validator stake
            validator.stake_amount += tx['amount']
            
            self.db.commit()
            logger.info(f"Stake delegation: {tx['amount']} from {tx['delegator']} to {tx['validator']}")
            
        except Exception as e:
            logger.error(f"Error executing stake delegation: {e}")
    
    async def _execute_validator_registration(self, tx: Dict):
        """Execute validator registration"""
        try:
            user = self.db.query(User).filter(User.id == tx['user_id']).first()
            if not user:
                logger.warning(f"User not found for validator registration")
                return
            
            # Create or update validator node
            node = self.db.query(Node).filter(Node.user_id == tx['user_id']).first()
            
            if node:
                node.is_active = True
                node.stake_amount = tx.get('stake_amount', 0)
            else:
                node = Node(
                    user_id=tx['user_id'],
                    node_id=tx.get('node_id', f"node_{tx['user_id']}"),
                    stake_amount=tx.get('stake_amount', 0),
                    is_active=True
                )
                self.db.add(node)
            
            self.db.commit()
            logger.info(f"Validator registered: {tx['user_id']} with stake {tx.get('stake_amount', 0)}")
            
        except Exception as e:
            logger.error(f"Error executing validator registration: {e}")
    
    def _verify_transaction_signature(self, tx: Dict) -> bool:
        """Verify transaction signature"""
        try:
            # Create transaction hash
            tx_string = f"{tx['from']}:{tx['to']}:{tx['amount']}:{tx['timestamp']}"
            expected_hash = hashlib.sha256(tx_string.encode()).hexdigest()
            
            # Verify signature
            if 'signature' not in tx:
                return False
            
            # In production, use proper cryptographic signature verification
            # For now, we'll simulate verification
            return True
            
        except Exception as e:
            logger.error(f"Error verifying transaction signature: {e}")
            return False
    
    def _get_active_validators(self) -> List[Dict]:
        """Get active validators with their stake amounts"""
        try:
            active_nodes = self.db.query(Node).filter(Node.is_active == True).all()
            
            validators = []
            for node in active_nodes:
                # Get total delegated stake
                delegated_stake = self.db.query(Delegation).filter(
                    Delegation.validator_id == node.id
                ).with_entities(
                    Delegation.amount
                ).all()
                
                total_delegated = sum(d.amount for d in delegated_stake) if delegated_stake else 0
                total_stake = node.stake_amount + total_delegated
                
                validators.append({
                    'node_id': node.node_id,
                    'user_id': node.user_id,
                    'stake_amount': total_stake,
                    'is_active': node.is_active
                })
            
            return validators
            
        except Exception as e:
            logger.error(f"Error getting active validators: {e}")
            return []
    
    async def _monitor_validators(self):
        """Monitor validator health and performance"""
        while self.is_running:
            try:
                validators = self._get_active_validators()
                
                # Check validator performance
                for validator in validators:
                    # In production, check validator uptime, response time, etc.
                    pass
                
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"Error monitoring validators: {e}")
                await asyncio.sleep(5)
    
    def _record_block(self, block: Dict):
        """Record block in database"""
        try:
            # In production, store block data
            logger.info(f"Block {block['block_number']} recorded with {len(block['transactions'])} transactions")
            
        except Exception as e:
            logger.error(f"Error recording block: {e}")
    
    def submit_transaction(self, transaction: Dict) -> bool:
        """Submit transaction to Layer 2 network"""
        try:
            # Validate transaction
            if not self._validate_transaction(transaction):
                logger.warning(f"Invalid transaction submitted")
                return False
            
            # Add transaction hash
            transaction['tx_hash'] = self._calculate_transaction_hash(transaction)
            
            # Add to pending transactions
            self.pending_transactions.append(transaction)
            
            logger.info(f"Transaction submitted: {transaction['tx_hash']}")
            return True
            
        except Exception as e:
            logger.error(f"Error submitting transaction: {e}")
            return False
    
    def _validate_transaction(self, transaction: Dict) -> bool:
        """Validate transaction format and data"""
        try:
            required_fields = ['type', 'from', 'timestamp']
            
            for field in required_fields:
                if field not in transaction:
                    logger.warning(f"Missing required field: {field}")
                    return False
            
            # Validate transaction type
            valid_types = ['brn_transfer', 'stake_delegation', 'validator_registration']
            if transaction['type'] not in valid_types:
                logger.warning(f"Invalid transaction type: {transaction['type']}")
                return False
            
            # Type-specific validation
            if transaction['type'] == 'brn_transfer':
                if 'to' not in transaction or 'amount' not in transaction:
                    logger.warning("BRN transfer missing 'to' or 'amount'")
                    return False
                
                if transaction['amount'] <= 0:
                    logger.warning("BRN transfer amount must be positive")
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error validating transaction: {e}")
            return False
    
    def _calculate_transaction_hash(self, transaction: Dict) -> str:
        """Calculate transaction hash"""
        try:
            # Create deterministic transaction string
            tx_data = {
                'type': transaction['type'],
                'from': transaction['from'],
                'timestamp': transaction['timestamp']
            }
            
            if transaction['type'] == 'brn_transfer':
                tx_data.update({
                    'to': transaction['to'],
                    'amount': transaction['amount']
                })
            elif transaction['type'] == 'stake_delegation':
                tx_data.update({
                    'delegator': transaction['delegator'],
                    'validator': transaction['validator'],
                    'amount': transaction['amount']
                })
            elif transaction['type'] == 'validator_registration':
                tx_data.update({
                    'user_id': transaction['user_id'],
                    'stake_amount': transaction.get('stake_amount', 0)
                })
            
            # Calculate hash
            tx_string = json.dumps(tx_data, sort_keys=True)
            return hashlib.sha256(tx_string.encode()).hexdigest()
            
        except Exception as e:
            logger.error(f"Error calculating transaction hash: {e}")
            return ""
    
    def get_network_stats(self) -> Dict:
        """Get Layer 2 network statistics"""
        try:
            active_validators = self.db.query(Node).filter(Node.is_active == True).count()
            total_stake = self.db.query(Node).with_entities(
                Node.stake_amount
            ).filter(Node.is_active == True).all()
            
            total_stake_amount = sum(node.stake_amount for node in total_stake) if total_stake else 0
            
            return {
                'active_validators': active_validators,
                'total_stake': total_stake_amount,
                'current_block': self.current_block,
                'pending_transactions': len(self.pending_transactions),
                'consensus_threshold': self.consensus_threshold,
                'block_time': self.block_time
            }
            
        except Exception as e:
            logger.error(f"Error getting network stats: {e}")
            return {} 