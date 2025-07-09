from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    hive_username = Column(String, unique=True, nullable=False)
    hive_public_key = Column(String, nullable=True)
    brn_balance = Column(Float, default=0.0)
    total_earned = Column(Float, default=0.0)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Delegation settings
    delegated_posting_key = Column(String, nullable=True)
    delegation_limit = Column(Float, default=0.0)  # Max BRN tokens app can spend
    auto_boost_enabled = Column(Boolean, default=False)
    
    # Relationships
    posts = relationship("Post", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")
    node_stakes = relationship("NodeStake", back_populates="user")
    nodes = relationship("Node", back_populates="user")
    node_deployments = relationship("NodeDeployment", back_populates="user")

class Post(Base):
    __tablename__ = "posts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    hive_permlink = Column(String, nullable=True)  # If posted to Hive
    content = Column(Text, nullable=False)
    content_type = Column(String, default="text")  # text, video, voice, picture
    media_url = Column(String, nullable=True)
    brn_boost_amount = Column(Float, default=0.0)
    hive_boost_amount = Column(Float, default=0.0)
    cross_posted = Column(Boolean, default=False)
    cross_post_links = Column(JSON, default=list)  # Links to other platforms
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="posts")
    transactions = relationship("Transaction", back_populates="post")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    post_id = Column(String, ForeignKey("posts.id"), nullable=True)
    transaction_type = Column(String, nullable=False)  # earn, spend, boost, cross_post
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=False)
    hive_tx_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="transactions")
    post = relationship("Post", back_populates="transactions")

class Node(Base):
    __tablename__ = "nodes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    node_id = Column(String, unique=True, nullable=False)
    node_address = Column(String, unique=True, nullable=True)
    stake_amount = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    config = Column(JSON, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    revocation_reason = Column(String, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    docker_container_id = Column(String, nullable=True)
    last_heartbeat = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="nodes")
    stakes = relationship("NodeStake", back_populates="node")

class NodeDeployment(Base):
    __tablename__ = "node_deployments"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    node_id = Column(String, unique=True, nullable=False)
    deployment_status = Column(String, default="pending")  # pending, approved, rejected
    node_config = Column(JSON, nullable=True)
    credentials_hash = Column(String, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    approved_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="node_deployments")

class NodeStake(Base):
    __tablename__ = "node_stakes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    node_id = Column(String, ForeignKey("nodes.id"), nullable=False)
    stake_amount = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="node_stakes")
    node = relationship("Node", back_populates="stakes")

class CrossPostConfig(Base):
    __tablename__ = "cross_post_configs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    platform = Column(String, nullable=False)  # twitter, instagram, facebook, etc.
    api_credentials = Column(JSON, nullable=True)
    is_enabled = Column(Boolean, default=True)
    token_cost = Column(Float, default=5.0)  # BRN tokens per cross-post
    created_at = Column(DateTime, default=datetime.utcnow) 