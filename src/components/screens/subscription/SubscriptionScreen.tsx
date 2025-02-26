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
} from 'react-native';
import { observer } from 'mobx-react-lite';
import Icon from '@expo/vector-icons/Ionicons';
import { ScreenHeader } from '../../common/ScreenHeader';
import { usePurchaseManager } from '../../../services/PurchaseManager';
import * as RNIap from 'react-native-iap';
import { toJS } from 'mobx';

interface Product {
  id: string;
  displayName: string;
  displayPrice: string;
}

const SubscriptionCard = ({ product, onSubscribe }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.planName}>{product.displayName}</Text>
      <Text style={styles.price}>{product.displayPrice}<Text style={styles.period}>/month</Text></Text>
    </View>
    
    <View style={styles.featuresContainer}>
      {product.id === '01' ? (
        <>
          <Feature icon="infinite" text="Everything in HomeOwner's Plan with 15X limits" />
          <Feature icon="speedometer" text="Smarter AI-powered portfolio management" />
          <Feature icon="document-text" text="Document management for multiple properties" />
          <Feature icon="document-text" text="Advanced tax strategies like bonus depreciation, 1031 exchange, etc." />
          <Feature icon="briefcase" text="Ideal for realtors, HOA managers, home inspectors, and other real estate professionals" />
        </>
      ) : (
        <>
          <Feature icon="library" text="Real-time chat support for all home maintenance related questions" />
          <Feature icon="scan" text="Image based damage assessment and cost estimation" />
          <Feature icon="document-text" text="Private CPA and real estate legal support with AI" />
          <Feature icon="chatbox" text="Hyperlocal legal and tax advice" />
          <Feature icon="images" text="Queryale datahouse for property documents and information" />
          <Feature icon="home" text="Perfect for primary property owners" />
        </>
      )}
    </View>

    <TouchableOpacity style={styles.subscribeButton} onPress={onSubscribe}>
      <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
    </TouchableOpacity>
  </View>
);

const Feature = ({ icon, text }) => (
  <View style={styles.featureRow}>
    <Icon name={icon} size={20} color="#4A4A4A" style={styles.featureIcon} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

export const SubscriptionScreen = observer(() => {
  const purchaseManager = usePurchaseManager();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await purchaseManager.initialize();
      } catch (err) {
        console.error('Failed to initialize products:', err);
        setError('Failed to load subscription options');
      } finally {
        setIsLoading(false);
      }
    };

    initializeProducts();
    return () => setIsLoading(false);
  }, []);

  const products = toJS(purchaseManager.products || []);

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
    await purchaseManager.restorePurchases();
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
        <ScreenHeader title="Subscriptions" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading subscriptions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Premium Plans" />
      <ScrollView style={styles.container}>
        {products.map((product) => (
          <SubscriptionCard
            key={product.productId}
            product={{
              id: product.productId,
              displayName: product.title || '',
              displayPrice: product.localizedPrice || ''
            }}
            onSubscribe={() => handleSubscribe({
              id: product.productId,
              displayName: product.title || '',
              displayPrice: product.localizedPrice || ''
            })}
          />
        ))}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton} onPress={handleRestorePurchases}>
            <Icon name="refresh-circle" size={24} color="#4A4A4A" />
            <Text style={styles.footerButtonText}>Restore Purchases</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.footerButton} onPress={handleManageSubscriptions}>
            <Icon name="settings" size={24} color="#4A4A4A" />
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
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 24,
  },
  planName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  period: {
    fontSize: 16,
    color: '#6B7280',
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    marginRight: 12,
    width: 24,
  },
  featureText: {
    fontSize: 16,
    color: '#4A4A4A',
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: '#2F2F2F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
  },
  footerButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#4A4A4A',
    fontWeight: '500',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  link: {
    fontSize: 14,
    color: '#6B7280',
  },
  dot: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});
