/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import HomeIcon from './icons/home_icon_dark.svg';
import WalletIcon from './icons/wallet_dark.svg';
import ScanIcon from './icons/scan_dark.svg';
import ProfileIcon from './icons/profile_dark.svg';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('feed');

  const renderFeed = () => (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔥 BRN Feed</Text>
      </View>
      
      <ScrollView style={styles.feed}>
        <View style={styles.post}>
          <Text style={styles.postUser}>Sarah</Text>
          <Text style={styles.postContent}>Just scanned my first Liquid Death! Earned 2 BRN tokens. This community is amazing! #BRNFEST #LiquidDeath</Text>
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>❤️ 23</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>💬 5</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.post}>
          <Text style={styles.postUser}>Mike 🚀</Text>
          <Text style={styles.postContent}>BRN Magazine Issue #5 dropped today! Exclusive content about the future of loyalty tokens.</Text>
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>❤️ 18</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>💬 3</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentScreen('feed')}>
          <HomeIcon width={28} height={28} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentScreen('wallet')}>
          <WalletIcon width={28} height={28} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentScreen('scan')}>
          <ScanIcon width={28} height={28} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentScreen('profile')}>
          <ProfileIcon width={28} height={28} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWallet = () => (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('feed')}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💰 Wallet</Text>
      </View>
      
      <View style={styles.walletContent}>
        <Text style={styles.tokenBalance}>🔥 45 BRN</Text>
        <Text style={styles.tokenEarned}>Total Earned: 156 BRN</Text>
      </View>
      
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentScreen('feed')}>
          <HomeIcon width={28} height={28} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentScreen('wallet')}>
          <WalletIcon width={28} height={28} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentScreen('scan')}>
          <ScanIcon width={28} height={28} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentScreen('profile')}>
          <ProfileIcon width={28} height={28} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderScan = () => (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('feed')}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📷 Scan</Text>
      </View>
      
      <View style={styles.scanContent}>
        <View style={styles.scanArea}>
          <Text style={styles.scanText}>📷</Text>
          <Text style={styles.scanInstruction}>Point camera at product</Text>
        </View>
      </View>
      
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentScreen('feed')}>
          <HomeIcon width={28} height={28} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentScreen('wallet')}>
          <WalletIcon width={28} height={28} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentScreen('scan')}>
          <ScanIcon width={28} height={28} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentScreen('profile')}>
          <ProfileIcon width={28} height={28} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProfile = () => (
    <View style={styles.screenContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentScreen('feed')}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👤 Profile</Text>
      </View>
      
      <View style={styles.profileContent}>
        <Text style={styles.profileName}>BRN User</Text>
        <Text style={styles.profileStats}>Posts: 12 | Followers: 89 | BRN: 45</Text>
      </View>
      
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentScreen('feed')}>
          <HomeIcon width={28} height={28} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentScreen('wallet')}>
          <WalletIcon width={28} height={28} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentScreen('scan')}>
          <ScanIcon width={28} height={28} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setCurrentScreen('profile')}>
          <ProfileIcon width={28} height={28} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      {currentScreen === 'feed' && renderFeed()}
      {currentScreen === 'wallet' && renderWallet()}
      {currentScreen === 'scan' && renderScan()}
      {currentScreen === 'profile' && renderProfile()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  screenContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#2a2a2a',
  },
  backButton: {
    fontSize: 24,
    color: '#ffffff',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  feed: {
    flex: 1,
    padding: 20,
  },
  post: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  postUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  postContent: {
    fontSize: 16,
    color: '#cccccc',
    lineHeight: 24,
    marginBottom: 15,
  },
  postActions: {
    flexDirection: 'row',
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#cccccc',
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
  },
  navButton: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 24,
  },
  walletContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tokenBalance: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 10,
  },
  tokenEarned: {
    fontSize: 18,
    color: '#cccccc',
  },
  scanContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#ff4444',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  scanText: {
    fontSize: 64,
    marginBottom: 10,
  },
  scanInstruction: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
  },
  profileContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  profileStats: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
  },
});




