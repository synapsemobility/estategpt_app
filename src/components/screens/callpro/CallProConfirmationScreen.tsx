import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { ScreenHeader } from '../../common/ScreenHeader';
import Icon from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { format } from 'date-fns';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { ServerEnvironment } from '../../../config/server.config';
import { getCurrentUser } from '@aws-amplify/auth';
import * as ImageManipulator from 'expo-image-manipulator';
import { PaymentCardSelector } from '../../payment/PaymentCardSelector';

// Define types for route parameters
type CallProConfirmationRouteParams = {
  CallProConfirmation: {
    requestDetails: {
      service_type: string;
      city: string;
      state: string;
      description: string;
      availability: Array<{
        date: string;
        startTime: string;
        endTime: string;
      }>;
      image: string | null;
      servicePrice: string;
    };
  };
};

// Define consistent colors to match app theme
const COLORS = {
  primary: '#777777',
  primaryDark: '#000000',
  accent: '#FF9500',
  background: '#F7F8FA',
  card: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#6A7A8C',
  border: '#E1E8ED',
  error: '#E74C3C',
  success: '#2ECC71',
};

export const CallProConfirmationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<CallProConfirmationRouteParams, 'CallProConfirmation'>>();
  const { requestDetails } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  
  // Add state for selected payment method
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [hasCheckingPaymentMethods, setHasCheckingPaymentMethods] = useState(true);

  // Calculate estimated cost based on service type
  const getServiceInfo = () => {
    // This is a simplified version - in a real app, you would have more robust lookup
    const serviceMap = {
      "Plumber": { baseRate: "30", baseMinutes: 15, additionalRate: "1.5" },
      "Electrician": { baseRate: "35", baseMinutes: 15, additionalRate: "2" },
      "HVAC Specialist": { baseRate: "40", baseMinutes: 15, additionalRate: "2.5" },
      "Maintenance Handyman": { baseRate: "25", baseMinutes: 15, additionalRate: "1" },
      "Roofing Specialist": { baseRate: "35", baseMinutes: 15, additionalRate: "2" },
      "Landscaping Pro": { baseRate: "25", baseMinutes: 15, additionalRate: "1.2" },
      "Home Inspector": { baseRate: "45", baseMinutes: 15, additionalRate: "3" },
      "Property Manager": { baseRate: "40", baseMinutes: 15, additionalRate: "2" },
      "Real Estate Investor": { baseRate: "55", baseMinutes: 15, additionalRate: "2.8" },
      "First-Time Home Buying Support": { baseRate: "30", baseMinutes: 15, additionalRate: "1.5" },
      "Airbnb Hosts/Cohosts": { baseRate: "30", baseMinutes: 15, additionalRate: "1.5" },
      "General Contractor": { baseRate: "45", baseMinutes: 15, additionalRate: "2.2" },
      "Property Attorney": { baseRate: "60", baseMinutes: 15, additionalRate: "3.0" },
    };
    
    return serviceMap[requestDetails.service_type] || { baseRate: "30", baseMinutes: 15, additionalRate: "1.5" };
  };

  const serviceInfo = getServiceInfo();

  // Process image for upload
  const processImage = async (imageUri: string) => {
    try {
      // Resize and compress the image
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 800 } }], // Resize to max width 800px
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG } // Compress to 50% quality
      );
      return result.uri;
    } catch (error) {
      console.error('Image processing error:', error);
      return imageUri; // Return original if processing fails
    }
  };

  // Handle payment method selection
  const handlePaymentMethodSelected = useCallback((paymentMethodId: string | null) => {
    setSelectedPaymentMethodId(paymentMethodId);
    setHasCheckingPaymentMethods(false);
  }, []);

  // Handle add new card
  const handleAddCard = useCallback(() => {
    navigation.navigate('AddPaymentCard');
  }, [navigation]);

  const handleConfirmRequest = async () => {
    // Validate payment method exists
    if (!selectedPaymentMethodId) {
      Alert.alert(
        "Payment Method Required",
        "Please add or select a payment method to continue."
      );
      return;
    }
    
    setIsLoading(true);
    
    try {
      const user = await getCurrentUser();
      const formData = new FormData();
      
      // Format request_details object according to what backend expects
      const requestDetailsObj = {
        service_type: requestDetails.service_type,
        description: requestDetails.description,
        city: requestDetails.city,
        state: requestDetails.state,
        availability_slots: requestDetails.availability,
        payment_method_id: selectedPaymentMethodId // Add payment method to request
      };
      
      // Add the data field as a JSON string as expected by the backend
      formData.append('data', JSON.stringify({
        request_details: requestDetailsObj
      }));
      
      // Add image if available - with compression to reduce size
      if (requestDetails.image) {
        try {
          // Process and resize the image to reduce size
          const processedImage = await processImage(requestDetails.image);
          
          // Get file extension and mime type
          const mimeType = processedImage.endsWith('png') ? 'image/png' : 'image/jpeg';
          const extension = mimeType === 'image/png' ? 'png' : 'jpg';
          
          formData.append('image', {
            uri: processedImage,
            type: mimeType,
            name: `photo.${extension}`,
          } as any);
          
        } catch (imageError) {
          console.error('Error processing image:', imageError);
        }
      }
      
      // Make API request to the scheduleProEndpoint
      const response = await fetch(ServerEnvironment.scheduleProEndpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          'Authorization': user.userId, // Add authorization header
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      if (responseData.status === 'success') {
        // Show success alert
        Alert.alert(
          "Request Submitted!",
          "Your service request has been submitted successfully. You'll be notified when a professional accepts your request.",
          [
            {
              text: "View Scheduled Calls",
              onPress: () => navigation.navigate('ScheduledCalls')
            },
            {
              text: "Return to Home",
              onPress: () => navigation.navigate('Chat'),
              style: "cancel"
            },
          ]
        );
      } else {
        throw new Error(responseData.message || 'Unknown error occurred');
      }
      
    } catch (error) {
      console.error('Error submitting request:', error);
      Alert.alert(
        "Error",
        "There was a problem submitting your request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Check if form is valid and ready for submission
  const isFormValid = selectedPaymentMethodId !== null && !hasCheckingPaymentMethods;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader 
        title="Confirm Request" 
      />
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.card}>
          <ExpoLinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.cardHeader}
          >
            <Text style={styles.cardTitle}>Service Request Summary</Text>
          </ExpoLinearGradient>
          
          <View style={styles.cardContent}>
            {/* Service Type */}
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Icon name="briefcase-outline" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Service:</Text>
              </View>
              <Text style={styles.infoValue}>{requestDetails.service_type}</Text>
            </View>
            
            {/* Location */}
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Icon name="location-outline" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Location:</Text>
              </View>
              <Text style={styles.infoValue}>{requestDetails.city}, {requestDetails.state}</Text>
            </View>
            
            {/* Description */}
            <View style={styles.descriptionContainer}>
              <View style={styles.infoLabelContainer}>
                <Icon name="document-text-outline" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Details:</Text>
              </View>
              <Text style={styles.descriptionText}>{requestDetails.description}</Text>
            </View>
            
            {/* Availability */}
            <View style={styles.availabilityContainer}>
              <View style={styles.infoLabelContainer}>
                <Icon name="calendar-outline" size={20} color={COLORS.primary} />
                <Text style={styles.infoLabel}>Your Availability:</Text>
              </View>
              
              <View style={styles.timeSlotsList}>
                {requestDetails.availability.map((slot, index) => {
                  // Parse string dates to Date objects
                  const date = new Date(slot.date);
                  const startTime = new Date(slot.startTime);
                  const endTime = new Date(slot.endTime);
                  
                  return (
                    <View key={index} style={styles.timeSlot}>
                      <Text style={styles.timeSlotDate}>
                        {format(date, 'EEE, MMM d, yyyy')}
                      </Text>
                      <Text style={styles.timeSlotTime}>
                        {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
            
            {/* Image Preview if available */}
            {requestDetails.image && (
              <View style={styles.imageContainer}>
                <View style={styles.infoLabelContainer}>
                  <Icon name="image-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.infoLabel}>Attached Photo:</Text>
                </View>
                <Image 
                  source={{ uri: requestDetails.image }} 
                  style={styles.imagePreview} 
                  resizeMode="cover"
                />
              </View>
            )}
          </View>
        </View>
        
        {/* Payment Information Card */}
        <View style={styles.card}>
          <ExpoLinearGradient
            colors={[COLORS.accent, '#E68A00']}
            style={styles.cardHeader}
          >
            <Text style={styles.cardTitle}>Payment Information</Text>
          </ExpoLinearGradient>
          
          <View style={styles.cardContent}>
            <View style={styles.paymentInfoContainer}>
              <Text style={styles.paymentInfoText}>
                <Text style={styles.boldText}>No upfront payment required.</Text> You'll be charged only after the video consultation, based on the actual duration:
              </Text>
              
              <View style={styles.rateContainer}>
                <Text style={styles.rateLabel}>Base Rate:</Text>
                <Text style={styles.rateValue}>
                  ${serviceInfo.baseRate} for first {serviceInfo.baseMinutes} minutes
                </Text>
              </View>
              
              <View style={styles.rateContainer}>
                <Text style={styles.rateLabel}>Additional Time:</Text>
                <Text style={styles.rateValue}>
                  ${serviceInfo.additionalRate}/minute after first {serviceInfo.baseMinutes} minutes
                </Text>
              </View>
              
              <View style={styles.separator} />
              
              <Text style={styles.paymentNote}>
                Your payment method on file will be charged automatically after the consultation.
              </Text>

              {/* Add PaymentCardSelector component */}
              <View style={styles.paymentMethodSection}>
                <Text style={styles.paymentMethodTitle}>Payment Method</Text>
                <PaymentCardSelector 
                  onCardSelected={handlePaymentMethodSelected}
                  onAddCardPress={handleAddCard}
                />
              </View>
            </View>
          </View>
        </View>
        
        {/* Terms and Conditions */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By tapping "Confirm Request", you agree to our <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Payment Policy</Text>.
          </Text>
        </View>
        
        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!isFormValid || isLoading) && styles.disabledButton
          ]}
          onPress={handleConfirmRequest}
          disabled={!isFormValid || isLoading}
        >
          <ExpoLinearGradient
            colors={isFormValid ? [COLORS.primary, COLORS.primaryDark] : ['#AAAAAA', '#888888']}
            style={styles.confirmButtonGradient}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="checkmark-circle" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.confirmButtonText}>Confirm Request</Text>
              </>
            )}
          </ExpoLinearGradient>
        </TouchableOpacity>
        
        {!isFormValid && !hasCheckingPaymentMethods && (
          <Text style={styles.paymentRequiredText}>
            Please select a payment method to continue
          </Text>
        )}
        
        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Edit Request</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'right',
    flex: 1,
  },
  descriptionContainer: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  descriptionText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
    marginTop: 8,
  },
  availabilityContainer: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  timeSlotsList: {
    marginTop: 8,
  },
  timeSlot: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  timeSlotDate: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  timeSlotTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  imageContainer: {
    paddingVertical: 10,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  paymentInfoContainer: {
    paddingVertical: 6,
  },
  paymentInfoText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  boldText: {
    fontWeight: '700',
  },
  rateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rateLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
    flex: 1,
  },
  rateValue: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    flex: 2,
    textAlign: 'right',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  paymentNote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  termsContainer: {
    marginBottom: 16,
  },
  termsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  confirmButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    alignItems: 'center',
    padding: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  // Add new styles for payment method section
  paymentMethodSection: {
    marginTop: 16,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.6,
    shadowOpacity: 0.05,
  },
  paymentRequiredText: {
    textAlign: 'center',
    color: COLORS.error,
    fontSize: 14,
    marginBottom: 16,
  },
});