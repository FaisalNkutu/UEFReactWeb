import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, Alert,
  StyleSheet, ScrollView, TouchableOpacity
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { CommonActions } from '@react-navigation/native'; // ✅ Needed for logout
const BASE_URL = 'http://192.168.2.12:8087';
export default function CreateSurveyQuestionScreen({ navigation, onLogout }) {
  const [questiontext, setQuestionText] = useState('');
  const [questiontype, setQuestionType] = useState('text');
  const [presentation, setPresentation] = useState('');

  const handleSubmit = async () => {
    if (!questiontext.trim()) {
      Alert.alert('Validation Error', 'Question Text is required');
      return;
    }

    try {
      const res = await fetch('${BASE_URL}/saveQuestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `questiontext=${encodeURIComponent(questiontext)}&questiontype=${encodeURIComponent(questiontype)}&presentation=${encodeURIComponent(presentation)}`
      });

      if (res.ok) {
        Alert.alert('✅ Success', 'Question saved!');
        setQuestionText('');
        setPresentation('');
        setQuestionType('text');
      } else {
        Alert.alert('Error', 'Failed to save question');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Network error');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create New Survey Question</Text>

        <Text style={styles.label}>Question Text:</Text>
        <TextInput
          style={styles.input}
          value={questiontext}
          onChangeText={setQuestionText}
          placeholder="Enter question here"
        />

        <Text style={styles.label}>Question Type:</Text>
        <View style={styles.input}>
          <Picker
            selectedValue={questiontype}
            onValueChange={(val) => setQuestionType(val)}
          >
            <Picker.Item label="Text" value="text" />
            <Picker.Item label="Multichoice" value="multichoice" />
            <Picker.Item label="Numeric (Rating)" value="numeric" />
          </Picker>
        </View>

        <Text style={styles.label}>Presentation (use `|` to separate multichoice options):</Text>
        <TextInput
          style={styles.input}
          value={presentation}
          onChangeText={setPresentation}
          placeholder="Option1|Option2|Option3"
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={styles.buttonWrapper}>
            <Button title="Save Question" onPress={handleSubmit} color="#006bae" />
          </View>

          <TouchableOpacity style={styles.buttonWrapper}>
            <Button
              title="View Survey Responses"
              onPress={() => navigation.navigate('SurveyDashboard')}
              color="#006bae"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.logoutWrapper}>
        <TouchableOpacity style={styles.buttonWrapper}>
          <Button
            title="Logout"
            color="#006bae"
            onPress={() => {
              if (onLogout) onLogout();
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                })
              );
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    color: '#006bae',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#fff',
  },
  buttonWrapper: {
    marginTop: 20,
    alignItems: 'center',
  },
  logoutWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
});
