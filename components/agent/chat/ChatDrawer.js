/**
 * ⭐ CHAT DRAWER - Side drawer for conversations
 */

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ChatDrawer({ visible, onClose }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>💬 Conversations</Text>
      <TouchableOpacity style={styles.newButton}>
        <Text style={styles.newButtonText}>➕ New Chat</Text>
      </TouchableOpacity>
      {/* 🔵 ADD YOUR DRAWER CONTENT HERE */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  newButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  newButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
