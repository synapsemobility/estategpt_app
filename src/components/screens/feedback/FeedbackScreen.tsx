import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Linking,
  Image,
  ScrollView,
  Dimensions
} from 'react-native';
import { ScreenHeader } from '../../common/ScreenHeader';
import Icon from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const COLORS = {
  primary: '#777777',
  primaryDark: '#000000',
  background: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#6A7A8C',
};

export const FeedbackScreen = () => {
  const openGoogleForm = async () => {
    const url = 'https://forms.gle/TjxtzVqWb4H2Jgnc9';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    } catch (error) {
      console.error("An error occurred while opening the URL:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Submit Feedback" />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Image */}
        <View style={styles.heroSection}>
          <Image 
            source={require('../../../../assets/images/feedback-hero.jpg')} 
            style={styles.heroImage} 
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>We Value Your Feedback</Text>
          <Text style={styles.heroSubtitle}>
            Help us improve EstateGPT by sharing your thoughts and suggestions
          </Text>
        </View>

        {/* Feedback Cards */}
        <View style={styles.cardsContainer}>
          <View style={styles.feedbackCard}>
            <View style={styles.cardIconContainer}>
              <Icon name="bulb-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>Got a suggestion?</Text>
            <Text style={styles.cardDescription}>
              Share your ideas for new features or improvements that would make EstateGPT better for you.
            </Text>
          </View>

          <View style={styles.feedbackCard}>
            <View style={styles.cardIconContainer}>
              <Icon name="bug-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>Found a bug?</Text>
            <Text style={styles.cardDescription}>
              Let us know about any issues you've encountered so we can fix them quickly.
            </Text>
          </View>

          <View style={styles.feedbackCard}>
            <View style={styles.cardIconContainer}>
              <Icon name="star-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>General feedback</Text>
            <Text style={styles.cardDescription}>
              Tell us what you like about EstateGPT and what we could do better.
            </Text>
          </View>
        </View>

        {/* Submit Feedback Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={openGoogleForm}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.submitGradient}
          >
            <Icon 
              name="create-outline" 
              size={20} 
              color="#fff" 
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>
              Submit Your Feedback
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Thank You Note */}
        <Text style={styles.thanksText}>
          Thank you for helping us make EstateGPT better!
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  heroImage: {
    width: width * 0.6,
    height: width * 0.6,
    maxHeight: 220,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  cardsContainer: {
    marginBottom: 28,
  },
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(46, 92, 141, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  submitButton: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  thanksText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});