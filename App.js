import React, { useState } from 'react';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createNavigationContainerRef } from '@react-navigation/native';
import { View } from 'react-native';

// Screens
import SurveyScreen from './screens/SurveyScreen';
import CreateSurveyQuestionScreen from './screens/CreateSurveyQuestionScreen';
import ViewResponsesScreen from './screens/ViewResponsesScreen';
import SurveyDashboardScreen from './screens/SurveyDashboardScreen';
import DashboardScreen from './screens/DashboardScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import UsageChartScreen from './screens/UsageChartScreen';
import ScreenUsageDashboard from './screens/ScreenUsageDashboard';
import LiveLogScreen from './screens/LiveLogScreen';

import { logScreenTime } from './utils/ScreenTimeTracker';

const Stack = createNativeStackNavigator();
export const navigationRef = createNavigationContainerRef();

export default function App() {
  const [user, setUser] = useState(null);
  const normalizedRole = user?.role?.toLowerCase();

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    console.log("🔐 Logging out...");
    setUser(null);

    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={(state) => {
        if (user?.id && state) {
          const currentRoute = state.routes[state.index]?.name;
          logScreenTime(currentRoute, user.id);
        }
      }}
    >
      <Stack.Navigator initialRouteName="Login">
        {!user ? (
          <>
            <Stack.Screen name="Login" options={{ headerShown: false }}>
              {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Create Account' }}
            />
          </>
        ) : normalizedRole === 'student' ? (
          <>
            <Stack.Screen
              name="Survey"
              options={{ title: 'Take Survey' }}
              initialParams={{ user }}
            >
              {(props) => <SurveyScreen {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen
              name="SurveyDashboard"
              options={{ title: 'My Responses' }}
              initialParams={{ user }}
            >
              {(props) => <SurveyDashboardScreen {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen
              name="Dashboard"
              options={{ title: 'Student Dashboard' }}
              initialParams={{ user }}
            >
              {(props) => <DashboardScreen {...props} onLogout={handleLogout} />}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen
              name="CreateSurvey"
              options={{ title: 'Create Survey' }}
              initialParams={{ user }}
            >
              {(props) => <CreateSurveyQuestionScreen {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen
              name="SurveyDashboard"
              options={{ title: 'Survey Dashboard' }}
              initialParams={{ user }}
            >
              {(props) => <SurveyDashboardScreen {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen
              name="ViewResponses"
              options={{ title: 'View Responses' }}
              initialParams={{ user }}
            >
              {(props) => <ViewResponsesScreen {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen
              name="Dashboard"
              options={{ title: 'Admin Dashboard' }}
              initialParams={{ user }}
            >
              {(props) => <DashboardScreen {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen
              name="UsageChart"
              initialParams={{ user }}
            >
              {(props) => <UsageChartScreen {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen
              name="LiveLog"
              options={{ title: 'Live Screen Tracker' }}
              initialParams={{ user }}
            >
              {(props) => <LiveLogScreen {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen
              name="ScreenUsageDashboard"
              options={{ title: 'Screen Usage Dashboard' }}
              initialParams={{ user }}
            >
              {(props) => <ScreenUsageDashboard {...props} onLogout={handleLogout} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}