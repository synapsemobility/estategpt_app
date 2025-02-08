import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react-native';
import { NativeStackScreenProps, createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from '@expo/vector-icons/Ionicons';
import { ChatScreen } from '../screens/ChatScreen';
import { AboutUsScreen } from '../screens/about/AboutUsScreen';
import { FeedbackScreen } from '../screens/feedback/FeedbackScreen';
import { SubscriptionScreen } from '../screens/subscription/SubscriptionScreen';
import { UserScreen } from '../screens/account/UserScreen';
import { DeleteAccountScreen } from '../screens/account/DeleteAccountScreen';
import { SignInHeader } from './SignInHeader';

type RootStackParamList = {
  Chat: { userID: string | undefined };
  AboutUs: undefined;
  Feedback: undefined;
  Subscription: undefined;
  User: { userID: string };
  DeleteAccount: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Create a separate header right component
const HeaderRight = () => {
  const { signOut } = useAuthenticator();
  
  return (
    <TouchableOpacity 
      onPress={signOut}
      style={{ marginRight: 15 }}
    >
      <Icon name="log-out-outline" size={24} color="#000" />
    </TouchableOpacity>
  );
};

const AppContent = () => {
  const { user } = useAuthenticator();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' }
      }}
    >
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        initialParams={{ userID: user?.username }}
        options={{
          headerRight: () => <HeaderRight />
        }}
      />
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen 
        name="User" 
        component={UserScreen}
        initialParams={{ userID: user?.username }}
      />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
    </Stack.Navigator>
  );
};

export const CustomAuthenticator = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4D37" />
        <Text style={styles.loadingText}>Initializing real estate copilot</Text>
      </View>
    );
  }

  return (
    <Authenticator.Provider>
      <Authenticator socialProviders={['google']}
        components={{
          SignIn: (props) => (
            <View style={styles.authContainer}>
              <SignInHeader />
              <Authenticator.SignIn 
                {...props}
                style={styles.signInContainer}
              />
            </View>
          ),
        }}
      >
        <AppContent />
      </Authenticator>
    </Authenticator.Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    gap: 16,
  },
  authContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  signInContainer: {
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
});