import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ChatScreen from './src/screens/ChatScreen';
import AvatarCustomizerScreen from './src/screens/AvatarCustomizerScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {/* Auth akışı */}
        <Stack.Screen name="Login" component={LoginScreen} />
        {/* Onboarding - avatar seçimi */}
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        {/* Ana chat ekranı */}
        <Stack.Screen name="Chat" component={ChatScreen} />
        {/* Avatar özelleştirici */}
        <Stack.Screen name="AvatarCustomizer" component={AvatarCustomizerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}