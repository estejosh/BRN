# 🏢 Managed Node System

## Overview

The **Managed Node System** allows you to **control node deployment** while users verify with **Hive Keychain** to run nodes. This creates a **decentralized but controlled** network where you maintain oversight while users have autonomy.

---

## 🏗️ Architecture

### **Admin Control Flow**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Request  │───▶│  Admin Review   │───▶│  Node Approval  │
│   (Keychain)    │    │   (Dashboard)   │    │   (Executable)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Node Deployment Flow**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Generate Node  │───▶│  Create Exec    │───▶│  User Download  │
│   Credentials   │    │   (Self-Cont.)  │    │   & Run Node    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🔐 Security Features

### **Hive Keychain Integration**
- **Cryptographic verification** of user identity
- **Stake-based authorization** (minimum BRN balance)
- **Admin signature verification** for approvals
- **Secure credential generation** for each node

### **Executable Security**
- **Self-contained packages** with embedded credentials
- **Encrypted communication** with consensus server
- **Automatic dependency installation**
- **Secure API key management**

---

## 🚀 Implementation Features

### **1. Admin Controls**
```python
# Node deployment approval
async def approve_node_deployment(deployment_id, admin_signature)

# Network overview
async def get_network_overview()

# Node revocation
async def revoke_node(node_id, reason)
```

### **2. User Verification**
```python
# Keychain authorization
async def verify_keychain_authorization(hive_username, signature)

# Node deployment request
async def request_node_deployment(node_config, keychain_signature)
```

### **3. Executable Generation**
```python
# Self-contained node executable
def _create_node_executable_code(credentials, config, hive_username)

# Batch file for easy execution
def _create_batch_file(node_id)
```

---

## 📊 System Components

### **ManagedNodeSystem Class**
```python
class ManagedNodeSystem:
    def __init__(self, db_session):
        self.admin_hive_account = "brnadmin"
        self.min_stake_requirement = 1000  # BRN tokens
        self.node_verification_threshold = 0.75
```

**Key Methods:**
- `deploy_node()` - Generate node credentials and executable
- `verify_keychain_authorization()` - Verify user with Hive Keychain
- `approve_node_deployment()` - Admin approves deployment
- `get_network_overview()` - Network statistics

### **API Endpoints**
```python
# User endpoints
POST /managed-nodes/request-deployment
GET /managed-nodes/my-nodes
POST /managed-nodes/download-executable

# Admin endpoints
POST /managed-nodes/admin/approve-deployment
GET /managed-nodes/admin/pending-deployments
GET /managed-nodes/admin/network-overview
POST /managed-nodes/admin/revoke-node
```

---

## 🔄 Node Deployment Process

### **Step 1: User Request**
```javascript
// User requests node deployment with Keychain signature
const response = await fetch('/api/managed-nodes/request-deployment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    node_config: { region: 'us-east-1', resources: 'medium' },
    keychain_signature: 'signed_by_hive_keychain',
    hive_username: 'user123'
  })
});
```

### **Step 2: Admin Review**
```python
# Admin reviews pending deployments
pending = await get_pending_deployments()
# Shows: user, stake amount, node config, Keychain verification
```

### **Step 3: Admin Approval**
```python
# Admin approves with signature
result = await approve_node_deployment(
    deployment_id=123,
    admin_signature="admin_signed_approval"
)
```

### **Step 4: Executable Generation**
```python
# System generates self-contained executable
exe_path = await _generate_node_executable(
    credentials=node_credentials,
    config=node_config,
    hive_username="user123"
)
```

### **Step 5: User Download & Run**
```bash
# User downloads and runs executable
./node_abc123.bat
# Automatically installs dependencies and starts node
```

---

## 🛠️ Setup Instructions

### **1. Environment Configuration**
```env
# Admin settings
ADMIN_HIVE_ACCOUNT=brnadmin
ADMIN_POSTING_KEY=your_admin_posting_key

# Node settings
MIN_STAKE_REQUIREMENT=1000
NODE_VERIFICATION_THRESHOLD=0.75

# Database
DATABASE_URL=postgresql://user:pass@localhost/brn_db
```

### **2. Database Migration**
```bash
# Create new tables
alembic revision --autogenerate -m "Add managed node system"
alembic upgrade head
```

### **3. Start Services**
```bash
# Start backend API
uvicorn app.main:app --reload --port 8000

# Start admin dashboard (optional)
python -m app.admin_dashboard
```

---

## 📈 Admin Dashboard Features

### **Node Management**
- **Pending deployments** - Review and approve node requests
- **Active nodes** - Monitor running nodes
- **Network statistics** - Overview of entire network
- **Node revocation** - Deactivate problematic nodes

### **User Management**
- **Stake verification** - Check user BRN balances
- **Keychain verification** - Verify Hive Keychain signatures
- **Delegation tracking** - Monitor stake delegations

### **Network Monitoring**
- **Consensus participation** - Track node voting
- **Performance metrics** - Monitor node uptime
- **Security alerts** - Detect suspicious activity

---

## 🔧 Executable Features

### **Self-Contained Package**
```python
# Each node gets:
- node_abc123.py          # Main node code
- node_abc123_requirements.txt  # Dependencies
- node_abc123.bat         # Easy execution script
```

### **Automatic Setup**
```batch
@echo off
echo Installing requirements...
pip install -r node_abc123_requirements.txt
echo Starting node...
python node_abc123.py
pause
```

### **Security Features**
- **Embedded credentials** - No external key management
- **Encrypted communication** - Secure API calls
- **Automatic registration** - Self-registers with consensus
- **Heartbeat monitoring** - Reports status to admin

---

## 🚨 Security Best Practices

### **1. Admin Controls**
- **Multi-signature approval** - Require multiple admin signatures
- **Stake verification** - Ensure users have sufficient BRN
- **Keychain verification** - Verify Hive Keychain signatures
- **Regular audits** - Monitor node behavior

### **2. Node Security**
- **Credential rotation** - Regularly update node credentials
- **Network isolation** - Run nodes in secure environments
- **Monitoring** - Track node performance and behavior
- **Revocation procedures** - Quick response to security issues

### **3. User Verification**
- **Stake requirements** - Minimum BRN balance for node operation
- **Keychain integration** - Verify user identity with Hive
- **Delegation limits** - Control stake delegation amounts
- **Activity monitoring** - Track user behavior

---

## 📚 API Documentation

### **Request Node Deployment**
```http
POST /api/managed-nodes/request-deployment
Content-Type: application/json

{
  "node_config": {
    "region": "us-east-1",
    "resources": "medium",
    "auto_restart": true
  },
  "keychain_signature": "signed_by_hive_keychain",
  "hive_username": "user123"
}
```

### **Admin Approve Deployment**
```http
POST /api/managed-nodes/admin/approve-deployment
Content-Type: application/json

{
  "deployment_id": 123,
  "admin_signature": "admin_signed_approval"
}
```

### **Get Network Overview**
```http
GET /api/managed-nodes/admin/network-overview
Authorization: Bearer <admin_token>
```

### **Download Node Executable**
```http
POST /api/managed-nodes/download-executable
Content-Type: application/json

{
  "node_id": "node_abc123"
}
```

---

## 🎯 Benefits

### **For Admins**
- ✅ **Full control** over node deployment
- ✅ **Quality assurance** - Review before approval
- ✅ **Network monitoring** - Track all nodes
- ✅ **Security oversight** - Revoke problematic nodes

### **For Users**
- ✅ **Easy deployment** - One-click executable
- ✅ **Autonomous operation** - Run nodes independently
- ✅ **Stake rewards** - Earn from node operation
- ✅ **Keychain integration** - Secure verification

### **For Network**
- ✅ **Decentralized consensus** - Multiple independent nodes
- ✅ **Controlled growth** - Managed expansion
- ✅ **Security** - Verified node operators
- ✅ **Scalability** - Easy node addition

---

## 💡 Implementation Tips

### **1. Start Small**
- Begin with a few trusted users
- Test the deployment process thoroughly
- Monitor node performance closely

### **2. Security First**
- Implement proper signature verification
- Use secure credential generation
- Monitor for suspicious activity

### **3. User Experience**
- Make executable deployment simple
- Provide clear instructions
- Offer support for node operators

### **4. Monitoring**
- Track node uptime and performance
- Monitor consensus participation
- Alert on security issues

---

The managed node system provides **controlled decentralization** where you maintain oversight while users operate nodes independently. This balances **security** with **autonomy** for a robust BRN network. 