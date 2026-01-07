/**
 * Conversation Persistence Utility
 * Auto-saves conversation state to S3 after each message interaction
 */

import { uploadJsonToS3 } from './s3Utils';

let saveTimeout = null;
const SAVE_DELAY = 500; // Debounce by 500ms to avoid excessive S3 writes

/**
 * Save conversation state to S3
 * @param {object} conversation - The conversation object from Redux
 * @param {object} currentCompany - Current company info (companyName, companyID)
 * @returns {Promise<void>}
 */
export const saveConversationToS3 = async (conversation, currentCompany) => {
  if (!conversation || !currentCompany) {
    console.log('⏭️ Skipping S3 save - missing conversation or company');
    return;
  }

  const { id: conversationID, messages = [], messageCount, title, workflowName, experiments = {}, updatedAt } = conversation;

  if (!conversationID) {
    console.log('⏭️ Skipping S3 save - no conversation ID');
    return;
  }

  // Build S3 path following tg-application pattern
  const conversationPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/conversations/${conversationID}/conversation_state.json`;

  // Build conversation state payload
  const conversationState = {
    conversationID,
    conversation_name: title || 'New Chat',
    workflowName: workflowName || 'default_workflow',
    messageCount: messageCount || messages.length,
    messages: messages.map((msg, index) => ({
      id: msg.id,
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp,
      data: msg.data || null,
      toolCalls: msg.toolCalls || [],
      conversationIndex: index,
    })),
    experiments,
    updatedAt: updatedAt || new Date().toISOString(),
  };

  try {
    console.log(`💾 Saving conversation to S3: ${conversationPath}`);
    console.log(`   Messages: ${conversationState.messageCount}, Title: ${conversationState.conversation_name}`);
    
    await uploadJsonToS3(conversationPath, conversationState);
    
    console.log('✅ Conversation saved to S3 successfully');
  } catch (error) {
    console.error('❌ Failed to save conversation to S3:', error);
    // Don't throw - saving to S3 is a background operation, failure shouldn't block user
  }
};

/**
 * Debounced save - prevents excessive S3 writes when messages arrive rapidly
 * @param {object} conversation 
 * @param {object} currentCompany 
 */
export const debouncedSaveConversation = (conversation, currentCompany) => {
  // Clear any pending save
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  // Schedule new save after delay
  saveTimeout = setTimeout(() => {
    saveConversationToS3(conversation, currentCompany);
  }, SAVE_DELAY);
};

/**
 * Force immediate save (for critical operations like conversation close)
 */
export const forceSaveConversation = async (conversation, currentCompany) => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  return await saveConversationToS3(conversation, currentCompany);
};

export default {
  saveConversationToS3,
  debouncedSaveConversation,
  forceSaveConversation,
};
