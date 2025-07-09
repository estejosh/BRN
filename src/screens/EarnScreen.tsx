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

const EarnScreen = () => {
  const [activeQuests, setActiveQuests] = useState([
    {
      id: '1',
      title: 'Scan & Post Challenge',
      description: 'Scan a Liquid Death can and record a Talk Post for 100 BRN',
      reward: 100,
      progress: 0,
      maxProgress: 1,
      type: 'scan',
    },
    {
      id: '2',
      title: 'Event Attendance',
      description: 'Attend BRN event, scan QR, earn rewards',
      reward: 150,
      progress: 0,
      maxProgress: 1,
      type: 'event',
    },
    {
      id: '3',
      title: 'Magazine Post',
      description: 'Post with BRN Magazine for 50 BRN',
      reward: 50,
      progress: 0,
      maxProgress: 1,
      type: 'post',
    },
  ]);

  const [earnings] = useState({
    total: 1250,
    today: 45,
    thisWeek: 230,
    pending: 75,
  });

  const handleQuestComplete = (questId: string) => {
    setActiveQuests(quests =>
      quests.map(quest =>
        quest.id === questId
          ? { ...quest, progress: quest.maxProgress }
          : quest
      )
    );
    Alert.alert('Quest Completed!', 'You earned tokens for completing this quest!');
  };

  const renderQuest = (quest: any) => (
    <View key={quest.id} style={styles.questItem}>
      <View style={styles.questHeader}>
        <View style={styles.questInfo}>
          <Text style={styles.questTitle}>{quest.title}</Text>
          <Text style={styles.questDescription}>{quest.description}</Text>
        </View>
        <View style={styles.rewardContainer}>
          <Ionicons name="wallet-outline" size={16} color="#ff4444" />
          <Text style={styles.rewardText}>+{quest.reward} BRN</Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(quest.progress / quest.maxProgress) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {quest.progress}/{quest.maxProgress}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.completeButton,
          quest.progress >= quest.maxProgress && styles.completedButton,
        ]}
        onPress={() => handleQuestComplete(quest.id)}
        disabled={quest.progress >= quest.maxProgress}
      >
        <Text style={styles.completeButtonText}>
          {quest.progress >= quest.maxProgress ? 'Completed' : 'Complete Quest'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Earnings Overview */}
      <View style={styles.earningsSection}>
        <Text style={styles.sectionTitle}>Your Earnings</Text>
        <View style={styles.earningsGrid}>
          <View style={styles.earningItem}>
            <Text style={styles.earningLabel}>Total BRN</Text>
            <Text style={styles.earningAmount}>{earnings.total}</Text>
          </View>
          <View style={styles.earningItem}>
            <Text style={styles.earningLabel}>Today</Text>
            <Text style={styles.earningAmount}>+{earnings.today}</Text>
          </View>
          <View style={styles.earningItem}>
            <Text style={styles.earningLabel}>This Week</Text>
            <Text style={styles.earningAmount}>+{earnings.thisWeek}</Text>
          </View>
          <View style={styles.earningItem}>
            <Text style={styles.earningLabel}>Pending</Text>
            <Text style={styles.earningAmount}>{earnings.pending}</Text>
          </View>
        </View>
      </View>

      {/* Active Quests */}
      <View style={styles.questsSection}>
        <Text style={styles.sectionTitle}>Active Quests</Text>
        {activeQuests.map(renderQuest)}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="qr-code" size={24} color="#ff4444" />
            <Text style={styles.actionText}>Scan Product</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="mic" size={24} color="#ff4444" />
            <Text style={styles.actionText}>Record Talk</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="camera" size={24} color="#ff4444" />
            <Text style={styles.actionText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="flame" size={24} color="#ff4444" />
            <Text style={styles.actionText}>Burn QR</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Vesting Info */}
      <View style={styles.vestingSection}>
        <Text style={styles.sectionTitle}>Token Vesting</Text>
        <View style={styles.vestingInfo}>
          <Ionicons name="time-outline" size={20} color="#ff4444" />
          <Text style={styles.vestingText}>
            Tokens vest over time with consistent activity
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  earningsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  earningsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  earningItem: {
    width: '48%',
    backgroundColor: '#222222',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  earningLabel: {
    color: '#888888',
    fontSize: 12,
    marginBottom: 5,
  },
  earningAmount: {
    color: '#ff4444',
    fontSize: 20,
    fontWeight: 'bold',
  },
  questsSection: {
    padding: 20,
  },
  questItem: {
    backgroundColor: '#222222',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#ff4444',
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  questDescription: {
    color: '#888888',
    fontSize: 14,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff4444',
    borderRadius: 4,
  },
  progressText: {
    color: '#888888',
    fontSize: 12,
    textAlign: 'right',
  },
  completeButton: {
    backgroundColor: '#ff4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#00ff00',
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionsSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#222222',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  vestingSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  vestingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222222',
    padding: 15,
    borderRadius: 12,
  },
  vestingText: {
    color: '#ff4444',
    fontSize: 14,
    marginLeft: 10,
  },
});

export default EarnScreen; 