import { Ionicons } from '@expo/vector-icons';

export interface MenuItem {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color?: string;
}

export interface MenuViewProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
  userID: string;
}
