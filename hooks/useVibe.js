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
  // const router = useRouter();
  // const pathname = usePathname();
  // const params = useLocalSearchParams(); // Get ID from route params in Expo

  // Extract conversation ID from URL params (if present)
 

  const vibeState = useSelector((state) => state.vibe);

  // New conversation-based structure
  const {
    conversations = {},
    currentConversationId = null,
    messages = [],
    isWaitingForAI = false,
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
  
  // Memoize safeConversations to avoid unnecessary re-renders if possible, 
  // but since we are inside a hook, we rely on useSelector returning the same reference if state hasn't changed.
  // The warning "Selector _temp2 returned a different result" usually comes from inline selectors or mapState functions returning new objects.
  // Here we are selecting the whole state.vibe, which changes on every action.
  // To fix the warning, we should select specific fields.

  const safeCurrentConversationId = currentConversationId || null;
  const previousConversationId = useRef(safeCurrentConversationId);

  // Get current conversation data
  const currentConversation = safeCurrentConversationId
    ? safeConversations[safeCurrentConversationId]
    : null;
  
  // Debug logging disabled for production - uncomment for debugging
  // console.log('[useVibe] State:', { conversationId: safeCurrentConversationId, messageCount: currentConversation?.messages?.length || 0 });
  
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
  const hasConversation = currentConversation ? (currentConversation?.hasConversation !== false) : true;
  const langgraphState = currentConversation?.langgraphState || null;
  const chatInitialized = currentConversation?.chatInitialized || false;
  const selectedDatasets = currentConversation?.selectedDatasets || {};
  const userMessage = currentConversation?.userMessage || "";

  // Handle navigation when conversation changes
  useEffect(() => {
    // Skip scenario pages check in mobile app

    if (previousConversationId.current !== safeCurrentConversationId) {
      if (safeCurrentConversationId) {
        // In Expo Router, navigate to dynamic route
        // Assuming your file structure is app/chat/[conversationId].tsx
        // router.replace(`/chat/${safeCurrentConversationId}`);
        // But for a single page chat app, we might just update state and stay on same screen
        console.log("Switched to conversation:", safeCurrentConversationId);
      } 
      previousConversationId.current = safeCurrentConversationId;
    }
  }, [safeCurrentConversationId, dispatch]);

  // New conversation management functions
  const createNewChat = async (workflowName = "default_workflow", title = null) => {
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
    await dispatch(addNewConversationAction(tokenPayload)).catch(err => {
      console.error("createNewChat: Failed to save to backend:", err);
    });

    return conversationId;
  };

  const switchToConversation = (conversationId) => {
    if (safeConversations[conversationId]) {
      dispatch(switchConversation(conversationId));
      // In Expo, if we are using a dynamic route, push to it
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
    await dispatch(AddMessage(message));
    if(currentMessages.length === 0){
      console.log("First message added to conversation:", message);
      dispatch(renameConversationAction({
        conversationID: safeCurrentConversationId,
        updatedAt: Date.now(),
        newConversationName: message.content.slice(0, 50),
        conversation_name: message.content.slice(0, 50)
      }));
    }
  };

  const setWaitingForAIState = (waitingForAI) => {
    try {
      dispatch(setWaitingForAI(Boolean(waitingForAI)));
    } catch (error) {
      console.error("Error in setWaitingForAIState:", error);
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
  };

  const setChatInitialized = (initialized) => {
    dispatch(SetChatInitialized(Boolean(initialized)));
  };

  const clearError = () => {
    dispatch(ClearError());
  };

  // Message editing functions
  const editMessage = (messageId, updates) => {
    dispatch(updateMessage({ messageId, updates }));
  };

  const editMessageContent = (messageId, content) => {
    dispatch(updateMessageContent({ messageId, content }));
  };

  const deleteMessage = (messageId) => {
    dispatch(removeMessage(messageId));
  };

  const getCurrentStreamingMessage = () => {
    if (!isStreaming || currentProgress.length === 0) return "";
    const latestProgress = currentProgress[currentProgress.length - 1];
    if (latestProgress.message_type === "final_result") {
      return latestProgress.message;
    }
    return latestProgress.message || "";
  };

  const refreshCredits = async () => {
    try {
      const updatedScore = await dispatch(fetchCreditScoreAction());
      return updatedScore;
    } catch (err) {
      console.error("refreshCredits failed:", err);
      throw err;
    }
  };

  const decrementCredits = async (amount = 1) => {
    dispatch(decrementCreditsAction(amount));
  };

  const addDatasetToSelection = (datasetName, isUploaded, companyName, companyId) => {
    dispatch(AddSelectedDataset({ datasetName, isUploaded, companyName, companyId }));
  };

  const removeDatasetFromSelection = (datasetName) => {
    dispatch(RemoveSelectedDataset(datasetName));
  };

  const clearAllSelectedDatasets = () => {
    dispatch(ClearSelectedDatasets());
  };

  const addUserMessage = (message) => {
    dispatch(SetUserMessage(message));
  };

  const removeUserMessage = () => {
    dispatch(ClearUserMessage());
  };

  const addExpDatasetToSelection = (expDatasetPath, datasetName) => {
    dispatch(AddSelectedExpDataset({ expDatasetPath, datasetName }));
  };

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
    if (!currentConversation) return;

    const getUnixTimestamp = (dateStr) => {
      try {
        if (typeof dateStr === 'number') return dateStr;
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
      conversation_name: currentConversation.title || "New Chat"
    };

    dispatch(addNewConversationAction(tokenPayload));
  };

  const loadConversationList = () => {
    dispatch(loadConversationListAction(userInfo));
  };

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
    messages: currentMessages, // Return current conversation's messages
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
    getCurrentStreamingMessage,
    setWaitingForAIState,
    setIsWaitingForAI,
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
    fetchAndStoreExperimentDataForConversation,
    getExperimentData,
    getAllExperimentsData,
    editMessage,
    editMessageContent,
    deleteMessage,
    addMessage,
    createNewChat,
    switchToConversation,
    updateConversationId,
    deleteConversationById,
    initializeConversations,
    conversationList: Object.values(safeConversations).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
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