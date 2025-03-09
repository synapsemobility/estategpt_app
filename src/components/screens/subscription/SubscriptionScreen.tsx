import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import Icon from '@expo/vector-icons/Ionicons';
import { ScreenHeader } from '../../common/ScreenHeader';
import { useRevenueCatManager } from '../../../services/PurchaseManager/useRevenueCatManager';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Define consistent colors
const COLORS = {
  primary: '#777777',
  primaryDark: '#000000',
  premium: '#FF9500',
  background: '#F7F8FA',
  card: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#6A7A8C',
  border: '#E1E8ED',
  success: '#34C759',
};

interface Product {
  id: string;
  displayName: string;
  displayPrice: string;
}

const SubscriptionCard = ({ product, onSubscribe, isPro }) => (
  <View style={[styles.card, isPro && styles.premiumCard]}>
    {isPro && (
      <View style={styles.bestValueBadge}>
        <Text style={styles.bestValueText}>BEST VALUE</Text>
      </View>
    )}
    
    <View style={styles.cardHeader}>
      <View style={styles.planNameContainer}>
        <Text style={[styles.planName, isPro && styles.premiumPlanName]}>
          {product.displayName}
        </Text>
        {isPro ? (
          <View style={styles.proTag}>
            <Text style={styles.proTagText}>PRO</Text>
          </View>
        ) : (
          <View style={styles.basicTag}>
            <Text style={styles.basicTagText}>BASIC</Text>
          </View>
        )}
      </View>
      <Text style={[styles.price, isPro && styles.premiumPrice]}>
        {product.displayPrice}
        <Text style={styles.period}>/month</Text>
      </Text>
    </View>
    
    <View style={styles.featuresContainer}>
      {isPro ? (
        <>
          <Feature icon="infinite" text="Everything in HomeOwner's Plan with 15X limits" isPro={true} />
          <Feature icon="speedometer" text="Smarter AI-powered portfolio management" isPro={true} />
          <Feature icon="document-text" text="Document management for multiple properties" isPro={true} />
          <Feature icon="calculator" text="Advanced tax strategies like bonus depreciation, 1031 exchange, etc." isPro={true} />
          <Feature icon="briefcase" text="Ideal for realtors, HOA managers, home inspectors, and other real estate professionals" isPro={true} />
        </>
      ) : (
        <>
          <Feature icon="chatbubble-ellipses" text="Real-time chat support for all home maintenance related questions" isPro={false} />
          <Feature icon="scan" text="Image based damage assessment and cost estimation" isPro={false} />
          <Feature icon="document-text" text="Private CPA and real estate legal support with AI" isPro={false} />
          <Feature icon="location" text="Hyperlocal legal and tax advice" isPro={false} />
          <Feature icon="images" text="Queryable datahouse for property documents and information" isPro={false} />
          <Feature icon="home" text="Perfect for primary property owners" isPro={false} />
        </>
      )}
    </View>

    <TouchableOpacity 
      style={[styles.subscribeButton, isPro && styles.premiumSubscribeButton]}
      onPress={onSubscribe}
      activeOpacity={0.8}
    >
      {isPro ? (
        <LinearGradient 
          colors={['#FF9500', '#FF7A00']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.subscribeButtonText}>
            Subscribe Now
          </Text>
        </LinearGradient>
      ) : (
        <LinearGradient 
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.subscribeButtonText}>
            Subscribe Now
          </Text>
        </LinearGradient>
      )}
    </TouchableOpacity>
  </View>
);

const Feature = ({ icon, text, isPro }) => (
  <View style={styles.featureRow}>
    <View style={[styles.featureIconContainer, isPro && styles.premiumFeatureIcon]}>
      <Icon name={icon} size={16} color={isPro ? COLORS.premium : COLORS.primary} />
    </View>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

export const SubscriptionScreen = observer(() => {
  const purchaseManager = useRevenueCatManager();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Initialize RevenueCat
        await purchaseManager.initialize();
        
        // Format offerings into products for the UI
        const formattedProducts = [];
        
        // Add pro plan (first in the list)
        const proOfferings = purchaseManager.offerings.flatMap(offering => 
          offering.availablePackages.filter(pkg => pkg.product.identifier === '01')
        );
        
        if (proOfferings.length > 0) {
          formattedProducts.push({
            productId: proOfferings[0].product.identifier, // Use product.identifier
            title: proOfferings[0].product.title,
            localizedPrice: proOfferings[0].product.priceString
          });
        }
        
        // Add homeowner plan (second in the list)
        const homeownerOfferings = purchaseManager.offerings.flatMap(offering => 
          offering.availablePackages.filter(pkg => pkg.product.identifier === '00')
        );
        
        if (homeownerOfferings.length > 0) {
          formattedProducts.push({
            productId: homeownerOfferings[0].product.identifier, // Use product.identifier
            title: homeownerOfferings[0].product.title,
            localizedPrice: homeownerOfferings[0].product.priceString
          });
        }
        
        setProducts(formattedProducts);
        
      } catch (err) {
        console.error('Failed to initialize products:', err);
        setError('Failed to load subscription options');
      } finally {
        setIsLoading(false);
      }
    };

    initializeProducts();
  }, []);

  const handleSubscribe = async (product: Product) => {
    try {
      setIsLoading(true);
      await purchaseManager.purchase(product.id);
    } catch (error) {
      console.error('Purchase failed:', error);
      Alert.alert('Purchase Failed', 'Unable to complete the purchase. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setIsLoading(true);
      await purchaseManager.restorePurchases();
      Alert.alert('Purchases Restored', 'Your purchases have been restored successfully.');
    } catch (error) {
      Alert.alert('Restore Failed', 'Unable to restore purchases. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscriptions = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else {
      // For Android
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Premium Plans" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading subscription options...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Premium Plans" />
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image 
            source={require('../../../../assets/images/subscription-hero.png')} 
            style={styles.heroImage} 
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>
            Unlock Premium Features
          </Text>
          <Text style={styles.heroSubtitle}>
            Choose the plan that fits your needs
          </Text>
        </View>
        
        {/* Subscription Cards */}
        {products.map((product, index) => (
          <SubscriptionCard
            key={product.productId}
            product={{
              id: product.productId,
              displayName: product.title || '',
              displayPrice: product.localizedPrice || ''
            }}
            isPro={index === 0} // Assuming first product is Pro Plan
            onSubscribe={() => handleSubscribe({
              id: product.productId,
              displayName: product.title || '',
              displayPrice: product.localizedPrice || ''
            })}
          />
        ))}
        
        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsSectionTitle}>Why Subscribe?</Text>
          
          <View style={styles.benefitItem}>
            <View style={styles.benefitIconContainer}>
              <Icon name="flash" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Advanced AI Assistance</Text>
              <Text style={styles.benefitDescription}>
                Get smarter, faster responses tailored to your specific real estate needs.
              </Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <View style={styles.benefitIconContainer}>
              <Icon name="shield-checkmark" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Legal & Tax Protection</Text>
              <Text style={styles.benefitDescription}>
                Access specialized legal and tax guidance for property owners.
              </Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <View style={styles.benefitIconContainer}>
              <Icon name="trending-up" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Better Returns</Text>
              <Text style={styles.benefitDescription}>
                Optimize your real estate investments with data-driven insights.
              </Text>
            </View>
          </View>
        </View>

        {/* Subscription Management */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.footerButton} 
            onPress={handleRestorePurchases}
            activeOpacity={0.8}
          >
            <Icon name="refresh-circle" size={20} color={COLORS.primary} style={styles.footerButtonIcon} />
            <Text style={styles.footerButtonText}>Restore Purchases</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.footerButton} 
            onPress={handleManageSubscriptions}
            activeOpacity={0.8}
          >
            <Icon name="settings" size={20} color={COLORS.primary} style={styles.footerButtonIcon} />
            <Text style={styles.footerButtonText}>Manage Subscriptions</Text>
          </TouchableOpacity>

          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}>
              <Text style={styles.link}>Terms of Use</Text>
            </TouchableOpacity>
            <Text style={styles.dot}>•</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.estategpt.io/#privacy')}>
              <Text style={styles.link}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  
  // Hero Section
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
  },
  
  // Subscription Cards
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
  },
  premiumCard: {
    borderColor: COLORS.premium,
    borderWidth: 2,
    shadowColor: COLORS.premium,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  cardHeader: {
    marginBottom: 20,
  },
  planNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 8,
  },
  premiumPlanName: {
    color: COLORS.premium,
  },
  proTag: {
    backgroundColor: COLORS.premium,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  proTagText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  basicTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  basicTagText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bestValueBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.premium,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
  },
  bestValueText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
  },
  premiumPrice: {
    color: COLORS.premium,
  },
  period: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  
  // Features
  featuresContainer: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  premiumFeatureIcon: {
    backgroundColor: `${COLORS.premium}15`,
  },
  featureText: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
    lineHeight: 22,
  },
  
  // Subscribe Button
  subscribeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  premiumSubscribeButton: {
    // Special styling for premium button if needed
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Benefits Section
  benefitsSection: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  benefitsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  benefitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  
  // Footer
  footer: {
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  footerButtonIcon: {
    marginRight: 12,
  },
  footerButtonText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  link: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
  dot: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginHorizontal: 8,
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
