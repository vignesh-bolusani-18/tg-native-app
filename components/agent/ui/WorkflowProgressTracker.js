/**
 * ⭐ WORKFLOW PROGRESS TRACKER - Visual workflow steps with progress indication
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function WorkflowProgressTracker({ 
  currentStep, 
  totalSteps, 
  workflowName, 
  currentStepName,
  determinedModule 
}) {
  // Define workflow steps based on typical workflow
  const workflowSteps = [
    { name: 'Upload', icon: 'cloud-upload' },
    { name: 'Tag', icon: 'tag' },
    { name: 'Questions', icon: 'help-circle' },
    { name: 'Approve', icon: 'check-circle' },
    { name: 'Execute', icon: 'play-circle' },
  ];
  
  // Use provided steps or default
  const steps = workflowSteps;
  const activeStep = Math.min(currentStep || 1, steps.length) - 1;
  
  console.log('📊 [WorkflowProgress] Rendering:', { currentStep, totalSteps, currentStepName, activeStep });
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="progress-check" size={20} color="#3B82F6" />
          <Text style={styles.title}>
            {workflowName || 'Workflow'}
            {determinedModule && ` - ${determinedModule}`}
          </Text>
        </View>
        {currentStepName && (
          <Text style={styles.currentStepName}>{currentStepName}</Text>
        )}
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.stepsScrollContainer}
      >
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => {
            const isCompleted = index < activeStep;
            const isActive = index === activeStep;
            const isUpcoming = index > activeStep;
            
            return (
              <React.Fragment key={index}>
                <View style={styles.step}>
                  <View style={[
                    styles.stepCircle,
                    isCompleted && styles.stepCompleted,
                    isActive && styles.stepActive,
                    isUpcoming && styles.stepUpcoming,
                  ]}>
                    {isCompleted ? (
                      <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
                    ) : isActive ? (
                      <MaterialCommunityIcons name={step.icon} size={18} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.stepNumber}>{index + 1}</Text>
                    )}
                  </View>
                  <Text style={[
                    styles.stepLabel,
                    isActive && styles.stepLabelActive,
                    isCompleted && styles.stepLabelCompleted,
                  ]}>
                    {step.name}
                  </Text>
                </View>
                {index < steps.length - 1 && (
                  <View style={[
                    styles.connector,
                    isCompleted && styles.connectorCompleted,
                  ]} />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>
      
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${((activeStep + 1) / steps.length) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#1F2937',
    marginLeft: 4,
  },
  currentStepName: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  stepsScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stepsContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
    minWidth: '100%',
  },
  step: { 
    alignItems: 'center',
    marginHorizontal: 4,
  },
  stepCircle: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#E5E7EB', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  stepCompleted: { 
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  stepActive: { 
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
  },
  stepUpcoming: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  stepNumber: { 
    color: '#9CA3AF', 
    fontWeight: '600',
    fontSize: 14,
  },
  stepLabel: { 
    fontSize: 11, 
    textAlign: 'center',
    color: '#6B7280',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: '#1F2937',
    fontWeight: '600',
  },
  stepLabelCompleted: {
    color: '#059669',
  },
  connector: {
    width: 32,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
    marginBottom: 30,
  },
  connectorCompleted: {
    backgroundColor: '#10B981',
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: '#F3F4F6',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
});
