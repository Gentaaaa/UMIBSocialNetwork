// ForumScreen.js - updated with navigation to PostDetailScreen

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';

export default function ForumScreen() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', media: null });
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState('Anonymous');
  const [expandedPosts, setExpandedPosts] = useState({});
  const colorScheme = useColorScheme();
  const navigation = useNavigation();

  useEffect(() => {
    loadUser();
    loadPosts();
    registerForPushNotificationsAsync();
  }, []);

  const loadUser = async () => {
    const user = await AsyncStorage.getItem('userProfile');
    if (user) setCurrentUser(JSON.parse(user).name);
  };

  const loadPosts = async () => {
    const saved = await AsyncStorage.getItem('forumPosts');
    if (saved) setPosts(JSON.parse(saved));
  };

  const savePosts = async (updated) => {
    await AsyncStorage.setItem('forumPosts', JSON.stringify(updated));
    setPosts(updated);
  };

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
    });
    if (!result.canceled) {
      setNewPost({ ...newPost, media: result.assets[0].uri });
    }
  };

  const createPost = async () => {
    const newEntry = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      author: currentUser,
      timestamp: format(new Date(), 'MMM dd, yyyy HH:mm'),
      comments: [],
      likes: {},
      media: newPost.media,
    };
    const updated = [newEntry, ...posts];
    savePosts(updated);
    setNewPost({ title: '', content: '', media: null });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `📢 New post: ${newEntry.title}`,
        body: `${newEntry.content}`,
      },
      trigger: { seconds: 2 },
    });
  };

  const addComment = (postId) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;

    const updated = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [
            {
              id: Date.now().toString(),
              content: text,
              author: currentUser,
              timestamp: format(new Date(), 'MMM dd, yyyy HH:mm'),
              likes: {},
              replies: [],
            },
            ...p.comments,
          ],
        };
      }
      return p;
    });

    savePosts(updated);
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  const addReply = (postId, commentId) => {
    const text = replyInputs[commentId];
    if (!text?.trim()) return;

    const updated = posts.map((p) => {
      if (p.id === postId) {
        const comments = p.comments.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              replies: [
                ...c.replies,
                {
                  id: Date.now().toString(),
                  content: text,
                  author: currentUser,
                  timestamp: format(new Date(), 'MMM dd, yyyy HH:mm'),
                },
              ],
            };
          }
          return c;
        });
        return { ...p, comments };
      }
      return p;
    });

    savePosts(updated);
    setReplyInputs({ ...replyInputs, [commentId]: '' });
  };

  const deleteComment = (postId, commentId) => {
    Alert.alert('Delete?', 'Are you sure you want to delete this comment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: () => {
          const updated = posts.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                comments: p.comments.filter((c) => c.id !== commentId),
              };
            }
            return p;
          });
          savePosts(updated);
        },
      },
    ]);
  };

  const toggleLike = (postId) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const liked = p.likes[currentUser];
        return {
          ...p,
          likes: { ...p.likes, [currentUser]: !liked },
        };
      }
      return p;
    });
    savePosts(updated);
  };

  const filteredPosts = posts.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, colorScheme === 'dark' && { backgroundColor: '#000' }]}>
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Search posts..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        contentContainerStyle={{ padding: 15 }}
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.newPostContainer}>
            <Text style={styles.header}>📝 New Post</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={newPost.title}
              onChangeText={(text) => setNewPost({ ...newPost, title: text })}
            />
            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="What's on your mind?"
              value={newPost.content}
              onChangeText={(text) => setNewPost({ ...newPost, content: text })}
              multiline
            />
            <TouchableOpacity onPress={pickMedia} style={styles.mediaButton}>
              <Text>📎 Add Image/Video</Text>
            </TouchableOpacity>
            {newPost.media && (
              <Image
                source={{ uri: newPost.media }}
                style={{ width: '100%', height: 180, marginTop: 10, borderRadius: 10 }}
              />
            )}
            <TouchableOpacity
              style={[styles.createButton, (!newPost.title || !newPost.content) && styles.disabledButton]}
              onPress={createPost}
              disabled={!newPost.title || !newPost.content}
            >
              <Text style={styles.createButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <TouchableOpacity onPress={() => navigation.navigate('PostDetail', { postId: item.id })}>
              <Text style={styles.postTitle}>{item.title}</Text>
            </TouchableOpacity>
            <Text style={styles.postMeta}>{item.author} · {item.timestamp}</Text>
            <Text style={styles.postContent}>{item.content}</Text>
            {item.media && (
              <Image source={{ uri: item.media }} style={{ width: '100%', height: 200, borderRadius: 10 }} />
            )}
            <TouchableOpacity onPress={() => toggleLike(item.id)}>
              <Text style={styles.likeText}>👍 {Object.values(item.likes).filter(Boolean).length}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

async function registerForPushNotificationsAsync() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission for notifications was denied');
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchInput: {
    marginTop: 10,
    marginHorizontal: 15,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  newPostContainer: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 20 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  contentInput: { height: 80 },
  mediaButton: { padding: 10, backgroundColor: '#eee', borderRadius: 8, alignItems: 'center' },
  createButton: { backgroundColor: '#007AFF', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  disabledButton: { backgroundColor: '#ccc' },
  createButtonText: { color: 'white', fontWeight: 'bold' },
  postCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 20 },
  postTitle: { fontSize: 18, fontWeight: 'bold' },
  postMeta: { color: '#666', fontSize: 12 },
  postContent: { marginVertical: 10, fontSize: 15 },
  likeText: { color: '#28a745', marginBottom: 10 },
});
