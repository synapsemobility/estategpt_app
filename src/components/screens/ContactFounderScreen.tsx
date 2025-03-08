import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Icon from '@expo/vector-icons/Ionicons';
import { getCurrentUser } from '@aws-amplify/auth';
import { ServerEnvironment } from '../../config/server.config';
import { ScreenHeader } from '../common/ScreenHeader'; // Import the ScreenHeader component

const { width } = Dimensions.get('window');
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

const ContactFounderScreen: React.FC = () => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);

  const pickImage = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to attach images.');
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        
        // Check file size if available
        if (selectedAsset.fileSize && selectedAsset.fileSize > MAX_IMAGE_SIZE) {
          Alert.alert(
            'Image Too Large',
            'Please select an image smaller than 10MB.'
          );
          return;
        }
        
        setImage(selectedAsset.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'There was an error selecting the image.');
      console.error('Image picker error:', error);
    }
  };
  
  const removeImage = () => {
    setImage(null);
  };
  
  const handleSubmit = async () => {
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }
    
    setLoading(true);
    
    try {
      // Get current user information
      const user = await getCurrentUser();
      
      // Prepare form data for image upload
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('message', description);
      formData.append('userId', user?.userId || 'anonymous');
      formData.append('email', user?.signInDetails?.loginId || '');
      
      // If an image is selected, add it to form data
      if (image) {
        // Get file name and type from uri
        const uriParts = image.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formData.append('image', {
          uri: image,
          name: `photo.${fileType}`,
          type: `image/${fileType}`
        } as any);
      }
      
      // Send the data to your backend
      const response = await fetch(ServerEnvironment.contactFounderEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user?.userId || ''}`
        },
        body: formData
      });
      
      // Check if request was successful
      if (response.ok) {
        setLoading(false);
        setSubmitted(true);
        
        // Reset form after success message is shown
        setTimeout(() => {
          setSubject('');
          setDescription('');
          setImage(null);
          navigation.goBack();
        }, 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
    } catch (error) {
      setLoading(false);
      console.error('Error sending message:', error);
      Alert.alert(
        'Error',
        'Failed to send your message. Please try again later.'
      );
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Replace the LinearGradient header with ScreenHeader component */}
      <ScreenHeader title="Contact Founder" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {submitted ? (
            <View style={styles.successContainer}>
              <Icon name="checkmark-circle" size={80} color="#34C759" />
              <Text style={styles.successTitle}>Thanks for reaching out!</Text>
              <Text style={styles.successMessage}>
                Founder's team will reach out to you within 12 hrs.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.formSection}>
                <Text style={styles.label}>Subject</Text>
                <TextInput
                  style={styles.input}
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="Enter subject"
                  placeholderTextColor="#999"
                  maxLength={100}
                />
                
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.textArea}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter your message here..."
                  placeholderTextColor="#999"
                  multiline
                  maxLength={1000}
                  numberOfLines={8}
                  textAlignVertical="top"
                />
                
                <Text style={styles.label}>Attachment (Optional)</Text>
                
                {image ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: image }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={removeImage}
                    >
                      <Icon name="close-circle" size={28} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.attachButton}
                    onPress={pickImage}
                  >
                    <Icon name="image-outline" size={24} color="#007AFF" />
                    <Text style={styles.attachButtonText}>Attach Image</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <TouchableOpacity
                style={styles.submitButtonContainer}
                onPress={handleSubmit}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#777777', '#000000']} // Updated to match About screen colors
                  style={styles.submitButton}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Icon name="send" size={18} color="#FFFFFF" style={styles.submitIcon} />
                      <Text style={styles.submitButtonText}>Submit</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCFCFF', // Match the background color from AboutUsScreen
  },
  container: {
    flex: 1,
  },
  // Remove headerContainer, header, backButton, headerTitle, headerRight styles
  // as they're no longer needed with ScreenHeader component
  scrollContent: {
    padding: 20,
    paddingTop: 20, // Reduced from 30 to match AboutUsScreen spacing
  },
  formSection: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1D1A2F', // Updated to match AboutUsScreen text color
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E5E8FF', // Updated to match AboutUsScreen border color
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#1D1A2F', // Updated to match AboutUsScreen text color
  },
  textArea: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E5E8FF', // Updated to match AboutUsScreen border color
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#1D1A2F', // Updated to match AboutUsScreen text color
    height: 150,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F9FF', // Updated to match AboutUsScreen lightBg color
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#5271FF', // Updated to match AboutUsScreen primary color
    borderRadius: 8,
    padding: 15,
  },
  attachButtonText: {
    fontSize: 16,
    color: '#5271FF', // Updated to match AboutUsScreen primary color
    marginLeft: 10,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonContainer: {
    marginTop: 10,
    shadowColor: 'rgba(82, 113, 255, 0.12)', // Updated to match AboutUsScreen shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButton: {
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitIcon: {
    marginRight: 8,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginVertical: 50,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1D1A2F', // Updated to match AboutUsScreen text color
    marginVertical: 20,
  },
  successMessage: {
    fontSize: 16,
    color: '#686C8C', // Updated to match AboutUsScreen textSecondary color
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ContactFounderScreen;