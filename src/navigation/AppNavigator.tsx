// Import the new screen
import AddPaymentCardScreen from '../screens/payment/AddPaymentCardScreen';

// Add to your Stack Navigator
function AppStack() {
  return (
    <Stack.Navigator
      // ...existing configuration...
    >
      {/* ...existing screens... */}
      <Stack.Screen 
        name="AddPaymentCard" 
        component={AddPaymentCardScreen} 
        options={{ headerShown: false }}
      />
      {/* ...existing screens... */}
    </Stack.Navigator>
  );
}
