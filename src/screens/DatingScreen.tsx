import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const DatingScreen = () => {
  const [currentProfile, setCurrentProfile] = useState(0);
  const [vipStatus, setVipStatus] = useState('free'); // free, monthly, lifetime
  const [tokenBalance, setTokenBalance] = useState(45);

  // Dynamic negative words for swipe left
  const negativeWords = [
    'nah', 'nope', 'nop', 'skibidi', 'pass', 'douse', 
    'extinguish', 'smolder', 'ash', 'embers', 'cool',
    'meh', 'skip', 'next', 'later', 'nah fam'
  ];

  const [profiles] = useState([
    {
      id: '1',
      name: 'Sarah',
      age: 25,
      bio: 'BRN enthusiast 🔥 Love scanning products and attending events',
      interests: ['#BRNFEST', '#LiquidDeath', '#FirstScan'],
      events: ['BRN Event NYC', 'Liquid Death Launch'],
      scans: 15,
      posts: 23,
      location: 'Brooklyn, NY',
    },
    {
      id: '2',
      name: 'Mike',
      age: 28,
      bio: 'Creator and collector. Always looking for the next BRN drop',
      interests: ['#BRN', '#Creator', '#Collector'],
      events: ['BRN Magazine Launch'],
      scans: 8,
      posts: 12,
      location: 'Manhattan, NY',
    },
    {
      id: '3',
      name: 'Alex',
      age: 24,
      bio: 'Passionate about the BRN community and earning tokens',
      interests: ['#BRN', '#Earn', '#Community'],
      events: ['BRN Community Meetup'],
      scans: 22,
      posts: 31,
      location: 'Queens, NY',
    },
  ]);

  const handleSwipe = (direction: 'right' | 'left') => {
    if (direction === 'right') {
      Alert.alert('🔥 Burn!', 'You liked this profile!');
    } else {
      const randomWord = negativeWords[Math.floor(Math.random() * negativeWords.length)];
      Alert.alert(`💔 ${randomWord.toUpperCase()}`, 'Profile passed');
    }
    
    // Move to next profile
    setCurrentProfile(prev => (prev + 1) % profiles.length);
  };

  const handleBoost = () => {
    if (tokenBalance < 10) {
      Alert.alert('Insufficient Tokens', 'You need 10 BRN to boost your profile');
      return;
    }
    
    setTokenBalance(prev => prev - 10);
    Alert.alert('🚀 Boosted!', 'Your profile is now visible to more users for 1 hour');
  };

  const handleVipUpgrade = (type: 'monthly' | 'lifetime') => {
    const monthlyCost = 15;
    const lifetimeCost = 150;
    const cost = type === 'monthly' ? monthlyCost : lifetimeCost;
    
    if (tokenBalance < cost) {
      Alert.alert('Insufficient Tokens', `You need ${cost} BRN for ${type} VIP`);
      return;
    }

    if (type === 'lifetime') {
      Alert.alert(
        'Lifetime VIP',
        'This is your ONE chance for lifetime VIP. Tokens will be locked for 90 days.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Unlock Lifetime VIP', 
            onPress: () => {
              setTokenBalance(prev => prev - lifetimeCost);
              setVipStatus('lifetime');
              Alert.alert('🎉 Lifetime VIP Unlocked!', 'Your tokens are locked for 90 days');
            }
          }
        ]
      );
    } else {
      setTokenBalance(prev => prev - monthlyCost);
      setVipStatus('monthly');
      Alert.alert('🎉 Monthly VIP Activated!', 'Unlimited swipes and premium features unlocked');
    }
  };

  const renderProfile = () => {
    const profile = profiles[currentProfile];
    return (
      <View style={styles.profileCard}>
        <View style={styles.profileImage}>
          <Ionicons name="person" size={80} color="#ff4444" />
        </View>
        
        <Text style={styles.profileName}>{profile.name}, {profile.age}</Text>
        <Text style={styles.profileBio}>{profile.bio}</Text>
        
        <View style={styles.interestsContainer}>
          {profile.interests.map((interest, index) => (
            <Text key={index} style={styles.interestTag}>{interest}</Text>
          ))}
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="qr-code" size={16} color="#ff4444" />
            <Text style={styles.statText}>{profile.scans} scans</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flame" size={16} color="#ff4444" />
            <Text style={styles.statText}>{profile.posts} posts</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="location" size={16} color="#ff4444" />
            <Text style={styles.statText}>{profile.location}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* VIP Status */}
      <View style={styles.vipSection}>
        <View style={styles.vipInfo}>
          <Text style={styles.vipTitle}>
            {vipStatus === 'free' ? 'Free User' : 
             vipStatus === 'monthly' ? 'Monthly VIP' : 'Lifetime VIP'}
          </Text>
          <Text style={styles.tokenBalance}>{tokenBalance} BRN</Text>
        </View>
        
        {vipStatus === 'free' && (
          <View style={styles.vipUpgrade}>
            <TouchableOpacity 
              style={styles.vipButton} 
              onPress={() => handleVipUpgrade('monthly')}
            >
              <Text style={styles.vipButtonText}>Monthly VIP (15 BRN)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.vipButton} 
              onPress={() => handleVipUpgrade('lifetime')}
            >
              <Text style={styles.vipButtonText}>Lifetime VIP (150 BRN)</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Profile Card */}
      <View style={styles.cardContainer}>
        {renderProfile()}
      </View>

      {/* Swipe Actions */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.swipeButton} 
          onPress={() => handleSwipe('left')}
        >
          <Ionicons name="close" size={40} color="#ff4444" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.boostButton} 
          onPress={handleBoost}
        >
          <Ionicons name="rocket" size={30} color="#ffffff" />
          <Text style={styles.boostText}>10 BRN</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.swipeButton} 
          onPress={() => handleSwipe('right')}
        >
          <Ionicons name="heart" size={40} color="#ff4444" />
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Swipe right to 🔥 Burn, left to pass
        </Text>
        <Text style={styles.instructionText}>
          Boost your profile to appear in more feeds
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  vipSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  vipInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  vipTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tokenBalance: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: 'bold',
  },
  vipUpgrade: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vipButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  vipButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#222222',
    borderRadius: 20,
    padding: 30,
    width: width * 0.85,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff4444',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  profileBio: {
    color: '#cccccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  interestTag: {
    color: '#ff4444',
    fontSize: 14,
    marginHorizontal: 5,
    marginVertical: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    color: '#888888',
    fontSize: 12,
    marginTop: 5,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
  },
  swipeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boostButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  boostText: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 5,
  },
  instructions: {
    padding: 20,
    alignItems: 'center',
  },
  instructionText: {
    color: '#888888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
});

export default DatingScreen; 