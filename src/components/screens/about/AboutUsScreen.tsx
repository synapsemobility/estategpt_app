import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { ScreenHeader } from '../../common/ScreenHeader';
import Icon from '@expo/vector-icons/Ionicons';

const darkGray = 'rgba(26, 26, 26, 1)';
const lightGray = 'rgba(242, 242, 242, 1)';

const homeCareExamples = [
  "Fix leaky faucet - DIY solutions",
  "Kitchen remodel cost estimates",
  "HVAC system lifetime costs",
  "Budget-friendly value improvements"
];

const legalCareExamples = [
  "Handling property tax assessments?",
  "Tax credits for energy-efficient homes?",
  "Claiming home office on taxes?",
  "Explain title insurance requirements",
  "Mortgage interest tax deductions explained?",
  "Deductible expenses for rental properties?",
  "Tax implications of selling a home?",
  "Capital gains tax on property sales?"
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
    <Icon name="checkmark-circle" size={20} color={darkGray} />
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
    <Icon name={icon} size={20} color={darkGray} />
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
              title="HomeCare Mode"
              description="Your AI-powered home maintenance expert"
              examples={homeCareExamples}
              color={darkGray}
            />
            
            <FeatureCard
              icon="book"
              title="LegalCare Mode"
              description="Property law & document analysis"
              examples={legalCareExamples}
              color={darkGray}
            />
          </View>

          {/* Value Proposition */}
          <View style={styles.valueSection}>
            <Text style={styles.sectionTitle}>Why Choose EstateGPT?</Text>
            <Text style={styles.sectionSubtitle}>
              Combining AI precision with industry expertise to deliver:
            </Text>
            <BulletPoint text="Instant contractor connections" />
            <BulletPoint text="Legal document analysis in minutes" />
            <BulletPoint text="Personalized cost estimations" />
            <BulletPoint text="Regulatory compliance checks" />
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
    padding: 30,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
    color: `${darkGray}cc`,
    fontStyle: 'italic',
    marginBottom: 30,
  },
  featuresSection: {
    gap: 30,
    marginBottom: 30,
  },
  featureCard: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: darkGray,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  featureHeader: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureHeaderText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: darkGray,
  },
  featureDescription: {
    fontSize: 14,
    color: `${darkGray}b3`,
  },
  examplesContainer: {
    gap: 10,
  },
  examplesTitle: {
    fontSize: 12,
    color: `${darkGray}99`,
  },
  exampleItem: {
    padding: 10,
    backgroundColor: lightGray,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${darkGray}1a`,
  },
  exampleText: {
    fontSize: 14,
    color: darkGray,
  },
  valueSection: {
    gap: 15,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: darkGray,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: `${darkGray}cc`,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bulletText: {
    fontSize: 16,
    color: `${darkGray}cc`,
  },
  contactSection: {
    gap: 15,
  },
  divider: {
    height: 1,
    backgroundColor: `${darkGray}33`,
    marginVertical: 15,
  },
  contactTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: darkGray,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  contactLabel: {
    fontSize: 16,
    color: `${darkGray}cc`,
  },
});
