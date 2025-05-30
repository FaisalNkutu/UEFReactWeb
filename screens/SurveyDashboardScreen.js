import React, { useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';
import {
  View, Text, TextInput, ScrollView,
  FlatList, TouchableOpacity, StyleSheet, Button
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SurveyDashboardScreen({ route, onLogout }) {
  const navigation = useNavigation();
  const user = route.params?.user || {};
  const role = user.role?.toLowerCase() || '';
  const loggedInUserId = user.id;

  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(role === 'student' ? loggedInUserId : null);
  const [responses, setResponses] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    if (role !== 'student') {
      fetch('http://192.168.91.1:8085/api/feedback/users')
        .then(res => res.json())
        .then(data => {
          if (!Array.isArray(data)) {
            Alert.alert("Error", "Invalid user data format from backend");
            return;
          }
          setUsers(data);
          setFilteredUsers(data);
        })
        .catch(() => Alert.alert('Error', 'Unable to fetch users'));
    } else {
      fetch(`http://192.168.91.1:8085/api/feedback/users/${loggedInUserId}`)
        .then(res => {
          if (!res.ok) throw new Error("User not found");
          return res.json();
        })
        .then(data => {
          setUsers([data]);
          setFilteredUsers([data]);
          setSelectedUserId(data.id);
          fetchResponses(data.id);
        })
        .catch(() => Alert.alert('Error', 'Unable to fetch user details'));
    }
  }, []);

  const handleSearch = (text) => {
    setQuery(text);
    const filtered = users.filter(u =>
      u.username?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredUsers(filtered);
    const match = filtered.find(u =>
      u.username?.toLowerCase() === text.toLowerCase()
    );
    setSelectedUserId(match ? match.id : null);
  };

  const fetchResponses = async (overrideUserId) => {
    const userId = overrideUserId ?? selectedUserId ?? 1;
    try {
      const res = await fetch(`http://192.168.91.1:8085/api/feedback/responses/${userId}`);
      const data = await res.json();
      if (!Array.isArray(data)) {
        Alert.alert('Error', 'Invalid response format from backend');
        return;
      }
      setResponses(data);
    } catch {
      Alert.alert('Error', 'Failed to load responses');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    const sorted = [...responses].sort((a, b) => {
      const aVal = (a[key] || '').toString().toLowerCase();
      const bVal = (b[key] || '').toString().toLowerCase();
      return direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    setResponses(sorted);
    setSortConfig({ key, direction });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
      if (typeof onLogout === 'function') {
        onLogout();
      }
    } catch (error) {
      Alert.alert("Logout Failed", "An error occurred while logging out.");
      console.error("Logout error:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Dashboard</Text>

        {role !== 'student' && (
          <View style={styles.searchBox}>
            <TextInput
              style={styles.input}
              placeholder="Search Student Username"
              value={query}
              onChangeText={handleSearch}
            />

            {filteredUsers.length > 0 && (
              <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => {
                    setQuery(item.username);
                    setSelectedUserId(item.id);
                  }}>
                    <Text style={styles.option}>{item.username}</Text>
                  </TouchableOpacity>
                )}
                style={styles.dropdownList}
              />
            )}

            <Button title="View Responses" onPress={() => fetchResponses()} color="#006bae" />

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
                if (selectedUserId) {
                  navigation.navigate('ScreenUsageDashboard', { userId: selectedUserId });
                } else {
                  Alert.alert("Select User", "Please select a user before viewing usage.");
                }
              }}
            />
          </View>
        )}

        <Text style={styles.subheading}>Responses</Text>

        <View style={styles.tableHeader}>
          <TouchableOpacity style={styles.cellHeader} onPress={() => handleSort('questionId')}>
            <Text style={styles.sortableHeader}>
              QID {sortConfig.key === 'questionId' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cellHeader} onPress={() => handleSort('answer')}>
            <Text style={styles.sortableHeader}>
              Answer {sortConfig.key === 'answer' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cellHeader} onPress={() => handleSort('timestamp')}>
            <Text style={styles.sortableHeader}>
              Timestamp {sortConfig.key === 'timestamp' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {responses.length === 0 ? (
          <Text style={styles.noResponse}>No responses available.</Text>
        ) : (
          responses.map((resp, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.cell}>{resp.questionId ?? '–'}</Text>
              <Text style={styles.cell}>{resp.answer?.trim() || '(no answer)'}</Text>
              <Text style={styles.cell}>{resp.timestamp || '(no time)'}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.logoutWrapper}>
        <Button title="🚪 Logout" color="#006bae" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 100, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, color: '#2c3e50', textAlign: 'center', marginBottom: 20 },
  subheading: { fontSize: 18, color: '#2c3e50', marginTop: 20, marginBottom: 10 },
  searchBox: { marginBottom: 20 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 4,
    padding: 10, backgroundColor: '#fff', fontSize: 16
  },
  dropdownList: {
    maxHeight: 150, borderColor: '#ccc', borderWidth: 1,
    backgroundColor: '#fff', marginTop: 5
  },
  option: { padding: 10, borderBottomColor: '#eee', borderBottomWidth: 1 },
  tableHeader: {
    flexDirection: 'row', backgroundColor: '#d6ecff', paddingVertical: 10,
    borderTopLeftRadius: 4, borderTopRightRadius: 4
  },
  tableRow: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ddd',
    paddingVertical: 8
  },
  cellHeader: { flex: 1, textAlign: 'center' },
  sortableHeader: {
    fontWeight: 'bold', textAlign: 'center',
    textDecorationLine: 'underline', color: '#006bae'
  },
  cell: { flex: 1, textAlign: 'center' },
  noResponse: { textAlign: 'center', fontStyle: 'italic', color: '#888', marginTop: 10 },
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
