import { ServerEnvironment } from '../config/server.config';

export interface Meeting {
  meeting_id: string;
  room_name: string;
  participant_name: string;
  scheduled_time: string;
  meeting_type: 'video' | 'audio' | 'chat';
}

/**
 * Service for managing video call meetings
 */
export const MeetingService = {
  /**
   * Create a new meeting with another user
   * 
   * @param participantId - The ID of the other participant
   * @param scheduledTime - ISO string of when the meeting should occur
   * @param meetingType - The type of meeting
   * @returns Promise with the meeting details
   */
  createMeeting: async (
    participantId: string, 
    scheduledTime: string,
    meetingType: 'video' | 'audio' | 'chat' = 'video'
  ): Promise<{ meeting_id: string; room_name: string; scheduled_time: string }> => {
    try {
      // The identity is used for Authorization
      const identity = await getCurrentUserIdentity();
      
      const response = await fetch(`${ServerEnvironment.baseURL}/video/meeting`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': identity
        },
        body: JSON.stringify({
          participant_id: participantId,
          scheduled_time: scheduledTime,
          meeting_type: meetingType
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  },

  /**
   * Get all scheduled meetings for the current user
   * 
   * @returns Promise with array of meetings
   */
  getUserMeetings: async (): Promise<Meeting[]> => {
    try {
      // The identity is used for Authorization
      const identity = await getCurrentUserIdentity();
      
      const response = await fetch(`${ServerEnvironment.baseURL}/video/meetings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': identity
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.meetings;
    } catch (error) {
      console.error('Error fetching meetings:', error);
      throw error;
    }
  }
};

// Helper function to get current user identity
// Replace with your actual authentication method
async function getCurrentUserIdentity(): Promise<string> {
  try {
    // Example using AWS Amplify Auth
    // const { username } = await Auth.currentAuthenticatedUser();
    // return username;
    
    // For now, we'll return a placeholder
    return 'current-user-id';
  } catch (error) {
    console.error('Error getting user identity:', error);
    return 'anonymous-user';
  }
}
