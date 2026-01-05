/**
 * ⭐ WORKFLOW PROGRESS TRACKER - Visual workflow steps
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function WorkflowProgressTracker({ currentStep, steps }) {
  const defaultSteps = ['Upload', 'Tag', 'Questions', 'Approve', 'Execute'];
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔄 Workflow Steps</Text>
      <View style={styles.stepsContainer}>
        {defaultSteps.map((step, index) => (
          <View key={index} style={styles.step}>
            <View style={[styles.stepCircle, index === currentStep && styles.stepActive]}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
            </View>
            <Text style={styles.stepLabel}>{step}</Text>
          </View>
        ))}
      </View>
      {/* 🔵 ADD YOUR WORKFLOW VISUALIZATION HERE */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: '#f9f9f9', borderRadius: 10, marginVertical: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  stepsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  step: { alignItems: 'center' },
  stepCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  stepActive: { backgroundColor: '#007AFF' },
  stepNumber: { color: '#fff', fontWeight: 'bold' },
  stepLabel: { fontSize: 10, textAlign: 'center' },
});
