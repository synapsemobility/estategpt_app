import { createContext, useContext } from 'react';
import { PurchaseManager } from './PurchaseManager';

const PurchaseManagerContext = createContext<PurchaseManager | null>(null);

export const usePurchaseManager = () => {
  const context = useContext(PurchaseManagerContext);
  if (!context) throw new Error('usePurchaseManager must be used within a PurchaseManagerProvider');
  return context;
};

export { PurchaseManager, PurchaseManagerContext }; 