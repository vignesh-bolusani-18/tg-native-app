/**
 * 👤 USER MESSAGE - Display user messages
 * Styled to match tg-application with right-aligned bubble
 */

import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function UserMessage({ message, isLastMessage }) {
  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{message.content}</Text>
      </View>
      {/* User Avatar */}
      <View style={styles.avatar}>
        <MaterialIcons name="person" size={16} color="#6b7280" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 8,
    gap: 8,
  },
  bubble: {
    maxWidth: '75%',
    backgroundColor: '#2563eb', // Blue background like tg-application
    borderRadius: 18,
    borderBottomRightRadius: 4, // Tail effect
    padding: 12,
    paddingHorizontal: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: '#ffffff', // White text on blue
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
