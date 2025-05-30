// ViewResponsesScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, Button, ScrollView, Alert,
  StyleSheet, ActivityIndicator, TextInput, FlatList, TouchableOpacity
} from 'react-native';

export default function ViewResponsesScreen({ route, navigation }) {
  const { user } = route.params;

  const [students, setStudents] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(user.role === 'STUDENT' ? user.id : null);
  const [query, setQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      const res = await fetch('http://192.168.91.1:8085/api/feedback/users');
      const data = await res.json();
      setStudents(data);
      setFilteredStudents(data);
    } catch (err) {
      Alert.alert('Error', 'Could not fetch user list');
    }
  };

  const fetchResponses = async (userId) => {
    try {
      setLoading(true);
      const res = await fetch(`http://192.168.91.1:8085/api/feedback/responses/${userId}`);
      const data = await res.json();
      setResponses(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch responses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.role === 'TEACHER') fetchStudents();
    if (user.role === 'STUDENT') fetchResponses(user.id);
  }, []);

  const handleSearch = (text) => {
    setQuery(text);
    setFilteredStudents(
      students.filter((s) =>
        s.username.toLowerCase().includes(text.toLowerCase())
      )
    );
  };

  const handleSelectStudent = (studentId) => {
    setSelectedUserId(studentId);
    fetchResponses(studentId);
    setQuery('');
    setFilteredStudents([]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Submitted Survey Responses</Text>

      <TouchableOpacity onPress={() => navigation.navigate('ViewResponses', { user })}>
        <Text style={styles.menuItem}>📊 View Responses</Text>
      </TouchableOpacity>

      {user.role === 'TEACHER' && (
        <View style={styles.dropdown}>
          <TextInput
            style={styles.input}
            placeholder="Search student by username"
            value={query}
            onChangeText={handleSearch}
          />
          {query.length > 0 && (
            <FlatList
              data={filteredStudents}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelectStudent(item.id)}>
                  <Text style={styles.option}>{item.username}</Text>
                </TouchableOpacity>
              )}
              style={styles.dropdownList}
            />
          )}
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#006bae" />
      ) : (
        <>
          {responses.length === 0 ? (
            <Text style={styles.info}>No responses available.</Text>
          ) : (
            responses.map((r, index) => (
              <View key={index} style={styles.responseItem}>
                <Text style={styles.qid}>Q{r.questionId}</Text>
                <Text style={styles.answer}>{r.answer || '(no answer)'}</Text>
                {r.timestamp && (
                  <Text style={styles.timestamp}>
                    {new Date(r.timestamp).toLocaleString()}
                  </Text>
                )}
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, color: '#006bae', textAlign: 'center', marginBottom: 20 },
  dropdown: { marginBottom: 20 },
  input: {
    borderColor: '#ccc', borderWidth: 1, borderRadius: 5,
    padding: 10, backgroundColor: '#fff'
  },
  dropdownList: {
    maxHeight: 200,
    borderColor: '#ccc',
    borderWidth: 1,
    borderTopWidth: 0,
    backgroundColor: '#fff'
  },
  option: {
    padding: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1
  },
  info: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginTop: 10
  },
  responseItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftColor: '#006bae',
    borderLeftWidth: 5
  },
  qid: { fontWeight: 'bold', marginBottom: 5 },
  answer: { fontSize: 16 },
  timestamp: {
    fontSize: 12,
    color: '#777',
    marginTop: 8,
    fontStyle: 'italic'
  },
  menuItem: {
    color: '#006bae',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 16
  }
});