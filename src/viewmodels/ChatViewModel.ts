import { makeAutoObservable, runInAction } from 'mobx';
import { ChatService } from '../services/ChatService';
import { Message, ChatMode, ChatState } from '../types/chat.types';
import * as ImagePicker from 'expo-image-picker';
import { ServerEnvironment } from '../config/server.config';

export class ChatViewModel {
  messages: Message[] = [];
  userInput: string = '';
  selectedImage: string | null = null;
  currentMode: ChatMode = 'homeCare';
  isLoading: boolean = false;
  imageCaption: string = '';
  
  private chatService: ChatService;
  private messageCounter: number = 0;
  private userID: string;

  constructor(userID: string) {
    makeAutoObservable(this);
    this.userID = userID;
    this.chatService = new ChatService(userID);
  }

  generateUniqueId(): string {
    return `${Date.now()}-${this.messageCounter++}`;
  }

  clearChat = async () => {
    this.messages = [];
    this.userInput = '';
    this.selectedImage = null;
    this.isLoading = false;
    await this.chatService.clearChat();
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

  private fetchTextResponse = async (input: string) => {
    this.isLoading = true;
    
    try {
      await this.chatService.fetchTextResponse(
        input,
        this.currentMode,
        (response) => {
          runInAction(() => {
            const lastMessage = this.messages[this.messages.length - 1];
            if (lastMessage && !lastMessage.isUserMessage) {
              lastMessage.content = response;
            }
            this.isLoading = false;
          });
        },
        (error) => {
          runInAction(() => {
            this.isLoading = false;
            this.messages.push({
              id: this.generateUniqueId(),
              content: `Error: ${error.message}`,
              isUserMessage: false,
            });
          });
        }
      );
    } catch (error) {
      console.error('Error in fetchTextResponse:', error);
      runInAction(() => {
        this.isLoading = false;
        if (this.messages[this.messages.length - 1]?.isUserMessage) {
          this.messages.push({
            id: this.generateUniqueId(),
            content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            isUserMessage: false,
          });
        }
      });
    }
  };

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