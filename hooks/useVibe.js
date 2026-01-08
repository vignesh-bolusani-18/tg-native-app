// D:\TG_REACT_NATIVE_MOBILE_APP\hooks\useVibe.js
import { useDispatch, useSelector } from "react-redux";
// import { useRouter, usePathname, useLocalSearchParams } from "expo-router"; // Expo Router replacement - unused
import { useEffect, useRef } from "react";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

import {
  addMessage as AddMessage,
  addSelectedDataset as AddSelectedDataset,
  addSelectedExpDataset as AddSelectedExpDataset,
  clearConversations as ClearConversations,
  clearError as ClearError,
  clearSelectedAnalysisExperiment as ClearSelectedAnalysisExperiment,
  clearSelectedDatasets as ClearSelectedDatasets,
  clearUserMessage as ClearUserMessage,
  createNewConversation,
  deleteConversation,
  initializeConversations as InitializeConversations,
  removeMessage,
  removeSelectedDataset as RemoveSelectedDataset,
  setAdvancedAnswersConfirmed as SetAdvancedAnswersConfirmed,
  setAdvancedQuestionsAnswered as SetAdvancedQuestionsAnswered,
  setAnalysisDataPathDict as SetAnalysisDataPathDict,
  setAnalysisSystemPrompt as SetAnalysisSystemPrompt,
  setChatInitialized as SetChatInitialized,
  setContextAnswersConfirmed as SetContextAnswersConfirmed,
  setContextQuestionsAnswered as SetContextQuestionsAnswered,
  setDataConfirmed as SetDataConfirmed,
  setDataTagged as SetDataTagged,
  setDataUploaded as SetDataUploaded,
  setExperimentStatusHistory as SetExperimentStatusHistory,
  setHasConversation as SetHasConversation,
  setIsSidebarOpenReducer as SetIsSidebarOpenReducer,
  setNavigating as SetNavigating,
  setOpenDataTagger as SetOpenDataTagger,
  setProcessingStepText as SetProcessingStepText,
  setSelectedAnalysisExperiment as SetSelectedAnalysisExperiment,
  setStreamingStatus as SetStreamingStatus,
  setUserMessage as SetUserMessage,
  setWaitingForAI,
  switchConversation,
  updateConversationId as UpdateConversationId,
  updateConversationName,
  updateMessage,
  updateMessageContent,
  updateProcessingStepText as UpdateProcessingStepText,
} from "../redux/slices/vibeSlice";

import {
  addConversationFromSidebarAction,
  addNewConversationAction,
  decrementCreditsAction,
  deleteConversationAction,
  fetchAndStoreExperimentData,
  fetchCreditScoreAction,
  loadConversationListAction,
  renameConversationAction,
} from "../redux/actions/vibeAction";

import useAuth from "./useAuth";

export const useVibe = () => {
  const dispatch = useDispatch();
  const { userInfo, currentCompany } = useAuth();
  // const router = useRouter(); // Navigation placeholder

  const vibeState = useSelector((state) => state.vibe);

  // ------------------------------------------------------------------
  // State Destructuring (Matched to WebApp)
  // ------------------------------------------------------------------
  const {
    conversations = {},
    currentConversationId = null,
    // Legacy fields for backward compatibility
    messages = [],
    // isWaitingForAI = false, // ⛔ REMOVED - Now read from currentConversation (line 119)
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
    creditScore,
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
  const selectedAnalysisExperiment =
    currentConversation?.selectedAnalysisExperiment || null;
  const analysisSystemPrompt =
    currentConversation?.analysisSystemPrompt || null;
  const analysisDataPathDict =
    currentConversation?.analysisDataPathDict || null;

  const isStreaming = currentConversation?.isStreaming || false;
  const isWaitingForAI = currentConversation?.isWaitingForAI || false;
  const currentProgress = currentConversation?.currentProgress || [];
  const error = currentConversation?.error || null;
  const lastMessage = currentConversation?.lastMessage || null;
  // Always return true if currentConversation exists, unless explicitly set to false
  const hasConversation = currentConversation
    ? currentConversation?.hasConversation !== false
    : true;
  const langgraphState = currentConversation?.langgraphState || null;
  const chatInitialized = currentConversation?.chatInitialized || false;
  const selectedDatasets = currentConversation?.selectedDatasets || {};
  const userMessage = currentConversation?.userMessage || "";

  // ------------------------------------------------------------------
  // Navigation & Effects (Adapted for Mobile)
  // ------------------------------------------------------------------
  
  // Handle navigation when conversation changes
  // ⭐ FIXED: Only log once when conversation actually changes
  useEffect(() => {
    if (previousConversationId.current !== safeCurrentConversationId) {
      if (safeCurrentConversationId) {
        // In Native/Expo, you would trigger router.replace here
        // router.replace(`/chat/${safeCurrentConversationId}`);
        console.log("🔄 Switched to conversation:", safeCurrentConversationId);
      }
      previousConversationId.current = safeCurrentConversationId;
    }
    // ⭐ FIXED: Remove dispatch from dependencies - it doesn't change and causes re-runs
  }, [safeCurrentConversationId]);

  // Get conversation list for sidebar
  const conversationList = Object.values(safeConversations).sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  // ------------------------------------------------------------------
  // Chat Management Functions (Matched to WebApp)
  // ------------------------------------------------------------------

  const createNewChat = async (workflowName = "default_workflow", title = null) => {
    // Native replacement for crypto.randomUUID()
    const conversationId = uuidv4();

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
    await dispatch(addNewConversationAction(tokenPayload)).catch((err) => {
      console.error("createNewChat: Failed to save to backend:", err);
      // Don't throw - conversation still exists in Redux
    });

    return conversationId;
  };

  const switchToConversation = (conversationId) => {
    if (safeConversations[conversationId]) {
      dispatch(switchConversation(conversationId));
      // In Expo, navigation would happen here or via the useEffect
      // router.push(`/chat/${conversationId}`);
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
    }
  };

  const addMessage = async (message) => {
    console.log('📥 [useVibe.addMessage] START');
    console.log('   message type:', message?.type);
    console.log('   message content:', message?.content?.substring(0, 50));
    console.log('   conversationId:', message?.conversationId);
    console.log('   safeCurrentConversationId:', safeCurrentConversationId);
    console.log('   currentMessages.length:', currentMessages?.length);
    
    await dispatch(AddMessage(message));
    console.log('✅ [useVibe.addMessage] AddMessage dispatched');
    
    // ⭐ MATCHES app_ref: Rename conversation on first message
    // Only rename if conversation exists on backend (in conversation_list)
    if (currentMessages.length === 0) {
      console.log("First message added to conversation:", message);
      // Check if this conversation exists in conversation_list (backend)
      const existsOnBackend = conversation_list?.some(
        (c) => c.conversationID === safeCurrentConversationId
      );
      console.log('   existsOnBackend:', existsOnBackend);
      if (existsOnBackend) {
        dispatch(renameConversationAction({
          conversationID: safeCurrentConversationId,
          updatedAt: Date.now(),
          newConversationName: message.content.slice(0, 50), // First 50 chars as title
          conversation_name: message.content.slice(0, 50)
        }));
      } else {
        console.log("Conversation not on backend - creating it now");
        // Create conversation on backend first, then rename
        const tokenPayload = {
          conversationID: safeCurrentConversationId,
          userID: userInfo?.userID,
          companyID: userInfo?.companyID,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messageCount: 1,
          workflowsUsed: [],
          experiments: {},
          conversation_name: message.content.slice(0, 50),
        };
        console.log('   Creating conversation with payload:', tokenPayload);
        
        try {
          await dispatch(addNewConversationAction(tokenPayload));
          console.log("✅ Conversation created on backend:", safeCurrentConversationId);
        } catch (err) {
          console.warn("Failed to create conversation on backend:", err);
          // Still update local title even if backend fails
        }
        
        // Update local title
        dispatch(updateConversationName({
          conversationID: safeCurrentConversationId,
          newConversationName: message.content.slice(0, 50),
        }));
      }
    }
    console.log('📥 [useVibe.addMessage] COMPLETE');
  };

  // Single function to manage isWaitingForAI state (Web Logic)
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

  // ------------------------------------------------------------------
  // EXPERIMENT CODE (UNTOUCHED NATIVE IMPLEMENTATION)
  // ------------------------------------------------------------------
  
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

  const getExperimentData = (experimentId) => {
    if (currentConversation && currentConversation.experiments) {
      return currentConversation.experiments[experimentId] || null;
    }
    return null;
  };

  const getAllExperimentsData = () => {
    if (currentConversation && currentConversation.experiments) {
      return currentConversation.experiments;
    }
    return {};
  };

  // ------------------------------------------------------------------
  // Continued WebApp Logic Matching
  // ------------------------------------------------------------------

  // Keep the old function for backward compatibility
  const setIsWaitingForAI = (waitingForAI) => {
    setWaitingForAIState(waitingForAI);
  };

  const setOpenDataTagger = (openDataTagger) => {
    dispatch(SetOpenDataTagger(openDataTagger));
  };

  const setHasConversation = (hasConversation) => {
    dispatch(SetHasConversation(hasConversation));
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

  // Decrement credits helper
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

  // Clear the selected message
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
        if (typeof dateStr === "number") return dateStr; // Already a timestamp
        return new Date(dateStr).getTime();
      } catch (_e) {
        return Date.now();
      }
    };

    const tokenPayload = {
      conversationID: safeCurrentConversationId,
      userID: userInfo?.userID,
      companyID: userInfo?.companyID,
      createdAt: getUnixTimestamp(currentConversation.createdAt),
      updatedAt: getUnixTimestamp(currentConversation.updatedAt),
      messageCount: currentConversation.messageCount || 0,
      workflowsUsed: [],
      experiments: currentConversation.experiments,
      conversation_name: currentConversation.title || "New Chat",
    };

    dispatch(addNewConversationAction(tokenPayload));
  };

  const loadConversationList = () => {
    dispatch(loadConversationListAction(userInfo));
  };

  const addConversationFromSidebar = async (conversationID) => {
    const conversationPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/conversations/${conversationID}/conversation_state.json`;
    return dispatch(
      addConversationFromSidebarAction({ conversationID, conversationPath })
    );
  };

  const setIsSidebarOpen = (isOpen) => {
    dispatch(SetIsSidebarOpenReducer(isOpen));
  };

  const renameConversationFunction = (conversationID, newTitle) => {
    const tokenPayload = {
      conversationID: conversationID,
      updatedAt: Date.now(),
      newConversationName: newTitle,
      conversation_name: newTitle,
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
    messages, // Legacy messages array from state (matches web)
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
    
    // Chat management
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
    conversationList, // Using the new WebApp logic sort
    currentMessages,
    conversations: safeConversations,
    updateProcessingStepText,
    conversationState,
    setChatInitialized,
    clearConversations,
    setNavigating,
    navigating,
    decrementCredits,
    creditScore, 
    refreshCredits, 
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