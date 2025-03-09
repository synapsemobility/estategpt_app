import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Image,
  RefreshControl,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/Ionicons';
import { getCurrentUser } from '@aws-amplify/auth';
import { ServerEnvironment } from '../../../config/server.config';
import { ScreenHeader } from '../../common/ScreenHeader';
import { CommonActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

// Card brand icons
const CARD_BRAND_ICONS: {[key: string]: any} = {
  visa: require('../../../../assets/images/payment/visa.png'),
  mastercard: require('../../../../assets/images/payment/mastercard.png'),
  amex: require('../../../../assets/images/payment/amex.png'),
  discover: require('../../../../assets/images/payment/discover.png'),
  // Add more card brands as needed
  default: require('../../../../assets/images/payment/generic-card.png')
};

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

const { width } = Dimensions.get('window');

export const PaymentMethodsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user ID and payment methods on component mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await getCurrentUser();
        setUserId(user.userId);
        fetchPaymentMethods(user.userId);
      } catch (error) {
        console.error('Error getting user ID:', error);
        Alert.alert('Authentication Error', 'Could not authenticate user. Please sign in again.');
        navigation.goBack();
      }
    };

    initialize();
  }, []);

  // Fetch payment methods from the API
  const fetchPaymentMethods = async (userIdParam: string) => {
    setLoading(true);
    try {
      const response = await fetch(ServerEnvironment.payment.getPaymentMethods, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: userIdParam,
        }
      });

      const data = await response.json();

      if (data.status === 'success') {
        setPaymentMethods(data.paymentMethods || []);
      } else {
        throw new Error(data.message || 'Failed to load payment methods');
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    if (userId) {
      setRefreshing(true);
      await fetchPaymentMethods(userId);
    }
  };

  // Navigate to add payment method screen
  const handleAddPaymentMethod = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'AddPaymentCard'
      })
    );
  };

  // Set payment method as default
  const handleSetDefault = async (paymentMethodId: string) => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await fetch(ServerEnvironment.payment.setDefaultMethod, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: userId,
        },
        body: JSON.stringify({
          paymentMethodId
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Update the local state to reflect changes
        setPaymentMethods(prevMethods => 
          prevMethods.map(method => ({
            ...method,
            isDefault: method.id === paymentMethodId
          }))
        );
        Alert.alert('Success', 'Default payment method updated');
      } else {
        throw new Error(data.message || 'Failed to set default payment method');
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      Alert.alert('Error', 'Failed to update default payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Delete payment method
  const handleDeletePaymentMethod = async (paymentMethodId: string, isDefault: boolean) => {
    if (isDefault) {
      Alert.alert(
        'Cannot Delete Default',
        'You cannot delete your default payment method. Please set another payment method as default first.'
      );
      return;
    }

    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!userId) return;

            try {
              setLoading(true);
              const response = await fetch(ServerEnvironment.payment.deleteMethod, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: userId,
                },
                body: JSON.stringify({
                  paymentMethodId
                })
              });

              const data = await response.json();

              if (data.status === 'success') {
                // Remove the deleted method from local state
                setPaymentMethods(prevMethods => 
                  prevMethods.filter(method => method.id !== paymentMethodId)
                );
                Alert.alert('Success', 'Payment method deleted');
              } else {
                throw new Error(data.message || 'Failed to delete payment method');
              }
            } catch (error) {
              console.error('Error deleting payment method:', error);
              Alert.alert('Error', 'Failed to delete payment method. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Get card brand color scheme
  const getCardGradient = (brand: string) => {
    switch(brand.toLowerCase()) {
      case 'visa':
        return ['#1A1F71', '#4B5ED7'];
      case 'mastercard':
        return ['#EB001B', '#F79E1B'];
      case 'amex':
        return ['#2E77BB', '#60A4DF'];
      case 'discover':
        return ['#FF6600', '#FFA566'];
      default:
        return ['#6c757d', '#495057'];
    }
  };

  // Render a payment method item
  const renderPaymentMethodItem = ({ item }: { item: PaymentMethod }) => {
    const cardIcon = CARD_BRAND_ICONS[item.brand.toLowerCase()] || CARD_BRAND_ICONS.default;
    const gradientColors = getCardGradient(item.brand);
    
    return (
      <View style={styles.paymentMethodItemContainer}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.paymentMethodItem}
        >
          <View style={styles.cardInfoContainer}>
            {item.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>DEFAULT</Text>
              </View>
            )}
            
            <View style={styles.cardBrandContainer}>
              <Image source={cardIcon} style={styles.cardBrandIcon} />
              <Text style={styles.cardBrandText}>{item.brand.toUpperCase()}</Text>
            </View>
            
            <Text style={styles.cardNumber}>•••• •••• •••• {item.last4}</Text>
            
            <View style={styles.cardExpiryContainer}>
              <Text style={styles.cardExpiryLabel}>EXPIRES</Text>
              <Text style={styles.cardExpiry}>
                {item.expMonth.toString().padStart(2, '0')}/{item.expYear.toString().slice(-2)}
              </Text>
            </View>
          </View>
        </LinearGradient>
        
        <View style={styles.actionsContainer}>
          {!item.isDefault && (
            <TouchableOpacity 
              style={styles.setDefaultButton}
              onPress={() => handleSetDefault(item.id)}
            >
              <Icon name="checkmark-circle-outline" size={18} color="#777777" />
              <Text style={styles.setDefaultButtonText}>Set as Default</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeletePaymentMethod(item.id, item.isDefault)}
          >
            <Icon name="trash-outline" size={18} color="#777777" />
            <Text style={styles.deleteButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIconContainer}>
        <Icon name="card-outline" size={64} color="#FFF" />
      </View>
      <Text style={styles.emptyStateTitle}>No Payment Methods</Text>
      <Text style={styles.emptyStateSubtitle}>
        Add a payment method to easily pay for services and consultations
      </Text>
      <TouchableOpacity 
        style={styles.emptyStateButton}
        onPress={handleAddPaymentMethod}
      >
        <Icon name="add-circle" size={20} color="#FFFFFF" />
        <Text style={styles.emptyStateButtonText}>Add Payment Method</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader 
        title="Payment Methods" 
        showBackButton={true}
      />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#777777" />
        </View>
      ) : (
        <FlatList
          data={paymentMethods}
          renderItem={renderPaymentMethodItem}
          keyExtractor={item => item.id}
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            paymentMethods.length === 0 && styles.emptyListContent
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#777777']}
            />
          }
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{height: 16}} />}
        />
      )}

      {paymentMethods.length > 0 && (
        <View style={styles.addButtonContainer}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddPaymentMethod}
            disabled={loading}
          >
            <LinearGradient
              colors={['#555555', '#333333']}  // Changed from ['#777777', '#2A75F3'] to dark grays
              style={styles.addButtonGradient}
            >
              <Icon name="add" size={22} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Payment Method</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 90, // Make room for the add button
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  paymentMethodItemContainer: {
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  paymentMethodItem: {
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  cardInfoContainer: {
    height: 160,
    justifyContent: 'space-between',
  },
  cardBrandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardBrandIcon: {
    width: 50,
    height: 30,
    resizeMode: 'contain',
  },
  cardBrandText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 2,
    marginVertical: 20,
  },
  cardExpiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardExpiryLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
    marginRight: 8,
  },
  cardExpiry: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  defaultBadge: {
    position: 'absolute',
    top: 140,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomLeftRadius: 10,
  },
  defaultBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  setDefaultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  setDefaultButtonText: {
    color: '#4285F4',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#333333',  // Changed from '#4285F4' to dark gray
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  addButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333333',  // Changed from '#4285F4' to dark gray
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#333333',  // Changed from '#4285F4' to dark gray
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  emptyStateSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: width * 0.1,
    lineHeight: 22,
    marginBottom: 30,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',  // Changed from '#4285F4' to dark gray
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#333333',  // Changed from '#4285F4' to dark gray
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
