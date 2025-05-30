// screens/DashboardScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Button } from 'react-native';

export default function DashboardScreen({ navigation, route }) {
  const { user } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome, {user.username}!</Text>

      <View style={styles.menu}>
        {/* Show only if the user is a student */}
        {user.role === 'student' && (
          <>
            <TouchableOpacity onPress={() => navigation.navigate('Survey', { user })}>
              <Text style={styles.menuItem}>📝 Take Surveymmmmm</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('ViewResponses', { user })}>
              <Text style={styles.menuItem}>📊 View Responsesmmmm</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Show only if the user is NOT a student */}
        {user.role !== 'student' && (
          <>
            <TouchableOpacity onPress={() => navigation.navigate('CreateSurvey', { user })}>
              <Text style={styles.menuItem}>➕ Create Survey</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('SurveyDashboard', { user })}>
              <Text style={styles.menuItem}>📋 Survey Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('UsageChart', { user })}>
              <Text style={styles.menuItem}>📈 Usage Chart</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('ScreenUsageDashboard', { user })}>
              <Text style={styles.menuItem}>🖥️ Screen Usage Dashboard</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ✅ Live Log Button - visible to all roles */}
        <View style={styles.buttonWrapper}>
          <Button
            title="🖥️ View Live Log"
            onPress={() => navigation.navigate('LiveLog', { user })}
            color="#006bae"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    flexGrow: 1,
    justifyContent: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#006bae',
    marginBottom: 30
  },
  menu: {
    gap: 15
  },
  menuItem: {
    padding: 12,
    fontSize: 18,
    color: '#006bae',
    textAlign: 'center',
    backgroundColor: '#e0f0ff',
    borderRadius: 6
  },
  buttonWrapper: {
    marginTop: 20,
    alignSelf: 'center',
    width: '80%'
  }
});
