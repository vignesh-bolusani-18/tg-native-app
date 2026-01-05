/**
 * ⭐ ADVANCED QUESTIONS SECTION - Detailed configuration
 */

import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function AdvancedQuestionsSection({ onAnswer }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔬 Advanced Configuration</Text>
      <Text style={styles.label}>Model Parameters</Text>
      <TextInput style={styles.input} placeholder="Set parameters..." />
      {/* 🔵 ADD YOUR ADVANCED OPTIONS HERE */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: '#f9f9f9', borderRadius: 10, marginVertical: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  label: { fontSize: 14, marginBottom: 5, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 15 },
});
