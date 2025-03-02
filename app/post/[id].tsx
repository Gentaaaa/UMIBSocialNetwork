import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, router } from 'expo-router';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

// Define interfaces
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

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    setIsLoading(true);
    try {
      const savedPosts = await AsyncStorage.getItem('forumPosts');
      if (savedPosts) {
        const posts = JSON.parse(savedPosts);
        const foundPost = posts.find((p: Post) => p.id === id);
        setPost(foundPost);
      }
    } catch (e) {
      console.log('Failed to load post');
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async () => {
    if (!comment.trim() || !post) return;
    
    try {
      const savedPosts = await AsyncStorage.getItem('forumPosts');
      if (!savedPosts) return;
      
      const posts: Post[] = JSON.parse(savedPosts);
      const updatedPosts = posts.map(p => {
        if (p.id === id) {
          const newComment: Comment = {
            id: Date.now().toString(),
            content: comment,
            author: 'Current User', // Would come from auth system
            timestamp: format(new Date(), 'MMM dd, yyyy HH:mm')
          };
          
          return {
            ...p,
            comments: [newComment, ...p.comments]
          };
        }
        return p;
      });
      
      await AsyncStorage.setItem('forumPosts', JSON.stringify(updatedPosts));
      setPost(updatedPosts.find(p => p.id === id) || null);
      setComment('');
    } catch (e) {
      console.log('Failed to add comment');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Post not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Return to Forum</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonSmall}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Details</Text>
      </View>
      
      <FlatList
        data={post.comments}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.postContainer}>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postMeta}>{post.author} · {post.timestamp}</Text>
            <Text style={styles.postContent}>{post.content}</Text>
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>
                Comments ({post.comments.length})
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.commentCard}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentAuthor}>{item.author}</Text>
              <Text style={styles.commentTime}>{item.timestamp}</Text>
            </View>
            <Text style={styles.commentContent}>{item.content}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCommentsContainer}>
            <Text style={styles.emptyCommentsText}>No comments yet. Be the first to comment!</Text>
          </View>
        }
      />
      
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Write a comment..."
          value={comment}
          onChangeText={setComment}
          multiline
        />
        <TouchableOpacity
          style={[styles.commentButton, !comment.trim() && styles.commentButtonDisabled]}
          onPress={addComment}
          disabled={!comment.trim()}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButtonSmall: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  postContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    margin: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  postMeta: {
    color: '#666',
    fontSize: 14,
    marginBottom: 12,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 20,
  },
  commentsHeader: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
    marginTop: 5,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  commentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthor: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
  },
  commentTime: {
    color: '#888',
    fontSize: 12,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    padding: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
    maxHeight: 100,
  },
  commentButton: {
    backgroundColor: '#3498db',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentButtonDisabled: {
    backgroundColor: '#a0cdf0',
  },
  emptyCommentsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyCommentsText: {
    color: '#666',
    fontStyle: 'italic',
  },
}); 