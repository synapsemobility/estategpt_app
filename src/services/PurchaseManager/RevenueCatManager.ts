import { Platform } from 'react-native';
import { makeAutoObservable, runInAction, observable, action } from 'mobx';
import { getCurrentUser } from '@aws-amplify/auth';
import Purchases, { 
  PurchasesPackage, 
  CustomerInfo, 
  PurchasesOffering,
  PurchasesError
} from 'react-native-purchases';

export class RevenueCatManager {
  @observable.shallow offerings: PurchasesOffering[] = [];
  @observable customerInfo: CustomerInfo | null = null;
  @observable isInitialized: boolean = false;
  @observable isLoading: boolean = false;
  @observable hasActiveSubscription: boolean = false;
  @observable currentPlan: string | null = null;

  // Your RevenueCat API keys
  private readonly apiKeys = {
    ios: 'appl_escPTpfXWEiAtLhIQHxjLFitQOk',  // Replace with your actual RevenueCat API key for iOS
    android: 'goog_EVikiaKMaQDTDaiNmhfDRLCHfmH'  // Replace with your actual RevenueCat API key for Android
  };

  // Mapping RevenueCat products to your app's product references
  productReferenceNames: { [key: string]: string } = {
    '00': 'Homeowner Plan',  // Keep your existing product IDs
    '01': 'Pro Plan'  
  };

  // Add additional identifiers field to help with mapping
  private readonly playStoreIdentifiers = {
    '00': 'com.estategpt.app.homeowner_monthly', // Add the exact Google Play product ID here
    '01': 'com.estategpt.app.pro_monthly'        // Add the exact Google Play product ID here
  };

  private static baseURL = 'https://chat.estategpt.io/api/users';

  constructor() {
    makeAutoObservable(this, {
      offerings: observable.shallow,
      customerInfo: observable.ref,
    });
  }

  @action
  async initialize() {
    try {
      this.isLoading = true;
      
      console.log('Initializing RevenueCat with platform:', Platform.OS);
      
      // Configure RevenueCat with your API key
      const apiKey = Platform.select({
        ios: this.apiKeys.ios,
        android: this.apiKeys.android
      });
      
      if (!apiKey) {
        throw new Error('No API key for this platform');
      }

      console.log('Using RevenueCat API key:', apiKey);
      
      // Initialize RevenueCat SDK with debugging enabled
      Purchases.setLogLevel(Purchases.LOG_LEVEL.VERBOSE);
      
      // Add observer mode based on platform
      const observerMode = Platform.OS === 'android' ? false : false;
      console.log('Observer mode:', observerMode);
      
      Purchases.configure({
        apiKey,
        appUserID: null, // Let RevenueCat generate an ID for now
        observerMode: observerMode, // Set to true if you want to use another payment system
        useAmazon: false
      });

      // Log configuration complete
      console.log('RevenueCat configuration complete');
      this.isInitialized = true;
      
      // Get initial customer info and debug it
      const customerInfo = await Purchases.getCustomerInfo();
      console.log('Initial customer info:', JSON.stringify({
        originalAppUserId: customerInfo.originalAppUserId,
        entitlements: customerInfo.entitlements,
        activeSubscriptions: customerInfo.activeSubscriptions,
        allPurchasedProductIdentifiers: customerInfo.allPurchasedProductIdentifiers
      }, null, 2));
      
      // Continue with setup
      await this.setupPurchases();
      
    } catch (error) {
      console.error('RevenueCat initialization error:', error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  @action
  async setupPurchases() {
    try {
      // Get customer info
      const customerInfo = await Purchases.getCustomerInfo();
      this.updateCustomerInfo(customerInfo);
      
      // Get available offerings
      const offerings = await Purchases.getOfferings();
      
      console.log('RevenueCat offerings:', JSON.stringify(offerings, null, 2));
      
      if (offerings.current && offerings.current.availablePackages.length > 0) {
        // Log available packages to help with debugging
        console.log('Available packages:');
        offerings.current.availablePackages.forEach(pkg => {
          console.log(`- ${pkg.identifier} (${pkg.product.identifier}): ${pkg.product.title} - ${pkg.product.priceString}`);
        });
        
        runInAction(() => {
          this.offerings = [offerings.current];
        });
      } else {
        console.warn('No offerings available from RevenueCat');
      }
      
      // Identify user if logged in
      await this.identifyUser();
      
    } catch (error) {
      console.error('Error setting up purchases:', error);
      
      // For development, provide mock offerings
      if (__DEV__) {
        runInAction(() => {
          this.offerings = [{
            identifier: 'default',
            serverDescription: 'Default offering',
            availablePackages: [
              {
                identifier: 'homeowner_monthly',
                offeringIdentifier: 'default',
                packageType: 'MONTHLY',
                product: {
                  identifier: 'homeowner_monthly',
                  description: 'Homeowner plan for primary property owners',
                  title: 'Homeowner Plan (Dev)',
                  price: 9.99,
                  priceString: '$9.99',
                  currencyCode: 'USD'
                }
              },
              {
                identifier: 'pro_monthly',
                offeringIdentifier: 'default',
                packageType: 'MONTHLY',
                product: {
                  identifier: 'pro_monthly',
                  description: 'Pro plan for real estate professionals',
                  title: 'Pro Plan (Dev)',
                  price: 19.99,
                  priceString: '$19.99',
                  currencyCode: 'USD'
                }
              }
            ]
          }] as unknown as PurchasesOffering[];
        });
      }
    }
  }

  @action
  updateCustomerInfo(customerInfo: CustomerInfo) {
    this.customerInfo = customerInfo;
    
    // Check if user has active subscription
    const allEntitlements = customerInfo?.entitlements?.active || {};
    this.hasActiveSubscription = Object.keys(allEntitlements).length > 0;
    
    // Determine current plan
    if (this.hasActiveSubscription) {
      // Find the highest tier entitlement (assuming 'pro' > 'basic')
      if (allEntitlements['pro_access']) {
        this.currentPlan = 'Pro Plan';
      } else if (allEntitlements['basic_access']) {
        this.currentPlan = 'Homeowner Plan';
      }
    } else {
      this.currentPlan = null;
    }
  }

  async identifyUser() {
    try {
      // Get the current authenticated user from Amplify
      const user = await getCurrentUser();
      
      if (user?.userId) {
        // Set the RevenueCat user ID to the Cognito user ID for tracking
        await Purchases.setAttributes({
          email: user.signInDetails?.loginId || '',
        });
        
        // Login with the user ID
        const customerInfo = await Purchases.logIn(user.userId);
        runInAction(() => {
          this.updateCustomerInfo(customerInfo);
        });
      }
    } catch (error) {
      console.error('Error identifying user:', error);
    }
  }

  // Update the purchase method to handle both package and product identifiers

  async purchase(productOrPackageId: string) {
    try {
      this.isLoading = true;
      
      // Find the package in our offerings
      let packageToPurchase: PurchasesPackage | null = null;
      
      for (const offering of this.offerings) {
        // Try to find by package identifier first
        let foundPackage = offering.availablePackages.find(p => p.identifier === productOrPackageId);
        
        // If not found, try to find by product identifier
        if (!foundPackage) {
          foundPackage = offering.availablePackages.find(p => p.product.identifier === productOrPackageId);
        }
        
        if (foundPackage) {
          packageToPurchase = foundPackage;
          break;
        }
      }
      
      if (!packageToPurchase) {
        throw new Error(`Package not found: ${productOrPackageId}`);
      }
      
      // Make the purchase
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      // Update customer info
      runInAction(() => {
        this.updateCustomerInfo(customerInfo);
      });
      
      // Report to backend using the actual product identifier
      await this.sendSubscriptionToBackend(
        packageToPurchase.product.identifier,
        customerInfo.originalAppUserId
      );
      
      return customerInfo;
    } catch (error) {
      // Handle user cancellation vs. actual errors
      if ((error as PurchasesError)?.userCancelled) {
        console.log('User cancelled the purchase');
      } else {
        console.error('Purchase error:', error);
        throw error;
      }
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async restorePurchases() {
    try {
      this.isLoading = true;
      const customerInfo = await Purchases.restorePurchases();
      runInAction(() => {
        this.updateCustomerInfo(customerInfo);
      });
      return customerInfo;
    } catch (error) {
      console.error('Restore purchases error:', error);
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async sendSubscriptionToBackend(productId: string, transactionId?: string) {
    try {
      const user = await getCurrentUser();
      const response = await fetch(`${RevenueCatManager.baseURL}/subscription`, {
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

  // Add this method to check access by product ID

  // Check if user has access to a specific product
  hasProductAccess(productIdentifier: string): boolean {
    if (!this.customerInfo) {
      return false;
    }
    
    // Check by active subscriptions
    if (this.customerInfo.activeSubscriptions?.includes(productIdentifier)) {
      return true;
    }
    
    // Check by all purchased products (lifetime purchases)
    if (this.customerInfo.allPurchasedProductIdentifiers?.includes(productIdentifier)) {
      return true;
    }
    
    return false;
  }
}