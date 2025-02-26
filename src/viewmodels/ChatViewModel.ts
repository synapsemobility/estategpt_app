import { makeAutoObservable, runInAction, action } from 'mobx';
import { ChatService } from '../services/ChatService';
import { Message, ChatMode, ChatState } from '../types/chat.types';
import * as ImagePicker from 'expo-image-picker';
import { ServerEnvironment } from '../config/server.config';
import { getCurrentUser } from '@aws-amplify/auth';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export class ChatViewModel {
  messages: Message[] = [];
  userInput: string = '';
  selectedImage: string | null = null;
  currentMode: ChatMode = 'homie';
  isLoading: boolean = false;
  imageCaption: string = '';
  currentStreamingMessage: string = '';
  userId: string = '';
  
  private chatService: ChatService;
  private messageCounter: number = 0;

  constructor(userID: string) {
    makeAutoObservable(this);
    this.userId = userID;
    this.chatService = new ChatService(userID);
    this.currentMode = 'homie';
  }

  private async initializeUser() {
    try {
      const user = await getCurrentUser();
      runInAction(() => {
        this.userId = user.userId;
        this.chatService = new ChatService(user.userId);
      });
    } catch (error) {
      Alert.alert(
        'Authentication Error',
        'Please sign in to continue',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Navigate to auth screen or handle as needed
              this.handleAuthError();
            }
          }
        ]
      );
    }
  }

  private handleAuthError() {
    // Add your auth error handling logic here
    // For example, clear local data and redirect to login
    this.messages = [];
    this.userInput = '';
    this.selectedImage = null;
    // You might want to trigger a navigation or auth flow here
  }

  generateUniqueId(): string {
    return `${Date.now()}-${this.messageCounter++}`;
  }

  clearChat = () => {
    runInAction(() => {
      this.messages = [];
      this.isLoading = false;
      this.userInput = '';
      this.selectedImage = null;
    });
  };

  sendCombinedMessage = async () => {
    // Allow sending if there's either text or image
    if (!this.userInput.trim() && !this.selectedImage) return;
    
    const input = this.userInput.trim();
    const currentImage = this.selectedImage;
    
    // Add user message immediately
    const userMessage: Message = {
      id: this.generateUniqueId(),
      content: input,
      isUserMessage: true,
      image: currentImage || undefined
    };
    
    // Add placeholder for AI response
    const aiMessage: Message = {
      id: this.generateUniqueId(),
      content: '',
      isUserMessage: false,
    };
    
    runInAction(() => {
      this.messages.push(userMessage);
      this.messages.push(aiMessage);
      this.userInput = '';
      this.selectedImage = null;
    });
    
    try {
      this.isLoading = true;
      // Always use uploadImage if there's an image, regardless of text
      if (currentImage) {
        await this.uploadImage(currentImage, input || '');
      } else {
        await this.fetchTextResponse(input);
      }
    } catch (error) {
      console.error('Error in sendCombinedMessage:', error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      runInAction(() => {
        this.selectedImage = result.assets[0].uri;
      });
    }
  };

  takePhoto = async () => {
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
      runInAction(() => {
        this.selectedImage = result.assets[0].uri;
      });
    }
  };

  private uploadImage = async (imageUri: string, caption: string) => {
    this.isLoading = true;
    
    // Add placeholder message for streaming
    const placeholderMessage: Message = {
      id: this.generateUniqueId(),
      content: '',
      isUserMessage: false,
    };
    this.messages.push(placeholderMessage);

    try {
      await this.chatService.uploadImage(
        imageUri,
        caption,
        this.currentMode,
        (chunk) => {
          runInAction(() => {
            const lastIndex = this.messages.length - 1;
            if (lastIndex >= 0) {
              this.messages[lastIndex].content = chunk;
            }
          });
        },
        () => {
          runInAction(() => {
            this.isLoading = false;
          });
        },
        (error) => {
          runInAction(() => {
            this.isLoading = false;
            this.messages.push({
              id: this.generateUniqueId(),
              content: 'Server Error',
              isUserMessage: false,
            });
          });
        }
      );
    } catch (error) {
      console.error('Error in uploadImage:', error);
    }
  };

  @action
  private async fetchTextResponse(input: string) {
    this.isLoading = true;
    
    try {
        await this.chatService.fetchTextResponse(
            input,
            this.currentMode,
            action("updateMessages", (response, youtubeUrls) => {
                // Create a single message with both response and YouTube URLs
                const message = {
                    id: Date.now().toString(),
                    content: response,
                    isUserMessage: false,
                    youtubeUrls: youtubeUrls
                };
                
                // Push only one message containing both text and videos
                this.messages.push(message);
            }),
            (error) => {
                console.error('Error:', error);
            }
        );
    } catch (error) {
        console.error('Error in fetchTextResponse:', error);
    } finally {
        runInAction(() => {
            this.isLoading = false;
        });
    }
  }

  setCurrentMode = (mode: ChatMode) => {
    this.currentMode = mode;
  };

  setUserInput = (input: string) => {
    this.userInput = input;
  };

  setImageCaption = (caption: string) => {
    this.imageCaption = caption;
  };
} 