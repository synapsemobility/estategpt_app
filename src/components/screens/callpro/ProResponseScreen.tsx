import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from '@expo/vector-icons/Ionicons';
import { ServerEnvironment } from '../../../config/server.config';
import { getCurrentUser } from '@aws-amplify/auth';

interface RequestDetails {
  service_type: string;
  city: string;
  state: string;
  description: string;
}

interface Professional {
  id: string;
  first_name: string;
  last_name: string;
  response_time_hrs: number;
  calls_taken: number;
  review_count: number;
  rating: number;
  specialty_tags: string[];
  expertise: string[];
  city: string;
  state: string;
  years_experience: number;
}

interface ProResponse {
  status: string;
  professionals: Professional[];
  request_received: {
    service_type: string;
    city: string;
    state: string;
    description: string;
  };
  total_matches: number;
}

type RootStackParamList = {
  Chat: { userID: string | undefined };
  CallPro: {
    image?: string;
    availability?: string[];
  };
  ProResponse: {
    response: string;
    serviceType: string;
    location: string;
    requestDetails: {
      service_type: string;
      city: string;
      state: string;
      description: string;
    };
    image?: string;
    availability?: string[];
  };
  ScheduledCalls: undefined;
};

type ProResponseScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProResponse'>;
type ProResponseScreenRouteProp = RouteProp<RootStackParamList, 'ProResponse'>;

export const ProResponseScreen = () => {
    const navigation = useNavigation<ProResponseScreenNavigationProp>();
    const route = useRoute<ProResponseScreenRouteProp>();

    const [userID, setUserID] = useState<string>('');
    
    useEffect(() => {
      console.log("ProResponseScreen received params:", route.params);
    }, [route.params]);

    // Add error handling for JSON parsing
    let data: ProResponse;
    try {
      console.log('Raw response:', route.params.response); // Debug log
      data = JSON.parse(route.params.response);
    } catch (error) {
      console.error('JSON Parse error:', error);
      // Provide a fallback or show an error state
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Error</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={[styles.container, styles.errorContainer]}>
            <Text style={styles.errorText}>Unable to load professional data.</Text>
            <TouchableOpacity 
              style={styles.newRequestButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.newRequestButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    const [selectedPros, setSelectedPros] = useState<Map<string, number>>(new Map());
    const [isScheduling, setIsScheduling] = useState(false);
    
    // Function to handle priority selection
    const handlePrioritySelect = (proId: string, priority: number) => {
      const newSelections = new Map(selectedPros);
      
      // If already selected with same priority, remove it
      if (selectedPros.get(proId) === priority) {
        newSelections.delete(proId);
      } else {
        // Add/update priority
        newSelections.set(proId, priority);
      }
      
      setSelectedPros(newSelections);
    };

    // Function to handle scheduling
    const handleSchedule = async () => {
      if (selectedPros.size === 0) return;
      
      setIsScheduling(true);
      
      try {
        // Get the current user
        const user = await getCurrentUser();
        
        // Create FormData instance
        const formData = new FormData();
        
        // Add the request details and professionals as a JSON string
        const requestData = {
          request_details: {
            service_type: route.params.requestDetails.service_type,
            city: route.params.requestDetails.city,
            state: route.params.requestDetails.state,
            description: route.params.requestDetails.description,
            availability_slots: route.params.availability || [],
          },
          selected_professionals: Array.from(selectedPros.entries()).map(([proId, priority]) => ({
            professional_id: proId,
            priority: priority
          }))
        };
        
        // Append the JSON data
        formData.append('data', JSON.stringify(requestData));
        
        // Append the image if it exists
        if (route.params.image) {
          const imageUri = route.params.image;
          const filename = imageUri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename || '');
          const type = match ? `image/${match[1]}` : 'image';
          
          formData.append('image', {
            uri: imageUri,
            name: filename,
            type,
          } as any);
        }
        
        // Send the formData with Authorization header
        const response = await fetch(ServerEnvironment.scheduleProEndpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'Authorization': user.userId, // Add the Authorization header
          },
          body: formData,
        });

        const data = await response.json();
        setIsScheduling(false);
        console.log("Response from backend:", data);
        
        Alert.alert(
          "Success",
          "Your request has been scheduled successfully. We will get back to you shortly with call confirmation.",
          [{ text: "OK" }]
        );
      } catch (error) {
        setIsScheduling(false);
        console.error('Scheduling error:', error);
        
        Alert.alert(
          "Scheduling Failed",
          "There was a problem scheduling your request. Please try again.",
          [{ text: "OK" }]
        );
      }
    };

    const renderRatingStars = (rating: number) => {
      return (
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Icon
              key={star}
              name={star <= rating ? 'star' : 'star-outline'}
              size={16}
              color={star <= rating ? '#FFB800' : '#CCCCCC'}
              style={styles.starIcon}
            />
          ))}
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
      );
    };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Found {data.total_matches} Pro{data.total_matches !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity
          style={[
            styles.scheduleButton,
            selectedPros.size === 0 && styles.scheduleButtonDisabled
          ]}
          disabled={selectedPros.size === 0 || isScheduling}
          onPress={handleSchedule}
        >
          {isScheduling ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="call" size={16} color="#FFFFFF" />
              <Text style={styles.scheduleButtonText}>Schedule</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Select your pro in priority and we will setup your request as per your priority as soon as possible! Select up to 5.
        </Text>
      </View>

      <ScrollView style={styles.container}>
        {data.professionals.map((pro) => (
          <View key={pro.id} style={styles.proCard}>
            <View style={styles.proHeader}>
              <View style={styles.proInfo}>
                <View style={styles.proInitials}>
                  <Text style={styles.initialsText}>
                    {pro.first_name[0]}{pro.last_name[0]}
                  </Text>
                </View>
                <View style={styles.proDetails}>
                  <Text style={styles.proName}>
                    {pro.first_name} {pro.last_name}
                  </Text>
                  {renderRatingStars(pro.rating)}
                </View>
              </View>
              <View style={styles.prioritySelector}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.priorityButton,
                      selectedPros.get(pro.id) === num && styles.priorityButtonSelected
                    ]}
                    onPress={() => handlePrioritySelect(pro.id, num)}
                  >
                    <Text style={[
                      styles.priorityButtonText,
                      selectedPros.get(pro.id) === num && styles.priorityButtonTextSelected
                    ]}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Icon name="time-outline" size={16} color="#555555" />
                <Text style={styles.statText}>{pro.response_time_hrs}h response</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="call-outline" size={16} color="#555555" />
                <Text style={styles.statText}>{pro.calls_taken} calls</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="star-outline" size={16} color="#555555" />
                <Text style={styles.statText}>{pro.review_count} reviews</Text>
              </View>
            </View>

            <View style={styles.tagsContainer}>
              {pro.specialty_tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <View style={styles.expertiseContainer}>
              <Text style={styles.expertiseTitle}>Expertise:</Text>
              {pro.expertise.map((exp, index) => (
                <View key={index} style={styles.expertiseItem}>
                  <Icon name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.expertiseText}>{exp}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.newRequestButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="add-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.newRequestButtonText}>New Request</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  placeholder: {
    width: 70, // Same width as back button for centering
  },
  container: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 10,
  },
  summaryContent: {
    padding: 16,
  },
  summaryRow: {
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
  },
  proCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  proHeader: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  proInitials: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#555555',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  initialsText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  proInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  proName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#555555',
  },
  expertiseContainer: {
    marginBottom: 16,
  },
  expertiseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  expertiseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  expertiseText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
  },
  contactButton: {
    backgroundColor: '#555555',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  newRequestButton: {
    backgroundColor: '#555555',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 24,
  },
  newRequestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  scheduleButton: {
    backgroundColor: '#34C759', // iOS green color
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 6,
  },
  scheduleButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionContainer: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  instructionText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    textAlign: 'center',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  priorityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  priorityButtonSelected: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  priorityButtonText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  priorityButtonTextSelected: {
    color: '#FFFFFF',
  },
  proDetails: {
    flex: 1,
    marginLeft: 12,
  },
}); 