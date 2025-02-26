import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { menuItems } from './MenuItems';
import { MenuViewProps } from '../../types/menu.types';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { useAuthenticator } from '@aws-amplify/ui-react-native';

type RootStackParamList = {
  User: { userID: string };
  [key: string]: undefined | object;
};

export const MenuView: React.FC<MenuViewProps> = ({
  isMenuOpen,
  setIsMenuOpen,
  userID,
}) => {
  const { signOut } = useAuthenticator();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasNavigated = useRef(false);

  // Reset animation values when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Reset the navigation flag when screen is focused
      hasNavigated.current = false;
      
      // If menu was stuck, reset it
      if (!isMenuOpen) {
        slideAnim.setValue(-300);
        fadeAnim.setValue(0);
      }
      
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  useEffect(() => {
    // Only animate if we haven't just navigated
    if (!hasNavigated.current) {
      // Animate menu sliding
      Animated.timing(slideAnim, {
        toValue: isMenuOpen ? 0 : -300,
        duration: 250,
        useNativeDriver: true,
      }).start();
      
      // Animate overlay fading
      Animated.timing(fadeAnim, {
        toValue: isMenuOpen ? 0.5 : 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isMenuOpen]);

  const handleMenuItemPress = (route: string) => {
    // Set flag to prevent animation conflicts
    hasNavigated.current = true;
    
    // Close menu first for smoother transition
    setIsMenuOpen(false);
    
    // Manually reset animation values
    slideAnim.setValue(-300);
    fadeAnim.setValue(0);
    
    // Use setTimeout to ensure menu closes before navigation
    setTimeout(() => {
      if (route === 'SignOut') {
        signOut();
      } else if (route === 'User') {
        navigation.navigate('User', { userID: userID });
      } else {
        navigation.navigate(route as never);
      }
    }, 300);
  };

  // Don't render if menu is closed and fully off-screen
  if (!isMenuOpen && slideAnim._value === -300) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
            pointerEvents: isMenuOpen ? 'auto' : 'none',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={() => setIsMenuOpen(false)}
        />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.menuContainer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={styles.menuHeader}>
          <Text style={styles.menuTitle}>EstateGPT</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setIsMenuOpen(false)}
          >
            <Icon name="close" size={22} color="#555" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.menuContent}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                item.route === 'SignOut' && styles.signOutItem
              ]}
              onPress={() => handleMenuItemPress(item.route)}
            >
              <View style={styles.menuItemIconContainer}>
                <Icon
                  name={item.icon}
                  size={20}
                  color={item.route === 'SignOut' ? '#FF3B30' : '#555555'}
                />
              </View>
              <Text
                style={[
                  styles.menuItemText,
                  item.route === 'SignOut' && styles.signOutText
                ]}
              >
                {item.title}
              </Text>
              {item.route !== 'SignOut' && (
                <Icon
                  name="chevron-forward"
                  size={18}
                  color="#999"
                  style={styles.chevron}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.menuFooter}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 1000,
  },
  overlayTouch: {
    width: '100%',
    height: '100%',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '80%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    flexDirection: 'column',
  },
  menuHeader: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EBEBEB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  menuContent: {
    flex: 1,
    paddingTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  menuItemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  signOutItem: {
    marginTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EBEBEB',
    paddingTop: 20,
  },
  signOutText: {
    color: '#FF3B30',
  },
  chevron: {
    marginLeft: 8,
  },
  menuFooter: {
    padding: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EBEBEB',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  }
});
