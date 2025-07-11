import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { errorHandler } from '../../utils/ErrorHandler';
import { ErrorBoundary } from '../../components/ErrorBoundary';

interface Post {
  id: string;
  user: string;
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
}

const FeedScreen = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load posts with error handling
  const loadPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate posts data
      const mockPosts = [
        {
          id: '1',
          user: 'BRN User',
          content: 'Just earned 50 BRN tokens! 🔥',
          likes: 24,
          comments: 5,
          timestamp: '2 hours ago',
        },
        {
          id: '2',
          user: 'Token Hunter',
          content: 'Completed my daily quest! 💪',
          likes: 18,
          comments: 3,
          timestamp: '4 hours ago',
        },
      ];
      
      setPosts(mockPosts);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load posts';
      errorHandler.logError(
        'Feed Load Error',
        errorMessage,
        'medium',
        { error },
        'FeedScreen'
      );
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle refresh with error handling
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadPosts();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh';
      errorHandler.logError(
        'Feed Refresh Error',
        errorMessage,
        'low',
        { error },
        'FeedScreen'
      );
      Alert.alert('Refresh Failed', 'Please try again later.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle like with error handling
  const handleLike = async (postId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, likes: post.likes + 1 }
            : post
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to like post';
      errorHandler.logError(
        'Post Like Error',
        errorMessage,
        'low',
        { postId, error },
        'FeedScreen'
      );
      Alert.alert('Error', 'Failed to like post. Please try again.');
    }
  };

  // Handle comment with error handling
  const handleComment = async (postId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      Alert.alert('Comment', 'Comment feature coming soon!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to comment';
      errorHandler.logError(
        'Post Comment Error',
        errorMessage,
        'low',
        { postId, error },
        'FeedScreen'
      );
      Alert.alert('Error', 'Failed to comment. Please try again.');
    }
  };

  // Handle share with error handling
  const handleShare = async (postId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      Alert.alert('Share', 'Share feature coming soon!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to share post';
      errorHandler.logError(
        'Post Share Error',
        errorMessage,
        'low',
        { postId, error },
        'FeedScreen'
      );
      Alert.alert('Error', 'Failed to share post. Please try again.');
    }
  };

  // Load posts on component mount
  useEffect(() => {
    loadPosts();
  }, []);

  // Render post with error handling
  const renderPost = (post: Post) => {
    try {
      return (
        <View key={post.id} style={styles.post}>
          <View style={styles.postHeader}>
            <Text style={styles.username}>{post.user}</Text>
            <Text style={styles.timestamp}>{post.timestamp}</Text>
          </View>
          
          <Text style={styles.content}>{post.content}</Text>
          
          <View style={styles.postActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLike(post.id)}
            >
              <Ionicons name="heart-outline" size={20} color="#ff4444" />
              <Text style={styles.actionText}>{post.likes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleComment(post.id)}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#666666" />
              <Text style={styles.actionText}>{post.comments}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleShare(post.id)}
            >
              <Ionicons name="share-outline" size={20} color="#666666" />
            </TouchableOpacity>
          </View>
        </View>
      );
    } catch (error) {
      errorHandler.logError(
        'Post Render Error',
        `Failed to render post ${post.id}`,
        'medium',
        { post, error: error instanceof Error ? error.message : 'Unknown error' },
        'FeedScreen'
      );
      
      return (
        <View key={post.id} style={styles.errorPost}>
          <Text style={styles.errorText}>Failed to load post</Text>
        </View>
      );
    }
  };

  // Render error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPosts}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ErrorBoundary componentName="FeedScreen" screenName="Feed">
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#ff4444']}
              tintColor="#ff4444"
            />
          }
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
          ) : posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts yet</Text>
              <Text style={styles.emptySubtext}>Be the first to share something!</Text>
            </View>
          ) : (
            posts.map(renderPost)
          )}
        </ScrollView>
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  post: {
    backgroundColor: '#2a2a2a',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  username: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    color: '#666666',
    fontSize: 12,
  },
  content: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  actionText: {
    color: '#666666',
    marginLeft: 5,
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorMessage: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorPost: {
    backgroundColor: '#2a2a2a',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
  },
});

export default FeedScreen; 