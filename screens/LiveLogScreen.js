// screens/LiveLogScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getLatestScreenLog } from '../utils/ScreenTimeTracker';

export default function LiveLogScreen() {
  const [log, setLog] = useState(getLatestScreenLog());

  useEffect(() => {
    const interval = setInterval(() => {
      setLog(getLatestScreenLog());
    }, 1000); // update every second

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Last Screen Log</Text>
      <Text style={styles.logText}>{log || 'No screen activity yet.'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, marginBottom: 20, fontWeight: 'bold' },
  logText: { fontSize: 16, color: '#333' },
});
