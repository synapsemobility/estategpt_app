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
  Switch
} from 'react-native';
import { ScreenHeader } from '../../common/ScreenHeader';
import Icon from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { getCurrentUser } from '@aws-amplify/auth';
import { ServerEnvironment } from '../../../config/server.config';
import { LinearGradient } from 'expo-linear-gradient';
import { useProStatus } from '../../../contexts/ProStatusContext';

// Updated interface based on the backend data structure
interface ProProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  response_time_hrs: number;
  calls_taken: number;
  review_count: number;
  rating: number;
  specialty_tags: string[];
  city: string;
  state: string;
  years_experience: number;
  expertise: string[];
  // Frontend-specific state
  availableForCalls: boolean;
  pendingMeetings?: number;
  recent_meetings?: number;
}

export const ProProfileScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [availableForCalls, setAvailableForCalls] = useState(false);
  const { checkProStatus } = useProStatus();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser();
      
      const response = await fetch(ServerEnvironment.getProProfileEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user.userId
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Pro profile data:', data);
      
      if (data.status === 'success' && data.isProfessional && data.profile) {
        // Transform backend data to match our frontend interface
        const profileData = data.profile;
        
        const transformedProfile: ProProfile = {
          ...profileData,
          availableForCalls: true, // Assume available by default
          pendingMeetings: 0, // Default value
        };
        
        setProfile(transformedProfile);
        setAvailableForCalls(transformedProfile.availableForCalls);
      } else {
        // Handle case where user is not a professional
        Alert.alert(
          'Not a Professional',
          'You do not have a professional profile. Would you like to become a pro?',
          [
            {
              text: 'Yes',
              onPress: () => navigation.navigate('BecomePro')
            },
            {
              text: 'No',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error fetching pro profile:', error);
      Alert.alert('Error', 'Failed to load profile information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = async (value: boolean) => {
    try {
      // Here you would update this on the backend
      setAvailableForCalls(value);
      
      // Update profile
      if (profile) {
        setProfile({
          ...profile,
          availableForCalls: value,
          status: value ? 'active' : 'away'
        });
      }
      
      // Display feedback
      Alert.alert(
        value ? 'Available for Calls' : 'Not Available for Calls',
        value 
          ? 'You are now visible to clients and can receive call requests.' 
          : 'You will not receive new call requests while in this mode.'
      );
      
      // Refresh pro status
      await checkProStatus();
      
    } catch (error) {
      console.error('Failed to update availability status:', error);
      Alert.alert('Error', 'Failed to update your availability status');
      
      // Revert the UI change if backend update fails
      setAvailableForCalls(!value);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Professional Profile" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#555" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get full name from first and last name
  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : '';
  
  // Get formatted experience (convert number to string with "years")
  const formattedExperience = profile ? `${profile.years_experience} years` : '';
  
  // Get location
  const location = profile ? `${profile.city}, ${profile.state}` : '';
  
  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader 
        title="Professional Profile" 
        // rightButton={
        //   <TouchableOpacity 
        //     style={styles.editButton}
        //     onPress={() => setIsEditing(!isEditing)}
        //   >
        //     <Text style={styles.editButtonText}>
        //       {isEditing ? 'Save' : 'Edit'}
        //     </Text>
        //   </TouchableOpacity>
        // }
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Profile Status Card */}
        <View style={styles.card}>
          <LinearGradient
            colors={['#555', '#333']}
            style={styles.statusCardGradient}
          >
            <View style={styles.statusHeader}>
              <View style={styles.statusBadgeContainer}>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: availableForCalls ? '#34C759' : '#FF9500' }
                ]} />
                <Text style={styles.statusText}>
                  {availableForCalls ? 'Active' : 'Away'}
                </Text>
              </View>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{profile?.rating || 0}</Text>
              </View>
            </View>
            
            <Text style={styles.profileName}>{fullName}</Text>
            <Text style={styles.profileExpertise}>{profile?.specialty_tags?.[0] || ''}</Text>
            <Text style={styles.profileLocation}>{location}</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile?.calls_taken || 0}</Text>
                <Text style={styles.statLabel}>Calls Taken</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile?.recent_meetings || 0}</Text>
                <Text style={styles.statLabel}>Recent Meetings</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formattedExperience}</Text>
                <Text style={styles.statLabel}>Experience</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.pendingRequestsButton}
              onPress={() => navigation.navigate('PendingCalls')}
            >
              <Icon name="notifications-outline" size={18} color="#FFFFFF" />
              <Text style={styles.pendingButtonText}>Pending Requests</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
        
        {/* Availability Toggle */}
        <View style={styles.card}>
          <View style={styles.toggleContainer}>
            <View style={styles.toggleInfo}>
              <Icon 
                name={availableForCalls ? "checkmark-circle" : "moon"} 
                size={24} 
                color={availableForCalls ? "#34C759" : "#FF9500"} 
              />
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleTitle}>Available for Calls</Text>
                <Text style={styles.toggleDescription}>
                  {availableForCalls 
                    ? "You're visible to clients and can receive calls" 
                    : "You won't receive new call requests"}
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#D1D1D6", true: "#34C75980" }}
              thumbColor={availableForCalls ? "#34C759" : "#F4F3F4"}
              ios_backgroundColor="#D1D1D6"
              onValueChange={handleStatusToggle}
              value={availableForCalls}
            />
          </View>
        </View>
        
        {/* Profile Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Response Time</Text>
            <Text style={styles.value}>{profile?.response_time_hrs || 0} hours</Text>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Reviews</Text>
            <View style={styles.reviewContainer}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.reviewRating}>{profile?.rating || 0}</Text>
              <Text style={styles.reviewCount}>({profile?.review_count || 0} reviews)</Text>
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Expertise</Text>
            <View style={styles.servicesList}>
              {profile?.expertise?.map((item, index) => (
                <View key={index} style={styles.serviceTag}>
                  <Text style={styles.serviceTagText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Specialties</Text>
            <View style={styles.servicesList}>
              {profile?.specialty_tags?.map((tag, index) => (
                <View key={index} style={styles.serviceTag}>
                  <Text style={styles.serviceTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{location}</Text>
          </View>
        </View>
      </ScrollView>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  statusCardGradient: {
    padding: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileExpertise: {
    color: '#FFFFFFCC',
    fontSize: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    color: '#FFFFFFCC',
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#FFFFFF40',
  },
  pendingRequestsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF20',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  pendingButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#666',
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
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 8,
  },
  serviceTag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  serviceTagText: {
    fontSize: 14,
    color: '#555',
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
  profileLocation: {
    color: '#FFFFFFCC',
    fontSize: 14,
    marginBottom: 16,
  },
  reviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRating: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginLeft: 6,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
});
