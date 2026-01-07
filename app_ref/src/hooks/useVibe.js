// src/hooks/useVibe.js
import { useSelector } from "react-redux";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useEffect, useRef } from "react";
import {
  setWaitingForAI,
  setHasConversation as SetHasConversation,
  clearError as ClearError,
  setProcessingStepText as SetProcessingStepText,
  updateMessage,
  updateMessageContent,
  removeMessage,
  setOpenDataTagger as SetOpenDataTagger,
  setDataTagged as SetDataTagged,
  setDataUploaded as SetDataUploaded,
  setDataConfirmed as SetDataConfirmed,
  setContextQuestionsAnswered as SetContextQuestionsAnswered,
  setContextAnswersConfirmed as SetContextAnswersConfirmed,
  setAdvancedQuestionsAnswered as SetAdvancedQuestionsAnswered,
  setAdvancedAnswersConfirmed as SetAdvancedAnswersConfirmed,
  setExperimentStatusHistory as SetExperimentStatusHistory,
  setNavigating as SetNavigating,
  createNewConversation,
  switchConversation,
  deleteConversation,
  updateConversationId as UpdateConversationId,
  initializeConversations as InitializeConversations,
  setStreamingStatus as SetStreamingStatus,
  addMessage as AddMessage,
  updateProcessingStepText as UpdateProcessingStepText,
  clearConversations as ClearConversations,
  // new chat init flag
  setChatInitialized as SetChatInitialized,
  addSelectedDataset as AddSelectedDataset,
  removeSelectedDataset as RemoveSelectedDataset,
  clearSelectedDatasets as ClearSelectedDatasets,
  setUserMessage as SetUserMessage,
  clearUserMessage as ClearUserMessage,
  addSelectedExpDataset as AddSelectedExpDataset,
  setSelectedAnalysisExperiment as SetSelectedAnalysisExperiment,
  setAnalysisSystemPrompt as SetAnalysisSystemPrompt,
  setAnalysisDataPathDict as SetAnalysisDataPathDict,
  clearSelectedAnalysisExperiment as ClearSelectedAnalysisExperiment,
  setIsSidebarOpenReducer as SetIsSidebarOpenReducer,
} from "../redux/slices/vibeSlice";
import { setCreditScore } from "../redux/slices/vibeSlice";
import {
  fetchAndStoreExperimentData,
  decrementCreditsAction,
  addNewConversationAction,
  addConversationFromSidebarAction,
} from "../redux/actions/vibeAction";
import { useDispatch } from "react-redux";

// src/hooks/useCreditRefresh.js
import { useState, useCallback } from "react";

import { fetchCreditScoreAction , postCurrentConversationAction,loadConversationListAction ,renameConversationAction , deleteConversationAction} from "../redux/actions/vibeAction";
import { updateCredits, getCreditScore } from "../utils/getAndUpdateCredits";

// src/hooks/useCreditRefresh.js
//creditRefresh instead of useCreditRefresh to avoid confusion
import useAuth from "./useAuth";


export const useVibe = () => {
  const dispatch = useDispatch();
  const { userInfo , currentCompany } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentConvoId = location.pathname.split("/");
  const vibeState = useSelector((state) => state.vibe);

  // New conversation-based structure
  const {
    conversations = {},
    currentConversationId = null,
    // selectedDatasets = {},
    //selectedDatasets is new

    // Legacy fields for backward compatibility
    messages = [],
    // isStreaming = false,
    // currentProgress = [],
    // error = null,
    
    isWaitingForAI = false,
    // hasConversation = false,
    // langgraphState = null,
    processingStepText = "Thinking...",
    openDataTagger = false,
    dataTagged = false,
    dataUploaded = false,
    dataConfirmed = false,
    contextQuestionsAnswered = false,
    contextAnswersConfirmed = false,
    advancedQuestionsAnswered = false,
    advancedAnswersConfirmed = false,
    experimentStatusHistory = [],
    // chatInitialized = false,
    creditScore,
    // userMessage = "",
    conversation_list = [],
    isSidebarOpen = false,
  } = vibeState || {};

  // Ensure conversations is always an object
  const safeConversations =
    typeof conversations === "object" && conversations !== null
      ? conversations
      : {};
  const safeCurrentConversationId = currentConversationId || null;
  const previousConversationId = useRef(safeCurrentConversationId);

  // Get current conversation data
  const currentConversation = safeCurrentConversationId
    ? safeConversations[safeCurrentConversationId]
    : null;
  const navigating = currentConversation?.navigating || false;
  const conversationState = currentConversation?.["conversation_state"] || null;
  const currentMessages = currentConversation?.messages || [];
  const selectedAnalysisExperiment = currentConversation?.selectedAnalysisExperiment || null;
  const analysisSystemPrompt = currentConversation?.analysisSystemPrompt || null;
  const analysisDataPathDict = currentConversation?.analysisDataPathDict || null;

  const isStreaming = currentConversation?.isStreaming || false;
  const currentProgress = currentConversation?.currentProgress || [];
  const error = currentConversation?.error || null;
  const lastMessage = currentConversation?.lastMessage || null;
  // Always return true if currentConversation exists, unless explicitly set to false
  const hasConversation = currentConversation ? (currentConversation?.hasConversation !== false) : true;
  const langgraphState = currentConversation?.langgraphState || null;  
  const chatInitialized = currentConversation?.chatInitialized || false;
  const selectedDatasets = currentConversation?.selectedDatasets || {};
  const userMessage = currentConversation?.userMessage || "";

  // DEBUG: Log hasConversation value
  // console.log("📍 useVibe: hasConversation value:", {
  //   hasConversation,
  //   currentConversationExists: !!currentConversation,
  //   currentConversation_hasConversation: currentConversation?.hasConversation,
  // });

  // Handle navigation when conversation changes (e.g., after deletion)
  // Skip auto-navigation in routes like Scenario Planning where we only want an in-place chat drawer.
  useEffect(() => {
    // Avoid changing the router path when we're inside scenario planning or similar flows
    if (location.pathname.includes("/scenario")) {
      return;
    }

    if (previousConversationId.current !== safeCurrentConversationId) {
      if (safeCurrentConversationId) {
        navigate(`./${safeCurrentConversationId}`, { replace: true });
      } else {
        navigate("./chat", { replace: true });
      }
      previousConversationId.current = safeCurrentConversationId;
    }
  }, [safeCurrentConversationId, navigate, location.pathname]);

  // Get conversation list for sidebar
  const conversationList = Object.values(safeConversations).sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  // New conversation management functions
const createNewChat = async (workflowName = "default_workflow", title = null) => {
  const conversationId = `${crypto.randomUUID()}`;
  
  // 1. Create in Redux
  dispatch(createNewConversation({ workflowName, title, conversationId }));
  
  // 2. Persist to backend and sidebar
  const tokenPayload = {
    conversationID: conversationId,
    userID: userInfo?.userID,
    companyID: userInfo?.companyID,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messageCount: 0,
    workflowsUsed: [],
    experiments: {},
    conversation_name: title || "New Chat",
  };
  
  // WAIT for the backend persistence to complete before returning
  await dispatch(addNewConversationAction(tokenPayload)).catch(err => {
    console.error("createNewChat: Failed to save to backend:", err);
    // Don't throw - conversation still exists in Redux
  })
  
  return conversationId;
};

  const switchToConversation = (conversationId) => {
    if (safeConversations[conversationId]) {
      dispatch(switchConversation(conversationId));
      navigate(`./${conversationId}`, { replace: true });
    }
  };

  const updateConversationId = async (conversationId) => {
    console.log("updateConversationId: conversationId =", conversationId);
    await dispatch(UpdateConversationId(conversationId));
  };
  const updateProcessingStepText = (processingStepText) => {
    dispatch(UpdateProcessingStepText(processingStepText));
  };

  const initializeConversations = async () => {
    await dispatch(InitializeConversations());
  };

  const clearConversations = async () => {
    await dispatch(ClearConversations());
  };

  const setStreamingStatus = (streamingStatus) => {
    dispatch(SetStreamingStatus(streamingStatus));
  };
  const deleteConversationById = (conversationId) => {
    if (safeConversations[conversationId]) {
      dispatch(deleteConversation(conversationId));
      // Navigation is handled by useEffect when currentConversationId changes
    }
  };

  const addMessage = async (message) => {
    await dispatch(AddMessage(message));
    if(currentMessages.length === 0){
      console.log("First message added to conversation:", message);
      dispatch(renameConversationAction({
        conversationID: safeCurrentConversationId,
        updatedAt: Date.now(),
        newConversationName: message.content.slice(0, 50), // First 50 chars as title
        conversation_name: message.content.slice(0, 50)
      }));
    }
  };

  // Single function to manage isWaitingForAI state
  const setWaitingForAIState = (waitingForAI) => {
    try {
      if (typeof waitingForAI !== "boolean") {
        console.warn(
          "setWaitingForAIState: Expected boolean, got:",
          typeof waitingForAI,
          waitingForAI
        );
        waitingForAI = Boolean(waitingForAI);
      }

      dispatch(setWaitingForAI(waitingForAI));
      console.log("setWaitingForAIState: isWaitingForAI set to", waitingForAI);

      // Additional logging for debugging
      if (waitingForAI) {
        console.log("🔄 AI processing started - waiting for response");
      } else {
        console.log("✅ AI processing completed - no longer waiting");
      }
    } catch (error) {
      console.error("Error in setWaitingForAIState:", error);
      // Fallback: try to dispatch with a simple action
      try {
        dispatch({ type: "vibe/setWaitingForAI", payload: waitingForAI });
      } catch (fallbackError) {
        console.error("Fallback dispatch also failed:", fallbackError);
      }
    }
  };
  const setDataTagged = (dataTagged) => {
    dispatch(SetDataTagged(dataTagged));
  };
  const setDataUploaded = (dataUploaded) => {
    dispatch(SetDataUploaded(dataUploaded));
  };
  const setDataConfirmed = (dataConfirmed) => {
    dispatch(SetDataConfirmed(dataConfirmed));
  };
  const setContextQuestionsAnswered = (contextQuestionsAnswered) => {
    dispatch(SetContextQuestionsAnswered(contextQuestionsAnswered));
  };
  const setContextAnswersConfirmed = (contextAnswersConfirmed) => {
    dispatch(SetContextAnswersConfirmed(contextAnswersConfirmed));
  };
  const setAdvancedQuestionsAnswered = (advancedQuestionsAnswered) => {
    dispatch(SetAdvancedQuestionsAnswered(advancedQuestionsAnswered));
  };
  const setAdvancedAnswersConfirmed = (advancedAnswersConfirmed) => {
    dispatch(SetAdvancedAnswersConfirmed(advancedAnswersConfirmed));
  };
  const setExperimentStatusHistory = (experimentStatusHistory) => {
    dispatch(SetExperimentStatusHistory(experimentStatusHistory));
  };
  const setNavigating = (navigating) => {
    dispatch(SetNavigating(navigating));
  };

  // Function to fetch and store experiment data
  const fetchAndStoreExperimentDataForConversation = async (
    experimentId,
    currentCompany,
    userInfo
  ) => {
    try {
      await dispatch(
        fetchAndStoreExperimentData(experimentId, currentCompany, userInfo)
      );
      console.log("Experiment data stored for:", experimentId);
    } catch (error) {
      console.error(
        "Error in fetchAndStoreExperimentDataForConversation:",
        error
      );
      throw error;
    }
  };

  // Function to get experiment data from current conversation
  const getExperimentData = (experimentId) => {
    if (currentConversation && currentConversation.experiments) {
      return currentConversation.experiments[experimentId] || null;
    }
    return null;
  };

  // Function to get all experiments data from current conversation
  const getAllExperimentsData = () => {
    if (currentConversation && currentConversation.experiments) {
      return currentConversation.experiments;
    }
    return {};
  };
  // Keep the old function for backward compatibility
  const setIsWaitingForAI = (waitingForAI) => {
    setWaitingForAIState(waitingForAI);
  };

  const setOpenDataTagger = (openDataTagger) => {
    dispatch(SetOpenDataTagger(openDataTagger));
  };

  const setHasConversation = (hasConversation) => {
    // console.log("🎯 useVibe: setHasConversation called with value:", hasConversation);
    // console.log("🎯 useVibe: currentConversationId:", safeCurrentConversationId);
    dispatch(SetHasConversation(hasConversation));
    // console.log("🎯 useVibe: SetHasConversation action dispatched");
  };

  const setProcessingStepText = (processingStepText) => {
    dispatch(SetProcessingStepText(processingStepText));
    console.log(
      "setProcessingStepText: processingStepText =",
      processingStepText
    );
  };

  const setChatInitialized = (initialized) => {
    dispatch(SetChatInitialized(Boolean(initialized)));
  };

  const clearError = () => {
    dispatch(ClearError());
  };

  // Message editing functions
  const editMessage = (messageId, updates) => {
    try {
      dispatch(updateMessage({ messageId, updates }));
      console.log(`Message ${messageId} updated with:`, updates);
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  const editMessageContent = (messageId, content) => {
    try {
      dispatch(updateMessageContent({ messageId, content }));
      console.log(`Message ${messageId} content updated to:`, content);
    } catch (error) {
      console.error("Error updating message content:", error);
    }
  };

  const deleteMessage = (messageId) => {
    try {
      dispatch(removeMessage(messageId));
      console.log(`Message ${messageId} removed`);
    } catch (error) {
      console.error("Error removing message:", error);
    }
  };

  // Get current streaming message
  const getCurrentStreamingMessage = () => {
    if (!isStreaming || currentProgress.length === 0) return "";

    // Get the latest progress update
    const latestProgress = currentProgress[currentProgress.length - 1];

    if (latestProgress.message_type === "final_result") {
      return latestProgress.message;
    }

    // For streaming updates, show the current message
    return latestProgress.message || "";
  };

  // ===== REFRESH CREDITS FUNCTION =====
  const refreshCredits = async () => {
    try {
      // Fetch from backend and update Redux store
      const updatedScore = await dispatch(fetchCreditScoreAction());
      console.log("✅ Credits refreshed:", updatedScore);
      return updatedScore;
    } catch (err) {
      console.error("❌ refreshCredits failed:", err);
      throw err; // Re-throw so UI can handle it
    }
  };

  // Decrement credits helper: optimistic update + backend sync, components call this instead of dispatch
  const decrementCredits = async (amount = 1) => {
    dispatch(decrementCreditsAction(amount));
  };

  // Add a dataset to selectedDatasets dictionary
  const addDatasetToSelection = (
    datasetName,
    isUploaded,
    companyName,
    companyId
  ) => {
    dispatch(
      AddSelectedDataset({
        datasetName,
        isUploaded,
        companyName,
        companyId,
      })
    );
    console.log("📊 useVibe: Added dataset to selection:", datasetName);
  };

  // Remove a dataset from selectedDatasets dictionary
  const removeDatasetFromSelection = (datasetName) => {
    dispatch(RemoveSelectedDataset(datasetName));
    console.log("📊 useVibe: Removed dataset from selection:", datasetName);
  };

  // Clear all selected datasets
  const clearAllSelectedDatasets = () => {
    dispatch(ClearSelectedDatasets());
    console.log(" ClearSelectedDatasets action dispatched");
  };

  // Set the selected message (what user is typing)
  const addUserMessage = (message) => {
    dispatch(SetUserMessage(message));
    console.log("💬 useVibe: Set selected message:", message);
  };

  // Clear the selected message (after sending or user deletes)
  const removeUserMessage = () => {
    dispatch(ClearUserMessage());
    console.log("💬 useVibe: Cleared selected message");
  };

  const addExpDatasetToSelection = (expDatasetPath, datasetName) => {
    dispatch(AddSelectedExpDataset({ expDatasetPath, datasetName }));
    console.log(
      "📊 useVibe: Added experiment dataset to selection:",
      expDatasetPath
    );
  };

  // Analysis experiment selection functions
  const setSelectedAnalysisExperiment = (experiment) => {
    dispatch(SetSelectedAnalysisExperiment(experiment));
  };

  const setAnalysisSystemPrompt = (systemPrompt) => {
    dispatch(SetAnalysisSystemPrompt(systemPrompt));
  };

  const setAnalysisDataPathDict = (dataPathDict) => {
    dispatch(SetAnalysisDataPathDict(dataPathDict));
  };

  const clearSelectedAnalysisExperiment = () => {
    dispatch(ClearSelectedAnalysisExperiment());
  };

  const addNewConversation = () => {
    // Ensure currentConversation exists before accessing its properties
    if (!currentConversation) {
      console.warn("addNewConversation: currentConversation is null/undefined");
      return;
    }

    // Convert ISO string to Unix timestamp (milliseconds)
    const getUnixTimestamp = (dateStr) => {
      try {
        if (typeof dateStr === 'number') return dateStr; // Already a timestamp
        return new Date(dateStr).getTime();
      } catch (e) {
        return Date.now();
      }
    };

    // Convert experiments object to array of experiment IDs if needed
    // const experimentsArray = currentConversation.experiments 
    //   ? (Array.isArray(currentConversation.experiments) 
    //       ? currentConversation.experiments 
    //       : Object.keys(currentConversation.experiments))
    //   : [];

    const tokenPayload = {
      conversationID: safeCurrentConversationId,  // MUST be "conversationID", not "currentConversationId"
      userID: userInfo?.userID,                   // User ID from auth
      companyID: userInfo?.companyID,             // Company ID from auth
      createdAt: getUnixTimestamp(currentConversation.createdAt),     // Unix timestamp in milliseconds
      updatedAt: getUnixTimestamp(currentConversation.updatedAt),     // Unix timestamp in milliseconds
      messageCount: currentConversation.messageCount || 0,            // Message count
      workflowsUsed: [],                          // Array of workflow IDs
      experiments: currentConversation.experiments ,              // Array of experiment IDs
      conversation_name: currentConversation.title || "New Chat"      // Conversation title
    };

    
    dispatch(addNewConversationAction(tokenPayload));
  };

  const loadConversationList = () => {
    dispatch(loadConversationListAction(userInfo));
  }

  const addConversationFromSidebar = async (conversationID) => {
    
    const conversationPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/conversations/${conversationID}/conversation_state.json`;

    return dispatch(addConversationFromSidebarAction({conversationID, conversationPath}));
  };

  const setIsSidebarOpen = (isOpen) => {
    dispatch(SetIsSidebarOpenReducer(isOpen));
  };


  const renameConversationFunction = (conversationID, newTitle) => {
    const tokenPayload = {
      conversationID: conversationID,
      updatedAt: Date.now(),
      newConversationName: newTitle,
      conversation_name: newTitle
    };
    dispatch(renameConversationAction(tokenPayload));
  };

  const deleteConversationFunction = (conversationID) => {
    const tokenPayload = {
      conversationID: conversationID,
    };
    dispatch(deleteConversationAction(tokenPayload));
  };

  return {
    // State

    messages,
    isStreaming,
    currentProgress,
    error,
    lastMessage,
    isWaitingForAI,
    hasConversation,
    langgraphState,
    currentConversation,
    currentConversationId: safeCurrentConversationId,
    processingStepText,
    openDataTagger,
    dataTagged,
    dataUploaded,
    dataConfirmed,
    contextQuestionsAnswered,
    contextAnswersConfirmed,
    advancedQuestionsAnswered,
    advancedAnswersConfirmed,
    experimentStatusHistory,
    chatInitialized,
    // Chat management,
    getCurrentStreamingMessage,
    setWaitingForAIState, // New single function
    setIsWaitingForAI, // Keep for backward compatibility
    setHasConversation,
    clearError,
    setProcessingStepText,
    setOpenDataTagger,
    setDataTagged,
    setDataUploaded,
    setDataConfirmed,
    setContextQuestionsAnswered,
    setContextAnswersConfirmed,
    setAdvancedQuestionsAnswered,
    setAdvancedAnswersConfirmed,
    setExperimentStatusHistory,
    setStreamingStatus,
    // Experiment data management
    fetchAndStoreExperimentDataForConversation,
    getExperimentData,
    getAllExperimentsData,
    // Message editing functions
    editMessage,
    editMessageContent,
    deleteMessage,
    addMessage,
    // New conversation management
    createNewChat,
    switchToConversation,
    updateConversationId,
    deleteConversationById,
    initializeConversations,
    conversationList,
    currentMessages,
    conversations: safeConversations,
    updateProcessingStepText,
    conversationState,
    setChatInitialized,
    clearConversations,
    setNavigating,
    navigating,
    decrementCredits,

    creditScore, //credit score here
    refreshCredits, // function to call from UI

    selectedDatasets,
    addDatasetToSelection,
    removeDatasetFromSelection,
    clearAllSelectedDatasets,
    addUserMessage,
    removeUserMessage,
    userMessage,
    addExpDatasetToSelection,
    selectedAnalysisExperiment,
    analysisSystemPrompt,
    analysisDataPathDict,
    setSelectedAnalysisExperiment,
    setAnalysisSystemPrompt,
    setAnalysisDataPathDict,
    clearSelectedAnalysisExperiment,
    conversation_list,
    addNewConversation,
    loadConversationList,
    addConversationFromSidebar,
    isSidebarOpen,
    setIsSidebarOpen,
    renameConversationFunction,
    deleteConversationFunction,
  };
};
