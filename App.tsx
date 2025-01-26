import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';


import LendingScreen from './src/LendingScreen';
import SMSParserApp from './src/SmsParserApp';
import ProfileScreen from './src/ProfileScreen';
import LoginScreen from './src/LoginScreen';
import SignupScreen from './src/SignUpScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Bottom Tab Navigator
const MainTabs = ({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Home') iconName = 'home';
        else if (route.name === 'Lends') iconName = 'cart';
        else if (route.name === 'Profile') iconName = 'stats-chart';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: 'green',
      tabBarInactiveTintColor: 'black',
      tabBarStyle: {
        height: 60,
        paddingTop: 4,
        paddingBottom: 4,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
      },
      tabBarLabelStyle: {
        fontSize: 12,
        marginBottom: 10,
      },
      tabBarButton: (props) => (
        <Pressable
          {...props}
          android_ripple={{ color: 'transparent' }}
          style={({ pressed }) => [
            { flex: 1, alignItems: 'center', justifyContent: 'center' },
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <View style={{ alignItems: 'center' }}>{props.children}</View>
        </Pressable>
      ),
    })}
  >
    <Tab.Screen name="Home" component={SMSParserApp} />
    <Tab.Screen name="Lends" component={LendingScreen} />
    <Tab.Screen name="Profile" >
    {(props) => (
        <ProfileScreen {...props} setIsAuthenticated={setIsAuthenticated} />
      )}</Tab.Screen> 
  </Tab.Navigator>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await AsyncStorage.getItem('token'); // Check if token exists in AsyncStorage
        if (token) setIsAuthenticated(true);
      } catch (error) {
        console.error('Error fetching token:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuthentication();
  }, []);

  if (loading) return null; // Show a loader while authentication is being checked

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Conditional rendering based on authentication */}
        {!isAuthenticated ? (
          <>
          <Stack.Screen
            name="Login"
            options={{ headerShown: false }}
          >
            {(props) => (
              <LoginScreen
                {...props}
                setIsAuthenticated={setIsAuthenticated}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ headerShown: true, title: 'Create Account' }}
          />
        </>
        ) : (
          <>
          {/* <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} /> */}
          <Stack.Screen name="Main">
          {(props) => <MainTabs {...props} setIsAuthenticated={setIsAuthenticated} />}
        </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
