import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Video from 'react-native-video';
import { useTheme } from '../contexts/ThemeContext';
import { errorHandler } from '../utils/ErrorHandler';

const { width: screenWidth } = Dimensions.get('window');

interface VideoPlayerProps {
  source: string;
  poster?: string;
  duration?: string;
  onPress?: () => void;
  style?: any;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  source,
  poster,
  duration,
  onPress,
  style,
  autoPlay = false,
  muted = true,
  loop = true,
}) => {
  const { theme, themeMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const videoRef = useRef<Video>(null);

  const handleLoad = (data: any) => {
    setIsLoading(false);
    setDurationMs(data.duration);
  };

  const handleProgress = (data: any) => {
    setProgress(data.currentTime / data.playableDuration);
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentTime = () => {
    return formatTime(progress * durationMs);
  };

  const getTotalTime = () => {
    return formatTime(durationMs);
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.videoContainer}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <Video
          ref={videoRef}
          source={{ uri: source }}
          style={styles.video}
          resizeMode="cover"
          paused={!isPlaying}
          muted={muted}
          loop={loop}
          onLoad={handleLoad}
          onProgress={handleProgress}
          onError={(error) => {
            errorHandler.logError('Video Player Error', error.error?.errorString || 'Unknown video error', 'medium', {
              source,
              error,
            }, 'VideoPlayer');
            
            if (__DEV__) {
              console.log('Video error:', error);
            }
          }}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ff4444" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {/* Play/Pause Button Overlay */}
        {!isPlaying && !isLoading && (
          <View style={styles.playButtonOverlay}>
            <View style={styles.playButton}>
              <Text style={styles.playIcon}>▶️</Text>
            </View>
          </View>
        )}

        {/* Progress Bar */}
        {!isLoading && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progress * 100}%` }
                ]} 
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{getCurrentTime()}</Text>
              <Text style={styles.timeText}>{getTotalTime()}</Text>
            </View>
          </View>
        )}

        {/* Duration Badge */}
        {duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{duration}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  videoContainer: {
    width: 300,
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#333333',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 24,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff4444',
    borderRadius: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#ffffff',
    fontSize: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  durationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    color: '#ffffff',
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
}); 