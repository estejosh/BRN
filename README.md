# 🔥 BRN (Burning) App

A gamified social media and loyalty platform with blockchain integration, token earning, content feed, quests, user profiles, QR codes, audio feeds, loyalty vaults, NFTs, and more.

## 📱 Features

### Core Features
- **Social Media Feed** - Full-screen video, audio, and image content
- **Token Economy** - Earn BRN tokens through engagement and quests
- **QR Code Scanning** - Scan products and earn tokens
- **Quest System** - Daily challenges and achievements
- **Verified Friends** - Cross-share QR codes for secure connections
- **Marketplace** - Trade BRN tokens, NFTs, and rewards
- **Wallet** - Manage token balance and transactions
- **Floating Navigation** - Always-visible bottom navigation bar

### UI/UX Features
- **Dark Theme** - Fire-themed dark interface
- **Floating Navigation** - Transparent overlay navigation
- **Instant Transitions** - No sliding animations for fast navigation
- **Full-Screen Modals** - Immersive content experience
- **Responsive Design** - Optimized for mobile devices

## 🏗️ Architecture

### Frontend (React Native)
- **React Native v0.80** - Cross-platform mobile development
- **TypeScript** - Type-safe development
- **Metro Bundler** - Fast JavaScript bundler
- **SVG Icon System** - Scalable vector icons

### Backend (Planned)
- **Python FastAPI** - High-performance web framework
- **beem Library** - Hive blockchain integration
- **SQLAlchemy** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management

### Blockchain Integration
- **Hive Blockchain** - Delegated posting and token transfers
- **Layer 2 Network** - Custom BRN token system
- **Delegated Wallets** - Secure key management
- **Stake-based Consensus** - Decentralized validation

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- React Native CLI
- Android Studio (for Android development)
- Android SDK (API 36)
- Java Development Kit (JDK 17)

### Environment Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/brn-app.git
cd brn-app
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Android Setup
```bash
# Set Android environment variables
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# For Windows (PowerShell)
$env:ANDROID_HOME = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\platform-tools"
```

#### 4. Start Metro Bundler
```bash
npx react-native start --reset-cache
```

#### 5. Run on Android
```bash
npx react-native run-android
```

## 📁 Project Structure

```
BRNApp/
├── android/                 # Android native code
├── components/             # Reusable React components
│   └── SvgIcon.tsx        # SVG icon system
├── src/                    # Source code
│   └── screens/           # Screen components
├── App.tsx                # Main application component
├── index.js               # Entry point
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🎯 Core Components

### Navigation System
- **Floating Bottom Navigation** - Always visible, transparent overlay
- **Screen-based Navigation** - No modal overlays for main features
- **Active State Indicators** - Visual feedback for current screen

### Content Feed
- **Full-screen Posts** - Video, audio, and image content
- **Engagement Actions** - Like, comment, share, tip, report
- **Token Rewards** - Earn BRN tokens for interactions
- **Right-side Actions** - Contextual action buttons

### Token Economy
- **BRN Tokens** - Native platform currency
- **Earning Mechanisms** - Engagement, quests, scanning
- **Wallet Management** - Balance tracking and transactions
- **Marketplace** - Token trading and rewards

### Quest System
- **Daily Quests** - Time-limited challenges
- **Achievement Tracking** - Progress monitoring
- **Reward Distribution** - Automatic token rewards
- **Quest Categories** - Tutorial, engagement, social

## 🔧 Development Notes

### State Management
- **React Hooks** - useState for local component state
- **Context API** - Global state management (planned)
- **AsyncStorage** - Local data persistence

### Performance Optimizations
- **Metro Bundler** - Fast development builds
- **Image Optimization** - Efficient media handling
- **Memory Management** - Proper component lifecycle

### Security Considerations
- **Encrypted Storage** - Secure token storage
- **Key Management** - Secure blockchain key handling
- **Input Validation** - User input sanitization

## 🎨 UI/UX Design

### Color Scheme
- **Primary Background** - `#1a1a1a` (Dark theme)
- **Accent Color** - `#ff4444` (Fire red)
- **Text Colors** - `#ffffff`, `#cccccc`, `#666666`
- **Transparent Overlays** - `rgba(0,0,0,0.1)`

### Typography
- **Primary Font** - System default
- **Font Sizes** - 12px, 14px, 16px, 18px, 20px, 24px, 36px
- **Font Weights** - Normal, Bold

### Layout Principles
- **Full-screen Content** - Immersive media experience
- **Floating Elements** - Navigation and action buttons
- **Responsive Design** - Adapts to different screen sizes
- **Touch-friendly** - Minimum 44px touch targets

## 🔄 Development Workflow

### Code Style
- **TypeScript** - Strict type checking
- **ESLint** - Code quality enforcement
- **Prettier** - Code formatting
- **Component Structure** - Functional components with hooks

### Testing Strategy
- **Unit Tests** - Component and utility testing
- **Integration Tests** - Feature workflow testing
- **E2E Tests** - User journey testing (planned)

### Deployment
- **Android APK** - Google Play Store deployment
- **iOS App Store** - Apple App Store deployment (planned)
- **Backend API** - Docker container deployment

## 🚀 Backend Architecture (Planned)

### API Endpoints
```python
# User Management
POST /api/users/register
POST /api/users/login
GET /api/users/profile

# Content Management
GET /api/feed
POST /api/posts
PUT /api/posts/{id}/like

# Token Economy
GET /api/wallet/balance
POST /api/wallet/transfer
GET /api/quests
POST /api/quests/{id}/complete

# Blockchain Integration
POST /api/hive/post
POST /api/hive/transfer
GET /api/hive/delegation
```

### Database Schema
```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    hive_account VARCHAR(50),
    brn_balance DECIMAL(18,6),
    created_at TIMESTAMP
);

-- Posts table
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    content TEXT,
    media_url VARCHAR(255),
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    from_user_id INTEGER REFERENCES users(id),
    to_user_id INTEGER REFERENCES users(id),
    amount DECIMAL(18,6),
    transaction_type VARCHAR(20),
    created_at TIMESTAMP
);
```

## 🔗 Blockchain Integration

### Hive Integration
- **beem Library** - Python Hive client
- **Delegated Posting** - Secure content publishing
- **Token Transfers** - Hive token operations
- **Key Management** - Encrypted wallet storage

### Layer 2 Network
- **Custom BRN Tokens** - Platform-specific currency
- **Stake-based Consensus** - Decentralized validation
- **Node Network** - Distributed infrastructure
- **Cross-posting** - AI-powered social media integration

## 📊 Performance Metrics

### Frontend Performance
- **Bundle Size** - Optimized JavaScript bundles
- **Load Times** - Fast app startup
- **Memory Usage** - Efficient resource management
- **Frame Rate** - Smooth 60fps animations

### Backend Performance
- **API Response Time** - < 200ms average
- **Database Queries** - Optimized with indexes
- **Concurrent Users** - Scalable architecture
- **Uptime** - 99.9% availability target

## 🔒 Security Features

### Data Protection
- **Encrypted Storage** - Secure local data
- **HTTPS Communication** - Secure API calls
- **Input Validation** - XSS and injection prevention
- **Rate Limiting** - API abuse prevention

### Blockchain Security
- **Key Encryption** - Secure private key storage
- **Delegated Authority** - Limited posting permissions
- **Transaction Signing** - Secure blockchain operations
- **Audit Trail** - Complete transaction history

## 🧪 Testing

### Test Coverage
- **Unit Tests** - Component and utility functions
- **Integration Tests** - API and database operations
- **E2E Tests** - User workflow testing
- **Performance Tests** - Load and stress testing

### Testing Tools
- **Jest** - JavaScript testing framework
- **React Native Testing Library** - Component testing
- **Detox** - E2E testing (planned)
- **Postman** - API testing

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Basic UI/UX implementation
- ✅ Navigation system
- ✅ Content feed
- ✅ Token economy basics
- ✅ Quest system

### Phase 2 (Next)
- 🔄 Backend API development
- 🔄 Database implementation
- 🔄 User authentication
- 🔄 Content management

### Phase 3 (Future)
- 📋 Blockchain integration
- 📋 Hive wallet integration
- 📋 Cross-posting features
- 📋 Advanced quest system

### Phase 4 (Long-term)
- 📋 NFT marketplace
- 📋 Advanced analytics
- 📋 AI-powered features
- 📋 Cross-platform support

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### Code Standards
- Follow TypeScript best practices
- Write comprehensive tests
- Document new features
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React Native community
- Hive blockchain developers
- Open source contributors
- Beta testers and feedback providers

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Email: support@brnapp.com

---

**BRN App** - Burning bright in the social media revolution! 🔥
