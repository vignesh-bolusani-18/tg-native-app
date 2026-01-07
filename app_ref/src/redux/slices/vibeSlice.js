// src/redux/slices/impactSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Helper function to create a default conversation
const createDefaultConversation = () => {
  const conversationId = `${crypto.randomUUID()}`;
  const timestamp = new Date().toISOString();

  return {
    [conversationId]: {
      id: conversationId,
      title: "New Chat",
      workflowName: "supply_chain_manager_workflow",
      status: "active",
      createdAt: timestamp,
      updatedAt: timestamp,
      messageCount: 0,
      lastMessagePreview: "",
      messages: [],
      isWaitingForAI: false,
      processingStepText: "Thinking...",
      openDataTagger: false,
      dataTagged: false,
      dataUploaded: false,
      dataConfirmed: false,
      contextQuestionsAnswered: false,
      contextAnswersConfirmed: false,
      advancedQuestionsAnswered: false,
      advancedAnswersConfirmed: false,
      experimentStatusHistory: [],
      experiments: {},
      navigating: false,
      selectedAnalysisExperiment: null,
      analysisSystemPrompt: null,
      analysisDataPathDict: null,
      // NEW: Add all conversation-level properties
      lastMessage: null,
      isStreaming: false,
      currentProgress: [],
      error: null,
      hasConversation: true,
      langgraphState: null,
      chatInitialized: false,
      selectedDatasets: {},
      userMessage: "",
    },
  };
};

const defaultConversations = createDefaultConversation();
const defaultConversationId = Object.keys(defaultConversations)[0];

const initialState = {
  // New structure: conversations grouped by conversationId
  conversations: defaultConversations,
  currentConversationId: defaultConversationId,
  isConnected: false,
  // isStreaming: false,
  // currentProgress: [],
  // error: null,
  // lastMessage: null,
  canSendMessage: false, // Computed value: isConnected && !isStreaming
  // hasConversation: true, // Set to true since we have a default conversation
  // langgraphState: null, // Store the complete langgraph_state
  // chatInitialized: false, // Track ChatPage bootstrap across mounts

  creditScore: null, //  start TO NULL
  // selectedDatasets: {},
  // userMessage: "",
  conversation_list:[], // List of conversations 
  isSidebarOpen: false, 
};

const vibeSlice = createSlice({
  name: "vibe",
  initialState,
  reducers: {
    // Initialize conversations if they don't exist (for migration)
    initializeConversations: (state) => {
      if (!state.conversations) {
        state.conversations = {};
      }
      if (state.currentConversationId === undefined) {
        state.currentConversationId = null;
      }
    },
    // Legacy addMessage action - now routes to addMessageToConversation
    addMessage: (state, action) => {
      console.log("Redux Slice: Adding message:", action.payload);

      // Get conversationId from payload or use current
      const conversationId =
        action.payload.conversationId || state.currentConversationId;
      console.log(
        "🔍 addMessage - conversationId:",
        conversationId,
        "currentConversationId:",
        state.currentConversationId
      );

      if (conversationId) {
        // Ensure conversations object exists
        if (!state.conversations) {
          state.conversations = {};
        }

        // Use new conversation-based structure
        const message = {
          id: action.payload.id,
          type: action.payload.type,
          content: action.payload.content,
          data: action.payload.data || null,
          timestamp: action.payload.timestamp,
          toolCalls: action.payload.toolCalls || [],
          langgraphState: action.payload.langgraphState || null,
        };

        // Ensure conversation exists and is properly initialized
        if (!state.conversations[conversationId]) {
          state.conversations[conversationId] = {
            id: conversationId,
            title: `New Chat`,
            workflowName: "default_workflow",
            status: "active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messageCount: 0,
            lastMessagePreview: "",
            messages: [],
            lastMessage: null,            
            isStreaming: false,
            currentProgress: [],
            error: null,
            hasConversation: true,
            langgraphState: null,
            chatInitialized: false,
            selectedDatasets: {},
            userMessage: "",
          };
        }

        // Ensure messages array exists
        if (!state.conversations[conversationId].messages) {
          state.conversations[conversationId].messages = [];
        }

        // Update title based on first user message if it's meaningful
    const conversation = state.conversations[conversationId];
    
    // ✅ NEW: Check if this is the FIRST user message
    const isFirstUserMessage = 
      action.payload.type === "user" && 
      conversation.messages.filter(msg => msg.type === "user").length === 0;

    // Update title based on first user message 
    if (isFirstUserMessage && action.payload.content) {
      const userMessage = action.payload.content.trim();
      // Use short user messages (>=3 chars) as the conversation title
      if (userMessage.length >= 3) {
        const newTitle = userMessage.length > 40
          ? userMessage.substring(0, 40) + "..."
          : userMessage;
        
        conversation.title = newTitle;
        
        // ✅ NEW: Set a flag to trigger backend rename
        conversation.needsRename = true;
        conversation.pendingTitle = newTitle;
      }
    }

    conversation.messages.push({
      ...message,
      conversationId: conversationId,
      conversationIndex: conversation.messages.length,
    });

    conversation.messageCount = conversation.messages.length;
    conversation.lastMessagePreview = message.content?.substring(0, 100) || "";
    conversation.updatedAt = new Date().toISOString();

    if (state.currentConversationId !== conversationId) {
      state.currentConversationId = conversationId;
    }
    
    state.conversations[state.currentConversationId].hasConversation = true;
    state.conversations[state.currentConversationId].lastMessage = message;

    console.log(
      "✅ Message added to conversation:",
      conversationId,
      "Total messages:",
      conversation.messageCount
    );
  } else {
        // Fallback to legacy behavior for backward compatibility
        const messageWithConversationId = {
          ...action.payload,
          conversationId: state.currentConversationId,
        };

        // Ensure a current conversation exists; if not, create a default one
        if (!state.currentConversationId || !state.conversations[state.currentConversationId]) {
          const convs = createDefaultConversation();
          state.conversations = { ...(state.conversations || {}), ...convs };
          state.currentConversationId = Object.keys(convs)[0];
        }

        const convo = state.conversations[state.currentConversationId];
        if (!convo.messages) convo.messages = [];
        convo.messages.push({
          ...messageWithConversationId,
          conversationIndex: convo.messages.length,
        });
        convo.messageCount = convo.messages.length;
        convo.lastMessagePreview = messageWithConversationId.content?.substring(0,100) || "";
        convo.updatedAt = new Date().toISOString();
        console.log("⚠️ Fallback to legacy behavior - added message to default conversation");
      }
    },
    clearConversations: (state) => {
      // Clear all conversations and reset currentConversationId
      // Do NOT create a default conversation here - let createNewChat handle that
      // This prevents double-creation when clearConversations + createNewChat are called together
      state.conversations = {};
      state.currentConversationId = null;
    },
    receiveMessage: (state, action) => {
      const aiMessage = {
        id: Date.now(),
        type: "ai",
        timestamp: new Date().toISOString(),
        toolCalls: action.payload.toolCalls || [],
        langgraphState: action.payload.langgraphState || null,
        conversationId:
          action.payload.conversationId || state.currentConversationId,
      };
      console.log("[Vibe Slice] receiveMessage called:", action.payload);
      // Check if this message already exists to prevent duplicates (within current conversation)
      const convo = state.conversations[state.currentConversationId];
      const existingMessage = convo?.messages?.find(
        (msg) => msg.type === "ai" && msg.content === action.payload.message
      );

      if (!existingMessage) {
        if (!convo) {
          // Create a default conversation if none exists
          const convs = createDefaultConversation();
          state.conversations = { ...(state.conversations || {}), ...convs };
          state.currentConversationId = Object.keys(convs)[0];
        }
        const targetConvo = state.conversations[state.currentConversationId];
        if (!targetConvo.messages) targetConvo.messages = [];
        targetConvo.messages.push(aiMessage);
        targetConvo.messageCount = targetConvo.messages.length;
        state.conversations[state.currentConversationId].lastMessage = aiMessage;
      }

      state.conversations[state.currentConversationId].isStreaming = false;
    },
    updateLastMessage: (state, action) => {
      // state.lastMessage = action.payload;
      state.conversations[state.currentConversationId].lastMessage = action.payload;

    },
    addProgressUpdate: (state, action) => {
      // Prevent duplicate entries by checking if the same message already exists
      const existingEntry = state.conversations[state.currentConversationId].currentProgress.find(
        (entry) =>
          entry.step === action.payload.step &&
          entry.message_type === action.payload.message_type &&
          entry.message === action.payload.message
      );

      if (!existingEntry) {
        state.conversations[state.currentConversationId].currentProgress.push(action.payload);
      }
    },
    setWaitingForAI: (state, action) => {
      if (state.currentConversationId && state.conversations?.[state.currentConversationId]) {
        state.conversations[state.currentConversationId].isWaitingForAI = action.payload;
      }
    },
    setProcessingStepText: (state, action) => {
      if (state.currentConversationId && state.conversations?.[state.currentConversationId]) {
        state.conversations[state.currentConversationId].processingStepText = action.payload;
      }
    },
    setHasConversation: (state, action) => {
      // console.log("🎯 Redux: setHasConversation action called with value:", action.payload);
      // console.log("🎯 Redux: currentConversationId:", state.currentConversationId);
      
      if (
        state.currentConversationId &&
        state.conversations &&
        state.conversations[state.currentConversationId]
      ) {
        state.conversations[state.currentConversationId].hasConversation = action.payload;
        // console.log("🎯 Redux: hasConversation set to:", state.conversations[state.currentConversationId].hasConversation);
      } else {
        console.warn("⚠️ Redux: Cannot set hasConversation - conversation doesn't exist yet");
        console.warn("🎯 Redux: Available conversations:", Object.keys(state.conversations || {}));
      }
    },
    updateLangGraphState: (state, action) => {
      const { langgraph_state, conversation_id } = action.payload;
      console.log("[updateLangGraphState] langgraph_state:", langgraph_state);
      console.log("[updateLangGraphState] conversation_id:", conversation_id);
      // Update the langgraph state
      // state.langgraphState = langgraph_state;
      state.conversations[state.currentConversationId].langgraphState = langgraph_state;
      const currentNode = Object.keys(langgraph_state)[0];

      // Store conversation_id if provided (from first response)
      if (conversation_id) {
        state.currentConversationId = conversation_id;

        // Ensure conversations object exists
        if (!state.conversations) {
          state.conversations = {};
        }

        // Create conversation if it doesn't exist
        if (!state.conversations[conversation_id]) {
          const timestamp = new Date().toISOString();
          state.conversations[conversation_id] = {
            id: conversation_id,
            title: `Chat ${conversation_id.slice(-4)}`,
            workflowName: "default_workflow",
            status: "active",
            createdAt: timestamp,
            updatedAt: timestamp,
            messageCount: 0,
            lastMessagePreview: "",
            messages: [],
            lastMessage: null,           
            isStreaming: false,
            currentProgress: [],
            error: null,
            hasConversation: true,
            langgraphState: null,
            chatInitialized: false,
            selectedDatasets: {},
            userMessage: "",
          };
          state.conversations[state.currentConversationId].hasConversation = true;
        }
      }

      // Define final response states that should create AI messages
      const finalResponseStates = [
        "module_decider_final_response",
        "data_demander",
        "sample_data_fetcher",
        // "tags_generator",
        "tags_generator_final_response",
        "context_questions_generator",
        "advanced_questions_generator",
        "experiment_validator",
        "workflow_complete",
        "conversation_handler",
        "final_output_node",
      ];

      // Dictionary mapping final response states to their response keys
      const responseKeyMapping = {
        module_decider_final_response: "module_decider",
        data_demander: "data_demander",
        sample_data_fetcher: "sample_data_fetcher",
        // tags_generator: "tags_generator",
        tags_generator_final_response: "tags_generator",
        context_questions_generator: "context_question_generator",
        advanced_questions_generator: "advanced_question_generator",
        experiment_validator: "experiment_validator",
        workflow_complete: "workflow_complete",
      };

      const processingStepTextMapping = {
        module_decider:
          "Analyzing your request and determining the best module...",
        data_demander: "Preparing data requirements...",
        sample_data_fetcher: "Fetching sample data...",
        tags_generator: "Generating data tags...",
        context_question_generator: "Generating context questions...",
        advanced_question_generator: "Generating advanced questions...",
        experiment_validator: "Validating experiment configuration...",
        analysis_planner: "Preparing the analysis plan...",
        data_collector: "Collecting the data samples for the analysis...",
        code_generator: "Analysis in progress...",
        code_executor: "Executing the analysis plans...",
        explanation_generator: "Generating the explanation...",
      };

      // Check if this is a final response state
      const isFinalResponse = finalResponseStates.includes(currentNode);

      if (isFinalResponse) {
        console.log("[updateLangGraphState] isFinalResponse:", isFinalResponse);
        // Find the final response state
        let aiResponse = null;
        let responseData = null;
        let responseCode = null;
        let responseOutputScenario = null;
        let responseCodeTitle = null;
        let responseDataTitle = null;
        let responseDataID = null;
        let responseDataTotalRows = null;
        let responseDataPath = null;
        let hasS3Data = false;
        const finalStateName = currentNode;
        console.log("[updateLangGraphState] finalStateName:", finalStateName);
        const finalState = langgraph_state[finalStateName];
        console.log("[updateLangGraphState] finalState:", finalState);
        if (finalStateName === "conversation_handler") {
          aiResponse = finalState.answer;
          console.log("[updateLangGraphState] aiResponse:", aiResponse);
          state.conversations[state.currentConversationId][
            "conversation_state"
          ] = {
            ...langgraph_state[finalStateName],
            experiment_execution_state:
              state.conversations[state.currentConversationId][
                "experiment_execution_state"
              ] || null,
          };
        } else if (finalStateName === "final_output_node") {
          aiResponse = finalState.final_output?.explanation;
          responseData = finalState.final_output?.data;
          responseDataID = finalState.final_output?.data_id;
          responseDataTotalRows = finalState.final_output?.data_total_rows;
          responseCode = finalState.final_output?.code;
          responseOutputScenario = finalState.final_output?.scenarios;
          responseCodeTitle = finalState.final_output?.code_title;
          responseDataTitle = finalState.final_output?.data_title;
          responseDataPath =
            finalState.code_execution_result?.upload_status?.s3_path;
          hasS3Data = finalState.code_execution_result?.upload_status?.success;
          console.log("[updateLangGraphState] aiResponse:", aiResponse);
        } else {
          state.conversations[state.currentConversationId][
            "experiment_execution_state"
          ] = langgraph_state[finalStateName];
          const responseKey = responseKeyMapping[finalStateName];
          console.log("[updateLangGraphState] responseKey:", responseKey);

          // Handle different response structures
          if (responseKey && finalState?.response?.[responseKey]) {
            aiResponse = finalState.response[responseKey];
            console.log("[updateLangGraphState] aiResponse:", aiResponse);
          } else if (
            finalState?.response &&
            typeof finalState.response === "string"
          ) {
            aiResponse = finalState.response;
            console.log("[updateLangGraphState] aiResponse:", aiResponse);
          } else if (
            finalState?.response &&
            typeof finalState.response === "object"
          ) {
            // For sample_data_fetcher and tags_generator, the response might be an object
            // We'll store the entire response object for these cases
            aiResponse = "Data processed successfully"; // Default message
            console.log(
              "[updateLangGraphState] Object response:",
              finalState.response
            );
          }
        }

        // Extract AI response from the final state using the mapping

        // If we found an AI response, add it as a message
        if (aiResponse && typeof aiResponse === "string") {
          // Clean up the response (remove error prefixes if present)
          let cleanResponse = aiResponse;
          if (aiResponse.includes("Error in module decision:")) {
            cleanResponse =
              aiResponse.split("Error in module decision:")[1]?.trim() ||
              aiResponse;
          }
          if (aiResponse.includes("Failed to parse LLM response:")) {
            cleanResponse =
              aiResponse.split("Failed to parse LLM response:")[1]?.trim() ||
              aiResponse;
          }

          // Create AI message
          const aiMessage = {
            id: Date.now(),
            type: "ai",
            nodeName: finalStateName,
            timestamp: new Date().toISOString(),
            content: cleanResponse,
            langgraphState: finalState, // Store reference to the final state
            conversationId: conversation_id, // Add conversationId to AI message
            // Add specific data for sample_data_fetcher and tags_generator
            sampleData:
              finalStateName === "sample_data_fetcher" ? finalState : null,
            tagsData:
              finalStateName === "tags_generator" ||
              finalStateName === "tags_generator_final_response"
                ? finalState
                : null,
            data: responseData,
            dataID: responseDataID,
            dataTotalRows: responseDataTotalRows,
            code: responseCode,
            scenarios: responseOutputScenario,
            codeTitle: responseCodeTitle,
            dataTitle: responseDataTitle,
            dataPath: responseDataPath,
            hasS3Data: hasS3Data,
          };

          // Ensure conversations object exists
          if (!state.conversations) {
            state.conversations = {};
          }

          // Add message to conversation using new structure
          if (conversation_id && state.conversations[conversation_id]) {
            const conversation = state.conversations[conversation_id];
            conversation.messages.push({
              ...aiMessage,
              conversationIndex: conversation.messages.length,
            });

            // Update conversation metadata
            conversation.messageCount = conversation.messages.length;
            conversation.lastMessagePreview = cleanResponse.substring(0, 100);
            conversation.updatedAt = new Date().toISOString();

            // Update lastMessage for backward compatibility
            state.conversations[state.currentConversationId].lastMessage = aiMessage;
          } else {
            // Fallback to legacy behavior: put AI message into current conversation
            if (!state.currentConversationId || !state.conversations[state.currentConversationId]) {
              const convs = createDefaultConversation();
              state.conversations = { ...(state.conversations || {}), ...convs };
              state.currentConversationId = Object.keys(convs)[0];
            }
            const targetConvo = state.conversations[state.currentConversationId];
            if (!targetConvo.messages) targetConvo.messages = [];
            const existingMessage = targetConvo.messages.find(
              (msg) => msg.type === "ai" && msg.content === cleanResponse
            );

            if (!existingMessage) {
              targetConvo.messages.push({ ...aiMessage, conversationIndex: targetConvo.messages.length });
              targetConvo.messageCount = targetConvo.messages.length;
              state.conversations[state.currentConversationId].lastMessage = aiMessage;
            }
          }

          // Stop streaming and set waiting for AI to false for final responses
          state.conversations[state.currentConversationId].isStreaming = false;
          if (
            finalStateName === "sample_data_fetcher" ||
            finalStateName === "tags_generator"
          ) {
            let processingText = "Processing...";
            if (finalStateName === "sample_data_fetcher") {
              processingText = "Exploratory Data Analysis is in progress...";
            } else if (finalStateName === "tags_generator") {
              processingText = "Generating data tags...";
            }
            state.conversations[
              state.currentConversationId
            ].processingStepText = processingText;
          } else {
            state.conversations[
              state.currentConversationId
            ].isWaitingForAI = false;
          }
        }
      } else {
        // For intermediate states, update processing text

        const currentState = currentNode;
        let processingText = "Processing...";
        if (currentState === "module_decider") {
          processingText =
            "Analyzing your request and determining the best module...";
        } else if (currentState === "data_demander") {
          processingText = "Preparing data requirements...";
        } else if (currentState === "sample_data_fetcher") {
          processingText = "Fetching sample data...";
        } else if (currentState === "tags_generator") {
          processingText = "Generating data tags...";
        } else if (currentState === "eda_generator") {
          processingText = "Exploratory Data Analysis is in progress...";
        } else if (currentState === "tags_generator_final_response") {
          processingText = "Finalizing tag analysis...";
        } else if (currentState === "context_questions_generator") {
          processingText = "Generating context questions...";
        } else if (currentState === "experiment_validator") {
          processingText = "Validating experiment configuration...";
        } else if (processingStepTextMapping[currentState]) {
          processingText = processingStepTextMapping[currentState];
        }
        state.conversations[state.currentConversationId].processingStepText =
          processingText;
      }
    },
    clearLangGraphState: (state) => {
      if (state.currentConversationId && state.conversations?.[state.currentConversationId]) {
        state.conversations[state.currentConversationId].langgraphState = null;
      }
      state.currentConversationId = null;
    },
    updateProcessingStepText: (state, action) => {
      if (state.currentConversationId && state.conversations?.[state.currentConversationId]) {
        state.conversations[state.currentConversationId].processingStepText = action.payload;
      }
    },
    clearProgress: (state) => {
      if (state.currentConversationId && state.conversations?.[state.currentConversationId]) {
        state.conversations[state.currentConversationId].currentProgress = [];
      }
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
      // Update canSendMessage based on new connection status and current conversation streaming state (guarded)
      const isStreaming = !!state.conversations?.[state.currentConversationId]?.isStreaming;
      state.canSendMessage = action.payload && !isStreaming;
    },

    setStreamingStatus: (state, action) => {
      console.log("Redux Slice: Setting isStreaming to:", action.payload);
      // Guard existence of current conversation
      if (state.currentConversationId && state.conversations?.[state.currentConversationId]) {
        state.conversations[state.currentConversationId].isStreaming = action.payload;
      }
      // Update canSendMessage based on new streaming status
      state.canSendMessage = state.isConnected && !action.payload;
    },
    setError: (state, action) => {
      // set error on current conversation if it exists
      if (state.currentConversationId && state.conversations?.[state.currentConversationId]) {
        state.conversations[state.currentConversationId].error = action.payload;
      }
    },
    clearError: (state) => {
      if (state.currentConversationId && state.conversations?.[state.currentConversationId]) {
        state.conversations[state.currentConversationId].error = null;
      }
    },
    setChatInitialized: (state, action) => {
      if (state.currentConversationId && state.conversations?.[state.currentConversationId]) {
        state.conversations[state.currentConversationId].chatInitialized = action.payload === true;
      }
    },
    // resetChat: (state) => {
    //   // Ensure conversations object exists
    //   if (!state.conversations) {
    //     state.conversations = {};
    //   }

    //   // Clear current conversation messages but keep conversation metadata
    //   if (
    //     state.currentConversationId &&
    //     state.conversations[state.currentConversationId]
    //   ) {
    //     state.conversations[state.currentConversationId].messages = [];
    //     state.conversations[state.currentConversationId].messageCount = 0;
    //     state.conversations[state.currentConversationId].lastMessagePreview =
    //       "";
    //     state.conversations[state.currentConversationId].updatedAt =
    //       new Date().toISOString();
    //   }

    //   // Legacy cleanup
    //   state.messages = [];
    //   state.currentProgress = [];
    //   state.error = null;
    //   state.lastMessage = null;
    //   state.isStreaming = false;
    //   state.canSendMessage = state.isConnected; // Keep existing connection status
    //   state.isWaitingForAI = false;
    //   state.hasConversation = false;
    //   state.langgraphState = null;
    //   state.currentConversationId = null; // Reset conversation ID for new chat
    //   state.processingStepText = "Thinking...";
    //   state.openDataTagger = false;
    //   state.dataTagged = initialState.dataTagged;
    //   state.dataUploaded = initialState.dataUploaded;
    //   state.dataConfirmed = initialState.dataConfirmed;
    //   state.contextQuestionsAnswered = initialState.contextQuestionsAnswered;
    //   state.contextAnswersConfirmed = initialState.contextAnswersConfirmed;
    //   state.experimentTriggered = initialState.experimentTriggered;
    //   state.experimentId = initialState.experimentId;
    //   state.experimentStatusHistory = initialState.experimentStatusHistory;
    // },
    setDataTagged: (state, action) => {
      if (state.currentConversationId && state.conversations?.[state.currentConversationId]) {
        state.conversations[state.currentConversationId].dataTagged = action.payload;
      }
    },
    createFinalMessageFromProgress: (state) => {
      // This function is kept for backward compatibility
      // With the new WebSocket structure, final messages are created directly
      // from final response states, so this function is less critical

      // Find the last AI understanding message from progress
      const lastAIUnderstanding = state.conversations[state.currentConversationId].currentProgress
        .filter((progress) => progress.message_type === "ai_understanding")
        .pop();

      if (lastAIUnderstanding) {
        // Extract the actual AI message from "AI: message" format
        const aiMessageContent = lastAIUnderstanding.message.replace(
          /^AI:\s*/,
          ""
        );

        // Create final AI message from the last understanding
        const aiMessage = {
          id: Date.now(),
          type: "ai",
          content: aiMessageContent,
          timestamp: new Date().toISOString(),
          toolCalls: [],
          conversationId: state.currentConversationId, // Add conversationId to final message
        };

        // Check if this message already exists to prevent duplicates
        const existingMessage = state.messages.find(
          (msg) => msg.type === "ai" && msg.content === aiMessageContent
        );

        if (!existingMessage) {
          if (!state.currentConversationId || !state.conversations[state.currentConversationId]) {
            const convs = createDefaultConversation();
            state.conversations = { ...(state.conversations || {}), ...convs };
            state.currentConversationId = Object.keys(convs)[0];
          }
          const targetConvo = state.conversations[state.currentConversationId];
          if (!targetConvo.messages) targetConvo.messages = [];
          targetConvo.messages.push(aiMessage);
          targetConvo.messageCount = targetConvo.messages.length;
          state.conversations[state.currentConversationId].lastMessage = aiMessage;
        }
      }

      // Clear progress after creating final message
      state.conversations[state.currentConversationId].currentProgress = [];
      // Stop streaming when final message is created
      state.conversations[state.currentConversationId].isStreaming = false;
      state.conversations[state.currentConversationId].isWaitingForAI = false;
    },
    updateMessage: (state, action) => {
      const { messageId, updates } = action.payload;

      // First try to update in the current conversation
      if (
        state.currentConversationId &&
        state.conversations[state.currentConversationId]
      ) {
        const conversation = state.conversations[state.currentConversationId];
        const messageIndex = conversation.messages.findIndex(
          (msg) => msg.id === messageId
        );

        if (messageIndex !== -1) {
          // Update the message with new data while preserving existing fields
          conversation.messages[messageIndex] = {
            ...conversation.messages[messageIndex],
            ...updates,
            // Ensure conversationId is preserved or updated
            conversationId:
              updates.conversationId ||
              conversation.messages[messageIndex].conversationId,
          };

          // Update lastMessage if this was the last message
          if (state.conversations[state.currentConversationId].lastMessage && state.conversations[state.currentConversationId].lastMessage.id === messageId) {
            state.conversations[state.currentConversationId].lastMessage = conversation.messages[messageIndex];
          }

          // Update conversation metadata
          conversation.updatedAt = new Date().toISOString();
          return;
        }
      }

      // Fallback to legacy messages array if conversation update fails
      if (state.messages && Array.isArray(state.messages)) {
        const messageIndex = state.messages.findIndex(
          (msg) => msg.id === messageId
        );

        if (messageIndex !== -1) {
          // Update the message with new data while preserving existing fields
          state.messages[messageIndex] = {
            ...state.messages[messageIndex],
            ...updates,
            // Ensure conversationId is preserved or updated
            conversationId:
              updates.conversationId ||
              state.messages[messageIndex].conversationId,
          };

          // Update lastMessage if this was the last message
          if (state.conversations[state.currentConversationId].lastMessage && state.conversations[state.currentConversationId].lastMessage.id === messageId) {
            state.conversations[state.currentConversationId].lastMessage = state.messages[messageIndex];
          }
        }
      }
    },
    updateMessageContent: (state, action) => {
      const { messageId, content } = action.payload;

      // First try to update in the current conversation
      if (
        state.currentConversationId &&
        state.conversations[state.currentConversationId]
      ) {
        const conversation = state.conversations[state.currentConversationId];
        const messageIndex = conversation.messages.findIndex(
          (msg) => msg.id === messageId
        );

        if (messageIndex !== -1) {
          conversation.messages[messageIndex].content = content;

          // Update lastMessage if this was the last message
          if (state.conversations[state.currentConversationId].lastMessage && state.conversations[state.currentConversationId].lastMessage.id === messageId) {
            state.conversations[state.currentConversationId].lastMessage.content = content;
          }

          // Update conversation metadata
          conversation.updatedAt = new Date().toISOString();
          return;
        }
      }

      // Fallback to legacy messages array if conversation update fails
      if (state.messages && Array.isArray(state.messages)) {
        const messageIndex = state.messages.findIndex(
          (msg) => msg.id === messageId
        );

        if (messageIndex !== -1) {
          state.messages[messageIndex].content = content;

          // Update lastMessage if this was the last message
          if (state.conversations[state.currentConversationId].lastMessage && state.conversations[state.currentConversationId].lastMessage.id === messageId) {
            state.conversations[state.currentConversationId].lastMessage.content = content;
          }
        }
      }
    },
    removeMessage: (state, action) => {
      const messageId = action.payload;

      // First try to remove from the current conversation
      if (
        state.currentConversationId &&
        state.conversations[state.currentConversationId]
      ) {
        const conversation = state.conversations[state.currentConversationId];
        const messageIndex = conversation.messages.findIndex(
          (msg) => msg.id === messageId
        );

        if (messageIndex !== -1) {
          conversation.messages.splice(messageIndex, 1);

          // Update conversation metadata
          conversation.messageCount = conversation.messages.length;
          conversation.updatedAt = new Date().toISOString();

          // Update lastMessage if this was the last message
          if (state.conversations[state.currentConversationId].lastMessage && state.conversations[state.currentConversationId].lastMessage.id === messageId) {
            state.conversations[state.currentConversationId].lastMessage =
              conversation.messages[conversation.messages.length - 1] || null;
          }
          return;
        }
      }

      // Fallback to legacy messages array if conversation removal fails
      if (state.messages && Array.isArray(state.messages)) {
        const messageIndex = state.messages.findIndex(
          (msg) => msg.id === messageId
        );

        if (messageIndex !== -1) {
          state.messages.splice(messageIndex, 1);

          // Update lastMessage if this was the last message
          if (state.conversations[state.currentConversationId].lastMessage && state.conversations[state.currentConversationId].lastMessage.id === messageId) {
            state.conversations[state.currentConversationId].lastMessage =
              state.messages[state.messages.length - 1] || null;
          }
        }
      }
    },
    updateConversationId: (state, action) => {
      console.log("Redux Slice: Updating conversation ID to:", action.payload);
      state.currentConversationId = action.payload;
    },
    setOpenDataTagger: (state, action) => {
      if (state.currentConversationId && state.conversations?.[state.currentConversationId]) {
        state.conversations[state.currentConversationId].openDataTagger = action.payload;
      }
    },
    setDataUploaded: (state, action) => {
      if (state.currentConversationId && state.conversations?.[state.currentConversationId]) {
        state.conversations[state.currentConversationId].dataUploaded = action.payload;
      }
    },
    setDataConfirmed: (state, action) => {
      if (state.currentConversationId && state.conversations?.[state.currentConversationId]) {
        state.conversations[state.currentConversationId].dataConfirmed = action.payload;
      }
    },
    setContextQuestionsAnswered: (state, action) => {
      state.conversations[
        state.currentConversationId
      ].contextQuestionsAnswered = action.payload;
    },
    setContextAnswersConfirmed: (state, action) => {
      state.conversations[state.currentConversationId].contextAnswersConfirmed =
        action.payload;
    },
    setAdvancedQuestionsAnswered: (state, action) => {
      state.conversations[
        state.currentConversationId
      ].advancedQuestionsAnswered = action.payload;
    },
    setAdvancedAnswersConfirmed: (state, action) => {
      state.conversations[
        state.currentConversationId
      ].advancedAnswersConfirmed = action.payload;
    },
    setNavigating: (state, action) => {
      state.conversations[state.currentConversationId].navigating =
        action.payload;
    },
    setExperimentStatusHistory: (state, action) => {
      state.conversations[state.currentConversationId].experimentStatusHistory =
        action.payload;
    },
    setExperimentData: (state, action) => {
      const { experimentId, experimentData } = action.payload;
      if (
        state.currentConversationId &&
        state.conversations[state.currentConversationId]
      ) {
        const conversation = state.conversations[state.currentConversationId];
        // Initialize experiments object if it doesn't exist
        if (!conversation.experiments) {
          conversation.experiments = {};
        }

        // Store experiment data with experimentId as key
        conversation.experiments[experimentId] = experimentData;
      }
    },

    // New conversation management actions
    createNewConversation: (state, action) => {
      // Ensure conversations object exists
      if (!state.conversations) {
        state.conversations = {};
      }

      const { workflowName, title, conversationId } = action.payload;
      // const conversationId = `${crypto.randomUUID()}`;
      const timestamp = new Date().toISOString();

      // Generate a meaningful title based on workflow
      let generatedTitle = title;
      if (!generatedTitle) {
        const workflowTitles = {
          supply_chain_manager_workflow: "Supply Chain Analysis",
          data_analysis_workflow: "Data Analysis",
          inventory_optimization: "Inventory Optimization",
          demand_forecasting: "Demand Forecasting",
          default_workflow: "New Chat",
        };
        generatedTitle =
          workflowTitles[workflowName] ||
          `New ${workflowName
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())}`;
      }

      state.conversations[conversationId] = {
        id: conversationId,
        title: generatedTitle,
        workflowName: workflowName || "default_workflow",
        status: "active",
        createdAt: timestamp,
        updatedAt: timestamp,
        messageCount: 0,
        lastMessagePreview: "",
        messages: [],
        isWaitingForAI: false,
        processingStepText: "Thinking...",
        openDataTagger: false,
        dataTagged: false,
        dataUploaded: false,
        dataConfirmed: false,
        contextQuestionsAnswered: false,
        contextAnswersConfirmed: false,
        advancedQuestionsAnswered: false,
        advancedAnswersConfirmed: false,
        experimentStatusHistory: [],
        experiments: {}, // Store experiment data by experimentId
        navigating: false,
        selectedAnalysisExperiment: null,
        analysisSystemPrompt: null,
        analysisDataPathDict: null,
        navigating: false,
        lastMessage: null,
        isStreaming: false,
        currentProgress: [],
        error: null,
        hasConversation: true,
        langgraphState: null,
        chatInitialized: false,
        selectedDatasets: {},
        userMessage: "",
      };
      console.log("Redux Slice: Creating new conversation:", conversationId);
      state.currentConversationId = conversationId;

      state.conversations[state.currentConversationId].hasConversation  = true;

      // Clear any existing error
      state.conversations[state.currentConversationId].error = null;
    },

    switchConversation: (state, action) => {
      // Ensure conversations object exists
      if (!state.conversations) {
        state.conversations = {};
      }

      const conversationId = action.payload;
      if (state.conversations[conversationId]) {
        state.currentConversationId = conversationId;
      }
    },

    deleteConversation: (state, action) => {
      // Ensure conversations object exists
      if (!state.conversations) {
        state.conversations = {};
      }

      const conversationId = action.payload;

      // Delete the conversation
      if (state.conversations[conversationId]) {
        delete state.conversations[conversationId];

        // If we deleted the current conversation, switch to another one or clear
        if (state.currentConversationId === conversationId) {
          const remainingConversations = Object.keys(state.conversations);
          if (remainingConversations.length > 0) {
            // Switch to the most recent conversation
            const sortedConversations = remainingConversations.sort((a, b) => {
              const timeA = new Date(
                state.conversations[a].updatedAt
              ).getTime();
              const timeB = new Date(
                state.conversations[b].updatedAt
              ).getTime();
              return timeB - timeA;
            });
            state.currentConversationId = sortedConversations[0];
          } else {
            // No conversations left - create a default conversation
            const defaultConvs = createDefaultConversation();
            state.conversations = defaultConvs;
            state.currentConversationId = Object.keys(defaultConvs)[0];
            state.conversations[state.currentConversationId].hasConversation = true;
          }
        }
      }
    },

    // Debug action to check state structure
    debugState: (state) => {
      console.log("🔍 Debug State:", {
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        hasConversation: state.conversations[state.currentConversationId].hasConversation,
        conversationsType: typeof state.conversations,
        conversationsKeys: state.conversations
          ? Object.keys(state.conversations)
          : "undefined",
      });
    },
    //actions for credit score
    setCreditScore: (state, action) => {
      state.creditScore = action.payload;
    },
    decrementCreditScore: (state, action) => {
      state.creditScore = state.creditScore - action.payload;
    },

    addSelectedDataset: (state, action) => {
      const { datasetName, isUploaded, companyName, companyId } =
        action.payload;

      // CRITICAL FIX: Ensure selectedDatasets exists before accessing it
      if (!state.conversations[state.currentConversationId].selectedDatasets) {
        state.conversations[state.currentConversationId].selectedDatasets = {};
      }

      // Construct the full path based on upload status
      let fullPath;
      if (isUploaded) {
        // File uploaded: accounts/{companyName}/{companyId}/customer_data/data_library/uploads/{datasetName}.csv
        fullPath = `accounts/${companyName}_${companyId}/customer_data/data_library/uploads/${datasetName}.csv`;
      } else {
        // API processed data: accounts/{companyName}/{companyId}/customer_data/data_library/api_processed_data/{datasetName}.csv
        fullPath = `accounts/${companyName}_${companyId}/customer_data/data_library/api_processed_data/${datasetName}.csv`;
      }

      if (state.conversations[state.currentConversationId].selectedDatasets[datasetName]) {
        // Dataset already exists, increment count
        state.conversations[state.currentConversationId].selectedDatasets[datasetName].count += 1;
      } else {
        // New dataset, add to dictionary
        state.conversations[state.currentConversationId].selectedDatasets[datasetName] = {
          path: fullPath,
          count: 1,
        };
      }

      console.log(
        "📊 Added dataset:",
        datasetName,
        "Count:",
        state.conversations[state.currentConversationId].selectedDatasets[datasetName].count
      );
      console.log("📊 Path:", fullPath);
    },

    // Also fix removeSelectedDataset to ensure selectedDatasets exists:

    removeSelectedDataset: (state, action) => {
      const datasetName = action.payload;

      // CRITICAL FIX: Ensure selectedDatasets exists before accessing it
      if (!state.conversations[state.currentConversationId].selectedDatasets) {
        state.conversations[state.currentConversationId].selectedDatasets = {};
        return; // Nothing to remove if it doesn't exist
      }

      if (state.conversations[state.currentConversationId].selectedDatasets[datasetName]) {
        // Decrement count
        state.conversations[state.currentConversationId].selectedDatasets[datasetName].count -= 1;

        // If count reaches 0, remove from dictionary
        if (state.conversations[state.currentConversationId].selectedDatasets[datasetName].count <= 0) {
          delete state.conversations[state.currentConversationId].selectedDatasets[datasetName];
          console.log("📊 Removed dataset completely:", datasetName);
        } else {
          console.log(
            "📊 Decremented dataset count:",
            datasetName,
            "Count:",
            state.conversations[state.currentConversationId].selectedDatasets[datasetName].count
          );
        }
      }
    },

    // Clear all selected datasets
    clearSelectedDatasets: (state) => {
      state.conversations[state.currentConversationId].selectedDatasets = {};
      console.log("📊 Cleared all selected datasets");
    },
    // Set the selected message (typed by user)
    setUserMessage: (state, action) => {
     //  state.userMessage = action.payload;
      if(state.currentConversationId && state.conversations?.[state.currentConversationId]) {
       state.conversations[state.currentConversationId].userMessage = action.payload;
      console.log("💬 Set selected message:", action.payload);
      }
    },

    // Clear the selected message
    clearUserMessage: (state) => {
      state.conversations[state.currentConversationId].userMessage = "";
      console.log("💬 Cleared selected message");
    },

    addSelectedExpDataset: (state, action) => {
      const { expDatasetPath, datasetName } = action.payload;

      // CRITICAL FIX: Ensure selectedDatasets exists before accessing it
      if (!state.conversations[state.currentConversationId].selectedDatasets) {
        state.conversations[state.currentConversationId].selectedDatasets = {};
      }

      // Construct the full path based on upload status
      let fullPath = expDatasetPath;
    

      if (state.conversations[state.currentConversationId].selectedDatasets[datasetName]) {
        // Dataset already exists, increment count
        state.conversations[state.currentConversationId].selectedDatasets[datasetName].count += 1;
      } else {
        // New dataset, add to dictionary
        state.conversations[state.currentConversationId].selectedDatasets[datasetName] = {
          path: fullPath,
          count: 1,
        };
      }

      console.log(
        "📊 Added dataset:",
        datasetName,
        "Count:",
        state.conversations[state.currentConversationId].selectedDatasets[datasetName].count
      );
      console.log("📊 Path:", fullPath);
    },
    setSelectedAnalysisExperiment: (state, action) => {
      if (
        state.currentConversationId &&
        state.conversations[state.currentConversationId]
      ) {
        state.conversations[
          state.currentConversationId
        ].selectedAnalysisExperiment = action.payload;
      }
    },
    setAnalysisSystemPrompt: (state, action) => {
      if (
        state.currentConversationId &&
        state.conversations[state.currentConversationId]
      ) {
        state.conversations[state.currentConversationId].analysisSystemPrompt =
          action.payload;
      }
    },
    setAnalysisDataPathDict: (state, action) => {
      if (
        state.currentConversationId &&
        state.conversations[state.currentConversationId]
      ) {
        state.conversations[state.currentConversationId].analysisDataPathDict =
          action.payload;
      }
    },
    clearSelectedAnalysisExperiment: (state) => {
      if (
        state.currentConversationId &&
        state.conversations[state.currentConversationId]
      ) {
        state.conversations[
          state.currentConversationId
        ].selectedAnalysisExperiment = null;
        state.conversations[state.currentConversationId].analysisSystemPrompt =
          null;
        state.conversations[state.currentConversationId].analysisDataPathDict =
          null;
      }
    },

    loadConversations: (state, action) => {
      state.conversation_list = action.payload;
    },

addConversation: (state, action) => {
  console.log("vibeSlice addConversation:", action.payload);
  
  // Check if conversation already exists
  const exists = state.conversation_list.find(
    c => c.conversationID === action.payload.conversationID
  );
  
  if (!exists) {
    // Add to beginning of list (most recent)
    state.conversation_list.unshift(action.payload);
    console.log("Added new conversation to list");
  } else {
    console.log("Conversation already exists in list, skipping");
  }
},
    
    selectConversation: (state, action) => {
  const { conversationID, response } = action.payload;
  
  // Helper function to format date consistently
  const formatDate = (date) => {
    if (!isNaN(date)) {
      const dateObj = new Date(date);
      const datePart = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(dateObj);

      const timePart = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      }).format(dateObj);

      return `${datePart}, at ${timePart}`;
    }
    return date;
  };
  
  // Ensure the loaded conversation has all required properties
  const loadedConversation = {
    // Default/fallback properties
    id: conversationID,
    title: `Chat ${conversationID.slice(-4)}`,
    workflowName: "default_workflow",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messageCount: 0,
    lastMessagePreview: "",
    messages: [],
    lastMessage: null,
    isStreaming: false,
    currentProgress: [],
    error: null,
    hasConversation: true,
    langgraphState: null,
    chatInitialized: false,
    selectedDatasets: {},
    userMessage: "",
    experiments: {},
    conversation_state: null,
    // Override with actual response data
    ...response,
    // Ensure messages is always an array
    messages: response?.messages ? (Array.isArray(response.messages) ? response.messages : []) : [],
  };
  
  // Format timestamps for consistency
  if (loadedConversation.createdAt) {
    loadedConversation.createdAt = formatDate(loadedConversation.createdAt);
  }
  if (loadedConversation.updatedAt) {
    loadedConversation.updatedAt = formatDate(loadedConversation.updatedAt);
  }
  
  state.conversations[conversationID] = loadedConversation;
  state.currentConversationId = conversationID;
},

setIsSidebarOpenReducer: (state, action) => {
      state.isSidebarOpen = action.payload;
     },

updateConversationName: (state, action) => {
  const { conversationID, newConversationName } = action.payload;
  state.conversation_list = state.conversation_list.map((conv) => {
    if (conv.conversationID === conversationID) {
      return { ...conv, conversation_name: newConversationName };
    }
    return conv;
  });
  if (state.currentConversationId === conversationID) {
    state.conversations[conversationID].title = newConversationName;
  }
},

 removeConversation : (state, action) => {
  const conversationID = action.payload;
  state.conversation_list = state.conversation_list.filter(
    (conv) => conv.conversationID !== conversationID
  );

    if (state.currentConversationId === conversationID) {
    state.currentConversationId =
      state.conversation_list.length > 0
        ? state.conversation_list[0].conversationID
        : null;

  }

  },

  },
});

export const {
  addMessage,
  updateLastMessage,
  addProgressUpdate,
  clearProgress,
  setConnectionStatus,
  setStreamingStatus,
  setError,
  clearError,
  // resetChat,
  createFinalMessageFromProgress,
  setWaitingForAI,
  setHasConversation,
  updateLangGraphState,
  clearLangGraphState,
  setProcessingStepText,
  updateMessage,
  updateMessageContent,
  removeMessage,
  updateConversationId,
  setOpenDataTagger,
  setDataTagged,
  setDataUploaded,
  setDataConfirmed,
  setContextQuestionsAnswered,
  setContextAnswersConfirmed,
  setAdvancedQuestionsAnswered,
  setAdvancedAnswersConfirmed,
  setExperimentTriggered,
  setExperimentId,
  setExperimentStatusHistory,
  setExperimentData,
  setConversationExperimentTriggered,
  setConversationExperimentId,
  setConversationExperimentStatusHistory,
  createNewConversation,
  switchConversation,
  deleteConversation,
  debugState,
  initializeConversations,
  updateProcessingStepText,
  setChatInitialized,
  clearConversations,
  setNavigating,
  //credit score actions
  setCreditScore,
  decrementCreditScore,
  addSelectedDataset,
  removeSelectedDataset,
  clearSelectedDatasets,
  setUserMessage,
  clearUserMessage,
  addSelectedExpDataset,
  loadConversations,
  addConversation,
  selectConversation,
  setSelectedAnalysisExperiment,
  setAnalysisSystemPrompt,
  setAnalysisDataPathDict,
  clearSelectedAnalysisExperiment,
  setIsSidebarOpenReducer,
  updateConversationName,
  removeConversation,
} = vibeSlice.actions;

export default vibeSlice.reducer;
