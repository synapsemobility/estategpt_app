import { getCurrentUser } from '@aws-amplify/auth';
import { ServerEnvironment } from '../config/server.config';

interface CardDetails {
  cardNumber: string;
  expMonth: number;
  expYear: number;
  cvc: string;
  name?: string;
  postalCode?: string;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export class PaymentService {
  /**
   * Get the current authenticated user ID
   */
  static async getUserId(): Promise<string> {
    try {
      const user = await getCurrentUser();
      return user.userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      throw new Error('Authentication required');
    }
  }

  /**
   * Get all payment methods for the current user
   */
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const userId = await this.getUserId();
      
      const response = await fetch(ServerEnvironment.payment.getPaymentMethods, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: userId,
        }
      });

      const data = await response.json();

      if (data.status !== 'success') {
        throw new Error(data.message || 'Failed to retrieve payment methods');
      }

      return data.paymentMethods || [];
    } catch (error) {
      console.error('Error in getPaymentMethods:', error);
      throw error;
    }
  }

  /**
   * Add a new payment method
   */
  static async addPaymentMethod(cardDetails: CardDetails): Promise<string> {
    try {
      const userId = await this.getUserId();
      
      // In a real implementation, you would use the Stripe SDK to create a token or payment method
      // This is just a mockup since we're using the Stripe React Native SDK directly in components
      
      const response = await fetch(ServerEnvironment.payment.createSetupIntent, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: userId,
        }
      });

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || 'Failed to add payment method');
      }

      // In reality, we would confirm the setup intent with the Stripe SDK here
      // For this mockup, we'll just return a success placeholder
      return 'pm_success_placeholder';
    } catch (error) {
      console.error('Error in addPaymentMethod:', error);
      throw error;
    }
  }

  /**
   * Set a payment method as default
   */
  static async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      const userId = await this.getUserId();
      
      const response = await fetch(ServerEnvironment.payment.setDefaultMethod, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: userId,
        },
        body: JSON.stringify({
          paymentMethodId
        })
      });

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || 'Failed to set default payment method');
      }
    } catch (error) {
      console.error('Error in setDefaultPaymentMethod:', error);
      throw error;
    }
  }

  /**
   * Delete a payment method
   */
  static async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      const userId = await this.getUserId();
      
      const response = await fetch(ServerEnvironment.payment.deleteMethod, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: userId,
        },
        body: JSON.stringify({
          paymentMethodId
        })
      });

      const data = await response.json();
      
      if (data.status !== 'success') {
        throw new Error(data.message || 'Failed to delete payment method');
      }
    } catch (error) {
      console.error('Error in deletePaymentMethod:', error);
      throw error;
    }
  }
}
