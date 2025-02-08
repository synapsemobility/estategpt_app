import { MenuItem } from '../../types/menu.types';

export const menuItems: MenuItem[] = [
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