import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { errorHandler } from '../utils/ErrorHandler';

interface SvgIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export const SvgIcon: React.FC<SvgIconProps> = ({ 
  name, 
  size = 24, 
  color = '#ffffff',
  style 
}) => {
  const handleIconError = (iconName: string) => {
    errorHandler.logError(
      'Icon Not Found',
      `Icon "${iconName}" not found in icon system`,
      'low',
      { iconName, size, color },
      'SvgIcon'
    );
  };

  // Icon mapping - this would typically come from your icon library
  const getIconContent = (iconName: string): string => {
    const iconMap: { [key: string]: string } = {
      // Navigation icons
      home: '🏠',
      dating_matching: '💕',
      marketplace: '🛒',
      create_post: '➕',
      scan: '📷',
      chat: '💬',
      wallet: '💰',
      profile: '👤',
      
      // Action icons
      like: '❤️',
      comment: '💬',
      share: '📤',
      tip: '💸',
      report: '🚨',
      settings: '⚙️',
      back: '←',
      close: '✕',
      
      // Feature icons
      quest: '🎯',
      achievement: '🏆',
      leaderboard: '📊',
      notification: '🔔',
      search: '🔍',
      filter: '🔧',
      sort: '↕️',
      
      // Social icons
      friends: '👥',
      followers: '👤',
      following: '👤',
      verified: '✓',
      online: '🟢',
      offline: '⚪',
      
      // Content icons
      video: '🎥',
      photo: '📸',
      audio: '🎵',
      text: '📝',
      link: '🔗',
      hashtag: '#',
      mention: '@',
      
      // Token icons
      token: '🔥',
      earn: '💰',
      spend: '💸',
      balance: '💳',
      
      // Default fallback
      default: '📱'
    };

    const icon = iconMap[iconName] || iconMap.default;
    
    if (!iconMap[iconName]) {
      handleIconError(iconName);
    }
    
    return icon;
  };

  try {
    const iconContent = getIconContent(name);
    
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <Text style={[
          styles.icon, 
          { 
            fontSize: size * 0.8,
            color: color
          }
        ]}>
          {iconContent}
        </Text>
      </View>
    );
  } catch (error) {
    errorHandler.logError(
      'SvgIcon Render Error',
      `Failed to render icon "${name}"`,
      'medium',
      { name, size, color, error: error.message },
      'SvgIcon'
    );
    
    // Fallback to default icon
    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <Text style={[
          styles.icon, 
          { 
            fontSize: size * 0.8,
            color: color
          }
        ]}>
          📱
        </Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    textAlign: 'center',
  },
}); 