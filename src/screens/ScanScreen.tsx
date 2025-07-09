import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ScanScreen = () => {
  const [scanHistory, setScanHistory] = useState([
    {
      id: '1',
      product: 'BRN Magazine Issue #5',
      timestamp: '2 hours ago',
      location: 'New York, NY',
      earned: 25,
      status: 'claimed',
    },
    {
      id: '2',
      product: 'Liquid Death Can',
      timestamp: '1 day ago',
      location: 'Brooklyn, NY',
      earned: 15,
      status: 'claimed',
    },
    {
      id: '3',
      product: 'BRN Event Ticket',
      timestamp: '3 days ago',
      location: 'Manhattan, NY',
      earned: 50,
      status: 'claimed',
    },
  ]);

  const handleScan = () => {
    Alert.alert(
      'Scan QR Code',
      'Point your camera at a BRN product QR code to scan and earn tokens!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Scan', onPress: () => simulateScan() },
      ]
    );
  };

  const simulateScan = () => {
    const newScan = {
      id: Date.now().toString(),
      product: 'BRN Product',
      timestamp: 'Just now',
      location: 'Current Location',
      earned: Math.floor(Math.random() * 50) + 10,
      status: 'pending',
    };
    setScanHistory([newScan, ...scanHistory]);
    Alert.alert('Scan Successful!', `You earned ${newScan.earned} BRN tokens!`);
  };

  const renderScanItem = (item: any) => (
    <View key={item.id} style={styles.scanItem}>
      <View style={styles.scanHeader}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.product}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
          <Text style={styles.location}>{item.location}</Text>
        </View>
        <View style={styles.earnedContainer}>
          <Ionicons name="wallet-outline" size={16} color="#ff4444" />
          <Text style={styles.earnedAmount}>+{item.earned} BRN</Text>
        </View>
      </View>
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusBadge,
          item.status === 'claimed' ? styles.claimedBadge : styles.pendingBadge
        ]}>
          <Ionicons 
            name={item.status === 'claimed' ? 'checkmark-circle' : 'time'} 
            size={16} 
            color={item.status === 'claimed' ? '#00ff00' : '#ffaa00'} 
          />
          <Text style={[
            styles.statusText,
            { color: item.status === 'claimed' ? '#00ff00' : '#ffaa00' }
          ]}>
            {item.status === 'claimed' ? 'Claimed' : 'Pending'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Scan Button */}
      <View style={styles.scanSection}>
        <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
          <View style={styles.scanIconContainer}>
            <Ionicons name="qr-code" size={60} color="#ffffff" />
          </View>
          <Text style={styles.scanButtonText}>Scan QR Code</Text>
          <Text style={styles.scanSubtext}>Point camera at BRN products</Text>
        </TouchableOpacity>
      </View>

      {/* Scan Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{scanHistory.length}</Text>
          <Text style={styles.statLabel}>Total Scans</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {scanHistory.reduce((sum, item) => sum + item.earned, 0)}
          </Text>
          <Text style={styles.statLabel}>BRN Earned</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {scanHistory.filter(item => item.status === 'claimed').length}
          </Text>
          <Text style={styles.statLabel}>Claims</Text>
        </View>
      </View>

      {/* Scan History */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Recent Scans</Text>
        <ScrollView style={styles.historyContainer}>
          {scanHistory.map(renderScanItem)}
        </ScrollView>
      </View>

      {/* Burn Quest */}
      <View style={styles.burnQuestSection}>
        <Text style={styles.sectionTitle}>Burn Quest</Text>
        <TouchableOpacity style={styles.burnQuestButton}>
          <Ionicons name="flame" size={24} color="#ff4444" />
          <Text style={styles.burnQuestText}>Burn QR Code for Bonus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scanSection: {
    padding: 20,
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: '#ff4444',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  scanIconContainer: {
    marginBottom: 15,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scanSubtext: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#ff4444',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888888',
    fontSize: 12,
    marginTop: 5,
  },
  historySection: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  historyContainer: {
    flex: 1,
  },
  scanItem: {
    backgroundColor: '#222222',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#ff4444',
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  timestamp: {
    color: '#888888',
    fontSize: 12,
    marginBottom: 2,
  },
  location: {
    color: '#888888',
    fontSize: 12,
  },
  earnedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earnedAmount: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  claimedBadge: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 170, 0, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  burnQuestSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  burnQuestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 12,
    justifyContent: 'center',
  },
  burnQuestText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ScanScreen; 