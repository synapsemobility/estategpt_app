import { ImagePickerAsset } from 'expo-image-picker';

export type ChatMode = 'homie' | 'hackIt' | 'legit';

// YouTube data comes as [url, publishedDate, views, likes]
type YouTubeVideoData = [string, string, number, number];

export interface Message {
  id: string;
  content: string;
  isUserMessage: boolean;
  image?: string;
  isStreaming?: boolean;
  youtubeUrls?: YouTubeVideoData[];
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

interface ChatResponse {
  type: string;
  llm_response: string;
  youtube_url_list?: string[];
} 