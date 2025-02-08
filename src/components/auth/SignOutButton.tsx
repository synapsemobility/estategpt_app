import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import Icon from '@expo/vector-icons/Ionicons';

export const SignOutButton = () => {
  const { signOut: authSignOut } = useAuthenticator();

  const handleSignOut = async () => {
    try {
      await authSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.signOutButton} 
      onPress={handleSignOut}
    >
      <Icon name="log-out-outline" size={20} color="#FF4D37" />
      <Text style={styles.signOutText}>Sign Out</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  signOutText: {
    marginLeft: 8,
    color: '#FF4D37',
    fontSize: 16,
    fontWeight: '600',
  },
});