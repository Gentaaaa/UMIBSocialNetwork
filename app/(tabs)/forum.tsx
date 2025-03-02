import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

// Define interfaces for type safety
interface Comment {
  id: string;
  content: string;
  author: string;
  timestamp: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  comments: Comment[];
}

export default function ForumScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const savedPosts = await AsyncStorage.getItem('forumPosts');
      if (savedPosts) {
        setPosts(JSON.parse(savedPosts));
      }
    } catch (e) {
      console.log('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const savePosts = async (updatedPosts: Post[]) => {
    try {
      await AsyncStorage.setItem('forumPosts', JSON.stringify(updatedPosts));
      setPosts(updatedPosts);
    } catch (e) {
      console.log('Failed to save posts');
    }
  };

  const createPost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      return; // Basic validation
    }
    
    const newPostObj: Post = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      author: 'Current User', // This would ideally come from auth
      timestamp: format(new Date(), 'MMM dd, yyyy HH:mm'),
      comments: []
    };
    
    const updatedPosts = [newPostObj, ...posts]; // Add new post at the top
    savePosts(updatedPosts);
    setNewPost({ title: '', content: '' });
    
    // Navigate to the post detail using Expo Router
    router.push(`/post/${newPostObj.id}`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community Forum</Text>
      </View>
      
      {/* New Post form */}
      <View style={styles.newPostContainer}>
        <Text style={styles.newPostTitle}>Create a Post</Text>
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
        <TouchableOpacity 
          style={[
            styles.createPostButton,
            (!newPost.title.trim() || !newPost.content.trim()) && styles.createPostButtonDisabled
          ]}
          onPress={createPost}
          disabled={!newPost.title.trim() || !newPost.content.trim()}
        >
          <Text style={styles.createPostButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* Posts list */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.postCard}
            onPress={() => router.push(`/post/${item.id}`)}
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
            <View style={styles.postFooter}>
              <Ionicons name="chatbubble-outline" size={16} color="#2196F3" />
              <Text style={styles.commentsCount}>
                {item.comments.length} comment{item.comments.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No posts yet</Text>
            <Text style={styles.emptyStateSubtext}>Be the first to start a discussion!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  newPostContainer: {
    margin: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newPostTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  contentInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  createPostButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  createPostButtonDisabled: {
    backgroundColor: '#a0cdf0',
  },
  createPostButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  postMeta: {
    color: '#666',
    fontSize: 12,
    marginBottom: 8,
  },
  postContent: {
    color: '#444',
    lineHeight: 20,
    marginBottom: 10,
    fontSize: 14,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentsCount: {
    color: '#2196F3',
    fontSize: 14,
    marginLeft: 5,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
}); 