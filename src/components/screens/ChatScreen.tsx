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

export type RootStackParamList = {
  Chat: {
    userID: string | undefined;
  };
  // Add other screens here
};

export type ChatScreenProps = NativeStackScreenProps<RootStackParamList, 'Chat'>;

type ChatMode = 'homeCare' | 'legalCare';

export const ChatScreen: React.FC<ChatScreenProps> = observer(({ route }) => {
  const { userID } = route.params;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const viewModel = React.useRef(new ChatViewModel(userID ?? 'guest')).current;
  const [showPrompts, setShowPrompts] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const { signOut } = useAuthenticator();

  // State for scroll management
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);

  const homeCarePrompts = [
    "How to fix leaky faucet - DIY",
    "Find me nearby handyman available this weekend",
    "Need kitchen remodel quotes for single family",
    "Lifetime cost of different HVAC systems"
  ];

  const legalCarePrompts = [
    "Handling property tax assessments?",
    "Tax credits for energy-efficient homes?",
    "Claiming home office on taxes?",
    "Explain title insurance requirements"
  ];

  const currentPrompts = viewModel.currentMode === 'homeCare' ? homeCarePrompts : legalCarePrompts;

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
    if (!message.id || (!message.content && !message.image)) {
      return null;
    }

    if (message.image && !message.content) {
      return (
        <View
          key={message.id}
          style={[
            styles.imageOnlyContainer,
            message.isUserMessage ? styles.userImageAlign : styles.botImageAlign
          ]}
        >
          <Image
            source={{ uri: message.image }}
            style={styles.messageImage}
            resizeMode="contain"
          />
        </View>
      );
    }

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          message.isUserMessage ? styles.userMessage : styles.botMessage,
          message.isStreaming && styles.streamingMessage,
        ]}
      >
        {message.image && message.content && (
          <Image
            source={{ uri: message.image }}
            style={styles.messageImage}
            resizeMode="contain"
          />
        )}
        {message.content && (
          message.isUserMessage ? (
            <Text style={[styles.messageText, styles.userMessageText]}>
              {message.content}
            </Text>
          ) : (
            <Markdown 
              style={{
                body: [styles.messageText, styles.botMessageText],
                strong: { fontWeight: 'bold' },
                em: { fontStyle: 'italic' },
                link: { color: '#0066CC' },
                list: { marginBottom: 8 },
                listItem: { marginBottom: 4 },
              }}
            >
              {message.content}
            </Markdown>
          )
        )}
      </View>
    );
  };

  // Simplified scroll effect
  useEffect(() => {
    if (viewModel.messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [viewModel.messages.length]);

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
            </TouchableOpacity>
            
            <Text style={styles.title}>EstateGPT</Text>
            
            <TouchableOpacity 
              style={styles.newChatButton}
              onPress={() => viewModel.clearChat()}
            >
              <Icon name="create-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Mode Toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity 
              style={[
                styles.modeButton, 
                viewModel.currentMode === 'homeCare' && styles.modeButtonActive
              ]}
              onPress={() => viewModel.setCurrentMode('homeCare')}
            >
              <Text style={[
                styles.modeButtonText,
                viewModel.currentMode === 'homeCare' && styles.modeButtonTextActive
              ]}>Home Care</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.modeButton, 
                viewModel.currentMode === 'legalCare' && styles.modeButtonActive
              ]}
              onPress={() => viewModel.setCurrentMode('legalCare')}
            >
              <Text style={[
                styles.modeButtonText,
                viewModel.currentMode === 'legalCare' && styles.modeButtonTextActive
              ]}>Legal Care</Text>
            </TouchableOpacity>
          </View>

          {/* Wrap ScrollView in TouchableWithoutFeedback for keyboard dismiss */}
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
                {viewModel.currentMode === 'homeCare' ? homeCarePrompts.map((prompt, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.promptButton}
                    onPress={() => viewModel.setUserInput(prompt)}
                  >
                    <Text style={styles.promptText}>{prompt}</Text>
                  </TouchableOpacity>
                )) : legalCarePrompts.map((prompt, index) => (
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
                  viewModel.currentMode === 'homeCare'
                    ? "Describe home issues or upload photos for estimates"
                    : "Ask about contracts, laws, or legal documents"
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
