import { Platform } from 'react-native';
import { makeAutoObservable, runInAction, observable } from 'mobx';
import { getCurrentUser } from '@aws-amplify/auth';
import * as RNIap from 'react-native-iap';

export class PurchaseManager {
  @observable.shallow products: RNIap.Subscription[] = [];
  @observable purchasedSubscriptions: string[] = [];

  // Mark as readonly so MobX does not try to make it observable.
  private readonly subscriptionIds = Platform.select({
    ios: ['00', '01'], // Replace these with your actual product IDs
    android: [],
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
    this.setupIAPListeners();
  }

  private setupIAPListeners() {
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

  async initialize() {
    try {
      if (Platform.OS === 'ios') {
        await RNIap.clearTransactionIOS();
      }
      
      await RNIap.initConnection();
      
      const products = await RNIap.getSubscriptions({ skus: [...this.subscriptionIds] });
      
      const newProducts = Array.isArray(products) ? [...products] : [];
      runInAction(() => {
        this.products = newProducts;
      });
      
    } catch (error) {
      console.error('IAP initialization error:', error);
    }
  }

  async fetchProducts() {
    try {
      // Again, pass a plain copy
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
    try {
      // Pass the productId as a string per the new API
      await RNIap.requestSubscription({ sku: productId });
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  }

  async restorePurchases() {
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
