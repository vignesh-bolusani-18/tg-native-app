/**
 * ⭐ ANALYSIS WORKFLOW INITIATOR - Start analysis workflow
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AnalysisWorkflowInitiator({ onStart }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔬 Start Analysis</Text>
      <TouchableOpacity style={styles.startButton} onPress={onStart}>
        <Text style={styles.startText}>▶️ Begin Workflow</Text>
      </TouchableOpacity>
      {/* 🔵 ADD YOUR INITIATOR CODE HERE */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: '#f9f9f9', borderRadius: 10, marginVertical: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  startButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center' },
  startText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
