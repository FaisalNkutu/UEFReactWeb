import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Button, Share, Alert } from 'react-native';
import {
  aggregateScreenTime,
  exportLogsAsCSV,
  exportLogsAsJson
} from '../utils/screenLogUtils';
const BASE_URL = 'http://192.168.2.12:8087';
export default function ScreenUsageDashboard({ route, navigation, onLogout }) {
  const userId = route.params?.userId;
  const [logs, setLogs] = useState([]);
  const [totals, setTotals] = useState({});

  useEffect(() => {
    if (userId) {
      fetch(`${BASE_URL}/api/screen-logs/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (!Array.isArray(data)) {
            Alert.alert('Error', 'Backend returned invalid log format');
            return;
          }
          setLogs(data);
          setTotals(aggregateScreenTime(data));
        })
        .catch(err => {
          console.error(err);
          Alert.alert('Error', 'Failed to fetch logs from backend');
        });
    }
  }, [userId]);

  const shareCSV = async () => {
    try {
      const csvData = exportLogsAsCSV(logs);
      await Share.share({ message: csvData });
    } catch (err) {
      Alert.alert('Error', 'Failed to share CSV data.');
    }
  };

  const shareJSON = async () => {
    try {
      const jsonData = exportLogsAsJson(logs);
      await Share.share({ message: jsonData });
    } catch (err) {
      Alert.alert('Error', 'Failed to share JSON data.');
    }
  };

  const handleLogout = () => {
    console.log("🚪 Logout button clicked");
    if (typeof onLogout === 'function') {
      console.log("✅ onLogout function exists — calling onLogout()");
      onLogout(); // Let App.js handle user reset and navigation
    } else {
      console.warn("❌ onLogout was not passed into ScreenUsageDashboard.");
      Alert.alert("Error", "Logout handler not available.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Screen Usage for User ID: {userId}</Text>

      <Text style={styles.subTitle}>⏱️ Total Time Per Screen (mins)</Text>
      {Object.entries(totals).map(([screen, totalSecs], idx) => (
        <View key={idx} style={styles.totalItem}>
          <Text>{screen}: {(totalSecs / 60).toFixed(2)} mins</Text>
        </View>
      ))}

      <Text style={styles.subTitle}>📋 Detailed Logs</Text>
      {logs.map((log, index) => (
        <View key={index} style={styles.logItem}>
          <Text>Screen: {log.screen}</Text>
          <Text>Duration: {log.duration}s</Text>
          <Text>Time: {new Date(log.timestamp).toLocaleString()}</Text>
        </View>
      ))}

      <View style={styles.buttonRow}>
        <Button title="📤 Export as CSV" onPress={shareCSV} color="#007AFF" />
        <Button title="📤 Export as JSON" onPress={shareJSON} color="#34C759" />
      </View>

      <View style={styles.logoutWrapper}>
        <Button title="🚪 Logout" color="#006bae" onPress={handleLogout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  subTitle: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  logItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 6
  },
  totalItem: {
    padding: 6,
    borderBottomWidth: 1,
    borderColor: '#ccc'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20
  },
  logoutWrapper: {
    marginTop: 30,
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 10
  }
});
