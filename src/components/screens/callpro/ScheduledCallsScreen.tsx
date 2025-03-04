import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/Ionicons';
import { ScreenHeader } from '../../common/ScreenHeader';
import { getCurrentUser } from '@aws-amplify/auth';
import { ServerEnvironment } from '../../../config/server.config';
import { LinearGradient } from 'expo-linear-gradient';

const darkGray = 'rgba(26, 26, 26, 1)';

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
}

// Update the Meeting interface to match backend data structure
interface Meeting {
  request_id: string;
  timestamp: string;
  user_id: string;
  request_details: {
    service_type: string;
    city: string;
    state: string;
    description: string;
    availability_slots: TimeSlot[];
  };
  selected_professionals: Array<{
    professional_id: string;
    priority: number;
  }>;
  status: string;
}

interface ServerResponse {
  status: string;
  total_meetings: number;
  meetings: Meeting[];
}

interface RowProps {
  icon: keyof typeof Icon.glyphMap;
  title: string;
  value: string;
  status?: string;
}

const Row: React.FC<RowProps> = ({ icon, title, value, status }) => (
  <View style={styles.row}>
    <View style={styles.rowIconContainer}>
      <Icon name={icon} size={20} color={darkGray} />
    </View>
    <View style={styles.rowContent}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowValue}>{value}</Text>
      {status && (
        <StatusBadge status={status} />
      )}
    </View>
  </View>
);

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return '#00A86B'; // Rich green
    case 'pending':
      return '#FF9500'; // Bright orange
    case 'waiting':
      return '#007AFF'; // iOS blue
    case 'cancelled':
      return '#FF3B30'; // iOS red
    case 'completed':
      return '#8E8E93'; // Gray
    default:
      return '#8E8E93'; // Gray
  }
};

const formatTimeSlot = (slot: TimeSlot) => {
  const startTime = new Date(slot.startTime);
  const endTime = new Date(slot.endTime);
  
  return `${startTime.toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true 
  })} - ${endTime.toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true 
  })}`;
};

interface SectionState {
  [key: string]: boolean;
}

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium' | 'large';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  const iconSize = size === 'small' ? 12 : size === 'medium' ? 16 : 20;
  const fontSize = size === 'small' ? 10 : size === 'medium' ? 12 : 14;
  
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'waiting': return 'hourglass';
      case 'cancelled': return 'close-circle';
      case 'completed': return 'checkmark-done-circle';
      default: return 'help-circle';
    }
  };
  
  return (
    <View style={[
      styles.statusBadge, 
      { backgroundColor: getStatusColor(status) + '15' },
      size === 'small' && styles.statusBadgeSmall,
      size === 'large' && styles.statusBadgeLarge
    ]}>
      <Icon 
        name={getStatusIcon(status)} 
        size={iconSize} 
        color={getStatusColor(status)} 
        style={styles.statusIcon}
      />
      <Text style={[
        styles.statusText, 
        { color: getStatusColor(status), fontSize },
        size === 'small' && styles.statusTextSmall,
        size === 'large' && styles.statusTextLarge
      ]}>
        {status}
      </Text>
    </View>
  );
};

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = width - (CARD_MARGIN * 2);

export const ScheduledCallsScreen = () => {
  const [userID, setUserID] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const navigation = useNavigation();

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateHeader = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const fetchMeetings = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(ServerEnvironment.readScheduledMeetingsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': id
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Meetings data:', data);  // Log the data for debugging
      
      if (data.status === 'success') {
        setMeetings(data.meetings || []);
      } else {
        throw new Error(data.status);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getUserID = async () => {
      try {
        const user = await getCurrentUser();
        setUserID(user.userId);
        fetchMeetings(user.userId);
      } catch (error) {
        Alert.alert('Error', 'Could not get user information');
        navigation.goBack();
      }
    };
    
    getUserID();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchMeetings(userID);
    } catch (error) {
      console.error('Error refreshing meetings:', error);
    } finally {
      setRefreshing(false);
    }
  }, [userID]);

  // Updated code to safely access availability slots
  const getFirstAvailabilitySlot = (meeting: Meeting) => {
    if (meeting.request_details && 
        meeting.request_details.availability_slots && 
        meeting.request_details.availability_slots.length > 0) {
      return meeting.request_details.availability_slots[0];
    }
    return null;
  };

  // Group meetings by date
  const sections = meetings.reduce((acc, meeting) => {
    // Safely get the slot
    const firstSlot = getFirstAvailabilitySlot(meeting);
    // Use slot date or fallback to meeting timestamp
    const startDate = firstSlot?.date || meeting.timestamp;
    const dateKey = startDate.split('T')[0]; // Get just the date part
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(meeting);
    return acc;
  }, {} as Record<string, Meeting[]>);

  // Convert to array and sort by date
  const sortedSections = Object.entries(sections)
    .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
    .map(([date, dateMeetings]) => ({
      title: formatDateHeader(date),
      data: dateMeetings.map(meeting => ({
        meeting,
        rows: [
          {
            icon: 'construct-outline' as const,
            title: 'Service',
            value: meeting.request_details?.service_type || 'Service not specified',
          },
          {
            icon: 'location-outline' as const,
            title: 'Location',
            value: `${meeting.request_details?.city || 'Unknown'}, ${meeting.request_details?.state || ''}`,
          },
          {
            icon: 'time-outline' as const,
            title: 'Times',
            value: meeting.request_details?.availability_slots?.map(slot => formatTimeSlot(slot)).join('\n') || 'Time not specified',
          },
          {
            icon: 'document-text-outline' as const,
            title: 'Details',
            value: meeting.request_details?.description || 'No details provided',
          },
          {
            icon: 'people-outline' as const,
            title: 'Pros',
            value: `${meeting.selected_professionals?.length || 0} selected`,
          }
        ],
        status: meeting.status
      }))
    }));

  const startVideoCall = (meeting: Meeting) => {
    if (meeting.status.toLowerCase() !== 'confirmed') {
      Alert.alert(
        'Call Not Available', 
        'Video calls are only available for confirmed meetings.'
      );
      return;
    }
  
    navigation.navigate('VideoCall', {
      meetingId: meeting.request_id,
      roomName: `meeting-${meeting.request_id}`,
      professionalName: 'Real Estate Pro', // You can update this with actual pro name if available
    });
  };

  const renderMeetingCard = ({ item }: { item: any }) => {
    const statusColor = getStatusColor(item.meeting.status);
    const isConfirmed = item.meeting.status.toLowerCase() === 'confirmed';
    
    // Safely get the first availability slot
    const firstSlot = getFirstAvailabilitySlot(item.meeting);
    
    return (
      <View style={styles.meetingCard}>
        <LinearGradient
          colors={[statusColor + '15', statusColor + '05']}
          style={styles.cardGradient}
        >
          <View style={styles.meetingHeader}>
            <View style={styles.headerTop}>
              <StatusBadge status={item.meeting.status} size="medium" />
              <View style={styles.timeContainer}>
                <Icon name="time-outline" size={14} color="#666" style={{marginRight: 4}} />
                <Text style={styles.timeText}>
                  {firstSlot ? formatTimeSlot(firstSlot) : 'Time not set'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.meetingTitle}>
              {item.meeting.request_details?.service_type || 'Service not specified'}
            </Text>
            <View style={styles.locationContainer}>
              <Icon name="location-outline" size={14} color="#666" style={{marginRight: 4}} />
              <Text style={styles.locationText}>
                {item.meeting.request_details?.city || 'Unknown'}, 
                {item.meeting.request_details?.state || ''}
              </Text>
            </View>
          </View>

          <View style={[styles.separator, { backgroundColor: statusColor + '30' }]} />

          <View style={styles.meetingDetails}>
            <View style={styles.detailRow}>
              <View style={[styles.detailIconContainer, { backgroundColor: statusColor + '20' }]}>
                <Icon name="document-text-outline" size={18} color={statusColor} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Details</Text>
                <Text style={styles.detailText} numberOfLines={2}>
                  {item.meeting.request_details?.description || 'No description provided'}
                </Text>
              </View>
            </View>
            
            {firstSlot && (
              <View style={styles.detailRow}>
                <View style={[styles.detailIconContainer, { backgroundColor: statusColor + '20' }]}>
                  <Icon name="calendar-outline" size={18} color={statusColor} />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailText}>
                    {new Date(firstSlot.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <View style={[styles.detailIconContainer, { backgroundColor: statusColor + '20' }]}>
                <Icon name="people-outline" size={18} color={statusColor} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Professionals</Text>
                <Text style={styles.detailText}>{item.meeting.selected_professionals?.length || 0} selected</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.videoCallButton,
                !isConfirmed && styles.disabledButton,
                { flex: 1 } // Make button take up full width
              ]}
              onPress={() => startVideoCall(item.meeting)}
              disabled={!isConfirmed}
            >
              <Icon name="videocam" size={18} color={isConfirmed ? "#FFFFFF" : "#999"} />
              <Text style={[
                styles.videoCallText,
                !isConfirmed && styles.disabledText
              ]}>
                {isConfirmed ? "Join Call" : "Call Unavailable"}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderSectionHeader = ({ section: { title } }) => (
    <TouchableOpacity 
      style={[
        styles.sectionHeader,
        expandedSections[title] && styles.sectionHeaderExpanded
      ]}
      onPress={() => toggleSection(title)}
    >
      <LinearGradient
        colors={['#f8f8f8', '#efefef']}
        style={styles.sectionHeaderGradient}
      >
        <View style={styles.sectionHeaderContent}>
          <Icon 
            name="calendar" 
            size={18} 
            color="#444" 
            style={styles.sectionHeaderIcon}
          />
          <Text style={styles.sectionHeaderText}>{title}</Text>
        </View>
        <View style={styles.sectionHeaderRight}>
          <Icon 
            name={expandedSections[title] ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#666"
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Image 
        source={require('../../../../assets/images/empty-calendar.png')}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text style={styles.emptyTitle}>No Scheduled Meetings</Text>
      <Text style={styles.emptyText}>
        When you schedule meetings with professionals, they will appear here.
      </Text>
      <TouchableOpacity
        style={styles.findProButton}
        onPress={() => navigation.navigate('CallPro' as never)}
      >
        <LinearGradient
          colors={['#333', '#111']}
          style={styles.gradientButton}
        >
          <Icon name="search" size={18} color="#fff" style={{marginRight: 8}} />
          <Text style={styles.findProButtonText}>Find a Professional</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Scheduled Meetings" />
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#333" />
          <Text style={styles.loaderText}>Loading meetings...</Text>
        </View>
      ) : (
        <SectionList
          sections={sortedSections}
          keyExtractor={(item, index) => item.meeting.request_id + index}
          renderItem={({ item, section }) => (
            expandedSections[section.title] ? renderMeetingCard({ item }) : null
          )}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={true}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#333"
              colors={["#333"]}
            />
          }
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingBottom: 32,
  },
  sectionHeader: {
    marginBottom: 4,
    borderRadius: 0,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeaderGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 14,
  },
  sectionHeaderExpanded: {
    backgroundColor: '#E0E0E0',
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderIcon: {
    marginRight: 8,
    color: '#555',
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#444',
  },
  
  // Meeting card styles
  meetingCard: {
    margin: CARD_MARGIN,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardGradient: {
    borderRadius: 12,
  },
  meetingHeader: {
    padding: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  separator: {
    height: 1.5,
    width: CARD_WIDTH - 32,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 8,
  },
  meetingDetails: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'center', // Center the button
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12, // Increased padding for better touch area
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
  },
  videoCallButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  disabledText: {
    color: '#999',
  },
  videoCallText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Status badge styles
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 16,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusTextSmall: {
    fontSize: 10,
  },
  statusTextLarge: {
    fontSize: 14,
  },
  
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 500,
    backgroundColor: '#FAFAFA',
  },
  emptyImage: {
    width: width * 0.6,
    height: width * 0.6,
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  findProButton: {
    width: '80%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  findProButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Loader styles
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});