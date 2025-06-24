import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    const storedUsers = JSON.parse(await AsyncStorage.getItem('users')) || {};

    if (storedUsers[username] && storedUsers[username] === password) {
      await AsyncStorage.setItem('loggedInUser', username);
      navigation.replace('Home');
    } else {
      Alert.alert('Gabim', 'Emri ose fjalëkalimi janë të pasaktë!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kyçu</Text>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <Button title="Kyçu" onPress={login} />
      <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
        Nuk ke llogari? Regjistrohu
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 100 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 15, borderRadius: 8 },
  link: { marginTop: 15, color: '#007AFF', textAlign: 'center' },
});
