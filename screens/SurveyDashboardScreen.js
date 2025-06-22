
// ✅ Full Updated SurveyDashboardScreen.js with toggles for Responses and Sentiment

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Button,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
  Platform
} from 'react-native';
import { Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const BASE_URL = 'http://192.168.2.12:8087';

export default function SurveyDashboardScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const user = route.params?.user || {};
  const role = user.role?.toLowerCase() || '';
  const loggedInUserId = user.id;

  const [userList, setUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(role === 'student' ? loggedInUserId : null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [responses, setResponses] = useState([]);
  const [sentiment, setSentiment] = useState([]);
  const [chartType, setChartType] = useState('bar');
  const [totals, setTotals] = useState({ pos: 0, neu: 0, neg: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'asc' });
  const [showResponses, setShowResponses] = useState(true);
  const [showSentiment, setShowSentiment] = useState(true);
  const chartRef = useRef();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = role === 'student'
          ? await fetch(`${BASE_URL}/api/feedback/users/${loggedInUserId}`)
          : await fetch(`${BASE_URL}/api/feedback/users`);
        const data = await res.json();
        setUserList(role === 'student' ? [data] : data);
        if (role === 'student') setSelectedUser(data.id);
      } catch {
        Alert.alert('Error', 'Unable to fetch users');
      }
    };
    fetchUsers();
  }, []);

  const handleStartDate = (event, selectedDate) => {
    if (event.type === 'set' && selectedDate) {
      setStartDate(selectedDate.toISOString().split('T')[0]);
    }
    setShowStartPicker(false);
  };

  const handleEndDate = (event, selectedDate) => {
    if (event.type === 'set' && selectedDate) {
      setEndDate(selectedDate.toISOString().split('T')[0]);
    }
    setShowEndPicker(false);
  };

  const fetchResponses = async () => {
    if (!selectedUser) return Alert.alert('Select a user');
    try {
      const res = await fetch(`${BASE_URL}/api/feedback/responses/${selectedUser}?start=${startDate}&end=${endDate}`);
      const data = await res.json();
      setResponses([...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
    } catch {
      Alert.alert('Error', 'Unable to fetch responses');
    }
  };

  const fetchSentiment = async () => {
    if (!selectedUser) return Alert.alert('Select a user');
    try {
      const res = await fetch(`${BASE_URL}/api/sentiment/${selectedUser}?start=${startDate}&end=${endDate}`);
      const data = await res.json();
      let totalPos = 0, totalNeu = 0, totalNeg = 0;
      data.forEach(row => {
        totalPos += row.sentimentCounts.positive || 0;
        totalNeu += row.sentimentCounts.neutral || 0;
        totalNeg += row.sentimentCounts.negative || 0;
      });
      setSentiment(data);
      setTotals({ pos: totalPos, neu: totalNeu, neg: totalNeg });
    } catch {
      Alert.alert('Error', 'Unable to fetch sentiment');
    }
  };

  const fetchDrilldown = async (questionId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/question-details/${selectedUser}/${questionId}`);
      const result = await res.json();
      const answers = result.answers || [];
      const questionText = result.questionText || `Question ${questionId}`;
      const formatted = answers.map(a => {
        const time = a.timestamp ? new Date(a.timestamp).toLocaleString() : '(no time)';
        const emoji = a.sentiment === 'positive' ? '😊' : a.sentiment === 'neutral' ? '😐' : a.sentiment === 'negative' ? '😞' : '';
        return `• ${emoji} ${a.answer || '(no answer)'}\n${time}`;
      }).join('\n\n');
      setModalContent(`${questionText} (Q${questionId})\n\n${formatted}`);
      setModalVisible(true);
    } catch {
      Alert.alert('Failed to load question details.');
    }
  };

  const sortResponses = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
    const sorted = [...responses].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setResponses(sorted);
  };

  const renderResponses = () => (
    <View style={{ marginTop: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>📄 Responses</Text>
      <View style={styles.tableHeader}>
        <TouchableOpacity onPress={() => sortResponses('questionId')} style={styles.tableCell}><Text>QID</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => sortResponses('answer')} style={styles.tableCell}><Text>Answer</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => sortResponses('timestamp')} style={styles.tableCell}><Text>Time</Text></TouchableOpacity>
      </View>
      {responses.map((item, idx) => (
        <TouchableOpacity key={idx} style={styles.tableRow} onPress={() => fetchDrilldown(item.questionId)}>
          <Text style={styles.tableCell}>Q{item.questionId}</Text>
          <Text style={styles.tableCell}>{item.answer || 'No answer'}</Text>
          <Text style={styles.tableCell}>{item.timestamp}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderChart = () => {
    const labels = sentiment.map(s => `Q${s.questionId}`);
    const pos = sentiment.map(s => s.sentimentCounts.positive || 0);
    const neu = sentiment.map(s => s.sentimentCounts.neutral || 0);
    const neg = sentiment.map(s => s.sentimentCounts.negative || 0);

    const chartConfig = {
      backgroundColor: '#fff',
      backgroundGradientFrom: '#fff',
      backgroundGradientTo: '#fff',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
    };

    const renderWrapped = (Comp, props) => (
      <ViewShot ref={chartRef} options={{ format: 'png', quality: 0.9 }}>
        <View style={{ backgroundColor: '#fff', padding: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
            <View style={styles.legendItem}><View style={[styles.colorBox, { backgroundColor: 'green' }]} /><Text style={styles.legendText}>😊 Positive</Text></View>
            <View style={styles.legendItem}><View style={[styles.colorBox, { backgroundColor: 'gray' }]} /><Text style={styles.legendText}>😐 Neutral</Text></View>
            <View style={styles.legendItem}><View style={[styles.colorBox, { backgroundColor: 'red' }]} /><Text style={styles.legendText}>😞 Negative</Text></View>
          </View>
          <Comp {...props} onDataPointClick={({ index }) => {
            const questionId = sentiment[index]?.questionId;
            if (questionId) fetchDrilldown(questionId);
          }} />
        </View>
      </ViewShot>
    );

    if (chartType === 'bar') {
      return renderWrapped(BarChart, {
        data: { labels, datasets: [
          { data: pos, color: () => 'green' },
          { data: neu, color: () => 'gray' },
          { data: neg, color: () => 'red' }
        ] },
        width: screenWidth - 30,
        height: 220,
        chartConfig,
        verticalLabelRotation: 30
      });
    } else if (chartType === 'pie') {
      return renderWrapped(PieChart, {
        data: [
          { name: '😊 Positive', population: totals.pos, color: 'green', legendFontColor: '#000', legendFontSize: 12 },
          { name: '😐 Neutral', population: totals.neu, color: 'gray', legendFontColor: '#000', legendFontSize: 12 },
          { name: '😞 Negative', population: totals.neg, color: 'red', legendFontColor: '#000', legendFontSize: 12 }
        ],
        width: screenWidth - 30,
        height: 220,
        chartConfig,
        accessor: 'population',
        backgroundColor: 'transparent',
        paddingLeft: '15'
      });
    } else if (chartType === 'line') {
      return renderWrapped(LineChart, {
        data: {
          labels,
          datasets: [
            { data: pos, color: () => 'green' },
            { data: neu, color: () => 'gray' },
            { data: neg, color: () => 'red' }
          ]
        },
        width: screenWidth - 30,
        height: 220,
        chartConfig
      });
    }
    return null;
  };

  return (
    <ScrollView style={{ padding: 10 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>📊 Survey Dashboard</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
        <TouchableOpacity onPress={() => setShowResponses(!showResponses)} style={styles.checkboxContainer}>
          <Text style={styles.checkbox}>{showResponses ? '☑' : '☐'}</Text>
          <Text> Show Responses</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowSentiment(!showSentiment)} style={styles.checkboxContainer}>
          <Text style={styles.checkbox}>{showSentiment ? '☑' : '☐'}</Text>
          <Text> Show Sentiment</Text>
        </TouchableOpacity>
      </View>


      {role !== 'student' && (
        <Picker selectedValue={selectedUser} onValueChange={setSelectedUser} style={styles.input}>
          <Picker.Item label="Select User" value={null} />
          {userList.map(u => (
            <Picker.Item key={u.id} label={u.username} value={u.id} />
          ))}
        </Picker>
      )}

      <TouchableOpacity onPress={() => setShowStartPicker(true)}>
        <TextInput
          placeholder="📅 Start Date (YYYY-MM-DD)"
          value={startDate}
          editable={false}
          style={styles.input}
        />
      </TouchableOpacity>
      {showStartPicker && (
        <DateTimePicker
          value={startDate ? new Date(startDate) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleStartDate}
        />
      )}

      <TouchableOpacity onPress={() => setShowEndPicker(true)}>
        <TextInput
          placeholder="📅 End Date (YYYY-MM-DD)"
          value={endDate}
          editable={false}
          style={styles.input}
        />
      </TouchableOpacity>
      {showEndPicker && (
        <DateTimePicker
          value={endDate ? new Date(endDate) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleEndDate}
        />
      )}

{role !== 'student' && (
  <>
    <View style={{ marginTop: 10 }} />
    <Button
      title="📊 View Usage Chart (All Users)"
      color="#28a745"
      onPress={() => navigation.navigate('UsageChart')}
    />
    <View style={{ marginTop: 10 }} />
    <Button
      title="📊 View Usage Chart (Selected User)"
      color="#1e90ff"
      onPress={() => {
        if (selectedUser) {
          navigation.navigate('ScreenUsageDashboard', { userId: selectedUser });
        } else {
          Alert.alert("Select User", "Please select a user before viewing usage.");
        }
      }}
    />
  </>
)}

      {showResponses && (
        <>
          <Button title="📄 View Responses" onPress={fetchResponses} />
          {renderResponses()}
        </>
      )}

      {showSentiment && (
        <>
          <Button title="💬 Analyze Sentiments" onPress={fetchSentiment} />
          <View style={styles.chartToggle}>
            <Button title="📊 Bar" onPress={() => setChartType('bar')} />
            <Button title="🥧 Pie" onPress={() => setChartType('pie')} />
            <Button title="📈 Line" onPress={() => setChartType('line')} />
          </View>
          {sentiment.length > 0 && renderChart()}
		        <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '90%', maxHeight: '80%' }}>
            <Button title="❌ Close" onPress={() => setModalVisible(false)} color="red" />
            <ScrollView><Text>{modalContent}</Text></ScrollView>
          </View>
        </View>
      </Modal>
	  
        </>
      )}



    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 4,
    marginVertical: 5,
    borderWidth: 1
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 5
  },
  colorBox: {
    width: 16,
    height: 16,
    marginRight: 5,
    borderRadius: 3
  },
  legendText: {
    fontSize: 14
  },
  chartToggle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#ddd',
    padding: 5
  },
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    borderBottomWidth: 1,
    borderColor: '#ccc'
  },
  tableCell: {
    flex: 1,
    textAlign: 'left'
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15
  },
  checkbox: {
    fontSize: 18,
    marginRight: 5
  }
});