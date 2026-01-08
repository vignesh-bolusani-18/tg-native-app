// D:\TG_REACT_NATIVE_MOBILE_APP\redux\actions\vibeAction.js

import { getExperimentById } from "../../utils/getExperiments";
import { processToken, verifyConversationsResponse } from "../../utils/jwtUtils";
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

      // Keep signature close to web; our util accepts two args, extra ignored
      const response = await getExperimentById(
        { experimentID: experimentId },
        currentCompany
      );

      // Decode if API returns a JWT; otherwise pass through
      const experimentData =
        typeof response === "string" ? await processToken(response) : response;

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

export const loadConversationListAction = (userInfo, retryCount = 0) => async (dispatch) => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second
  
  console.log(`📚 loadConversationList called (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);

  try {
    const response = await getConversationsByCompany();
    
    // Check if response is valid
    if (!response) {
      throw new Error("Empty response from conversation API");
    }
    
    console.log("✅ Got conversations response:", typeof response, Array.isArray(response) ? response.length : "object");
    
    // DEBUG: Log first raw conversation from backend to see exact field names
    if (Array.isArray(response) && response.length > 0) {
      console.log("🔍 RAW Backend first conversation:", JSON.stringify(response[0], null, 2));
      console.log("🔍 ALL field keys in first conversation:", Object.keys(response[0]));
      // Check for any date-like fields
      const dateFields = Object.keys(response[0]).filter(k => 
        k.toLowerCase().includes('date') || k.toLowerCase().includes('time') || k.toLowerCase().includes('updated') || k.toLowerCase().includes('created')
      );
      console.log("🔍 Date-related fields found:", dateFields);
    }

    // Verify security and get invitation data
    const verifiedConversations = await verifyConversationsResponse(
      response,
      userInfo.userID
    );

    // console.log("DecodedExperiments:", decodedExperiments);
    // Function to format date to local format
    const formatDate = (date) => {
      // Handle null/undefined
      if (!date) return "Unknown";
      
      // If it's a valid timestamp (milliseconds since epoch) or parseable number string
      const numericDate = typeof date === 'number' ? date : Number(date);
      if (!isNaN(numericDate) && numericDate > 0) {
        const dateObj = new Date(numericDate);
        if (!isNaN(dateObj.getTime())) {
          // Format the date part
          const datePart = new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }).format(dateObj);

          // Format the time part, including seconds
          const timePart = new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
          }).format(dateObj);

          // Combine the date and time parts with "at"
          return `${datePart}, at ${timePart}`;
        }
      }

      // If the date is already a formatted string, try to format it
      if (typeof date === 'string') {
        try {
          return formatDateString(date);
        } catch (error) {
          console.warn("formatDate: Invalid date string:", date, error);
        }
      }

      // Return the original value as string if nothing else works
      return String(date);
    };

    function convertToTimestamp(dateString) {
      // Handle null/undefined
      if (!dateString) return 0;
      
      // If already a number (timestamp), return it
      if (typeof dateString === 'number') return dateString;
      
      // Create a new Date object from the input date string
      const date = new Date(String(dateString).replace(/ at /, " "));

      // Check if the date is valid - return 0 instead of throwing to prevent crashes
      if (isNaN(date.getTime())) {
        console.warn("convertToTimestamp: Invalid date format:", dateString);
        return 0; // Return 0 for invalid dates so sorting still works
      }

      // Return the timestamp in milliseconds
      return date.getTime();
    }

    // Function to convert full month names to abbreviated month names
    const formatDateString = (dateString) => {
      const monthMap = {
        January: "Jan",
        February: "Feb",
        March: "Mar",
        April: "Apr",
        May: "May",
        June: "Jun",
        July: "Jul",
        August: "Aug",
        September: "Sep",
        October: "Oct",
        November: "Nov",
        December: "Dec",
      };

      // Use a regular expression to match the full date format
      const regex =
        /(\w+) (\d{1,2}), (\d{4}) at (\d{1,2}:\d{2}:\d{2} [APM]{2})/;
      const match = dateString.match(regex);

      if (match) {
        const fullMonth = match[1];
        const day = match[2];
        const year = match[3];
        const time = match[4];

        const abbreviatedMonth = monthMap[fullMonth];
        return `${abbreviatedMonth} ${day}, ${year} at ${time}`;
      }

      return dateString;
    };

    const updatedConversations = verifiedConversations.map((conversation) => ({
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

    console.log(`✅ Loaded ${activeConversation.length} conversations from backend`);
    
    // DEBUG: Log what will be saved to Redux
    if (activeConversation.length > 0) {
      console.log("📝 REDUX STORED: First conversation object:", JSON.stringify(activeConversation[0], null, 2));
      console.log("📝 REDUX STORED: First conversation updatedAt:", activeConversation[0].updatedAt);
      console.log("📝 REDUX STORED: First conversation createdAt:", activeConversation[0].createdAt);
    }
    
    dispatch(loadConversations(activeConversation));
  } catch (error) {
    console.error("❌ loadConversationListAction Error:", error.message);
    
    // ⭐ RETRY LOGIC: If this was a network/auth error and we haven't exhausted retries
    if (retryCount < MAX_RETRIES) {
      const isRetryable = 
        error.message?.includes("Network") ||
        error.message?.includes("timeout") ||
        error.message?.includes("401") ||
        error.message?.includes("403") ||
        error.message?.includes("Empty response") ||
        error.message?.includes("No tokens");
      
      if (isRetryable) {
        console.log(`⏳ Retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1))); // Exponential backoff
        return dispatch(loadConversationListAction(userInfo, retryCount + 1));
      }
    }
    
    // Only set error if all retries exhausted
    dispatch(setError(`Failed to load conversations: ${error.message}`));
  }
};

export const addNewConversationAction = (tokenPayload) => async (dispatch) => {
  try {
    console.log(
      "addNewConversationAction: Adding new conversation:",
      tokenPayload
    );

    // Call API to create conversation in backend
    const response = await createConversation(tokenPayload);

    console.log("addNewConversationAction: API response:", response);

    // After a successful backend create, add the conversation to the local sidebar list.
    // Some backends return varied shapes; prefer server-provided metadata if available,
    // otherwise fall back to the tokenPayload we sent.
    try {
      const convoEntry = {
        conversationID: tokenPayload.conversationID,
        conversation_name:tokenPayload.conversation_name,
        createdAt:  tokenPayload.createdAt,
        updatedAt:  tokenPayload.updatedAt,
        messageCount: tokenPayload.messageCount,
    
      };

      dispatch(addConversation(convoEntry));
      console.log("addNewConversationAction: Conversation added locally after backend success", convoEntry);
    } catch (err) {
      console.error("addNewConversationAction: Failed to add conversation locally:", err);
      dispatch(setError(err.message || String(err)));
      throw err;
    }

    return response;
  } catch (error) {
    console.error(
      "addNewConversationAction: Error creating conversation:",
      error.message
    );
    // Log detailed error info for debugging 500 errors
    if (error.response) {
      console.error("Server error status:", error.response.status);
      console.error("Server error data:", error.response.data);
    }
    dispatch(setError(error.message));
    throw error;
  }
};

export const addConversationFromSidebarAction =
  ({ conversationID, conversationPath }) =>
  async (dispatch) => {
    console.log(
      "addConversationFromSidebarAction: Adding conversation with ID:",
      conversationID
    );
    try {
      const response = await fetchJsonFromS3(conversationPath);

      console.log(
        "addConversationFromSidebarAction: Fetched conversation data:",
        response
      );

      // Ensure we dispatch the selectConversation action with a single payload object
      dispatch(selectConversation({ conversationID, response }));
    } catch (error) {
      console.error(
        "addConversationFromSidebarAction: Error fetching conversation data:",
        error?.message || error
      );
      dispatch(setError(error?.message || String(error)));
    }
  };

export const renameConversationAction =
  (tokenPayload) => async (dispatch, getState) => {
    try {
      console.log(
        "renameConversationAction: Renaming conversation with payload:",
        tokenPayload
      );
      const response = await renameConversation(tokenPayload);
      console.log("renameConversationAction: API response:", response);
      dispatch(
        updateConversationName({
          conversationID: tokenPayload.conversationID,
          newConversationName: tokenPayload.newConversationName,
        })
      );
      return response;
    } catch (error) {
      console.error(
        "renameConversationAction: Error renaming conversation:",
        error.message
      );
      dispatch(setError(error.message));
      throw error;
    }
  };

export const deleteConversationAction = (tokenPayload) => async (dispatch) => {
  try {
    console.log(
      "deleteConversationAction: Deleting conversation with payload:",
      tokenPayload
    );

    const response = await deleteConversation(tokenPayload);

    console.log("deleteConversationAction: API response:", response);

    dispatch(removeConversation(tokenPayload.conversationID));
    return response;
  } catch (error) {
    console.error(
      "deleteConversationAction: Error deleting conversation:",
      error.message
    );
    dispatch(setError(error.message));
    throw error;
  }
};

