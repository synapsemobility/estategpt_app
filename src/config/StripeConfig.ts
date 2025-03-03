/**
 * Configuration for the Stripe payment integration
 */
export const StripeConfig = {
  /**
   * Whether to use the Stripe test environment
   */
  testMode: false, // Production mode
  
  /**
   * The URL scheme to use for returning to the app from the Stripe payment flow
   */
  returnUrlScheme: 'estategpt',
  
  /**
   * The merchant display name to show in the Stripe payment sheet
   */
  merchantDisplayName: 'EstateGPT',
  
  /**
   * Timeout for Stripe operations in milliseconds
   */
  operationTimeout: 30000,

  /**
   * Publishable key for Stripe
   */
  publishableKey: 'pk_live_51QyKTkP4LXMAMqdlDyIhOYk8emVe9F5xn8ANmoCZ8RLn4gaWf5JThAf1gHZrns7w8IM2GylvZFxEjByKmYJw6fGk00e6CyEa1h', // Production key
};
