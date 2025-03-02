import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function TabLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const loginStatus = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(loginStatus === 'true');
    } catch (e) {
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      // If not logged in, redirect to login
      router.replace('/login');
    }
  }, [isLoading, isLoggedIn]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  // If not logged in, render nothing (we're redirecting anyway)
  if (!isLoggedIn) {
    return null;
  }

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#3498db' }}>
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubble" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="forum"
        options={{
          title: 'Forum',
          tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
          headerRight: () => (
            <TouchableOpacity 
              style={{ marginRight: 15 }}
              onPress={async () => {
                await AsyncStorage.setItem('isLoggedIn', 'false');
                router.replace('/login');
              }}
            >
              <Ionicons name="log-out-outline" size={24} color="#3498db" />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}
