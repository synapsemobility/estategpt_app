import { StyleSheet, Platform } from 'react-native';
// New helper function to calculate progress

// Define a more refined color theme for a premium feel
export const COLORS = {
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

export const styles = StyleSheet.create({
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
    
    // Service Selection Container
    serviceSelectionContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#FFFFFF',
      zIndex: 1000,
    },
    serviceSelectionSafeArea: {
      flex: 1,
    },
    serviceSelectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    serviceSelectionTitle: {
      marginTop: 80,
      fontSize: 22,
      fontWeight: '700',
      color: '#333333',
    },
    serviceSearchContainer: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
      marginBottom: 10,
    },
    searchBarFaux: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F5F7FA',
      padding: 12,
      borderRadius: 12,
    },
    searchPlaceholder: {
      fontSize: 16,
      color: '#777777',
      marginLeft: 8,
    },
    serviceListHeader: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    serviceListHeaderText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333333',
      marginBottom: 8,
    },
    serviceListSubheaderText: {
      fontSize: 14,
      color: '#777777',
      lineHeight: 20,
      marginBottom: 10,
    },
    serviceListContentContainerNew: {
      paddingBottom: 100,
    },
    categoryHeaderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginVertical: 16,
    },
    categoryTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#333333',
      marginRight: 12,
    },
    categoryLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#EEEEEE',
    },
    serviceCardNew: {
      marginHorizontal: 20,
      marginBottom: 16,
      borderRadius: 16,
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
      overflow: 'hidden',
    },
    serviceCardInner: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
    },
    serviceIconContainerNew: {
      width: 56,
      height: 56,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    serviceTextContainerNew: {
      flex: 1,
      paddingRight: 10,
    },
    serviceTitleNew: {
      fontSize: 17,
      fontWeight: '600',
      color: '#333333',
      marginBottom: 6,
    },
    serviceSelectArrow: {
      width: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    serviceBottomBar: {
      height: 4,
      width: '100%',
    },
  });