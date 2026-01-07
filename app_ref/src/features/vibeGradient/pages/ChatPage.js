import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Stack,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { useWorkflowWebSocket } from "../../../hooks/useWorkflowWebSocket";
import ChatContainer from "../components/chat/ChatContainer";
import InputSection from "../components/input/InputSection";
import ErrorDisplay from "../components/ui/ErrorDisplay";
import { useVibe } from "../../../hooks/useVibe";
import useModule from "../../../hooks/useModule";
import useExperiment from "../../../hooks/useExperiment";
import { oldFlowModules } from "../../../utils/oldFlowModules";
import useConfig from "../../../hooks/useConfig";
import LoadingScreen from "./../../../components/LoadingScreen";
import AnalysisWorkflowInitiator from "../components/ui/AnalysisWorkflowInitiator";
import santaCap from "../../../assets/Illustrations/Santa Cap.png";

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
      prompt:
        "Which are the top selling items in my portfolio based on last 3 months?",
      module: "Sales",
    },
    {
      prompt:
        "Show me the Y-o-Y and M-o-M of the forecast with actuals at an overall level?",
      module: "Forecast",
    },
    {
      prompt:
        "If there exists Locked forecast, show me the highest error contributing items using locked forecast?",
      module: "Accuracy",
    },
    {
      prompt:
        "Identify the line items with dates where the stock out correction has happened, only if it has happened?",
      module: "OOS detection",
    },
    {
      prompt: "How does TrueGradient handles out of stock or irregular spikes?",
      module: "Anomaly detection",
    },
  ],
  "inventory-optimization": [
    {
      prompt:
        "What is my current inventory levels, both in terms of units and value?",
      module: "Inventory status",
    },
    {
      prompt: "Identify the items which needs to be reordered now?",
      module: "Reorder Plan",
    },
    {
      prompt:
        "Identify the excess stock items and suggest stock transfer if any?",
      module: "Stock Risk Level",
    },
    {
      prompt:
        "Which items are leading to sales loss due to insufficient inventory?",
      module: "Sales Loss",
    },
    {
      prompt:
        "Show me the health of inventory like total inventory, loss sales, excess stock using stock risk level?",
      module: "Inventory health",
    },
  ],
  "pricing-promotion-optimization": [
    {
      prompt: "Identify the profit and margin driving items?",
      module: "Profit drivers",
    },
    {
      prompt: "Identify the revenue driving items?",
      module: "Revenue drivers",
    },
    {
      prompt: "Identify the unit lift drivers?",
      module: "Unit drivers",
    },
    {
      prompt: "How does TrueGradient calculates the elasticity?",
      module: "Elasticity",
    },
    {
      prompt:
        "Identify the items with highest price changes recommended by the system?",
      module: "Optimal price",
    },
  ],
};

const ChatPage = () => {
  console.log("🎯 ChatPage Rendered - Starting render cycle");

  // Track if we're in a new chat mode (conversation exists but no messages yet)
  const [isNewChatMode, setIsNewChatMode] = useState(false);

  // Refs for auto-scroll
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const hasInitializedNewChatRef = useRef(false);

  const { experiments_list } = useExperiment();

  // Get experiment analysis state from Redux
  const {
    selectedAnalysisExperiment,
    analysisSystemPrompt,
    analysisDataPathDict,
  } = useVibe();

  // Get module name from selected experiment
  const selectedExperimentModule =
    selectedAnalysisExperiment?.experimentModuleName || null;

  const {
    setIsWaitingForAI,
    setHasConversation,
    setStreamingStatus,
    isStreaming,
    currentProgress,
    error,
    hasConversation,
    clearError,
    langgraphState,
    createNewChat,
    currentConversationId,
    conversations,
    currentConversation,
    addMessage,
    clearConversations,
    navigating,
    creditScore,
    selectedDatasets,
    clearAllSelectedDatasets,
  } = useVibe();
  const { configState: configStateConfig, clearConfigCache } = useConfig();
  const { configState: configStateModule } = useModule();

  const isWaitingForAI = currentConversation?.isWaitingForAI;

  // Debug: Log the current state values
  console.log("🔍 Component State Debug:", {
    currentConversationId,
    conversations,
    currentConversation,
    hasConversation,
    conversationsType: typeof conversations,
    conversationsKeys: conversations ? Object.keys(conversations) : "undefined",
  });

  // NEW: Log when useVibe hook is loaded
  console.log("📊 useVibe Hook Data:", {
    hasConversation,
    currentConversationId: currentConversationId || "NULL",
    conversationExists: !!currentConversation,
    messagesLength: currentConversation?.messages?.length || 0,
    isWaitingForAI,
  });

  const { discardExperiment: discardExperimentModule } = useModule();
  const { discardExperiment: discardExperimentExperiment } = useExperiment();
  const discardExperiment = async () => {
    if (oldFlowModules.includes(langgraphState?.determined_module)) {
      await discardExperimentExperiment();
      clearConfigCache();
    } else {
      await discardExperimentModule();
    }
  };

  const { canSendMessage, sendQuery } = useWorkflowWebSocket();

  const canStartChat = creditScore > 0 && !isWaitingForAI && canSendMessage;
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  // CRITICAL: Ensure we always have a valid conversation on mount
  useEffect(() => {
    console.log("🎬 ChatPage Mount: Checking conversation state");
    
    // Only initialize if this is truly the first mount AND we have no conversations
    // This prevents re-creating conversations during normal operation
    if (!currentConversationId && (!conversations || Object.keys(conversations).length === 0)) {
      console.log("🎬 No conversation found, creating default one");
      createNewChat("supply_chain_manager_workflow", "New Chat").catch(err => {
        console.error("Failed to create new chat:", err);
      });
    }
  }, []); // Run only once on mount

  // Safety net: If currentConversationId becomes null after clearing, create one
  // This runs after clearConversations has completed
  useEffect(() => {
    if (!currentConversationId && !isNewChatMode) {
      // Only auto-create if we're not already in the process of creating a new chat
      console.log("🎬 Safety check: currentConversationId is null, waiting for createNewChat to complete");
    }
  }, [currentConversationId, isNewChatMode]);

  const handleNewChat = useCallback(async () => {
    console.log("🔄 ChatPage: Starting new chat");
    console.log("🔄 ChatPage: Connection status before reset:", {
      canSendMessage,
    });

    if (isStreaming) {
      console.log("⚠️ ChatPage: Cannot start new chat while streaming");
      return;
    }
    console.log("🔄 ChatPage: Calling clearConversations...");
    await clearConversations();
    console.log("🔄 ChatPage: clearConversations completed");
    console.log("🔄 ChatPage: Calling clearError...");
    clearError();
    console.log("🔄 ChatPage: clearError completed");
    console.log("🔄 ChatPage: Calling createNewChat...");
    await createNewChat("supply_chain_manager_workflow", "New Chat");
    console.log("🔄 ChatPage: createNewChat completed");
    console.log("🔄 ChatPage: Calling setIsNewChatMode(true)...");
    setIsNewChatMode(true);
    console.log("🔄 ChatPage: Calling setHasConversation(true)...");
    setHasConversation(true);
    console.log("🔄 ChatPage: Calling setIsWaitingForAI(false)...");
    setIsWaitingForAI(false);
    console.log("🔄 ChatPage: Calling discardExperiment...");
    await discardExperiment();
    console.log("🔄 ChatPage: discardExperiment completed");
    setTimeout(() => {
      console.log("🔄 ChatPage: New chat reset completed");
    }, 100);
  }, [
    canSendMessage,
    isStreaming,
    clearError,
    createNewChat,
    setHasConversation,
    setIsWaitingForAI,
    discardExperiment,
  ]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [currentConversationId, currentProgress, isWaitingForAI]);

  // Auto-scroll when streaming starts
  useEffect(() => {
    if (isStreaming) {
      scrollToBottom();
    }
  }, [isStreaming]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  };

  // Check if conversation has started
  useEffect(() => {
    if (
      currentConversationId &&
      conversations?.[currentConversationId]?.messages?.length > 0
    ) {
      setHasConversation(true);

      // Check if this is a new chat (conversation exists but no messages)
      if (currentConversation && currentConversation?.messages?.length === 0) {
        setIsNewChatMode(true);
      } else {
        setIsNewChatMode(false);
      }
    }
  }, [currentConversationId, conversations, currentConversation]);

  // Handle AI response completion - only stop waiting when streaming actually starts
  useEffect(() => {
    if (isStreaming && isWaitingForAI) {
      // Add a small delay to ensure typing indicator is visible
      setTimeout(() => {
        setIsWaitingForAI(false);
      }, 1000); // Show typing indicator for at least 1 second
    }
  }, [isStreaming, isWaitingForAI]);

  // Stop waiting for AI when we have meaningful progress (not just langgraph_state updates)
  useEffect(() => {
    if (isWaitingForAI && currentProgress.length > 0) {
      // Only stop waiting if we have actual AI response progress, not just state updates
      const hasAIResponse = currentProgress.some(
        (progress) =>
          progress.message_type === "ai_understanding" ||
          progress.message_type === "progress_update" ||
          progress.message_type === "final_result"
      );

      if (hasAIResponse) {
        console.log("AI response received, stopping waiting state");
        setIsWaitingForAI(false);
      }
    }
  }, [isWaitingForAI]);

  // Debug when isWaitingForAI changes
  useEffect(() => {
    console.log("isWaitingForAI changed to:", isWaitingForAI);
  }, [isWaitingForAI]);

  // Auto-stop streaming if it's been active for too long (safety mechanism)
  useEffect(() => {
    let timeoutId;
    if (isStreaming) {
      timeoutId = setTimeout(() => {
        console.log("Auto-stopping streaming after timeout");
        setStreamingStatus(false);
      }, 30000); // 30 seconds timeout
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isStreaming]);

  // Auto-stop waiting for AI if it's been too long (safety mechanism)
  useEffect(() => {
    let timeoutId;
    if (isWaitingForAI) {
      timeoutId = setTimeout(() => {
        console.log("Auto-stopping waiting for AI after timeout");
        setIsWaitingForAI(false);
      }, 100000); // 10 seconds timeout
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isWaitingForAI]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // New chat: Ctrl/Cmd + K
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "k" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        if (!isStreaming) {
          handleNewChat();
        }
      }

      // Stop streaming: Ctrl/Cmd + Shift + K
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "k" &&
        event.shiftKey
      ) {
        event.preventDefault();
        if (isStreaming || isWaitingForAI) {
          console.log("Manually stopping streaming and waiting");
          setStreamingStatus(false);
          setIsWaitingForAI(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isStreaming]);

  useEffect(() => {
    console.log(
      "ChatPage: currentConversation?.messages",
      currentConversation?.messages
    );
    const messages = currentConversation?.messages || [];
    if (
      messages.filter(
        (message) =>
          message.type === "ai" &&
          message.langgraphState?.workflow_name !== "conversation_workflow"
      ).length > 1
    ) {
      console.log("ChatPage: Handling new chat");
      const langgraphState = messages.filter(
        (message) =>
          message.type === "ai" &&
          message.langgraphState?.workflow_name !== "conversation_workflow"
      )[0].langgraphState;
      const config = oldFlowModules.includes(langgraphState?.determined_module)
        ? configStateConfig
        : configStateModule;
      if (!config || Object.keys(config).length === 0) {
        handleNewChat();
      }
    } else {
      console.log("ChatPage: No new chat");
    }
  }, []); // Empty dependency array makes this run once when component mounts

  const handleSendMessage = async (message) => {
    console.log("ChatPage: Sending message:", message);
    console.log("ChatPage: Selected datasets:", selectedDatasets);
    console.log("ChatPage: Data path dict:", analysisDataPathDict);
    console.log("ChatPage: System prompt:", analysisSystemPrompt);

    let data = Object.fromEntries(
      Object.entries(selectedDatasets).map(([key, value]) => [key, value.path])
    );

    // Merge analysisDataPathDict if experiment is selected for analysis
    if (analysisDataPathDict) {
      data = { ...data, ...analysisDataPathDict };
    }

    console.log("ChatPage: Final data:", data);

    // Exit new chat mode when user sends first message
    if (isNewChatMode) {
      setIsNewChatMode(false);
    }
    console.log("ChatPage: Current conversation ID:", currentConversationId);

    // Add user message to Redux immediately for instant display
    await addMessage({
      id: `user-${Date.now()}`,
      type: "user",
      content: message,
      data: data,
      timestamp: new Date().toISOString(),
      conversationId: currentConversationId, // Add conversationId to message
    });

    // Set waiting state immediately when user sends a message
    console.log("Setting isWaitingForAI to true for message:", message);
    setIsWaitingForAI(true);

    // Send the message with systemPrompt prepended if experiment is selected for analysis
    sendQuery({
      query: analysisSystemPrompt
        ? analysisSystemPrompt + "\n\n" + message
        : message,
      data: data,
    });
    clearAllSelectedDatasets();
    // Scroll to bottom after sending message
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  function parseString(input) {
    try {
      const json = JSON.parse(input);
      if (typeof json === "object" && json !== null) {
        return json.status;
      }
    } catch (e) {
      return input;
    }
    return input;
  }

  const handleStartChat = async (suggestion) => {
    console.log("ChatPage: Starting chat with suggestion:", suggestion);
    console.log("ChatPage: Data path dict:", analysisDataPathDict);
    console.log("ChatPage: System prompt:", analysisSystemPrompt);

    // Exit new chat mode when user starts with suggestion
    if (isNewChatMode) {
      setIsNewChatMode(false);
    }
    console.log("ChatPage: Current conversation ID:", currentConversationId);

    // Prepare data - merge analysisDataPathDict if experiment is selected for analysis
    let data = {};
    if (analysisDataPathDict) {
      data = { ...data, ...analysisDataPathDict };
    }

    // Add user message to Redux immediately for instant display
    await addMessage({
      id: `user-${Date.now()}`,
      type: "user",
      content: suggestion,
      data: data,
      timestamp: new Date().toISOString(),
      conversationId: currentConversationId,
    });

    // Set waiting state immediately when user starts a chat
    console.log("Setting isWaitingForAI to true for suggestion:", suggestion);
    setIsWaitingForAI(true);

    // Send the suggestion with systemPrompt prepended if experiment is selected for analysis
    sendQuery({
      query: analysisSystemPrompt
        ? analysisSystemPrompt + "\n\n" + suggestion
        : suggestion,
      data: data,
    });

    // Scroll to bottom after starting chat
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const completedExperiments = useMemo(() => {
    return (
      experiments_list?.filter(
        (experiment) =>
          !experiment.inTrash &&
          parseString(experiment.experimentStatus) === "Completed" &&
          !experiment.isArchive &&
          [
            "demand-planning",
            "inventory-optimization",
            "price-promotion-optimization",
          ].includes(experiment.experimentModuleName)
      ) || []
    );
  }, [experiments_list]);

  const handleTrySampleData = async () => {
    // Exit new chat mode when user starts with suggestion
    if (isNewChatMode) {
      setIsNewChatMode(false);
    }
    console.log("ChatPage: Current conversation ID:", currentConversationId);
    // Add user message to Redux immediately for instant display

    await addMessage({
      id: `user-${Date.now()}`,
      type: "user",
      content:
        "Please run the demand planning analysis on the Personal Care Sample Data",
      timestamp: new Date().toISOString(),
      conversationId: currentConversationId,
    });

    // Set waiting state immediately when user starts a chat
    console.log("Setting isWaitingForAI to true for suggestion:");
    setIsWaitingForAI(true);

    // Send the suggestion
    sendQuery({
      query:
        "Please run the demand planning analysis on the Personal Care Sample Data",
      updated_state: null,
    });

    // Scroll to bottom after starting chat
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  // Get suggestion prompts based on selected experiment module
  const getSuggestionPrompts = () => {
    if (
      selectedExperimentModule &&
      analysisSuggestionPrompts[selectedExperimentModule]
    ) {
      return analysisSuggestionPrompts[selectedExperimentModule];
    }
    return suggestionPrompts;
  };

  const processingText = useMemo(() => {
    return currentConversation?.processingStepText;
  }, [currentConversation?.processingStepText]);

  // NEW: Log all rendering conditions at the top level
  console.log("📋 ChatPage Render Conditions Check:", {
    navigating,
    hasError: !!error,
    hasConversation,
    currentConversationExists: !!currentConversation,
    messagesLength: currentConversation?.messages?.length || 0,
    isNewChatMode,
  });

  if (navigating) {
    console.log("⚠️ ChatPage: Navigating - showing LoadingScreen");
    return <LoadingScreen />;
  }
  return (
    <>
      {/* Error Display */}
      {error && (
        <Box
          sx={{
            padding: 2,
            backgroundColor: "#fef2f2",
            borderBottom: "1px solid #fecaca",
          }}
        >
          <ErrorDisplay error={error} />
        </Box>
      )}

      {/* Main Content Container */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
          paddingTop: "10px", // Space for the action buttons
          transition: "all 0.3s ease",
          height: "100%",
        }}
      >
        {/* Chat Container - Show when conversation exists and has messages */}
        {hasConversation &&
          currentConversation &&
          Array.isArray(currentConversation?.messages) &&
          currentConversation?.messages?.length > 0 &&
          (() => {
            console.log("🔍 ChatContainer Condition Check - EVALUATING...");
            const aiMessages = (currentConversation?.messages || []).filter(
              (message) =>
                message.type === "ai" &&
                !["conversation_workflow", "data_analyser_workflow"].includes(
                  message.langgraphState?.workflow_name
                )
            );
            console.log("📊 AI Messages Found:", aiMessages.length);

            if (aiMessages.length === 0) {
              console.log("⚠️ No AI messages found, returning true");
              return true;
            }

            const firstAiMessage = aiMessages[0];
            const determinedModule =
              firstAiMessage?.langgraphState?.determined_module;
            console.log("🎯 Determined Module:", determinedModule);
            console.log("📦 oldFlowModules check:", oldFlowModules.includes(determinedModule));
            console.log("⚙️ configStateConfig:", configStateConfig !== null);
            console.log("⚙️ configStateModule:", configStateModule !== null);

            const shouldRender =
              aiMessages.length === 1 ||
              (oldFlowModules.includes(determinedModule) &&
                configStateConfig !== null) ||
              (!oldFlowModules.includes(determinedModule) &&
                configStateModule !== null);

            console.log("✅ ChatContainer Should Render:", shouldRender);
            return shouldRender;
          })() && (
            <>
              {console.log("🚀 RENDERING ChatContainer NOW!")}
              <Box
                sx={{
                  flex: 1,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  paddingTop: "20px",
                  paddingX: "20px",
                  backgroundColor: "#ffffff",
                  height: "100%",
                  minHeight: 0,
                }}
              >
                <ChatContainer
                  ref={chatContainerRef}
                  messages={currentConversation?.messages}
                  isWaitingForAI={currentConversation?.isWaitingForAI}
                  setIsWaitingForAI={setIsWaitingForAI}
                  isStreaming={isStreaming}
                  currentProgress={currentProgress}
                  messagesEndRef={messagesEndRef}
                  processingStepText={processingText}
                  systemPrompt={analysisSystemPrompt}
                dataPathDict={analysisDataPathDict}
              />
              </Box>
            </>
          )}

        {/* Centered Input Section - Show when conversation exists but no messages */}
        {hasConversation &&
          currentConversation &&
          (Array.isArray(currentConversation?.messages) && currentConversation?.messages?.length === 0 ||
            !Array.isArray(currentConversation?.messages)) && (
            <>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 6,
                  backgroundColor: "#ffffff",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    maxWidth: { xs: "100%", md: "70%" },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {/* Welcome message */}
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="h4"
                      sx={{
                        color: "#1e293b",
                        fontWeight: 600,
                        mb: 2,
                        fontSize: { xs: "1.75rem", sm: "2rem", md: "2.25rem" },
                      }}
                    >
                      What shall we build today?
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#64748b",
                        fontSize: "1.1rem",
                        maxWidth: "600px",
                        lineHeight: 1.5,
                      }}
                    >
                      Build AI models through simple conversations. Tell me what
                      you want to predict and I'll create it for you.
                    </Typography>
                  </Box>

                  {/* Centered Input */}
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: "800px",
                      mx: "auto",
                    }}
                  >
                    <InputSection
                      onSendMessage={handleSendMessage}
                      onStartChat={handleStartChat}
                      canSendMessage={canSendMessage}
                      hasConversation={hasConversation}
                      isWaitingForAI={isWaitingForAI}
                    />
                  </Box>

                <Box sx={{ width: "100%", position: "relative" }}>
                  <Grid
                    container
                    spacing={2}
                    sx={{
                      width: "100%",
                      margin: 0,
                    }}
                  >
                    {completedExperiments.length > 0 && (
                      <Grid item xs={12} sx={{ position: "relative" }}>
                        {/* Santa Cap at top left corner - flipped horizontally */}
                        {(() => {
                          const today = new Date();
                          const month = today.getMonth(); // 0-indexed (0=Jan, 11=Dec)
                          const date = today.getDate();
                          // Show from Dec 23rd to Dec 31st OR Jan 1st
                          const isHolidayCap =
                            (month === 11 && date >= 23) ||
                            (month === 0 && date === 1);
                          return isHolidayCap ? (
                            <Box
                              component="img"
                              src={santaCap}
                              alt="Santa Cap"
                              sx={{
                                position: "absolute",
                                top: "-5px",
                                left: "-12px",
                                width: "60px",
                                height: "auto",
                                transform:
                                  "scaleX(-1) rotate(25deg) scale(1.25)",
                                zIndex: 2,
                                pointerEvents: "none",
                                transition: "transform 0.2s ease",
                                "&:hover": {
                                  transform:
                                    "scaleX(-1) rotate(-12deg) scale(1.05)",
                                },
                              }}
                            />
                          ) : null;
                        })()}
                        <AnalysisWorkflowInitiator />
                      </Grid>
                    )}
                    {getSuggestionPrompts().map((prompt, index) => {
                      // For 5 items: first 3 items get 4 columns each, last 2 items get 6 columns each
                      const currentPrompts = getSuggestionPrompts();
                      let gridWidth;
                      if (currentPrompts.length === 5) {
                        gridWidth = index < 3 ? 4 : 6; // First 3 items: 4 columns, last 2 items: 6 columns
                      } else if (currentPrompts.length <= 2) {
                        gridWidth = 12 / currentPrompts.length;
                      } else {
                        gridWidth = 12 / 3; // Default to 3 items per row
                      }

                      return (
                        <Grid
                          item
                          xs={12}
                          sm={gridWidth}
                          key={prompt.prompt}
                          sx={{ padding: "8px" }}
                        >
                          <Card
                            aria-label={prompt.module}
                            sx={{
                              backgroundColor: "#fff",
                              border: "1px solid #e2e8f0",
                              borderRadius: "12px",
                              cursor: !canStartChat ? "not-allowed" : "pointer",
                              opacity: !canStartChat ? 0.6 : 1,
                              height: "100%",
                              transition: "all 0.2s ease",
                              "&:hover": !canStartChat
                                ? {}
                                : {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                  },
                            }}
                            disabled={!canStartChat}
                            onClick={() => handleStartChat(prompt.prompt)}
                          >
                            <CardContent sx={{ padding: "12px !important" }}>
                              <Typography
                                sx={{
                                  fontSize: "0.75rem",
                                  color: "#64748b",
                                  mb: 0.75,
                                  fontWeight: 600,
                                }}
                              >
                                {prompt.module}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "0.9rem",
                                  color: "#1e293b",
                                  fontWeight: 500,
                                  lineHeight: "1.2rem",
                                }}
                              >
                                {prompt.prompt}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
                {/* Sample Data Option */}
                {/* <Box
                  sx={{
                    width: "100%",
                    maxWidth: "700px",
                    p: 3,
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "16px",
                    textAlign: "center",
                    mt: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      mb: 2,
                      fontWeight: 500,
                    }}
                  >
                    Don't have data ready? No worries!
                  </Typography>

                  <Button
                    variant="contained"
                    onClick={() => handleTrySampleData()}
                    sx={{
                      minWidth: "320px",
                      height: "46px",
                      backgroundColor: "#3b82f6",
                      borderRadius: "10px",
                      color: "#ffffff",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      textTransform: "none",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      "&:hover": {
                        backgroundColor: "#2563eb",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    Try with Personal Care Sample Data
                  </Button>

                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: "#9ca3af",
                      mt: 2,
                      fontWeight: 400,
                      lineHeight: 1.4,
                    }}
                  >
                    Experience the power of VibeGradient AI with our curated CPG
                    dataset
                  </Typography>
                </Box> */}
              </Box>
            </Box>
            </>
          )}

        {/* DEBUGGING: Log if neither ChatContainer nor InputSection renders */}
        {!(
          (hasConversation &&
            currentConversation &&
            Array.isArray(currentConversation?.messages) &&
            currentConversation?.messages?.length > 0) ||
          (hasConversation &&
            currentConversation &&
            (Array.isArray(currentConversation?.messages) && currentConversation?.messages?.length === 0 ||
              !Array.isArray(currentConversation?.messages)))
        ) && console.log("🚨 ERROR: Neither ChatContainer nor InputSection is rendering!", {
          hasConversation,
          currentConversationExists: !!currentConversation,
          messagesLength: currentConversation?.messages?.length || 0,
          currentConversationId,
          conversationsKeys: conversations ? Object.keys(conversations) : [],
        })}
      </Box>
    </>
  );
};

export default ChatPage;
