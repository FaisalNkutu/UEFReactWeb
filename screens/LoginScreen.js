import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, View, Text, TextInput, Button, Alert, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
const BASE_URL = 'http://192.168.2.12:8087';
export default function LoginScreen({ navigation, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  console.log("🔍 LoginScreen rendered");

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    console.log("📤 Attempting login with:", { username, password });

    if (!username || !password) {
      setError('Both fields are required');
      return;
    }

    try {
      const res = await fetch('${BASE_URL}/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
      });

      console.log("✅ Got response", res.status);

      const data = await res.json();
      console.log("📦 Parsed response:", data);

      if (res.ok && data.token) {
        await AsyncStorage.setItem('authToken', data.token);
        console.log("🔐 Token saved, role:", data.role);

        if (data.role.toLowerCase() === 'student') {
          console.log("🎓 Navigating to Survey");
          navigation.navigate('Survey', { user: data });
        } else {
          console.log("🛠️ Navigating to CreateSurvey");
          navigation.navigate('CreateSurvey', { user: data });
        }

        onLogin(data);
      } else {
        console.warn("❌ Login failed", data);
        showAlert('Login failed', data.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error("💥 Network error:", err);
      setError('Network error');
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://www.uefwebshop.fi/cdn/shop/files/UEF_eng_black.jpg?v=1693486399&width=330' }}
          style={styles.logo}
        />
        <Text style={styles.title}>University of Eastern Finland - ESM</Text>
      </View>

      <View style={styles.loginBox}>
        <Text style={styles.loginTitle}>Login</Text>

        <Text style={styles.label}>Username:</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password:</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error !== '' && <Text style={styles.error}>{error}</Text>}

        <View style={styles.buttonWrapper}>
          <Button title="Login" onPress={handleLogin} color="#006bae" />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f5f5f5', flexGrow: 1, paddingBottom: 20 },
  header: {
    backgroundColor: '#006bae',
    padding: 20,
    alignItems: 'center',
  },
  logo: { height: 60, width: 120, marginBottom: 10 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loginBox: {
    backgroundColor: '#fff',
    margin: 30,
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  loginTitle: {
    fontSize: 22,
    color: '#006bae',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  label: { marginTop: 10, fontWeight: 'bold' },
  input: {
    borderWidth: 1, borderColor: '#ccc',
    paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: 5, marginTop: 5,
  },
  buttonWrapper: { marginTop: 20 },
  error: { color: 'red', marginTop: 10, textAlign: 'center' },
  registerLink: {
    marginTop: 20,
    textAlign: 'center',
    color: '#006bae',
    textDecorationLine: 'underline',
  },
});