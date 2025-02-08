import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const SignInHeader = () => (
  <View style={styles.container}>
    <LinearGradient
      colors={['#FFFFFF', '#FFFFFF']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContainer}>
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>EstateGPT</Text>
          <Text style={styles.subtitle}>Your Real Estate Copilot</Text>
        </View>
      </View>
    </LinearGradient>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  gradient: {
    width: '100%',
    padding: 0,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 24,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '500',
    color: '#1A1A1A',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#666666',
  },
});