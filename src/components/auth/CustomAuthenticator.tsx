import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, StyleSheet, Image, Dimensions } from 'react-native';
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
import { LinearGradient } from 'expo-linear-gradient';

type RootStackParamList = {
  Chat: { userID: string | undefined };
  AboutUs: undefined;
  Feedback: undefined;
  Subscription: undefined;
  User: { userID: string };
  DeleteAccount: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const { width, height } = Dimensions.get('window');

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

// Custom loading component with animation
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <Image
      source={require('../../../assets/logo.png')}
      style={styles.loadingLogo}
      resizeMode="contain"
    />
    <ActivityIndicator size="large" color="#555555" style={styles.loadingIndicator} />
    <Text style={styles.loadingText}>Initializing your real estate copilot</Text>
  </View>
);

// Custom sign-in component wrapper
const CustomSignIn = (props: any) => (
  <View style={styles.authContainer}>
    <SignInHeader />
    <View style={styles.signInWrapper}>
      <Text style={styles.welcomeText}>Welcome back</Text>
      <Text style={styles.instructionText}>Sign in to continue</Text>
      
      <Authenticator.SignIn 
        {...props}
        style={styles.signInContainer}
      />
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  </View>
);

export const CustomAuthenticator = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Authenticator.Provider>
      <Authenticator 
        socialProviders={['apple', 'google']}
        components={{
          SignIn: CustomSignIn,
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
  loadingLogo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  loadingIndicator: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#555555',
    fontWeight: '500',
  },
  authContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  signInWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  signInContainer: {
    padding: 0,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
});