/**
 * Service for Twilio Video call functionality
 */
import { ServerEnvironment } from '../config/server.config';

interface RoomStatusResponse {
  hasParticipants: boolean;
  participantCount?: number;
  roomExists?: boolean;
  error?: string;
}

export class TwilioService {
  /**
   * Get a Twilio access token for video calls
   * 
   * @param meetingId - The ID of the meeting to join (will be used to create room name)
   * @param identity - The identity of the participant (used for Authorization header)
   * @returns Promise with the token string
   */
  static async getToken(meetingId: string, identity: string): Promise<string> {
    try {
      console.log(`Requesting token for meeting: ${meetingId}, identity: ${identity}`);
      
      // Use the endpoint from server config with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      // Log the endpoint being called
      console.log('Calling video token endpoint:', ServerEnvironment.getVideoToken);
      
      const response = await fetch(ServerEnvironment.getVideoToken, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': identity, // Your backend uses this header for user identification
        },
        body: JSON.stringify({
          meetingId: meetingId, // Changed from meeting_id to meetingId to match backend expectation
          identity: identity    // Also sending identity in the body for clarity
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        // Log full error response for debugging
        console.error('Token response error:', response.status, errorText);
        
        // For 500 errors specifically related to the decode issue
        if (response.status === 500 && errorText.includes("'str' object has no attribute 'decode'")) {
          console.log('Detected backend decode error - please fix backend to remove .decode() from token.to_jwt()');
          throw new Error('Server configuration issue. Please contact support.');
        }
        
        throw new Error(`HTTP error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Video token response:', data);
      
      if (!data.token) {
        throw new Error('No token returned from server');
      }
      
      // Return just the token string as expected by the component
      return data.token;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your internet connection and try again.');
      }
      console.error('Error fetching Twilio token:', error);
      throw error;
    }
  }

  static async checkRoomStatus(meetingId: string): Promise<RoomStatusResponse> {
    try {
      const response = await fetch(ServerEnvironment.checkRoomStatusEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'user_auth_token' // Replace with actual auth token
        },
        body: JSON.stringify({ meetingId }),
      });

      // Even if status is not 200, we want to parse the response
      // as our backend is designed to return error details in the JSON
      const data = await response.json();
      
      if (!response.ok && response.status !== 200) {
        console.warn('Room status check returned non-200 status:', response.status);
        return { 
          hasParticipants: false,
          roomExists: false, 
          error: data.error || 'Server error' 
        };
      }

      // The API may return errors even with 200 status
      if (data.error) {
        console.warn('Room status check returned error:', data.error);
      }

      return {
        hasParticipants: Boolean(data.hasParticipants),
        participantCount: data.participantCount || 0,
        roomExists: data.roomExists !== false, // Default to true if not specified
        error: data.error
      };
    } catch (error) {
      console.error('Error checking room status:', error);
      return { 
        hasParticipants: false,
        roomExists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
