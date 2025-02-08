import React from 'react';
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
import { useNavigation, NavigationProp } from '@react-navigation/native';
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
  const slideAnim = React.useRef(new Animated.Value(-300)).current;

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isMenuOpen ? 0 : -300,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isMenuOpen]);

  const handleMenuItemPress = (route: string) => {
    if (route === 'SignOut') {
      signOut();
    } else if (route === 'User') {
      navigation.navigate('User', { userID: userID });
    } else {
      navigation.navigate(route as never);
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      {isMenuOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsMenuOpen(false)}
        >
          <Animated.View
            style={[
              styles.menuContainer,
              {
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
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
                  <Icon
                    name={item.icon}
                    size={22}
                    color={item.route === 'SignOut' ? '#FF3B30' : '#333333'}
                  />
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
          </Animated.View>
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
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
    paddingTop: 50,
  },
  menuHeader: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
  },
  menuContent: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333333',
    flex: 1,
  },
  signOutItem: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  signOutText: {
    color: '#FF3B30',
  },
  chevron: {
    marginLeft: 8,
  }
});
