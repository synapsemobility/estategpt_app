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
  useColorScheme,
  Platform
} from 'react-native';
import { ScreenHeader } from '../../common/ScreenHeader';
import Icon from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const contentPadding = 20;
const contentWidth = width - (contentPadding * 2);
const cardGap = 16;
const cardWidth = (contentWidth - cardGap) / 2; // Two cards per row with gap between

// Modern, vibrant color scheme for cool startup vibe
const COLORS = {
  primary: '#5271FF',       // Vibrant blue
  primaryDark: '#4254CC',
  secondary: '#14D39A',     // Mint green
  accent: '#FF7D54',        // Coral
  background: '#FCFCFF',
  card: '#FFFFFF',
  text: '#1D1A2F',          // Deep purple-black for text
  textSecondary: '#686C8C',
  border: '#E5E8FF',
  success: '#00DC9D',
  shadow: 'rgba(82, 113, 255, 0.12)',
  lightBg: '#F7F9FF'
};

// Feature data for the AI modes with updated descriptions
const aiModes = [
  {
    icon: "home",
    title: "Homie Mode",
    description: "Your bestie for all things home-related",
    examples: [
      "Find me a handyman this weekend",
      "What's the ballpark for a kitchen remodel?",
      "Gas vs electric HVAC - which is cheaper?"
    ],
    color: COLORS.primary,
    gradient: [COLORS.primary, '#6B8AFF']
  },
  {
    icon: "construct",
    title: "HackIt Mode",
    description: "DIY hacks and weekend warrior tips",
    examples: [
      "Quick fix for my leaky faucet?",
      "Cool weekend DIY projects under $100",
      "How do I stop these dang squeaky floors?"
    ],
    color: COLORS.accent,
    gradient: [COLORS.accent, '#FF9875']
  },
  {
    icon: "document-text",
    title: "Legit Mode",
    description: "No-BS property law & tax answers",
    examples: [
      "How to fight my property tax assessment",
      "Can I write off my new solar panels?",
      "Home office tax deductions explained"
    ],
    color: COLORS.secondary,
    gradient: [COLORS.secondary, '#35F4BC']
  }
];

// Expert call feature benefits with updated tone
const expertCallBenefits = [
  {
    icon: "flash",
    title: "Stupid Fast",
    description: "Skip the wait for in-person appointments"
  },
  {
    icon: "wallet",
    title: "Save $$$",
    description: "Way cheaper than traditional consultations"
  },
  {
    icon: "shield-checkmark",
    title: "Legit Experts",
    description: "All pros are verified (we checked)"
  },
  {
    icon: "time",
    title: "On Your Schedule",
    description: "Book calls when you actually have time"
  }
];

const FeatureCard = ({ feature, index }: { feature: typeof aiModes[0], index: number }) => (
  <View style={[
    styles.featureCard, 
    { 
      width: cardWidth,
      marginRight: index % 2 === 0 ? cardGap : 0 
    }
  ]}>
    <LinearGradient
      colors={feature.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.featureIconContainer}
    >
      <Icon name={feature.icon as keyof typeof Icon.glyphMap} size={24} color="#FFFFFF" />
    </LinearGradient>
    
    <Text style={styles.featureTitle}>{feature.title}</Text>
    <Text style={styles.featureDescription}>{feature.description}</Text>
    
    <View style={styles.examplesContainer}>
      {feature.examples.map((example, idx) => (
        <View key={idx} style={styles.exampleItem}>
          <Icon name="chatbubble" size={12} color={feature.color} style={styles.exampleIcon} />
          <Text style={styles.exampleText}>{example}</Text>
        </View>
      ))}
    </View>
  </View>
);

// Update the BenefitItem component to better match the FeatureCard style
const BenefitItem = ({ item, color }: { item: typeof expertCallBenefits[0], color: string[] }) => (
  <View style={styles.benefitItem}>
    <LinearGradient
      colors={color}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.benefitIconContainer}
    >
      <Icon name={item.icon as keyof typeof Icon.glyphMap} size={20} color="#FFFFFF" />
    </LinearGradient>
    
    <Text style={styles.benefitTitle}>{item.title}</Text>
    <Text style={styles.benefitDescription}>{item.description}</Text>
  </View>
);

export const AboutUsScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation();
  
  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.safeAreaDark]}>
      <ScreenHeader title="About EstateGPT" />
      
      <ScrollView
        style={[styles.container, isDark && styles.containerDark]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with modern illustration */}
        <View style={styles.heroSection}>
          <Image
            source={require('../../../../assets/images/house.jpg')}
            style={styles.heroImage}
            resizeMode="contain"
          />
          <Text style={styles.heroEyebrow}>INTRODUCING</Text>
          <Text style={styles.heroTitle}>Your Real Estate Copilot</Text>
          <Text style={styles.heroSubtitle}>
            AI that's actually helpful + pros you can talk to
          </Text>
        </View>
        
        {/* First Key Feature: AI Chat Assistant */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTagline}>CHAT ASSISTANT</Text>
          <Text style={styles.sectionTitle}>AI in your pocket. Like having a real estate expert who never sleeps.</Text>
          
          {/* New AI Modes Cards - Layout in columns */}
          <View style={styles.modesContainer}>
            {aiModes.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </View>
        </View>
        
        {/* Second Key Feature: Expert Video Calls */}
        <View style={styles.expertSection}>
          <Text style={styles.sectionTagline}>VIDEO CONSULTATIONS</Text>
          <Text style={styles.sectionTitle}>Stuck? Talk to actual humans who know their stuff.</Text>
          
          {/* Expert Call Hero Image */}
          <View style={styles.expertImageContainer}>
            <Image
              source={require('../../../../assets/images/callpro-hero.png')}
              style={styles.expertImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.expertImageOverlay}
            >
              <Text style={styles.expertImageText}>Pros On Demand</Text>
            </LinearGradient>
          </View>
          
          {/* Expert Call Benefits - Fixed 2x2 grid layout with matched styling */}
          <View style={styles.benefitsGrid}>
            {expertCallBenefits.map((benefit, index) => {
              // Calculate row and column for precise positioning
              const isLeftColumn = index % 2 === 0;
              const isTopRow = index < 2;
              
              // Define gradient colors based on benefit type
              const gradientColors = index === 0 ? [COLORS.accent, '#FF8A65'] : 
                                    index === 1 ? [COLORS.secondary, '#35F4BC'] :
                                    index === 2 ? [COLORS.primary, '#6B8AFF'] :
                                                 ['#7A69EE', '#9D8FFF'];
              
              return (
                <View 
                  key={index} 
                  style={[
                    styles.benefitCard,
                    { 
                      width: cardWidth,
                      marginRight: isLeftColumn ? cardGap : 0,
                      marginBottom: isTopRow ? cardGap : 0
                    }
                  ]}
                >
                  <BenefitItem item={benefit} color={gradientColors} />
                </View>
              );
            })}
          </View>
          
          {/* CTA Button */}
          <TouchableOpacity 
            style={styles.callToActionButton}
            onPress={() => navigation.navigate('CallPro')}
          >
            <LinearGradient
              colors={[COLORS.accent, '#FF6A3D']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.gradientButton}
            >
              <Icon name="videocam" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Book a Call</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {/* Our Values */}
        <View style={styles.valuesSection}>
          <Text style={styles.sectionTagline}>OUR MISSION</Text>
          <Text style={styles.valuesTitle}>
            Making Real Estate Easier Than It Has Any Right To Be
          </Text>
          
          <View style={styles.valueCardsContainer}>
            <LinearGradient 
              colors={[COLORS.primary, '#6B8AFF']}
              style={styles.valueCardPrimary}
            >
              <Icon name="shield-checkmark" size={28} color="#FFFFFF" />
              <Text style={styles.valueCardText}>Straight talk, no BS</Text>
            </LinearGradient>
            
            <View style={styles.valueCardRow}>
              <LinearGradient 
                colors={[COLORS.secondary, '#35F4BC']}
                style={styles.valueCardSecondary}
              >
                <Icon name="flash" size={24} color="#FFFFFF" />
                <Text style={styles.valueCardText}>Time-saving shortcuts</Text>
              </LinearGradient>
              
              <LinearGradient 
                colors={[COLORS.accent, '#FF9875']}
                style={styles.valueCardAccent}
              >
                <Icon name="wallet" size={24} color="#FFFFFF" />
                <Text style={styles.valueCardText}>Budget-friendly solutions</Text>
              </LinearGradient>
            </View>
          </View>
        </View>
        
        {/* Team & Contact Section */}
        <View style={styles.teamSection}>
          <View style={styles.founderCardContainer}>
            
            <View style={styles.founderInfo}>
              <Text style={styles.founderName}>Apoorv Singh</Text>
              <Text style={styles.founderTitle}>Founder & CEO</Text>
              <Text style={styles.founderQuote}>
                "I started EstateGPT because real estate shouldn't be complicated. Or boring."
              </Text>
              
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => Linking.openURL('mailto:apoorv@estategpt.io')}
              >
                <Icon name="mail" size={18} color={COLORS.primary} style={styles.contactIcon} />
                <Text style={styles.contactText}>apoorv@estategpt.io</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Footer with Social Links */}
        <View style={styles.footer}>
          <Image 
            source={require('../../../../assets/logo.png')}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={styles.versionText}>EstateGPT v1.1.0</Text>
          
          <View style={styles.socialLinksContainer}>
            <TouchableOpacity 
                style={styles.socialButton}
                onPress={() => Linking.openURL('https://x.com/estategpt')}
              >
              <Icon name="logo-twitter" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://www.instagram.com/estategpt.io/')}
              >
              <Icon name="logo-instagram" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://www.linkedin.com/company/estategpt/')}
              >
              <Icon name="logo-linkedin" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
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
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  contentContainer: {
    paddingHorizontal: contentPadding,
    paddingBottom: 40,
  },
  
  // Hero Section - Refined spacing and alignment
  heroSection: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 40,
  },
  heroImage: {
    width: width * 0.8,
    height: 180,
    marginBottom: 16,
  },
  heroEyebrow: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.accent,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: width * 0.85,
  },
  
  // Section Styling - Consistent spacing
  sectionContainer: {
    marginBottom: 40,
  },
  sectionTagline: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
    lineHeight: 28,
  },
  
  // AI Modes - Better aligned cards
  modesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 6,
  },
  featureCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  examplesContainer: {
    gap: 8,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 2,
  },
  exampleIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  exampleText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  
  // Expert Section - Refined visual hierarchy
  expertSection: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 5,
    marginBottom: 40,
  },
  expertImageContainer: {
    width: '100%',
    height: 300, // Reduced height to make more room for benefits
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
  },
  expertImage: {
    width: '100%',
    height: '100%',
  },
  expertImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  expertImageText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '120%',          // Ensure full width
    marginBottom: 24,
    marginTop: 20,          // More space after image
  },
  benefitCard: {
    // This is the outer container that positions the cards
    height: 180, // Increased height for better content spacing
    // width: 30
    width: '30%'
  },
  benefitItem: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    height: '100%', // Fill the benefitCard container
    width: '88%',
    alignItems: 'flex-start', // Align content to the left like feature cards
  },
  benefitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  benefitDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  callToActionButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  // Values Section - More consistent with other sections
  valuesSection: {
    marginBottom: 40,
  },
  valuesTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
    lineHeight: 28,
  },
  valueCardsContainer: {
    gap: 14,
  },
  valueCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14, 
  },
  valueCardPrimary: {
    height: 100,
    width: '100%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    flexDirection: 'row',
    shadowColor: COLORS.primary + '40',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  valueCardSecondary: {
    height: 100,
    width: cardWidth,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.secondary + '40',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  valueCardAccent: {
    height: 100,
    width: cardWidth,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent + '40',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  valueCardText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginLeft: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  // Team Section - More refined presentation
  teamSection: {
    marginBottom: 32,
  },
  founderCardContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  founderImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  founderImage: {
    width: '100%',
    height: '100%',
  },
  founderImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundGradient: 'linear',
  },
  founderInfo: {
    padding: 20,
  },
  founderName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  founderTitle: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 12,
    fontWeight: '600',
  },
  founderQuote: {
    fontSize: 15,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightBg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  contactIcon: {
    marginRight: 8,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  // Footer - Clean, aligned footer
  footer: {
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 0 : 16,
  },
  footerLogo: {
    width: 40,
    height: 40,
    marginBottom: 10,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightBg,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
