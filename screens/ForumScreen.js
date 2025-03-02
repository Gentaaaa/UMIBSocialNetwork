import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';

export default function ForumScreen() {
  const navigation = useNavigation();
  const [posts, setPosts] = useState([]);  // list of forum posts
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const savedPosts = await AsyncStorage.getItem('forumPosts');
      if (savedPosts) {
        setPosts(JSON.parse(savedPosts));
      }
    } catch (e) {
      console.log('Failed to load posts');
    }
  };

  const savePosts = async (updatedPosts) => {
    try {
      await AsyncStorage.setItem('forumPosts', JSON.stringify(updatedPosts));
      setPosts(updatedPosts);
    } catch (e) {
      console.log('Failed to save posts');
    }
  };

  const createPost = () => {
    if (!newPost.title || !newPost.content) return;  // basic validation
    const newPostObj = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      author: 'Current User',
      timestamp: format(new Date(), 'MMM dd, yyyy HH:mm'),
      comments: []  // start with no comments
    };
    const updatedPosts = [ newPostObj, ...posts ];  // add new post to the top
    savePosts(updatedPosts);
    setNewPost({ title: '', content: '' });
    // Navigate to PostDetail screen to view the newly created post
    navigation.navigate('PostDetail', { postId: newPostObj.id });
  };

  return (
    <View style={styles.container}>
      {/* New Post form */}
      <View style={styles.newPostContainer}>
        <TextInput
          style={styles.input}
          placeholder="Post Title"
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
        <Button 
          title="Create Post" 
          onPress={createPost} 
          disabled={!newPost.title || !newPost.content}
        />
      </View>

      {/* Posts list */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.postCard}
            onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
          >
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postMeta}>
              {item.author} · {item.timestamp}
            </Text>
            <Text 
              numberOfLines={2} 
              style={styles.postContent}
            >
              {item.content}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No posts yet. Start a discussion above!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  newPostContainer: { marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginBottom: 10 },
  contentInput: { height: 60 },  // bigger input for content
  postCard: { 
    backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10 
  },
  postTitle: { fontSize: 18, fontWeight: '600', marginBottom: 5 },
  postMeta: { fontSize: 12, color: '#666', marginBottom: 5 },
  postContent: { fontSize: 14, color: '#333' },
  emptyText: { textAlign: 'center', marginTop: 20, fontStyle: 'italic' }
});
