// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   ActivityIndicator,
//   TextInput,
//   Alert,
//   ScrollView,
//   Platform,
// } from 'react-native';
// import Icon from '@expo/vector-icons/Ionicons';
// import {
//   TwilioVideo,
//   TwilioVideoLocalView,
//   TwilioVideoParticipantView
// } from 'react-native-twilio-video-webrtc';
// import { TwilioService } from '../../../services/TwilioService';
// import DeviceInfo from 'react-native-device-info';

// export const TestVideoCallScreen = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [isConnected, setIsConnected] = useState(false);
//   const [isAudioEnabled, setIsAudioEnabled] = useState(true);
//   const [isVideoEnabled, setIsVideoEnabled] = useState(true);
//   const [status, setStatus] = useState('disconnected');
//   const [videoTracks, setVideoTracks] = useState(new Map());
//   const [meetingId, setMeetingId] = useState('test-meeting-123');
//   // Generate a more unique username based on device details
//   const [userName, setUserName] = useState(`user-${Platform.OS}-${Math.floor(Math.random() * 10000)}`);
//   const twilioRef = useRef<TwilioVideo | null>(null);

//   // Cleanup function
//   useEffect(() => {
//     return () => {
//       // Make sure we disconnect when the component unmounts
//       if (twilioRef.current) {
//         twilioRef.current.disconnect();
//       }
//     };
//   }, []);

//   // Direct test connection
//   const startDirectTest = async () => {
//     if (!meetingId.trim()) {
//       Alert.alert('Error', 'Please enter a meeting ID');
//       return;
//     }

//     if (!userName.trim()) {
//       Alert.alert('Error', 'Please enter a user name');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       // Ensure users have unique identities by adding device-specific info
//       const uniqueIdentity = `${userName}-${Math.floor(Math.random() * 10000)}`;
      
//       // Get token from our TwilioService
//       console.log('Getting token for:', uniqueIdentity);
//       const tokenFromServer = await TwilioService.getToken(meetingId, uniqueIdentity);
      
//       if (twilioRef.current && tokenFromServer) {
//         // Connect using the token and meeting ID
//         const roomName = `meeting-${meetingId}`;
        
//         console.log('Connecting to room:', roomName);
//         twilioRef.current.connect({
//           accessToken: tokenFromServer,
//           roomName: roomName
//         });
//       }
//     } catch (error: any) {
//       console.error('Error starting video call:', error);
//       Alert.alert(
//         'Connection Error',
//         'Unable to connect to video call. Please check your internet connection and try again.'
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const endCall = () => {
//     if (twilioRef.current) {
//       twilioRef.current.disconnect();
//       setIsConnected(false);
//       // Clear the video tracks when ending call
//       setVideoTracks(new Map());
//     }
//   };

//   const toggleAudio = () => {
//     if (twilioRef.current) {
//       twilioRef.current.setLocalAudioEnabled(!isAudioEnabled);
//       setIsAudioEnabled(!isAudioEnabled);
//     }
//   };

//   const toggleVideo = () => {
//     if (twilioRef.current) {
//       twilioRef.current.setLocalVideoEnabled(!isVideoEnabled);
//       setIsVideoEnabled(!isVideoEnabled);
//     }
//   };

//   // Twilio video event handlers
//   const onRoomDidConnect = () => {
//     console.log('✅ CONNECTED TO ROOM');
//     setStatus('connected');
//     setIsConnected(true);
//   };

//   const onRoomDidDisconnect = ({ error }: { error: any }) => {
//     console.log('🔴 DISCONNECTED FROM ROOM');
//     setStatus('disconnected');
//     setIsConnected(false);
//     setVideoTracks(new Map()); // Clear tracks on disconnect
    
//     if (error) {
//       console.error('Room disconnected with error:', error);
      
//       // Show a user-friendly message based on error
//       if (error.includes("duplicate identity")) {
//         Alert.alert(
//           'Connection Error',
//           'You are already connected with this identity in another session. Please use a different user name.',
//           [{ text: 'OK' }]
//         );
//       }
//     }
//   };

//   const onRoomDidFailToConnect = (error: any) => {
//     console.error('❌ FAILED TO CONNECT TO ROOM:', error);
//     setStatus('disconnected');
//     setIsConnected(false);
//     Alert.alert(
//       'Connection Failed',
//       'Unable to connect to the video room. Please try again with a different name or meeting ID.'
//     );
//   };

//   const onParticipantAddedVideoTrack = ({ participant, track }: { participant: any; track: any }) => {
//     console.log('👤 NEW PARTICIPANT VIDEO:', participant);
    
//     // Make sure participant sid is a string
//     const participantSid = typeof participant === 'object' && participant.sid 
//       ? participant.sid.toString() 
//       : participant.toString();
    
//     setVideoTracks(
//       new Map([
//         ...videoTracks,
//         [
//           track.trackSid,
//           {
//             participantSid,
//             videoTrackSid: track.trackSid,
//           },
//         ],
//       ])
//     );
//   };

//   const onParticipantRemovedVideoTrack = ({ track }: { track: any }) => {
//     console.log('🚫 PARTICIPANT VIDEO REMOVED');
//     const newVideoTracks = new Map(videoTracks);
//     newVideoTracks.delete(track.trackSid);
//     setVideoTracks(newVideoTracks);
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <View style={styles.mainContent}>
//           <Text style={styles.title}>Test Video Call</Text>
          
//           <View style={styles.infoBox}>
//             <Icon name="information-circle-outline" size={24} color="#007AFF" />
//             <Text style={styles.infoText}>
//               Enter the same meeting ID on both devices but use different usernames!
//               Each participant must have a unique identity.
//             </Text>
//           </View>

//           <Text style={styles.label}>Meeting ID</Text>
//           <TextInput
//             style={styles.input}
//             value={meetingId}
//             onChangeText={setMeetingId}
//             placeholder="Enter meeting ID"
//             autoCapitalize="none"
//           />
          
//           <Text style={styles.label}>Your User Name (must be unique)</Text>
//           <TextInput
//             style={styles.input}
//             value={userName}
//             onChangeText={setUserName}
//             placeholder="Enter your name"
//             autoCapitalize="none"
//           />
          
//           <View style={styles.buttonGroup}>
//             <TouchableOpacity 
//               style={[styles.button, styles.directTestButton]} 
//               onPress={startDirectTest}
//               disabled={isConnected}
//             >
//               <Text style={styles.buttonText}>Join Video Call</Text>
//               <Text style={styles.buttonSubtext}>Using your Twilio backend</Text>
//             </TouchableOpacity>
//           </View>
          
//           {isLoading && (
//             <View style={styles.loadingIndicator}>
//               <ActivityIndicator size="large" color="#007AFF" />
//               <Text>Connecting...</Text>
//             </View>
//           )}
          
//           {isConnected && (
//             <>
//               <Text style={styles.statusText}>
//                 ✅ Connected to room: meeting-{meetingId}
//               </Text>
              
//               <View style={styles.callControls}>
//                 <TouchableOpacity 
//                   style={[styles.controlButton, !isAudioEnabled && styles.controlButtonDisabled]} 
//                   onPress={toggleAudio}
//                 >
//                   <Icon name={isAudioEnabled ? "mic" : "mic-off"} size={24} color="#FFF" />
//                 </TouchableOpacity>
                
//                 <TouchableOpacity 
//                   style={[styles.controlButton, !isVideoEnabled && styles.controlButtonDisabled]} 
//                   onPress={toggleVideo}
//                 >
//                   <Icon name={isVideoEnabled ? "videocam" : "videocam-off"} size={24} color="#FFF" />
//                 </TouchableOpacity>
                
//                 <TouchableOpacity 
//                   style={[styles.controlButton, styles.endCallButton]}
//                   onPress={endCall}
//                 >
//                   <Icon name="call" size={24} color="#FFF" />
//                 </TouchableOpacity>
//               </View>
              
//               <View style={styles.videoContainer}>
//                 {videoTracks.size > 0 ? (
//                   <Text style={styles.participantText}>
//                     {videoTracks.size} participant(s) connected
//                   </Text>
//                 ) : (
//                   <Text style={styles.waitingText}>
//                     Waiting for other participants...
//                   </Text>
//                 )}
                
//                 {Array.from(videoTracks, ([trackSid, trackItem]: [string, any]) => (
//                   <View key={trackSid} style={styles.remoteVideoContainer}>
//                     <Text style={styles.participantLabel}>Remote Participant</Text>
//                     <TwilioVideoParticipantView
//                       trackIdentifier={{
//                         participantSid: trackItem.participantSid,
//                         videoTrackSid: trackItem.videoTrackSid
//                       }}
//                       style={styles.remoteVideo}
//                     />
//                   </View>
//                 ))}
                
//                 <View style={styles.localVideoContainer}>
//                   <Text style={styles.participantLabel}>You ({userName})</Text>
//                   <TwilioVideoLocalView
//                     enabled={true}
//                     style={styles.localVideo}
//                   />
//                 </View>
//               </View>
              
//               <TouchableOpacity 
//                 style={styles.endCallButton}
//                 onPress={endCall}
//               >
//                 <Icon name="call" size={24} color="#FFF" />
//                 <Text style={styles.endCallText}>End Call</Text>
//               </TouchableOpacity>
//             </>
//           )}
//         </View>
//       </ScrollView>
        
//       <TwilioVideo
//         ref={twilioRef}
//         onRoomDidConnect={onRoomDidConnect}
//         onRoomDidDisconnect={onRoomDidDisconnect}
//         onRoomDidFailToConnect={onRoomDidFailToConnect}
//         onParticipantAddedVideoTrack={onParticipantAddedVideoTrack}
//         onParticipantRemovedVideoTrack={onParticipantRemovedVideoTrack}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#FFF',
//   },
//   scrollContent: {
//     flexGrow: 1,
//   },
//   mainContent: {
//     padding: 16,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   infoBox: {
//     backgroundColor: '#E8F1FF',
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 20,
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },
//   infoText: {
//     flex: 1,
//     marginLeft: 8,
//     color: '#333',
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '500',
//     marginBottom: 8,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#CCCCCC',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//     backgroundColor: '#F9F9F9',
//   },
//   buttonGroup: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginVertical: 20,
//   },
//   button: {
//     flex: 1,
//     padding: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginHorizontal: 5,
//   },
//   directTestButton: {
//     backgroundColor: '#34C759',
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   buttonSubtext: {
//     color: 'rgba(255,255,255,0.8)',
//     fontSize: 12,
//     marginTop: 4,
//   },
//   loadingIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 16,
//     gap: 8,
//   },
//   statusText: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginVertical: 10,
//     color: '#34C759',
//   },
//   callControls: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginVertical: 16,
//   },
//   controlButton: {
//     backgroundColor: '#007AFF',
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   controlButtonDisabled: {
//     backgroundColor: '#FF3B30',
//   },
//   endCallButton: {
//     backgroundColor: '#FF3B30',
//   },
//   videoContainer: {
//     marginTop: 20,
//   },
//   participantText: {
//     fontSize: 14,
//     textAlign: 'center',
//     marginBottom: 10,
//   },
//   waitingText: {
//     fontSize: 14,
//     textAlign: 'center',
//     marginBottom: 10,
//     color: '#FF9500',
//   },
//   remoteVideoContainer: {
//     marginBottom: 20,
//   },
//   localVideoContainer: {
//     marginBottom: 20,
//   },
//   participantLabel: {
//     fontSize: 14,
//     fontWeight: '500',
//     marginBottom: 5,
//   },
//   remoteVideo: {
//     width: '100%',
//     borderRadius: 8,
//     height: 150,
//   },
//   localVideo: {
//     width: '100%',
//     borderRadius: 8,
//     height: 200,
//   },
//   warningText: {
//     fontSize: 12,
//     color: '#FF9500',
//     fontStyle: 'italic',
//   },
//   endCallButton: {
//     backgroundColor: '#FF3B30',
//     borderRadius: 8,
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 20,
//     alignSelf: 'center',
//   },
//   endCallText: {
//     color: 'white',
//     fontWeight: 'bold',
//     marginLeft: 8,
//     fontSize: 16,
//   },
// });