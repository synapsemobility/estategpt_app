import { Platform } from 'react-native';
import { makeAutoObservable, runInAction, observable } from 'mobx';
import { getCurrentUser } from '@aws-amplify/auth';
import * as RNIap from 'react-native-iap';

export class PurchaseManager {
  @observable.shallow products: RNIap.Subscription[] = [];
  @observable purchasedSubscriptions: string[] = [];
  @observable isAvailable: boolean = false;
  @observable isInitialized: boolean = false;

  // Mark as readonly so MobX does not try to make it observable.
  private readonly subscriptionIds = Platform.select({
    ios: ['00', '01'], // Replace these with your actual product IDs
    android: ['00', '01'], // Add Android product IDs
  }) ?? [];

  productReferenceNames: { [key: string]: string } = {
    '00': 'Homeowner Plan',
    '01': 'Pro Plan'
  };

  private static baseURL = 'https://chat.estategpt.io/api/users';

  // IAP listeners
  private purchaseUpdateSubscription: ReturnType<typeof RNIap.purchaseUpdatedListener> | null = null;
  private purchaseErrorSubscription: ReturnType<typeof RNIap.purchaseErrorListener> | null = null;

  constructor() {
    makeAutoObservable(this, {
      products: observable.shallow,
      purchasedSubscriptions: observable.shallow,
    });
  }

  async initialize() {
    try {
      // Only set up listeners if we successfully initialize
      await this.initializeConnection();
      if (this.isAvailable) {
        this.setupIAPListeners();
        await this.fetchProducts();
        await this.checkSubscriptionStatus();
      }
    } catch (error) {
      console.log('Purchase initialization error (handled):', error);
      runInAction(() => {
        this.isAvailable = false;
      });
    } finally {
      runInAction(() => {
        this.isInitialized = true;
      });
    }
  }

  private async initializeConnection() {
    try {
      if (Platform.OS === 'ios') {
        await RNIap.clearTransactionIOS();
      }
      
      await RNIap.initConnection();
      runInAction(() => {
        this.isAvailable = true;
      });
      console.log('IAP connection initialized successfully');
      
    } catch (error) {
      console.log('IAP not available:', error);
      runInAction(() => {
        this.isAvailable = false;
      });
      
      // If running in a simulator or development environment, provide mock data
      if (__DEV__) {
        console.log('Using mock IAP data for development');
        runInAction(() => {
          this.products = [
            {
              productId: '00',
              title: 'Homeowner Plan (Dev)',
              description: 'Mock subscription for development',
              price: '$9.99',
              currency: 'USD',
              localizedPrice: '$9.99',
            },
            {
              productId: '01',
              title: 'Pro Plan (Dev)',
              description: 'Mock subscription for development',
              price: '$19.99',
              currency: 'USD',
              localizedPrice: '$19.99',
            }
          ] as unknown as RNIap.Subscription[];
        });
      }
    }
  }

  private setupIAPListeners() {
    if (!this.isAvailable) return;
    
    this.purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(async (purchase) => {
      try {
        await RNIap.finishTransaction({ purchase });
        runInAction(() => {
          if (!this.purchasedSubscriptions.includes(purchase.productId)) {
            this.purchasedSubscriptions.push(purchase.productId);
          }
        });
        await this.sendSubscriptionToBackend(
          purchase.productId, 
          purchase.transactionId
        );
      } catch (err) {
        console.error('Error processing purchase:', err);
      }
    });

    this.purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
      console.error('Purchase error:', error);
    });
  }

  async fetchProducts() {
    if (!this.isAvailable) return;
    
    try {
      const products = await RNIap.getSubscriptions({ skus: [...this.subscriptionIds] });
      console.log('Fetched products:', products);
      runInAction(() => {
        this.products = Array.isArray(products) ? [...products] : [];
      });
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  }

  async checkSubscriptionStatus() {
    if (!this.isAvailable) return;
    
    try {
      const purchases = await RNIap.getAvailablePurchases();
      console.log('Available purchases:', purchases);
      runInAction(() => {
        this.purchasedSubscriptions = purchases.map(p => p.productId);
      });
    } catch (error) {
      console.error('Failed to check subscription status:', error);
    }
  }

  async purchase(productId: string) {
    if (!this.isAvailable) {
      console.log('IAP not available - simulating purchase in dev mode');
      if (__DEV__) {
        // Simulate a successful purchase in development mode
        runInAction(() => {
          if (!this.purchasedSubscriptions.includes(productId)) {
            this.purchasedSubscriptions.push(productId);
          }
        });
        await this.sendSubscriptionToBackend(productId, 'dev-transaction-id');
        return;
      }
      throw new Error('In-app purchases are not available');
    }
    
    try {
      await RNIap.requestSubscription({ sku: productId });
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  }

  async restorePurchases() {
    if (!this.isAvailable) return;
    
    try {
      const restored = await RNIap.getAvailablePurchases();
      runInAction(() => {
        this.purchasedSubscriptions = restored.map(p => p.productId);
      });
    } catch (error) {
      console.error('Restore failed:', error);
    }
  }

  async sendSubscriptionToBackend(productId: string, transactionId?: string) {
    try {
      const user = await getCurrentUser();
      const response = await fetch(`${PurchaseManager.baseURL}/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user?.userId ?? '',
        },
        body: JSON.stringify({
          subscription_plan: this.productReferenceNames[productId] || productId,
          transaction_id: transactionId || '',
          timestamp: Date.now(),
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update subscription');
      } else {
        console.log('Subscription update sent successfully.');
      }
    } catch (error) {
      console.error('Failed to send subscription update:', error);
    }
  }

  cleanupListeners() {
    if (!this.isAvailable) return;
    
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
      this.purchaseUpdateSubscription = null;
    }
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
      this.purchaseErrorSubscription = null;
    }
    // Optionally, close the IAP connection:
    RNIap.endConnection();
  }
}
