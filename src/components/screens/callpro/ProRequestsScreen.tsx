import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
  Dimensions,
  Modal,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/Ionicons';
import { ScreenHeader } from '../../common/ScreenHeader';
import { getCurrentUser } from '@aws-amplify/auth';
import { ServerEnvironment } from '../../../config/server.config';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = width - (CARD_MARGIN * 2);

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
}

interface ClientRequest {
  request_id: string;
  timestamp: string;
  service_type: string;
  city: string;
  state: string;
  description: string;
  availability_slots: TimeSlot[];
  client_id: string;
  client_name?: string;
  image_url?: string;
  status: string;
  priority?: number;
}

interface ServerResponse {
  status: string;
  total_requests: number;
  requests: ClientRequest[];
}

const statusColors = {
  new: '#007AFF',
  accepted: '#34C759',
  declined: '#FF3B30',
  completed: '#8E8E93',
  pending: '#FF9500',
  expired: '#8E8E93'
};

const RequestStatusBadge = ({ status }) => {
  const getStatusIcon = () => {
    switch (status.toLowerCase()) {
      case 'new': return 'notifications';
      case 'accepted': return 'checkmark-circle';
      case 'declined': return 'close-circle';
      case 'completed': return 'checkmark-done-circle';
      case 'pending': return 'time';
      case 'expired': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  return (
    <View style={[styles.statusBadge, { backgroundColor: statusColors[status.toLowerCase()] + '15' }]}>
      <Icon name={getStatusIcon()} size={16} color={statusColors[status.toLowerCase()]} style={styles.statusIcon} />
      <Text style={[styles.statusText, { color: statusColors[status.toLowerCase()] }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

export const ProRequestsScreen = () => {
  const navigation = useNavigation();
  const [userID, setUserID] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(ServerEnvironment.proRequestsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': id
        },
        body: JSON.stringify({
          professional_id: id
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ServerResponse = await response.json();
      if (data.status === 'success') {
        setRequests(data.requests);
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
        fetchRequests(user.userId);
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
      await fetchRequests(userID);
    } catch (error) {
      console.error('Error refreshing requests:', error);
    } finally {
      setRefreshing(false);
    }
  }, [userID]);

  const handleResponseAction = async (requestId: string, action: 'accept' | 'decline') => {
    setIsSubmitting(true);
    try {
      const response = await fetch(ServerEnvironment.respondToRequestEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userID
        },
        body: JSON.stringify({
          request_id: requestId,
          professional_id: userID,
          action: action
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        // Update the local state to reflect the change
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req.request_id === requestId 
              ? {...req, status: action === 'accept' ? 'accepted' : 'declined'} 
              : req
          )
        );
        
        // Close the detail modal if open
        setShowDetailModal(false);
        
        // Show success message
        Alert.alert(
          'Success', 
          `Request ${action === 'accept' ? 'accepted' : 'declined'} successfully.`
        );
      } else {
        throw new Error(data.message || 'Failed to process request');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startVideoCall = (request: ClientRequest) => {
    if (request.status.toLowerCase() !== 'accepted') {
      Alert.alert(
        'Call Not Available', 
        'Video calls are only available for accepted requests.'
      );
      return;
    }
  
    navigation.navigate('VideoCall', {
      meetingId: request.request_id,
      roomName: `meeting-${request.request_id}`,
      professionalName: request.client_name || 'Client',
    });
  };

  const filteredRequests = requests.filter(request => {
    if (activeFilter === 'all') return true;
    return request.status.toLowerCase() === activeFilter;
  });

  const renderFilterButtons = () => (
    <View style={styles.filtersContainer}>
      <ScrollableFilter 
        filters={[
          { id: 'all', label: 'All' },
          { id: 'new', label: 'New' },
          { id: 'accepted', label: 'Accepted' },
          { id: 'declined', label: 'Declined' },
          { id: 'completed', label: 'Completed' },
          { id: 'expired', label: 'Expired' }
        ]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
    </View>
  );

  const renderRequestCard = ({ item }: { item: ClientRequest }) => {
    const statusColor = statusColors[item.status.toLowerCase()] || '#8E8E93';
    const isAccepted = item.status.toLowerCase() === 'accepted';
    const isNew = item.status.toLowerCase() === 'new';
    
    return (
      <TouchableOpacity 
        style={styles.requestCard}
        onPress={() => {
          setSelectedRequest(item);
          setShowDetailModal(true);
        }}
      >
        <LinearGradient
          colors={[statusColor + '08', statusColor + '03']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <RequestStatusBadge status={item.status} />
            <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleDateString()}</Text>
          </View>

          <View style={styles.requestContent}>
            <View style={styles.serviceTypeContainer}>
              <Icon name="construct-outline" size={18} color={statusColor} />
              <Text style={styles.serviceType}>{item.service_type}</Text>
            </View>
            
            <View style={styles.locationContainer}>
              <Icon name="location-outline" size={16} color="#666" />
              <Text style={styles.locationText}>{item.city}, {item.state}</Text>
            </View>
            
            {item.availability_slots.length > 0 && (
              <View style={styles.timeSlotContainer}>
                <Icon name="calendar-outline" size={16} color="#666" style={styles.timeSlotIcon} />
                <View style={styles.timeSlotTextContainer}>
                  <Text style={styles.timeSlotDate}>
                    {formatDate(item.availability_slots[0].date)}
                  </Text>
                  <Text style={styles.timeSlotTime}>
                    {formatTimeSlot(item.availability_slots[0])}
                  </Text>
                </View>
              </View>
            )}

            <Text 
              style={styles.description}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            {isNew ? (
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.declineButton]}
                  onPress={() => handleResponseAction(item.request_id, 'decline')}
                >
                  <Icon name="close" size={18} color="#FF3B30" />
                  <Text style={styles.declineButtonText}>Decline</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleResponseAction(item.request_id, 'accept')}
                >
                  <Icon name="checkmark" size={18} color="#34C759" />
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.viewButtonContainer}>
                <TouchableOpacity 
                  style={[styles.viewButton, { borderColor: statusColor }]}
                >
                  <Text style={[styles.viewButtonText, { color: statusColor }]}>View Details</Text>
                </TouchableOpacity>
                
                {isAccepted && (
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => startVideoCall(item)}
                  >
                    <Icon name="videocam" size={16} color="#fff" />
                    <Text style={styles.callButtonText}>Call</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image 
        source={require('../../../../assets/images/empty-inbox.png')}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text style={styles.emptyTitle}>No Requests Found</Text>
      <Text style={styles.emptyText}>
        {activeFilter === 'all' 
          ? 'You have no client requests at the moment.'
          : `You have no ${activeFilter} requests at the moment.`
        }
      </Text>
    </View>
  );

  const renderDetailModal = () => {
    if (!selectedRequest) return null;
    
    const statusColor = statusColors[selectedRequest.status.toLowerCase()] || '#8E8E93';
    const isAccepted = selectedRequest.status.toLowerCase() === 'accepted';
    const isNew = selectedRequest.status.toLowerCase() === 'new';

    return (
      <Modal
        visible={showDetailModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Details</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setShowDetailModal(false)}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <RequestStatusBadge status={selectedRequest.status} />
                  <Text style={styles.detailTimestamp}>
                    {new Date(selectedRequest.timestamp).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="construct-outline" size={20} color={statusColor} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Service Type</Text>
                    <Text style={styles.detailValue}>{selectedRequest.service_type}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="location-outline" size={20} color={statusColor} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>{`${selectedRequest.city}, ${selectedRequest.state}`}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Icon name="document-text-outline" size={20} color={statusColor} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Description</Text>
                    <Text style={styles.detailValue}>{selectedRequest.description}</Text>
                  </View>
                </View>

                <Text style={styles.availabilityTitle}>Available Time Slots:</Text>
                {selectedRequest.availability_slots.map((slot, index) => (
                  <View key={index} style={styles.timeSlotItem}>
                    <Icon name="calendar-outline" size={18} color={statusColor} style={styles.timeSlotItemIcon} />
                    <View>
                      <Text style={styles.timeSlotItemDate}>{formatDate(slot.date)}</Text>
                      <Text style={styles.timeSlotItemTime}>{formatTimeSlot(slot)}</Text>
                    </View>
                  </View>
                ))}

                {selectedRequest.image_url && (
                  <View style={styles.imageContainer}>
                    <Text style={styles.imageTitle}>Attached Photo:</Text>
                    <Image 
                      source={{ uri: selectedRequest.image_url }}
                      style={styles.requestImage}
                      resizeMode="cover"
                    />
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              {isNew ? (
                <View style={styles.modalActionButtons}>
                  <TouchableOpacity 
                    style={[styles.modalActionButton, styles.modalDeclineButton]}
                    onPress={() => handleResponseAction(selectedRequest.request_id, 'decline')}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Icon name="close" size={20} color="#fff" />
                        <Text style={styles.modalDeclineButtonText}>Decline Request</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalActionButton, styles.modalAcceptButton]}
                    onPress={() => handleResponseAction(selectedRequest.request_id, 'accept')}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Icon name="checkmark" size={20} color="#fff" />
                        <Text style={styles.modalAcceptButtonText}>Accept Request</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.closeModalButton}
                  onPress={() => setShowDetailModal(false)}
                >
                  <Text style={styles.closeModalButtonText}>Close</Text>
                </TouchableOpacity>
              )}
              
              {isAccepted && (
                <TouchableOpacity 
                  style={styles.modalCallButton}
                  onPress={() => {
                    setShowDetailModal(false);
                    startVideoCall(selectedRequest);
                  }}
                >
                  <LinearGradient
                    colors={['#007AFF', '#0065D1']}
                    style={styles.modalCallButtonGradient}
                  >
                    <Icon name="videocam" size={20} color="#FFFFFF" />
                    <Text style={styles.modalCallButtonText}>Start Video Call</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Client Requests" />
      
      {renderFilterButtons()}
      
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#333" />
          <Text style={styles.loaderText}>Loading requests...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          renderItem={renderRequestCard}
          keyExtractor={(item) => item.request_id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#333"
              colors={["#333"]}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {renderDetailModal()}
    </SafeAreaView>
  );
};

// Scrollable filter component for horizontal filter selection
const ScrollableFilter = ({ filters, activeFilter, onFilterChange }) => {
  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={filters}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.filterListContent}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === item.id && { backgroundColor: statusColors[item.id] || '#333' }
          ]}
          onPress={() => onFilterChange(item.id)}
        >
          <Text 
            style={[
              styles.filterButtonText,
              activeFilter === item.id && styles.activeFilterText
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  filtersContainer: {
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filterListContent: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F0F0F0',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  requestCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardGradient: {
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestContent: {
    padding: 12,
  },
  serviceTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceType: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timeSlotIcon: {
    marginRight: 6,
  },
  timeSlotTextContainer: {
    flex: 1,
  },
  timeSlotDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
  },
  timeSlotTime: {
    fontSize: 13,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
    lineHeight: 20,
  },
  cardFooter: {
    padding: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  declineButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    marginRight: 8,
  },
  declineButtonText: {
    color: '#FF3B30',
    marginLeft: 6,
    fontWeight: '500',
  },
  acceptButton: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  acceptButtonText: {
    color: '#34C759',
    marginLeft: 6,
    fontWeight: '500',
  },
  viewButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  viewButtonText: {
    fontWeight: '500',
    fontSize: 14,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 6,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 400,
  },
  emptyImage: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 24,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '80%',
    maxHeight: '90%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    flex: 1,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailTimestamp: {
    fontSize: 12,
    color: '#888',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 12,
  },
  timeSlotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  timeSlotItemIcon: {
    marginRight: 12,
  },
  timeSlotItemDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  timeSlotItemTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  imageContainer: {
    marginTop: 16,
  },
  imageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  requestImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  modalActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flex: 1,
  },
  modalDeclineButton: {
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  modalDeclineButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalAcceptButton: {
    backgroundColor: '#34C759',
  },
  modalAcceptButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  closeModalButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    marginTop: 16,
  },
  closeModalButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  modalCallButton: {
    marginTop: 16,
  },
  modalCallButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  modalCallButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});