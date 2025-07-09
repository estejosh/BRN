import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { VideoPlayer } from './VideoPlayer';

export const VideoTestScreen: React.FC = () => {
  const testVideos = [
    {
      id: '1',
      source: 'file:///C:/BRNArmy/BRNApp/assets/videos/video_2025-07-07_18-59-59.mp4',
      title: 'Test Video 1',
      duration: '0:15',
    },
    {
      id: '2',
      source: 'file:///C:/BRNArmy/BRNApp/assets/videos/video_2025-07-07_18-59-42.mp4',
      title: 'Test Video 2',
      duration: '0:28',
    },
    {
      id: '3',
      source: 'file:///C:/BRNArmy/BRNApp/assets/videos/video_2025-07-07_18-59-54.mp4',
      title: 'Test Video 3',
      duration: '0:12',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Video Player Test</Text>
      <Text style={styles.subtitle}>Testing your video player component with real videos</Text>
      
      {testVideos.map((video) => (
        <View key={video.id} style={styles.videoSection}>
          <Text style={styles.videoTitle}>{video.title}</Text>
          <VideoPlayer
            source={video.source}
            duration={video.duration}
            style={styles.videoPlayer}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#cccccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  videoSection: {
    marginBottom: 30,
  },
  videoTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  videoPlayer: {
    marginBottom: 10,
  },
}); 