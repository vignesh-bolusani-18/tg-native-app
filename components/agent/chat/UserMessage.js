/**
 * 👤 USER MESSAGE - Display user messages
 * Source: D:\TrueGradient\tg-application\src\components\VibeGradient\UserMessage.js
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function UserMessage({ message, isLastMessage }) {
  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{message.content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  bubble: {
    maxWidth: '80%',
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    padding: 12,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 14,
    lineHeight: 19.6,
    fontWeight: '400',
    color: '#000000',
  },
});
