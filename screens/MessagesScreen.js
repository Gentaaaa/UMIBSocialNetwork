import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_MESSAGES = {
  'Stanford Yeh': [
    { text: 'Kelvin is a gentleman and a scholar', sender: 'them' },
    { text: 'Sweet thanks!', sender: 'me' },
  ],
  'Mom': [
    { text: 'I think 2 is good', sender: 'them' },
    { text: 'Did you eat?', sender: 'them' },
    { text: 'Yes mom ❤️', sender: 'me' },
  ],
};

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function MessagesScreen() {
  const [messages, setMessages] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [showThread, setShowThread] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      simulateIncomingMessages();
    }, 10000);
    return () => clearInterval(interval);
  }, [messages]);

  const loadMessages = async () => {
    const stored = await AsyncStorage.getItem('messages');
    if (stored) {
      const parsed = JSON.parse(stored);
      setMessages(parsed);
      setSelectedUser(Object.keys(parsed)[0]);
    } else {
      setMessages(DEFAULT_MESSAGES);
      setSelectedUser(Object.keys(DEFAULT_MESSAGES)[0]);
    }
  };

  const saveMessages = async (updated) => {
    setMessages(updated);
    await AsyncStorage.setItem('messages', JSON.stringify(updated));
  };

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    const updated = {
      ...messages,
      [selectedUser]: [...(messages[selectedUser] || []), { text: messageInput, sender: 'me' }],
    };
    saveMessages(updated);
    setMessageInput('');
  };

  const addNewConversation = () => {
    const newUser = `User${Date.now().toString().slice(-4)}`;
    const updated = {
      ...messages,
      [newUser]: [{ text: 'Përshëndetje! Kjo është një bisedë e re.', sender: 'them' }],
    };
    saveMessages(updated);
    setSelectedUser(newUser);
  };

  const deleteConversation = (user) => {
    const actuallyDelete = () => {
      const updated = { ...messages };
      delete updated[user];
      saveMessages(updated);
      const nextUser = Object.keys(updated)[0] || null;
      setSelectedUser(nextUser);
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`A je i sigurt që do ta fshish bisedën me ${user}?`)) {
        actuallyDelete();
      }
    } else {
      Alert.alert('Fshij Bisedën', `A je i sigurt që do ta fshish bisedën me ${user}?`, [
        { text: 'Anulo', style: 'cancel' },
        { text: 'Po, fshije', onPress: actuallyDelete, style: 'destructive' },
      ]);
    }
  };

  const simulateIncomingMessages = () => {
    if (!selectedUser) return;
    const updated = {
      ...messages,
      [selectedUser]: [...messages[selectedUser], { text: 'Mesazh automatik...', sender: 'them' }],
    };
    saveMessages(updated);
  };

  const toggleThread = () => {
    LayoutAnimation.easeInEaseOut();
    setShowThread((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <TouchableOpacity style={styles.newConversation} onPress={addNewConversation}>
          <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>+ New conversation</Text>
        </TouchableOpacity>
        <ScrollView>
          {Object.keys(messages).map((user) => (
            <TouchableOpacity
              key={user}
              style={[styles.userItem, user === selectedUser && styles.selectedUserItem]}
              onPress={() => {
                setSelectedUser(user);
                setShowThread(true);
              }}
              onLongPress={() => deleteConversation(user)}
            >
              <Text style={styles.userInitial}>{user.charAt(0)}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{user}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {messages[user].slice(-1)[0]?.text}
                </Text>
              </View>
              <TouchableOpacity onPress={() => deleteConversation(user)} style={styles.deleteBtn}>
                <Text style={{ color: 'red' }}>🗑️</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Thread */}
      {showThread && selectedUser && (
        <View style={styles.thread}>
          <View style={styles.threadHeader}>
            <Text style={styles.threadTitle}>{selectedUser}</Text>
            <TouchableOpacity onPress={toggleThread}>
              <Text style={{ color: '#007AFF', fontSize: 14 }}>👁️ Hide Chat</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={messages[selectedUser]}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageBubble,
                  item.sender === 'me' ? styles.myMessage : styles.theirMessage,
                ]}
              >
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
            )}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.messageList}
          />
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Shkruaj mesazh..."
              value={messageInput}
              onChangeText={setMessageInput}
              style={styles.input}
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <Text style={{ color: 'white' }}>Dërgo</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!showThread && (
        <View style={[styles.thread, { justifyContent: 'center', alignItems: 'center' }]}>
          <TouchableOpacity onPress={toggleThread}>
            <Text style={{ color: '#007AFF', fontSize: 16 }}>👁️ Show Chat</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  sidebar: {
    width: 250,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    backgroundColor: '#f9f9f9',
    paddingVertical: 10,
  },
  newConversation: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userItem: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedUserItem: {
    backgroundColor: '#e5f1fb',
  },
  userInitial: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#aaa',
    color: 'white',
    textAlign: 'center',
    lineHeight: 36,
    fontWeight: 'bold',
  },
  userName: { fontWeight: 'bold' },
  lastMessage: { fontSize: 12, color: '#666', width: 140 },
  deleteBtn: { marginLeft: 10 },
  thread: { flex: 1, backgroundColor: '#fff' },
  threadHeader: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  threadTitle: { fontSize: 18, fontWeight: 'bold' },
  messageList: {
    padding: 15,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  theirMessage: {
    backgroundColor: '#ddd',
    alignSelf: 'flex-start',
  },
  myMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
  },
  messageText: { color: 'white' },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 20,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: 'center',
    marginLeft: 10,
  },
});
