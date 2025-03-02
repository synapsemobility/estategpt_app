/**
 * Video Call Service
 * 
 * This service is now deprecated in favor of the new TwilioService.
 * Please update any imports to use TwilioService instead.
 */

import { TwilioService } from './TwilioService';

export const VideoCallService = {
  /**
   * @deprecated Use TwilioService.getToken instead
   */
  getToken: async (meetingId: string, identity: string): Promise<string> => {
    console.warn('VideoCallService is deprecated. Please use TwilioService instead.');
    return TwilioService.getToken(meetingId, identity);
  }
};