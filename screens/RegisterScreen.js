import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
const BASE_URL = 'http://192.168.2.12:8087';
export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

 
    const handleSubmit = async () => {
  const { firstName, lastName, email, password, role } = form;

  if (!firstName || !lastName || !email || !password || !role) {
    Alert.alert('Error', 'All fields are required');
    return;
  }

  if (password.length < 6) {
    Alert.alert('Error', 'Password must be at least 6 characters');
    return;
  }

  try {
    const response = await fetch('${BASE_URL}/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        firstName,
        lastName,
        email,
        password,
        role,
      }).toString(),
    });

    if (response.ok) {
      Alert.alert('Success', 'Registration complete', [
        {
          text: 'Go to Login',
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            }),
        },
      ]);
    } else {
      const msg = await response.text();
      Alert.alert('Error', msg || 'Registration failed');
    }
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Network error');
  }
};


  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://www.uefwebshop.fi/cdn/shop/files/UEF_eng_black.jpg?v=1693486399&width=330' }}
          style={styles.logo}
        />
        <Text style={styles.title}>University of Eastern Finland - LMS</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.heading}>Create an Account</Text>

        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={form.firstName}
          onChangeText={(val) => handleChange('firstName', val)}
        />

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={form.lastName}
          onChangeText={(val) => handleChange('lastName', val)}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          value={form.email}
          onChangeText={(val) => handleChange('email', val)}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={form.password}
          onChangeText={(val) => handleChange('password', val)}
        />

        <Text style={styles.label}>Role</Text>
        <Picker
          selectedValue={form.role}
          style={styles.input}
          onValueChange={(val) => handleChange('role', val)}
        >
          <Picker.Item label="--Select Role--" value="" />
          <Picker.Item label="Student" value="STUDENT" />
          <Picker.Item label="Teacher" value="TEACHER" />
          <Picker.Item label="Admin" value="ADMIN" />
        </Picker>

        <Button title="Register" onPress={handleSubmit} color="#006bae" />

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f5f5f5' },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#006bae',
  },
  logo: { height: 60, width: 120, marginBottom: 10 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  form: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
  },
  heading: {
    fontSize: 20,
    color: '#006bae',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  label: { fontWeight: 'bold', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 5,
  },
  loginLink: {
    marginTop: 20,
    color: '#006bae',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});