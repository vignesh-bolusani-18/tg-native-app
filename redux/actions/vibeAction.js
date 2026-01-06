// D:\TG_REACT_NATIVE_MOBILE_APP\redux\actions\vibeAction.js

import { getExperimentById } from "../../utils/getExperiments";
import {
    addConversation,
    addMessage,
    addProgressUpdate,
    clearError,
    clearProgress,
    decrementCreditScore,
    loadConversations,
    removeConversation,
    selectConversation,
    setConnectionStatus,
    setCreditScore,
    setError,
    setExperimentData,
    setStreamingStatus,
    updateConversationName,
    updateLastMessage,
} from "../slices/vibeSlice";

import {
    createConversation,
    deleteConversation,
    getConversations,
    getConversationsByCompany,
  renameConversation,
} from "../../utils/conversations";
import { getCreditScore, updateCredits } from "../../utils/getAndUpdateCredits";
import { fetchJsonFromS3 } from "../../utils/s3Utils";

/**
 * Fetch current credit score and store in redux.
 * Normalizes response (API returns { companyID, credits } per spec).
 */
export const fetchCreditScoreAction = () => async (dispatch) => {
  try {
    const response = await getCreditScore();

    // API per spec returns { companyID, credits } OR number
    const normalized =
      typeof response === "number" ? response : response?.credits ?? null;

    if (normalized !== null) {
      dispatch(setCreditScore(normalized));
      return normalized;
    }

    // If API shape changed, return raw response
    return response;
  } catch (err) {
    console.error("fetchCreditScoreAction error:", err);
    throw err;
  }
};

export const decrementCreditsAction = (value) => async (dispatch) => {
  try {
    const resp = await updateCredits("decrease", value);
    // server per spec may return { companyID, credits } or something similar
    dispatch(decrementCreditScore(resp.value));
    return resp;
  } catch (err) {
    console.error("decrementCreditsAction error:", err);
    throw err;
  }
};

// Action Creators
export const sendMessage = (message) => (dispatch) => {
  const userMessage = {
    id: Date.now(),
    type: "user",
    content: message,
    timestamp: new Date().toISOString(),
  };

  dispatch(addMessage(userMessage));
  dispatch(clearProgress());
  dispatch(setStreamingStatus(true));
  dispatch(clearError());
};

export const receiveMessage =
  (message, toolCalls = []) =>
  (dispatch) => {
    const aiMessage = {
      id: Date.now(),
      type: "ai",
      content: message,
      timestamp: new Date().toISOString(),
      toolCalls: toolCalls, // Store minimal tool call info
    };

    console.log("Redux: Creating AI message and stopping streaming");
    dispatch(addMessage(aiMessage));
    dispatch(setStreamingStatus(false));
  };

export const updateProgress = (progressData) => (dispatch) => {
  dispatch(addProgressUpdate(progressData));
};

export const handleConnectionOpen = () => (dispatch) => {
  console.log("Redux: Setting connection status to true");
  dispatch(setConnectionStatus(true));
  dispatch(clearError());
};

export const handleConnectionClose = () => (dispatch) => {
  console.log("Redux: Setting connection status to false");
  dispatch(setConnectionStatus(false));
  dispatch(setStreamingStatus(false));
};

export const handleConnectionError = (error) => (dispatch) => {
  console.log("Redux: Connection error:", error);
  dispatch(setError(error));
  dispatch(setConnectionStatus(false));
  dispatch(setStreamingStatus(false));
};

// Action to fetch and store experiment data
export const fetchAndStoreExperimentData =
  (experimentId, currentCompany, userInfo) => async (dispatch) => {
    try {
      console.log("Fetching experiment data for:", experimentId);

      const response = await getExperimentById(
        { experimentID: experimentId },
        currentCompany
      );

      const experimentData = await response;
      console.log("Experiment data fetched:", experimentData);

      dispatch(setExperimentData({ experimentId, experimentData }));

      return experimentData;
    } catch (error) {
      console.error("Error fetching experiment data:", error);
      throw error;
    }
  };

// Thunk for WebSocket message handling
export const handleWebSocketMessage = (messageData) => (dispatch, getState) => {
  try {
    const data =
      typeof messageData === "string" ? JSON.parse(messageData) : messageData;

    // console.log("Processing WebSocket message:", data);

    // Check if we've already processed this exact message recently
    const currentState = getState();
    const lastMessage = currentState.vibe?.conversations?.[currentState.vibe.currentConversationId]?.lastMessage;

    if (
      lastMessage &&
      lastMessage.message_type === data.message_type &&
      lastMessage.message === data.message &&
      Math.abs(lastMessage.timestamp - data.timestamp) < 1000
    ) {
      console.log("Skipping duplicate message");
      return;
    }

    if (data.error) {
      dispatch(handleConnectionError(data.error));
      return;
    }

    // Update progress for streaming updates - exclude both final_result and final_answer
    if (
      data.message_type &&
      data.message_type !== "final_result" &&
      data.message_type !== "final_answer"
    ) {
      // console.log("Adding progress update:", data.message_type, data);
      dispatch(updateProgress(data));
    }

    // Handle final result - check for both final_result and final_answer
    if (
      data.message_type === "final_result" ||
      data.message_type === "final_answer"
    ) {
      console.log("Processing final result:", data.message);

      // Get current progress to extract tool calls
      const currentState = getState();
      const currentProgress = currentState.vibe.conversations[currentState.vibe.currentConversationId]?.currentProgress || [];

      // Extract minimal tool call info
      const toolCalls = currentProgress
        .filter((progress) => progress.message_type === "tool_call")
        .map((progress) => ({
          step: progress.step,
          toolName: progress.details?.tool_name || "Unknown Tool",
          message: progress.message,
        }));

      // Create AI message with final answer and tool calls
      dispatch(receiveMessage(data.message, toolCalls));

      // Clear progress for next question
      dispatch(clearProgress());

      console.log("Final result processed - progress cleared");

      // Return early to prevent further processing
      return;
    }

    // Update last message for real-time updates
    dispatch(updateLastMessage(data));
  } catch (error) {
    console.error("Error parsing WebSocket message:", error);
    dispatch(handleConnectionError("Failed to parse message"));
  }
};

// Track if a load is already in progress to prevent duplicate calls
let isLoadingConversations = false;
let lastLoadedCompanyId = null;

export const loadConversationListAction = (userInfo) => async (dispatch, getState) => {
  // Get current company to check if it changed
  const currentState = getState();
  const currentCompanyId = currentState.auth?.currentCompany?.companyID || 
                           currentState.auth?.currentCompany?.id;
  
  // Reset loading flag if company changed
  if (lastLoadedCompanyId !== currentCompanyId) {
    isLoadingConversations = false;
    lastLoadedCompanyId = currentCompanyId;
  }
  
  // Prevent duplicate concurrent calls
  if (isLoadingConversations) {
    console.log("loadConversationList: Already loading, skipping duplicate call");
    return;
  }
  
  isLoadingConversations = true;
  console.log("loadConversationList: Starting for company:", currentCompanyId);

  try {
    // CRITICAL: Use refresh_token_company for company-specific API calls
    const { getItem } = await import('../../utils/storage');
    const refreshTokenCompany = await getItem('refresh_token_company');
    const fallbackToken = getState().auth.userData?.token;
    
    const token = refreshTokenCompany || fallbackToken;
    
    if (!token) {
      console.warn("loadConversationList: No token available");
      dispatch(loadConversations([]));
      isLoadingConversations = false;
      return;
    }

    let response;
    try {
      response = await getConversationsByCompany({ token });
    } catch (companyError) {
      // Log once, not repeatedly
      console.warn("loadConversationList: API error -", companyError.message);
      
      // If 502 or 5xx, just continue without history - backend issue
      if (companyError.message.includes("502") || companyError.message.includes("500")) {
        console.warn("Backend unavailable - chat will still work via WebSocket");
        response = [];
      }
      // If unauthorized, try fetching by User
      else if (companyError.message.includes("401") || companyError.message.includes("authorized")) {
        try {
          response = await getConversations({ token });
        } catch (userError) {
          console.warn("User conversations also failed:", userError.message);
          response = [];
        }
      } else {
        response = [];
      }
    }

    // The response is now a direct array of conversations (or empty if none)
    // We no longer need to verify security envelope as per new API spec
    const conversations = Array.isArray(response) ? response : [];

    // --- HELPER: Safer Date Formatting for React Native ---
    const formatDate = (date) => {
      // If it's a timestamp number
      if (!isNaN(date)) {
        const dateObj = new Date(Number(date));
        // Use standard Intl if available, or simple toLocaleString for safety
        try {
            return dateObj.toLocaleString("en-US", {
                year: "numeric", month: "short", day: "numeric",
                hour: "numeric", minute: "numeric", second: "numeric", hour12: true
            }).replace(',', ' at');
        } catch (_e) {
            return dateObj.toString();
        }
      }

      // If it's already a formatted string, return as is or parse
      return date; 
    };

    const convertToTimestamp = (dateString) => {
      if(!dateString) return 0;
      // Handle "at" replacement for typical formatted strings
      const cleanDate = dateString.toString().replace(/ at /, " ");
      const date = new Date(cleanDate);
      if (isNaN(date.getTime())) return 0;
      return date.getTime();
    };

    const updatedConversations = conversations.map((conversation) => ({
      ...conversation,
      updatedAt: formatDate(conversation.updatedAt),
      createdAt: formatDate(conversation.createdAt),
    }));

    // Function to sort conversations based on updatedAt (most recent first)
    const sortConversations = (conversations) => {
      return conversations.sort(
        (a, b) =>
          convertToTimestamp(b.updatedAt) - convertToTimestamp(a.updatedAt)
      );
    };

    const sortedConversations = sortConversations(updatedConversations);

    const activeConversation = sortedConversations.filter(
      (conversation) => !conversation.inTrash
    );

    dispatch(loadConversations(activeConversation));
    console.log("loadConversationList: Loaded", activeConversation.length, "conversations");
  } catch (error) {
    console.error("loadConversationList: Error -", error.message);
    dispatch(setError(error.message));
  } finally {
    isLoadingConversations = false;
  }
};

export const addNewConversationAction = (tokenPayload) => async (dispatch, getState) => {
  try {
    console.log(
      "addNewConversationAction: Adding new conversation:",
      tokenPayload
    );

    // CRITICAL: Use refresh_token_company for company-specific API calls
    const { getItem } = await import('../../utils/storage');
    const refreshTokenCompany = await getItem('refresh_token_company');
    const fallbackToken = getState().auth.userData?.token;
    const token = refreshTokenCompany || fallbackToken;
    
    console.log("addNewConversationAction: Using token type:", refreshTokenCompany ? "refresh_token_company ✅" : "fallback ⚠️");

    // Call API to create conversation in backend with full JWT payload
    const response = await createConversation({
      token,
      userID: tokenPayload.userID,
      companyID: tokenPayload.companyID,
      conversationID: tokenPayload.conversationID,
      conversation_name: tokenPayload.conversation_name || 'New Chat',
      messageCount: tokenPayload.messageCount || 0,
      workflowsUsed: tokenPayload.workflowsUsed || [],
      experiments: tokenPayload.experiments || [],
    });

    console.log("addNewConversationAction: API response:", response);

    try {
      const convoEntry = {
        conversationID: tokenPayload.conversationID,
        conversation_name: tokenPayload.conversation_name,
        createdAt: tokenPayload.createdAt,
        updatedAt: tokenPayload.updatedAt,
        messageCount: tokenPayload.messageCount,
      };

      dispatch(addConversation(convoEntry));
      console.log("addNewConversationAction: Conversation added locally");
    } catch (err) {
      console.error("addNewConversationAction: Failed to add locally:", err);
      dispatch(setError(err.message || String(err)));
      throw err;
    }

    return response;
  } catch (error) {
    console.error(
      "addNewConversationAction: Error creating conversation:",
      error.message
    );
    if (error.response) {
      console.error("Server error data:", error.response.data);
    }
    dispatch(setError(error.message));
    throw error;
  }
};

export const addConversationFromSidebarAction =
  ({ conversationID, conversationPath }) =>
  async (dispatch) => {
    console.log("addConversationFromSidebarAction:", conversationID);
    try {
      const response = await fetchJsonFromS3(conversationPath);

      console.log("addConversationFromSidebarAction: Fetched data:", response);

      dispatch(selectConversation({ conversationID, response }));
    } catch (error) {
      console.error(
        "addConversationFromSidebarAction: Error:",
        error?.message || error
      );
      dispatch(setError(error?.message || String(error)));
    }
  };

export const renameConversationAction =
  (tokenPayload) => async (dispatch, getState) => {
    try {
      console.log("renameConversationAction: Renaming conversation:", tokenPayload);

      // CRITICAL: Use refresh_token_company
      const { getItem } = await import('../../utils/storage');
      const refreshTokenCompany = await getItem('refresh_token_company');
      const fallbackToken = getState().auth.userData?.token;
      const token = refreshTokenCompany || fallbackToken;
      
      console.log("renameConversationAction: Using token type:", refreshTokenCompany ? "refresh_token_company ✅" : "fallback ⚠️");
      
      // Call API to rename conversation with JWT-signed payload
      const response = await renameConversation({
        token,
        conversationID: tokenPayload.conversationID,
        userID: tokenPayload.userID,
        companyID: tokenPayload.companyID,
        title: tokenPayload.newConversationName || tokenPayload.title,
      });
      
      console.log("renameConversationAction: API response:", response);
      
      // Update Redux state with new name
      dispatch(
        updateConversationName({
          conversationID: tokenPayload.conversationID,
          newConversationName: tokenPayload.newConversationName || tokenPayload.title,
        })
      );
      
      return response;
    } catch (error) {
      console.error("renameConversationAction Error:", error.message);
      dispatch(setError(error.message));
      throw error;
    }
  };

export const deleteConversationAction = (tokenPayload) => async (dispatch, getState) => {
  try {
    console.log("deleteConversationAction:", tokenPayload);
    
    // CRITICAL: Use refresh_token_company
    const { getItem } = await import('../../utils/storage');
    const refreshTokenCompany = await getItem('refresh_token_company');
    const fallbackToken = getState().auth.userData?.token;
    const token = refreshTokenCompany || fallbackToken;
    
    console.log("deleteConversationAction: Using token type:", refreshTokenCompany ? "refresh_token_company ✅" : "fallback ⚠️");
    
    const response = await deleteConversation({
      token,
      conversationID: tokenPayload.conversationID,
      userID: tokenPayload.userID,
      companyID: tokenPayload.companyID,
    });
    console.log("deleteConversationAction: API response:", response);
    dispatch(removeConversation(tokenPayload.conversationID));
    return response;
  } catch (error) {
    console.error("deleteConversationAction Error:", error.message);
    dispatch(setError(error.message));
    throw error;
  }
};