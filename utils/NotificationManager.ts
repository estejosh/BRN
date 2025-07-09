import { Alert, Platform } from 'react-native';
import { storageManager } from './StorageManager';
import { errorHandler } from './ErrorHandler';

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'quest' | 'token' | 'friend' | 'system';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  data?: any;
  userId?: string;
  postId?: string;
}

export interface NotificationPreferences {
  like: boolean;
  comment: boolean;
  quest: boolean;
  token: boolean;
  friend: boolean;
  system: boolean;
}

export class NotificationManager {
  private static instance: NotificationManager;
  private notifications: Notification[] = [];
  private preferences: NotificationPreferences = {
    like: true,
    comment: true,
    quest: true,
    token: true,
    friend: true,
    system: true,
  };

  private constructor() {
    this.initialize();
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  private async initialize(): Promise<void> {
    try {
      await Promise.all([
        this.loadNotifications(),
        this.loadPreferences(),
      ]);
      console.log('NotificationManager initialized successfully');
    } catch (error) {
      errorHandler.logError(
        'Notification Manager Init Error',
        'Failed to initialize notification manager',
        'medium',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'NotificationManager'
      );
    }
  }

  // Load notifications from storage with error handling
  private async loadNotifications(): Promise<void> {
    try {
      const cached = await storageManager.getItem<Notification[]>('notifications');
      if (cached && Array.isArray(cached)) {
        this.notifications = cached;
      }
    } catch (error) {
      errorHandler.logError(
        'Notification Load Error',
        'Failed to load notifications from storage',
        'medium',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'NotificationManager'
      );
      // Start with empty notifications if loading fails
      this.notifications = [];
    }
  }

  // Save notifications to storage with error handling
  private async saveNotifications(): Promise<void> {
    try {
      await storageManager.setItem('notifications', this.notifications);
    } catch (error) {
      errorHandler.logError(
        'Notification Save Error',
        'Failed to save notifications to storage',
        'medium',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'NotificationManager'
      );
    }
  }

  // Load preferences from storage with error handling
  private async loadPreferences(): Promise<void> {
    try {
      const cached = await storageManager.getItem<NotificationPreferences>('notification_preferences');
      if (cached && typeof cached === 'object') {
        this.preferences = { ...this.preferences, ...cached };
      }
    } catch (error) {
      errorHandler.logError(
        'Notification Preferences Load Error',
        'Failed to load notification preferences',
        'low',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'NotificationManager'
      );
    }
  }

  // Save preferences to storage with error handling
  private async savePreferences(): Promise<void> {
    try {
      await storageManager.setItem('notification_preferences', this.preferences);
    } catch (error) {
      errorHandler.logError(
        'Notification Preferences Save Error',
        'Failed to save notification preferences',
        'low',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'NotificationManager'
      );
    }
  }

  // Create a new notification with validation and error handling
  async createNotification(
    type: Notification['type'],
    title: string,
    message: string,
    data?: any
  ): Promise<string> {
    try {
      // Validate inputs
      if (!type || !title || !message) {
        throw new Error('Invalid notification parameters');
      }

      if (!this.preferences[type]) {
        console.log(`Notification type ${type} is disabled`);
        return '';
      }

      const notification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type,
        title: title.trim(),
        message: message.trim(),
        timestamp: Date.now(),
        read: false,
        data,
      };

      this.notifications.unshift(notification);
      
      // Keep only the last 100 notifications
      if (this.notifications.length > 100) {
        this.notifications = this.notifications.slice(0, 100);
      }

      await this.saveNotifications();
      this.showInAppNotification(notification);
      
      console.log(`Notification created: ${type} - ${title}`);
      return notification.id;
    } catch (error) {
      errorHandler.logError(
        'Notification Creation Error',
        `Failed to create notification: ${type}`,
        'medium',
        { type, title, message, error: error instanceof Error ? error.message : 'Unknown error' },
        'NotificationManager'
      );
      return '';
    }
  }

  // Show in-app notification with error handling
  private showInAppNotification(notification: Notification): void {
    try {
      if (Platform.OS === 'ios') {
        // iOS uses Alert for in-app notifications
        Alert.alert(
          notification.title,
          notification.message,
          [
            {
              text: 'View',
              onPress: () => this.handleNotificationPress(notification),
            },
            {
              text: 'Dismiss',
              style: 'cancel',
            },
          ],
          { cancelable: true }
        );
      } else {
        // Android can use custom toast or alert
        Alert.alert(
          notification.title,
          notification.message,
          [
            {
              text: 'View',
              onPress: () => this.handleNotificationPress(notification),
            },
            {
              text: 'Dismiss',
              style: 'cancel',
            },
          ],
          { cancelable: true }
        );
      }
    } catch (error) {
      errorHandler.logError(
        'Notification Display Error',
        'Failed to display in-app notification',
        'low',
        { notification, error: error instanceof Error ? error.message : 'Unknown error' },
        'NotificationManager'
      );
    }
  }

  // Handle notification press with error handling
  private handleNotificationPress(notification: Notification): void {
    try {
      console.log('Notification pressed:', notification);
      // Handle different notification types
      switch (notification.type) {
        case 'like':
          // Navigate to post
          break;
        case 'comment':
          // Navigate to post with comments
          break;
        case 'quest':
          // Navigate to quests
          break;
        case 'token':
          // Navigate to wallet
          break;
        case 'friend':
          // Navigate to friends
          break;
        case 'system':
          // Handle system notification
          break;
      }
    } catch (error) {
      errorHandler.logError(
        'Notification Press Error',
        'Failed to handle notification press',
        'low',
        { notification, error: error instanceof Error ? error.message : 'Unknown error' },
        'NotificationManager'
      );
    }
  }

  // Get all notifications with error handling
  async getNotifications(): Promise<Notification[]> {
    try {
      return [...this.notifications];
    } catch (error) {
      errorHandler.logError(
        'Notification Get Error',
        'Failed to get notifications',
        'low',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'NotificationManager'
      );
      return [];
    }
  }

  // Get unread notifications with error handling
  async getUnreadNotifications(): Promise<Notification[]> {
    try {
      return this.notifications.filter(notification => !notification.read);
    } catch (error) {
      errorHandler.logError(
        'Unread Notifications Error',
        'Failed to get unread notifications',
        'low',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'NotificationManager'
      );
      return [];
    }
  }

  // Mark notification as read with error handling
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        await this.saveNotifications();
      }
    } catch (error) {
      errorHandler.logError(
        'Notification Mark Read Error',
        `Failed to mark notification as read: ${notificationId}`,
        'low',
        { notificationId, error: error instanceof Error ? error.message : 'Unknown error' },
        'NotificationManager'
      );
    }
  }

  // Mark all notifications as read with error handling
  async markAllAsRead(): Promise<void> {
    try {
      this.notifications.forEach(notification => {
        notification.read = true;
      });
      await this.saveNotifications();
    } catch (error) {
      errorHandler.logError(
        'Notification Mark All Read Error',
        'Failed to mark all notifications as read',
        'low',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'NotificationManager'
      );
    }
  }

  // Delete notification with error handling
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
      await this.saveNotifications();
    } catch (error) {
      errorHandler.logError(
        'Notification Delete Error',
        `Failed to delete notification: ${notificationId}`,
        'low',
        { notificationId, error: error instanceof Error ? error.message : 'Unknown error' },
        'NotificationManager'
      );
    }
  }

  // Clear all notifications with error handling
  async clearAllNotifications(): Promise<void> {
    try {
      this.notifications = [];
      await this.saveNotifications();
    } catch (error) {
      errorHandler.logError(
        'Notification Clear Error',
        'Failed to clear all notifications',
        'low',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'NotificationManager'
      );
    }
  }

  // Get notification preferences with error handling
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      return { ...this.preferences };
    } catch (error) {
      errorHandler.logError(
        'Notification Preferences Get Error',
        'Failed to get notification preferences',
        'low',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'NotificationManager'
      );
      return { ...this.preferences };
    }
  }

  // Update notification preferences with error handling
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      this.preferences = { ...this.preferences, ...preferences };
      await this.savePreferences();
    } catch (error) {
      errorHandler.logError(
        'Notification Preferences Update Error',
        'Failed to update notification preferences',
        'low',
        { preferences, error: error instanceof Error ? error.message : 'Unknown error' },
        'NotificationManager'
      );
    }
  }

  // Get notification count with error handling
  async getNotificationCount(): Promise<number> {
    try {
      return this.notifications.length;
    } catch (error) {
      errorHandler.logError(
        'Notification Count Error',
        'Failed to get notification count',
        'low',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'NotificationManager'
      );
      return 0;
    }
  }

  // Get unread notification count with error handling
  async getUnreadCount(): Promise<number> {
    try {
      return this.notifications.filter(notification => !notification.read).length;
    } catch (error) {
      errorHandler.logError(
        'Unread Count Error',
        'Failed to get unread notification count',
        'low',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'NotificationManager'
      );
      return 0;
    }
  }

  // Convenience methods for different notification types
  async createLikeNotification(userId: string, postId: string): Promise<string> {
    return this.createNotification(
      'like',
      'New Like',
      `Someone liked your post`,
      { userId, postId }
    );
  }

  async createCommentNotification(userId: string, postId: string): Promise<string> {
    return this.createNotification(
      'comment',
      'New Comment',
      `Someone commented on your post`,
      { userId, postId }
    );
  }

  async createQuestNotification(questName: string): Promise<string> {
    return this.createNotification(
      'quest',
      'Quest Available',
      `New quest: ${questName}`,
      { questName }
    );
  }

  async createTokenNotification(amount: number, type: 'earned' | 'spent'): Promise<string> {
    return this.createNotification(
      'token',
      `${type === 'earned' ? 'Tokens Earned' : 'Tokens Spent'}`,
      `You ${type} ${amount} BRN tokens`,
      { amount, type }
    );
  }

  async createFriendNotification(userId: string, action: string): Promise<string> {
    return this.createNotification(
      'friend',
      'Friend Activity',
      `Your friend ${action}`,
      { userId, action }
    );
  }

  async createSystemNotification(title: string, message: string): Promise<string> {
    return this.createNotification(
      'system',
      title,
      message
    );
  }

  // Health check method
  async getHealthStatus(): Promise<{
    isHealthy: boolean;
    notificationCount: number;
    unreadCount: number;
    errors: string[];
  }> {
    const health = {
      isHealthy: true,
      notificationCount: 0,
      unreadCount: 0,
      errors: [] as string[],
    };

    try {
      health.notificationCount = await this.getNotificationCount();
      health.unreadCount = await this.getUnreadCount();
      
      // Test notification creation
      const testId = await this.createSystemNotification('Health Check', 'Testing notification system');
      if (!testId) {
        health.isHealthy = false;
        health.errors.push('Failed to create test notification');
      } else {
        // Clean up test notification
        await this.deleteNotification(testId);
      }
    } catch (error) {
      health.isHealthy = false;
      health.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return health;
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance(); 