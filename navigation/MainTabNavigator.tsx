import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';

// Import existing screen components
import FeedScreen from '../src/screens/FeedScreen';
import MarketplaceScreen from '../src/screens/MarketplaceScreen';
import DatingScreen from '../src/screens/DatingScreen';
import EarnScreen from '../src/screens/EarnScreen';
import PostScreen from '../src/screens/PostScreen';
import ScanScreen from '../src/screens/ScanScreen';
import ProfileScreen from '../src/screens/ProfileScreen';

// Import SVG icons
import HomeIcon from '../icons/home_icon_dark.svg';
import WalletIcon from '../icons/wallet_dark.svg';
import ScanIcon from '../icons/scan_dark.svg';
import ProfileIcon from '../icons/profile_dark.svg';
import MarketplaceIcon from '../icons/share_icon_dark.svg';
import DatingIcon from '../icons/dating_icon_dark.svg';
import EarnIcon from '../icons/earned_tokens_icon_dark.svg';
import PostIcon from '../icons/create_post_icon_dark.svg';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#ff4444',
          tabBarInactiveTintColor: '#666666',
          tabBarBackground: () => (
            <View style={styles.tabBarBackground} />
          ),
        }}
      >
        <Tab.Screen
          name="Feed"
          component={FeedScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <HomeIcon width={size} height={size} fill={color} />
            ),
            tabBarLabel: 'Feed',
          }}
        />
        <Tab.Screen
          name="Marketplace"
          component={MarketplaceScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MarketplaceIcon width={size} height={size} fill={color} />
            ),
            tabBarLabel: 'Marketplace',
          }}
        />
        <Tab.Screen
          name="Dating"
          component={DatingScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <DatingIcon width={size} height={size} fill={color} />
            ),
            tabBarLabel: 'Dating',
          }}
        />
        <Tab.Screen
          name="Earn"
          component={EarnScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <EarnIcon width={size} height={size} fill={color} />
            ),
            tabBarLabel: 'Earn',
          }}
        />
        <Tab.Screen
          name="Post"
          component={PostScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <PostIcon width={size} height={size} fill={color} />
            ),
            tabBarLabel: 'Post',
          }}
        />
        <Tab.Screen
          name="Scan"
          component={ScanScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <ScanIcon width={size} height={size} fill={color} />
            ),
            tabBarLabel: 'Scan',
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <ProfileIcon width={size} height={size} fill={color} />
            ),
            tabBarLabel: 'Profile',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
  },
});

export default MainTabNavigator; 