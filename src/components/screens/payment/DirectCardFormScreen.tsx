import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Ionicons';
import { PaymentService } from '../../../services/PaymentService';

interface CardDetails {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  name: string;
  postalCode: string;
}

export const DirectCardFormScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    name: '',
    postalCode: ''
  });

  const validateCardDetails = (): boolean => {
    // Basic validation
    if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length < 16) {
      Alert.alert('Invalid Card', 'Please enter a valid card number');
      return false;
    }
    
    if (!cardDetails.expMonth || !cardDetails.expYear) {
      Alert.alert('Invalid Expiration', 'Please enter a valid expiration date');
      return false;
    }
    
    if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
      Alert.alert('Invalid CVC', 'Please enter a valid CVC code');
      return false;
    }
    
    return true;
  };

  const handleSaveCard = async () => {
    if (!validateCardDetails()) return;

    try {
      setLoading(true);
      
      // This is just a mockup - in real implementation, we'd use the Stripe SDK directly
      // For now, we'll pretend to save the card through our backend
      const result = await PaymentService.addPaymentMethod({
        cardNumber: cardDetails.number.replace(/\s/g, ''),
        expMonth: parseInt(cardDetails.expMonth),
        expYear: parseInt(cardDetails.expYear),
        cvc: cardDetails.cvc,
        name: cardDetails.name,
        postalCode: cardDetails.postalCode
      });
      
      Alert.alert(
        'Success', 
        'Card saved successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Card setup error:', error);
      Alert.alert('Error', error.message || 'Failed to save card');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (text: string) => {
    // Remove any non-digit characters
    const cleanText = text.replace(/\D/g, '');
    // Add spaces after every 4 digits
    let formatted = '';
    for (let i = 0; i < cleanText.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += cleanText[i];
    }
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Payment Method</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Card Information</Text>
          <Text style={styles.sectionSubtitle}>
            Enter your card details to save for future payments
          </Text>
          
          <View style={styles.cardForm}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="4242 4242 4242 4242"
              keyboardType="number-pad"
              value={cardDetails.number}
              onChangeText={(text) => setCardDetails({...cardDetails, number: formatCardNumber(text)})}
              maxLength={19}
            />
            
            <View style={styles.row}>
              <View style={styles.halfColumn}>
                <Text style={styles.inputLabel}>Expiration Month</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM"
                  keyboardType="number-pad"
                  value={cardDetails.expMonth}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, '').substring(0, 2);
                    const month = parseInt(cleaned);
                    if (cleaned === '' || (month >= 1 && month <= 12)) {
                      setCardDetails({...cardDetails, expMonth: cleaned});
                    }
                  }}
                  maxLength={2}
                />
              </View>
              <View style={styles.halfColumn}>
                <Text style={styles.inputLabel}>Expiration Year</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YY"
                  keyboardType="number-pad"
                  value={cardDetails.expYear}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, '').substring(0, 2);
                    setCardDetails({...cardDetails, expYear: cleaned});
                  }}
                  maxLength={2}
                />
              </View>
            </View>
            
            <Text style={styles.inputLabel}>CVC</Text>
            <TextInput
              style={styles.input}
              placeholder="123"
              keyboardType="number-pad"
              value={cardDetails.cvc}
              onChangeText={(text) => {
                const cleaned = text.replace(/\D/g, '').substring(0, 4);
                setCardDetails({...cardDetails, cvc: cleaned});
              }}
              maxLength={4}
            />
            
            <Text style={styles.inputLabel}>Name on Card</Text>
            <TextInput
              style={styles.input}
              placeholder="John Smith"
              value={cardDetails.name}
              onChangeText={(text) => setCardDetails({...cardDetails, name: text})}
            />
            
            <Text style={styles.inputLabel}>Postal Code</Text>
            <TextInput
              style={styles.input}
              placeholder="12345"
              keyboardType="number-pad"
              value={cardDetails.postalCode}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9a-zA-Z]/g, '').substring(0, 10);
                setCardDetails({...cardDetails, postalCode: cleaned});
              }}
              maxLength={10}
            />
          </View>

          <View style={styles.securityNote}>
            <Icon name="shield-checkmark-outline" size={16} color="#666" />
            <Text style={styles.securityText}>
              Your payment information is securely stored with Stripe
            </Text>
          </View>
          
          <View style={styles.buttonSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
      
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveCard}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Icon name="save-outline" size={20} color="#FFF" />
            <Text style={styles.saveButtonText}>Save Card</Text>
          </>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  cardForm: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfColumn: {
    width: '48%',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 20,
  },
  securityText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
  },
  buttonSpacer: {
    height: 80, // Space for the button
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a80f5',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});
