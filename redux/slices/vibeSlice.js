// D:\TG_REACT_NATIVE_MOBILE_APP\redux\slices\vibeSlice.js
import { createSlice } from "@reduxjs/toolkit";
import "react-native-get-random-values"; // Required for UUID in React Native
import { v4 as uuidv4 } from "uuid";

// Helper function to create a default conversation
const createDefaultConversation = () => {
  const conversationId = uuidv4(); // Changed from crypto.randomUUID()
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
  canSendMessage: false, 
  creditScore: 100, // Default to 100 to allow UI interaction before fetch
  conversation_list: [], 
  isSidebarOpen: false,
  experiments_list: [], // List of experiments for the current company
  currentCompany: null, // Current selected company
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
      if (
        state.currentConversationId &&
        state.conversations &&
        state.conversations[state.currentConversationId]
      ) {
        state.conversations[state.currentConversationId].hasConversation = action.payload;
      } else {
        console.warn("⚠️ Redux: Cannot set hasConversation - conversation doesn't exist yet");
        console.warn("🎯 Redux: Available conversations:", Object.keys(state.conversations || {}));
      }
    },
    updateLangGraphState: (state, action) => {
      const { langgraph_state, conversation_id } = action.payload;
      
      console.log('\n' + '🔴'.repeat(30));
      console.log('🔴 [updateLangGraphState] REDUCER CALLED');
      console.log('🔴'.repeat(30));
      console.log('🔴 [updateLangGraphState] langgraph_state keys:', Object.keys(langgraph_state || {}));
      console.log('🔴 [updateLangGraphState] conversation_id from payload:', conversation_id);
      console.log('🔴 [updateLangGraphState] currentConversationId in state:', state.currentConversationId);
      console.log('🔴 [updateLangGraphState] Full langgraph_state:', JSON.stringify(langgraph_state, null, 2).substring(0, 1000));
      
      // Ensure conversations object exists
      if (!state.conversations) {
        state.conversations = {};
        console.log("[updateLangGraphState] Created conversations object");
      }
      
      // Use conversation_id from payload OR current conversation
      const targetConversationId = conversation_id || state.currentConversationId;
      
      // Store conversation_id if provided (from first response)
      if (conversation_id && conversation_id !== state.currentConversationId) {
        state.currentConversationId = conversation_id;
        console.log("[updateLangGraphState] Updated currentConversationId to:", conversation_id);
      }

      // Create conversation if it doesn't exist
      if (!state.conversations[targetConversationId]) {
        const timestamp = new Date().toISOString();
        state.conversations[targetConversationId] = {
          id: targetConversationId,
          title: `Chat ${targetConversationId.slice(-4)}`,
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
        console.log("[updateLangGraphState] Created conversation:", targetConversationId);
      }
      
      // NOW it's safe to access the conversation
      state.conversations[targetConversationId].langgraphState = langgraph_state;
      const currentNode = Object.keys(langgraph_state)[0];
      console.log("[updateLangGraphState] currentNode:", currentNode);

      // Define final response states that should create AI messages
      const finalResponseStates = [
        "module_decider_final_response",
        "data_demander",
        "sample_data_fetcher",
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
        tags_generator_final_response: "tags_generator",
        context_questions_generator: "context_question_generator",
        advanced_questions_generator: "advanced_question_generator",
        experiment_validator: "experiment_validator",
        workflow_complete: "workflow_complete",
      };

      const processingStepTextMapping = {
        module_decider: "Analyzing your request and determining the best module...",
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

      console.log('🔴 [updateLangGraphState] currentNode:', currentNode);
      console.log('🔴 [updateLangGraphState] isFinalResponse:', isFinalResponse);
      console.log('🔴 [updateLangGraphState] finalResponseStates list:', finalResponseStates);

      if (isFinalResponse) {
        console.log('🔴 [updateLangGraphState] ✅ IS FINAL RESPONSE - Processing...');
        console.log("🔴 [updateLangGraphState] isFinalResponse:", isFinalResponse);
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
        console.log("🔴 [updateLangGraphState] finalStateName:", finalStateName);
        const finalState = langgraph_state[finalStateName];
        console.log("🔴 [updateLangGraphState] finalState keys:", finalState ? Object.keys(finalState) : 'NULL');
        console.log("🔴 [updateLangGraphState] finalState.answer:", finalState?.answer);
        console.log("🔴 [updateLangGraphState] finalState.response:", finalState?.response);
        console.log("🔴 [updateLangGraphState] Full finalState:", JSON.stringify(finalState, null, 2).substring(0, 500));
        
        if (finalStateName === "conversation_handler") {
          aiResponse = finalState.answer;
          console.log("🔴 [updateLangGraphState] 🎯 CONVERSATION_HANDLER - aiResponse:", aiResponse ? aiResponse.substring(0, 100) : 'NULL/EMPTY');
          state.conversations[targetConversationId]["conversation_state"] = {
            ...langgraph_state[finalStateName],
            experiment_execution_state:
              state.conversations[targetConversationId]["experiment_execution_state"] || null,
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
          responseDataPath = finalState.code_execution_result?.upload_status?.s3_path;
          hasS3Data = finalState.code_execution_result?.upload_status?.success;
          console.log("[updateLangGraphState] aiResponse:", aiResponse);
        } else {
          state.conversations[targetConversationId]["experiment_execution_state"] = langgraph_state[finalStateName];
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
            aiResponse = "Data processed successfully"; // Default message
            console.log(
              "[updateLangGraphState] Object response:",
              finalState.response
            );
          }
        }

        // If we found an AI response, add it as a message
        if (aiResponse && typeof aiResponse === "string") {
          console.log('🔴 [updateLangGraphState] ✅✅✅ AI RESPONSE FOUND - CREATING MESSAGE');
          console.log('🔴 [updateLangGraphState] aiResponse type:', typeof aiResponse);
          console.log('🔴 [updateLangGraphState] aiResponse length:', aiResponse.length);
          console.log('🔴 [updateLangGraphState] aiResponse preview:', aiResponse.substring(0, 200));
          // Clean up the response
          let cleanResponse = aiResponse;
          if (aiResponse.includes("Error in module decision:")) {
            cleanResponse = aiResponse.split("Error in module decision:")[1]?.trim() || aiResponse;
          }
          if (aiResponse.includes("Failed to parse LLM response:")) {
            cleanResponse = aiResponse.split("Failed to parse LLM response:")[1]?.trim() || aiResponse;
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
            sampleData: finalStateName === "sample_data_fetcher" ? finalState : null,
            tagsData: (finalStateName === "tags_generator" || finalStateName === "tags_generator_final_response") ? finalState : null,
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

          // Add message to conversation using targetConversationId
          console.log("🔴 [updateLangGraphState] Adding AI message to conversation:", targetConversationId);
          console.log("🔴 [updateLangGraphState] Conversation exists:", !!state.conversations[targetConversationId]);
          console.log("🔴 [updateLangGraphState] Available conversations:", Object.keys(state.conversations));
          
          if (state.conversations[targetConversationId]) {
            const conversation = state.conversations[targetConversationId];
            console.log("🔴 [updateLangGraphState] Conversation messages before:", conversation.messages?.length || 0);
            if (!conversation.messages) {
              conversation.messages = [];
              console.log("🔴 [updateLangGraphState] Created messages array");
            }
            conversation.messages.push({
              ...aiMessage,
              conversationIndex: conversation.messages.length,
            });
            console.log("🔴 [updateLangGraphState] ✅ MESSAGE PUSHED! Messages after:", conversation.messages.length);

            // Update conversation metadata
            conversation.messageCount = conversation.messages.length;
            console.log("[updateLangGraphState] Updated messageCount:", conversation.messageCount);
            conversation.lastMessagePreview = cleanResponse.substring(0, 100);
            conversation.updatedAt = new Date().toISOString();

            // Update lastMessage for backward compatibility
            state.conversations[targetConversationId].lastMessage = aiMessage;
          } else {
            console.log("[updateLangGraphState] Conversation not found, creating fallback");
            // Fallback to legacy behavior
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
          state.conversations[targetConversationId].isStreaming = false;
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
            state.conversations[targetConversationId].processingStepText = processingText;
          } else {
            state.conversations[targetConversationId].isWaitingForAI = false;
          }
        }
      } else {
        // For intermediate states, update processing text
        const currentState = currentNode;
        let processingText = "Processing...";
        if (currentState === "module_decider") {
          processingText = "Analyzing your request and determining the best module...";
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
        if (state.conversations[targetConversationId]) {
          state.conversations[targetConversationId].processingStepText = processingText;
        }
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
      const isStreaming = !!state.conversations?.[state.currentConversationId]?.isStreaming;
      state.canSendMessage = action.payload && !isStreaming;
    },
    setStreamingStatus: (state, action) => {
      console.log("Redux Slice: Setting isStreaming to:", action.payload);
      if (state.currentConversationId && state.conversations?.[state.currentConversationId]) {
        state.conversations[state.currentConversationId].isStreaming = action.payload;
      }
      state.canSendMessage = state.isConnected && !action.payload;
    },
    setError: (state, action) => {
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
    setDataTagged: (state, action) => {
      if (state.currentConversationId && state.conversations?.[state.currentConversationId]) {
        state.conversations[state.currentConversationId].dataTagged = action.payload;
      }
    },
    createFinalMessageFromProgress: (state) => {
      // Find the last AI understanding message from progress
      const lastAIUnderstanding = state.conversations[state.currentConversationId].currentProgress
        .filter((progress) => progress.message_type === "ai_understanding")
        .pop();

      if (lastAIUnderstanding) {
        const aiMessageContent = lastAIUnderstanding.message.replace(/^AI:\s*/,"");

        const aiMessage = {
          id: Date.now(),
          type: "ai",
          content: aiMessageContent,
          timestamp: new Date().toISOString(),
          toolCalls: [],
          conversationId: state.currentConversationId,
        };

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

      state.conversations[state.currentConversationId].currentProgress = [];
      state.conversations[state.currentConversationId].isStreaming = false;
      state.conversations[state.currentConversationId].isWaitingForAI = false;
    },
    updateMessage: (state, action) => {
      const { messageId, updates } = action.payload;
      if (state.currentConversationId && state.conversations[state.currentConversationId]) {
        const conversation = state.conversations[state.currentConversationId];
        const messageIndex = conversation.messages.findIndex((msg) => msg.id === messageId);

        if (messageIndex !== -1) {
          conversation.messages[messageIndex] = {
            ...conversation.messages[messageIndex],
            ...updates,
            conversationId: updates.conversationId || conversation.messages[messageIndex].conversationId,
          };

          if (state.conversations[state.currentConversationId].lastMessage && state.conversations[state.currentConversationId].lastMessage.id === messageId) {
            state.conversations[state.currentConversationId].lastMessage = conversation.messages[messageIndex];
          }
          conversation.updatedAt = new Date().toISOString();
          return;
        }
      }
    },
    updateMessageContent: (state, action) => {
      const { messageId, content } = action.payload;
      if (state.currentConversationId && state.conversations[state.currentConversationId]) {
        const conversation = state.conversations[state.currentConversationId];
        const messageIndex = conversation.messages.findIndex((msg) => msg.id === messageId);

        if (messageIndex !== -1) {
          conversation.messages[messageIndex].content = content;
          if (state.conversations[state.currentConversationId].lastMessage && state.conversations[state.currentConversationId].lastMessage.id === messageId) {
            state.conversations[state.currentConversationId].lastMessage.content = content;
          }
          conversation.updatedAt = new Date().toISOString();
          return;
        }
      }
    },
    removeMessage: (state, action) => {
      const messageId = action.payload;
      if (state.currentConversationId && state.conversations[state.currentConversationId]) {
        const conversation = state.conversations[state.currentConversationId];
        const messageIndex = conversation.messages.findIndex((msg) => msg.id === messageId);

        if (messageIndex !== -1) {
          conversation.messages.splice(messageIndex, 1);
          conversation.messageCount = conversation.messages.length;
          conversation.updatedAt = new Date().toISOString();

          if (state.conversations[state.currentConversationId].lastMessage && state.conversations[state.currentConversationId].lastMessage.id === messageId) {
            state.conversations[state.currentConversationId].lastMessage = conversation.messages[conversation.messages.length - 1] || null;
          }
          return;
        }
      }
    },
    updateConversationId: (state, action) => {
      const newConversationId = action.payload;
      const oldConversationId = state.currentConversationId;
      console.log("Redux Slice: Updating conversation ID from:", oldConversationId, "to:", newConversationId);
      
      // If we have an old conversation with messages, migrate them to the new conversation
      if (oldConversationId && newConversationId && oldConversationId !== newConversationId) {
        const oldConversation = state.conversations?.[oldConversationId];
        
        if (oldConversation && oldConversation.messages && oldConversation.messages.length > 0) {
          console.log("Migrating", oldConversation.messages.length, "messages from old conversation to new");
          
          // Ensure the new conversation exists
          if (!state.conversations[newConversationId]) {
            const timestamp = new Date().toISOString();
            state.conversations[newConversationId] = {
              id: newConversationId,
              title: oldConversation.title || `Chat ${newConversationId.slice(-4)}`,
              workflowName: oldConversation.workflowName || "default_workflow",
              status: "active",
              createdAt: oldConversation.createdAt || timestamp,
              updatedAt: timestamp,
              messageCount: 0,
              lastMessagePreview: "",
              messages: [],
              lastMessage: null,           
              isStreaming: oldConversation.isStreaming || false,
              currentProgress: oldConversation.currentProgress || [],
              error: null,
              hasConversation: true,
              langgraphState: null,
              chatInitialized: oldConversation.chatInitialized || false,
              selectedDatasets: oldConversation.selectedDatasets || {},
              userMessage: oldConversation.userMessage || "",
              isWaitingForAI: oldConversation.isWaitingForAI || false,
              processingStepText: oldConversation.processingStepText || "Thinking...",
            };
          }
          
          // Migrate messages
          const newConversation = state.conversations[newConversationId];
          oldConversation.messages.forEach((msg, index) => {
            // Update the message's conversationId
            const migratedMsg = {
              ...msg,
              conversationId: newConversationId,
              conversationIndex: newConversation.messages.length,
            };
            newConversation.messages.push(migratedMsg);
          });
          
          // Update metadata
          newConversation.messageCount = newConversation.messages.length;
          console.log("Migration complete. New conversation now has", newConversation.messages.length, "messages");
          
          // Clear old conversation messages (optional, or we can delete it)
          oldConversation.messages = [];
          oldConversation.messageCount = 0;
        }
      }
      
      state.currentConversationId = newConversationId;
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
      state.conversations[state.currentConversationId].contextQuestionsAnswered = action.payload;
    },
    setContextAnswersConfirmed: (state, action) => {
      state.conversations[state.currentConversationId].contextAnswersConfirmed = action.payload;
    },
    setAdvancedQuestionsAnswered: (state, action) => {
      state.conversations[state.currentConversationId].advancedQuestionsAnswered = action.payload;
    },
    setAdvancedAnswersConfirmed: (state, action) => {
      state.conversations[state.currentConversationId].advancedAnswersConfirmed = action.payload;
    },
    setNavigating: (state, action) => {
      state.conversations[state.currentConversationId].navigating = action.payload;
    },
    setExperimentStatusHistory: (state, action) => {
      state.conversations[state.currentConversationId].experimentStatusHistory = action.payload;
    },
    setExperimentData: (state, action) => {
      const { experimentId, experimentData } = action.payload;
      if (state.currentConversationId && state.conversations[state.currentConversationId]) {
        const conversation = state.conversations[state.currentConversationId];
        if (!conversation.experiments) {
          conversation.experiments = {};
        }
        conversation.experiments[experimentId] = experimentData;
      }
    },
    createNewConversation: (state, action) => {
      if (!state.conversations) {
        state.conversations = {};
      }
      const { workflowName, title, conversationId } = action.payload;
      const timestamp = new Date().toISOString();

      let generatedTitle = title;
      if (!generatedTitle) {
        const workflowTitles = {
          supply_chain_manager_workflow: "Supply Chain Analysis",
          data_analysis_workflow: "Data Analysis",
          inventory_optimization: "Inventory Optimization",
          demand_forecasting: "Demand Forecasting",
          default_workflow: "New Chat",
        };
        generatedTitle = workflowTitles[workflowName] || `New ${workflowName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`;
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
        experiments: {},
        navigating: false,
        selectedAnalysisExperiment: null,
        analysisSystemPrompt: null,
        analysisDataPathDict: null,
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
      state.conversations[state.currentConversationId].hasConversation = true;
      state.conversations[state.currentConversationId].error = null;
    },
    switchConversation: (state, action) => {
      if (!state.conversations) {
        state.conversations = {};
      }
      const conversationId = action.payload;
      if (state.conversations[conversationId]) {
        state.currentConversationId = conversationId;
      }
    },
    deleteConversation: (state, action) => {
      if (!state.conversations) {
        state.conversations = {};
      }
      const conversationId = action.payload;
      if (state.conversations[conversationId]) {
        delete state.conversations[conversationId];
        if (state.currentConversationId === conversationId) {
          const remainingConversations = Object.keys(state.conversations);
          if (remainingConversations.length > 0) {
            const sortedConversations = remainingConversations.sort((a, b) => {
              const timeA = new Date(state.conversations[a].updatedAt).getTime();
              const timeB = new Date(state.conversations[b].updatedAt).getTime();
              return timeB - timeA;
            });
            state.currentConversationId = sortedConversations[0];
          } else {
            const defaultConvs = createDefaultConversation();
            state.conversations = defaultConvs;
            state.currentConversationId = Object.keys(defaultConvs)[0];
            state.conversations[state.currentConversationId].hasConversation = true;
          }
        }
      }
    },
    debugState: (state) => {
      console.log("🔍 Debug State:", {
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        hasConversation: state.conversations[state.currentConversationId].hasConversation,
      });
    },
    setCreditScore: (state, action) => {
      state.creditScore = action.payload;
    },
    decrementCreditScore: (state, action) => {
      state.creditScore = state.creditScore - action.payload;
    },
    addSelectedDataset: (state, action) => {
      const { datasetName, isUploaded, companyName, companyId } = action.payload;
      if (!state.conversations[state.currentConversationId].selectedDatasets) {
        state.conversations[state.currentConversationId].selectedDatasets = {};
      }
      let fullPath;
      if (isUploaded) {
        fullPath = `accounts/${companyName}_${companyId}/customer_data/data_library/uploads/${datasetName}.csv`;
      } else {
        fullPath = `accounts/${companyName}_${companyId}/customer_data/data_library/api_processed_data/${datasetName}.csv`;
      }

      if (state.conversations[state.currentConversationId].selectedDatasets[datasetName]) {
        state.conversations[state.currentConversationId].selectedDatasets[datasetName].count += 1;
      } else {
        state.conversations[state.currentConversationId].selectedDatasets[datasetName] = {
          path: fullPath,
          count: 1,
        };
      }
    },
    removeSelectedDataset: (state, action) => {
      const datasetName = action.payload;
      if (!state.conversations[state.currentConversationId].selectedDatasets) {
        state.conversations[state.currentConversationId].selectedDatasets = {};
        return;
      }
      if (state.conversations[state.currentConversationId].selectedDatasets[datasetName]) {
        state.conversations[state.currentConversationId].selectedDatasets[datasetName].count -= 1;
        if (state.conversations[state.currentConversationId].selectedDatasets[datasetName].count <= 0) {
          delete state.conversations[state.currentConversationId].selectedDatasets[datasetName];
        }
      }
    },
    clearSelectedDatasets: (state) => {
      state.conversations[state.currentConversationId].selectedDatasets = {};
    },
    setUserMessage: (state, action) => {
      if (state.currentConversationId && state.conversations?.[state.currentConversationId]) {
        state.conversations[state.currentConversationId].userMessage = action.payload;
      }
    },
    clearUserMessage: (state) => {
      state.conversations[state.currentConversationId].userMessage = "";
    },
    addSelectedExpDataset: (state, action) => {
      const { expDatasetPath, datasetName } = action.payload;
      if (!state.conversations[state.currentConversationId].selectedDatasets) {
        state.conversations[state.currentConversationId].selectedDatasets = {};
      }
      let fullPath = expDatasetPath;
      if (state.conversations[state.currentConversationId].selectedDatasets[datasetName]) {
        state.conversations[state.currentConversationId].selectedDatasets[datasetName].count += 1;
      } else {
        state.conversations[state.currentConversationId].selectedDatasets[datasetName] = {
          path: fullPath,
          count: 1,
        };
      }
    },
    setSelectedAnalysisExperiment: (state, action) => {
      if (state.currentConversationId && state.conversations[state.currentConversationId]) {
        state.conversations[state.currentConversationId].selectedAnalysisExperiment = action.payload;
      }
    },
    setAnalysisSystemPrompt: (state, action) => {
      if (state.currentConversationId && state.conversations[state.currentConversationId]) {
        state.conversations[state.currentConversationId].analysisSystemPrompt = action.payload;
      }
    },
    setAnalysisDataPathDict: (state, action) => {
      if (state.currentConversationId && state.conversations[state.currentConversationId]) {
        state.conversations[state.currentConversationId].analysisDataPathDict = action.payload;
      }
    },
    clearSelectedAnalysisExperiment: (state) => {
      if (state.currentConversationId && state.conversations[state.currentConversationId]) {
        state.conversations[state.currentConversationId].selectedAnalysisExperiment = null;
        state.conversations[state.currentConversationId].analysisSystemPrompt = null;
        state.conversations[state.currentConversationId].analysisDataPathDict = null;
      }
    },
    setExperimentsList: (state, action) => {
      state.experiments_list = action.payload || [];
    },
    setCurrentCompany: (state, action) => {
      state.currentCompany = action.payload;
    },
    loadConversations: (state, action) => {
      state.conversation_list = action.payload;
    },
    addConversation: (state, action) => {
      const exists = state.conversation_list.find(
        (c) => c.conversationID === action.payload.conversationID
      );
      if (!exists) {
        state.conversation_list.unshift(action.payload);
      }
    },
    selectConversation: (state, action) => {
      const { conversationID, response } = action.payload;
      const formatDate = (date) => {
        if (!isNaN(date)) {
          const dateObj = new Date(date);
          const datePart = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(dateObj);
          const timePart = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "numeric", second: "numeric", hour12: true }).format(dateObj);
          return `${datePart}, at ${timePart}`;
        }
        return date;
      };

      const loadedConversation = {
        id: conversationID,
        title: `Chat ${conversationID.slice(-4)}`,
        workflowName: "default_workflow",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
        lastMessagePreview: "",
        // messages: [], // Removed duplicate key
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
        ...response,
        messages: response?.messages ? (Array.isArray(response.messages) ? response.messages : []) : [],
      };

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
    removeConversation: (state, action) => {
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
  setExperimentsList,
  setCurrentCompany,
  setIsSidebarOpenReducer,
  updateConversationName,
  removeConversation,
} = vibeSlice.actions;

export default vibeSlice.reducer;