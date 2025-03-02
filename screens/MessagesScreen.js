import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

export default function MessagesScreen() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const saved = await AsyncStorage.getItem('messages');
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        // Optionally load some initial messages
        const initialMessages = [
          { id: '1', text: 'Hey there! This is the start of your conversation.', sender: 'Friend', timestamp: format(new Date(), 'MMM dd, yyyy HH:mm') }
        ];
        setMessages(initialMessages);
        await AsyncStorage.setItem('messages', JSON.stringify(initialMessages));
      }
    } catch (e) {
      console.log('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    const newMsg = { 
      id: Date.now().toString(), 
      text: text, 
      sender: 'Me', 
      timestamp: format(new Date(), 'MMM dd, yyyy HH:mm') 
    };
    const updatedMessages = [...messages, newMsg];
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(updatedMessages));
      setMessages(updatedMessages);
      setText('');
    } catch (e) {
      console.log('Failed to save message');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.messageBubble, item.sender === 'Me' ? styles.myMessage : styles.theirMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.messageTime}>{item.timestamp}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingVertical: 10 }}
      />
      {/* Input area */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={text}
          onChangeText={setText}
          onSubmitEditing={sendMessage}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  messageBubble: {
    padding: 10, marginVertical: 5, borderRadius: 8, maxWidth: '80%'
  },
  myMessage: {
    alignSelf: 'flex-end', backgroundColor: '#d1fcd3'
  },
  theirMessage: {
    alignSelf: 'flex-start', backgroundColor: '#e6e6e6'
  },
  messageText: { fontSize: 15 },
  messageTime: { fontSize: 10, color: '#555', marginTop: 3, textAlign: 'right' },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: '#ddd', paddingTop: 5 },
  input: { flex: 1, padding: 8, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, marginRight: 5 }
});
