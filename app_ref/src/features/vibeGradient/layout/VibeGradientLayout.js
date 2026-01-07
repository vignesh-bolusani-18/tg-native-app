import React, { useState, useEffect } from "react";
import { Box, useTheme, useMediaQuery, Button } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CustomTooltip from "../../../components/CustomToolTip";
import { useVibe } from "../../../hooks/useVibe";
import useModule from "../../../hooks/useModule";
import useExperiment from "../../../hooks/useExperiment";
import { oldFlowModules } from "../../../utils/oldFlowModules";
import {
  no_of_steps,
  stepsInfo,
  stepNames,
} from "../../../utils/VibeGradient Utils/stepsInfo";
import WorkflowProgressTracker from "../components/ui/WorkflowProgressTracker";
import ConversationSidebar from "../components/ui/ConversationLogsSideber";

const VibeGradientLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // // Sidebar state
  // const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const {
    currentConversationId,
    conversations,
    currentConversation,
    setHasConversation,
    createNewChat,
    clearError,
    langgraphState,
    clearConversations,
    conversation_list,
    addNewConversation,
    loadConversationList,
    addConversationFromSidebar,
    isSidebarOpen,
    setIsSidebarOpen,
    renameConversationFunction,
    deleteConversationFunction,
  } = useVibe();

  const { discardExperiment: discardExperimentModule } = useModule();
  const { discardExperiment: discardExperimentExperiment } = useExperiment();

  const handleDiscardExperiment = () => {
    if (oldFlowModules.includes(langgraphState?.determined_module)) {
      discardExperimentExperiment();
    } else {
      discardExperimentModule();
    }
  };
  // Extract workflow progress information safely from conversation messages
  const getWorkflowProgress = () => {
    try {
      // Get langgraphState from the vibe hook
      const activeLanggraphState = langgraphState;

      if (!currentConversation || typeof currentConversation !== "object") {
        return null;
      }

      const stepsInfoObject = stepsInfo;
      console.log("currentConversation", currentConversation);
      const workflowStatus =
        currentConversation.experiment_execution_state.workflow_status;
      // Find the last key in workflowStatus whose value is true
      let currentNode =
        currentConversation.experiment_execution_state.next_module;
      // if (workflowStatus && typeof workflowStatus === "object") {
      //   const trueKeys = Object.keys(workflowStatus).filter(
      //     (key) => workflowStatus[key] === true
      //   );
      //   if (trueKeys.length > 0) {
      //     currentNode = trueKeys[trueKeys.length - 1];
      //   }
      // }

      const currentWorkflowName =
        currentConversation.experiment_execution_state.workflow_name;
      if (!currentNode || !currentWorkflowName) {
        console.log("No current node or workflow name found");
        return null;
      }
      const currentStep = stepsInfoObject[currentWorkflowName][currentNode];
      const totalSteps = no_of_steps[currentWorkflowName];

      if (!currentStep || !totalSteps) {
        return null;
      }

      // Get step name and module info
      const currentStepName =
        stepNames[currentWorkflowName]?.[currentNode] || currentNode;
      const determinedModule =
        currentConversation.experiment_execution_state.determined_module ||
        null;

      return {
        currentStep,
        totalSteps,
        currentWorkflowName,
        currentStepName,
        currentNode,
        determinedModule,
      };
    } catch (error) {
      console.error("Error extracting workflow progress:", error);
      return null;
    }
  };

  const workflowProgress = getWorkflowProgress();
  const location = useLocation();
  // Check if conversation has started
  useEffect(() => {
    if (currentConversationId && conversations[currentConversationId]?.messages?.length > 0) {
      setHasConversation(true);

      // Auto-close sidebar on mobile when conversation starts
      if (isMobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    }
    if (
      currentConversationId &&
      currentConversationId.length > 0 &&
      location.pathname.split("/")[location.pathname.split("/").length - 1] !==
        currentConversationId
    ) {
      navigate(`./${currentConversationId}`, { replace: true });
    }
  }, [
    currentConversationId,
    conversations,
    currentConversation,
    isMobile,
    isSidebarOpen,
    setHasConversation,
  ]);

useEffect(() => {
  // Load conversation list only once on mount
  // Don't reload on every conversation change
  if (conversation_list.length === 0) {
    loadConversationList();
  }
}, []);

  const handleNewChat = async () => {
    if(conversations[currentConversationId]?.messages?.length === 0) return;
    console.log("VibeGradientLayout: Starting new chat");

    // Clear any existing error immediately
    clearError();

    // Create the new conversation (createNewChat already persists it via addNewConversationAction)
  try {
    // Wait for conversation to be fully created
    const newConversationId = await createNewChat("master_workflow", "New Chat");
    
    // Set conversation state AFTER creation completes
    setHasConversation(true);
    handleDiscardExperiment();
    
    console.log("VibeGradientLayout: New chat created:", newConversationId);
  } catch (err) {
    console.error("VibeGradientLayout: Error creating new chat:", err);
    // setError(err.message);
  }
  };

const handleSelectConversation = async (conversation) => {
  console.log("Switching to conversation:", conversation.conversationID);
  
  try {
    // Step 1: Save current conversation if it has unsaved changes
    if (currentConversationId && 
        currentConversation?.messages?.length > 0 &&
        currentConversationId !== conversation.conversationID) {
      
      // Check if this conversation was already saved
      const existsInList = conversation_list.find(
        c => c.conversationID === currentConversationId
      );
      
      if (!existsInList) {
        console.log("Saving current conversation before switching");
        addNewConversation();
      }
    }
    
    // Step 2: Load the selected conversation
    console.log("Loading selected conversation");
    await addConversationFromSidebar(conversation.conversationID);
    
    // Step 3: Navigation happens automatically via useEffect
    
  } catch (error) {
    console.error("Error switching conversation:", error);
    // setError(error.message);
  }
};

  const handleRenameConversation = (conversationID, newName) => {
  console.log('Renaming conversation:', conversationID, 'to', newName);
  renameConversationFunction(conversationID, newName);
};

const handleDeleteConversation = (conversationID) => {
  console.log('Deleting conversation:', conversationID);
  deleteConversationFunction(conversationID);
};

  return (
    <Box 
      sx={{
        display: "flex",
        marginTop: "50px",
        padding: "10px",
        height: "calc(100vh - 110px)", // Account for header and footer
        backgroundColor: "#ffffff",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: "hidden",
        borderRadius: "12px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
    >
      {/* Conversation Sidebar - Takes up actual space in layout */}
      {/* <Box
        sx={{
          width: isSidebarOpen ? 280 : 0,
          flexShrink: 0,
          marginRight: isSidebarOpen ? "8px" : 0,
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: isSidebarOpen ? 1 : 0,
        }}
      >
        {!isMobile && isSidebarOpen && (
          <ConversationSidebar
            onNewChat={handleNewChat}
            isOpen={true}
            onToggle={() => setIsSidebarOpen(false)}
          />
        )}
      </Box> */}

      {/* Expand Button - Only show when sidebar is closed */}
  {/* Conversation Sidebar with integrated toggle and new chat */}
<ConversationSidebar
  conversationList={conversation_list}
  onSelectConversation={handleSelectConversation}
  onNewChat={handleNewChat}
  isOpen={isSidebarOpen}
  onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
  currentConversationId={currentConversationId}
  onRenameConversation={handleRenameConversation}
  onDeleteConversation={handleDeleteConversation}
/>

      {/* Main Content Area with Outlet - Gets remaining space */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          borderRadius: isSidebarOpen ? "0 12px 12px 0" : "12px",
          marginRight: "8px",
          minWidth: 0, // Prevents flex item from overflowing
          transition: "border-radius 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}
      >
        {/* Workflow Progress Tracker - Slim horizontal bar at top */}
        {workflowProgress && currentConversation && (
          <Box
            sx={{
              flexShrink: 0,
              animation: "slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "@keyframes slideDown": {
                "0%": {
                  opacity: 0,
                  transform: "translateY(-100%)",
                },
                "100%": {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
              // Add left margin to avoid overlapping with New Chat button
              paddingLeft: {
                xs: "60px",
                 sm: !isSidebarOpen && currentConversation?.messages?.length > 0 ? "70px" : "0px",
              },
            }}
          >
            <WorkflowProgressTracker
              currentStep={workflowProgress.currentStep}
              totalSteps={workflowProgress.totalSteps}
              workflowName={workflowProgress.currentWorkflowName}
              currentStepName={workflowProgress.currentStepName}
              determinedModule={workflowProgress.determinedModule}
            />
          </Box>
        )}

        {/* Chat Content */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default VibeGradientLayout;
