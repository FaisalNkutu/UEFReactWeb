import React from 'react';
import { View, Dimensions, ScrollView } from 'react-native';
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
  const data = Object.values(screenTimes);

  return (
    <ScrollView>
      <View>
        <BarChart
          data={{
            labels: labels,
            datasets: [{ data }]
          }}
          width={Dimensions.get('window').width - 16}
          height={250}
          fromZero
          yAxisLabel=""
          chartConfig={{
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            color: (opacity = 1) => `rgba(0, 107, 174, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            barPercentage: 0.5
          }}
          style={{ marginVertical: 20, borderRadius: 8 }}
        />
      </View>
    </ScrollView>
  );
};

export default UsageChartScreen;
