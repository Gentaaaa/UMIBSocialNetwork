import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useColorScheme } from 'react-native';

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    name: '',
    bio: '',
    major: '',
    year: '',
    avatar: '',
  });

  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const saved = await AsyncStorage.getItem('userProfile');
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        const defaultUser = {
          name: 'John Doe',
          bio: 'Computer Science Student',
          major: 'BSc CS',
          year: '2025',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        };
        setUser(defaultUser);
        await AsyncStorage.setItem('userProfile', JSON.stringify(defaultUser));
      }
    } catch (e) {
      console.log('Failed to load profile', e);
    }
  };

  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(user));
      setIsEditing(false);
    } catch (e) {
      console.log('Failed to save profile', e);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      setUser({ ...user, avatar: result.assets[0].uri });
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            })
          );
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.container, { backgroundColor: isDark ? '#000' : '#f8f8f8' }]}>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={{ uri: user.avatar }}
          style={styles.avatar}
        />
        <Text style={styles.changePhoto}>📷 Change Photo</Text>
      </TouchableOpacity>

      {isEditing ? (
        <>
          <TextInput
            style={styles.input}
            value={user.name}
            onChangeText={(text) => setUser({ ...user, name: text })}
            placeholder="Full Name"
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
            placeholder="Graduation Year"
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={user.bio}
            onChangeText={(text) => setUser({ ...user, bio: text })}
            placeholder="Short Bio"
            multiline
          />

          <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
            <Text style={styles.saveText}>💾 Save</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.detail}>
            {user.major} • Class of {user.year}
          </Text>
          <Text style={styles.bio}>{user.bio}</Text>

          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.editText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>🔓 Logout</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 10,
  },
  changePhoto: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 5,
    textAlign: 'center',
  },
  detail: {
    fontSize: 16,
    color: '#777',
    marginBottom: 10,
    textAlign: 'center',
  },
  bio: {
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
    color: '#444',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  saveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  editButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  editText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 30,
    alignItems: 'center',
    backgroundColor: '#ff3b30',
    padding: 12,
    borderRadius: 10,
    width: '100%',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
