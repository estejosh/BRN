import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { SvgIcon } from './SvgIcon';
import { storageManager } from '../utils/StorageManager';

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'toggle' | 'button' | 'select';
  value?: boolean | string;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  icon?: string;
}

export const SettingsScreen: React.FC = () => {
  const { theme, themeMode, setThemeMode } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoPlayVideos, setAutoPlayVideos] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);

  const handleThemeChange = (newTheme: string) => {
    setThemeMode(newTheme as any);
    storageManager.cacheThemeMode(newTheme);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await storageManager.clearOldCache();
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This feature will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://brnapp.com/privacy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://brnapp.com/terms');
  };

  const settingsSections: SettingsSection[] = [
    {
      title: 'Appearance',
      items: [
        {
          id: 'theme',
          title: 'Theme',
          subtitle: 'Choose your preferred theme',
          type: 'select',
          value: themeMode,
          onPress: () => {
            Alert.alert(
              'Select Theme',
              'Choose your preferred theme',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Light', onPress: () => handleThemeChange('light') },
                { text: 'Dark', onPress: () => handleThemeChange('dark') },
                { text: 'High Contrast', onPress: () => handleThemeChange('high-contrast') },
              ]
            );
          },
          icon: 'home',
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Receive notifications for likes, comments, and quests',
          type: 'toggle',
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
          icon: 'wallet',
        },
      ],
    },
    {
      title: 'Content & Media',
      items: [
        {
          id: 'autoPlay',
          title: 'Auto-play Videos',
          subtitle: 'Automatically play videos in feed',
          type: 'toggle',
          value: autoPlayVideos,
          onToggle: setAutoPlayVideos,
          icon: 'scan',
        },
        {
          id: 'dataSaver',
          title: 'Data Saver',
          subtitle: 'Reduce data usage by limiting media quality',
          type: 'toggle',
          value: dataSaver,
          onToggle: setDataSaver,
          icon: 'profile',
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          id: 'privacyMode',
          title: 'Privacy Mode',
          subtitle: 'Hide sensitive content and limit profile visibility',
          type: 'toggle',
          value: privacyMode,
          onToggle: setPrivacyMode,
          icon: 'marketplace',
        },
        {
          id: 'exportData',
          title: 'Export Data',
          subtitle: 'Download your data and posts',
          type: 'button',
          onPress: handleExportData,
          icon: 'wallet',
        },
      ],
    },
    {
      title: 'Storage',
      items: [
        {
          id: 'clearCache',
          title: 'Clear Cache',
          subtitle: 'Free up storage space',
          type: 'button',
          onPress: handleClearCache,
          icon: 'scan',
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        {
          id: 'privacyPolicy',
          title: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
          type: 'button',
          onPress: handlePrivacyPolicy,
          icon: 'profile',
        },
        {
          id: 'termsOfService',
          title: 'Terms of Service',
          subtitle: 'Read our terms of service',
          type: 'button',
          onPress: handleTermsOfService,
          icon: 'marketplace',
        },
      ],
    },
  ];

  const renderSettingsItem = (item: SettingsItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.settingsItem, { backgroundColor: theme.surface }]}
      onPress={item.onPress}
      disabled={item.type === 'toggle'}
    >
      <View style={styles.itemLeft}>
        {item.icon && (
          <View style={[styles.itemIcon, { backgroundColor: theme.surfaceVariant }]}>
            <SvgIcon name={item.icon} size={20} color={theme.primary} />
          </View>
        )}
        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, { color: theme.text }]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.itemRight}>
        {item.type === 'toggle' && (
          <Switch
            value={item.value as boolean}
            onValueChange={item.onToggle}
            trackColor={{ false: theme.divider, true: theme.primary }}
            thumbColor={theme.background}
          />
        )}
        {item.type === 'select' && (
          <Text style={[styles.itemValue, { color: theme.textSecondary }]}>
            {item.value}
          </Text>
        )}
        {item.type === 'button' && (
          <SvgIcon name="default" size={16} color={theme.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              {section.title}
            </Text>
            <View style={[styles.sectionContent, { backgroundColor: theme.surface }]}>
              {section.items.map(renderSettingsItem)}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: theme.textTertiary }]}>
            BRN App v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  itemRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
  },
}); 