export const ServerEnvironment = {
  baseURL: 'https://chat.estategpt.io',
  chatEndpoint: 'https://chat.estategpt.io/chat',
  clearHistoryEndpoint: 'https://chat.estategpt.io/clear-history',
  findProEndpoint: 'https://chat.estategpt.io/find-pro',
  scheduleProEndpoint: 'https://chat.estategpt.io/schedule-pro',
  readScheduledMeetingsEndpoint: 'https://chat.estategpt.io/read-scheduled-meetings',
  updateFcmTokenEndpoint: 'https://chat.estategpt.io/update-fcm-token',
  getVideoToken: 'https://chat.estategpt.io/video/token',
  readPendingMeetingsEndpoint: 'https://chat.estategpt.io/video/read-pending-meetings',
  handleMeetingRequestEndpoint: 'https://chat.estategpt.io/video/handle-meeting-request',
  
  // New endpoint for checking professional status
  checkProStatusEndpoint: 'https://chat.estategpt.io/user/check-pro-status',
  
  // New endpoint for becoming a pro
  becomeProEndpoint: 'https://chat.estategpt.io/user/become-pro',
  
  // New endpoint for getting professional profile
  getProProfileEndpoint: 'https://chat.estategpt.io/user/get-pro-profile',
  
  // Add contact founder endpoint
  contactFounderEndpoint: 'https://chat.estategpt.io/api/contact-founder',
  
  // Payment related endpoints - corrected URLs to match backend paths
  payment: {
    baseURL: 'https://chat.estategpt.io/payment', // Removed /api prefix
    createSetupIntent: 'https://chat.estategpt.io/payment/create-setup-intent',
    getPaymentMethods: 'https://chat.estategpt.io/payment/methods', // Removed /api prefix
    setDefaultMethod: 'https://chat.estategpt.io/payment/set-default-method',
    deleteMethod: 'https://chat.estategpt.io/payment/delete-method',
    addCardToken: 'https://chat.estategpt.io/payment/add-card-token',
    attachMethod: 'https://chat.estategpt.io/payment/attach-method'
  },
  
  // User related endpoints
  users: {
    baseURL: 'https://chat.estategpt.io/api/users' // This one likely works as is
  },
  
  // Other API configurations grouped by domain
  professionals: {
    baseURL: 'https://chat.estategpt.io/api/professionals'
  },
  
  // Add onboarding endpoint
  onboarding: {
    baseURL: 'https://chat.estategpt.io/user',
    saveUserProfile: 'https://chat.estategpt.io/user/onboarding'
  }
};

// Helper functions to easily access configuration values
export const getApiUrl = () => ServerEnvironment.baseURL;
export const getPaymentApiUrl = () => ServerEnvironment.payment.baseURL;
export const getContactFounderUrl = () => ServerEnvironment.contactFounderEndpoint;
export const getOnboardingApiUrl = () => ServerEnvironment.onboarding.baseURL;