import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, Button,
  StyleSheet, Platform, Alert
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // Uncomment if you're using token/session storage
const BASE_URL = 'http://192.168.2.12:8087';
export default function SurveyScreen({ route, navigation, onLogout }) {
  const user = route?.params?.user ?? null;
  const userId = user?.id ?? null;
  const role = user?.role?.toLowerCase() ?? 'unknown';

  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!userId) {
      if (Platform.OS === 'web') {
        window.alert("⚠️ Warning: userId is missing!");
      } else {
        Alert.alert("⚠️ Warning", "userId is missing!");
      }
    }
  }, []);

  useEffect(() => {
    fetch('${BASE_URL}/api/feedback/questions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.content)) {
          setQuestions(data.content);
        } else {
          setError('Invalid format from server');
        }
      })
      .catch(() => {
        setError('Failed to load questions');
      });
  }, []);

  const handleChange = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSubmit = async () => {
    if (!userId) {
      showAlert("Error", "Cannot submit, userId is missing.");
      return;
    }

    const payload = questions.map(q => ({
      questionId: q.id,
      answer: responses[q.id]?.toString().trim() || ""
    })).filter(item => item.answer !== "");

    if (payload.length < questions.length) {
      showAlert("Please answer all questions.", "");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/feedback/submit?userId=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const msg = await res.text();

      if (res.ok) {
        showAlert("✅ Submitted successfully!", msg);
      } else {
        showAlert(`❌ Server error (${res.status})`, msg);
      }
    } catch (err) {
      showAlert("❌ Network error", err.message);
    }
  };

  const handleViewResponses = () => {
    if (!userId) {
      showAlert("Error", "Cannot navigate, userId is missing.");
      return;
    }
    navigation.navigate('SurveyDashboard', { user });
  };

  const currentQuestion = questions[currentIndex];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Survey Question {currentIndex + 1} of {questions.length}</Text>

        <Text style={styles.subText}>👤 Role: {role} | 🆔 ID: {userId ?? 'N/A'}</Text>

        {error !== '' && <Text style={styles.error}>{error}</Text>}

        {currentQuestion && (
          <View key={currentQuestion.id} style={styles.questionBlock}>
            <Text style={styles.label}>{currentQuestion.questiontext}</Text>

            {currentQuestion.questiontype === 'text' && (
              <TextInput
                style={styles.input}
                value={responses[currentQuestion.id] || ''}
                placeholder="Type your answer"
                onChangeText={val => handleChange(currentQuestion.id, val)}
              />
            )}

            {currentQuestion.questiontype === 'multichoice' && (
              <View style={styles.input}>
                <Picker
                  selectedValue={responses[currentQuestion.id] || ''}
                  onValueChange={val => handleChange(currentQuestion.id, val)}
                >
                  <Picker.Item label="Select an option" value="" />
                  {currentQuestion.presentation.split('|').map(opt => (
                    <Picker.Item key={opt} label={opt} value={opt} />
                  ))}
                </Picker>
              </View>
            )}

            {currentQuestion.questiontype === 'numeric' && (() => {
              const options = currentQuestion.presentation.split('|').map(Number).sort((a, b) => a - b);
              const min = options[0];
              const max = options[options.length - 1];
              const step = options.length > 1 ? options[1] - options[0] : 1;
              const currentValue = responses[currentQuestion.id] ? Number(responses[currentQuestion.id]) : min;

              return (
                <View style={styles.sliderBlock}>
                  <Text style={styles.sliderValue}>Selected: {currentValue}</Text>
                  <Slider
                    minimumValue={min}
                    maximumValue={max}
                    step={step}
                    value={currentValue}
                    onValueChange={(val) => handleChange(currentQuestion.id, val.toString())}
                    minimumTrackTintColor="#006bae"
                    maximumTrackTintColor="#ccc"
                    thumbTintColor="#006bae"
                  />
                  <View style={styles.sliderLabels}>
                    <Text>{min}</Text>
                    <Text>{max}</Text>
                  </View>
                </View>
              );
            })()}
          </View>
        )}

        <View style={styles.paginationRow}>
          <View style={styles.halfButton}>
            <Button
              title="Previous"
              onPress={() => setCurrentIndex(i => Math.max(i - 1, 0))}
              disabled={currentIndex === 0}
            />
          </View>
          <View style={styles.halfButton}>
            <Button
              title={currentIndex === questions.length - 1 ? "Submit" : "Next"}
              onPress={() => {
                const currentAnswer = responses[currentQuestion?.id];
                if (!currentAnswer || currentAnswer.toString().trim() === '') {
                  showAlert("Please answer this question before continuing.", "");
                  return;
                }

                if (currentIndex === questions.length - 1) {
                  handleSubmit();
                } else {
                  setCurrentIndex(i => i + 1);
                }
              }}
              disabled={questions.length === 0}
            />
          </View>
        </View>

        <View style={styles.buttonRow}>
          <Button title="View My Responses" onPress={handleViewResponses} color="#444" />
        </View>
      </ScrollView>

<View style={styles.logoutWrapper}>
  <Button
    title="Logout"
    color="#006bae"
    onPress={() => {
      if (onLogout) onLogout(); // ✅ Reset user state in App.js
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    }}
  />
</View>



    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 100, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, color: '#006bae', textAlign: 'center', marginBottom: 10 },
  subText: { fontSize: 14, textAlign: 'center', color: '#666', marginBottom: 15 },
  questionBlock: { marginBottom: 20 },
  label: { fontWeight: 'bold', marginBottom: 5 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 4,
    paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#fff'
  },
  error: { color: 'red', marginBottom: 15, textAlign: 'center' },
  sliderBlock: { marginTop: 10, paddingVertical: 10 },
  sliderValue: { marginBottom: 5, fontWeight: '600', color: '#333' },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5
  },
  buttonRow: {
    marginTop: 30
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  halfButton: {
    flex: 1,
    marginHorizontal: 5
  },
  logoutWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd'
  }
});