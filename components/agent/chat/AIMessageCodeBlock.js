/**
 * ⭐ AI MESSAGE CODE BLOCK - Code snippet display
 */

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AIMessageCodeBlock({ code, language }) {
  return (
    <View style={styles.container}>
      <Text style={styles.language}>{language || 'code'}</Text>
      <Text style={styles.code}>{code}</Text>
      <TouchableOpacity style={styles.copyButton}>
        <Text style={styles.copyText}>📋 Copy</Text>
      </TouchableOpacity>
      {/* 🔵 ADD YOUR CODE HIGHLIGHTING HERE */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#1e1e1e', borderRadius: 8, padding: 15, marginVertical: 5 },
  language: { color: '#4EC9B0', fontSize: 12, marginBottom: 5 },
  code: { color: '#D4D4D4', fontFamily: 'monospace', fontSize: 14 },
  copyButton: { marginTop: 10, alignSelf: 'flex-end' },
  copyText: { color: '#569CD6', fontSize: 12 },
});
