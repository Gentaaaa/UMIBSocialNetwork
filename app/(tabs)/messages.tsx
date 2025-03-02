import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Add these interfaces at the top of your file after imports
interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
}

interface LastMessage {
  text: string;
  timestamp: Date;
  read: boolean;
}

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface Conversation {
  id: string;
  with: User;
  lastMessage: LastMessage;
  messages: Message[];
}

// Mock user data
const currentUser = {
  id: '1',
  name: 'John Doe',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
};

// Mock conversations data
const initialConversations = [
  {
    id: '1',
    with: {
      id: '2',
      name: 'Sarah Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    lastMessage: {
      text: 'Looking forward to our meeting tomorrow!',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: true,
    },
    messages: [
      {
        id: 'm1',
        sender: '2',
        text: 'Hi John, how are you doing?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: 'm2',
        sender: '1',
        text: 'Hey Sarah! I\'m good, thanks for asking. How about you?',
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
      },
      {
        id: 'm3',
        sender: '2',
        text: 'I\'m well! Just preparing for our project meeting.',
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
      },
      {
        id: 'm4',
        sender: '1',
        text: 'Yes, I\'ve been reviewing the materials. I think we\'re in good shape.',
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
      },
      {
        id: 'm5',
        sender: '2',
        text: 'Looking forward to our meeting tomorrow!',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
      },
    ]
  },
  {
    id: '2',
    with: {
      id: '3',
      name: 'Michael Chen',
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    },
    lastMessage: {
      text: 'Thanks for your help with the project!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
    },
    messages: [
      {
        id: 'm1',
        sender: '3',
        text: 'John, do you have a minute to talk about the UI design?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      },
      {
        id: 'm2',
        sender: '1',
        text: 'Sure, what specifically did you want to discuss?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
      },
      {
        id: 'm3',
        sender: '3',
        text: 'I\'m thinking we should simplify the navigation',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.2),
      },
      {
        id: 'm4',
        sender: '1',
        text: 'That makes sense. I can help you implement that tomorrow.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.1),
      },
      {
        id: 'm5',
        sender: '3',
        text: 'Thanks for your help with the project!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
    ]
  },
  {
    id: '3',
    with: {
      id: '4',
      name: 'Emily Rodriguez',
      avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
    },
    lastMessage: {
      text: 'Let\'s catch up soon!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
    },
    messages: [
      {
        id: 'm1',
        sender: '4',
        text: 'Hey John! Long time no talk.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25),
      },
      {
        id: 'm2',
        sender: '1',
        text: 'Emily! Yes it\'s been a while. How have you been?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24.5),
      },
      {
        id: 'm3',
        sender: '4',
        text: 'I\'ve been great! Just busy with work and life.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24.2),
      },
      {
        id: 'm4',
        sender: '4',
        text: 'Let\'s catch up soon!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    ]
  }
];

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(true); // For demo purposes
  const [isLoading, setIsLoading] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // 10% chance of getting a new message
      if (Math.random() < 0.1 && conversations.length > 0) {
        const randomConversationIndex = Math.floor(Math.random() * conversations.length);
        const newConversations = [...conversations];
        const conversation = newConversations[randomConversationIndex];
        
        const newMessage = {
          id: `m${Date.now()}`,
          sender: conversation.with.id,
          text: `New message from ${conversation.with.name} at ${new Date().toLocaleTimeString()}`,
          timestamp: new Date()
        };
        
        conversation.messages.push(newMessage);
        conversation.lastMessage = {
          text: newMessage.text,
          timestamp: newMessage.timestamp,
          read: false
        };
        
        setConversations(newConversations);
        
        // If this conversation is currently selected, update it
        if (selectedConversation && selectedConversation.id === conversation.id) {
          setSelectedConversation({...conversation});
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [conversations, selectedConversation]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    const newMessage = {
      id: `m${Date.now()}`,
      sender: currentUser.id,
      text: messageText.trim(),
      timestamp: new Date()
    };

    // Update the selected conversation
    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
      lastMessage: {
        text: newMessage.text,
        timestamp: newMessage.timestamp,
        read: true
      }
    };

    // Update all conversations
    const updatedConversations = conversations.map(conv => 
      conv.id === selectedConversation.id ? updatedConversation : conv
    );

    setSelectedConversation(updatedConversation);
    setConversations(updatedConversations);
    setMessageText('');
    
    // Simulate response delay (30% chance)
    if (Math.random() < 0.3) {
      setTimeout(() => {
        const autoReply = {
          id: `m${Date.now()}`,
          sender: selectedConversation.with.id,
          text: `Thanks for your message! This is an automated reply from ${selectedConversation.with.name}.`,
          timestamp: new Date()
        };
        
        const conversationWithReply = {
          ...updatedConversation,
          messages: [...updatedConversation.messages, autoReply],
          lastMessage: {
            text: autoReply.text,
            timestamp: autoReply.timestamp,
            read: false
          }
        };
        
        const conversationsWithReply = updatedConversations.map(conv => 
          conv.id === selectedConversation.id ? conversationWithReply : conv
        );
        
        setSelectedConversation(conversationWithReply);
        setConversations(conversationsWithReply);
      }, 2000);
    }
  };

  const formatTimestamp = (timestamp: Date | string | number) => {
    const now = new Date();
    const msgDate = new Date(timestamp);
    
    if (now.toDateString() === msgDate.toDateString()) {
      return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const markAsRead = (conversationId: string) => {
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId && !conv.lastMessage.read) {
        return {
          ...conv,
          lastMessage: {
            ...conv.lastMessage,
            read: true
          }
        };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.title}>Please Login</Text>
        <Text style={styles.subtitle}>You need to be logged in to view messages</Text>
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={() => setIsAuthenticated(true)}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  if (selectedConversation) {
    // Show the conversation thread
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setSelectedConversation(null)}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Image 
            source={{ uri: selectedConversation.with.avatar }} 
            style={styles.avatar} 
          />
          <Text style={styles.headerTitle}>{selectedConversation.with.name}</Text>
        </View>
        
        <FlatList
          data={selectedConversation.messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          inverted={false}
          renderItem={({ item }) => {
            const isMe = item.sender === currentUser.id;
            return (
              <View style={[
                styles.messageBubble, 
                isMe ? styles.myMessage : styles.theirMessage
              ]}>
                <Text style={styles.messageText}>{item.text}</Text>
                <Text style={styles.messageTime}>{formatTimestamp(item.timestamp)}</Text>
              </View>
            );
          }}
        />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          style={styles.inputContainer}
        >
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <Ionicons 
              name="send" 
              size={24} 
              color={messageText.trim() ? "#3498db" : "#ccc"} 
            />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Show the list of conversations
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.conversationHeader}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity style={styles.newMessageButton}>
          <Ionicons name="create-outline" size={24} color="#3498db" />
        </TouchableOpacity>
      </View>
      
      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubble-ellipses-outline" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No messages yet</Text>
          <Text style={styles.emptyStateSubtext}>Start a conversation with someone</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.conversationItem}
              onPress={() => {
                markAsRead(item.id);
                setSelectedConversation(item);
              }}
            >
              <Image source={{ uri: item.with.avatar }} style={styles.conversationAvatar} />
              <View style={styles.conversationContent}>
                <View style={styles.conversationItemHeader}>
                  <Text style={styles.conversationName}>{item.with.name}</Text>
                  <Text style={styles.conversationTime}>
                    {formatTimestamp(item.lastMessage.timestamp)}
                  </Text>
                </View>
                <View style={styles.conversationFooter}>
                  <Text 
                    style={[
                      styles.conversationLastMessage,
                      !item.lastMessage.read && styles.unreadMessage
                    ]}
                    numberOfLines={1}
                  >
                    {item.lastMessage.text}
                  </Text>
                  {!item.lastMessage.read && (
                    <View style={styles.unreadBadge} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  newMessageButton: {
    padding: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  conversationAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  conversationContent: {
    flex: 1,
  },
  conversationItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
  },
  conversationTime: {
    fontSize: 12,
    color: '#666',
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationLastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#333',
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3498db',
    marginLeft: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#666',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  messageList: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  myMessage: {
    backgroundColor: '#3498db',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    padding: 10,
  },
}); 