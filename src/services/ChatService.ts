import { ServerEnvironment } from '../config/server.config';
import { Message, ChatMode } from '../types/chat.types';
import * as ImageManipulator from 'expo-image-manipulator';

export class ChatService {
  private userID: string;
  private controller: AbortController | null = null;

  constructor(userID: string) {
    this.userID = userID;
  }

  async clearChat(): Promise<boolean> {
    try {
      const response = await fetch(ServerEnvironment.clearHistoryEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.userID
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Error clearing chat:', error);
      return false;
    }
  }

  async fetchTextResponse(
    input: string, 
    mode: ChatMode,
    onSuccess: (response: string, youtubeUrls?: string[]) => void,
    onError: (error: Error) => void
  ) {
    try {
      const response = await fetch(ServerEnvironment.chatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.userID,
        },
        body: JSON.stringify({
          message: input,
          mode: mode
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.type === 'text') {
        onSuccess(data.llm_response, data.youtube_url_list);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      onError(error as Error);
    }
  }

  async uploadImage(
    imageUri: string,
    caption: string,
    mode: ChatMode,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ) {
    try {
      // Resize image using ImageManipulator
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 640 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const formData = new FormData();
      formData.append('image', {
        uri: manipResult.uri,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);

      if (caption) {
        formData.append('caption', caption);
      }
      formData.append('mode', mode);

      const response = await fetch(ServerEnvironment.chatEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': this.userID,
          'Accept': 'application/json',
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.type === 'text' && data.llm_response) {
        onChunk(data.llm_response);
        onComplete();
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error in uploadImage:', error);
      onError(error as Error);
    }
  }
}    