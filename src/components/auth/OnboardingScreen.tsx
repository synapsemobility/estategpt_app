import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { getCurrentUser } from '@aws-amplify/auth';
import { API } from 'aws-amplify';
import { OnboardingService } from '../../services/OnboardingService';

const { width } = Dimensions.get('window');

type Question = {
  id: string;
  title: string;
  subtitle: string;
  type: 'text' | 'select' | 'number' | 'range';
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
  validation?: (value: string) => boolean;
  errorMessage?: string;
};

const questions: Question[] = [
  {
    id: 'fullName',
    title: 'What\'s your name?',
    subtitle: 'Please enter your full name',
    type: 'text',
    placeholder: 'John Smith',
    required: true,
    validation: (value) => value.trim().length > 0,
    errorMessage: 'Name is required'
  },
  {
    id: 'location',
    title: 'Where are you located?',
    subtitle: 'Please enter your city and state',
    type: 'text',
    placeholder: 'Austin, TX',
    required: true,
    validation: (value) => value.trim().length > 3,
    errorMessage: 'Please enter a valid location'
  },
  {
    id: 'yearsOwnership',
    title: 'Home ownership experience',
    subtitle: 'How many years have you owned property?',
    type: 'select',
    options: [
      { label: 'Less than 1 year', value: '<1' },
      { label: '1-3 years', value: '1-3' },
      { label: '4-7 years', value: '4-7' },
      { label: '8-15 years', value: '8-15' },
      { label: 'More than 15 years', value: '>15' }
    ],
    required: true
  },
  {
    id: 'propertyCount',
    title: 'Property portfolio',
    subtitle: 'How many properties (units) do you own?',
    type: 'number',
    placeholder: '1',
    required: true,
    validation: (value) => !isNaN(Number(value)) && Number(value) >= 0,
    errorMessage: 'Please enter a valid number'
  },
  {
    id: 'propertyAge',
    title: 'Property age',
    subtitle: 'What\'s the approximate age of your property?',
    type: 'select',
    options: [
      { label: 'New construction (< 5 years)', value: '<5' },
      { label: '5-15 years', value: '5-15' },
      { label: '16-30 years', value: '16-30' },
      { label: '31-50 years', value: '31-50' },
      { label: 'Over 50 years', value: '>50' }
    ],
    required: true
  },
  {
    id: 'maintenanceBudget',
    title: 'Maintenance spending',
    subtitle: 'Approximate amount spent on home maintenance last year',
    type: 'select',
    options: [
      { label: 'Less than $500', value: '<500' },
      { label: '$500 - $2,000', value: '500-2000' },
      { label: '$2,000 - $5,000', value: '2000-5000' },
      { label: '$5,000 - $10,000', value: '5000-10000' },
      { label: 'More than $10,000', value: '>10000' }
    ],
    required: true
  },
  {
    id: 'issuesCount',
    title: 'Recent maintenance issues',
    subtitle: 'How many home maintenance issues did you face last month?',
    type: 'select',
    options: [
      { label: 'None', value: '0' },
      { label: '1-2 issues', value: '1-2' },
      { label: '3-5 issues', value: '3-5' },
      { label: 'More than 5', value: '>5' }
    ],
    required: true
  }
];

const OnboardingScreen: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const animateToNextQuestion = () => {
    // Animate out
    Animated.timing(slideAnimation, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Update question index
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Reset animation value without animation
      slideAnimation.setValue(width);
      // Animate in
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const animateToPrevQuestion = () => {
    // Animate out
    Animated.timing(slideAnimation, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Update question index
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Reset animation value without animation
      slideAnimation.setValue(-width);
      // Animate in
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
    setError(null);
  };

  const validateCurrentAnswer = () => {
    const answer = answers[currentQuestion.id] || '';
    
    if (currentQuestion.required && (!answer || answer.trim() === '')) {
      setError('This field is required');
      return false;
    }
    
    if (currentQuestion.validation && !currentQuestion.validation(answer)) {
      setError(currentQuestion.errorMessage || 'Invalid input');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentAnswer()) return;
    
    if (isLastQuestion) {
      submitOnboardingData();
    } else {
      animateToNextQuestion();
    }
  };

  const handleBack = () => {
    if (!isFirstQuestion) {
      animateToPrevQuestion();
    }
  };

  const submitOnboardingData = async () => {
    setIsSubmitting(true);
    
    try {
      // Get the current authenticated user
      const user = await getCurrentUser();
      
      // Prepare data for submission
      const onboardingData = {
        userId: user.userId,
        email: user.signInDetails?.loginId || '',
        ...answers
      };
      
      // Use the OnboardingService to save data
      await OnboardingService.saveOnboardingData(onboardingData);
      
      // Navigate to the main app
      // @ts-ignore - Route name might differ
      navigation.navigate('Chat', { userID: user.userId });
    } catch (error) {
      console.error('Error submitting onboarding data:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInputField = () => {
    switch (currentQuestion.type) {
      case 'text':
        return (
          <TextInput
            style={styles.textInput}
            placeholder={currentQuestion.placeholder}
            placeholderTextColor="#A0A0A0"
            value={answers[currentQuestion.id] || ''}
            onChangeText={handleAnswer}
            autoCapitalize="words"
          />
        );
        
      case 'number':
        return (
          <TextInput
            style={styles.textInput}
            placeholder={currentQuestion.placeholder}
            placeholderTextColor="#A0A0A0"
            value={answers[currentQuestion.id] || ''}
            onChangeText={handleAnswer}
            keyboardType="number-pad"
            maxLength={5}
          />
        );
        
      case 'select':
        return (
          <View style={styles.optionsContainer}>
            {currentQuestion.options?.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  answers[currentQuestion.id] === option.value && styles.selectedOption
                ]}
                onPress={() => handleAnswer(option.value)}
              >
                <Text style={[
                  styles.optionText,
                  answers[currentQuestion.id] === option.value && styles.selectedOptionText
                ]}>
                  {option.label}
                </Text>
                {answers[currentQuestion.id] === option.value && (
                  <Icon name="checkmark-circle" size={22} color="#fff" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressLine}>
            {questions.map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.progressDot,
                  index <= currentQuestionIndex ? styles.progressDotActive : {}
                ]}
              />
            ))}
          </View>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1}/{questions.length}
          </Text>
        </View>
        
        {/* Back button (except for first question) */}
        {!isFirstQuestion && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
          >
            <Icon name="arrow-back" size={24} color="#555" />
          </TouchableOpacity>
        )}
        
        <ScrollView 
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Animated question container */}
          <Animated.View 
            style={[styles.questionContainer, { transform: [{ translateX: slideAnimation }] }]}
          >
            <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
            <Text style={styles.questionSubtitle}>{currentQuestion.subtitle}</Text>
            
            {renderInputField()}
            
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
            
            <TouchableOpacity
              style={[
                styles.nextButton,
                (!answers[currentQuestion.id] && currentQuestion.required) && styles.nextButtonDisabled
              ]}
              onPress={handleNext}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={['#5271FF', '#4254CC']}
                style={styles.nextButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isSubmitting ? (
                  <Text style={styles.nextButtonText}>
                    Submitting...
                  </Text>
                ) : (
                  <Text style={styles.nextButtonText}>
                    {isLastQuestion ? 'Finish' : 'Continue'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            {isLastQuestion && (
              <Text style={styles.privacyText}>
                Your answers help us personalize your experience
              </Text>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 3,
  },
  progressDotActive: {
    backgroundColor: '#5271FF',
  },
  progressText: {
    fontSize: 14,
    color: '#767676',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  questionContainer: {
    width: '100%',
  },
  questionTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 10,
  },
  questionSubtitle: {
    fontSize: 16,
    color: '#767676',
    marginBottom: 30,
  },
  textInput: {
    width: '100%',
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 17,
    color: '#2C2C2C',
    backgroundColor: '#F8F8F8',
    marginBottom: 24,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F8F8F8',
  },
  selectedOption: {
    borderColor: '#5271FF',
    backgroundColor: '#5271FF',
  },
  optionText: {
    fontSize: 16,
    color: '#2C2C2C',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 8,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginBottom: 16,
  },
  nextButton: {
    width: '100%',
    marginTop: 10,
    shadowColor: '#5271FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  nextButtonGradient: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  privacyText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
    color: '#767676',
  },
});

export default OnboardingScreen;