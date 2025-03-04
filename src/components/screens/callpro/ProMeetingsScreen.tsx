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
  Image,
  ScrollView,
  Modal
} from 'react-native';
import { ScreenHeader } from '../../common/ScreenHeader';
import Icon from '@expo/vector-icons/Ionicons';
import { ServerEnvironment } from '../../../config/server.config';
import { useNavigation } from '@react-navigation/native';
import { getCurrentUser } from '@aws-amplify/auth';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';

// Updated interface based on the sample data structure
interface Meeting {
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
  client_user_id: string;
  rejection_timestamp?: string;
  confirmed_timestamp?: string;
}

interface MeetingsResponse {
  status: string;
  meetings: Meeting[];
  meetingsByStatus: {
    waiting: Meeting[];
    approved: Meeting[];
    rejected: Meeting[];
    completed: Meeting[];
    cancelled: Meeting[];
    other: Meeting[];
  };
  total_meetings?: number;
  message?: string;
}

interface HandleRequestResponse {
  status: string;
  message: string;
}

// Tab type definition
type TabType = 'waiting' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'other';

// Add this interface for time slot selection
interface SelectedTimeSlot {
  date: string;
  startTime: string;
  endTime: string;
}

export const ProMeetingsScreen = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meetingsByStatus, setMeetingsByStatus] = useState<Record<TabType, Meeting[]>>({
    waiting: [],
    approved: [],
    rejected: [],
    completed: [],
    cancelled: [],
    other: []
  });
  const [activeTab, setActiveTab] = useState<TabType>('waiting');
  const [userId, setUserId] = useState<string | null>(null);

  // Add new state variables for time slot selection
  const [timeSlotModalVisible, setTimeSlotModalVisible] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<SelectedTimeSlot | null>(null);
  const [is15MinWindowModalVisible, setIs15MinWindowModalVisible] = useState(false);
  const [selected15MinSlot, setSelected15MinSlot] = useState<SelectedTimeSlot | null>(null);

  const fetchMeetings = useCallback(async () => {
    try {
      if (!userId) {
        const user = await getCurrentUser();
        setUserId(user.userId);
      }
      
      // Send a non-empty request body as the server expects it
      const response = await fetch(ServerEnvironment.readPendingMeetingsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userId || ''
        },
        body: JSON.stringify({ requestType: 'pendingMeetings' })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MeetingsResponse = await response.json();
      console.log('Meetings data:', data);
      
      if (data.status === "success") {
        setMeetings(data.meetings || []);
        
        // Set meetings by status if available from backend
        if (data.meetingsByStatus) {
          setMeetingsByStatus({
            waiting: data.meetingsByStatus.waiting || [],
            approved: data.meetingsByStatus.approved || [],
            rejected: data.meetingsByStatus.rejected || [],
            completed: data.meetingsByStatus.completed || [],
            cancelled: data.meetingsByStatus.cancelled || [],
            other: data.meetingsByStatus.other || []
          });
        } else {
          // Fallback: group meetings by status manually
          const groupedMeetings = groupMeetingsByStatus(data.meetings || []);
          setMeetingsByStatus(groupedMeetings);
        }
      } else {
        setMeetings([]);
        setMeetingsByStatus({
          waiting: [],
          approved: [],
          rejected: [],
          completed: [],
          cancelled: [],
          other: []
        });
        if (data.status === "error") {
          console.warn('Error from server:', data.message);
        }
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      Alert.alert(
        'Error',
        'Unable to load meetings. Please try again later.'
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  // Function to group meetings by status manually (fallback)
  const groupMeetingsByStatus = (meetingList: Meeting[]): Record<TabType, Meeting[]> => {
    const grouped: Record<TabType, Meeting[]> = {
      waiting: [],
      approved: [],
      rejected: [],
      completed: [],
      cancelled: [],
      other: []
    };
    
    meetingList.forEach(meeting => {
      const status = meeting.status.toLowerCase();
      if (status === 'waiting') {
        grouped.waiting.push(meeting);
      } else if (['approved', 'approve', 'confirmed', 'accept'].includes(status)) {
        grouped.approved.push(meeting);
      } else if (['rejected', 'reject', 'declined', 'deny'].includes(status)) {
        grouped.rejected.push(meeting);
      } else if (status === 'completed') {
        grouped.completed.push(meeting);
      } else if (status === 'cancelled') {
        grouped.cancelled.push(meeting);
      } else {
        grouped.other.push(meeting);
      }
    });
    
    return grouped;
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMeetings();
  }, [fetchMeetings]);

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
      fetchMeetings();
    }
  }, [userId, fetchMeetings]);

  // Modify handleMeetingRequest to include the selected time slot
  const handleMeetingRequest = async (requestId: string, action: 'approve' | 'reject', timeSlot?: SelectedTimeSlot) => {
    try {
      if (!userId) {
        throw new Error('User ID not available');
      }
      
      const actionText = action === 'approve' ? 'approve' : 'reject';
      
      if (action === 'approve' && !timeSlot) {
        // For approvals, first show the time slot selection modal
        const meeting = meetingsByStatus.waiting.find(m => m.request_id === requestId);
        if (meeting && meeting.availability_slots && meeting.availability_slots.length > 0) {
          setCurrentRequestId(requestId);
          setAvailableSlots(meeting.availability_slots);
          setTimeSlotModalVisible(true);
          return;
        }
      }
      
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
                    action: actionText,
                    selectedTimeSlot: timeSlot // Include the selected time slot in the request
                  })
                });
                
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data: HandleRequestResponse = await response.json();
                console.log(`Meeting ${actionText}ed:`, data);
                
                // Show popup with message from backend
                Alert.alert(
                  action === 'approve' ? 'Request Approved' : 'Request Rejected',
                  data.message || `The request has been ${actionText}ed successfully.`,
                  [
                    { 
                      text: 'OK', 
                      onPress: () => {
                        // Refresh the meetings list after dismissing the alert
                        fetchMeetings();
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
    // Now just initiates the time slot selection flow
    handleMeetingRequest(requestId, 'approve');
  };

  // New helper to confirm after selecting a time slot
  const confirmWithTimeSlot = (timeSlot: SelectedTimeSlot) => {
    if (currentRequestId && timeSlot) {
      setTimeSlotModalVisible(false);
      handleMeetingRequest(currentRequestId, 'approve', timeSlot);
      setCurrentRequestId(null);
    }
  };

  // Function to generate 15-minute time slots from the selected slot
  const generate15MinTimeSlots = (slot: SelectedTimeSlot) => {
    const startTime = new Date(slot.startTime);
    const endTime = new Date(slot.endTime);
    const slots: Array<SelectedTimeSlot> = [];
    
    let currentTime = new Date(startTime);
    while (currentTime.getTime() + 15 * 60000 <= endTime.getTime()) {
      const slotEndTime = new Date(currentTime.getTime() + 15 * 60000);
      slots.push({
        date: slot.date,
        startTime: currentTime.toISOString(),
        endTime: slotEndTime.toISOString()
      });
      currentTime = new Date(currentTime.getTime() + 15 * 60000);
    }
    
    return slots;
  };

  // Function to handle selecting a full time slot to break into 15-min windows
  const handleTimeSlotSelect = (slot: SelectedTimeSlot) => {
    setSelectedTimeSlot(slot);
    setIs15MinWindowModalVisible(true);
  };

  // Function to handle selecting a 15-min window
  const handle15MinWindowSelect = (slot: SelectedTimeSlot) => {
    setSelected15MinSlot(slot);
    setIs15MinWindowModalVisible(false);
    confirmWithTimeSlot(slot);
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

  // Tab configuration with icons and colors
  const tabConfig: Record<TabType, { icon: string; label: string; color: string; badgeColor: string }> = {
    waiting: { 
      icon: 'time', 
      label: 'Pending', 
      color: '#FF9500',
      badgeColor: '#FFF9ED',
    },
    approved: { 
      icon: 'checkmark-circle', 
      label: 'Approved', 
      color: '#34C759',
      badgeColor: '#F0FFF4',
    },
    rejected: { 
      icon: 'close-circle', 
      label: 'Rejected', 
      color: '#FF3B30',
      badgeColor: '#FFF5F5',
    },
    completed: { 
      icon: 'checkmark-done-circle', 
      label: 'Completed', 
      color: '#007AFF',
      badgeColor: '#F0F7FF',
    },
    cancelled: { 
      icon: 'ban', 
      label: 'Cancelled', 
      color: '#8E8E93',
      badgeColor: '#F6F6F6',
    },
    other: { 
      icon: 'help-circle', 
      label: 'Other', 
      color: '#5856D6',
      badgeColor: '#F5F4FF',
    }
  };

  const renderMeetingItem = ({ item }: { item: Meeting }) => {
    // Get first availability slot if available
    const firstSlot = item.availability_slots && item.availability_slots.length > 0 
      ? formatAvailabilitySlot(item.availability_slots[0])
      : 'No availability provided';
      
    // Format timestamp for display
    const requestDate = new Date(item.timestamp);
    const formattedRequestDate = format(requestDate, 'MMM d, yyyy');
    
    // Status handling
    const statusConfig = getStatusConfig(item.status);
    
    // Location string
    const location = item.city && item.state ? `${item.city}, ${item.state}` : 'Location not specified';
    
    return (
      <View style={styles.meetingCard}>
        <View style={[styles.meetingHeader, { backgroundColor: statusConfig.badgeColor }]}>
          <Icon name={statusConfig.icon} size={20} color={statusConfig.color} style={styles.statusIcon} />
          <Text style={[styles.statusBadge, { color: statusConfig.color }]}>{statusConfig.label}</Text>
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
          
          {/* Conditionally show additional timestamps based on status */}
          {item.confirmed_timestamp && (
            <View style={styles.detailRow}>
              <Icon name="checkmark-circle-outline" size={16} color="#34C759" style={styles.detailIcon} />
              <Text style={styles.detailText}>
                Approved on: {format(new Date(item.confirmed_timestamp), 'MMM d, yyyy')}
              </Text>
            </View>
          )}
          
          {item.rejection_timestamp && (
            <View style={styles.detailRow}>
              <Icon name="close-circle-outline" size={16} color="#FF3B30" style={styles.detailIcon} />
              <Text style={styles.detailText}>
                Rejected on: {format(new Date(item.rejection_timestamp), 'MMM d, yyyy')}
              </Text>
            </View>
          )}
          
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
        
        {/* Action buttons container - only show for waiting requests */}
        {item.status.toLowerCase() === 'waiting' && (
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
            
            {/* Approve button - changed label to "Select Time" */}
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => approveMeeting(item.request_id)}
            >
              <LinearGradient
                colors={['#34C759', '#2EAA4F']}
                style={styles.approveButtonGradient}
              >
                <Icon name="calendar" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Select Time</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Helper to get status configuration based on status string
  const getStatusConfig = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'waiting') {
      return tabConfig.waiting;
    } else if (['approved', 'approve', 'confirmed', 'accept'].includes(statusLower)) {
      return tabConfig.approved;
    } else if (['rejected', 'reject', 'declined', 'deny'].includes(statusLower)) {
      return tabConfig.rejected;
    } else if (statusLower === 'completed') {
      return tabConfig.completed;
    } else if (statusLower === 'cancelled') {
      return tabConfig.cancelled;
    } else {
      return tabConfig.other;
    }
  };

  const renderEmptyList = () => {
    let emptyMessage = 'No meetings found in this category.';
    let emptySubMessage = 'Check back later for updates.';
    
    switch (activeTab) {
      case 'waiting':
        emptyMessage = 'No Pending Requests';
        emptySubMessage = 'You don\'t have any client requests requiring approval at this time.';
        break;
      case 'approved':
        emptyMessage = 'No Approved Meetings';
        emptySubMessage = 'You haven\'t approved any meeting requests yet.';
        break;
      case 'rejected':
        emptyMessage = 'No Rejected Meetings';
        emptySubMessage = 'You haven\'t rejected any meeting requests.';
        break;
      case 'completed':
        emptyMessage = 'No Completed Meetings';
        emptySubMessage = 'You don\'t have any completed meetings yet.';
        break;
      case 'cancelled':
        emptyMessage = 'No Cancelled Meetings';
        emptySubMessage = 'You don\'t have any cancelled meetings.';
        break;
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Icon 
          name={tabConfig[activeTab].icon} 
          size={64} 
          color={tabConfig[activeTab].color} 
          style={styles.emptyIcon}
        />
        <Text style={styles.emptyTitle}>{emptyMessage}</Text>
        <Text style={styles.emptyText}>{emptySubMessage}</Text>
      </View>
    );
  };

  // Tab rendering
  const renderTabs = () => (
    <ScrollView 
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.tabsContainer}
      contentContainerStyle={styles.tabsContentContainer}
    >
      {(Object.keys(tabConfig) as TabType[]).map((tab) => {
        const isActive = activeTab === tab;
        const count = meetingsByStatus[tab]?.length || 0;
        
        return (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Icon 
              name={tabConfig[tab].icon} 
              size={18} 
              color={isActive ? tabConfig[tab].color : '#8E8E93'} 
            />
            <Text style={[
              styles.tabText,
              isActive && { color: tabConfig[tab].color, fontWeight: '600' }
            ]}>
              {tabConfig[tab].label}
            </Text>
            {count > 0 && (
              <View style={[
                styles.tabBadge, 
                { backgroundColor: tabConfig[tab].color }
              ]}>
                <Text style={styles.tabBadgeText}>{count}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  // New time slot selection modal
  const renderTimeSlotModal = () => (
    <Modal
      visible={timeSlotModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setTimeSlotModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.timeSlotModalContainer}>
          <View style={styles.timeSlotModalHeader}>
            <Text style={styles.timeSlotModalTitle}>Select Available Time</Text>
            <TouchableOpacity 
              onPress={() => setTimeSlotModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.timeSlotModalSubtitle}>
            Select a time slot from the client's availability:
          </Text>
          
          <ScrollView style={styles.timeSlotList}>
            {availableSlots.length > 0 ? (
              availableSlots.map((slot, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.timeSlotOption}
                  onPress={() => handleTimeSlotSelect(slot)}
                >
                  <View style={styles.timeSlotOptionContent}>
                    <Icon name="calendar" size={18} color={COLORS.primary} style={styles.timeSlotOptionIcon} />
                    <View style={styles.timeSlotOptionTextContainer}>
                      <Text style={styles.timeSlotOptionDate}>
                        {format(new Date(slot.date), 'EEE, MMM d, yyyy')}
                      </Text>
                      <Text style={styles.timeSlotOptionTime}>
                        {format(new Date(slot.startTime), 'h:mm a')} - {format(new Date(slot.endTime), 'h:mm a')}
                      </Text>
                    </View>
                    <Icon name="chevron-forward" size={20} color="#8E8E93" />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noSlotsText}>No time slots available for this request.</Text>
            )}
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setTimeSlotModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
  
  // New 15-minute window selection modal
  const render15MinWindowModal = () => {
    if (!selectedTimeSlot) return null;
    
    const timeWindows = generate15MinTimeSlots(selectedTimeSlot);
    
    return (
      <Modal
        visible={is15MinWindowModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIs15MinWindowModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timeSlotModalContainer}>
            <View style={styles.timeSlotModalHeader}>
              <Text style={styles.timeSlotModalTitle}>Select 15-Min Window</Text>
              <TouchableOpacity 
                onPress={() => setIs15MinWindowModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.timeSlotModalSubtitle}>
              Select a 15-minute window for this meeting:
            </Text>
            
            <Text style={styles.selectedDateText}>
              {format(new Date(selectedTimeSlot.date), 'EEEE, MMMM d, yyyy')}
            </Text>
            
            <ScrollView style={styles.timeSlotList}>
              {timeWindows.length > 0 ? (
                timeWindows.map((window, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.timeWindowOption}
                    onPress={() => handle15MinWindowSelect(window)}
                  >
                    <LinearGradient
                      colors={['#F8F9FA', '#EDF2F7']}
                      style={styles.timeWindowGradient}
                    >
                      <Icon name="time-outline" size={18} color={COLORS.primary} style={styles.timeWindowIcon} />
                      <Text style={styles.timeWindowText}>
                        {format(new Date(window.startTime), 'h:mm a')} - {format(new Date(window.endTime), 'h:mm a')}
                      </Text>
                      <View style={styles.timeWindowDuration}>
                        <Text style={styles.timeWindowDurationText}>15 min</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noSlotsText}>No 15-minute windows available for this time slot.</Text>
              )}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                setIs15MinWindowModalVisible(false);
                setTimeSlotModalVisible(true);
              }}
            >
              <Text style={styles.backButtonText}>Back to Time Slots</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Client Requests" />
      
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Loading meetings...</Text>
        </View>
      ) : (
        <>
          {renderTabs()}
          <FlatList
            data={meetingsByStatus[activeTab] || []}
            renderItem={renderMeetingItem}
            keyExtractor={(item) => item.request_id}
            contentContainerStyle={[
              styles.listContent,
              (meetingsByStatus[activeTab]?.length === 0) && styles.emptyListContent
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#4285F4']}
                tintColor="#4285F4"
              />
            }
            ListEmptyComponent={renderEmptyList}
          />
        </>
      )}
      
      {/* Render the modals */}
      {renderTimeSlotModal()}
      {render15MinWindowModal()}
    </SafeAreaView>
  );
};

// Define some color constants for consistency
const COLORS = {
  primary: '#2E5C8D',
  primaryDark: '#1E3F66',
  primaryLight: '#4A7DB3',
  accent: '#FF9500',
  success: '#34C759',
  error: '#FF3B30',
  background: '#F7F8FA',
  card: '#FFFFFF',
};

const styles = StyleSheet.create({
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
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  tabsContentContainer: {
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#F6F8FA',
  },
  tabText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  emptyListContent: {
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
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  statusIcon: {
    marginRight: 8,
  },
  statusBadge: {
    fontSize: 14,
    fontWeight: '600',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIcon: {
    opacity: 0.7,
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
  // Add new styles for time slot selection
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  timeSlotModalContainer: {
    backgroundColor: '#FFFFFF',
    width: '90%',
    borderRadius: 16,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    maxHeight: '80%',
  },
  timeSlotModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  timeSlotModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  timeSlotModalSubtitle: {
    fontSize: 15,
    color: '#666',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  timeSlotList: {
    maxHeight: 400,
    paddingHorizontal: 24,
  },
  timeSlotOption: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 12,
    overflow: 'hidden',
  },
  timeSlotOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  timeSlotOptionIcon: {
    marginRight: 14,
  },
  timeSlotOptionTextContainer: {
    flex: 1,
  },
  timeSlotOptionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timeSlotOptionTime: {
    fontSize: 14,
    color: '#555',
  },
  noSlotsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 30,
  },
  cancelButton: {
    marginTop: 20,
    marginHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  timeWindowOption: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timeWindowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  timeWindowIcon: {
    marginRight: 14,
  },
  timeWindowText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  timeWindowDuration: {
    backgroundColor: 'rgba(46, 92, 141, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  timeWindowDurationText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  backButton: {
    marginTop: 20,
    marginHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
