import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Modal, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
}

interface NewEvent {
  title: string;
  date: Date;
  location: string;
  description: string;
}

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: '',
    date: new Date(),
    location: '',
    description: ''
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const savedEvents = await AsyncStorage.getItem('events');
      if (savedEvents) setEvents(JSON.parse(savedEvents));
    } catch (e) {
      console.log('Failed to load events');
    }
  };

  const saveEvents = async (updatedEvents: Event[]) => {
    try {
      await AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
      setEvents(updatedEvents);
    } catch (e) {
      console.log('Failed to save events');
    }
  };

  const handleCreateEvent = () => {
    if (!newEvent.title) {
      // Simple validation
      alert('Please enter an event title');
      return;
    }
    
    const updatedEvents = [...events, {
      ...newEvent,
      id: Date.now().toString(),
      date: format(newEvent.date, 'MMM dd, yyyy HH:mm')
    }];
    
    saveEvents(updatedEvents);
    setModalVisible(false);
    setNewEvent({
      title: '',
      date: new Date(),
      location: '',
      description: ''
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upcoming Events</Text>
        <TouchableOpacity 
          style={styles.createButton} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.createButtonText}>+ New Event</Text>
        </TouchableOpacity>
      </View>
      
      {events.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No events yet</Text>
          <Text style={styles.emptyStateSubtext}>Create your first event to get started</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventDate}>{item.date}</Text>
              <Text style={styles.eventLocation}>{item.location}</Text>
              <Text style={styles.eventDescription}>{item.description}</Text>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>Create New Event</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Event Title"
            value={newEvent.title}
            onChangeText={(text) => setNewEvent({...newEvent, title: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={newEvent.location}
            onChangeText={(text) => setNewEvent({...newEvent, location: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={newEvent.description}
            onChangeText={(text) => setNewEvent({...newEvent, description: text})}
            multiline
            numberOfLines={4}
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.createEventButton]} 
              onPress={handleCreateEvent}
            >
              <Text style={styles.createEventButtonText}>Create Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  eventDate: {
    color: '#666',
    marginBottom: 5,
    fontSize: 14,
  },
  eventLocation: {
    color: '#444',
    marginBottom: 10,
    fontSize: 14,
  },
  eventDescription: {
    color: '#555',
    fontSize: 14,
    lineHeight: 20,
  },
  modalContent: {
    flex: 1,
    padding: 25,
    backgroundColor: '#fff',
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 18,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '600',
  },
  createEventButton: {
    backgroundColor: '#3498db',
  },
  createEventButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
}); 