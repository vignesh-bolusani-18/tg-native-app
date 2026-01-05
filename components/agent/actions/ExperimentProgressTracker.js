/**
 * ⭐ EXPERIMENT PROGRESS TRACKER - Track experiment execution
 */

import { StyleSheet, Text, View } from 'react-native';

export default function ExperimentProgressTracker({ progress }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Progress</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress || 0}%` }]} />
      </View>
      <Text style={styles.progressText}>{progress || 0}% Complete</Text>
      {/* 🔵 ADD YOUR PROGRESS TRACKING HERE */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: '#f9f9f9', borderRadius: 10, marginVertical: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  progressBar: { height: 20, backgroundColor: '#e0e0e0', borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#4CAF50' },
  progressText: { marginTop: 8, textAlign: 'center', fontSize: 14, color: '#666' },
});
