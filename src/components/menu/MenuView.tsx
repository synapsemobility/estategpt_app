import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { getMenuItems } from './MenuItems';
import { MenuViewProps } from '../../types/menu.types';
import { useNavigation, NavigationProp, useFocusEffect, CommonActions } from '@react-navigation/native';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import { useProStatus } from '../../contexts/ProStatusContext';

const { width, height } = Dimensions.get('window');
const MENU_WIDTH = Math.min(width * 0.85, 320);

// Define consistent colors to match app theme
const COLORS = {
  primary: '#333333',
  primaryDark: '#222222',
  accent: '#333333',
  background: '#FFFFFF',
  text: '#333333',
  textSecondary: '#777777',
  border: '#EEEEEE',
  error: '#E74C3C',
};

type RootStackParamList = {
  User: { userID: string };
  [key: string]: undefined | object;
};

export const MenuView: React.FC<MenuViewProps> = ({
  isMenuOpen,
  setIsMenuOpen,
  userID,
}) => {
  const { signOut, user } = useAuthenticator();
  const { isProfessional } = useProStatus();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hasNavigated = useRef(false);
  const [isFullyClosed, setIsFullyClosed] = useState(true);
  const [userName, setUserName] = useState<string>('User');
  const [userEmail, setUserEmail] = useState<string>('');
  
  // Get dynamic menu items based on professional status
  const menuItems = getMenuItems(isProfessional);
  
  // Group menu items by category
  const groupedItems = {
    main: menuItems.filter(item => 
      !['SignOut', 'DeleteAccount', 'User', 'Subscription', 'Feedback', 'ContactFounder'].includes(item.route)
    ),
    account: menuItems.filter(item => 
      ['User', 'Subscription', 'Feedback', 'ContactFounder'].includes(item.route)
    ),
    danger: menuItems.filter(item => 
      ['DeleteAccount', 'SignOut'].includes(item.route)
    )
  };

  // Extract user info on component mount
  useEffect(() => {
    try {
      if (user && user.username) {
        const email = user.signInDetails?.loginId || '';
        const name = user.attributes?.name || email.split('@')[0] || 'User';
        
        setUserName(name);
        setUserEmail(email);
      }
    } catch (error) {
      console.log('Error setting user details:', error);
    }
  }, [user]);

  // Reset animation values when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      hasNavigated.current = false;
      if (!isMenuOpen) {
        slideAnim.setValue(-MENU_WIDTH);
        fadeAnim.setValue(0);
        setIsFullyClosed(true);
      }
    }, [])
  );

  useEffect(() => {
    if (!hasNavigated.current) {
      const animations = [
        Animated.timing(slideAnim, {
          toValue: isMenuOpen ? 0 : -MENU_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: isMenuOpen ? 0.6 : 0,
          duration: 300,
          useNativeDriver: true,
        })
      ];

      Animated.parallel(animations).start(({ finished }) => {
        if (finished && !isMenuOpen) {
          setIsFullyClosed(true);
        }
      });

      if (isMenuOpen) {
        setIsFullyClosed(false);
      }
    }
  }, [isMenuOpen]);

  const handleMenuItemPress = (route: string) => {
    // Close the menu first
    setIsMenuOpen(false);
    
    if (route === 'SignOut') {
      // Handle sign out logic
      signOut();
      return;
    }
    
    // For debugging - log the available routes
    console.log('Available routes:', navigation.getState().routeNames);
    
    // Use a more direct navigation approach with CommonActions
    setTimeout(() => {
      try {
        navigation.dispatch(
          CommonActions.navigate({
            name: route
          })
        );
      } catch (error) {
        console.error('Navigation error:', error);
        Alert.alert(
          'Navigation Error',
          `Could not navigate to ${route}. Please try again.`
        );
      }
    }, 300);
  };

  // Don't render if menu is fully closed
  if (isFullyClosed && !isMenuOpen) {
    return null;
  }

  const renderMenuItem = (item: typeof menuItems[0], index: number) => {
    const isDangerItem = ['SignOut', 'DeleteAccount'].includes(item.route);
    
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.menuItem,
          isDangerItem && styles.dangerItem
        ]}
        onPress={() => handleMenuItemPress(item.route)}
        activeOpacity={0.7}
      >
        <Icon
          name={item.icon}
          size={20}
          color={isDangerItem ? COLORS.error : COLORS.text}
          style={styles.menuItemIcon}
        />
        <Text
          style={[
            styles.menuItemText,
            isDangerItem && styles.dangerText
          ]}
        >
          {item.title}
        </Text>
        {!isDangerItem && (
          <Icon
            name="chevron-forward"
            size={16}
            color="#CCCCCC"
            style={styles.chevron}
          />
        )}
      </TouchableOpacity>
    );
  };

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
            width: MENU_WIDTH,
          },
        ]}
      >
        {/* Menu Header */}
        <View style={styles.menuHeader}>
          <View style={styles.menuHeaderContent}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{userName?.[0]?.toUpperCase() || 'U'}</Text>
            </View>
            
            <View style={styles.userInfoContainer}>
              <Text style={styles.userName}>{userName}</Text>
              {userEmail && <Text style={styles.userEmail}>{userEmail}</Text>}
              {isProfessional && (
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              )}
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setIsMenuOpen(false)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Menu Content */}
        <ScrollView 
          style={styles.menuContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Main Actions */}
          <View style={styles.section}>
            {groupedItems.main.map((item, index) => renderMenuItem(item, index))}
          </View>
          
          {/* Account Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACCOUNT</Text>
            {groupedItems.account.map((item, index) => renderMenuItem(item, index))}
          </View>
          
          {/* Danger Zone */}
          <View style={[styles.section, styles.dangerSection]}>
            {groupedItems.danger.map((item, index) => renderMenuItem(item, index))}
          </View>
        </ScrollView>
        
        {/* Menu Footer */}
        <View style={styles.menuFooter}>
          <Image 
            source={require('../../../assets/logo.png')} 
            style={styles.footerLogo} 
            resizeMode="contain"
          />
          <Text style={styles.footerText}>EstateGPT v1.1.0</Text>
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
    backgroundColor: COLORS.background,
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
    flexDirection: 'column',
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  menuHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
    position: 'relative',
    backgroundColor: COLORS.primary,
  },
  menuHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.primary,
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  proBadge: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  proBadgeText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 1,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
    paddingTop: 8,
  },
  section: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '700',
    color: COLORS.textSecondary,
    paddingHorizontal: 24,
    paddingBottom: 8,
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginVertical: 2,
  },
  menuItemIcon: {
    width: 20,
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '400',
    flex: 1,
    letterSpacing: 0.2,
  },
  dangerItem: {
    marginVertical: 2,
  },
  dangerText: {
    color: COLORS.error,
  },
  dangerSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 8,
    paddingTop: 16,
    marginHorizontal: 24,
  },
  chevron: {
    marginLeft: 8,
    opacity: 0.6,
  },
  menuFooter: {
    padding: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginHorizontal: 0,
  },
  footerLogo: {
    width: 24,
    height: 24,
    marginBottom: 8,
    opacity: 0.8,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '400',
    letterSpacing: 0.5,
  }
});
