import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Image } from 'react-native';
import WebView from 'react-native-webview';
import Icon from '@expo/vector-icons/Ionicons';

interface YouTubePlayerProps {
  videoData: [string, string, number, number];  // [url, publishedDate, views, likes]
  title?: string;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoData, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [url, publishedDate, views, likes] = videoData;

  const formatDate = (dateString: string) => {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${month}/${day}/${year}`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M+';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K+';
    }
    return num.toString();
  };

  // Extract video ID from YouTube URL
  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getVideoId(url);
  
  if (!videoId) return null;

  return (
    <View style={styles.container}>
      {!isPlaying ? (
        <TouchableOpacity 
          style={styles.thumbnail}
          onPress={() => setIsPlaying(true)}
        >
          <Image 
            source={{ uri: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }}
            style={styles.thumbnailImage}
          />
          <View style={styles.playButton}>
            <Icon name="play" size={30} color="#FFFFFF" />
          </View>
          {title && <Text style={styles.title}>{title}</Text>}
        </TouchableOpacity>
      ) : (
        <View style={styles.videoContainer}>
          <WebView
            style={styles.webview}
            source={{
              uri: `https://www.youtube.com/embed/${videoId}?autoplay=1`
            }}
            allowsFullscreenVideo
          />
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setIsPlaying(false)}
          >
            <Icon name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
      <Text style={styles.videoStats}>
        🏷️ Published: {formatDate(publishedDate)} | 👀 Views: {formatNumber(views)} | 👍 Likes: {formatNumber(likes)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16/9,
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [
      { translateX: -25 },
      { translateY: -25 }
    ],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#FFFFFF',
    fontSize: 14,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16/9,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoStats: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    paddingHorizontal: 8,
    textAlign: 'left',
  },
}); 