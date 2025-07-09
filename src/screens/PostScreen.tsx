import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PostScreen = () => {
  const [postType, setPostType] = useState('text');
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');

  const postTypes = [
    { id: 'text', icon: 'text', label: 'Text Post' },
    { id: 'photo', icon: 'image', label: 'Photo' },
    { id: 'video', icon: 'videocam', label: 'Video' },
    { id: 'talk', icon: 'mic', label: 'Talk Post' },
  ];

  const handlePost = () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your post.');
      return;
    }

    Alert.alert(
      'Post Created!',
      `Your ${postType} post has been created and you've earned 10 BRN tokens!`,
      [{ text: 'OK', onPress: () => {
        setContent('');
        setHashtags('');
      }}]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Post Type Selector */}
      <View style={styles.typeSelector}>
        {postTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeButton,
              postType === type.id && styles.activeTypeButton,
            ]}
            onPress={() => setPostType(type.id)}
          >
            <Ionicons
              name={type.icon as any}
              size={24}
              color={postType === type.id ? '#ffffff' : '#888888'}
            />
            <Text
              style={[
                styles.typeLabel,
                postType === type.id && styles.activeTypeLabel,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content Input */}
      <View style={styles.contentSection}>
        <TextInput
          style={styles.contentInput}
          placeholder="What's on your mind?"
          placeholderTextColor="#888888"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={6}
        />
      </View>

      {/* Hashtags Input */}
      <View style={styles.hashtagSection}>
        <Text style={styles.sectionTitle}>Hashtags</Text>
        <TextInput
          style={styles.hashtagInput}
          placeholder="#BRN #LiquidDeath #BRNFEST"
          placeholderTextColor="#888888"
          value={hashtags}
          onChangeText={setHashtags}
        />
      </View>

      {/* Post Actions */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="location-outline" size={20} color="#ff4444" />
          <Text style={styles.actionText}>Add Location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="qr-code-outline" size={20} color="#ff4444" />
          <Text style={styles.actionText}>Link to Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="flame-outline" size={20} color="#ff4444" />
          <Text style={styles.actionText}>Boost Post</Text>
        </TouchableOpacity>
      </View>

      {/* Post Button */}
      <TouchableOpacity style={styles.postButton} onPress={handlePost}>
        <Ionicons name="send" size={20} color="#ffffff" />
        <Text style={styles.postButtonText}>Create Post</Text>
      </TouchableOpacity>

      {/* Earnings Info */}
      <View style={styles.earningsInfo}>
        <Ionicons name="wallet-outline" size={16} color="#ff4444" />
        <Text style={styles.earningsText}>
          Earn 10 BRN tokens for this post
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  typeSelector: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#333333',
    marginHorizontal: 5,
  },
  activeTypeButton: {
    backgroundColor: '#ff4444',
  },
  typeLabel: {
    color: '#888888',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  activeTypeLabel: {
    color: '#ffffff',
  },
  contentSection: {
    padding: 20,
  },
  contentInput: {
    backgroundColor: '#222222',
    borderRadius: 12,
    padding: 15,
    color: '#ffffff',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  hashtagSection: {
    padding: 20,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  hashtagInput: {
    backgroundColor: '#222222',
    borderRadius: 12,
    padding: 15,
    color: '#ffffff',
    fontSize: 14,
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  actionText: {
    color: '#ff4444',
    fontSize: 14,
    marginLeft: 5,
  },
  postButton: {
    backgroundColor: '#ff4444',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  earningsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#222222',
    margin: 20,
    borderRadius: 12,
  },
  earningsText: {
    color: '#ff4444',
    fontSize: 14,
    marginLeft: 5,
  },
});

export default PostScreen; 