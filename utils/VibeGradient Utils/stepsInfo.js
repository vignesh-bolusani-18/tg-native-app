/**
 * Workflow Steps Information
 */

export const getStepInfo = (currentStep) => {
  const steps = {
    data_upload: {
      title: '📤 Data Upload',
      description: 'Upload your dataset',
      icon: 'upload',
      color: '#3b82f6',
    },
    tags_assignment: {
      title: '🏷️ Tag Assignment',
      description: 'Assign tags to columns',
      icon: 'tag',
      color: '#8b5cf6',
    },
    context_questions: {
      title: '❓ Context Questions',
      description: 'Answer configuration questions',
      icon: 'help-circle',
      color: '#06b6d4',
    },
    advanced_questions: {
      title: '⚙️ Advanced Configuration',
      description: 'Advanced settings',
      icon: 'settings',
      color: '#f59e0b',
    },
    approval: {
      title: '✅ Approval',
      description: 'Review and approve',
      icon: 'check-circle',
      color: '#10b981',
    },
    execution: {
      title: '🚀 Execution',
      description: 'Running experiment',
      icon: 'rocket',
      color: '#ef4444',
    },
  };

  return steps[currentStep] || {
    title: '🔄 Processing',
    description: 'Working...',
    icon: 'progress-clock',
    color: '#64748b',
  };
};

export const getAllSteps = () => [
  'data_upload',
  'tags_assignment',
  'context_questions',
  'advanced_questions',
  'approval',
  'execution',
];

export const getStepNumber = (step) => {
  const steps = getAllSteps();
  return steps.indexOf(step) + 1;
};

export default {
  getStepInfo,
  getAllSteps,
  getStepNumber,
};
