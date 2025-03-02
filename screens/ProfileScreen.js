import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  // State for profile info
  const [user, setUser] = useState({
    name: 'John Doe',
    bio: 'Computer Science Student',
    major: 'BSc CS',
    year: '2025',
    avatar: 'https://example.com/avatar.png'  // placeholder image URL
  });
  const [isEditing, setIsEditing] = useState(false);

  // Load profile from storage when the component mounts
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        setUser(JSON.parse(savedProfile));
      }
    } catch (e) {
      console.log('Failed to load profile');
    }
  };

  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(user));
      setIsEditing(false);  // exit edit mode after saving
    } catch (e) {
      console.log('Failed to save profile');
    }
  };

  return (
    <View style={styles.container}>
      {/* Display profile info or edit fields based on isEditing state */}
      <Image source={{ uri: user.avatar }} style={styles.avatar} />
      {isEditing ? (
        <>
          <TextInput 
            style={styles.input} 
            value={user.name} 
            onChangeText={(text) => setUser({ ...user, name: text })}
            placeholder="Name"
          />
          <TextInput 
            style={styles.input} 
            value={user.bio} 
            onChangeText={(text) => setUser({ ...user, bio: text })}
            placeholder="Bio"
          />
          <TextInput 
            style={styles.input} 
            value={user.major} 
            onChangeText={(text) => setUser({ ...user, major: text })}
            placeholder="Major"
          />
          <TextInput 
            style={styles.input} 
            value={user.year} 
            onChangeText={(text) => setUser({ ...user, year: text })}
            placeholder="Year"
          />
          {/* In a real app, you might allow changing avatar via image picker */}
          <Button title="Save Profile" onPress={saveProfile} />
        </>
      ) : (
        <>
          <Text style={styles.label}>Name: {user.name}</Text>
          <Text style={styles.label}>Bio: {user.bio}</Text>
          <Text style={styles.label}>Major: {user.major}</Text>
          <Text style={styles.label}>Year: {user.year}</Text>
          <Button title="Edit Profile" onPress={() => setIsEditing(true)} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, margin: 20 },
  input: { 
    width: '100%', 
    borderColor: '#ccc', borderWidth: 1, borderRadius: 5, 
    padding: 8, marginBottom: 10 
  },
  label: { fontSize: 16, marginBottom: 5 }
});
