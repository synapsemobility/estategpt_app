import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Modal
} from 'react-native';
import { ScreenHeader } from '../../common/ScreenHeader';
import Icon from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useProStatus } from '../../../contexts/ProStatusContext';
import * as ImagePicker from 'expo-image-picker';
import { ServerEnvironment } from '../../../config/server.config';
import { getCurrentUser } from '@aws-amplify/auth';

interface FormData {
  name: string;
  expertise: string;
  experience: string;
  services: string[];
  description: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  photo: string | null;
}

// US states for dropdown
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const BecomeProScreen = () => {
  const navigation = useNavigation();
  const { becomePro, checkProStatus } = useProStatus();
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentService, setCurrentService] = useState('');
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    expertise: '',
    experience: '',
    services: [],
    description: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    photo: null
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Photo handling functions
  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "We need camera permissions to take a photo");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      setFormData(prev => ({ ...prev, photo: result.assets[0].uri }));
    }
    setShowPhotoOptions(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "We need gallery permissions to select a photo");
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      setFormData(prev => ({ ...prev, photo: result.assets[0].uri }));
    }
    setShowPhotoOptions(false);
  };

  // Service handling functions
  const addService = () => {
    if (currentService.trim()) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, currentService.trim()]
      }));
      setCurrentService('');
    }
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  // Form validation
  const validateForm = () => {
    const requiredFields = [
      { field: 'name', label: 'Full Name' },
      { field: 'expertise', label: 'Expertise' },
      { field: 'phone', label: 'Phone Number' },
      { field: 'email', label: 'Email' },
      { field: 'description', label: 'Professional Description' },
      { field: 'city', label: 'City' },
      { field: 'state', label: 'State' },
      { field: 'photo', label: 'Professional Photo' }
    ];

    for (const { field, label } of requiredFields) {
      if (!formData[field as keyof FormData]) {
        Alert.alert('Missing Information', `Please provide your ${label}`);
        return false;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      
      // Create form data for file upload
      const apiFormData = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'photo' && key !== 'services') {
          apiFormData.append(key, formData[key as keyof FormData] as string);
        }
      });
      
      // Add services as JSON string
      apiFormData.append('services', JSON.stringify(formData.services));
      
      // Add photo if available
      if (formData.photo) {
        const uriParts = formData.photo.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        apiFormData.append('photo', {
          uri: formData.photo,
          name: `pro_photo.${fileType}`,
          type: `image/${fileType}`
        } as any);
      }
      
      const response = await fetch(ServerEnvironment.becomeProEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': user.userId,
        },
        body: apiFormData
      });

      if (!response.ok) {
        throw new Error('Failed to submit professional application');
      }

      const data = await response.json();
      
      if (data.success) {
        // Show success message and then navigate to Chat screen
        Alert.alert(
          'Application Submitted',
          'Thank you for applying to be a professional. We are reviewing your application and will notify you shortly via email.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                // Update local status context
                checkProStatus();
                // Navigate back to Chat screen
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Chat' }],
                });
              } 
            }
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to become a professional');
      }
    } catch (error) {
      console.error('Error submitting professional application:', error);
      Alert.alert('Error', 'Failed to submit your application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Become a Professional" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Header Section */}
        <View style={styles.headerCard}>
          <LinearGradient
            colors={['#555', '#333']}
            style={styles.headerGradient}
          >
            <Image 
              source={require('../../../../assets/images/pro-icon.png')} 
              style={styles.headerImage}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Join Our Network of Professionals</Text>
            <Text style={styles.headerSubtitle}>
              Connect with homeowners who need your expertise and grow your business
            </Text>
          </LinearGradient>
        </View>
        
        {/* Photo Upload Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Profile Photo</Text>
          
          <View style={styles.photoSection}>
            {formData.photo ? (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: formData.photo }} style={styles.photoPreview} />
                <TouchableOpacity 
                  style={styles.changePhotoButton}
                  onPress={() => setShowPhotoOptions(true)}
                >
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.photoUploadButton}
                onPress={() => setShowPhotoOptions(true)}
              >
                <View style={styles.photoPlaceholder}>
                  <Icon name="camera" size={36} color="#999" />
                </View>
                <Text style={styles.photoUploadText}>
                  Upload Professional Photo
                  <Text style={styles.required}> *</Text>
                </Text>
                <Text style={styles.photoUploadSubtext}>
                  A professional photo helps build client trust
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Professional Details Form */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Professional Details</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Your full name"
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Your contact phone number"
              value={formData.phone}
              onChangeText={(text) => updateField('phone', text)}
              keyboardType="phone-pad"
            />
          </View>
          
          {/* Location Fields */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>City <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Your city"
              value={formData.city}
              onChangeText={(text) => updateField('city', text)}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>State <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity 
              style={styles.stateSelector}
              onPress={() => setShowStateModal(true)}
            >
              <Text style={formData.state ? styles.stateSelectorText : styles.statePlaceholder}>
                {formData.state || 'Select your state'}
              </Text>
              <Icon name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Expertise <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Real Estate Agent, Home Inspector"
              value={formData.expertise}
              onChangeText={(text) => updateField('expertise', text)}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Years of Experience</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5+ years"
              value={formData.experience}
              onChangeText={(text) => updateField('experience', text)}
              keyboardType="number-pad"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Professional Description <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell clients about your expertise and services"
              value={formData.description}
              onChangeText={(text) => updateField('description', text)}
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Services You Offer</Text>
            <View style={styles.serviceInputRow}>
              <TextInput
                style={[styles.input, styles.serviceInput]}
                placeholder="Add a service you offer"
                value={currentService}
                onChangeText={setCurrentService}
              />
              <TouchableOpacity style={styles.addButton} onPress={addService}>
                <Icon name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            {formData.services.length > 0 && (
              <View style={styles.serviceTagsContainer}>
                {formData.services.map((service, index) => (
                  <View key={index} style={styles.serviceTag}>
                    <Text style={styles.serviceTagText}>{service}</Text>
                    <TouchableOpacity 
                      style={styles.removeTagButton}
                      onPress={() => removeService(index)}
                    >
                      <Icon name="close" size={16} color="#777" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        
        {/* Benefits Section */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Benefits of Being a Pro</Text>
          
          <View style={styles.benefitItem}>
            <Icon name="checkmark-circle" size={24} color="#34C759" style={styles.benefitIcon} />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Direct Client Access</Text>
              <Text style={styles.benefitText}>Connect with property owners who need your expertise</Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <Icon name="calendar" size={24} color="#007AFF" style={styles.benefitIcon} />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Flexible Scheduling</Text>
              <Text style={styles.benefitText}>Accept jobs that fit your schedule and availability</Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <Icon name="briefcase" size={24} color="#FF9500" style={styles.benefitIcon} />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Expand Your Business</Text>
              <Text style={styles.benefitText}>Reach more clients and grow your professional network</Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <Icon name="cash" size={24} color="#30D158" style={styles.benefitIcon} />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Earn More Revenue</Text>
              <Text style={styles.benefitText}>Additional income stream from client consultations</Text>
            </View>
          </View>
        </View>

        {/* Agreement Section */}
        <View style={styles.agreementContainer}>
          <Text style={styles.agreementText}>
            By submitting this application, you agree to our 
            <Text style={styles.agreementLink}> Terms of Service </Text> 
            and 
            <Text style={styles.agreementLink}> Professional Guidelines</Text>
          </Text>
          
          <Text style={styles.certificationNote}>
            We will send you an email with instructions to upload any required professional certifications through our secure link.
          </Text>
        </View>
        
        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#555', '#333']}
            style={styles.submitGradient}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submit Application</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Photo Options Modal */}
      <Modal
        visible={showPhotoOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoOptions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPhotoOptions(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Professional Photo</Text>
            
            <TouchableOpacity style={styles.modalOption} onPress={openCamera}>
              <Icon name="camera" size={24} color="#555" />
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption} onPress={pickImage}>
              <Icon name="images" size={24} color="#555" />
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowPhotoOptions(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* State Selection Modal */}
      <Modal
        visible={showStateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStateModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStateModal(false)}
        >
          <View style={styles.stateModalContent}>
            <Text style={styles.modalTitle}>Select Your State</Text>
            
            <ScrollView style={styles.stateList}>
              {US_STATES.map(state => (
                <TouchableOpacity
                  key={state}
                  style={[
                    styles.stateOption,
                    formData.state === state && styles.stateOptionSelected
                  ]}
                  onPress={() => {
                    updateField('state', state);
                    setShowStateModal(false);
                  }}
                >
                  <Text style={[
                    styles.stateOptionText,
                    formData.state === state && styles.stateOptionTextSelected
                  ]}>
                    {state}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowStateModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 50,
  },
  headerCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
  },
  headerImage: {
    width: 80,
    height: 80,
    marginBottom: 16,
    tintColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#FFFFFFDD',
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  formGroup: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 15,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500',
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  serviceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceInput: {
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 6,
    margin: 4,
  },
  serviceTagText: {
    fontSize: 14,
    color: '#555',
    marginRight: 6,
  },
  removeTagButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  benefitIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  agreementContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  agreementText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  agreementLink: {
    color: '#007AFF',
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 40,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  // New styles for photo upload
  photoSection: {
    padding: 16,
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    borderStyle: 'dashed',
  },
  photoUploadButton: {
    alignItems: 'center',
  },
  photoUploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  photoUploadSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  photoPreviewContainer: {
    alignItems: 'center',
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
  },
  changePhotoText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  
  // New styles for state selector
  stateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
  },
  stateSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  statePlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  modalCancelButton: {
    marginTop: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  
  // State modal specific styles
  stateModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    height: '60%',
  },
  stateList: {
    marginBottom: 16,
  },
  stateOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  stateOptionSelected: {
    backgroundColor: '#F0F8FF',
  },
  stateOptionText: {
    fontSize: 16,
    color: '#333',
  },
  stateOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  
  // Certification note style
  certificationNote: {
    fontSize: 14,
    color: '#555',
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});