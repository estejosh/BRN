import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import docker
from sqlalchemy.orm import Session
from .models import Node, NodeStake, User, Transaction
import hashlib
import hmac

logger = logging.getLogger(__name__)

class Layer2Service:
    def __init__(self, db_session: Session):
        self.db = db_session
        self.docker_client = docker.from_env()
        self.consensus_threshold = 0.67  # 67% of staked nodes must agree
        
    def create_node(self, node_address: str, stake_amount: float) -> Optional[Node]:
        """Create a new decentralized node"""
        try:
            # Create Docker container for the node
            container = self.docker_client.containers.run(
                "brn-node:latest",
                detach=True,
                environment={
                    "NODE_ADDRESS": node_address,
                    "STAKE_AMOUNT": str(stake_amount),
                    "NETWORK_ID": "brn-layer2"
                },
                ports={'8000/tcp': None},  # Random port mapping
                name=f"brn-node-{node_address[:8]}"
            )
            
            # Create node record
            node = Node(
                node_address=node_address,
                stake_amount=stake_amount,
                docker_container_id=container.id,
                last_heartbeat=datetime.utcnow()
            )
            
            self.db.add(node)
            self.db.commit()
            
            logger.info(f"Created node {node_address} with stake {stake_amount}")
            return node
            
        except Exception as e:
            logger.error(f"Error creating node: {e}")
            return None
    
    def stake_on_node(self, user_id: str, node_id: str, stake_amount: float) -> bool:
        """Stake BRN tokens on a node"""
        try:
            # Check if user has enough BRN tokens
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user or user.brn_balance < stake_amount:
                return False
            
            # Create stake
            stake = NodeStake(
                user_id=user_id,
                node_id=node_id,
                stake_amount=stake_amount
            )
            
            # Deduct tokens from user
            user.brn_balance -= stake_amount
            
            # Add stake to node
            node = self.db.query(Node).filter(Node.id == node_id).first()
            if node:
                node.stake_amount += stake_amount
            
            self.db.add(stake)
            self.db.commit()
            
            logger.info(f"User {user_id} staked {stake_amount} BRN on node {node_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error staking on node: {e}")
            self.db.rollback()
            return False
    
    def process_brn_transaction(self, from_user: str, to_user: str, 
                               amount: float, transaction_type: str) -> Optional[str]:
        """Process BRN token transaction on Layer 2"""
        try:
            # Get consensus from active nodes
            active_nodes = self.db.query(Node).filter(Node.is_active == True).all()
            
            if not active_nodes:
                raise ValueError("No active nodes available")
            
            # Create transaction hash
            tx_data = {
                "from": from_user,
                "to": to_user,
                "amount": amount,
                "type": transaction_type,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            tx_hash = hashlib.sha256(json.dumps(tx_data, sort_keys=True).encode()).hexdigest()
            
            # Simulate consensus (in real implementation, nodes would vote)
            consensus_reached = self._simulate_consensus(active_nodes, tx_hash)
            
            if consensus_reached:
                # Execute transaction
                self._execute_brn_transaction(from_user, to_user, amount, transaction_type)
                
                # Record transaction
                transaction = Transaction(
                    user_id=from_user,
                    transaction_type=transaction_type,
                    amount=amount,
                    description=f"BRN Layer 2 transaction: {transaction_type}"
                )
                
                self.db.add(transaction)
                self.db.commit()
                
                logger.info(f"BRN transaction processed: {tx_hash}")
                return tx_hash
            else:
                logger.warning(f"Consensus not reached for transaction: {tx_hash}")
                return None
                
        except Exception as e:
            logger.error(f"Error processing BRN transaction: {e}")
            return None
    
    def boost_post_with_brn(self, user_id: str, post_id: str, amount: float) -> bool:
        """Boost a post using BRN tokens (Layer 2)"""
        try:
            # Check user balance
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user or user.brn_balance < amount:
                return False
            
            # Process boost transaction
            tx_hash = self.process_brn_transaction(
                from_user=user_id,
                to_user="brn-boost-pool",  # Special pool for boosts
                amount=amount,
                transaction_type="boost"
            )
            
            if tx_hash:
                # Update post boost amount
                from .models import Post
                post = self.db.query(Post).filter(Post.id == post_id).first()
                if post:
                    post.brn_boost_amount += amount
                    self.db.commit()
                
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error boosting post with BRN: {e}")
            return False
    
    def cross_post_with_brn(self, user_id: str, post_id: str, 
                           platforms: List[str]) -> bool:
        """Cross-post using BRN tokens"""
        try:
            # Calculate total cost
            total_cost = len(platforms) * 5.0  # 5 BRN per platform
            
            # Check user balance
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user or user.brn_balance < total_cost:
                return False
            
            # Process cross-post transaction
            tx_hash = self.process_brn_transaction(
                from_user=user_id,
                to_user="brn-crosspost-pool",
                amount=total_cost,
                transaction_type="cross_post"
            )
            
            if tx_hash:
                # Update post cross-post status
                from .models import Post
                post = self.db.query(Post).filter(Post.id == post_id).first()
                if post:
                    post.cross_posted = True
                    post.cross_post_links = platforms
                    self.db.commit()
                
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error cross-posting with BRN: {e}")
            return False
    
    def _simulate_consensus(self, nodes: List[Node], tx_hash: str) -> bool:
        """Simulate consensus among nodes"""
        # In real implementation, nodes would vote on transactions
        # For now, simulate based on stake-weighted voting
        total_stake = sum(node.stake_amount for node in nodes)
        if total_stake == 0:
            return False
        
        # Simulate voting (in real implementation, each node would vote)
        votes_for = 0
        for node in nodes:
            # Simulate node voting based on stake
            if node.stake_amount > 0:
                votes_for += node.stake_amount
        
        consensus_ratio = votes_for / total_stake
        return consensus_ratio >= self.consensus_threshold
    
    def _execute_brn_transaction(self, from_user: str, to_user: str, 
                                amount: float, transaction_type: str):
        """Execute BRN token transaction"""
        # Deduct from sender
        sender = self.db.query(User).filter(User.id == from_user).first()
        if sender:
            sender.brn_balance -= amount
        
        # Add to receiver (if not a special pool)
        if not to_user.startswith("brn-"):
            receiver = self.db.query(User).filter(User.id == to_user).first()
            if receiver:
                receiver.brn_balance += amount
    
    def get_node_status(self) -> Dict[str, Any]:
        """Get status of all nodes"""
        nodes = self.db.query(Node).all()
        
        total_stake = sum(node.stake_amount for node in nodes)
        active_nodes = len([n for n in nodes if n.is_active])
        
        return {
            "total_nodes": len(nodes),
            "active_nodes": active_nodes,
            "total_stake": total_stake,
            "consensus_threshold": self.consensus_threshold,
            "nodes": [
                {
                    "id": node.id,
                    "address": node.node_address,
                    "stake": node.stake_amount,
                    "active": node.is_active,
                    "last_heartbeat": node.last_heartbeat.isoformat() if node.last_heartbeat else None
                }
                for node in nodes
            ]
        }
    
    def cleanup_inactive_nodes(self):
        """Remove nodes that haven't sent heartbeat in 5 minutes"""
        cutoff_time = datetime.utcnow() - timedelta(minutes=5)
        
        inactive_nodes = self.db.query(Node).filter(
            Node.last_heartbeat < cutoff_time,
            Node.is_active == True
        ).all()
        
        for node in inactive_nodes:
            node.is_active = False
            
            # Stop Docker container
            try:
                container = self.docker_client.containers.get(node.docker_container_id)
                container.stop()
                container.remove()
            except:
                pass
        
        self.db.commit()
        logger.info(f"Marked {len(inactive_nodes)} nodes as inactive") 