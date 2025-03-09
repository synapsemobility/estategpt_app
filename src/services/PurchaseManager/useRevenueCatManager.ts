import React, { createContext, useContext, ReactNode } from 'react';
import { RevenueCatManager } from './RevenueCatManager';

// Create a singleton instance
const revenueCatManager = new RevenueCatManager();

// Create a React context
const RevenueCatContext = createContext<RevenueCatManager | undefined>(undefined);

// Provider component with proper TypeScript typing
interface RevenueCatProviderProps {
  children: ReactNode;
}

// Use React.createElement instead of JSX to avoid parsing issues
export const RevenueCatProvider: React.FC<RevenueCatProviderProps> = ({ children }) => {
  return React.createElement(
    RevenueCatContext.Provider,
    { value: revenueCatManager },
    children
  );
};

// Hook to use the RevenueCat manager
export const useRevenueCatManager = () => {
  const context = useContext(RevenueCatContext);
  if (context === undefined) {
    throw new Error('useRevenueCatManager must be used within a RevenueCatProvider');
  }
  return context;
};