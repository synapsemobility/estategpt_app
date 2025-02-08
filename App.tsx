import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@aws-amplify/ui-react-native';
import { theme } from './src/theme';
import { CustomAuthenticator } from './src/components/auth/CustomAuthenticator';
import './src/config/amplify';
import { PurchaseManager, PurchaseManagerContext } from './src/services/PurchaseManager';

const App = () => {
  const purchaseManager = new PurchaseManager();
  
  return (
    <NavigationContainer>
      <ThemeProvider theme={theme}>
        <PurchaseManagerContext.Provider value={purchaseManager}>
          <CustomAuthenticator />
        </PurchaseManagerContext.Provider>
      </ThemeProvider>
    </NavigationContainer>
  );
};

export default App;