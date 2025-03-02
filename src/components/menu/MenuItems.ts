import { MenuItem } from '../../types/menu.types';

// Define base menu items
const baseMenuItems: MenuItem[] = [
  { 
    title: 'Call a Pro', 
    icon: 'call', 
    route: 'CallPro',
    color: '#34C759' // iOS phone call green color
  },
  { 
    title: 'Scheduled Calls', 
    icon: 'calendar', 
    route: 'ScheduledCalls',
    color: '#4169E1' // Blue color for consistency
  },
  { title: 'About Us', icon: 'information-circle', route: 'AboutUs' },
  { title: 'Submit Feedback', icon: 'chatbubble', route: 'Feedback' },
  { title: 'Subscriptions', icon: 'star', route: 'Subscription' },
  { title: 'My Account', icon: 'person', route: 'User' },
  { title: 'Delete Account', icon: 'trash', route: 'DeleteAccount' },
  { 
    title: 'Sign Out', 
    icon: 'log-out', 
    route: 'SignOut',
    color: '#FF4444' 
  }
];

// Export function to get dynamic menu items based on pro status
export const getMenuItems = (isProfessional: boolean): MenuItem[] => {
  // Clone the base menu items
  const items = [...baseMenuItems];
  
  // Insert pro-specific or become-pro item at index 2 (after Scheduled Calls)
  if (isProfessional) {
    // Insert Professional items
    items.splice(2, 0, 
      { 
        title: 'Professional Profile', 
        icon: 'briefcase', 
        route: 'ProProfile',
        color: '#007AFF' // Blue color
      },
      {
        title: 'Pending Calls', 
        icon: 'time', 
        route: 'PendingCalls',
        color: '#FF9500' // Orange color
      }
    );
  } else {
    // Insert "Become a Pro" item
    items.splice(2, 0, {
      title: 'Become a Pro',
      icon: 'business',
      route: 'BecomePro',
      color: '#5856D6' // Purple color
    });
  }
  
  return items;
};