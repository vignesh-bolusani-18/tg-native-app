/**
 * ⭐ AGENT CONSTANTS - Constants for AI agent
 */

export const WORKFLOW_STEPS = {
  IDLE: 'idle',
  UPLOAD_DATA: 'upload_data',
  TAG_COLUMNS: 'tag_columns',
  ANSWER_QUESTIONS: 'answer_questions',
  APPROVE_SUGGESTIONS: 'approve_suggestions',
  EXECUTE: 'execute',
  COMPLETED: 'completed',
};

export const MESSAGE_TYPES = {
  USER: 'user',
  AI: 'ai',
  SYSTEM: 'system',
};

export const EXPERIMENT_TYPES = {
  FORECASTING: 'forecasting',
  CLASSIFICATION: 'classification',
  REGRESSION: 'regression',
  CLUSTERING: 'clustering',
};

// 🔵 ADD MORE CONSTANTS HERE

export default {
  WORKFLOW_STEPS,
  MESSAGE_TYPES,
  EXPERIMENT_TYPES,
};
