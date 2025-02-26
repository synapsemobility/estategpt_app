import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { ScreenHeader } from '../../common/ScreenHeader';
import Icon from '@expo/vector-icons/Ionicons';

const darkGray = 'rgba(26, 26, 26, 1)';
const lightGray = 'rgba(242, 242, 242, 1)';

const homieExamples = [
  "Find nearby handyman\navailable this weekend",
  "Kitchen remodel quotes\nfor single family home",
  "Compare lifetime costs\nof HVAC systems"
];

const hackItExamples = [
  "How to fix leaky faucet\nDIY guide",
  "Weekend DIY projects\nfor home improvement",
  "Fix squeaky floors\nstep-by-step"
];

const legitExamples = [
  "Property tax assessments\nappeal process",
  "Energy-efficient home\ntax credits",
  "Home office deduction\nrequirements",
  "Title insurance\nexplained"
];

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  examples: string[];
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, examples, color }) => (
  <View style={styles.featureCard}>
    <View style={styles.featureHeader}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Icon name={icon as keyof typeof Icon.glyphMap} size={24} color="white" />
      </View>
      <View style={styles.featureHeaderText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
    
    <View style={styles.examplesContainer}>
      <Text style={styles.examplesTitle}>Example Queries:</Text>
      {examples.map((example, index) => (
        <View key={index} style={styles.exampleItem}>
          <Text style={styles.exampleText}>{example}</Text>
        </View>
      ))}
    </View>
  </View>
);

const BulletPoint = ({ text }: { text: string }) => (
  <View style={styles.bulletPoint}>
    <Icon name="checkmark-circle" size={20} color="#555555" />
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const ContactItem = ({ icon, label, isEmail = false }: { 
  icon: keyof typeof Icon.glyphMap;
  label: string;
  isEmail?: boolean;
}) => (
  <TouchableOpacity 
    style={styles.contactItem}
    onPress={() => isEmail && Linking.openURL(`mailto:${label}`)}
  >
    <Icon name={icon} size={20} color="#555555" />
    <Text style={styles.contactLabel}>{label}</Text>
  </TouchableOpacity>
);

export const AboutUsScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="About Us" />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Header Section */}
          <Text style={styles.subtitle}>Your Real Estate Copilot</Text>

          {/* Mode Features Section */}
          <View style={styles.featuresSection}>
            <FeatureCard
              icon="home"
              title="Homie Mode"
              description="Your AI-powered home maintenance expert"
              examples={homieExamples}
              color="#555555"
            />
            
            <FeatureCard
              icon="hammer"
              title="HackIt Mode"
              description="DIY solutions with video tutorials"
              examples={hackItExamples}
              color="#555555"
            />
            
            <FeatureCard
              icon="document-text"
              title="Legit Mode"
              description="Property law & tax guidance"
              examples={legitExamples}
              color="#555555"
            />
          </View>

          {/* Value Proposition */}
          <View style={styles.valueSection}>
            <Text style={styles.sectionTitle}>Why Choose EstateGPT?</Text>
            <Text style={styles.sectionSubtitle}>
              Combining AI precision with industry expertise to deliver:
            </Text>
            <BulletPoint text="Instant contractor connections" />
            <BulletPoint text="Step-by-step DIY guides with videos" />
            <BulletPoint text="Legal document analysis in minutes" />
            <BulletPoint text="Personalized cost estimations" />
          </View>

          {/* Contact Section */}
          <View style={styles.contactSection}>
            <View style={styles.divider} />
            <Text style={styles.contactTitle}>Contact Our Team</Text>
            <ContactItem 
              icon="mail"
              label="apoorv@estategpt.io"
              isEmail={true}
            />
            <ContactItem 
              icon="person"
              label="Apoorv Singh, Founder"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#555555',
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresSection: {
    gap: 20,
    marginBottom: 30,
  },
  featureCard: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  featureHeader: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureHeaderText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666666',
  },
  examplesContainer: {
    gap: 8,
  },
  examplesTitle: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  exampleItem: {
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    marginBottom: 6,
  },
  exampleText: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
  },
  valueSection: {
    gap: 12,
    marginBottom: 30,
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  bulletText: {
    fontSize: 14,
    color: '#555555',
  },
  contactSection: {
    gap: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#EBEBEB',
    marginVertical: 12,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  contactLabel: {
    fontSize: 14,
    color: '#555555',
  },
});
