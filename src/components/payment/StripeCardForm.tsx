import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { CardField, CardFieldInput, useStripe } from '@stripe/stripe-react-native';
import { TouchableOpacity } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { Platform } from 'react-native';

interface StripeCardFormProps {
  onSuccess: (paymentMethod: {
    id: string;
    last4: string;
    brand: string;
    expMonth: number;
    expYear: number;
  }) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
  buttonTitle?: string;
  loading?: boolean;
}

export const StripeCardForm: React.FC<StripeCardFormProps> = ({
  onSuccess,
  onError,
  onCancel,
  buttonTitle = 'Add Card',
  loading = false,
}) => {
  const { createPaymentMethod } = useStripe();
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Enhanced payment method creation with retry logic
  const handlePayPress = async () => {
    if (!cardDetails?.complete) {
      setCardError('Please enter complete card details');
      return;
    } else {
      setCardError(null);
    }

    setIsProcessing(true);

    try {
      // Create payment method with more specific billing details to improve success rate
      console.log('Creating payment method with card details:', {
        ...cardDetails,
        // Remove sensitive info from logs
        number: cardDetails.number ? '****' : undefined,
        cvc: cardDetails.cvc ? '***' : undefined
      });
      
      const { paymentMethod, error } = await createPaymentMethod({
        paymentMethodType: 'Card',
        billingDetails: {
          // Adding empty billing details helps in some cases
          name: '',
          phone: '',
          email: '',
          address: {
            city: '',
            country: 'US', // Default country
            line1: '',
            line2: '',
            postalCode: cardDetails.postalCode || '',
            state: ''
          }
        },
      });

      if (error) {
        console.error('Error creating payment method:', error);
        handlePaymentError(error);
        
        // Auto-retry once for network errors
        if (retryCount < 1 && 
           (error.message?.includes('network') || 
            error.message?.includes('timeout') || 
            error.message?.includes('kCFErrorDomain'))) {
          setRetryCount(prevCount => prevCount + 1);
          setTimeout(() => {
            console.log('Retrying payment method creation...');
            handlePayPress();
          }, 1500);
          return;
        }
      } else if (paymentMethod) {
        console.log('Payment method created successfully:', paymentMethod.id);
        onSuccess({
          id: paymentMethod.id,
          last4: paymentMethod.card?.last4 || '',
          brand: paymentMethod.card?.brand || '',
          expMonth: paymentMethod.card?.expiryMonth || 0,
          expYear: paymentMethod.card?.expiryYear || 0,
        });
      }
    } catch (e: any) {
      console.error('Payment creation error:', e);
      handlePaymentError(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment errors with more details
  const handlePaymentError = (error: any) => {
    console.log('Payment error details:', error);
    
    // Format different types of errors with useful messages
    let errorMessage = 'An unexpected error occurred';
    
    if (error.message) {
      errorMessage = error.message;
      
      // Handle common network errors
      if (error.message.includes("timeout") || 
          error.message.includes("network") || 
          error.message.includes("kCFErrorDomainCFNetwork")) {
        errorMessage = "Network connection timed out. Please check your internet connection and try again.";
      }
    } else if (error.localizedMessage) {
      errorMessage = error.localizedMessage;
    }
    
    setCardError(errorMessage);
    if (onError) onError(error);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Card Information</Text>
      
      <CardField
        postalCodeEnabled={true}
        placeholders={{
          number: 'Card Number',
          expiration: 'MM/YY',
          cvc: 'CVC',
          postalCode: 'ZIP',
        }}
        cardStyle={{
          backgroundColor: '#FFFFFF',
          textColor: '#333333',
          textErrorColor: '#FF4444',
          placeholderColor: '#999999',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: cardError ? '#ff3b30' : '#DDDDDD',
        }}
        style={styles.cardField}
        onCardChange={(cardDetails) => {
          setCardDetails(cardDetails);
          if (cardError && cardDetails.complete) {
            setCardError(null);
          }
        }}
      />
      
      {cardError && (
        <Text style={styles.errorText}>{cardError}</Text>
      )}
      
      <View style={styles.buttonContainer}>
        {onCancel && (
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={onCancel}
            disabled={loading || isProcessing}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!cardDetails?.complete || loading || isProcessing) && styles.disabledButton,
          ]}
          onPress={handlePayPress}
          disabled={!cardDetails?.complete || loading || isProcessing}
        >
          {loading || isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="card-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>{buttonTitle}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.securityNote}>
        <Icon name="lock-closed" size={14} color="#666666" />
        <Text style={styles.securityText}>
          Your payment information is securely processed
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  cardField: {
    width: '100%',
    height: 50,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabledButton: {
    backgroundColor: '#A0C0F5',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  securityText: {
    color: '#666666',
    fontSize: 12,
    marginLeft: 6,
  },
});
