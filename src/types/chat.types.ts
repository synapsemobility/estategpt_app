import { ImagePickerAsset } from 'expo-image-picker';

export type ChatMode = 'homeCare' | 'legalCare';

export interface Message {
  id: string;
  content?: string;
  image?: string;
  isUserMessage: boolean;
  isStreaming?: boolean;
}

export interface ChatState {
  messages: Message[];
  userInput: string;
  selectedImage: string | null;
  currentMode: ChatMode;
  isLoading: boolean;
  imageCaption: string;
  currentStreamingMessage: string;
}

export interface ServerConfig {
  baseURL: string;
  chatEndpoint: string;
  clearHistoryEndpoint: string;
} 