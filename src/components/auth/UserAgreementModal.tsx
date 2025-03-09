import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface UserAgreementModalProps {
  isVisible: boolean;
  onAccept: () => void;
}

const USER_AGREEMENT_ACCEPTED_KEY = 'user_agreement_accepted';

export const UserAgreementModal: React.FC<UserAgreementModalProps> = ({ isVisible, onAccept }) => {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    
    // Check if user has scrolled to bottom with a small padding
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= 
      contentSize.height - paddingToBottom;
    
    if (isCloseToBottom && !scrolledToBottom) {
      setScrolledToBottom(true);
    }
  };

  const handleAccept = async () => {
    try {
      // Store that the user has accepted the agreement
      await AsyncStorage.setItem(USER_AGREEMENT_ACCEPTED_KEY, 'true');
      onAccept();
    } catch (error) {
      console.error('Error saving user agreement status:', error);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <Icon name="document-text" size={24} color="#333333" />
            </View>
            <Text style={styles.title}>User Agreement</Text>
          </View>
          
          <ScrollView 
            style={styles.scrollView}
            onScroll={handleScroll}
            scrollEventThrottle={16} // Change from 400 to 16 for more responsive scrolling
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.sectionTitle}>Terms of Service & Privacy Policy</Text>
            
            <Text style={styles.paragraph}>
              Welcome to EstateGPT! By using our application, you agree to these Terms of Service and our Privacy Policy.
            </Text>
            
            <Text style={styles.sectionSubtitle}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              By accessing or using EstateGPT, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our service.
            </Text>
            
            <Text style={styles.sectionSubtitle}>2. Use of the Service</Text>
            <Text style={styles.paragraph}>
              EstateGPT provides AI-powered assistance for real estate related questions and connects users with professionals. You agree to use the service only for lawful purposes and in accordance with these Terms.
            </Text>
            
            <Text style={styles.sectionSubtitle}>3. User Content</Text>
            <Text style={styles.paragraph}>
              By submitting content to EstateGPT (including messages, images, and other materials), you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content in connection with the service.
            </Text>
            
            <Text style={styles.sectionSubtitle}>4. Privacy</Text>
            <Text style={styles.paragraph}>
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using EstateGPT, you consent to the collection and use of information as described in our Privacy Policy.
            </Text>
            
            <Text style={styles.sectionSubtitle}>5. Communications</Text>
            <Text style={styles.paragraph}>
              By creating an account, you agree to receive communications from EstateGPT, including notifications about your account, updates to our services, and promotional messages. You can opt out of promotional communications at any time.
            </Text>
            
            <Text style={styles.sectionSubtitle}>6. Disclaimer of Warranties</Text>
            <Text style={styles.paragraph}>
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. ESTATEGPT DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE.
            </Text>
            
            <Text style={styles.sectionSubtitle}>7. Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              ESTATEGPT WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
            </Text>
            
            <Text style={styles.sectionSubtitle}>8. Video Consultation Services</Text>
            <Text style={styles.paragraph}>
              EstateGPT facilitates video consultations between users and professionals. While we make efforts to verify professionals, we do not guarantee the quality, safety, or legality of services provided. Users agree that any agreement made with professionals is solely between the user and the professional.
            </Text>
            
            <Text style={styles.sectionSubtitle}>9. Governing Law</Text>
            <Text style={styles.paragraph}>
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </Text>
            
            <Text style={styles.sectionSubtitle}>10. Changes to Terms</Text>
            <Text style={styles.paragraph}>
              EstateGPT reserves the right to modify these Terms at any time. We will provide notice of significant changes through the application or by other means.
            </Text>
            
            <Text style={styles.paragraphLast}>
              By clicking "I Agree" below, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and Privacy Policy.
            </Text>
          </ScrollView>
          
          <View style={styles.footer}>
            {!scrolledToBottom && (
              <View style={styles.scrollPrompt}>
                <Text style={styles.scrollPromptText}>Please scroll to the bottom to continue</Text>
                <Icon name="arrow-down" size={20} color="#777777" />
              </View>
            )}
            
            <TouchableOpacity
              style={[
                styles.acceptButton,
                !scrolledToBottom && styles.acceptButtonDisabled
              ]}
              onPress={handleAccept}
              disabled={!scrolledToBottom}
            >
              <LinearGradient
                colors={scrolledToBottom ? ['#555555', '#333333'] : ['#A0A0A0', '#808080']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Icon
                  name="checkmark-circle-outline"
                  size={20}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.acceptButtonText}>I Agree to Terms & Privacy Policy</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Helper function to check if the user has already accepted the agreement
export const hasAcceptedUserAgreement = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(USER_AGREEMENT_ACCEPTED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error reading user agreement status:', error);
    return false;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: width * 0.9,
    maxHeight: height * 0.85,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(51, 51, 51, 0.08)', // Changed from blue to dark gray
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333', // Changed from #2C3E50 to dark gray
  },
  scrollView: {
    padding: 20,
    maxHeight: height * 0.6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333', // Changed from #2C3E50 to dark gray
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333', // Changed from #2C3E50 to dark gray
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666666', // Changed from #4A5568 to medium gray
    marginBottom: 12,
  },
  paragraphLast: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666666', // Changed from #4A5568 to medium gray
    marginBottom: 20,
    marginTop: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  scrollPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scrollPromptText: {
    fontSize: 14,
    color: '#777777', // Changed from #2E5C8D to lighter gray
    marginRight: 8,
  },
  acceptButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#333333', // Added shadow color to match other elements
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptButtonDisabled: {
    opacity: 0.7,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
