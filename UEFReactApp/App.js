import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import CreateSurveyQuestionScreen from './screens/CreateSurveyQuestionScreen';
import SurveyScreen from './screens/SurveyScreen';
import ViewResponsesScreen from './screens/ViewResponsesScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="CreateSurvey" component={CreateSurveyQuestionScreen} />
        <Stack.Screen name="Survey" component={SurveyScreen} />
        <Stack.Screen name="ViewResponses" component={ViewResponsesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}