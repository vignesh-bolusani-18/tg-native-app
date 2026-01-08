import { StatusBar } from "expo-status-bar";
import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Hooks & Logic
import useAuth from "../../hooks/useAuth";
import useConfig from "../../hooks/useConfig";
import useDataset from "../../hooks/useDataset";
import useExperiment from "../../hooks/useExperiment";
import useModule from "../../hooks/useModule";
import { useVibe } from "../../hooks/useVibe";
import { useWorkflowWebSocket } from "../../hooks/useWorkflowWebSocket";
import { oldFlowModules } from "../../utils/oldFlowModules";

// Components
import LoadingScreen from "../../components/LoadingScreen";
import TGIcon from "../../assets/images/tg_logo6.svg";
// import CompanyHeader from "./CompanyHeader";
import ChatContainer from "./chat/ChatContainer";
import AnalyzeExperimentInlinePopup from "./input/AnalyzeExperimentInlinePopup";
import MentionEditor from "./input/MentionEditor";
import ErrorDisplay from "./ui/ErrorDisplay";
import AppSidebar from "./ui/AppSidebar";
import ChatHistorySidebar from "./chat/ChatHistorySidebar";
import AnimatedSidebarModal from "./ui/AnimatedSidebarModal";

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
  // Debug logging disabled for production
  // console.log(\"ChatPage Rendered\");

  const [isNewChatMode, setIsNewChatMode] = useState(false);
  const [experimentPopupExpanded, setExperimentPopupExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);
  const suggestionOpacityAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef(null);
  // const [isSidebarVisible, setIsSidebarVisible] = useState(false); // Removed local state

  const { currentCompany } = useAuth();
  const { experiments_list, fetchExperiments, getCompletedExperiments } = useExperiment();
  const { datasets_name_list } = useDataset();
  
  const {
    selectedAnalysisExperiment,
    clearSelectedAnalysisExperiment,
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
    switchConversation,
    // creditScore, // Not used in this component
    selectedDatasets,
    clearAllSelectedDatasets,
    isSidebarOpen,
    setIsSidebarOpen,
  } = useVibe();

  const { configState: configStateConfig } = useConfig();
  const { configState: configStateModule } = useModule();

  const isWaitingForAI = currentConversation?.isWaitingForAI;

  const { canSendMessage, sendQuery, resetConversation } = useWorkflowWebSocket();
  
  // ⭐ Stop generation handler
  const handleStopGeneration = useCallback(async () => {
    console.log('🛑 [ChatPage] Stopping AI generation');
    
    // Reset waiting state immediately for better UX
    setIsWaitingForAI(false);
    
    // Reset conversation to stop current execution
    await resetConversation();
    
    console.log('✅ [ChatPage] AI generation stopped');
  }, [resetConversation, setIsWaitingForAI]);
  
  // Force connection status for UI testing if needed, or rely on hook
  // If user is not authenticated, canSendMessage will be false.
  // We can show a different placeholder or allow typing but prompt login on send.
  
  const canStartChat = !isWaitingForAI; // Removed creditScore check as requested

  // Build suggestions for MentionEditor (used in selected experiment input)
  const completedExperiments = getCompletedExperiments ? getCompletedExperiments() : (experiments_list || []).filter(
    exp => exp.experimentStatus === "Completed" && !exp.inTrash && !exp.isArchive
  );
  const experimentSuggestions = completedExperiments.map(exp => ({
    id: exp.experimentID,
    name: exp.experimentName || "Unnamed Experiment",
    type: 'experiment',
    data: exp
  }));
  const datasetSuggestions = (datasets_name_list || []).map(name => ({
    id: name,
    name: name,
    type: 'dataset'
  }));
  const mentionSuggestions = [...datasetSuggestions, ...experimentSuggestions];

  // ⭐ FIX: Fetch experiments ONCE when company changes
  // Don't include fetchExperiments in deps to prevent loops
  useEffect(() => {
    // console.log('🔄 [ChatPage] Company changed, checking if experiments need fetch...');
    // console.log('   Company:', currentCompany?.companyID);
    // console.log('   Current experiments count:', experiments_list?.length || 0);
    
    if (currentCompany?.companyID && experiments_list.length === 0) {
      // console.log('🚀 [ChatPage] Fetching experiments for new company...');
      fetchExperiments(false).then((exps) => {
        // console.log('✅ [ChatPage] Experiments fetched:', exps?.length || 0);
        // if (exps && exps.length > 0) {
        //   console.log('   First experiment:', exps[0]?.experimentID || exps[0]?.id);
        // }
      }).catch(err => {
        // console.error('❌ [ChatPage] Error fetching experiments:', err);
      });
    } else if (experiments_list.length > 0) {
      // console.log('✅ [ChatPage] Experiments already loaded:', experiments_list.length);
    }
    // ⭐ CRITICAL: Only depend on companyID - adding fetchExperiments or experiments_list causes infinite loops
    // fetchExperiments is stable from useCallback, experiments_list.length would trigger on every change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCompany?.companyID]); // ⭐ ONLY depend on companyID change

  // ⭐ Initialize Conversation - Create default chat on first load
  // Runs once when component mounts if no conversation exists
  useEffect(() => {
    // Check both conversations object AND conversation_list being empty
    const hasNoConversations = !conversations || Object.keys(conversations).length === 0;
    
    if (!currentConversationId && hasNoConversations) {
      // console.log("🎬 Creating default chat - no existing conversations");
      createNewChat("supply_chain_manager_workflow", "New Chat").catch(err => console.error(err));
    }
    // ⭐ Only run on mount and when conversation state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // ⭐ Safety net: If somehow we have no active conversation after load, create one
  // This handles edge cases like when all conversations were deleted
  useEffect(() => {
    // Wait a bit for initial load to complete
    const timer = setTimeout(() => {
      if (!currentConversationId) {
        // console.log("⚠️ No active conversation after initial load - creating one");
        createNewChat("supply_chain_manager_workflow", "New Chat").catch(err => 
          console.error("Failed to create safety net chat:", err)
        );
      }
    }, 1500); // 1.5 second delay to let initial state settle
    
    return () => clearTimeout(timer);
    // ⭐ Only re-run if currentConversationId changes from undefined/null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConversationId === null]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConversationId, conversations, currentConversation]);

  // Stop waiting logic
  useEffect(() => {
    if (isStreaming && isWaitingForAI) {
      setTimeout(() => setIsWaitingForAI(false), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming, isWaitingForAI]);

  useEffect(() => {
    if (isWaitingForAI && currentProgress.length > 0) {
      const hasAIResponse = currentProgress.some(
        (progress) =>
          ["ai_understanding", "progress_update", "final_result"].includes(progress.message_type)
      );
      if (hasAIResponse) setIsWaitingForAI(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWaitingForAI, currentProgress]);

  // Auto-stop safety timeouts
  useEffect(() => {
    let timeoutId;
    if (isStreaming) {
      timeoutId = setTimeout(() => setStreamingStatus(false), 30000);
    }
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming]);

  useEffect(() => {
    let timeoutId;
    if (isWaitingForAI) {
      timeoutId = setTimeout(() => setIsWaitingForAI(false), 100000);
    }
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWaitingForAI]);

  const handleSendMessage = async (message) => {
    // ⭐ CRITICAL: Debug logging to trace message flow
    // console.log('📤 [ChatPage.handleSendMessage] START');
    // console.log('   Message:', message?.substring(0, 50) || 'EMPTY');
    // console.log('   currentConversationId:', currentConversationId);
    // console.log('   canSendMessage:', canSendMessage);
    // console.log('   isWaitingForAI:', isWaitingForAI);
    // console.log('   selectedAnalysisExperiment:', selectedAnalysisExperiment?.experimentName || 'None');
    // console.log('   analysisSystemPrompt:', analysisSystemPrompt ? 'Present' : 'None');
    // console.log('   analysisDataPathDict:', analysisDataPathDict ? Object.keys(analysisDataPathDict) : 'None');
    
    if (!message || !message.trim()) {
      // console.warn('⚠️ [ChatPage.handleSendMessage] Empty message, aborting');
      return;
    }
    
    let data = Object.fromEntries(
      Object.entries(selectedDatasets).map(([key, value]) => [key, value.path])
    );

    if (analysisDataPathDict) {
      data = { ...data, ...analysisDataPathDict };
    }
    
    // console.log('   Final data keys:', Object.keys(data));

    if (isNewChatMode) {
      setIsNewChatMode(false);
    }

    // console.log('📥 [ChatPage.handleSendMessage] Calling addMessage...');
    await addMessage({
      id: `user-${Date.now()}`,
      type: "user",
      content: message,
      data: data,
      timestamp: new Date().toISOString(),
      conversationId: currentConversationId,
    });
    // console.log('✅ [ChatPage.handleSendMessage] addMessage completed');

    setInputValue("");
    
    console.log('🔄 [ChatPage] Setting isWaitingForAI to TRUE');
    console.log('   Before:', currentConversation?.isWaitingForAI);
    setIsWaitingForAI(true);
    
    const finalQuery = analysisSystemPrompt ? analysisSystemPrompt + "\n\n" + message : message;
    console.log('📡 [ChatPage.handleSendMessage] Calling sendQuery...');
    console.log('   finalQuery length:', finalQuery?.length);

    sendQuery({
      query: finalQuery,
      data: data,
    });
    console.log('✅ [ChatPage.handleSendMessage] sendQuery called');
    
    clearAllSelectedDatasets();
    // console.log('📤 [ChatPage.handleSendMessage] COMPLETE');
  };

  const handleStartChat = async (suggestion) => {
    // console.log('🚀 [ChatPage.handleStartChat] START');
    // console.log('   Suggestion:', suggestion?.substring(0, 50) || 'EMPTY');
    // console.log('   currentConversationId:', currentConversationId);
    
    if (isNewChatMode) setIsNewChatMode(false);

    let data = {};
    if (analysisDataPathDict) {
      data = { ...data, ...analysisDataPathDict };
    }
    // console.log('   Data keys:', Object.keys(data));

    // console.log('📥 [ChatPage.handleStartChat] Calling addMessage...');
    await addMessage({
      id: `user-${Date.now()}`,
      type: "user",
      content: suggestion,
      data: data,
      timestamp: new Date().toISOString(),
      conversationId: currentConversationId,
    });
    // console.log('✅ [ChatPage.handleStartChat] addMessage completed');

    setIsWaitingForAI(true);

    // console.log('📡 [ChatPage.handleStartChat] Calling sendQuery...');
    sendQuery({
      query: analysisSystemPrompt ? analysisSystemPrompt + "\n\n" + suggestion : suggestion,
      data: data,
    });
    // console.log('🚀 [ChatPage.handleStartChat] COMPLETE');
  };

  const getSuggestionPrompts = () => {
    if (selectedExperimentModule && analysisSuggestionPrompts[selectedExperimentModule]) {
      return analysisSuggestionPrompts[selectedExperimentModule];
    }
    return suggestionPrompts;
  };

  const processingText = currentConversation?.processingStepText;

  // Debug logging disabled for production
  // console.log('ChatPage State:', { navigating, hasConversation, messageCount: currentConversation?.messages?.length });

  if (navigating) {
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
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar style="dark" />
      
      {/* New Header Implementation */}
      <View style={{ 
          height: 60, 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          backgroundColor: '#FFF',
          borderBottomWidth: 1,
          borderBottomColor: '#F0F0F0',
          marginTop: 0,
          paddingTop: 5,
      }}>
          {/* Left: App Menu */}
          <View style={{ flexDirection: 'row', width: 80, justifyContent: 'flex-start' }}>
            <TouchableOpacity onPress={() => setIsAppMenuOpen(true)} style={{ padding: 8, marginLeft: -8 }}>
               <MaterialIcons name="menu" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Center: Brand */}
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <TGIcon width={28} height={28} />
          </View>

          {/* Right: Actions */}
          <View style={{ flexDirection: 'row', alignItems: 'center', width: 80, justifyContent: 'flex-end' }}>
             <TouchableOpacity 
                style={{ padding: 8 }}
                onPress={() => {
                   createNewChat("supply_chain_manager_workflow", "New Chat");
                }}
             >
                <MaterialIcons name="add" size={24} color="#333" />
             </TouchableOpacity>
             <TouchableOpacity onPress={() => setIsSidebarOpen(true)} style={{ padding: 8, marginRight: -8 }}>
                <MaterialIcons name="history" size={24} color="#333" />
             </TouchableOpacity>
          </View>
      </View>

      {/* Workspace Selection Required Banner */}
      {!currentCompany && (
        <View style={{ backgroundColor: '#fef3c7', padding: 12, borderBottomWidth: 1, borderBottomColor: '#fcd34d' }}>
          <Text style={{ fontSize: 13, color: '#92400e', fontWeight: '500', textAlign: 'center' }}>
            📌 Please select workspace from menu
          </Text>
        </View>
      )}

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
              {/* INPUT SECTION (Sticky Bottom for Chat) - Use same AnalyzeExperimentInlinePopup */}
              <View style={{ width: '100%', backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 12 }}>
                <View style={{ width: '100%', maxWidth: 768, alignSelf: 'center' }}>
                  <AnalyzeExperimentInlinePopup
                    isExpanded={experimentPopupExpanded}
                    onToggle={() => {
                      const willExpand = !experimentPopupExpanded;
                      setExperimentPopupExpanded(willExpand);
                    }}
                    onSelectExperiment={(exp) => {
                      if (exp) {
                        // console.log('📊 [ChatPage] Experiment selected:', exp.experimentName);
                        setExperimentPopupExpanded(false);
                      }
                    }}
                    inputValue={inputValue}
                    onInputChange={setInputValue}
                    onSendMessage={() => {
                      if (inputValue.trim() && canSendMessage && !isWaitingForAI) {
                        handleSendMessage(inputValue.trim());
                      }
                    }}
                    isSendDisabled={!inputValue.trim() || !canSendMessage || isWaitingForAI}
                    isWaitingForAI={isWaitingForAI}
                  />
                </View>
              </View>
            </View>
          ) : (
            /* EMPTY STATE / NEW CHAT VIEW - FIGMA DESIGN */
            <View style={{ flex: 1 }}>
              {/* Scrollable Content Area */}
              <ScrollView 
                style={{ flex: 1, paddingHorizontal: 20 }}
                contentContainerStyle={{ paddingTop: 40, paddingBottom: 20 }}
              >
                <View style={{ width: '100%', maxWidth: 768, alignSelf: 'center' }}>
                  <View style={{ alignItems: 'center', marginBottom: 40 }}>
                    <Text style={{ 
                      fontFamily: 'Inter Display', 
                      fontSize: 24, 
                      fontWeight: '600', 
                      lineHeight: 32, 
                      letterSpacing: -0.24,
                      color: '#333333', 
                      textAlign: 'center', 
                      marginBottom: 20 
                    }}>
                      How can I help you today?
                    </Text>
                    <Text style={{ 
                      fontFamily: 'Inter Display',
                      fontSize: 12, 
                      fontWeight: '400',
                      lineHeight: 16,
                      color: '#999999', 
                      textAlign: 'center'
                    }}>
                      I can help you forecast demand, optimize inventory, improve pricing, or plan promotions
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* Fixed Bottom Section - FIGMA Layout with Smooth Animations */}
              <View style={{ paddingHorizontal: 20, paddingBottom: 8, backgroundColor: '#FFFFFF', position: 'relative' }}>
                <View style={{ width: '100%', maxWidth: 768, alignSelf: 'center' }}>
                  {/* Container for suggestion cards - keeps position fixed */}
                  <View style={{ marginBottom: 12, minHeight: 40 }}>
                    {/* Suggestion Tiles - Fade out when popup expands */}
                    {!selectedAnalysisExperiment && (
                      <Animated.View style={{ 
                        opacity: suggestionOpacityAnim,
                        pointerEvents: experimentPopupExpanded ? 'none' : 'auto'
                      }}>
                        <ScrollView 
                          horizontal 
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ gap: 16, paddingHorizontal: 0 }}
                        >
                          {getSuggestionPrompts().slice(0, 4).map((prompt, index) => (
                            <TouchableOpacity
                              key={index}
                              activeOpacity={canStartChat ? 0.7 : 1}
                              disabled={!canStartChat}
                              onPress={() => handleStartChat(prompt.prompt)}
                              style={{
                                backgroundColor: '#FFFFFF',
                                borderWidth: 1,
                                borderColor: 'rgba(237, 237, 237, 0.7)',
                                borderRadius: 28,
                                paddingLeft: 16,
                                paddingRight: 12,
                                paddingVertical: 4,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 10,
                                opacity: !canStartChat ? 0.6 : 1
                              }}
                            >
                              <Text style={{ 
                                fontFamily: 'Inter Display', 
                                fontSize: 14, 
                                fontWeight: '500', 
                                lineHeight: 24,
                                color: '#666666'
                              }} numberOfLines={1}>
                                {prompt.prompt.length > 20 ? prompt.prompt.substring(0, 20) + '...' : prompt.prompt}
                              </Text>
                              <MaterialIcons name="chevron-right" size={16} color="#B3B3B3" />
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </Animated.View>
                    )}
                  </View>

                  {/* Analyze Experiment Inline Popup - Same component always */}
                  {!selectedAnalysisExperiment && (
                    <View style={{ marginBottom: 1.5 }}>
                      <AnalyzeExperimentInlinePopup
                        isExpanded={experimentPopupExpanded}
                        onToggle={() => {
                          const willExpand = !experimentPopupExpanded;
                          setExperimentPopupExpanded(willExpand);
                          // Animate suggestions fade
                          Animated.timing(suggestionOpacityAnim, {
                            toValue: willExpand ? 0 : 1,
                            duration: 300,
                            useNativeDriver: true,
                          }).start();
                        }}
                        onSelectExperiment={(exp) => {
                          if (exp) {
                            // console.log('📊 [ChatPage] Experiment selected:', exp.experimentName);
                            setExperimentPopupExpanded(false);
                            // Restore suggestions opacity
                            Animated.timing(suggestionOpacityAnim, {
                              toValue: 1,
                              duration: 300,
                              useNativeDriver: true,
                            }).start();
                          }
                        }}
                        inputValue={inputValue}
                        onInputChange={setInputValue}
                        onSendMessage={() => {
                          if (inputValue.trim() && canSendMessage && !isWaitingForAI) {
                            handleSendMessage(inputValue.trim());
                          }
                        }}
                        isSendDisabled={!inputValue.trim() || !canSendMessage || isWaitingForAI}
                        isWaitingForAI={isWaitingForAI}
                      />
                    </View>
                  )}

                  {/* Selected Experiment Display - Matches Figma 3968:1360 */}
                  {selectedAnalysisExperiment && (
                    <View style={{ marginBottom: 1.5 }}>
                      {/* Blue Experiment Card Header */}
                      <View style={{
                        backgroundColor: '#008AE5',
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                        gap: 12,
                      }}>
                        {/* Experiment Name Row with Edit + Close */}
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{
                              fontFamily: 'Inter Display',
                              fontSize: 15,
                              fontWeight: '600',
                              lineHeight: 24,
                              color: '#FFFFFF',
                            }}>
                              {selectedAnalysisExperiment.experimentName}
                            </Text>
                          </View>
                          {/* Edit Button */}
                          <TouchableOpacity 
                            onPress={() => setExperimentPopupExpanded(true)} 
                            style={{ padding: 4 }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <MaterialIcons name="edit" size={16} color="#FFFFFF" />
                          </TouchableOpacity>
                          {/* Close Button */}
                          <TouchableOpacity 
                            onPress={() => clearSelectedAnalysisExperiment()} 
                            style={{ padding: 4 }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <MaterialIcons name="close" size={18} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                        {/* Experiment Tags */}
                        <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                          {selectedAnalysisExperiment.experimentModuleName && (
                            <View style={{ backgroundColor: '#F0F9FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                              <Text style={{ fontFamily: 'Geist Mono', fontSize: 11, fontWeight: '500', lineHeight: 16, color: '#006BB2' }}>
                                {selectedAnalysisExperiment.experimentModuleName}
                              </Text>
                            </View>
                          )}
                          {selectedAnalysisExperiment.experimentRegion && (
                            <View style={{ backgroundColor: '#FFF5DB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                              <Text style={{ fontFamily: 'Geist Mono', fontSize: 11, fontWeight: '500', lineHeight: 14, color: '#8F6900' }}>
                                {selectedAnalysisExperiment.experimentRegion}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      {/* White Input Area Below - Figma 3968:1365 */}
                      <View style={{
                        backgroundColor: '#FFFFFF',
                        borderWidth: 1.5,
                        borderTopWidth: 0,
                        borderColor: 'rgba(0, 138, 229, 0.5)',
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                        paddingHorizontal: 16,
                        paddingTop: 16,
                        paddingBottom: 12,
                        shadowColor: '#333333',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.15,
                        shadowRadius: 20,
                        elevation: 5,
                        gap: 28,
                      }}>
                        {/* MentionEditor Input - Functional */}
                        <View style={{ minHeight: 24 }}>
                          <MentionEditor
                            ref={inputRef}
                            value={inputValue}
                            onChange={setInputValue}
                            onSend={() => {
                              if (inputValue.trim() && canSendMessage && !isWaitingForAI) {
                                handleSendMessage(inputValue.trim());
                                setInputValue("");
                              }
                            }}
                            placeholder="Ask anything..."
                            placeholderColor="#999999"
                            editable={!isWaitingForAI}
                            suggestions={mentionSuggestions}
                            onMentionSelect={(item) => {
                              console.log('📎 Mention selected:', item.name);
                            }}
                            style={{
                              fontFamily: 'Inter Display',
                              fontSize: 16,
                              fontWeight: '500',
                              lineHeight: 24,
                              color: '#333333',
                            }}
                          />
                        </View>
                        {/* Action Buttons Row */}
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                          {/* Left: @ and Attachment icons */}
                          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                            <TouchableOpacity 
                              style={{ padding: 4, borderRadius: 4 }} 
                              activeOpacity={0.7}
                              disabled={isWaitingForAI}
                            >
                              <MaterialIcons name="alternate-email" size={18} color="#808080" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                              style={{ padding: 4, borderRadius: 4 }} 
                              activeOpacity={0.7}
                              disabled={isWaitingForAI}
                            >
                              <MaterialIcons name="attach-file" size={18} color="#808080" />
                            </TouchableOpacity>
                          </View>
                          {/* Right: Mic and Send buttons */}
                          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                            <TouchableOpacity
                              style={{
                                backgroundColor: '#F0F0F0',
                                padding: 6,
                                borderRadius: 16,
                              }}
                              activeOpacity={0.7}
                            >
                              <MaterialIcons name="mic" size={18} color="#666666" />
                            </TouchableOpacity>
                            {/* Toggle between Send and Stop button based on AI processing */}
                            {isWaitingForAI ? (
                              <TouchableOpacity
                                onPress={handleStopGeneration}
                                style={{
                                  backgroundColor: '#EF4444',
                                  paddingHorizontal: 12,
                                  paddingVertical: 4,
                                  borderRadius: 20,
                                  shadowColor: '#7F1D1D',
                                  shadowOffset: { width: 0, height: 4 },
                                  shadowOpacity: 0.15,
                                  shadowRadius: 8,
                                  elevation: 3,
                                }}
                                activeOpacity={0.7}
                              >
                                <MaterialIcons name="stop" size={18} color="#FFFFFF" />
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity
                                onPress={() => {
                                  if (inputValue.trim() && canSendMessage) {
                                    handleSendMessage(inputValue.trim());
                                    setInputValue("");
                                  }
                                }}
                                disabled={!inputValue.trim() || !canSendMessage}
                                style={{
                                  backgroundColor: '#0F8BFF',
                                  paddingHorizontal: 12,
                                  paddingVertical: 4,
                                  borderRadius: 20,
                                  shadowColor: '#001F3B',
                                  shadowOffset: { width: 0, height: 4 },
                                  shadowOpacity: 0.1,
                                  shadowRadius: 8,
                                  elevation: 3,
                                  opacity: (!inputValue.trim() || !canSendMessage) ? 0.5 : 1,
                                }}
                                activeOpacity={0.7}
                              >
                                <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      </View>
                    </View>
                  )}

                  {!currentCompany && selectedAnalysisExperiment && (
                    <Text style={{ fontSize: 12, color: '#ef4444', textAlign: 'center', marginTop: 8 }}>
                      Select a workspace to start chatting
                    </Text>
                  )}
                  {!currentCompany && !selectedAnalysisExperiment && (
                    <Text style={{ fontSize: 12, color: '#ef4444', textAlign: 'center', marginTop: 8 }}>
                      Select a workspace to start chatting
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* App Menu Sidebar (LEFT) - Animated */}
      <AnimatedSidebarModal visible={isAppMenuOpen} onClose={() => setIsAppMenuOpen(false)} side="left">
        <AppSidebar onClose={() => setIsAppMenuOpen(false)} />
      </AnimatedSidebarModal>
    </View>
  );
};

export default ChatPage;