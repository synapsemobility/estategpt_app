import { API } from 'aws-amplify';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ServerEnvironment } from '../config/server.config';

type OnboardingData = {
  userId: string;
  fullName?: string;
  location?: string;
  yearsOwnership?: string;
  propertyCount?: string;
  propertyAge?: string;
  maintenanceBudget?: string;
  issuesCount?: string;
  [key: string]: any;
};

export const OnboardingService = {
  /**
   * Check if a user has completed onboarding
   */
  hasCompletedOnboarding: async (userId: string): Promise<boolean> => {
    try {
      const onboardingStatus = await AsyncStorage.getItem(`onboarding_${userId}`);
      return onboardingStatus === 'completed';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },
  
  /**
   * Save onboarding data to backend and mark as completed
   */
  saveOnboardingData: async (data: OnboardingData): Promise<void> => {
    try {
      // Send data to backend API using fetch
      const response = await fetch(ServerEnvironment.onboarding.saveUserProfile, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save onboarding data');
      }

      // Log the success
      console.log('Onboarding data saved successfully to backend:', data);
      
      // Mark onboarding as complete locally
      await AsyncStorage.setItem(`onboarding_${data.userId}`, 'completed');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      throw error;
    }
  },
  
  /**
   * Reset onboarding status (for testing)
   */
  resetOnboardingStatus: async (userId: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(`onboarding_${userId}`);
    } catch (error) {
      console.error('Error resetting onboarding status:', error);
    }
  }
};