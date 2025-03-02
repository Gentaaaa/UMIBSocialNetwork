import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screen components (we'll create these next)
import ProfileScreen from './screens/ProfileScreen';
import EventsScreen from './screens/EventsScreen';
import ForumScreen from './screens/ForumScreen';
import MessagesScreen from './screens/MessagesScreen';
import PostDetailScreen from './screens/PostDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Forum"  component={ForumScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeTabs} options={{ headerShown: false }} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Post Details' }} />
      </Stack.Navigator>

    </NavigationContainer>
  );
}
