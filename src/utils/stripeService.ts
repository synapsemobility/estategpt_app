import { ServerEnvironment } from '../config/server.config';

// API URL from server config
const API_URL = ServerEnvironment.baseURL;

// Default timeout for fetch requests (in milliseconds)
const FETCH_TIMEOUT = 15000;

/**
 * Wrapper around fetch with timeout
 */
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = FETCH_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your internet connection and try again.');
    }
    throw error;
  }
};

/**
 * Helper to format error messages
 */
const formatErrorMessage = (error: any): string => {
  if (error.message) {
    // Network errors
    if (error.message.includes('timed out') || 
        error.message.includes('network') || 
        error.message.includes('kCFErrorDomainCFNetwork')) {
      return 'Network connection error. Please check your internet and try again.';
    }
    
    // Stripe specific errors
    if (error.message.includes('No such payment_method') || 
        error.message.includes('similar object exists')) {
      return 'There was an issue with your payment method. Please try a different card.';
    }
    
    return error.message;
  }
  
  return 'An unknown error occurred';
};

/**
 * Creates a setup intent on your backend server
 */
export const createSetupIntent = async (userId: string) => {
  try {
    console.log('Creating setup intent for user:', userId);

    const response = await fetchWithTimeout(
      `${ServerEnvironment.createSetupIntentEndpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userId
        },
        body: JSON.stringify({})
      },
      20000 // 20 second timeout for setup intent
    );
    
    const data = await response.json();
    console.log('Setup intent response:', data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create setup intent');
    }
    
    if (data.status === 'error') {
      throw new Error(data.message);
    }
    
    // Return client secret, ephemeral key, and customer ID
    return {
      clientSecret: data.clientSecret,
      ephemeralKey: data.ephemeralKey,
      customerId: data.customerId
    };
  } catch (error) {
    console.error('Error creating setup intent:', error);
    throw new Error(formatErrorMessage(error));
  }
};

/**
 * Attach a payment method to a customer
 */
export const attachPaymentMethod = async (paymentMethodId: string, userId: string) => {
  try {
    console.log(`Attaching payment method ${paymentMethodId} for user ${userId}`);

    const response = await fetchWithTimeout(
      `${ServerEnvironment.baseURL}/payment/attach-method`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userId
        },
        body: JSON.stringify({
          paymentMethodId
        })
      }
    );
    
    const data = await response.json();
    console.log('Attach payment method response:', data);
    
    if (!response.ok) {
      throw new Error((data && data.message) || 'Failed to attach payment method');
    }
    
    if (data && data.status === 'error') {
      throw new Error(data.message);
    }
    
    return { success: true, paymentMethodId };
  } catch (error) {
    console.error('Error attaching payment method:', error);
    throw new Error(formatErrorMessage(error));
  }
};

/**
 * Save a payment method to your backend - now including attachment
 * This is a complete flow that attaches the payment method and then sets it as default
 */
export const savePaymentMethod = async (paymentMethodId: string, userId: string) => {
  try {
    console.log(`Saving payment method ${paymentMethodId} for user ${userId}`);
    
    // First, attach the payment method to the customer
    await attachPaymentMethod(paymentMethodId, userId);
    
    // Then set it as the default payment method
    const response = await fetchWithTimeout(
      `${ServerEnvironment.setDefaultPaymentMethodEndpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userId
        },
        body: JSON.stringify({
          paymentMethodId
        })
      }
    );
    
    const data = await response.json();
    console.log('Save payment method response:', data);
    
    if (!response.ok) {
      throw new Error((data && data.message) || 'Failed to save payment method');
    }
    
    if (data && data.status === 'error') {
      throw new Error(data.message);
    }
    
    return { success: true, paymentMethodId };
  } catch (error) {
    console.error('Error saving payment method:', error);
    throw new Error(formatErrorMessage(error));
  }
};

/**
 * Retrieve saved payment methods from your backend
 */
export const fetchPaymentMethods = async (userId: string) => {
  try {
    console.log("Fetching payment methods for user:", userId);

    const response = await fetchWithTimeout(
      `${ServerEnvironment.paymentMethodsEndpoint}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userId
        }
      }
    );
    
    const data = await response.json();
    console.log("Payment methods response:", data);
    
    if (!response.ok) {
      throw new Error((data && data.message) || 'Failed to fetch payment methods');
    }
    
    if (data && data.status === 'error') {
      throw new Error(data.message);
    }
    
    return { 
      paymentMethods: data.paymentMethods || [] 
    };
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return { paymentMethods: [] };
  }
};

/**
 * Remove a payment method from your backend
 */
export const removePaymentMethod = async (paymentMethodId: string, userId: string) => {
  try {
    console.log(`Removing payment method ${paymentMethodId} for user ${userId}`);

    const response = await fetchWithTimeout(
      `${ServerEnvironment.removePaymentMethodEndpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userId
        },
        body: JSON.stringify({
          paymentMethodId
        })
      }
    );
    
    const data = await response.json();
    console.log('Remove payment method response:', data);
    
    if (!response.ok) {
      throw new Error((data && data.message) || 'Failed to remove payment method');
    }
    
    if (data && data.status === 'error') {
      throw new Error(data.message);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error removing payment method:', error);
    throw new Error(formatErrorMessage(error));
  }
};
