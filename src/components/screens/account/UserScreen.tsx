import React, { useState, useEffect } from 'react';
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
  SectionList,
  RefreshControl,
  Image,
  Modal
} from 'react-native';
import { ScreenHeader } from '../../common/ScreenHeader';
import Icon from '@expo/vector-icons/Ionicons';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { getCurrentUser } from '@aws-amplify/auth';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImageManipulator from 'expo-image-manipulator';
import { ServerEnvironment } from '../../../config/server.config';

const darkGray = 'rgba(26, 26, 26, 1)';
const baseURL = "https://chat.estategpt.io/api/users";

interface UserData {
  userID: string;
  name?: string;
  email?: string;
  property_address?: string;
  property_description?: string;
  daily_usage?: string;
  monthly_usage?: string;
  usage_limits?: string;
  phone_number?: string;
  subscription_plan?: string;
  account_created_date?: string;
  profile_photo?: string; // Add profile photo URL field
  profile_photo_url?: string; // Add this new field
}

interface RowProps {
  icon: keyof typeof Icon.glyphMap;
  title: string;
  value: string;
  onChangeText?: (text: string) => void;
  isEditable?: boolean;
  isEditing?: boolean;
}

const Row: React.FC<RowProps> = ({ icon, title, value, onChangeText, isEditable, isEditing }) => (
  <View style={styles.row}>
    <View style={styles.rowIconContainer}>
      <Icon name={icon} size={20} color={darkGray} />
    </View>
    <View style={styles.rowContent}>
      <Text style={styles.rowTitle}>{title}</Text>
      {isEditable && isEditing ? (
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={`Enter ${title}`}
        />
      ) : (
        <Text style={styles.rowValue}>{value}</Text>
      )}
    </View>
  </View>
);

type UserScreenRouteProp = RouteProp<{
  User: {
    userID: string;
  };
}, 'User'>;

// Updated function to handle profile photo URL
const getProfilePhotoUrl = (userData: UserData): string | null => {
  if (!userData) return null;
  
  // If there's a specific profile_photo_url field, use it directly
  if (userData.profile_photo_url) {
    return `${ServerEnvironment.baseURL}${userData.profile_photo_url}`;
  }
  
  // Fallback to profile_photo if it exists
  if (userData.profile_photo) {
    // If it's already a full URL, return it
    if (userData.profile_photo.startsWith('http')) {
      return userData.profile_photo;
    }
    
    // Otherwise prepend the base URL
    return `${ServerEnvironment.baseURL}${userData.profile_photo}`;
  }
  
  return null;
};

export const UserScreen = () => {
  const route = useRoute<UserScreenRouteProp>();
  const navigation = useNavigation();
  const { signOut } = useAuthenticator();
  
  const [userID, setUserID] = useState(route.params?.userID || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [photoChanged, setPhotoChanged] = useState(false);
  
  const [userData, setUserData] = useState<UserData>({
    userID: userID,
    name: '',
    email: '',
    property_address: '',
    property_description: '',
    daily_usage: '',
    monthly_usage: '',
    usage_limits: '',
    phone_number: '',
    subscription_plan: '',
    account_created_date: '',
    profile_photo: ''
  });

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchUserData(userID);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [userID]);

  useEffect(() => {
    const getUserID = async () => {
      try {
        const user = await getCurrentUser();
        setUserID(user.userId);
        fetchUserData(user.userId);
      } catch (error) {
        Alert.alert('Error', 'Could not get user information');
        navigation.goBack();
      }
    };
    
    getUserID();
  }, []);

  useEffect(() => {
    // Set profile photo from user data when it's loaded
    if (userData) {
      // Use our updated helper function
      setProfilePhoto(getProfilePhotoUrl(userData));
    }
  }, [userData]);

  const fetchUserData = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseURL}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': id
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUserData(data);
      
      // Use the updated helper function
      const photoUrl = getProfilePhotoUrl(data);
      console.log('Profile photo URL:', photoUrl);
      setProfilePhoto(photoUrl);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserData = async () => {
    setIsLoading(true);
    try {
      // Create FormData instead of JSON if we have a photo
      const formData = new FormData();
      
      // Add text fields
      formData.append('name', userData.name || '');
      formData.append('property_address', userData.property_address || '');
      formData.append('property_description', userData.property_description || '');
      formData.append('phone_number', userData.phone_number || '');
      
      // Add photo if it was changed
      if (photoChanged && profilePhoto) {
        try {
          const processedPhoto = await processImage(profilePhoto);
          
          // Extract file extension and mime type
          const mimeType = profilePhoto.endsWith('png') ? 'image/png' : 'image/jpeg';
          const extension = mimeType === 'image/png' ? 'png' : 'jpg';
          
          formData.append('profile_photo', {
            uri: processedPhoto,
            type: mimeType,
            name: `profile_photo.${extension}`,
          } as any);
        } catch (photoError) {
          console.error('Error processing photo:', photoError);
        }
      }

      // Make the request with FormData
      const response = await fetch(`${baseURL}/${userID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': userID
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUserData(data);
      setIsEditing(false);
      setPhotoChanged(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Process image for upload
  const processImage = async (imageUri: string) => {
    try {
      // Resize and compress the image
      const manipulateResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 300 } }], // Resize to reasonable profile photo size
        {
          compress: 0.7, // 70% quality
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return manipulateResult.uri;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  };

  // Launch image picker to select photo
  const selectImage = async () => {
    try {
      setShowPhotoOptions(false);
      
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant gallery access to select a photo');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for profile photo
        quality: 0.7,
      });
      
      if (!result.canceled) {
        setProfilePhoto(result.assets[0].uri);
        setPhotoChanged(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  // Take photo using camera
  const takePhoto = async () => {
    try {
      setShowPhotoOptions(false);
      
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant camera access to take a photo');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for profile photo
        quality: 0.7,
      });
      
      if (!result.canceled) {
        setProfilePhoto(result.assets[0].uri);
        setPhotoChanged(true);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  // Photo options modal
  const renderPhotoOptionsModal = () => (
    <Modal
      visible={showPhotoOptions}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowPhotoOptions(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowPhotoOptions(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Profile Photo</Text>
          
          <TouchableOpacity 
            style={styles.modalOption}
            onPress={takePhoto}
          >
            <Icon name="camera" size={24} color={darkGray} />
            <Text style={styles.modalOptionText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.modalOption}
            onPress={selectImage}
          >
            <Icon name="images" size={24} color={darkGray} />
            <Text style={styles.modalOptionText}>Choose from Gallery</Text>
          </TouchableOpacity>
          
          {profilePhoto && (
            <TouchableOpacity 
              style={[styles.modalOption, styles.removePhotoOption]}
              onPress={() => {
                setProfilePhoto(null);
                setPhotoChanged(true);
                setShowPhotoOptions(false);
              }}
            >
              <Icon name="trash" size={24} color="#FF3B30" />
              <Text style={[styles.modalOptionText, styles.removePhotoText]}>
                Remove Photo
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setShowPhotoOptions(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Custom profile header with photo
  const ProfileHeader = () => (
    <View style={styles.profileHeader}>
      <TouchableOpacity 
        style={styles.avatarContainer}
        onPress={() => isEditing && setShowPhotoOptions(true)}
        disabled={!isEditing}
      >
        {profilePhoto ? (
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: profilePhoto }} 
              style={styles.avatarImage}
              // Improved error handling with more details
              onError={(e) => {
                console.error('Error loading profile image:', e.nativeEvent.error);
                console.log('Failed to load:', profilePhoto);
                setProfilePhoto(null);
              }}
            />
            {isEditing && (
              <View style={styles.editOverlay}>
                <Icon name="camera" size={24} color="#FFFFFF" />
              </View>
            )}
          </View>
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userData.name?.[0]?.toUpperCase() || 'U'}</Text>
            {isEditing && (
              <View style={styles.editOverlay}>
                <Icon name="camera" size={24} color="#FFFFFF" />
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
      
      {/* Display name below avatar */}
      {userData.name && (
        <Text style={styles.profileName}>{userData.name}</Text>
      )}
      
      {/* Help text when in editing mode */}
      {isEditing && (
        <Text style={styles.editPhotoText}>
          Tap on photo to change
        </Text>
      )}
    </View>
  );

  // Create sections for the section list
  const sections = [
    {
      title: 'ACCOUNT',
      data: [
        {
          icon: 'person-outline',
          title: 'Name',
          value: userData.name || '',
          isEditable: true,
          key: 'name',
          onChangeText: (text: string) => setUserData({...userData, name: text})
        },
        {
          icon: 'mail',
          title: 'Email',
          value: userData.email || '',
          key: 'email'
        },
        {
          icon: 'call',
          title: 'Phone',
          value: userData.phone_number || '',
          isEditable: true,
          key: 'phone_number',
          onChangeText: (text: string) => setUserData({...userData, phone_number: text})
        }
      ]
    },
    {
      title: 'PROPERTY',
      data: [
        {
          icon: 'home',
          title: 'Address',
          value: userData.property_address || '',
          isEditable: true,
          key: 'property_address',
          onChangeText: (text: string) => setUserData({...userData, property_address: text})
        },
        {
          icon: 'document-text',
          title: 'Property Type',
          value: userData.property_description || '',
          isEditable: true,
          key: 'property_description',
          onChangeText: (text: string) => setUserData({...userData, property_description: text})
        }
      ]
    },
    {
      title: 'ESTATEGPT USAGE',
      data: [
        {
          icon: 'today',
          title: 'Daily',
          value: userData.daily_usage || '0',
          key: 'daily_usage'
        },
        {
          icon: 'calendar',
          title: 'Monthly',
          value: userData.monthly_usage || '0',
          key: 'monthly_usage'
        },
        {
          icon: 'speedometer',
          title: 'Limits',
          value: userData.usage_limits || 'Basic',
          key: 'usage_limits'
        }
      ]
    },
    {
      title: 'SUBSCRIPTION',
      data: [
        {
          icon: 'star',
          title: 'Plan',
          value: userData.subscription_plan || 'Free',
          key: 'subscription_plan'
        },
        {
          icon: 'calendar',
          title: 'Created',
          value: userData.account_created_date 
            ? new Date(userData.account_created_date).toLocaleDateString() 
            : 'N/A',
          key: 'account_created_date'
        }
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader 
        title="User Profile" 
        rightButton={
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => isEditing ? updateUserData() : setIsEditing(true)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={darkGray} />
            ) : (
              <Text style={styles.editButtonText}>{isEditing ? 'Save' : 'Edit'}</Text>
            )}
          </TouchableOpacity>
        }
      />

      {isLoading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={darkGray} />
          <Text style={styles.loaderText}>Loading profile...</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.key}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <Row
              icon={item.icon as keyof typeof Icon.glyphMap}
              title={item.title}
              value={item.value}
              onChangeText={item.onChangeText}
              isEditable={item.isEditable}
              isEditing={isEditing}
            />
          )}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={darkGray}
              colors={[darkGray]}
            />
          }
          ListHeaderComponent={<ProfileHeader />}
        />
      )}
      
      {renderPhotoOptionsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#F8F8F8',
    padding: 12,
    paddingHorizontal: 16,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EBEBEB',
  },
  rowIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  rowValue: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
    maxWidth: '60%',
  },
  input: {
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    flex: 1,
    marginLeft: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  editButtonText: {
    color: '#555555',
    fontSize: 14,
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EBEBEB',
  },
  avatarContainer: {
    marginVertical: 16,
  },
  avatarWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatar: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: darkGray,
    marginTop: 8,
  },
  editPhotoText: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 32,  // Extra padding at the bottom
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: darkGray,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EBEBEB',
  },
  modalOptionText: {
    fontSize: 16,
    color: darkGray,
    marginLeft: 12,
  },
  removePhotoOption: {
    borderBottomWidth: 0,
  },
  removePhotoText: {
    color: '#FF3B30',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: darkGray,
  },
  footerContainer: {
    padding: 16,
  },
  subscriptionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  subscriptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFF1F0',
    borderRadius: 8,
    marginBottom: 12,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
  },
  deleteAccountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  }
});