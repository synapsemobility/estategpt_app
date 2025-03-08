import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StripeProvider, CardField, useStripe, CardFieldInput } from '@stripe/stripe-react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { getCurrentUser } from '@aws-amplify/auth';
import { ServerEnvironment } from '../../../config/server.config';
import { LinearGradient } from 'expo-linear-gradient';

// Stripe publishable key - replace with your actual key from your Stripe account
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51QyKTkP4LXMAMqdlDyIhOYk8emVe9F5xn8ANmoCZ8RLn4gaWf5JThAf1gHZrns7w8IM2GylvZFxEjByKmYJw6fGk00e6CyEa1h';

const { width } = Dimensions.get('window');

export const AddPaymentCardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { createSetupIntent, confirmSetupIntent } = useStripe();
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCardComplete, setIsCardComplete] = useState(false);

  // Get user ID on component mount
  useEffect(() => {
    const getUserId = async () => {
      try {
        const user = await getCurrentUser();
        setUserId(user.userId);
      } catch (error) {
        console.error('Error getting user ID:', error);
        Alert.alert('Authentication Error', 'Could not authenticate user. Please sign in again.');
        navigation.goBack();
      }
    };
    
    getUserId();
  }, [navigation]);

  // Handle card validation change
  const handleCardChange = (cardDetails: CardFieldInput.Details) => {
    setCardDetails(cardDetails);
    setIsCardComplete(cardDetails.complete);
  };

  // Handle the add card action
  const handleAddCard = async () => {
    if (!isCardComplete) {
      Alert.alert('Invalid Card', 'Please enter complete and valid card information.');
      return;
    }

    if (!userId) {
      Alert.alert('Authentication Error', 'User ID not available. Please try again.');
      return;
    }

    try {
      setLoading(true);

      // 1. Create a setup intent from your backend
      const setupIntentResponse = await fetch(ServerEnvironment.payment.createSetupIntent, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: userId,
        },
      });

      const setupIntentData = await setupIntentResponse.json();

      if (setupIntentData.status !== 'success') {
        throw new Error(setupIntentData.message || 'Failed to create setup intent');
      }

      // 2. Confirm the setup intent with the card details
      const { clientSecret } = setupIntentData;
      const { error: setupError, setupIntent } = await confirmSetupIntent(
        clientSecret,
        { paymentMethodType: 'Card' }
      );

      if (setupError) {
        throw new Error(setupError.message || 'Error confirming card setup');
      }

      if (!setupIntent || !setupIntent.paymentMethodId) {
        throw new Error('Failed to setup payment method');
      }

      // 3. Attach the payment method to the customer if needed
      // (This is usually handled on the backend when confirming the setup intent)

      // Show success and navigate back
      Alert.alert(
        'Success',
        'Your card has been added successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error adding card:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Add Payment Method</Text>
              <View style={styles.placeholder} />
            </View>
            
            <View style={styles.content}>
              {/* Card illustration */}
              <View style={styles.cardIllustrationContainer}>
                <LinearGradient
                  colors={['#444444', '#222222']}
                  style={styles.cardIllustration}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.cardIllustrationChip} />
                  <View style={styles.cardIllustrationDetails}>
                    <Text style={styles.cardIllustrationNumber}>•••• •••• •••• ••••</Text>
                    <View style={styles.cardIllustrationBottom}>
                      <Text style={styles.cardIllustrationName}>YOUR NAME</Text>
                      <Text style={styles.cardIllustrationExpiry}>MM/YY</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              <View style={styles.formContainer}>
                <Text style={styles.sectionTitle}>Card Information</Text>
                <Text style={styles.sectionSubtitle}>
                  Enter your card details to securely store for future payments
                </Text>
                
                <View style={styles.cardContainer}>
                  <CardField
                    postalCodeEnabled={true}
                    placeholders={{
                      number: '4242 4242 4242 4242',
                      expiration: 'MM/YY',
                      cvc: 'CVC',
                      postalCode: '12345',
                    }}
                    cardStyle={{
                      backgroundColor: '#F9F9F9',
                      textColor: '#333333',
                      textErrorColor: '#FF0000',
                      placeholderColor: '#999999',
                      // Remove potentially problematic style properties for Android
                      fontSize: 16,
                      // borderWidth and borderRadius can cause issues on Android
                    }}
                    style={styles.cardField}
                    onCardChange={handleCardChange}
                    testID="card-field"
                  />
                </View>
                
                <View style={styles.secureNoteContainer}>
                  <Icon name="lock-closed" size={20} color="#222222" />
                  <View style={styles.secureNoteTextContainer}>
                    <Text style={styles.secureNoteTitle}>Secure Payment Processing</Text>
                    <Text style={styles.secureNoteText}>
                      Your payment information is encrypted and securely processed by Stripe
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    (!isCardComplete || loading) && styles.disabledButton
                  ]}
                  onPress={handleAddCard}
                  disabled={!isCardComplete || loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#222222" />
                  ) : (
                    <LinearGradient
                      colors={['#555555', '#333333']}
                      style={styles.addButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Icon name="card" size={20} color="#000000" />
                      <Text style={styles.addButtonText}>Add Card</Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>

                <View style={styles.supportedCardsContainer}>
                  <Text style={styles.supportedCardsText}>Supported cards</Text>
                  <View style={styles.supportedCardIcons}>
                    <Image
                      source={require('../../../../assets/images/payment/visa.png')}
                      style={styles.supportedCardIcon}
                    />
                    <Image
                      source={require('../../../../assets/images/payment/mastercard.png')}
                      style={styles.supportedCardIcon}
                    />
                    <Image
                      source={require('../../../../assets/images/payment/amex.png')}
                      style={styles.supportedCardIcon}
                    />
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingBottom: 30,
  },
  cardIllustrationContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  cardIllustration: {
    width: width * 0.85,
    aspectRatio: 1.6, // Standard card aspect ratio
    borderRadius: 16,
    padding: 20,
    shadowColor: '#5A7BF0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  cardIllustrationChip: {
    width: 45,
    height: 35,
    backgroundColor: '#FFD700',
    borderRadius: 6,
    marginBottom: 30,
  },
  cardIllustrationDetails: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardIllustrationNumber: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 20,
  },
  cardIllustrationBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIllustrationName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  cardIllustrationExpiry: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  cardContainer: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F9F9F9',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  cardField: {
    width: '100%',
    height: 50,
  },
  cardFieldStyle: {
    backgroundColor: '#F9F9F9',
    borderRadius: 0,
    borderWidth: 0,
    fontSize: 16,
    color: '#333',
    textColor: '#333',
    placeholderColor: '#999',
  },
  secureNoteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  secureNoteTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  secureNoteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4285F4',
    marginBottom: 4,
  },
  secureNoteText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  addButton: {
    borderRadius: 12,
    height: 54,
    overflow: 'hidden',
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 24,
  },
  addButtonGradient: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  supportedCardsContainer: {
    alignItems: 'center',
  },
  supportedCardsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  supportedCardIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportedCardIcon: {
    height: 25,
    width: 40,
    resizeMode: 'contain',
    marginHorizontal: 5,
  },
});
