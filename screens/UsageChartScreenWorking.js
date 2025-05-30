import React, { useEffect, useState } from 'react';
import { View, Dimensions, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart } from 'react-native-chart-kit';

export default function UsageChartScreen() {
  const [chartData, setChartData] = useState({ labels: [], datasets: [{ data: [] }] });

  useEffect(() => {
    const loadAndPrepareData = async () => {
      const logs = JSON.parse(await AsyncStorage.getItem('screenLogs') || '[]');
      const summary = {};

      for (const log of logs) {
        summary[log.screen] = (summary[log.screen] || 0) + log.duration;
      }

      const labels = Object.keys(summary);
      const data = labels.map(screen => summary[screen]);

      setChartData({
        labels,
        datasets: [{ data }]
      });
    };

    loadAndPrepareData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📊 Screen Usage Chart</Text>

      {chartData.labels.length > 0 ? (
        <BarChart
          data={chartData}
          width={Dimensions.get('window').width - 20}
          height={280}
          yAxisLabel=""
          yAxisSuffix="s"
          fromZero
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#f5f5f5',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 107, 174, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 12 },
            propsForDots: { r: '6', strokeWidth: '2', stroke: '#006bae' }
          }}
          style={styles.chart}
        />
      ) : (
        <Text style={styles.message}>No screen usage data found.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20
  },
  chart: {
    borderRadius: 16
  },
  message: {
    marginTop: 50,
    fontSize: 16,
    color: '#999'
  }
});
