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
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const MENU_WIDTH = Math.min(width * 0.85, 320);

// Define consistent colors to match app theme
const COLORS = {
  primary: '#777777',
  primaryDark: '#000000',
  accent: '#FF9500',
  background: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#6A7A8C',
  border: '#E1E8ED',
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
      !['SignOut', 'DeleteAccount', 'User', 'Subscription', 'Feedback'].includes(item.route)
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
        <View style={[
          styles.menuItemIconContainer,
          { backgroundColor: isDangerItem ? `${item.color}15` : item.color ? `${item.color}15` : '#F5F7FA' }
        ]}>
          <Icon
            name={item.icon}
            size={20}
            color={item.color || COLORS.text}
          />
        </View>
        <Text
          style={[
            styles.menuItemText,
            isDangerItem && styles.dangerText,
            item.color && !isDangerItem && { color: item.color }
          ]}
        >
          {item.title}
        </Text>
        {!isDangerItem && (
          <Icon
            name="chevron-forward"
            size={18}
            color={COLORS.textSecondary}
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
        {/* Menu Header with Gradient */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.menuHeaderGradient}
        >
          <View style={styles.menuHeaderContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{userName?.[0]?.toUpperCase() || 'U'}</Text>
              </View>
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
        </LinearGradient>
        
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
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    flexDirection: 'column',
  },
  menuHeaderGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'relative',
  },
  menuHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  proBadge: {
    marginTop: 8,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
  },
  section: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  menuItemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  dangerItem: {
    marginVertical: 4,
  },
  dangerText: {
    color: COLORS.error,
  },
  dangerSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    marginTop: 8,
    paddingTop: 16,
  },
  chevron: {
    marginLeft: 8,
  },
  menuFooter: {
    padding: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  footerLogo: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  }
});
