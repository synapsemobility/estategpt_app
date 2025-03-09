import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { Amplify } from 'aws-amplify';
import awsconfig from './src/aws-exports';
import { Authenticator, ThemeProvider } from '@aws-amplify/ui-react-native';
import { theme } from './src/theme';
import { CustomAuthenticator } from './src/components/auth/CustomAuthenticator';
import './src/config/amplify';
import { PurchaseManager, PurchaseManagerContext } from './src/services/PurchaseManager';
import { NotificationService } from './src/services/NotificationService';
import { ProStatusProvider } from './src/contexts/ProStatusContext';
import { RevenueCatProvider } from './src/services/PurchaseManager/useRevenueCatManager';

// Configure Amplify
Amplify.configure(awsconfig);

const App = () => {
  const purchaseManager = new PurchaseManager();
  
  useEffect(() => {
    NotificationService.initialize();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ThemeProvider theme={theme}>
          <Authenticator.Provider>
            <PurchaseManagerContext.Provider value={purchaseManager}>
              <ProStatusProvider>
                <RevenueCatProvider>
                  <CustomAuthenticator />
                </RevenueCatProvider>
              </ProStatusProvider>
            </PurchaseManagerContext.Provider>
          </Authenticator.Provider>
        </ThemeProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;