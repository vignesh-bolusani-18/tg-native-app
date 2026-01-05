import { StatusBar } from "expo-status-bar";
import React, {
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Hooks & Logic
import useAuth from "../../hooks/useAuth";
import useConfig from "../../hooks/useConfig";
import useExperiment from "../../hooks/useExperiment";
import useModule from "../../hooks/useModule";
import { useVibe } from "../../hooks/useVibe";
import { useWorkflowWebSocket } from "../../hooks/useWorkflowWebSocket";
import { oldFlowModules } from "../../utils/oldFlowModules";

// Components
import LoadingScreen from "../../components/LoadingScreen";
import CompanyHeader from "./CompanyHeader";
import ChatContainer from "./chat/ChatContainer";
import InputSection from "./input/InputSection";
import AnalysisWorkflowInitiator from "./ui/AnalysisWorkflowInitiator";
import ErrorDisplay from "./ui/ErrorDisplay";

// Assets
// const santaCap = require("../../../assets/Illustrations/Santa Cap.png");

import { MaterialIcons } from "@expo/vector-icons";

const suggestionPrompts = [
  {
    prompt: "Forecast my demand and optimize inventory",
    module: "Time Series / Demand Forecasting",
  },
  {
    prompt: "I need to predict house prices accurately",
    module: "Regression",
  },
  {
    prompt: "Help me predict who survived the Titanic disaster",
    module: "Binary Classification",
  },
  {
    prompt: "Show me what my customers will do next",
    module: "Customer Next Logical Purchase",
  },
  {
    prompt: "Generate the perfect offer for each customer",
    module: "Customer Offer Personalization",
  },
];

const analysisSuggestionPrompts = {
  "demand-planning": [
    {
      prompt: "Which are the top selling items in my portfolio based on last 3 months?",
      module: "Sales",
    },
    {
      prompt: "Show me the Y-o-Y and M-o-M of the forecast with actuals at an overall level?",
      module: "Forecast",
    },
    {
      prompt: "If there exists Locked forecast, show me the highest error contributing items using locked forecast?",
      module: "Accuracy",
    },
    {
      prompt: "Identify the line items with dates where the stock out correction has happened, only if it has happened?",
      module: "OOS detection",
    },
    {
      prompt: "How does TrueGradient handles out of stock or irregular spikes?",
      module: "Anomaly detection",
    },
  ],
  "inventory-optimization": [
    {
      prompt: "What is my current inventory levels, both in terms of units and value?",
      module: "Inventory status",
    },
    // ... (rest of inventory prompts kept implied for brevity in mobile view, or can be added back)
  ],
  "pricing-promotion-optimization": [
    {
      prompt: "Identify the profit and margin driving items?",
      module: "Profit drivers",
    },
    // ...
  ],
};

// ... existing imports ...

const ChatPage = () => {
  console.log("🎯 ChatPage Rendered");

  const [isNewChatMode, setIsNewChatMode] = useState(false);
  // const [isSidebarVisible, setIsSidebarVisible] = useState(false); // Removed local state

  const { currentCompany } = useAuth();
  const { experiments_list } = useExperiment();
  
  const {
    selectedAnalysisExperiment,
    analysisSystemPrompt,
    analysisDataPathDict,
  } = useVibe();

  const selectedExperimentModule = selectedAnalysisExperiment?.experimentModuleName || null;

  const {
    setIsWaitingForAI,
    setHasConversation,
    setStreamingStatus,
    isStreaming,
    currentProgress,
    error,
    hasConversation,
    createNewChat,
    currentConversationId,
    conversations,
    currentConversation,
    addMessage,
    navigating,
    // creditScore, // Not used in this component
    selectedDatasets,
    clearAllSelectedDatasets,
    isSidebarOpen,
    setIsSidebarOpen,
  } = useVibe();

  const { configState: configStateConfig } = useConfig();
  const { configState: configStateModule } = useModule();

  const isWaitingForAI = currentConversation?.isWaitingForAI;

  const { canSendMessage, sendQuery } = useWorkflowWebSocket();
  
  // Force connection status for UI testing if needed, or rely on hook
  // If user is not authenticated, canSendMessage will be false.
  // We can show a different placeholder or allow typing but prompt login on send.
  
  const canStartChat = !isWaitingForAI; // Removed creditScore check as requested

  // Initialize Conversation
  useEffect(() => {
    if (!currentConversationId && (!conversations || Object.keys(conversations).length === 0)) {
      console.log("🎬 Creating default chat");
      createNewChat("supply_chain_manager_workflow", "New Chat").catch(err => console.error(err));
    }
  }, [conversations, createNewChat, currentConversationId]);

  /* Unused handler - keeping for future use
  const handleNewChat = useCallback(async () => {
    if (isStreaming) return;
    await clearConversations();
    clearError();
    await createNewChat("supply_chain_manager_workflow", "New Chat");
    setIsNewChatMode(true);
    setHasConversation(true);
    setIsWaitingForAI(false);
    await discardExperiment();
  }, [isStreaming, clearError, createNewChat, setHasConversation, setIsWaitingForAI, discardExperiment, clearConversations]);
  */

  /* Unused scroll function - keeping for future use
  const scrollToBottom = () => {
    // In React Native, we scroll the ChatContainer list, usually handled inside that component via ref
    // passed down, or implicitly by the FlatList inverted prop.
    // For this implementation, we'll let ChatContainer handle its own scrolling updates.
  };
  */

  useEffect(() => {
    if (
      currentConversationId &&
      conversations?.[currentConversationId]?.messages?.length > 0
    ) {
      setHasConversation(true);
      if (currentConversation && currentConversation?.messages?.length === 0) {
        setIsNewChatMode(true);
      } else {
        setIsNewChatMode(false);
      }
    }
  }, [currentConversationId, conversations, currentConversation, setHasConversation]);

  // Stop waiting logic
  useEffect(() => {
    if (isStreaming && isWaitingForAI) {
      setTimeout(() => setIsWaitingForAI(false), 1000);
    }
  }, [isStreaming, isWaitingForAI, setIsWaitingForAI]);

  useEffect(() => {
    if (isWaitingForAI && currentProgress.length > 0) {
      const hasAIResponse = currentProgress.some(
        (progress) =>
          ["ai_understanding", "progress_update", "final_result"].includes(progress.message_type)
      );
      if (hasAIResponse) setIsWaitingForAI(false);
    }
  }, [isWaitingForAI, currentProgress, setIsWaitingForAI]);

  // Auto-stop safety timeouts
  useEffect(() => {
    let timeoutId;
    if (isStreaming) {
      timeoutId = setTimeout(() => setStreamingStatus(false), 30000);
    }
    return () => clearTimeout(timeoutId);
  }, [isStreaming, setStreamingStatus]);

  useEffect(() => {
    let timeoutId;
    if (isWaitingForAI) {
      timeoutId = setTimeout(() => setIsWaitingForAI(false), 100000);
    }
    return () => clearTimeout(timeoutId);
  }, [isWaitingForAI, setIsWaitingForAI]);

  const handleSendMessage = async (message) => {
    let data = Object.fromEntries(
      Object.entries(selectedDatasets).map(([key, value]) => [key, value.path])
    );

    if (analysisDataPathDict) {
      data = { ...data, ...analysisDataPathDict };
    }

    if (isNewChatMode) setIsNewChatMode(false);

    await addMessage({
      id: `user-${Date.now()}`,
      type: "user",
      content: message,
      data: data,
      timestamp: new Date().toISOString(),
      conversationId: currentConversationId,
    });

    setIsWaitingForAI(true);

    sendQuery({
      query: analysisSystemPrompt ? analysisSystemPrompt + "\n\n" + message : message,
      data: data,
    });
    clearAllSelectedDatasets();
  };

  const handleStartChat = async (suggestion) => {
    if (isNewChatMode) setIsNewChatMode(false);

    let data = {};
    if (analysisDataPathDict) {
      data = { ...data, ...analysisDataPathDict };
    }

    await addMessage({
      id: `user-${Date.now()}`,
      type: "user",
      content: suggestion,
      data: data,
      timestamp: new Date().toISOString(),
      conversationId: currentConversationId,
    });

    setIsWaitingForAI(true);

    sendQuery({
      query: analysisSystemPrompt ? analysisSystemPrompt + "\n\n" + suggestion : suggestion,
      data: data,
    });
  };

  const getSuggestionPrompts = () => {
    if (selectedExperimentModule && analysisSuggestionPrompts[selectedExperimentModule]) {
      return analysisSuggestionPrompts[selectedExperimentModule];
    }
    return suggestionPrompts;
  };

  const completedExperiments = useMemo(() => {
    return (
      experiments_list?.filter(
        (experiment) =>
          !experiment.inTrash &&
          experiment.experimentStatus === "Completed" && // Simplified parsing
          !experiment.isArchive &&
          ["demand-planning", "inventory-optimization", "price-promotion-optimization"].includes(
            experiment.experimentModuleName
          )
      ) || []
    );
  }, [experiments_list]);

  const processingText = currentConversation?.processingStepText;

  console.log('🎯 ChatPage State:', { 
    navigating, 
    hasConversation, 
    conversationId: currentConversationId,
    messageCount: currentConversation?.messages?.length 
  });

  if (navigating) {
    console.log('⏳ ChatPage: Showing loading due to navigating=true');
    return <LoadingScreen message="Loading chat..." />;
  }

  const isChatActive = hasConversation && 
    currentConversation && 
    Array.isArray(currentConversation?.messages) && 
    currentConversation?.messages?.length > 0;

  // Determine if we should render chat container based on modules/config
  const shouldRenderChat = (() => {
    if (!isChatActive) return false;
    const aiMessages = (currentConversation?.messages || []).filter(
      (msg) => msg.type === "ai" && !["conversation_workflow", "data_analyser_workflow"].includes(msg.langgraphState?.workflow_name)
    );
    if (aiMessages.length === 0) return true;
    
    const determinedModule = aiMessages[0]?.langgraphState?.determined_module;
    return aiMessages.length === 1 ||
      (oldFlowModules.includes(determinedModule) && configStateConfig !== null) ||
      (!oldFlowModules.includes(determinedModule) && configStateModule !== null);
  })();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      
      {/* Company Header */}
      <CompanyHeader />
      
      {/* Workspace Selection Required Banner */}
      {!currentCompany && (
        <View style={{ backgroundColor: '#fef3c7', padding: 16, borderBottomWidth: 1, borderBottomColor: '#fcd34d' }}>
          <Text style={{ fontSize: 14, color: '#92400e', fontWeight: '500', textAlign: 'center' }}>
            📌 Please select or create a workspace from the header above to start chatting
          </Text>
        </View>
      )}
      
      {/* Chat Header */}
      <View 
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', backgroundColor: '#ffffff', zIndex: 10 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ padding: 8, marginRight: 8, borderRadius: 9999, backgroundColor: '#f9fafb' }}
          >
            <MaterialIcons name="menu" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937' }}>
            {currentConversation?.title || "New Chat"}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => createNewChat("supply_chain_manager_workflow", "New Chat")}
          style={{ padding: 8, borderRadius: 9999, backgroundColor: '#eff6ff' }}
        >
          <MaterialIcons name="add" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Main Layout */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={{ flex: 1 }}>
          {/* Error Banner */}
          {error && (
            <View style={{ backgroundColor: '#fef2f2', padding: 12, borderBottomWidth: 1, borderBottomColor: '#fecaca' }}>
              <ErrorDisplay error={error} />
            </View>
          )}

          {/* CHAT VIEW */}
          {shouldRenderChat ? (
            <View style={{ flex: 1 }}>
              <View style={{ flex: 1 }}>
                <ChatContainer
                  messages={currentConversation?.messages}
                  isWaitingForAI={currentConversation?.isWaitingForAI}
                  setIsWaitingForAI={setIsWaitingForAI}
                  isStreaming={isStreaming}
                  currentProgress={currentProgress}
                  processingStepText={processingText}
                  systemPrompt={analysisSystemPrompt}
                  dataPathDict={analysisDataPathDict}
                />
              </View>
              {/* INPUT SECTION (Sticky Bottom for Chat) */}
              <View style={{ width: '100%', backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f3f4f6', padding: 8 }}>
                <InputSection
                  onSendMessage={handleSendMessage}
                  onStartChat={handleStartChat}
                  canSendMessage={canSendMessage}
                  hasConversation={hasConversation}
                  isWaitingForAI={isWaitingForAI}
                />
              </View>
            </View>
          ) : (
            /* EMPTY STATE / NEW CHAT VIEW */
            <ScrollView 
              style={{ flex: 1, paddingHorizontal: 16 }}
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }}
            >
              <View style={{ width: '100%', maxWidth: 768, alignSelf: 'center' }}>
                <View style={{ alignItems: 'center', marginBottom: 32 }}>
                  <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 12 }}>
                    What shall we build today?
                  </Text>
                  <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center', lineHeight: 24, maxWidth: 512 }}>
                    Build AI models through simple conversations. Tell me what you want to predict and I&apos;ll create it for you.
                  </Text>
                </View>

                {/* INPUT SECTION (Centered for Landing) */}
                <View style={{ marginBottom: 40, width: '100%' }}>
                  <InputSection
                    onSendMessage={handleSendMessage}
                    onStartChat={handleStartChat}
                    canSendMessage={canSendMessage && !!currentCompany}
                    hasConversation={hasConversation}
                    isWaitingForAI={isWaitingForAI}
                  />
                  {!currentCompany && (
                    <Text style={{ fontSize: 12, color: '#ef4444', textAlign: 'center', marginTop: 8 }}>
                      Select a workspace to start chatting
                    </Text>
                  )}
                </View>

                {/* Suggestions Grid */}
                <View style={{ width: '100%', position: 'relative' }}>
                  {/* Experiments Initiator */}
                  {completedExperiments.length > 0 && (
                    <View style={{ marginBottom: 16 }}>
                      <AnalysisWorkflowInitiator />
                    </View>
                  )}

                  {/* Prompt Cards */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }}>
                    {getSuggestionPrompts().map((prompt, index) => (
                      <TouchableOpacity
                        key={index}
                        activeOpacity={canStartChat ? 0.7 : 1}
                        disabled={!canStartChat}
                        onPress={() => handleStartChat(prompt.prompt)}
                        style={{ 
                          minHeight: 120, 
                          width: '48%', 
                          backgroundColor: '#ffffff', 
                          borderWidth: 1, 
                          borderColor: '#e5e7eb', 
                          borderRadius: 12, 
                          padding: 20, 
                          marginBottom: 16,
                          opacity: !canStartChat ? 0.6 : 1
                        }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {prompt.module}
                        </Text>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: '#111827', lineHeight: 20 }}>
                          {prompt.prompt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatPage;