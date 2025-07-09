import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  // Mock user data
  const user = {
    username: '@brnuser',
    bio: 'Creator. Collector. Burner.',
    location: 'New York, NY',
    walletAddress: '0x1234...abcd',
    reputation: 87,
    tokens: {
      BRN: 1250,
      BrandX: 300,
      BrandY: 50,
    },
    socialLinks: ['instagram', 'twitter', 'tiktok'],
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileImage}>
          <Ionicons name="person" size={60} color="#ff4444" />
        </View>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.bio}>{user.bio}</Text>
        <Text style={styles.location}>{user.location}</Text>
      </View>

      {/* Token Balances */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Token Balances</Text>
        <View style={styles.tokenContainer}>
          <View style={styles.tokenItem}>
            <Text style={styles.tokenLabel}>BRN</Text>
            <Text style={styles.tokenAmount}>{user.tokens.BRN}</Text>
          </View>
          <View style={styles.tokenItem}>
            <Text style={styles.tokenLabel}>BrandX</Text>
            <Text style={styles.tokenAmount}>{user.tokens.BrandX}</Text>
          </View>
          <View style={styles.tokenItem}>
            <Text style={styles.tokenLabel}>BrandY</Text>
            <Text style={styles.tokenAmount}>{user.tokens.BrandY}</Text>
          </View>
        </View>
      </View>

      {/* Reputation Score */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reputation Score</Text>
        <View style={styles.reputationContainer}>
          <View style={styles.reputationBar}>
            <View 
              style={[
                styles.reputationFill, 
                { width: `${user.reputation}%` }
              ]} 
            />
          </View>
          <Text style={styles.reputationText}>{user.reputation}/100</Text>
        </View>
      </View>

      {/* Wallet Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wallet Address</Text>
        <View style={styles.walletContainer}>
          <Text style={styles.walletAddress}>{user.walletAddress}</Text>
          <TouchableOpacity style={styles.copyButton}>
            <Ionicons name="copy-outline" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Social Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connected Socials</Text>
        <View style={styles.socialContainer}>
          {user.socialLinks.map((social, index) => (
            <TouchableOpacity key={index} style={styles.socialButton}>
              <Ionicons 
                name={social as any} 
                size={24} 
                color="#ff4444" 
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Edit Profile Button */}
      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  bio: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 5,
  },
  location: {
    fontSize: 14,
    color: '#888888',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  tokenContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tokenItem: {
    alignItems: 'center',
    flex: 1,
  },
  tokenLabel: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 5,
  },
  tokenAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4444',
  },
  reputationContainer: {
    alignItems: 'center',
  },
  reputationBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#333333',
    borderRadius: 5,
    marginBottom: 10,
  },
  reputationFill: {
    height: '100%',
    backgroundColor: '#ff4444',
    borderRadius: 5,
  },
  reputationText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 8,
  },
  walletAddress: {
    fontSize: 14,
    color: '#cccccc',
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: 5,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#ff4444',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 