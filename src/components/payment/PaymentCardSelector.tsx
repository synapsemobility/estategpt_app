import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { fetchPaymentMethods } from '../../utils/stripeService';
import { getCurrentUser } from '@aws-amplify/auth';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault?: boolean;
}

interface PaymentCardSelectorProps {
  onCardSelected: (cardId: string | null) => void;
  onAddCardPress: () => void;
  initialCardId?: string | null;
}

export const PaymentCardSelector: React.FC<PaymentCardSelectorProps> = ({ 
  onCardSelected,
  onAddCardPress,
  initialCardId = null
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(initialCardId);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const getUserId = async () => {
      try {
        const user = await getCurrentUser();
        console.log("Got user in PaymentCardSelector:", user.userId);
        setUserId(user.userId);
      } catch (error) {
        console.error('Error getting user ID:', error);
        setError('Could not authenticate user. Please try again.');
      }
    };
    
    getUserId();
  }, []);

  // Load payment methods when user ID is available
  const loadPaymentMethods = useCallback(async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const { paymentMethods } = await fetchPaymentMethods(userId);
      console.log("Payment methods loaded:", paymentMethods);
      
      // Sort payment methods so default is first
      const sortedMethods = [...paymentMethods].sort((a, b) => {
        if (a.isDefault) return -1;
        if (b.isDefault) return 1;
        return 0;
      });
      
      setPaymentMethods(sortedMethods);
      
      // Select default card if available and no card was previously selected
      if (sortedMethods.length > 0 && !selectedCardId) {
        const defaultCard = sortedMethods.find(card => card.isDefault);
        const cardToSelect = defaultCard ? defaultCard.id : sortedMethods[0].id;
        setSelectedCardId(cardToSelect);
        onCardSelected(cardToSelect);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      setError('Could not load payment methods. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, selectedCardId, onCardSelected]);

  // Load methods when userId changes
  useEffect(() => {
    if (userId) {
      loadPaymentMethods();
    }
  }, [userId, loadPaymentMethods]);

  // Handle card selection
  const handleSelectCard = (cardId: string) => {
    setSelectedCardId(cardId);
    onCardSelected(cardId);
  };

  // Handle refresh
  const handleRefresh = () => {
    loadPaymentMethods();
  };

  // Helper to get card brand icon
  const getCardBrandIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card'; 
      case 'amex':
        return 'card';
      default:
        return 'card-outline';
    }
  };

  // Format expiry date
  const formatExpiry = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#4285F4" />
        <Text style={styles.loadingText}>Loading payment methods...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={32} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Icon name="refresh" size={18} color="#FFFFFF" />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Select Payment Method</Text>
        {paymentMethods.length > 0 && (
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Icon name="refresh-outline" size={20} color="#4285F4" />
          </TouchableOpacity>
        )}
      </View>
      
      {paymentMethods.length === 0 ? (
        <View style={styles.noCardsContainer}>
          <Icon name="card-outline" size={36} color="#999" />
          <Text style={styles.noCardsText}>No payment methods found</Text>
          <Text style={styles.noCardsSubtext}>Please add a payment method to continue</Text>
        </View>
      ) : (
        <View style={styles.cardsList}>
          {paymentMethods.map(card => (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.cardItem,
                selectedCardId === card.id && styles.selectedCardItem
              ]}
              onPress={() => handleSelectCard(card.id)}
            >
              <View style={styles.cardItemInner}>
                <Icon name={getCardBrandIcon(card.brand)} size={24} color="#4285F4" />
                <View style={styles.cardDetails}>
                  <Text style={styles.cardTitle}>
                    {card.brand.charAt(0).toUpperCase() + card.brand.slice(1)} •••• {card.last4}
                  </Text>
                  <Text style={styles.cardExpiry}>
                    Expires {formatExpiry(card.expMonth, card.expYear)}
                    {card.isDefault && <Text style={styles.defaultText}> (Default)</Text>}
                  </Text>
                </View>
              </View>
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radio,
                    selectedCardId === card.id && styles.radioSelected
                  ]}
                >
                  {selectedCardId === card.id && <View style={styles.radioInner} />}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.addCardButton} 
        onPress={onAddCardPress}
        testID="add-payment-method-button"
      >
        <Icon name="add-circle-outline" size={20} color="#4285F4" />
        <Text style={styles.addCardText}>Add New Payment Method</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  refreshButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFF1F0',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 15,
    color: '#FF3B30',
    marginVertical: 8,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  noCardsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  noCardsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 12,
  },
  noCardsSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  cardsList: {
    marginBottom: 16,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  selectedCardItem: {
    borderColor: '#4285F4',
    backgroundColor: '#f0f7ff',
  },
  cardItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardDetails: {
    marginLeft: 12,
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  cardExpiry: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  defaultText: {
    fontStyle: 'italic',
    color: '#4285F4',
  },
  radioContainer: {
    marginLeft: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d0d0d0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#4285F4',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4285F4',
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  addCardText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4285F4',
    marginLeft: 8,
  },
});
