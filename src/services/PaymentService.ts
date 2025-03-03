import { Auth } from 'aws-amplify';
import { ServerEnvironment } from '../config/server.config';

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface CardInputDetails {
  cardNumber: string;
  expMonth: number;
  expYear: number;
  cvc: string;
  name?: string;
  postalCode?: string;
}

export class PaymentService {
  static async getAuthHeaders() {
    try {
      const session = await Auth.currentSession();
      const token = session.getIdToken().getJwtToken();
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    } catch (error) {
      console.error('Error getting auth headers:', error);
      throw new Error('Authentication required');
    }
  }

  static async createSetupIntent() {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(ServerEnvironment.createSetupIntentEndpoint, {
        method: 'POST',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to create setup intent: ${response.status}`);
      }

      const data = await response.json();
      return data.clientSecret;
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw error;
    }
  }

  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(ServerEnvironment.paymentMethodsEndpoint, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payment methods: ${response.status}`);
      }

      const data = await response.json();
      return data.paymentMethods || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  static async setDefaultPaymentMethod(paymentMethodId: string): Promise<boolean> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(ServerEnvironment.setDefaultPaymentMethodEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ paymentMethodId })
      });

      if (!response.ok) {
        throw new Error(`Failed to set default payment method: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }

  static async removePaymentMethod(paymentMethodId: string): Promise<boolean> {
    const headers = await this.getAuthHeaders();
    
    try {
      const response = await fetch(ServerEnvironment.removePaymentMethodEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ paymentMethodId })
      });

      if (!response.ok) {
        throw new Error(`Failed to remove payment method: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }

  static async addPaymentMethod(cardDetails: CardInputDetails): Promise<PaymentMethod> {
    const headers = await this.getAuthHeaders();
    
    try {
      // This is a simplified version - in real implementation this would
      // go through Stripe.js or Stripe Elements to tokenize the card securely
      const response = await fetch(`${ServerEnvironment.baseURL}/payment/add-payment-method`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          // In a real implementation, we would NOT send full card details directly
          // This is for demonstration purposes only
          card: {
            number: cardDetails.cardNumber,
            exp_month: cardDetails.expMonth,
            exp_year: cardDetails.expYear,
            cvc: cardDetails.cvc,
            name: cardDetails.name,
            address_zip: cardDetails.postalCode
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add payment method: ${errorText}`);
      }

      const data = await response.json();
      return data.paymentMethod;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }
}
