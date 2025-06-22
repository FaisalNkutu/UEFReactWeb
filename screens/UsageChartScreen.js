import React from 'react';
import { View, Dimensions, ScrollView, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const screenTimes = {
  Dashboard: 120,
  SurveyDashboard: 90,
  CreateSurvey: 150,
  ViewResponses: 60,
  UsageChart: 30
};

const UsageChartScreen = () => {
  const labels = Object.keys(screenTimes);
  const data = Object.values(screenTimes).map(seconds => seconds / 60); // convert to minutes

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.chartWrapper}>
        <BarChart
          data={{
            labels: labels,
            datasets: [{ data }]
          }}
          width={Dimensions.get('window').width - 32}
          height={250}
          fromZero
          yAxisSuffix=" min"
          chartConfig={{
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            color: (opacity = 1) => `rgba(0, 107, 174, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            barPercentage: 0.5,
            propsForLabels: {
              fontSize: 12
            }
          }}
          style={{
            marginVertical: 16,
            borderRadius: 8,
            alignSelf: 'center'
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9f9f9'
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default UsageChartScreen;
