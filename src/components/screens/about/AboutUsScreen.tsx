import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
  Image,
  Dimensions,
  useColorScheme
} from 'react-native';
import { ScreenHeader } from '../../common/ScreenHeader';
import Icon from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const cardWidth = width - 48;

// Consistent color scheme
const COLORS = {
  primary: '#2E5C8D',
  primaryDark: '#1E3F66',
  secondary: '#555555',
  accent: '#FF9500',
  background: '#F7F8FA',
  card: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#6A7A8C',
  border: '#E1E8ED',
  success: '#34C759'
};

// Feature data for the AI modes
const aiModes = [
  {
    icon: "home-outline",
    title: "Homie Mode",
    description: "Your AI-powered home maintenance expert",
    examples: [
      "Find nearby handyman available this weekend",
      "Kitchen remodel quotes for single family home",
      "Compare lifetime costs of HVAC systems"
    ],
    color: COLORS.primary
  },
  {
    icon: "hammer-outline",
    title: "HackIt Mode",
    description: "DIY solutions with step-by-step instructions",
    examples: [
      "How to fix leaky faucet DIY guide",
      "Weekend DIY projects for home improvement",
      "Fix squeaky floors step-by-step"
    ],
    color: COLORS.accent
  },
  {
    icon: "document-text-outline",
    title: "Legit Mode",
    description: "Property law & tax guidance",
    examples: [
      "Property tax assessments appeal process",
      "Energy-efficient home tax credits",
      "Home office deduction requirements"
    ],
    color: COLORS.secondary
  }
];

// Expert call feature benefits
const expertCallBenefits = [
  {
    icon: "time-outline",
    title: "Save Time",
    description: "Quick video consultations without waiting for in-person appointments"
  },
  {
    icon: "cash-outline",
    title: "Cost-Effective",
    description: "Lower rates than traditional in-person consultations"
  },
  {
    icon: "shield-checkmark-outline",
    title: "Vetted Experts",
    description: "All professionals are qualified and verified"
  },
  {
    icon: "calendar-outline",
    title: "Flexible Scheduling",
    description: "Book calls at times that work for you"
  }
];

const FeatureCard = ({ feature }: { feature: typeof aiModes[0] }) => (
  <View style={styles.featureCard}>
    <LinearGradient
      colors={[feature.color, feature.color + 'DD']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.featureIconContainer}
    >
      <Icon name={feature.icon as keyof typeof Icon.glyphMap} size={24} color="#FFFFFF" />
    </LinearGradient>
    
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{feature.title}</Text>
      <Text style={styles.featureDescription}>{feature.description}</Text>
      
      <View style={styles.examplesContainer}>
        {feature.examples.map((example, index) => (
          <View key={index} style={styles.exampleItem}>
            <Icon name="chatbubble-ellipses-outline" size={14} color={feature.color} style={styles.exampleIcon} />
            <Text style={styles.exampleText}>{example}</Text>
          </View>
        ))}
      </View>
    </View>
  </View>
);

const BenefitItem = ({ item }: { item: typeof expertCallBenefits[0] }) => (
  <View style={styles.benefitItem}>
    <View style={styles.benefitIconContainer}>
      <Icon name={item.icon as keyof typeof Icon.glyphMap} size={22} color={COLORS.primary} />
    </View>
    <View style={styles.benefitContent}>
      <Text style={styles.benefitTitle}>{item.title}</Text>
      <Text style={styles.benefitDescription}>{item.description}</Text>
    </View>
  </View>
);

export const AboutUsScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation(); // Add navigation hook
  
  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark]}>
      <ScreenHeader title="About EstateGPT" />
      
      <ScrollView
        style={[styles.container, isDark && styles.containerDark]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={require('../../../../assets/images/house-illustration.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>Your Real Estate Copilot</Text>
          <Text style={styles.heroSubtitle}>
            Expert AI assistance and professional consultations for all your property needs
          </Text>
        </View>
        
        {/* Section Divider */}
        <View style={styles.sectionDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Two Powerful Solutions</Text>
          <View style={styles.dividerLine} />
        </View>
        
        {/* First Key Feature: AI Chat Assistant */}
        <View style={styles.keyFeatureSection}>
          <View style={styles.keyFeatureHeader}>
            <View style={styles.keyFeatureNumberContainer}>
              <Text style={styles.keyFeatureNumber}>1</Text>
            </View>
            <View style={styles.keyFeatureTitleContainer}>
              <Text style={styles.keyFeatureTitle}>AI Chat Assistant</Text>
              <Text style={styles.keyFeatureSubtitle}>
                Instant answers to all your property questions
              </Text>
            </View>
          </View>
          
          <Text style={styles.keyFeatureDescription}>
            Our advanced AI provides specialized assistance in three modes:
          </Text>
          
          {/* AI Modes Cards */}
          <View style={styles.modesContainer}>
            {aiModes.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </View>
        </View>
        
        {/* Second Key Feature: Expert Video Calls */}
        <View style={styles.keyFeatureSection}>
          <View style={styles.keyFeatureHeader}>
            <View style={[styles.keyFeatureNumberContainer, styles.expertNumberContainer]}>
              <Text style={styles.keyFeatureNumber}>2</Text>
            </View>
            <View style={styles.keyFeatureTitleContainer}>
              <Text style={styles.keyFeatureTitle}>Expert Video Consultations</Text>
              <Text style={styles.keyFeatureSubtitle}>
                Connect with pros for personalized help
              </Text>
            </View>
          </View>
          
          {/* Expert Call Card */}
          <View style={styles.expertCardContainer}>
            <Image
              source={require('../../../../assets/images/video-call.png')}
              style={styles.expertImage}
              resizeMode="cover"
            />
            <View style={styles.expertCardContent}>
              <Text style={styles.expertCardTitle}>
                Professional Help, Just a Call Away
              </Text>
              <Text style={styles.expertCardDescription}>
                When you need specialized expertise, our network of professionals is ready to help through convenient video consultations.
              </Text>
              
              {/* Update the button to use navigation instead of Linking */}
              <TouchableOpacity 
                style={styles.callToActionButton}
                onPress={() => navigation.navigate('CallPro')}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.gradientButton}
                >
                  <Icon name="videocam" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Schedule a Call</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              {/* Expert Call Benefits */}
              <View style={styles.benefitsContainer}>
                {expertCallBenefits.map((benefit, index) => (
                  <BenefitItem key={index} item={benefit} />
                ))}
              </View>
            </View>
          </View>
        </View>
        
        {/* Company Values Section */}
        <View style={styles.valuesSection}>
          <Text style={styles.valuesSectionTitle}>Our Mission</Text>
          <Text style={styles.valuesSectionDescription}>
            To simplify property management by combining cutting-edge AI with human expertise, making professional knowledge accessible and affordable for everyone.
          </Text>
          
          <View style={styles.valuesContainer}>
            <View style={styles.valueItem}>
              <Icon name="shield-checkmark" size={24} color={COLORS.success} />
              <Text style={styles.valueText}>Trusted Advice</Text>
            </View>
            <View style={styles.valueItem}>
              <Icon name="flash" size={24} color={COLORS.accent} />
              <Text style={styles.valueText}>Fast Solutions</Text>
            </View>
            <View style={styles.valueItem}>
              <Icon name="wallet" size={24} color={COLORS.primary} />
              <Text style={styles.valueText}>Cost Effective</Text>
            </View>
          </View>
        </View>
        
        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contact Us</Text>
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => Linking.openURL('mailto:apoorv@estategpt.io')}
          >
            <Icon name="mail" size={20} color={COLORS.primary} style={styles.contactIcon} />
            <Text style={styles.contactText}>apoorv@estategpt.io</Text>
          </TouchableOpacity>
          
          <View style={styles.founderContainer}>
            <View style={styles.founderAvatarContainer}>
              <Text style={styles.founderAvatar}>AS</Text>
            </View>
            <View style={styles.founderInfo}>
              <Text style={styles.founderName}>Apoorv Singh</Text>
              <Text style={styles.founderTitle}>Founder & CEO</Text>
            </View>
          </View>
        </View>
        
        {/* App Version Footer */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>EstateGPT v1.1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeAreaDark: {
    backgroundColor: '#1A1A1A',
  },
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#1A1A1A',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 10,
  },
  heroImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  
  // Section Divider
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  
  // Key Feature Sections
  keyFeatureSection: {
    marginBottom: 40,
  },
  keyFeatureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  keyFeatureNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expertNumberContainer: {
    backgroundColor: COLORS.secondary,
  },
  keyFeatureNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  keyFeatureTitleContainer: {
    flex: 1,
  },
  keyFeatureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  keyFeatureSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  keyFeatureDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 21,
  },
  
  // AI Modes Cards
  modesContainer: {
    gap: 16,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  examplesContainer: {
    gap: 8,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  exampleIcon: {
    marginRight: 6,
    marginTop: 3,
  },
  exampleText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  
  // Expert Call Section
  expertCardContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  expertImage: {
    width: cardWidth,
    height: 180,
  },
  expertCardContent: {
    padding: 16,
  },
  expertCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  expertCardDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  callToActionButton: {
    marginBottom: 24,
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  benefitsContainer: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  benefitDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  
  // Values Section
  valuesSection: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  valuesSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  valuesSectionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  valuesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  valueItem: {
    alignItems: 'center',
    gap: 8,
  },
  valueText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  
  // Contact Section
  contactSection: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: `${COLORS.primary}10`,
    padding: 12,
    borderRadius: 8,
  },
  contactIcon: {
    marginRight: 10,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.text,
  },
  founderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  founderAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  founderAvatar: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  founderInfo: {
    flex: 1,
  },
  founderName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  founderTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  
  // Version Footer
  versionContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
