import { Slot } from "expo-router";
import React, { useEffect } from "react";
import {
    Dimensions,
    LayoutAnimation,
    Platform,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Hooks & Logic
import useExperiment from "../../hooks/useExperiment";
import useModule from "../../hooks/useModule";
import { useVibe } from "../../hooks/useVibe";
import { oldFlowModules } from "../../utils/oldFlowModules";
import {
    no_of_steps,
    stepNames,
    stepsInfo,
} from "../../utils/VibeGradient Utils/stepsInfo";

// Components
import ConversationSidebar from "./ui/ConversationSidebar";
import WorkflowProgressTracker from "./ui/WorkflowProgressTracker";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const VibeGradientLayout = ({ children }) => {
  // const router = useRouter();
  // const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");
  const isMobile = width < 768; // Standard mobile breakpoint

  const {
    currentConversationId,
    conversations,
    currentConversation,
    setHasConversation,
    createNewChat,
    clearError,
    langgraphState,
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

  // Extract workflow progress information
  const getWorkflowProgress = () => {
    try {
      if (!currentConversation || typeof currentConversation !== "object") {
        return null;
      }

      // const workflowStatus =
      //   currentConversation.experiment_execution_state?.workflow_status;
      let currentNode =
        currentConversation.experiment_execution_state?.next_module;

      const currentWorkflowName =
        currentConversation.experiment_execution_state?.workflow_name;

      if (!currentNode || !currentWorkflowName) {
        return null;
      }

      const currentStep = stepsInfo[currentWorkflowName]?.[currentNode];
      const totalSteps = no_of_steps[currentWorkflowName];

      if (!currentStep || !totalSteps) {
        return null;
      }

      const currentStepName =
        stepNames[currentWorkflowName]?.[currentNode] || currentNode;
      const determinedModule =
        currentConversation.experiment_execution_state?.determined_module ||
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

  // Check if conversation has started
  useEffect(() => {
    if (
      currentConversationId &&
      conversations[currentConversationId]?.messages?.length > 0
    ) {
      setHasConversation(true);
      // Auto-close sidebar on mobile when conversation starts
      if (isMobile && isSidebarOpen) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsSidebarOpen(false);
      }
    }
    
    // Route matching logic (simplified for Expo Router)
    // In Expo Router, the path is managed by the file structure, 
    // so manual navigation check here might be redundant or handled differently.
  }, [
    currentConversationId,
    conversations,
    currentConversation,
    isMobile,
    isSidebarOpen,
    setHasConversation,
    setIsSidebarOpen,
  ]);

  useEffect(() => {
    if (conversation_list.length === 0) {
      loadConversationList();
    }
  }, [conversation_list.length, loadConversationList]);

  const handleNewChat = async () => {
    if (conversations[currentConversationId]?.messages?.length === 0) return;
    console.log("Starting new chat");
    clearError();

    try {
      await createNewChat("master_workflow", "New Chat");
      setHasConversation(true);
      handleDiscardExperiment();
      if (isMobile) setIsSidebarOpen(false); // Close sidebar on mobile
    } catch (err) {
      console.error("Error creating new chat:", err);
    }
  };

  const handleSelectConversation = async (conversation) => {
    console.log("Switching to conversation:", conversation.conversationID);
    try {
      if (
        currentConversationId &&
        currentConversation?.messages?.length > 0 &&
        currentConversationId !== conversation.conversationID
      ) {
        const existsInList = conversation_list.find(
          (c) => c.conversationID === currentConversationId
        );
        if (!existsInList) {
          console.log("Saving current conversation");
          addNewConversation();
        }
      }
      await addConversationFromSidebar(conversation.conversationID);
      if (isMobile) setIsSidebarOpen(false); // Close sidebar on mobile
    } catch (error) {
      console.error("Error switching conversation:", error);
    }
  };

  const handleRenameConversation = (conversationID, newName) => {
    renameConversationFunction(conversationID, newName);
  };

  const handleDeleteConversation = (conversationID) => {
    deleteConversationFunction(conversationID);
  };

  return (
    <View 
      style={{ flex: 1, backgroundColor: 'white', paddingTop: insets.top }} // Handle status bar area
    >
      <View style={{ flex: 1, flexDirection: 'row', overflow: 'hidden' }}>
        
        {/* Sidebar (Drawer) */}
        {/* In React Native, Sidebars are usually Drawers or Modals. 
            Here we simulate the web-like sidebar for tablet/desktop 
            and use a conditional render for mobile. */}
        {(isSidebarOpen || !isMobile) && (
           <View 
             style={
               isMobile 
                 ? { position: 'absolute', zIndex: 50, height: '100%', width: '80%', backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }
                 : { width: 288, borderRightWidth: 1, borderRightColor: '#e5e7eb', backgroundColor: 'white' }
             }
           >
             <ConversationSidebar
               conversationList={conversation_list}
               onSelectConversation={handleSelectConversation}
               onNewChat={handleNewChat}
               isOpen={isSidebarOpen}
               onToggle={() => {
                 LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                 setIsSidebarOpen(!isSidebarOpen);
               }}
               currentConversationId={currentConversationId}
               onRenameConversation={handleRenameConversation}
               onDeleteConversation={handleDeleteConversation}
             />
           </View>
        )}

        {/* Main Content Area */}
        <View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#ffffff' }}>
          
          {/* Mobile Sidebar Toggle (Visible only when sidebar is closed on mobile) */}
          {/* REMOVED: The toggle is now inside ChatPage header */}

          {/* Workflow Progress Tracker */}
          {workflowProgress && currentConversation && (
            <View 
              style={{
                zIndex: 10, 
                backgroundColor: 'white', 
                borderBottomWidth: 1, 
                borderBottomColor: '#f3f4f6',
                paddingLeft: (isMobile && !isSidebarOpen) ? 60 : 0 
              }}
            >
              <WorkflowProgressTracker
                currentStep={workflowProgress.currentStep}
                totalSteps={workflowProgress.totalSteps}
                workflowName={workflowProgress.currentWorkflowName}
                currentStepName={workflowProgress.currentStepName}
                determinedModule={workflowProgress.determinedModule}
              />
            </View>
          )}

          {/* Chat Content Slot (Replaces <Outlet />) */}
          <View style={{ flex: 1 }}>
            {children || <Slot />}
          </View>
        </View>

        {/* Mobile Overlay (to close sidebar) */}
        {isMobile && isSidebarOpen && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsSidebarOpen(false)}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 40 }}
          />
        )}

      </View>
    </View>
  );
};

export default VibeGradientLayout;