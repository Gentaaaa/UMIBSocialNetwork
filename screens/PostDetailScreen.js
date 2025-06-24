import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Share,
  useColorScheme,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { format } from 'date-fns';

export default function PostDetailScreen({ route }) {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [replyInputs, setReplyInputs] = useState({});
  const [currentUser, setCurrentUser] = useState('Anonymous');
  const [showAllComments, setShowAllComments] = useState(false);
  const [mediaUri, setMediaUri] = useState(null);
  const theme = useColorScheme();

  useEffect(() => {
    loadUser();
    loadPost();
  }, []);

  const loadUser = async () => {
    const user = await AsyncStorage.getItem('userProfile');
    if (user) setCurrentUser(JSON.parse(user).name);
  };

  const loadPost = async () => {
    const savedPosts = await AsyncStorage.getItem('forumPosts');
    if (savedPosts) {
      const posts = JSON.parse(savedPosts);
      const found = posts.find(p => p.id === postId);
      if (found) {
        // Ensure comments and replies are arrays
        found.comments = Array.isArray(found.comments) ? found.comments : [];
        found.comments = found.comments.map(c => ({
          ...c,
          replies: Array.isArray(c.replies) ? c.replies : [],
          likes: c.likes || {},
        }));
        setPost(found);
      }
    }
  };

  const savePost = async (updatedPost) => {
    const savedPosts = await AsyncStorage.getItem('forumPosts');
    let posts = JSON.parse(savedPosts);
    posts = posts.map(p => p.id === postId ? updatedPost : p);
    await AsyncStorage.setItem('forumPosts', JSON.stringify(posts));
    setPost(updatedPost);
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    const newComment = {
      id: Date.now().toString(),
      content: comment,
      author: currentUser,
      timestamp: format(new Date(), 'MMM dd, yyyy HH:mm'),
      replies: [],
      likes: {},
    };
    const updatedPost = {
      ...post,
      comments: [newComment, ...post.comments],
    };
    await savePost(updatedPost);
    setComment('');

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'New comment on your post',
        body: `${currentUser} commented: ${comment}`,
      },
      trigger: { seconds: 1 },
    });
  };

  const addReply = async (commentId) => {
    const text = replyInputs[commentId];
    if (!text?.trim()) return;

    const updatedComments = post.comments.map((c) => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...c.replies, {
            id: Date.now().toString(),
            content: text,
            author: currentUser,
            timestamp: format(new Date(), 'MMM dd, yyyy HH:mm'),
          }],
        };
      }
      return c;
    });
    const updatedPost = { ...post, comments: updatedComments };
    await savePost(updatedPost);
    setReplyInputs({ ...replyInputs, [commentId]: '' });
  };

  const toggleLikeComment = async (commentId) => {
    const updatedComments = post.comments.map(c => {
      if (c.id === commentId) {
        const liked = c.likes?.[currentUser];
        return { ...c, likes: { ...c.likes, [currentUser]: !liked } };
      }
      return c;
    });
    await savePost({ ...post, comments: updatedComments });
  };

  const deleteComment = (commentId) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes', onPress: async () => {
          const updatedPost = {
            ...post,
            comments: post.comments.filter(c => c.id !== commentId),
          };
          await savePost(updatedPost);
        }
      }
    ]);
  };

  const sharePost = async () => {
    try {
      await Share.share({
        message: `${post.title}\n\n${post.content}`,
      });
    } catch (err) {
      alert('Error sharing post.');
    }
  };

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All });
    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
    }
  };

  if (!post) return null;

  const commentsToShow = showAllComments ? post.comments : post.comments.slice(0, 2);
  const dark = theme === 'dark';
  const styles = getStyles(dark);

  return (
    <View style={styles.container}>
      <View style={styles.postContainer}>
        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postMeta}>{post.category || 'General'} · {post.author} · {post.timestamp}</Text>
        <Text style={styles.postContent}>{post.content}</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity onPress={sharePost}><Text style={styles.shareText}>🔗 Share</Text></TouchableOpacity>
          <TouchableOpacity onPress={pickMedia}><Text style={styles.shareText}>📎 Media</Text></TouchableOpacity>
        </View>
        {mediaUri && <Image source={{ uri: mediaUri }} style={styles.mediaPreview} />}
      </View>

      <TextInput
        style={styles.commentInput}
        placeholder="Write a comment..."
        value={comment}
        onChangeText={setComment}
        onSubmitEditing={addComment}
        multiline
        placeholderTextColor={dark ? '#aaa' : '#666'}
      />

      {commentsToShow.map(c => (
        <View key={c.id} style={styles.commentCard}>
          <Text style={styles.commentAuthor}>{c.author}</Text>
          <Text style={styles.commentContent}>{c.content}</Text>
          <Text style={styles.commentTime}>{c.timestamp}</Text>

          <TouchableOpacity onPress={() => toggleLikeComment(c.id)}>
            <Text style={styles.likeText}>👍 {Object.values(c.likes || {}).filter(Boolean).length}</Text>
          </TouchableOpacity>

          {c.author === currentUser && (
            <TouchableOpacity onPress={() => deleteComment(c.id)}>
              <Text style={styles.deleteText}>🗑 Delete</Text>
            </TouchableOpacity>
          )}

          {(c.replies || []).map(r => (
            <View key={r.id} style={styles.replyBox}>
              <Text style={styles.commentAuthor}>{r.author}</Text>
              <Text>{r.content}</Text>
              <Text style={styles.commentTime}>{r.timestamp}</Text>
            </View>
          ))}

          <TextInput
            style={styles.replyInput}
            placeholder="Reply..."
            value={replyInputs[c.id] || ''}
            onChangeText={(t) => setReplyInputs({ ...replyInputs, [c.id]: t })}
            onSubmitEditing={() => addReply(c.id)}
            placeholderTextColor={dark ? '#aaa' : '#666'}
          />
        </View>
      ))}

      {post.comments.length > 2 && (
        <TouchableOpacity onPress={() => setShowAllComments(prev => !prev)}>
          <Text style={styles.viewAll}>
            {showAllComments ? 'Hide comments' : `View all ${post.comments.length} comments`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const getStyles = (dark) => StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: dark ? '#000' : '#f9f9f9' },
  postContainer: { backgroundColor: dark ? '#1a1a1a' : '#fff', padding: 15, borderRadius: 10, marginBottom: 20 },
  postTitle: { fontSize: 20, fontWeight: '600', marginBottom: 5, color: dark ? '#fff' : '#000' },
  postMeta: { color: dark ? '#aaa' : '#666', fontSize: 12, marginBottom: 10 },
  postContent: { fontSize: 16, lineHeight: 22, color: dark ? '#ddd' : '#444' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  shareText: { color: '#007AFF', fontSize: 13 },
  mediaPreview: { width: '100%', height: 180, borderRadius: 10, marginTop: 10 },
  commentInput: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 25,
    padding: 15, marginBottom: 15, backgroundColor: dark ? '#222' : '#fff', color: dark ? '#fff' : '#000'
  },
  commentCard: {
    backgroundColor: dark ? '#111' : '#f8f9fa', borderRadius: 15, padding: 15, marginBottom: 10
  },
  commentAuthor: { fontWeight: '500', marginBottom: 4, color: dark ? '#fff' : '#000' },
  commentContent: { color: dark ? '#ccc' : '#444', marginBottom: 4 },
  commentTime: { color: '#888', fontSize: 12 },
  replyBox: { backgroundColor: dark ? '#333' : '#f1f1f1', padding: 10, borderRadius: 8, marginTop: 5 },
  replyInput: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 20,
    paddingHorizontal: 10, marginTop: 8, backgroundColor: dark ? '#222' : '#fff', color: dark ? '#fff' : '#000'
  },
  likeText: { color: '#28a745', marginTop: 4 },
  deleteText: { color: '#ff3b30', fontSize: 12, marginTop: 5 },
  viewAll: { color: '#007AFF', marginTop: 10, fontSize: 13 }
});
