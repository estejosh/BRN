# 🏦 Decentralized Wallet System

## Overview

The BRN decentralized wallet system combines **Hive blockchain integration** with a **custom Layer 2 consensus network** for BRN tokens. This architecture provides:

- **True decentralization** with stake-based consensus
- **Secure key management** with encrypted wallets
- **Dual-layer functionality** (Hive + BRN tokens)
- **Validator network** for transaction processing

---

## 🏗️ Architecture

### Layer 1: Hive Blockchain
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Wallet   │───▶│   beem Library  │───▶│  Hive Network   │
│   (Encrypted)   │    │   (Python)      │    │   (Blockchain)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Features:**
- **Hive Engine token integration** (BRN tokens)
- **Delegated posting authority**
- **Secure key generation** and management
- **Hive transfers** (HIVE/HBD)

### Layer 2: BRN Consensus Network
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   BRN Wallet    │───▶│  Layer 2 Nodes  │───▶│  Consensus      │
│   (Local)       │    │   (Validators)  │    │   (Stake-based) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Features:**
- **Stake-based consensus** (67% threshold)
- **Decentralized transaction processing**
- **Multi-signature support**
- **Off-chain transaction batching**

---

## 🔐 Security Features

### Wallet Security
```python
# Master seed generation
master_seed = secrets.token_hex(32)

# Key derivation from password
kdf = PBKDF2HMAC(
    algorithm=hashes.SHA256(),
    length=32,
    salt=salt.encode(),
    iterations=100000
)
encryption_key = kdf.derive(password.encode())

# Encrypted key storage
cipher = Cipher(
    algorithms.AES(encryption_key),
    modes.CBC(iv),
    backend=default_backend()
)
```

### Key Management
- **AES-256 encryption** for private keys
- **PBKDF2 key derivation** with 100,000 iterations
- **Secure random generation** for master seeds
- **12-word backup phrases** for wallet recovery

---

## 🚀 Implementation Complexity

### **Difficulty Level: Moderate (7/10)**

**Easy Parts:**
- ✅ **beem integration** - Well-documented Python library
- ✅ **Basic wallet creation** - Standard cryptographic operations
- ✅ **Database models** - SQLAlchemy ORM patterns

**Challenging Parts:**
- ⚠️ **Layer 2 consensus** - Requires distributed systems knowledge
- ⚠️ **Validator network** - Complex state management
- ⚠️ **Transaction signing** - Cryptographic implementation details

**Complex Parts:**
- 🔥 **Multi-signature wallets** - Advanced cryptographic protocols
- 🔥 **Consensus mechanisms** - Byzantine fault tolerance
- 🔥 **Cross-chain bridges** - Hive ↔ BRN token conversion

---

## 📊 System Components

### 1. DecentralizedWallet Class
```python
class DecentralizedWallet:
    def generate_wallet(self, user_id: str, password: str)
    def sign_transaction(self, user_id: str, password: str, tx_data: Dict)
    def get_wallet_balance(self, user_id: str) -> Dict[str, float]
```

**Responsibilities:**
- Wallet creation and key management
- Transaction signing and validation
- Balance queries (Hive + BRN)

### 2. Layer2Consensus Class
```python
class Layer2Consensus:
    async def start_consensus_network(self)
    async def _consensus_loop(self)
    def submit_transaction(self, transaction: Dict) -> bool
```

**Responsibilities:**
- Consensus mechanism management
- Transaction processing and validation
- Validator network coordination

### 3. API Endpoints
```python
@router.post("/wallet/create")           # Create new wallet
@router.get("/wallet/balance")           # Get balances
@router.post("/wallet/transfer/brn")     # BRN transfers
@router.post("/wallet/transfer/hive")    # Hive transfers
@router.post("/wallet/stake/delegate")   # Stake delegation
@router.post("/wallet/validator/register") # Validator registration
```

---

## 🔄 Transaction Flow

### BRN Transfer (Layer 2)
```
1. User submits transaction
   ↓
2. Wallet signs with private key
   ↓
3. Submit to Layer 2 consensus
   ↓
4. Validators vote (stake-based)
   ↓
5. Execute if consensus reached
   ↓
6. Update balances in database
```

### Hive Transfer (Layer 1)
```
1. User submits transaction
   ↓
2. Wallet signs with Hive keys
   ↓
3. Submit via beem library
   ↓
4. Broadcast to Hive network
   ↓
5. Transaction confirmed on blockchain
```

---

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Database Setup
```bash
# Create database tables
alembic upgrade head

# Initialize Layer 2 consensus
python -c "from app.layer2_consensus import Layer2Consensus; Layer2Consensus().start_consensus_network()"
```

### 3. Environment Variables
```env
# Hive Configuration
HIVE_NODE_URL=https://api.hive.blog
HIVE_ACCOUNT=your_hive_account
HIVE_POSTING_KEY=your_posting_key

# Database
DATABASE_URL=postgresql://user:pass@localhost/brn_db

# Security
SECRET_KEY=your_secret_key
ENCRYPTION_KEY=your_encryption_key
```

### 4. Start Services
```bash
# Start backend API
uvicorn app.main:app --reload --port 8000

# Start Layer 2 consensus (in separate terminal)
python -m app.layer2_consensus
```

---

## 📈 Performance Considerations

### Scalability
- **Transaction batching** - Process multiple transactions per block
- **Validator sharding** - Distribute load across validator nodes
- **Database optimization** - Indexes on transaction tables

### Security
- **Rate limiting** - Prevent transaction spam
- **Input validation** - Sanitize all user inputs
- **Audit logging** - Track all wallet operations

### Monitoring
- **Network health** - Monitor validator uptime
- **Transaction metrics** - Track processing times
- **Balance reconciliation** - Verify database consistency

---

## 🔧 Advanced Features

### Multi-Signature Wallets
```python
# Multi-sig wallet creation
def create_multisig_wallet(self, user_ids: List[str], threshold: int):
    # Generate shared keys
    # Distribute signing authority
    # Set consensus threshold
```

### Cross-Chain Bridges
```python
# Hive ↔ BRN bridge
def bridge_hive_to_brn(self, hive_amount: float, user_id: str):
    # Lock Hive tokens
    # Mint BRN tokens on Layer 2
    # Update balances
```

### Smart Contracts
```python
# BRN token smart contract
class BRNToken:
    def transfer(self, from_user: str, to_user: str, amount: float)
    def approve(self, spender: str, amount: float)
    def transfer_from(self, from_user: str, to_user: str, amount: float)
```

---

## 🚨 Security Best Practices

### 1. Key Management
- **Never store private keys** in plain text
- **Use hardware security modules** (HSMs) in production
- **Implement key rotation** policies
- **Backup wallet securely** with encryption

### 2. Network Security
- **Validate all transactions** before processing
- **Implement rate limiting** to prevent spam
- **Monitor for suspicious activity**
- **Regular security audits**

### 3. Consensus Security
- **Verify validator identities** before accepting votes
- **Implement slashing conditions** for malicious validators
- **Monitor stake distribution** to prevent attacks
- **Regular consensus parameter updates**

---

## 📚 API Documentation

### Create Wallet
```http
POST /wallet/create
Content-Type: application/json

{
  "password": "user_password"
}
```

### Get Balance
```http
GET /wallet/balance
Authorization: Bearer <token>
```

### Transfer BRN
```http
POST /wallet/transfer/brn
Content-Type: application/json

{
  "to_user_id": "recipient_id",
  "amount": 100.0,
  "password": "user_password",
  "memo": "Optional memo"
}
```

### Transfer Hive
```http
POST /wallet/transfer/hive
Content-Type: application/json

{
  "to_username": "recipient_username",
  "amount": 10.0,
  "token": "HIVE",
  "password": "user_password",
  "memo": "Optional memo"
}
```

---

## 🎯 Next Steps

### Phase 1: Basic Implementation
- [x] Wallet creation and key management
- [x] Basic transaction signing
- [x] Layer 2 consensus framework
- [x] API endpoints

### Phase 2: Advanced Features
- [ ] Multi-signature wallets
- [ ] Cross-chain bridges
- [ ] Smart contract integration
- [ ] Advanced consensus mechanisms

### Phase 3: Production Ready
- [ ] Hardware security modules
- [ ] Advanced monitoring
- [ ] Performance optimization
- [ ] Security audits

---

## 💡 Implementation Tips

1. **Start Simple** - Begin with basic wallet functionality
2. **Test Thoroughly** - Use testnet for Hive operations
3. **Monitor Performance** - Track transaction processing times
4. **Security First** - Implement security measures early
5. **Document Everything** - Maintain detailed documentation

The decentralized wallet system provides a solid foundation for BRN's token economics while maintaining true decentralization through stake-based consensus. 