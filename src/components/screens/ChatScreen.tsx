import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Linking,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SignOutButton } from '../auth/SignOutButton';
import Icon from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { MenuView } from '../menu/MenuView';
import { Amplify } from 'aws-amplify';
import { observer } from 'mobx-react-lite';
import { ChatViewModel } from '../../viewmodels/ChatViewModel';
import { styles } from '../../styles/chat.styles';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Message } from '../../types/chat.types';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import Markdown from 'react-native-markdown-display';
import { YouTubePlayer } from './YouTubePlayer';
import { reaction } from 'mobx';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../auth/CustomAuthenticator';

export type RootStackParamList = {
  Chat: {
    userID: string | undefined;
  };
  // Add other screens here
};

export type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;

type ChatMode = 'homie' | 'hackIt' | 'legit';

export const ChatScreen: React.FC<ChatScreenProps> = observer(({ route }) => {
  const { userID } = route.params;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const viewModel = React.useRef(new ChatViewModel(userID ?? 'guest')).current;
  
  // Initialize showPrompts based on message count
  const [showPrompts, setShowPrompts] = useState(viewModel.messages.length === 0);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const { signOut } = useAuthenticator();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Track the current mode to detect changes
  const previousModeRef = useRef(viewModel.currentMode);

  // State for scroll management
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [showProHint, setShowProHint] = useState(true);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);

  const homiePrompts = [
    "Find nearby handyman\navailable this weekend",
    "Kitchen remodel quotes\nfor single family home",
    "Compare lifetime costs\nof HVAC systems"
  ];

  const hackItPrompts = [
    "How to fix leaky faucet\nDIY guide",
    "Weekend DIY projects\nfor home improvement",
    "Fix squeaky floors\nstep-by-step"
  ];

  const legitPrompts = [
    "Property tax assessments\nappeal process",
    "Energy-efficient home\ntax credits",
    "Home office deduction\nrequirements",
    "Title insurance\nexplained"
  ];

  const currentPrompts = viewModel.currentMode === 'homie' ? homiePrompts : 
  viewModel.currentMode === 'hackIt' ? hackItPrompts : legitPrompts;

  const proHints = [
    {
      icon: 'call',
      text: 'Need urgent help? Call a pro',
      action: () => navigation.navigate('CallPro')
    },
    {
      icon: 'home',
      text: 'Talk to a real person (property experts)',
      action: () => navigation.navigate('CallPro')
    },
  ];

  // Rotate hints every 10 seconds
  useEffect(() => {
    if (showProHint) {
      const interval = setInterval(() => {
        setCurrentHintIndex((prev) => (prev + 1) % proHints.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [showProHint]);

  const currentHint = proHints[currentHintIndex];

  const sendMessage = () => {
    if (viewModel.userInput.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: viewModel.userInput,
        isUserMessage: true,
      };
      viewModel.messages.push(newMessage);
      viewModel.userInput = '';
      // Add AI response logic here
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      viewModel.selectedImage = result.assets[0].uri;
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      viewModel.selectedImage = result.assets[0].uri;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Handle sign out success
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderMessage = (message: Message) => {
    if (!message.id) return null;

    if (message.isUserMessage) {
        return (
            <View
                key={message.id}
                style={[
                    styles.messageContainer,
                    styles.userMessage,
                ]}
            >
                {message.image ? (
                    <View style={styles.userImageContainer}>
                        <Image 
                            source={{ uri: message.image }} 
                            style={styles.messageImage}
                            resizeMode="cover"
                        />
                        {message.content && (
                            <Text style={[styles.messageText, styles.userMessageText]}>
                                {message.content}
                            </Text>
                        )}
                    </View>
                ) : (
                    <Text style={[styles.messageText, styles.userMessageText]}>
                        {message.content}
                    </Text>
                )}
            </View>
        );
    } else {
        return (
            <View key={message.id} style={styles.botContent}>
                {message.content && (
                    <Markdown 
                        style={{
                            body: styles.botMessageText,
                            link: { color: '#0066CC', textDecorationLine: 'underline' },
                        }}
                    >
                        {message.content}
                    </Markdown>
                )}
                
                {message.youtubeUrls && message.youtubeUrls.length > 0 && (
                    <View style={styles.youtubeContainer}>
                        <Text style={styles.youtubeHeader}>Related YouTube Videos:</Text>
                        {message.youtubeUrls.map((videoData, index) => (
                            <YouTubePlayer 
                                key={index}
                                videoData={videoData}
                                title={`Video ${index + 1}`}
                            />
                        ))}
                    </View>
                )}
            </View>
        );
    }
  };

  // Simplified scroll effect
  useEffect(() => {
    if (viewModel.messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [viewModel.messages.length]);

  // Add this effect to automatically toggle prompts based on message count
  useEffect(() => {
    // If messages change from 0 to some, hide prompts
    if (viewModel.messages.length > 0 && showPrompts) {
      setShowPrompts(false);
    }
    
    // If all messages are cleared, show prompts
    if (viewModel.messages.length === 0 && !showPrompts) {
      setShowPrompts(true);
    }
  }, [viewModel.messages.length]);

  // Add this to handle clearing chat
  useEffect(() => {
    // Listen for chat clear events
    const disposer = reaction(
      () => viewModel.messages.length,
      (length, previousLength) => {
        // If messages were cleared (went from some to zero)
        if (previousLength > 0 && length === 0) {
          setShowPrompts(true);
        }
      }
    );
    
    return () => disposer();
  }, []);

  // Add this effect to clear chat when mode changes
  useEffect(() => {
    // Check if mode has changed
    if (previousModeRef.current !== viewModel.currentMode) {
      // Clear the chat
      viewModel.clearChat();
      
      // Show prompts when mode changes
      setShowPrompts(true);
      
      // Update the previous mode reference
      previousModeRef.current = viewModel.currentMode;
    }
  }, [viewModel.currentMode]);

  const handleModeChange = (mode: 'homie' | 'hackIt' | 'legit') => {
    viewModel.setCurrentMode(mode);
    setIsDropdownOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}
      >
        <MenuView
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          userID={userID ?? 'guest'}
        />
        
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Icon name="menu" size={24} color="#333" />
              {showProHint && (
                <View style={styles.proHintDot}>
                  <Icon name="star" size={8} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <Text style={styles.title}>EstateGPT</Text>
              <TouchableOpacity 
                style={styles.modeDropdown}
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Text style={styles.currentMode}>
                  {viewModel.currentMode === 'homie' ? 'Homie' : 
                   viewModel.currentMode === 'hackIt' ? 'HackIt' : 'Legit'}
                </Text>
                <Icon 
                  name={isDropdownOpen ? "chevron-up" : "chevron-down"} 
                  size={12} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.newChatButton}
              onPress={() => viewModel.clearChat()}
            >
              <Icon name="create-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Pro Hint Toast - moved directly under the header */}
          {showProHint && (
            <Animated.View style={styles.proHintToast}>
              <TouchableOpacity 
                style={styles.proHintContent}
                onPress={currentHint.action}
              >
                <Icon name={currentHint.icon} size={20} color="#555" />
                <Text style={styles.proHintText}>{currentHint.text}</Text>
                <TouchableOpacity 
                  onPress={() => setShowProHint(false)}
                  style={styles.proHintClose}
                >
                  <Icon name="close" size={16} color="#999" />
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Dropdown Menu - Outside the header */}
          {isDropdownOpen && (
            <>
              <TouchableOpacity 
                style={styles.dropdownOverlay}
                onPress={() => setIsDropdownOpen(false)}
                activeOpacity={1}
              />
              <View style={styles.dropdownMenu}>
                <TouchableOpacity 
                  style={styles.dropdownItem}
                  onPress={() => handleModeChange('homie')}
                >
                  <Text style={[
                    styles.dropdownText,
                    viewModel.currentMode === 'homie' && styles.dropdownTextActive
                  ]}>Homie</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.dropdownItem}
                  onPress={() => handleModeChange('hackIt')}
                >
                  <Text style={[
                    styles.dropdownText,
                    viewModel.currentMode === 'hackIt' && styles.dropdownTextActive
                  ]}>HackIt</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.dropdownItem}
                  onPress={() => handleModeChange('legit')}
                >
                  <Text style={[
                    styles.dropdownText,
                    viewModel.currentMode === 'legit' && styles.dropdownTextActive
                  ]}>Legit</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Chat content */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView 
              ref={scrollViewRef}
              style={styles.chatContainer}
              contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: 20,
              }}
              keyboardShouldPersistTaps="never"
              showsVerticalScrollIndicator={true}
            >
              {viewModel.messages.map(renderMessage)}
            </ScrollView>
          </TouchableWithoutFeedback>

          {/* Bottom Container */}
          <View style={styles.bottomContainer}>
            {viewModel.isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#333333" />
                <Text style={styles.loadingText}>Thinking...</Text>
              </View>
            )}
            
            {/* Selected Image Preview */}
            {viewModel.selectedImage && (
              <View style={styles.selectedImageContainer}>
                <Image 
                  source={{ uri: viewModel.selectedImage }} 
                  style={styles.selectedImage} 
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => viewModel.selectedImage = null}
                >
                  <Icon name="close-circle" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            )}

            {/* Prompts */}
            {showPrompts && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.promptsContainer}
              >
                {currentPrompts.map((prompt, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.promptButton}
                    onPress={() => viewModel.setUserInput(prompt)}
                  >
                    <Text style={styles.promptText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={styles.promptToggle}
                onPress={() => setShowPrompts(!showPrompts)}
              >
                <Icon name="bulb-outline" size={24} color="#333" />
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                value={viewModel.userInput}
                onChangeText={viewModel.setUserInput}
                placeholder={
                  viewModel.currentMode === 'homie'
                    ? "Ask anything about your home maintenance ..."
                    : viewModel.currentMode === 'hackIt'
                      ? "Ask about your diy tasks, and get vids, tools required, and step by step instructions"
                      : "Ask about your any property related legal questions ..."
                }
                multiline
              />

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.attachButton} 
                  onPress={() => {
                    Alert.alert(
                      'Upload Photo',
                      'Choose a method',
                      [
                        { text: 'Camera', onPress: takePhoto },
                        { text: 'Gallery', onPress: pickImage },
                        { text: 'Cancel', style: 'cancel' },
                      ]
                    );
                  }}
                >
                  <Icon name="image-outline" size={24} color="#333" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={() => viewModel.sendCombinedMessage()}
                >
                  <Icon name="arrow-up" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

