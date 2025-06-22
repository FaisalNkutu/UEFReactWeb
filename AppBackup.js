import React from 'react';
import { View, Text } from 'react-native';
import LoginScreen from './screens/LoginScreen';

export default function App() {
  console.log("✅ App.js is rendering LoginScreen");

  const fakeLoginHandler = (user) => {
    console.log("🎉 Logged in as:", user);
  };

  const fakeNavigation = {
    navigate: (screen, params) => {
      console.log(`➡️ Navigating to ${screen} with`, params);
    },
  };

  return (
    <View style={{ flex: 1 }}>
      <LoginScreen navigation={fakeNavigation} onLogin={fakeLoginHandler} />
    </View>
  );
}