import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Platform,
  NativeModules,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ReactNativeDeviceActivity from 'react-native-device-activity';
const BASE_URL = 'http://192.168.2.12:8087';
// 🟩 Combined DeviceActivityPicker + ScreenTimeTracker Logic
let lastScreen = null;
let lastTime = null;

const ScreenTracker = ({ navigation, state, userId }) => {
  const [activitySelection, setActivitySelection] = useState(null);

  useEffect(() => {
    // 📲 Request permission to monitor device activity
    ReactNativeDeviceActivity.requestAuthorization();

    // ⏱ Track screen time if state and user ID are provided
    if (state && userId) {
      trackScreenTime(state, userId);
    }
  }, [state]);

  const trackScreenTime = async (state, userId) => {
    const currentRoute = state.routes[state.index];
    const screenName = currentRoute.name;
    const now = Date.now();

    if (lastScreen && lastTime && userId) {
      const duration = Math.round((now - lastTime) / 1000);
      const timestamp = new Date().toISOString();
      const logEntry = { screen: lastScreen, duration, timestamp };
      const key = `screenLogs_${userId}`;

      try {
        const logs = JSON.parse(await AsyncStorage.getItem(key) || '[]');
        logs.push(logEntry);
        await AsyncStorage.setItem(key, JSON.stringify(logs));
      } catch (e) {
        console.warn("AsyncStorage failed:", e);
      }

      try {
        await fetch(`${BASE_URL}/api/screen-logs/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logEntry),
        });
      } catch (e) {
        console.warn("Backend logging failed:", e);
      }
    }

    if (Platform.OS === 'android' && NativeModules.UsageStatsModule) {
      try {
        const usage = await NativeModules.UsageStatsModule.getUsageStats();
        console.log('📱 Android All App Usage:', usage);
      } catch (e) {
        console.warn("Android usage stats not accessible", e);
      }
    }

    lastScreen = screenName;
    lastTime = now;
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 16, marginBottom: 12 }}>Select Apps to Monitor:</Text>
      <ReactNativeDeviceActivity.DeviceActivitySelectionView
        onSelectionChange={(event) => {
          setActivitySelection(event.nativeEvent.familyActivitySelection);
        }}
        familyActivitySelection={activitySelection}
      />
    </View>
  );
};

export default ScreenTracker;
