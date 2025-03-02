import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

export default function EventsScreen() {
  const [events, setEvents] = useState([]);        // list of event objects
  const [modalVisible, setModalVisible] = useState(false);  // controls the "New Event" modal
  const [newEvent, setNewEvent] = useState({       // form state for a new event
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
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }
    } catch (e) {
      console.log('Failed to load events');
    }
  };

  const saveEvents = async (updatedEvents) => {
    try {
      await AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
      setEvents(updatedEvents);
    } catch (e) {
      console.log('Failed to save events');
    }
  };

  const handleCreateEvent = () => {
    // Create a new event object with formatted date
    const eventToAdd = {
      ...newEvent,
      id: Date.now().toString(),  // unique ID based on timestamp
      date: format(newEvent.date, 'MMM dd, yyyy HH:mm')  // format date to a readable string
    };
    const updatedEvents = [...events, eventToAdd];
    saveEvents(updatedEvents);
    // reset form and close modal
    setNewEvent({ title: '', date: new Date(), location: '', description: '' });
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Button to open modal for new event */}
      <Button title="Add Event" onPress={() => setModalVisible(true)} />
      
      {/* Events list */}
      {events.length === 0 ? (
        <Text style={styles.emptyText}>No events yet. Add an event!</Text>
      ) : (
        <FlatList 
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text>{item.date} - {item.location}</Text>
              <Text>{item.description}</Text>
            </View>
          )}
        />
      )}

      {/* Modal for adding a new event */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>New Event</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Event Title" 
            value={newEvent.title}
            onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
          />
          {/* For date, simply inputting text for simplicity or use default current date */}
          <TextInput 
            style={styles.input} 
            placeholder="Date & Time" 
            value={ format(newEvent.date, 'MMM dd, yyyy HH:mm') }
            onChangeText={(text) => {
              // Note: in a real app, you'd use a DatePicker. Here we won't parse text to date.
              setNewEvent({ ...newEvent, date: new Date() });
            }}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Location" 
            value={newEvent.location}
            onChangeText={(text) => setNewEvent({ ...newEvent, location: text })}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Description" 
            value={newEvent.description}
            onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
          />
          <Button 
            title="Create Event" 
            onPress={handleCreateEvent}
            disabled={!newEvent.title || !newEvent.location}
          />
          <Button title="Cancel" color="#888" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  emptyText: { marginTop: 20, textAlign: 'center', fontStyle: 'italic' },
  eventCard: { 
    backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 8 
  },
  eventTitle: { fontSize: 18, fontWeight: '600' },
  modalContainer: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f9f9f9' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 5, marginBottom: 10 }
});
