import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserProfile {
  name: string;
  bio: string;
  major: string;
  year: string;
  avatar: string;
}

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<UserProfile>({
    name: 'John Doe',
    bio: 'Computer Science Student',
    major: 'BSc CS',
    year: '2025',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200'
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) setUser(JSON.parse(savedProfile));
    } catch (e) {
      console.log('Failed to load profile');
    }
  };

  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(user));
      setIsEditing(false);
    } catch (e) {
      console.log('Failed to save profile');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: user.avatar }} style={styles.avatar} />
      
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            value={user.name}
            onChangeText={(text) => setUser({...user, name: text})}
            placeholder="Name"
          />
          <TextInput
            style={styles.input}
            value={user.major}
            onChangeText={(text) => setUser({...user, major: text})}
            placeholder="Major"
          />
          <TextInput
            style={styles.input}
            value={user.year}
            onChangeText={(text) => setUser({...user, year: text})}
            placeholder="Graduation Year"
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={user.bio}
            onChangeText={(text) => setUser({...user, bio: text})}
            placeholder="Bio"
            multiline
          />
          <TouchableOpacity 
            style={styles.button} 
            onPress={saveProfile}
          >
            <Text style={styles.buttonText}>Save Profile</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.profileContainer}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.detail}>{user.major} - Class of {user.year}</Text>
          <Text style={styles.bio}>{user.bio}</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 30,
    marginTop: 20,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileContainer: {
    alignItems: 'center',
  },
  editContainer: {
    width: '100%',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  detail: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
    textAlign: 'center',
    paddingHorizontal: 20,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 