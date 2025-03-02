import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image
} from 'react-native';
import { ScreenHeader } from '../../common/ScreenHeader';
import Icon from '@expo/vector-icons/Ionicons';
import { ServerEnvironment } from '../../../config/server.config';
import { useNavigation } from '@react-navigation/native';
import { getCurrentUser } from '@aws-amplify/auth';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

// Updated interface based on the sample data structure
interface PendingMeeting {
  request_id: string;
  timestamp: string;
  service_type: string;
  city: string;
  state: string;
  description: string;
  availability_slots: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  priority: string | number;
  status: string;
  customer_user_id: string;
}

interface PendingMeetingResponse {
  status: string;
  total_meetings?: number;
  message?: string;
  meetings: PendingMeeting[];
}

interface HandleRequestResponse {
  status: string;
  message: string;
}

export const PendingCallsScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingMeetings, setPendingMeetings] = useState<PendingMeeting[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchPendingMeetings = useCallback(async () => {
    try {
      if (!userId) {
        const user = await getCurrentUser();
        setUserId(user.userId);
      }
      
      // Fix: Send a non-empty request body as the server expects it
      const response = await fetch(ServerEnvironment.readPendingMeetingsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userId || ''
        },
        body: JSON.stringify({ requestType: 'pendingMeetings' }) // Non-empty object
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PendingMeetingResponse = await response.json();
      console.log('Pending meetings data:', data);
      
      if (data.status === "success" && Array.isArray(data.meetings)) {
        setPendingMeetings(data.meetings);
      } else {
        setPendingMeetings([]);
        if (data.status === "error") {
          console.warn('Error from server:', data.message);
        }
      }
    } catch (error) {
      console.error('Error fetching pending meetings:', error);
      Alert.alert(
        'Error',
        'Unable to load pending requests. Please try again later.'
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPendingMeetings();
  }, [fetchPendingMeetings]);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const user = await getCurrentUser();
        setUserId(user.userId);
      } catch (error) {
        console.error('Error getting current user:', error);
      }
    };
    
    initializeUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchPendingMeetings();
    }
  }, [userId, fetchPendingMeetings]);

  const handleMeetingRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      if (!userId) {
        throw new Error('User ID not available');
      }
      
      const actionText = action === 'approve' ? 'approve' : 'reject';
      const confirmTitle = action === 'approve' ? 'Approve Request' : 'Reject Request';
      const confirmMessage = action === 'approve' 
        ? 'Are you sure you want to approve this client request?' 
        : 'Are you sure you want to reject this client request?';
      
      // Display confirmation dialog
      Alert.alert(
        confirmTitle,
        confirmMessage,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: actionText === 'approve' ? 'Approve' : 'Reject', 
            style: actionText === 'approve' ? "default" : "destructive",
            onPress: async () => {
              setIsLoading(true);
              
              try {
                const response = await fetch(ServerEnvironment.handleMeetingRequestEndpoint, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': userId
                  },
                  body: JSON.stringify({
                    request_id: requestId,
                    action: actionText
                  })
                });
                
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data: HandleRequestResponse = await response.json();
                console.log(`Meeting ${actionText}ed:`, data);
                
                // Remove the handled meeting from the list
                setPendingMeetings(meetings => 
                  meetings.filter(meeting => meeting.request_id !== requestId)
                );
                
                // Show popup with message from backend
                Alert.alert(
                  action === 'approve' ? 'Request Approved' : 'Request Rejected',
                  data.message || `The request has been ${actionText}ed successfully.`,
                  [
                    { 
                      text: 'OK', 
                      onPress: () => {
                        // Refresh the pending requests list after dismissing the alert
                        fetchPendingMeetings();
                      }
                    }
                  ]
                );
              } catch (error) {
                console.error(`Error ${actionText}ing meeting:`, error);
                Alert.alert(
                  'Error',
                  `Unable to ${actionText} this request. Please try again later.`
                );
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error(`Error handling meeting request:`, error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again later.'
      );
      setIsLoading(false);
    }
  };

  const approveMeeting = (requestId: string) => {
    handleMeetingRequest(requestId, 'approve');
  };

  const rejectMeeting = (requestId: string) => {
    handleMeetingRequest(requestId, 'reject');
  };

  const formatAvailabilitySlot = (slot: { date: string; startTime: string; endTime: string }) => {
    try {
      // Update to handle the camelCase format from the sample data
      const dateObj = new Date(slot.date);
      const startTimeObj = new Date(slot.startTime);
      const endTimeObj = new Date(slot.endTime);
      
      const formattedDate = format(dateObj, 'EEE, MMM d, yyyy');
      const formattedStartTime = format(startTimeObj, 'h:mm a');
      const formattedEndTime = format(endTimeObj, 'h:mm a');
      
      return `${formattedDate} · ${formattedStartTime} - ${formattedEndTime}`;
    } catch (e) {
      console.error('Date formatting error:', e);
      return 'Invalid date/time';
    }
  };

  const renderMeetingItem = ({ item }: { item: PendingMeeting }) => {
    // Get first availability slot if available
    const firstSlot = item.availability_slots && item.availability_slots.length > 0 
      ? formatAvailabilitySlot(item.availability_slots[0])
      : 'No availability provided';
      
    // Format timestamp for display
    const requestDate = new Date(item.timestamp);
    const formattedRequestDate = format(requestDate, 'MMM d, yyyy');
    
    // Location string
    const location = item.city && item.state ? `${item.city}, ${item.state}` : 'Location not specified';
    
    return (
      <View style={styles.meetingCard}>
        <View style={styles.meetingHeader}>
          <Icon name="time" size={20} color="#FF9500" style={styles.statusIcon} />
          <Text style={styles.pendingBadge}>Pending Approval</Text>
        </View>
        
        <View style={styles.meetingContent}>
          <Text style={styles.serviceType}>{item.service_type || 'Service Not Specified'}</Text>
          
          <View style={styles.detailRow}>
            <Icon name="calendar" size={16} color="#555" style={styles.detailIcon} />
            <Text style={styles.detailText}>{firstSlot}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="location" size={16} color="#555" style={styles.detailIcon} />
            <Text style={styles.detailText}>{location}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="alert-circle" size={16} color="#555" style={styles.detailIcon} />
            <Text style={styles.detailText}>Priority: {item.priority || 'Normal'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="calendar-outline" size={16} color="#555" style={styles.detailIcon} />
            <Text style={styles.detailText}>Requested on: {formattedRequestDate}</Text>
          </View>
          
          {item.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Request Details:</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          )}
          
          {/* Show all available time slots */}
          {item.availability_slots && item.availability_slots.length > 1 && (
            <View style={styles.availabilityContainer}>
              <Text style={styles.availabilityLabel}>Available Times:</Text>
              {item.availability_slots.map((slot, index) => (
                <View key={index} style={styles.timeSlot}>
                  <Icon name="time-outline" size={14} color="#555" style={styles.timeSlotIcon} />
                  <Text style={styles.timeSlotText}>{formatAvailabilitySlot(slot)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        
        {/* Action buttons container */}
        <View style={styles.actionButtonsContainer}>
          {/* Reject button */}
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => rejectMeeting(item.request_id)}
          >
            <LinearGradient
              colors={['#FF3B30', '#E62E24']}
              style={styles.rejectButtonGradient}
            >
              <Icon name="close" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Reject</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          {/* Approve button */}
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => approveMeeting(item.request_id)}
          >
            <LinearGradient
              colors={['#34C759', '#2EAA4F']}
              style={styles.approveButtonGradient}
            >
              <Icon name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Approve</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Image 
        source={require('../../../../assets/images/empty-calendar.png')}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text style={styles.emptyTitle}>No Pending Requests</Text>
      <Text style={styles.emptyText}>
        You don't have any client requests requiring approval at this time.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Pending Requests" />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#555555" />
          <Text style={styles.loadingText}>Loading pending requests...</Text>
        </View>
      ) : (
        <FlatList
          data={pendingMeetings}
          renderItem={renderMeetingItem}
          keyExtractor={(item) => item.request_id}
          contentContainerStyle={[
            styles.listContent,
            pendingMeetings.length === 0 && styles.emptyListContent
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#555555']}
              tintColor="#555555"
            />
          }
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ...existing styles...
  
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  timeSlotIcon: {
    marginRight: 6,
  },
  timeSlotText: {
    fontSize: 14,
    color: '#555555',
  },
  availabilityContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  availabilityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 8,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555555',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  meetingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  meetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF9ED',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE7B9',
  },
  statusIcon: {
    marginRight: 8,
  },
  pendingBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9500',
  },
  meetingContent: {
    padding: 16,
  },
  serviceType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#555555',
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555555',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  approveButton: {
    borderRadius: 0,
    overflow: 'hidden',
  },
  approveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyImage: {
    width: 120,
    height: 120,
    opacity: 0.8,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButtonsContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
  },
  approveButton: {
    flex: 1,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  approveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  rejectButton: {
    flex: 1,
    borderBottomLeftRadius: 16,
    overflow: 'hidden',
    borderRightWidth: 1,
    borderRightColor: '#FFFFFF',
  },
  rejectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
