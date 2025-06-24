import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Pressable,
  Image,
  useColorScheme,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

export default function EventsScreen() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: new Date(),
    location: '',
    description: '',
    image: null,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const theme = useColorScheme();

  useEffect(() => {
    loadEvents();
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    let data = [...events];
    if (searchQuery) {
      data = data.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (sortBy === 'date') {
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'title') {
      data.sort((a, b) => a.title.localeCompare(b.title));
    }
    setFilteredEvents(data);
  }, [searchQuery, events, sortBy]);

  const loadEvents = async () => {
    const saved = await AsyncStorage.getItem('events');
    if (saved) {
      const parsed = JSON.parse(saved);
      setEvents(parsed);
    }
  };

  const saveEvents = async (updated) => {
    await AsyncStorage.setItem('events', JSON.stringify(updated));
    setEvents(updated);
  };

  const handleCreateEvent = async () => {
    const newEntry = {
      ...newEvent,
      id: Date.now().toString(),
      date: format(newEvent.date, 'MMM dd, yyyy HH:mm'),
    };
    const updated = [newEntry, ...events];
    await saveEvents(updated);
    setModalVisible(false);
    setNewEvent({ title: '', date: new Date(), location: '', description: '', image: null });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Upcoming: ${newEntry.title}`,
        body: `At ${newEntry.location} on ${newEntry.date}`,
      },
      trigger: { seconds: 5 },
    });
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.5,
    });
    if (!result.canceled) {
      setNewEvent({ ...newEvent, image: result.assets[0].uri });
    }
  };

  const deleteEvent = (id) => {
    Alert.alert('Delete event?', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = events.filter(e => e.id !== id);
          await saveEvents(updated);
        },
      },
    ]);
  };

  const isDark = theme === 'dark';
  const styles = getStyles(isDark);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Campus Events</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Text style={styles.addIcon}>＋</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={isDark ? '#999' : '#666'}
        />
        <TouchableOpacity onPress={() => setSortBy(sortBy === 'date' ? 'title' : 'date')}>
          <Text style={styles.sortText}>Sort: {sortBy}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image && <Image source={{ uri: item.image }} style={styles.eventImage} />}
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>📅 {item.date}</Text>
            <Text style={styles.meta}>📍 {item.location}</Text>
            <Text style={styles.desc}>{item.description}</Text>
            <TouchableOpacity onPress={() => deleteEvent(item.id)} style={styles.deleteButton}>
              <Text style={styles.deleteText}>🗑 Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>Create New Event</Text>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={newEvent.title}
            onChangeText={(t) => setNewEvent({ ...newEvent, title: t })}
          />
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={newEvent.location}
            onChangeText={(t) => setNewEvent({ ...newEvent, location: t })}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={newEvent.description}
            onChangeText={(t) => setNewEvent({ ...newEvent, description: t })}
            multiline
          />
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.mediaButton}>
            <Text style={styles.mediaText}>📅 Pick Date</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={newEvent.date}
              mode="datetime"
              display="default"
              onChange={(e, date) => {
                setShowDatePicker(false);
                if (date) {
                  setNewEvent({ ...newEvent, date });
                }
              }}
            />
          )}
          <TouchableOpacity onPress={pickImage} style={styles.mediaButton}>
            <Text style={styles.mediaText}>📸 Upload Media</Text>
          </TouchableOpacity>
          <View style={styles.buttonRow}>
            <Pressable onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleCreateEvent} style={styles.saveBtn}>
              <Text style={styles.saveText}>Create</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (dark) => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: dark ? '#000' : '#f4f4f4' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  header: { fontSize: 22, fontWeight: 'bold', color: dark ? '#fff' : '#000' },
  addButton: { backgroundColor: '#007AFF', padding: 8, borderRadius: 8 },
  addIcon: { color: 'white', fontSize: 20 },
  controlRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, backgroundColor: dark ? '#222' : '#fff', color: dark ? '#fff' : '#000' },
  sortText: { marginLeft: 10, fontSize: 14, color: '#007AFF' },
  card: { backgroundColor: dark ? '#1e1e1e' : 'white', borderRadius: 10, padding: 15, marginBottom: 12 },
  eventImage: { width: '100%', height: 180, borderRadius: 10, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 4, color: dark ? '#fff' : '#000' },
  meta: { color: '#888', fontSize: 13, marginBottom: 2 },
  desc: { color: dark ? '#ccc' : '#444', fontSize: 14, marginTop: 6 },
  modalContent: { flex: 1, padding: 20, backgroundColor: dark ? '#000' : '#fff' },
  modalHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: dark ? '#fff' : '#000' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: dark ? '#222' : '#fff', color: dark ? '#fff' : '#000' },
  mediaButton: { backgroundColor: '#eee', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  mediaText: { fontSize: 14 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: { backgroundColor: '#ccc', padding: 12, borderRadius: 8 },
  cancelText: { fontWeight: '600', color: '#333' },
  saveBtn: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8 },
  saveText: { fontWeight: '600', color: 'white' },
  deleteButton: { marginTop: 10, alignSelf: 'flex-end', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#ff3b30', borderRadius: 6 },
  deleteText: { color: 'white', fontWeight: '600' },
});

async function registerForPushNotificationsAsync() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission for notifications was denied');
  }
}
