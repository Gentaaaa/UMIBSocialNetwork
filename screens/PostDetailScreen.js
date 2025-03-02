import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

export default function PostDetailScreen({ route, navigation }) {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    loadPost();
  }, []);

  const loadPost = async () => {
    try {
      const savedPosts = await AsyncStorage.getItem('forumPosts');
      if (savedPosts) {
        const postsArray = JSON.parse(savedPosts);
        const foundPost = postsArray.find(p => p.id === postId);
        setPost(foundPost || null);
      }
    } catch (e) {
      console.log('Failed to load post');
    }
  };

  const addComment = async () => {
    if (!commentText.trim()) return; // don't add empty comment
    try {
      const savedPosts = await AsyncStorage.getItem('forumPosts');
      let postsArray = JSON.parse(savedPosts) || [];
      // Append the new comment to the post's comments array
      const updatedPosts = postsArray.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [
              {
                id: Date.now().toString(),
                content: commentText,
                author: 'Current User',
                timestamp: format(new Date(), 'MMM dd, yyyy HH:mm')
              },
              ...p.comments
            ]
          };
        }
        return p;
      });
      // Save updated posts list and update local state
      await AsyncStorage.setItem('forumPosts', JSON.stringify(updatedPosts));
      const updatedPost = updatedPosts.find(p => p.id === postId);
      setPost(updatedPost);
      setCommentText('');
    } catch (e) {
      console.log('Failed to add comment');
    }
  };

  if (!post) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      {/* Post content */}
      <View style={styles.postContainer}>
        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postMeta}>{post.author} · {post.timestamp}</Text>
        <Text style={styles.postContent}>{post.content}</Text>
      </View>
      {/* New comment input */}
      <TextInput
        style={styles.commentInput}
        placeholder="Write a comment..."
        value={commentText}
        onChangeText={setCommentText}
        onSubmitEditing={addComment}  // allow submitting via keyboard
        multiline
      />
      {/* Comments list */}
      <FlatList
        data={post.comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.commentCard}>
            <Text style={styles.commentAuthor}>{item.author}</Text>
            <Text style={styles.commentContent}>{item.content}</Text>
            <Text style={styles.commentTime}>{item.timestamp}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No comments yet. Be the first to comment!</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  postContainer: {
    backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15
  },
  postTitle: { fontSize: 20, fontWeight: '600', marginBottom: 5 },
  postMeta: { fontSize: 12, color: '#666', marginBottom: 10 },
  postContent: { fontSize: 16, lineHeight: 22, color: '#333' },
  commentInput: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 25,
    padding: 12, marginBottom: 15
  },
  commentCard: {
    backgroundColor: '#f8f9fa', borderRadius: 10, padding: 10, marginBottom: 10
  },
  commentAuthor: { fontWeight: '500', marginBottom: 2 },
  commentContent: { color: '#444', marginBottom: 2 },
  commentTime: { fontSize: 11, color: '#666' }
});
