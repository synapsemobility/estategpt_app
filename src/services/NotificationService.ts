import messaging from '@react-native-firebase/messaging';
import { getApps, initializeApp, getApp } from '@react-native-firebase/app';
import { PermissionsAndroid, Platform } from 'react-native';
import { ServerEnvironment } from '../config/server.config';
import { getCurrentUser } from '@aws-amplify/auth';

export class NotificationService {
  static async initialize() {
    try {
      // Initialize Firebase if not already initialized
      if (getApps().length === 0) {
        const iosConfig = {
          apiKey: "AIzaSyBI5w9OX4UsHO7g7Ju1WIfUjHMss_QW0DM",
          appId: "1:840434256626:ios:2320158202e3130a735e6b",
          projectId: "estategpt-ea400",
          storageBucket: "estategpt-ea400.firebasestorage.app",
          messagingSenderId: "840434256626",
          // Make sure this matches your GoogleService-Info.plist
          iosBundleId: "com.synapsemobility.synapse-v1",
          databaseURL: `https://estategpt-ea400.firebaseio.com`
        };

        await initializeApp(iosConfig);
      }

      // Request permissions based on platform
      if (Platform.OS === 'ios') {
        await this.requestIOSPermission();
      } else {
        await this.requestAndroidPermission();
      }

      // Get and send token
      await this.setupFcmToken();

      // Setup token refresh listener
      this.setupTokenRefreshListener();
      
      console.log(`🔔 Initialized notifications for ${Platform.OS}`);
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  private static async requestIOSPermission() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled = 
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('🔔 iOS notification permission enabled');
      }
    } catch (error) {
      console.error('❌ Error requesting iOS notification permission:', error);
    }
  }

  private static async requestAndroidPermission() {
    try {
      if (Platform.Version >= 33) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
      }
      console.log('🔔 Android notification permission enabled');
    } catch (error) {
      console.error('❌ Error requesting Android notification permission:', error);
    }
  }

  private static async setupFcmToken() {
    try {
      const token = await messaging().getToken();
      console.log(`🔔 ${Platform.OS} FCM Token:`, token.substring(0, 20) + '...');
      await this.sendTokenToServer(token);
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
    }
  }

  private static setupTokenRefreshListener() {
    messaging().onTokenRefresh(async (token) => {
      console.log(`🔔 ${Platform.OS} FCM Token refreshed:`, token.substring(0, 20) + '...');
      await this.sendTokenToServer(token);
    });
  }

  private static async sendTokenToServer(token: string) {
    try {
      const user = await getCurrentUser();
      
      const response = await fetch(ServerEnvironment.updateFcmTokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user.userId
        },
        body: JSON.stringify({
          fcm_token: token,
          device_type: Platform.OS,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update FCM token on server');
      }

      console.log(`✅ ${Platform.OS} FCM token sent to server`);
    } catch (error) {
      console.error('❌ Error sending FCM token to server:', error);
    }
  }
}