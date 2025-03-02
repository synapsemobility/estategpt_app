import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  BackHandler,
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from '@expo/vector-icons/Ionicons';
import {
  TwilioVideo,
  TwilioVideoLocalView,
  TwilioVideoParticipantView
} from 'react-native-twilio-video-webrtc';
import { TwilioService } from '../../../services/TwilioService';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthenticator } from '@aws-amplify/ui-react-native';

type CallParamList = {
  VideoCall: {
    meetingId: string;
    roomName?: string;
    professionalName: string;
  };
};

export const VideoCallScreen = () => {
  const route = useRoute<RouteProp<CallParamList, 'VideoCall'>>();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { meetingId, professionalName } = route.params;
  const roomName = route.params.roomName || `meeting-${meetingId}`;
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [videoTracks, setVideoTracks] = useState(new Map());
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [callTime, setCallTime] = useState(0);
  const [callStatus, setCallStatus] = useState('connecting'); // ['connecting', 'connected', 'disconnected', 'failed', 'reconnecting']
  const twilioRef = useRef<TwilioVideo | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuthenticator();
  const userIdentity = user?.username || 'unknown-user';

  // Set up timer for call duration
  useEffect(() => {
    if (isConnected && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setCallTime(prev => prev + 1);
      }, 1000);
    } else if (!isConnected && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isConnected]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Don't allow back button to exit call, must use end call button
      if (isConnected) {
        showEndCallConfirmation();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isConnected]);

  // Connect to the call as soon as the screen loads
  useEffect(() => {
    connectToCall();
    
    // Cleanup on unmount
    return () => {
      if (twilioRef.current) {
        twilioRef.current.disconnect();
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const connectToCall = async () => {
    setIsLoading(true);
    setCallStatus('connecting');
    
    try {
      // Get a token for this meeting
      const tokenFromServer = await TwilioService.getToken(meetingId, userIdentity);
      
      if (twilioRef.current && tokenFromServer) {
        // Connect with the token
        twilioRef.current.connect({
          accessToken: tokenFromServer,
          roomName: roomName,
          enableNetworkQualityReporting: true,
        });
      }
    } catch (error: any) {
      console.error('Error connecting to call:', error);
      
      // Handle repeated connection failures
      if (reconnectAttempts < 2) {
        setReconnectAttempts(prev => prev + 1);
        setCallStatus('reconnecting');
        setTimeout(() => connectToCall(), 3000);
      } else {
        setCallStatus('failed');
        Alert.alert(
          'Connection Failed',
          'Unable to connect to the call. Please try again later.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const endCall = () => {
    if (twilioRef.current) {
      twilioRef.current.disconnect();
    }
    navigation.goBack();
  };

  const showEndCallConfirmation = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this call?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Call', style: 'destructive', onPress: endCall }
      ]
    );
  };

  const toggleAudio = () => {
    if (twilioRef.current) {
      twilioRef.current.setLocalAudioEnabled(!isAudioEnabled);
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = () => {
    if (twilioRef.current) {
      twilioRef.current.setLocalVideoEnabled(!isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleSpeaker = () => {
    if (twilioRef.current) {
      twilioRef.current.toggleSoundSetup(!isSpeakerEnabled);
      setIsSpeakerEnabled(!isSpeakerEnabled);
    }
  };

  const flipCamera = () => {
    if (twilioRef.current) {
      twilioRef.current.flipCamera();
    }
  };

  // Twilio event handlers
  const onRoomDidConnect = () => {
    console.log('✅ Connected to room:', roomName);
    setIsConnected(true);
    setCallStatus('connected');
    setReconnectAttempts(0);
  };

  const onRoomDidDisconnect = ({ error }: { error: any }) => {
    console.log('🔴 Disconnected from room:', error);
    setIsConnected(false);
    setVideoTracks(new Map());
    setCallStatus('disconnected');
    
    if (error && reconnectAttempts < 2) {
      // Try to reconnect on unexpected disconnects
      setReconnectAttempts(prev => prev + 1);
      setCallStatus('reconnecting');
      setTimeout(() => connectToCall(), 3000);
    } else {
      navigation.goBack();
    }
  };

  const onRoomDidFailToConnect = (error: any) => {
    console.error('❌ Failed to connect to room:', error);
    setCallStatus('failed');
    
    if (reconnectAttempts < 2) {
      setReconnectAttempts(prev => prev + 1);
      setCallStatus('reconnecting');
      setTimeout(() => connectToCall(), 3000);
    } else {
      Alert.alert(
        'Connection Failed',
        'Unable to connect to the call. Please try again later.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const onParticipantAddedVideoTrack = ({ participant, track }: { participant: any; track: any }) => {
    console.log('👤 Participant added video track:', participant);
    // Make sure participant sid is a string
    const participantSid = typeof participant === 'object' && participant.sid 
      ? participant.sid.toString() 
      : participant.toString();
    
    setVideoTracks(
      new Map([
        ...videoTracks,
        [
          track.trackSid,
          {
            participantSid,
            videoTrackSid: track.trackSid,
          },
        ],
      ])
    );
  };

  const onParticipantRemovedVideoTrack = ({ track }: { track: any }) => {
    const newVideoTracks = new Map(videoTracks);
    newVideoTracks.delete(track.trackSid);
    setVideoTracks(newVideoTracks);
  };

  // Render loading/connecting state
  const renderConnectingState = () => (
    <View style={styles.connectingContainer}>
      <StatusBar barStyle="light-content" />
      <View style={styles.connectingContent}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.connectingText}>
          {callStatus === 'reconnecting' 
            ? 'Reconnecting to call...' 
            : 'Connecting to call...'}
        </Text>
        <Text style={styles.connectingSubtext}>
          Please wait while we establish a secure connection
        </Text>
      </View>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  // Main UI when connected
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Show connecting state while connecting */}
      {(callStatus === 'connecting' || callStatus === 'reconnecting') && renderConnectingState()}
      
      {/* Main call UI when connected */}
      {callStatus === 'connected' && (
        <>
          {/* Remote video fills the background */}
          <View style={styles.remoteVideoContainer}>
            {videoTracks.size > 0 ? (
              Array.from(videoTracks, ([trackSid, trackItem]: [string, any]) => (
                <TwilioVideoParticipantView
                  key={trackSid}
                  trackIdentifier={{
                    participantSid: trackItem.participantSid,
                    videoTrackSid: trackItem.videoTrackSid
                  }}
                  style={styles.remoteVideo}
                />
              ))[0]
            ) : (
              <View style={styles.emptyRemoteVideo}>
                <Icon name="person" size={80} color="rgba(255,255,255,0.5)" />
                <Text style={styles.waitingForVideoText}>
                  Waiting for {professionalName} to turn on video...
                </Text>
              </View>
            )}
          </View>
          
          {/* Call info */}
          <SafeAreaView style={styles.callInfoContainer}>
            <View style={styles.callHeaderContainer}>
              <Text style={styles.callTitle}>Call with {professionalName}</Text>
              <Text style={styles.callTimer}>{formatTime(callTime)}</Text>
            </View>
          </SafeAreaView>
          
          {/* Local video preview */}
          <View style={styles.localVideoContainer}>
            <TwilioVideoLocalView
              enabled={isVideoEnabled}
              style={styles.localVideo}
            />
          </View>
          
          {/* Call controls at bottom */}
          <SafeAreaView style={styles.controlsContainer}>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.controlsGradient}
            >
              <View style={styles.controlButtons}>
                <TouchableOpacity
                  style={[styles.controlButton]}
                  onPress={flipCamera}
                >
                  <Icon name="camera-reverse" size={26} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.controlButton, !isAudioEnabled && styles.controlButtonDisabled]}
                  onPress={toggleAudio}
                >
                  <Icon name={isAudioEnabled ? "mic" : "mic-off"} size={26} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.controlButton, styles.endCallButton]}
                  onPress={showEndCallConfirmation}
                >
                  <Icon name="call" size={26} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.controlButton, !isVideoEnabled && styles.controlButtonDisabled]}
                  onPress={toggleVideo}
                >
                  <Icon name={isVideoEnabled ? "videocam" : "videocam-off"} size={26} color="#fff" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.controlButton, !isSpeakerEnabled && styles.controlButtonDisabled]}
                  onPress={toggleSpeaker}
                >
                  <Icon name={isSpeakerEnabled ? "volume-high" : "volume-mute"} size={26} color="#fff" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </SafeAreaView>
        </>
      )}
      
      {/* Hidden Twilio Video component */}
      <TwilioVideo
        ref={twilioRef}
        onRoomDidConnect={onRoomDidConnect}
        onRoomDidDisconnect={onRoomDidDisconnect}
        onRoomDidFailToConnect={onRoomDidFailToConnect}
        onParticipantAddedVideoTrack={onParticipantAddedVideoTrack}
        onParticipantRemovedVideoTrack={onParticipantRemovedVideoTrack}
      />
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  // Connecting state styles
  connectingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 20,
  },
  connectingContent: {
    alignItems: 'center',
  },
  connectingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  connectingSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  cancelButton: {
    position: 'absolute',
    bottom: 40,
    padding: 15,
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  // Connected call styles
  remoteVideoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1c1c1c',
  },
  remoteVideo: {
    flex: 1,
  },
  emptyRemoteVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingForVideoText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 15,
  },
  callInfoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 15,
  },
  callHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 20 : 0,
  },
  callTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  callTimer: {
    fontSize: 16,
    color: '#fff',
  },
  localVideoContainer: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: width * 0.3,
    height: (width * 0.3) * 4/3,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  localVideo: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  controlsGradient: {
    paddingVertical: 20,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  controlButtonDisabled: {
    backgroundColor: 'rgba(255,59,48,0.4)',
  },
  endCallButton: {
    backgroundColor: '#FF3B30',
    transform: [{ rotate: '135deg' }],
  },
});