import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Image,
  Dimensions,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';


import { ScreenHeader } from '../../common/ScreenHeader';
import Icon from '@expo/vector-icons/Ionicons';
import { ServerEnvironment } from '../../../config/server.config';
import { useNavigation, CommonActions } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import * as ImageManipulator from 'expo-image-manipulator';
import { getCurrentUser } from '@aws-amplify/auth';

const services = [
  {
    category: "Emergency & Urgent Services",
    items: [
      {
        title: "Plumber",
        description: "Burst pipes, leaks, water heater issues, clogged drains",
        price: "$30/15 mins + $1.5/min",
        icon: "water"
      },
      {
        title: "Electrician",
        description: "Wiring problems, breaker panel issues, lighting, appliance hookups",
        price: "$35/15 mins + $1.8/min",
        icon: "flash"
      },
      // {
      //   title: "HVAC Specialist",
      //   description: "Heating, ventilation, and air conditioning repairs or inspections",
      //   price: "$40/15 mins + $2.0/min",
      //   icon: "thermometer"
      // },
      // {
      //   title: "Roofing Specialist",
      //   description: "Leaks, storm damage, routine roof maintenance",
      //   price: "$45/15 mins + $2.2/min",
      //   icon: "home"
      // }
    ]
  },
  {
    category: "Property Management & Support",
    items: [
      {
        title: "Maintenance Handyman",
        description: "Minor fixes, odd jobs, patching walls, simple carpentry",
        price: "$25/15 mins + $1.2/min",
        icon: "hammer"
      },
      // {
      //   title: "Property Manager",
      //   description: "For landlords or multi-property owners",
      //   price: "$35/15 mins + $1.5/min",
      //   icon: "business"
      // },
      {
        title: "Home Inspector",
        description: "Diagnose structural or safety concerns",
        price: "$50/15 mins + $2.5/min",
        icon: "search"
      }
    ]
  },
  {
    category: "Real Estate Services",
    items: [
      {
        title: "Real Estate Investor",
        description: "Advice on ROI, flipping, market opportunities",
        price: "$55/15 mins + $2.8/min",
        icon: "trending-up"
      },
      {
        title: "First-Time Home Buying Support",
        description: "Guidance from agents, mortgage brokers, financial advisors",
        price: "$30/15 mins + $1.5/min",
        icon: "home"
      },
      {
        title: "Airbnb Hosts/Cohosts",
        description: "Help with guest communication, turnover, pricing",
        price: "$30/15 mins + $1.5/min",
        icon: "bed"
      }
    ]
  },
  {
    category: "Specialized Services",
    items: [
      {
        title: "General Contractor",
        description: "Coordinating larger remodel or renovation projects",
        price: "$45/15 mins + $2.2/min",
        icon: "construct"
      },
      // {
      //   title: "Interior Designer",
      //   description: "Remodel, improve aesthetics, or sell for top dollar",
      //   price: "$40/15 mins + $2.0/min",
      //   icon: "color-palette"
      // },
      {
        title: "Property Attorney",
        description: "Legal guidance on contracts, disputes, transactions",
        price: "$60/15 mins + $3.0/min",
        icon: "document-text"
      }
    ]
  }
];

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
];

interface ProResponse {
  status: 'success' | 'error';
  message: string;
  request_received?: {
    service_type: string;
    city: string;
    state: string;
    description: string;
  };
}

interface TimeSlot {
  date: Date;
  startTime: Date;
  endTime: Date;
}

// Define a more refined color theme for a premium feel
const COLORS = {
  primary: '#777777',       // Deep blue for primary actions
  primaryDark: '#000000',   // Darker blue for gradients
  primaryLight: '#4A7DB3',  // Lighter blue for some elements
  accent: '#FF9500',        // Orange accent for important elements
  background: '#F7F8FA',    // Light background
  card: '#FFFFFF',          // White card background
  text: '#2C3E50',          // Dark blue-gray for main text
  textSecondary: '#6A7A8C', // Lighter text for descriptions
  border: '#E1E8ED',        // Light border color
  placeholder: '#9BABBF',   // Placeholder text color
  error: '#E74C3C',         // Error color
  success: '#2ECC71',       // Success color
  warning: '#FFB800',       // Warning color
  disabled: '#D8E0E9',      // Light gray for disabled buttons
  disabledDark: '#B9C6D2',  // Darker disabled color
};

export const CallProScreen = () => {
  const navigation = useNavigation();
  const [serviceType, setServiceType] = useState('');
  const [concern, setConcern] = useState('');
  const [city, setCity] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState(new Date());
  const [selectedEndTime, setSelectedEndTime] = useState(new Date(new Date().setHours(new Date().getHours() + 1)));
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [photos, setPhotos] = useState<Array<{uri: string}>>([]);
  const [statePickerVisible, setStatePickerVisible] = useState(false);
  const [photoOptionsVisible, setPhotoOptionsVisible] = useState(false);
  const [selectedServicePrice, setSelectedServicePrice] = useState<string>('');

  // Move calculateProgress inside component so it has access to state variables
  const calculateProgress = () => {
    let progress = 0;
    
    if (selectedService) progress += 25;
    if (city && stateCode) progress += 25;
    if (concern.trim().length > 0) progress += 25;
    if (timeSlots.length > 0) progress += 25;
    
    return progress;
  };

  const handleSubmit = async () => {
    if (!areRequiredFieldsFilled()) {
      Alert.alert(
        "Missing Information",
        "Please fill in all required fields and add at least one availability time slot."
      );
      return;
    }
    
    // Navigate to the confirmation screen with all request details
    navigation.navigate('CallProConfirmation', {
      requestDetails: {
        service_type: selectedService,
        description: concern,
        city: city,
        state: stateCode,
        availability: timeSlots.map(slot => ({
          date: slot.date.toISOString(),
          startTime: slot.startTime.toISOString(),
          endTime: slot.endTime.toISOString()
        })),
        image: image,
        servicePrice: selectedServicePrice
      }
    });
  };

  const processImage = async (imageUri: string) => {
    try {
      // First, get the image info
      const manipulateResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1024 } }], // Resize to a reasonable width while maintaining aspect ratio
        {
          compress: 0.7, // Compress to 70% quality
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return manipulateResult.uri;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  };

  const ServiceCard = ({ title, description, icon }: { title: string; description: string; icon: string }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => {
        setServiceType(title);
        setShowServices(false);
      }}
    >
      <View style={[styles.serviceIconContainer, { backgroundColor: COLORS.primary }]}>
        <Icon name={icon} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.serviceTextContainer}>
        <Text style={styles.serviceTitle}>{title}</Text>
        <Text style={styles.serviceDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  const handleAddPhoto = () => {
    setPhotoOptionsVisible(true);
  };

  const handleImagePick = async () => {
    try {
      setPhotoOptionsVisible(false);
      
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "You need to grant access to your photo library to select photos.");
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert("Error", "There was a problem selecting your image.");
    }
  };

  const takePhoto = async () => {
    try {
      setPhotoOptionsVisible(false);
      
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "You need to grant access to your camera to take photos.");
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      
      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert("Error", "There was a problem taking a photo.");
    }
  };

  const addTimeSlot = () => {
    if (selectedEndTime <= selectedStartTime) {
      Alert.alert('Invalid Time Range', 'End time must be after start time.');
      return;
    }
    
    const newSlot: TimeSlot = {
      date: new Date(selectedDate),
      startTime: new Date(selectedStartTime),
      endTime: new Date(selectedEndTime),
    };
    
    setTimeSlots([...timeSlots, newSlot]);
    
    // Reset time selection for next slot
    const nextStartTime = new Date();
    nextStartTime.setHours(9, 0, 0);
    setSelectedStartTime(nextStartTime);
    
    const nextEndTime = new Date(nextStartTime);
    nextEndTime.setHours(nextEndTime.getHours() + 1);
    setSelectedEndTime(nextEndTime);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const formatTimeSlot = (slot: TimeSlot) => {
    const dateStr = format(slot.date, 'EEE, MMM d');
    const startStr = format(slot.startTime, 'h:mm a');
    const endStr = format(slot.endTime, 'h:mm a');
    return `${dateStr}, ${startStr} - ${endStr}`;
  };

  const renderPhotoSection = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon name="camera" size={24} color="#555555" />
        <Text style={styles.sectionTitle}>Add Photos</Text>
      </View>
      <Text style={styles.sectionSubtitle}>
        Help pros understand your issue better
      </Text>

      {image ? (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image }} style={styles.imagePreview} />
          <TouchableOpacity 
            style={styles.removeImageButton}
            onPress={() => setImage(null)}
          >
            <ExpoLinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.removeImageGradient}
            >
              <Icon name="close" size={20} color="#FFFFFF" />
            </ExpoLinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.addPhotoButton}
          onPress={handleAddPhoto}
        >
          <ExpoLinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.addPhotoGradient}
          >
            <Icon name="camera-outline" size={24} color="#FFFFFF" />
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </ExpoLinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderAvailabilitySection = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Icon name="calendar" size={24} color="#555555" />
        <Text style={styles.sectionTitle}>Your Availability</Text>
      </View>
      <Text style={styles.sectionSubtitle}>
        When would you like the pro to visit?
      </Text>

      {timeSlots.length > 0 ? (
        <View style={styles.selectedTimeSlotsContainer}>
          <Text style={styles.availabilityLabel}>Your selected time slots:</Text>
          {timeSlots.map((slot, index) => (
            <View key={index} style={styles.timeSlotCard}>
              <View style={styles.timeSlotInfo}>
                <Text style={styles.timeSlotDate}>
                  {format(slot.date, 'EEE, MMM d, yyyy')}
                </Text>
                <Text style={styles.timeSlotTime}>
                  {format(slot.startTime, 'h:mm a')} - {format(slot.endTime, 'h:mm a')}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.removeSlotButton}
                onPress={() => removeTimeSlot(index)}
              >
                <Icon name="close-circle" size={22} color="#FF4444" />
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity 
            style={styles.addMoreButton}
            onPress={() => setShowAvailabilityPicker(true)}
          >
            <ExpoLinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.addMoreGradient}
            >
              <Icon name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addMoreText}>Add More Time Slots</Text>
            </ExpoLinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.addFirstSlotButton}
          onPress={() => setShowAvailabilityPicker(true)}
        >
          <ExpoLinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.addFirstSlotGradient}
          >
            <Icon name="calendar-outline" size={24} color="#FFFFFF" />
            <Text style={styles.addFirstSlotText}>Select Your Availability</Text>
          </ExpoLinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  // Add a new state for the availability picker modal
  const [showAvailabilityPicker, setShowAvailabilityPicker] = useState(false);

  // Add these helper functions at the top of your component
  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  const getTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();
    
    // Start from current hour if it's today, otherwise start from 8 AM
    let startHour = isToday ? now.getHours() : 8;
    
    // Round up to nearest half hour for today
    if (isToday && now.getMinutes() > 30) {
      startHour += 1;
    }
    
    // Generate time slots until midnight (00:00)
    for (let hour = startHour; hour < 24; hour++) {
      for (let minutes of [0, 30]) {
        // Skip past times for today
        if (isToday && hour === now.getHours() && minutes <= now.getMinutes()) {
          continue;
        }
        
        const time = new Date(selectedDate);
        time.setHours(hour, minutes, 0, 0);
        slots.push(time);
      }
    }
    
    return slots;
  };

  // Add these state variables
  const [availableDates] = useState(getNext7Days());
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showStartTimeDropdown, setShowStartTimeDropdown] = useState(false);
  const [showEndTimeDropdown, setShowEndTimeDropdown] = useState(false);
  const [availableStartTimes, setAvailableStartTimes] = useState(getTimeSlots());
  const [availableEndTimes, setAvailableEndTimes] = useState(getTimeSlots());

  // Simplified Time Slot Picker Modal
  const renderAvailabilityPickerModal = () => {
    // Current time state to track which time we're selecting
    const [selectingTime, setSelectingTime] = useState<'none' | 'start' | 'end'>('none');
    
    // Render the time selector modal in a completely separate UI
    const renderTimeSelector = () => {
      const isStartTime = selectingTime === 'start';
      const title = isStartTime ? 'Select Start Time' : 'Select End Time';
      const times = isStartTime 
        ? availableStartTimes 
        : availableEndTimes.filter(time => time > selectedStartTime);
      
      return (
        <Modal
          visible={selectingTime !== 'none'}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectingTime('none')}
        >
          <View style={styles.fullScreenModal}>
            <View style={styles.timeSelectorContainer}>
              <View style={styles.timeSelectorHeader}>
                <Text style={styles.timeSelectorTitle}>{title}</Text>
                <TouchableOpacity 
                  onPress={() => setSelectingTime('none')}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={times}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({item: time}) => {
                  const selected = isStartTime 
                    ? time.getTime() === selectedStartTime.getTime()
                    : time.getTime() === selectedEndTime.getTime();
                  
                  return (
                    <TouchableOpacity
                      style={[styles.timeOption, selected && styles.timeOptionSelected]}
                      onPress={() => {
                        if (isStartTime) {
                          setSelectedStartTime(time);
                          if (selectedEndTime <= time) {
                            setSelectedEndTime(new Date(time.getTime() + 30 * 60000));
                          }
                        } else {
                          setSelectedEndTime(time);
                        }
                        setSelectingTime('none');
                      }}
                    >
                      <Text style={[styles.timeOptionText, selected && styles.timeOptionTextSelected]}>
                        {format(time, 'h:mm a')}
                      </Text>
                      {selected && <Icon name="checkmark" size={22} color={COLORS.primary} />}
                    </TouchableOpacity>
                  );
                }}
                contentContainerStyle={styles.timeOptionsList}
                showsVerticalScrollIndicator={true}
              />
            </View>
          </View>
        </Modal>
      );
    };
    
    return (
      <>
        <Modal
          visible={showAvailabilityPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAvailabilityPicker(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.modalContainer}>
              <View style={styles.availabilityModalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Add Availability</Text>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setShowAvailabilityPicker(false)}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  >
                    <Icon name="close" size={24} color="#555555" />
                  </TouchableOpacity>
                </View>

                <View style={styles.simplifiedPickerContent}>
                  {/* Date Selection - Horizontal Slider */}
                  <View style={styles.simplifiedPickerSection}>
                    <Text style={styles.simplifiedPickerLabel}>Select Date</Text>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      style={styles.simpleDateContainer}
                    >
                      {availableDates.map((date, index) => {
                        const isSelected = date.toDateString() === selectedDate.toDateString();
                        const isToday = date.toDateString() === new Date().toDateString();
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.simpleDateItem,
                              isSelected && styles.simpleDateItemSelected
                            ]}
                            onPress={() => {
                              setSelectedDate(date);
                              setAvailableStartTimes(getTimeSlots());
                              const initialStartTime = getTimeSlots()[0];
                              if (initialStartTime) {
                                setSelectedStartTime(initialStartTime);
                                setSelectedEndTime(new Date(initialStartTime.getTime() + 30 * 60000));
                              }
                            }}
                          >
                            <Text style={[styles.simpleDateDay, isSelected && styles.simpleDateTextSelected]}>
                              {format(date, 'EEE')}
                            </Text>
                            <Text style={[styles.simpleDateNum, isSelected && styles.simpleDateTextSelected]}>
                              {format(date, 'd')}
                            </Text>
                            {isToday && (
                              <View style={styles.simpleTodayBadge}>
                                <Text style={styles.simpleTodayText}>Today</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Time Selection - Enhanced UI with separate modals */}
                  <View style={styles.simplifiedPickerSection}>
                    <Text style={styles.simplifiedPickerLabel}>Select Time Range</Text>
                    
                    <View style={styles.simpleTimeSelectors}>
                      {/* Start Time */}
                      <TouchableOpacity 
                        style={styles.timeSelectButton}
                        onPress={() => setSelectingTime('start')}
                        activeOpacity={0.7}
                      >
                        <View>
                          <Text style={styles.timeSelectLabel}>From</Text>
                          <Text style={styles.timeSelectValue}>{format(selectedStartTime, 'h:mm a')}</Text>
                        </View>
                        <Icon name="chevron-down" size={20} color={COLORS.textSecondary} />
                      </TouchableOpacity>

                      {/* End Time */}
                      <TouchableOpacity
                        style={styles.timeSelectButton}
                        onPress={() => setSelectingTime('end')}
                        activeOpacity={0.7}
                      >
                        <View>
                          <Text style={styles.timeSelectLabel}>To</Text>
                          <Text style={styles.timeSelectValue}>{format(selectedEndTime, 'h:mm a')}</Text>
                        </View>
                        <Icon name="chevron-down" size={20} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Summary Card */}
                  <View style={styles.simpleSelectedSlot}>
                    <View style={styles.simpleSelectedTop}>
                      <Icon name="calendar-outline" size={20} color={COLORS.primary} />
                      <Text style={styles.simpleSelectedDate}>
                        {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                      </Text>
                    </View>
                    <View style={styles.simpleSelectedDetails}>
                      <View style={styles.simpleSelectedTime}>
                        <Icon name="time-outline" size={18} color={COLORS.primary} style={{marginRight: 8}} />
                        <Text style={styles.simpleSelectedTimeText}>
                          {format(selectedStartTime, 'h:mm a')} - {format(selectedEndTime, 'h:mm a')}
                        </Text>
                      </View>
                      <Text style={styles.simpleSelectedDuration}>
                        Duration: {Math.round((selectedEndTime.getTime() - selectedStartTime.getTime()) / (60 * 1000))} minutes
                      </Text>
                    </View>
                  </View>

                  {/* Add Button */}
                  <TouchableOpacity 
                    style={styles.simpleAddButton}
                    onPress={() => {
                      addTimeSlot();
                      setShowAvailabilityPicker(false);
                    }}
                  >
                    <ExpoLinearGradient
                      colors={[COLORS.primary, COLORS.primaryDark]}
                      style={styles.simpleAddButtonGradient}
                    >
                      <Icon name="add" size={20} color="#FFFFFF" style={{marginRight: 8}} />
                      <Text style={styles.simpleAddButtonText}>Add This Time Slot</Text>
                    </ExpoLinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        
        {/* Separate Time Selector Modal */}
        {renderTimeSelector()}
      </>
    );
  };

  // Update the service selection section to ensure it's properly displayed
  const renderServiceSelection = () => {
    if (!showServiceSelection) return null;
    
    return (
      <View style={styles.serviceSelectionContainer}>
        <SafeAreaView style={styles.serviceSelectionSafeArea}>
          <View style={styles.serviceSelectionHeader}>
            {/* <Text style={styles.serviceSelectionTitle}>Select a Service</Text> */}
            <TouchableOpacity 
              onPress={() => setShowServiceSelection(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color="#555555" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={services}
            keyExtractor={(item, index) => `category-${index}`}
            renderItem={({item: serviceCategory, index: categoryIndex}) => (
              <View style={styles.serviceCategory}>
                <Text style={styles.categoryTitle}>{serviceCategory.category}</Text>
                
                {serviceCategory.items.map((service, serviceIndex) => (
                  <TouchableOpacity 
                    key={`service-${categoryIndex}-${serviceIndex}`}
                    style={styles.serviceCard} 
                    onPress={() => selectService(service.title, service.price)}
                  >
                    <View style={[styles.serviceIconContainer, { backgroundColor: COLORS.primary }]}>
                      <Icon name={service.icon} size={24} color="#FFFFFF" />
                    </View>
                    <View style={styles.serviceTextContainer}>
                      <Text style={styles.serviceTitle}>{service.title}</Text>
                      <Text style={styles.serviceDescription}>{service.description}</Text>
                      <View style={styles.servicePriceContainer}>
                        <Icon name="pricetag-outline" size={14} color={COLORS.primary} />
                        <Text style={styles.servicePriceText}>{service.price}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            contentContainerStyle={styles.serviceListContentContainer}
            showsVerticalScrollIndicator={true}
          />
        </SafeAreaView>
      </View>
    );
  };

  // Add this function to handle service selection
  const selectService = (serviceName: string, servicePrice: string) => {
    setSelectedService(serviceName);
    setSelectedServicePrice(servicePrice);
    setShowServiceSelection(false);
    
    // You might want to add additional logic here based on the selected service
    // For example, resetting other form fields or loading service-specific data
  };

  // Add this function to check if all required fields are filled
  const areRequiredFieldsFilled = () => {
    return (
      selectedService !== '' && 
      concern.trim() !== '' && 
      city.trim() !== '' && 
      stateCode !== '' && 
      timeSlots.length > 0
    );
  };

  const renderStatePicker = () => {
    return (
      <Modal
        visible={showStatePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStatePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.pickerModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select State</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowStatePicker(false)}
              >
                <Icon name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={US_STATES}
              keyExtractor={(item) => item.code}
              style={styles.stateList}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.stateItem}
                  onPress={() => {
                    setStateCode(item.code);
                    setShowStatePicker(false);
                  }}
                >
                  <Text style={styles.stateItemText}>{item.name} ({item.code})</Text>
                  {stateCode === item.code && (
                    <Icon name="checkmark" size={22} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              initialNumToRender={15}
            />
          </View>
        </View>
      </Modal>
    );
  };

  const renderPhotoOptions = () => {
    return (
      <Modal
        visible={photoOptionsVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPhotoOptionsVisible(false)}
      >
        <TouchableOpacity 
          style={styles.photoOptionsOverlay}
          activeOpacity={1}
          onPress={() => setPhotoOptionsVisible(false)}
        >
          <View style={styles.photoOptionsContainer}>
            <View style={styles.photoOptionsContent}>
              <Text style={styles.photoOptionsTitle}>Add Photo</Text>
              
              <TouchableOpacity 
                style={styles.photoOptionItem}
                onPress={takePhoto}
              >
                <Icon name="camera" size={24} color={COLORS.primary} />
                <Text style={styles.photoOptionText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.photoOptionItem}
                onPress={handleImagePick}
              >
                <Icon name="images" size={24} color={COLORS.primary} />
                <Text style={styles.photoOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.photoOptionCancel}
                onPress={() => setPhotoOptionsVisible(false)}
              >
                <Text style={styles.photoOptionCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader 
        title="Request a Pro" 
        rightButton={
          <TouchableOpacity
            style={[
              styles.headerFindProButton,
              !areRequiredFieldsFilled() && styles.headerButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!areRequiredFieldsFilled() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={[
                styles.headerFindProText,
                !areRequiredFieldsFilled() && styles.headerFindProDisabled
              ]}>Submit</Text>
            )}
          </TouchableOpacity>
        }
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView 
          style={styles.container} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            {/* Hero Section with Illustration */}
            <View style={styles.heroSection}>
              <Image 
                source={require('../../../../assets/images/callpro-hero.png')} 
                style={styles.heroImage} 
                resizeMode="contain"
              />
              <Text style={styles.heroTitle}>Connect with the right professional</Text>
              <Text style={styles.description}>
                Tell us about your needs and we'll match you with qualified pros available for a video consultation.
              </Text>
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill, 
                  { width: `${calculateProgress()}%` }
                ]} />
              </View>
              <Text style={styles.progressText}>
                {areRequiredFieldsFilled() ? 'Ready to submit!' : 'Please complete all required fields'}
              </Text>
            </View>

            {/* Service Selection Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <ExpoLinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.iconCircle}
                >
                  <Icon name="briefcase" size={20} color="#FFFFFF" />
                </ExpoLinearGradient>
                <View style={styles.cardHeaderTextContainer}>
                  <Text style={styles.sectionTitle}>Service Type</Text>
                  <Text style={styles.requiredBadge}>Required</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[
                  styles.serviceTypeButton,
                  selectedService && styles.serviceTypeButtonSelected
                ]}
                onPress={() => setShowServiceSelection(true)}
              >
                {selectedService ? (
                  <View style={styles.selectedServiceInfo}>
                    <Text style={styles.serviceTypeText}>{selectedService}</Text>
                    <View style={styles.selectedServicePriceContainer}>
                      <Icon name="pricetag-outline" size={14} color={COLORS.primary} style={styles.selectedServicePriceIcon} />
                      <Text style={styles.selectedServicePriceText}>{selectedServicePrice}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.placeholderContent}>
                    <Icon name="search" size={18} color={COLORS.placeholder} />
                    <Text style={styles.serviceTypePlaceholder}>Select a service</Text>
                  </View>
                )}
                <Icon name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Location Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <ExpoLinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.iconCircle}
                >
                  <Icon name="location" size={20} color="#FFFFFF" />
                </ExpoLinearGradient>
                <View style={styles.cardHeaderTextContainer}>
                  <Text style={styles.sectionTitle}>Location</Text>
                  <Text style={styles.requiredBadge}>Required</Text>
                </View>
              </View>

              <View style={styles.locationContainer}>
                <View style={styles.cityContainer}>
                  <Text style={styles.label}>City</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      city && styles.textInputFilled
                    ]}
                    value={city}
                    onChangeText={setCity}
                    placeholder="Enter city"
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>

                <View style={styles.stateContainer}>
                  <Text style={styles.label}>State</Text>
                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      stateCode && styles.selectButtonFilled
                    ]}
                    onPress={() => setShowStatePicker(true)}
                  >
                    <Text style={[
                      styles.selectButtonText,
                      !stateCode && styles.placeholderText
                    ]}>
                      {stateCode || 'State'}
                    </Text>
                    <Icon name="chevron-down" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Description Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <ExpoLinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.iconCircle}
                >
                  <Icon name="document-text" size={20} color="#FFFFFF" />
                </ExpoLinearGradient>
                <View style={styles.cardHeaderTextContainer}>
                  <Text style={styles.sectionTitle}>Details</Text>
                  <Text style={styles.requiredBadge}>Required</Text>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Describe Your Needs</Text>
                <TextInput
                  style={[
                    styles.textAreaInput,
                    concern.length > 0 && styles.textAreaInputFilled
                  ]}
                  value={concern}
                  onChangeText={setConcern}
                  placeholder="Describe what you need help with in detail"
                  placeholderTextColor={COLORS.placeholder}
                  multiline
                  numberOfLines={4}
                  maxLength={200}
                  textAlignVertical="top"
                />
                <Text style={[
                  styles.characterCount,
                  concern.length > 180 && { color: COLORS.warning },
                  concern.length >= 200 && { color: COLORS.error }
                ]}>
                  {concern.length}/200
                </Text>
              </View>
            </View>

            {/* Improved Photo Section */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <ExpoLinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.iconCircle}
                >
                  <Icon name="camera" size={20} color="#FFFFFF" />
                </ExpoLinearGradient>
                <View style={styles.cardHeaderTextContainer}>
                  <Text style={styles.sectionTitle}>Add Photo</Text>
                  <Text style={styles.optionalBadge}>Optional</Text>
                </View>
              </View>

              {image ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                  <View style={styles.imagePreviewOverlay}>
                    <TouchableOpacity 
                      style={styles.changePhotoButton}
                      onPress={handleAddPhoto}
                    >
                      <ExpoLinearGradient
                        colors={[COLORS.primary, COLORS.primaryDark]}
                        style={styles.changePhotoGradient}
                      >
                        <Icon name="camera" size={16} color="#FFFFFF" />
                        <Text style={styles.changePhotoText}>Change</Text>
                      </ExpoLinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => setImage(null)}
                    >
                      <ExpoLinearGradient
                        colors={['#FF3B30', '#E62E24']}
                        style={styles.removeImageGradient}
                      >
                        <Icon name="trash" size={16} color="#FFFFFF" />
                        <Text style={styles.removeImageText}>Remove</Text>
                      </ExpoLinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.addPhotoButton}
                  onPress={handleAddPhoto}
                >
                  <View style={styles.photoPlaceholder}>
                    <Icon name="camera-outline" size={24} color={COLORS.placeholder} />
                    <Text style={styles.photoPlaceholderText}>Add Photo</Text>
                    <Text style={styles.photoHint}>
                      Help pros understand your issue better
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Improved Availability Section */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <ExpoLinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.iconCircle}
                >
                  <Icon name="calendar" size={20} color="#FFFFFF" />
                </ExpoLinearGradient>
                <View style={styles.cardHeaderTextContainer}>
                  <Text style={styles.sectionTitle}>Your Availability</Text>
                  <Text style={styles.requiredBadge}>Required</Text>
                </View>
              </View>

              {timeSlots.length > 0 ? (
                <View style={styles.selectedTimeSlotsContainer}>
                  {timeSlots.map((slot, index) => (
                    <View key={index} style={styles.timeSlotCard}>
                      <View style={styles.timeSlotInfo}>
                        <View style={styles.timeSlotDateContainer}>
                          <Icon name="calendar-outline" size={16} color={COLORS.primary} />
                          <Text style={styles.timeSlotDate}>
                            {format(slot.date, 'EEE, MMM d, yyyy')}
                          </Text>
                        </View>
                        <View style={styles.timeSlotTimeContainer}>
                          <Icon name="time-outline" size={16} color={COLORS.primary} />
                          <Text style={styles.timeSlotTime}>
                            {format(slot.startTime, 'h:mm a')} - {format(slot.endTime, 'h:mm a')}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity 
                        style={styles.removeSlotButton}
                        onPress={() => removeTimeSlot(index)}
                      >
                        <Icon name="close-circle" size={22} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  <TouchableOpacity 
                    style={styles.addMoreButton}
                    onPress={() => setShowAvailabilityPicker(true)}
                  >
                    <ExpoLinearGradient
                      colors={[COLORS.primary, COLORS.primaryDark]}
                      style={styles.addMoreGradient}
                    >
                      <Icon name="add" size={20} color="#FFFFFF" />
                      <Text style={styles.addMoreText}>Add More Time Slots</Text>
                    </ExpoLinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <Text style={styles.availabilityDescription}>
                    Select times when you're available for a video call with a professional.
                  </Text>
                  <TouchableOpacity 
                    style={styles.addFirstSlotButton}
                    onPress={() => setShowAvailabilityPicker(true)}
                  >
                    <ExpoLinearGradient
                      colors={[COLORS.primary, COLORS.primaryDark]}
                      style={styles.addFirstSlotGradient}
                    >
                      <Icon name="calendar-outline" size={24} color="#FFFFFF" />
                      <Text style={styles.addFirstSlotText}>Select Your Availability</Text>
                    </ExpoLinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                !areRequiredFieldsFilled() && styles.submitButtonDisabled
              ]}
              disabled={!areRequiredFieldsFilled() || isLoading}
              onPress={handleSubmit}
            >
              <ExpoLinearGradient
                colors={areRequiredFieldsFilled() ? [COLORS.primary, COLORS.primaryDark] : [COLORS.disabled, COLORS.disabledDark]}
                style={styles.submitButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="videocam" size={20} color="#FFFFFF" style={styles.submitIcon} />
                    <Text style={styles.submitButtonText}>Request a Video Call</Text>
                  </>
                )}
              </ExpoLinearGradient>
            </TouchableOpacity>
            
            {/* Benefits Section */}
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Why use video consultations?</Text>
              
              <View style={styles.benefitItem}>
                <Icon name="time" size={20} color={COLORS.primary} />
                <Text style={styles.benefitText}>Save time with convenient remote consultations</Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Icon name="shield-checkmark" size={20} color={COLORS.primary} />
                <Text style={styles.benefitText}>All professionals are vetted and qualified</Text>
              </View>
              
              <View style={styles.benefitItem}>
                <Icon name="cash" size={20} color={COLORS.primary} />
                <Text style={styles.benefitText}>Get expert advice before committing to larger services</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Existing modals with updated styling */}
      {renderServiceSelection()}
      {renderAvailabilityPickerModal()}
      
      {/* ...existing modals... */}
      {renderStatePicker()}
      {renderPhotoOptions()}
    </SafeAreaView>
  );
};

// New helper function to calculate progress
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 16,
  },
  
  // Hero section styles
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroImage: {
    width: 160,
    height: 120,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  
  // Progress indicator
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.disabled,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Service list - padding bottom
  serviceListContentContainer: {
    paddingBottom: 150
  },
  
  // Card styles
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  requiredBadge: {
    fontSize: 12,
    color: COLORS.error,
    backgroundColor: '#FFEFEF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
    overflow: 'hidden',
  },
  optionalBadge: {
    fontSize: 12,
    color: COLORS.textSecondary,
    backgroundColor: '#F0F4F8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 10,
    overflow: 'hidden',
  },

  // Service type button
  serviceTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serviceTypeButtonSelected: {
    backgroundColor: 'rgba(46, 92, 141, 0.08)', // Light blue background
    borderColor: COLORS.primary,
  },
  placeholderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceTypeText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  serviceTypePlaceholder: {
    fontSize: 16,
    color: COLORS.placeholder,
    marginLeft: 8,
  },
  
  // Input styles
  inputContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cityContainer: {
    flex: 3,
  },
  stateContainer: {
    flex: 2,
  },
  textInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textInputFilled: {
    backgroundColor: 'rgba(46, 92, 141, 0.08)',
    borderColor: COLORS.primary,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectButtonFilled: {
    backgroundColor: 'rgba(46, 92, 141, 0.08)',
    borderColor: COLORS.primary,
  },
  selectButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  placeholderText: {
    color: COLORS.placeholder,
  },
  textAreaInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textAreaInputFilled: {
    backgroundColor: 'rgba(46, 92, 141, 0.08)',
    borderColor: COLORS.primary,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 6,
    marginRight: 4,
  },
  
  // Photo section
  photoPlaceholder: {
    height: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  photoPlaceholderText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  photoHint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  addPhotoButton: {
    marginTop: 4,
  },
  imagePreviewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  imagePreviewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between',
  },
  changePhotoButton: {
    flex: 1,
    marginRight: 8,
  },
  changePhotoGradient: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  removeImageButton: {
    flex: 1,
    marginLeft: 8,
  },
  removeImageGradient: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  
  // Availability section
  availabilityDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  selectedTimeSlotsContainer: {
    marginTop: 4,
  },
  timeSlotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(46, 92, 141, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  timeSlotInfo: {
    flex: 1,
  },
  timeSlotDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeSlotDate: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  timeSlotTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSlotTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  addMoreButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  addMoreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  addMoreText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  addFirstSlotButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  addFirstSlotGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  addFirstSlotText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  
  // Submit button
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  
  // Benefits section
  benefitsContainer: {
    padding: 20,
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  benefitText: {
    marginLeft: 12,
    fontSize: 15,
    color: COLORS.textSecondary,
    flex: 1,
  },
  
  // Header button
  headerFindProButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(46, 92, 141, 0.15)',
  },
  headerFindProText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  headerFindProDisabled: {
    color: COLORS.textSecondary,
  },
  headerButtonDisabled: {
    backgroundColor: '#F5F7FA',
  },
  
  modalSafeArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 300,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  modalScrollView: {
    padding: 16,
  },
  serviceCategory: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceTextContainer: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  
  // State Picker Styles
  pickerModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 300,
    maxHeight: '80%',
  },
  stateList: {
    padding: 8,
  },
  stateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  stateItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  
  // Photo Options Styles
  photoOptionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  photoOptionsContainer: {
    padding: 16,
  },
  photoOptionsContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  photoOptionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  photoOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  photoOptionText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 16,
  },
  photoOptionCancel: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  photoOptionCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  
  // Improved Availability Picker
  availabilityModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 300,
    maxHeight: '80%',
    padding: 16,
  },
  availabilityScrollView: {
    marginBottom: 16,
    maxHeight: 500,
  },
  availabilityPickerSection: {
    marginBottom: 24,
  },
  availabilityLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  dateSelectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dateOption: {
    width: '13.5%', // Slightly less than 1/7 to account for margins
    height: 75,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  dateOptionSelected: {
    backgroundColor: 'rgba(46, 92, 141, 0.1)',
    borderColor: COLORS.primary,
  },
  dayOfWeek: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  dayOfMonth: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  month: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  selectedDateText: {
    color: COLORS.primary,
  },
  timeRangeContainer: {
    marginBottom: 16,
  },
  timeInputContainer: {
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 12,
  },
  timeOptionsContainer: {
    paddingRight: 16,
  },
  timeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  timeOptionSelected: {
    backgroundColor: 'rgba(46, 92, 141, 0.1)',
    borderColor: COLORS.primary,
  },
  timeText: {
    fontSize: 14,
    color: COLORS.text,
  },
  timeTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  confirmButtonContainer: {
    marginTop: 8,
  },
  confirmAvailabilityButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmAvailabilityGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmAvailabilityText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmationContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  successIconContainer: {
    marginVertical: 16,
  },
  confirmationTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  requestIdText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
    padding: 8,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    width: '100%',
    textAlign: 'center',
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 8,
  },
  primaryButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // New styles for simplified time slot picker
  simplifiedPickerContent: {
    padding: 16,
  },
  simplifiedPickerSection: {
    marginBottom: 24,
  },
  simplifiedPickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  
  // Date slider styles
  simpleDateContainer: {
    flexGrow: 0,
    marginBottom: 8,
  },
  simpleDateItem: {
    width: 65,
    height: 80,
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 8,
  },
  simpleDateItemSelected: {
    backgroundColor: `${COLORS.primary}15`,
    borderColor: COLORS.primary,
  },
  simpleDateDay: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  simpleDateNum: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
  },
  simpleDateTextSelected: {
    color: COLORS.primary,
  },
  simpleTodayBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  simpleTodayText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },
  
  // Time selector styles
  simpleTimeSelectors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  simpleTimeContainer: {
    flex: 1,
    position: 'relative',
  },
  simpleTimeLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  simpleTimeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
  },
  simpleTimeText: {
    fontSize: 15,
    color: COLORS.text,
  },
  simpleDropdown: {
    position: 'absolute',
    top: 78,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 9999,
    elevation: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  simpleDropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  simpleDropdownText: {
    fontSize: 15,
    color: COLORS.text,
  },
  simpleDropdownTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Selected time slot summary styles
  simpleSelectedSlot: {
    backgroundColor: `${COLORS.primary}10`,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  simpleSelectedTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  simpleSelectedDate: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  simpleSelectedDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  simpleSelectedTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  simpleSelectedTimeText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  simpleSelectedDuration: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 26,
  },
  
  simpleAddButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  simpleAddButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  simpleAddButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // New styles for improved time selector
  fullScreenModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeSelectorContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
  timeSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  timeSelectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  timeOptionsList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  timeOptionSelected: {
    backgroundColor: `${COLORS.primary}10`,
  },
  timeOptionText: {
    fontSize: 17,
    color: COLORS.text,
  },
  timeOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  // Time selection buttons
  timeSelectButton: {
    flex: 1,
    height: 80,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 6,
  },
  timeSelectLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  timeSelectValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  simpleTimeSelectors: {
    flexDirection: 'row',
    marginHorizontal: -6,
  },
  
  // ...existing styles...
  servicePriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  servicePriceText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 4,
  },
  selectedServiceInfo: {
    flex: 1,
  },
  selectedServicePriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  selectedServicePriceIcon: {
    marginRight: 4,
  },
  selectedServicePriceText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  
  // Styles for the confirmation summary
  confirmationSummary: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  confirmationRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  confirmationLabel: {
    width: 70,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  confirmationValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  confirmationPriceValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  // ...existing styles...
});