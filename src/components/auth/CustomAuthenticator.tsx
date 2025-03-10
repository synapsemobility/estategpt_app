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
import { CallProScreen } from '../screens/callpro/CallProScreen';
import { CallProConfirmationScreen } from '../screens/callpro/CallProConfirmationScreen';
import { ScheduledCallsScreen } from '../screens/callpro/ScheduledCallsScreen';
import { ProRequestsScreen } from '../screens/callpro/ProRequestsScreen';
import { VideoCallScreen } from '../screens/callpro/VideoCallScreen';
import { ProMeetingsScreen } from '../screens/callpro/ProMeetingsScreen'; 
import { ProProfileScreen } from '../screens/professional/ProProfileScreen';
import { BecomeProScreen } from '../screens/professional/BecomeProScreen';
import { UserAgreementModal, hasAcceptedUserAgreement } from './UserAgreementModal';
import { AddPaymentCardScreen } from '../screens/payment/AddPaymentCardScreen';
import { PaymentMethodsScreen } from '../screens/payment/PaymentMethodsScreen';
import ContactFounderScreen from '../screens/ContactFounderScreen';
import OnboardingScreen from './OnboardingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add Onboarding to the RootStackParamList
type RootStackParamList = {
  Chat: { userID: string | undefined };
  AboutUs: undefined;
  Feedback: undefined;
  Subscription: undefined;
  User: { userID: string };
  DeleteAccount: undefined;
  CallPro: undefined;
  ScheduledCalls: undefined;
  ProRequests: undefined;
  TestVideoCall: undefined;
  VideoCall: {
    meetingId: string;
    roomName: string;
    professionalName: string;
  };
  ProMeetings: undefined;
  ProProfile: undefined;
  BecomePro: undefined;
  AddPaymentCard: undefined;
  PaymentMethods: undefined;
  CallProConfirmation: undefined;
  ContactFounder: undefined;
  Onboarding: undefined; // Add this type definition
};

// Initialize the stack navigator with your route param list
const Stack = createNativeStackNavigator<RootStackParamList>();

// Helper function to check if user has completed onboarding
const hasCompletedOnboarding = async (userId: string): Promise<boolean> => {
  try {
    const onboardingStatus = await AsyncStorage.getItem(`onboarding_${userId}`);
    return onboardingStatus === 'completed';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

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
  const [showAgreement, setShowAgreement] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);
  
  useEffect(() => {
    // Check user agreement and onboarding status
    const checkUserStatus = async () => {
      const hasAccepted = await hasAcceptedUserAgreement();
      
      if (!hasAccepted) {
        setShowAgreement(true);
        setAgreementAccepted(false);
        return;
      }
      
      setAgreementAccepted(true);
      
      // Check if user has completed onboarding
      if (user?.username) {
        const completed = await hasCompletedOnboarding(user.username);
        setOnboardingComplete(completed);
        setInitialRoute(completed ? 'Chat' : 'Onboarding');
      }
    };
    
    checkUserStatus();
  }, [user?.username]);
  
  const handleAcceptAgreement = () => {
    setShowAgreement(false);
    setAgreementAccepted(true);
    
    // After agreement is accepted, check onboarding status
    if (user?.username) {
      hasCompletedOnboarding(user.username).then(completed => {
        setOnboardingComplete(completed);
        setInitialRoute(completed ? 'Chat' : 'Onboarding');
      });
    }
  };
  
  // If agreement hasn't been accepted yet, don't render the main app
  if (!agreementAccepted) {
    return (
      <View style={styles.loadingContainer}>
        <UserAgreementModal 
          isVisible={showAgreement}
          onAccept={handleAcceptAgreement}
        />
        {/* Show loading indicator if we're still checking agreement status */}
        {!showAgreement && (
          <>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.loadingLogo}
              resizeMode="contain"
            />
            <ActivityIndicator size="large" color="#555555" style={styles.loadingIndicator} />
            <Text style={styles.loadingText}>Preparing your experience...</Text>
          </>
        )}
      </View>
    );
  }
  
  // If we're still checking onboarding status, show loading
  if (initialRoute === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#555555" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' }
      }}
    >
      <Stack.Screen 
        name="Onboarding" 
        component={OnboardingScreen}
        options={{ 
          headerShown: false,
          gestureEnabled: false // Prevent swiping back during onboarding
        }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        initialParams={{ userID: user?.username }}
        options={{
          headerRight: () => <HeaderRight />
        }}
      />
      
      {/* Rest of your existing screens */}
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen 
        name="User" 
        component={UserScreen}
        initialParams={{ userID: user?.username }}
      />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
      <Stack.Screen name="CallPro" component={CallProScreen} />
      <Stack.Screen name="ScheduledCalls" component={ScheduledCallsScreen} />
      <Stack.Screen name="ProMeetings" component={ProMeetingsScreen} />
      <Stack.Screen name="ProRequests" component={ProRequestsScreen} />
      <Stack.Screen name="VideoCall" component={VideoCallScreen} />
      <Stack.Screen name="ProProfile" component={ProProfileScreen} />
      <Stack.Screen name="BecomePro" component={BecomeProScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="AddPaymentCard" component={AddPaymentCardScreen} />
      <Stack.Screen name="CallProConfirmation" component={CallProConfirmationScreen} />
      <Stack.Screen name="ContactFounder" component={ContactFounderScreen} />
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