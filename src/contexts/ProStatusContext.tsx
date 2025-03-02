import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { getCurrentUser } from '@aws-amplify/auth';
import { ServerEnvironment } from '../config/server.config';

interface ProStatusContextType {
  isProfessional: boolean;
  isLoading: boolean;
  checkProStatus: () => Promise<void>;
  becomePro: (proData: ProApplicationData) => Promise<boolean>;
}

interface ProApplicationData {
  name: string;
  expertise: string;
  experience: string;
  services: string[];
  description: string;
  phone: string;
  email: string;
}

const ProStatusContext = createContext<ProStatusContextType>({
  isProfessional: false,
  isLoading: true,
  checkProStatus: async () => {},
  becomePro: async () => false,
});

export const useProStatus = () => useContext(ProStatusContext);

export const ProStatusProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isProfessional, setIsProfessional] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkProStatus = async () => {
    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      
      const response = await fetch(ServerEnvironment.checkProStatusEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user.userId,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check professional status');
      }

      const data = await response.json();
      setIsProfessional(data.isProfessional || false);
    } catch (error) {
      console.error('Error checking professional status:', error);
      // Default to false if there's an error
      setIsProfessional(false);
    } finally {
      setIsLoading(false);
    }
  };

  const becomePro = async (proData: ProApplicationData): Promise<boolean> => {
    try {
      const user = await getCurrentUser();
      
      const response = await fetch(ServerEnvironment.becomeProEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user.userId,
        },
        body: JSON.stringify(proData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit professional application');
      }

      const data = await response.json();
      
      if (data.success) {
        setIsProfessional(true);
        return true;
      } else {
        Alert.alert('Error', data.message || 'Failed to become a professional');
        return false;
      }
    } catch (error) {
      console.error('Error submitting professional application:', error);
      Alert.alert('Error', 'Failed to submit your application. Please try again.');
      return false;
    }
  };

  useEffect(() => {
    checkProStatus();
  }, []);

  return (
    <ProStatusContext.Provider value={{ isProfessional, isLoading, checkProStatus, becomePro }}>
      {children}
    </ProStatusContext.Provider>
  );
};
