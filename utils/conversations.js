/**
 * Conversation Management Utilities
 * Follows tg-application pattern: JWT-signed conversation endpoints with ?t= query params
 */

import { apiConfig } from './apiConfig';
import { generateToken } from './jwtUtils';

const getHeaders = (token) => {
  if (!apiConfig.apiKey) {
    console.warn("⚠️ Warning: API Key is missing in apiConfig. Check your .env file.");
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'x-api-key': apiConfig.apiKey,
  };
};

/**
 * POST /conversation?t=
 * Create a new conversation with JWT-encoded payload
 */
export const createConversation = async ({ token, userID, companyID, conversationID, conversation_name = 'New Chat', messageCount = 0, workflowsUsed = [], experiments = [] }) => {
  try {
    const timestamp = Date.now();
    
    // Build conversation data token payload
    const conversationDataToken = await generateToken({
      conversationID,
      userID,
      companyID,
      conversation_name,
      createdAt: timestamp,
      updatedAt: timestamp,
      messageCount,
      workflowsUsed,
      experiments,
    }, token);

    const url = `${apiConfig.apiBaseURL}/conversation?t=${timestamp}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ conversationDataToken }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create conversation: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

/**
 * DELETE /conversation?deleteConversationToken=...&t=
 * Delete a conversation using JWT-encoded payload
 */
export const deleteConversation = async ({ token, conversationID, userID, companyID }) => {
  try {
    const timestamp = Date.now();
    
    // Build delete conversation token payload
    const deleteConversationToken = await generateToken({
      conversationID,
      userID,
      companyID,
    }, token);

    const url = `${apiConfig.apiBaseURL}/conversation?deleteConversationToken=${encodeURIComponent(deleteConversationToken)}&t=${timestamp}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(token),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete conversation: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

/**
 * POST /renameConversation?t=
 * Rename a conversation using JWT-encoded payload
 */
export const renameConversation = async ({ token, conversationID, userID, companyID, title }) => {
  try {
    const timestamp = Date.now();
    
    // Build rename conversation token payload
    const conversationDataToken = await generateToken({
      conversationID,
      userID,
      companyID,
      conversation_name: title,
    }, token);

    const url = `${apiConfig.apiBaseURL}/renameConversation?t=${timestamp}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ conversationDataToken }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to rename conversation: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error renaming conversation:', error);
    throw error;
  }
};

/**
 * GET /conversationByCompany?t=&sendHash=true
 * Fetch all conversations for the company from token
 */
export const getConversationsByCompany = async ({ token }) => {
  try {
    const timestamp = Date.now();
    const url = `${apiConfig.apiBaseURL}/conversationByCompany?t=${timestamp}&sendHash=true`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(token),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch conversations by company: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('getConversationsByCompany:', error.message);
    throw error;
  }
};

/**
 * GET /conversationByUser?t=
 * Fetch all conversations for the user from token
 */
export const getConversations = async ({ token }) => {
  try {
    const timestamp = Date.now();
    const url = `${apiConfig.apiBaseURL}/conversationByUser?t=${timestamp}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(token),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch conversations: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
};

/**
 * GET /conversations/any?t=
 * Fetch all conversations (any user/company)
 */
export const getAllConversations = async ({ token }) => {
  try {
    const timestamp = Date.now();
    const url = `${apiConfig.apiBaseURL}/conversations/any?t=${timestamp}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(token),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch all conversations: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting all conversations:', error);
    throw error;
  }
};
