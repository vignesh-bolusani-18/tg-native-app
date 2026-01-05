/**
 * ⭐ ERROR DISPLAY - Show errors gracefully
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ErrorDisplay({ error, onRetry }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{error}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>🔄 Try Again</Text>
        </TouchableOpacity>
      )}
      {/* 🔵 ADD YOUR ERROR HANDLING HERE */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 30, alignItems: 'center', backgroundColor: '#fff3cd', borderRadius: 10, margin: 15 },
  emoji: { fontSize: 48, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  message: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 15 },
  retryButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, paddingHorizontal: 20 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
