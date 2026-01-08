import { Slot } from "expo-router";
import React, { useEffect, useRef } from "react";
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
import useAuth from "../../hooks/useAuth";
import useExperiment from "../../hooks/useExperiment";
import useModule from "../../hooks/useModule";
import { useVibe } from "../../hooks/useVibe";
import { oldFlowModules } from "../../utils/oldFlowModules";
import {
  getAllSteps,
  getStepInfo,
  getStepNumber,
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
    setIsWaitingForAI,
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
    clearSelectedAnalysisExperiment,
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
      // Early return if no current conversation
      if (!currentConversation || typeof currentConversation !== "object") {
        return null;
      }

      // Safely access experiment_execution_state
      const experimentState = currentConversation?.experiment_execution_state;
      if (!experimentState || typeof experimentState !== 'object') {
        return null;
      }

      const currentNode = experimentState?.next_module;
      const currentWorkflowName = experimentState?.workflow_name;

      // If no workflow info, return null
      if (!currentNode || !currentWorkflowName) {
        return null;
      }

      // Use the step info functions safely
      const stepInfo = getStepInfo(currentNode);
      const currentStepName = stepInfo?.title || currentNode;
      const determinedModule = experimentState?.determined_module || null;
      const stepNumber = getStepNumber(currentNode);
      const allSteps = getAllSteps();

      return {
        currentStep: stepNumber > 0 ? stepNumber : 1,
        totalSteps: Array.isArray(allSteps) ? allSteps.length : 6,
        currentWorkflowName,
        currentStepName,
        currentNode,
        determinedModule,
      };
    } catch (_error) {
      // Silently return null instead of logging error repeatedly
      return null;
    }
  };

  const workflowProgress = getWorkflowProgress();

  // Track previous message count to detect new messages
  const previousMessageCountRef = useRef(0);

  // Check if conversation has started - only close sidebar on FIRST message sent
  useEffect(() => {
    const messageCount = conversations[currentConversationId]?.messages?.length || 0;
    const previousCount = previousMessageCountRef.current;
    
    if (
      currentConversationId &&
      messageCount > 0
    ) {
      setHasConversation(true);
      
      // ⭐ FIX: Only auto-close sidebar when FIRST message is sent (not on every re-render)
      // This prevents the sidebar from being unclickable after chatting
      if (isMobile && previousCount === 0 && messageCount > 0 && isSidebarOpen) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsSidebarOpen(false);
      }
    }
    
    // Update previous count
    previousMessageCountRef.current = messageCount;
    
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

  // Get current company for tracking changes
  const { currentCompany } = useAuth();

  // Track if we've already attempted to load conversations
  const hasLoadedConversationsRef = useRef(false);
  const previousCompanyIdRef = useRef(currentCompany?.companyID || currentCompany?.id);

  // Load conversations on mount and when company changes
  useEffect(() => {
    const currentCompanyId = currentCompany?.companyID || currentCompany?.id;
    const companyChanged = previousCompanyIdRef.current !== currentCompanyId;
    
    // Load conversations if:
    // 1. First time loading (list is empty and haven't tried yet)
    // 2. Company has changed
    if (currentCompanyId && (companyChanged || (conversation_list.length === 0 && !hasLoadedConversationsRef.current))) {
      console.log('📚 Loading conversation list for company:', currentCompanyId);
      hasLoadedConversationsRef.current = true;
      previousCompanyIdRef.current = currentCompanyId;
      loadConversationList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCompany?.companyID, currentCompany?.id]); // Reload when company changes

  const handleNewChat = async () => {
    if (conversations[currentConversationId]?.messages?.length === 0) return;
    console.log("Starting new chat");
    clearError();

    try {
      await createNewChat("master_workflow", "New Chat");
      setHasConversation(true);
      // ⭐ MATCHES tg-application: Reset waiting state when creating new chat
      setIsWaitingForAI(false);
      // Clear any selected experiment
      clearSelectedAnalysisExperiment();
      handleDiscardExperiment();
      if (isMobile) setIsSidebarOpen(false); // Close sidebar on mobile
    } catch (err) {
      console.error("Error creating new chat:", err);
    }
  };

  const handleSelectConversation = async (conversation) => {
    console.log("Switching to conversation:", conversation.conversationID);
    try {
      // ⭐ MATCHES tg-application: Reset waiting state when switching conversations
      setIsWaitingForAI(false);
      
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
        
        {/* Main Content Area */}
        <View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#ffffff' }}>
          
          {/* Workflow Progress Tracker */}
          {workflowProgress && currentConversation && (
            <View 
              style={{
                zIndex: 10, 
                backgroundColor: 'white', 
                borderBottomWidth: 1, 
                borderBottomColor: '#f3f4f6',
                paddingLeft: isMobile ? 0 : 0 
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

        {/* Conversation Sidebar Overlay (RIGHT) - Only on mobile when open */}
        {isMobile && isSidebarOpen && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1000,
          }}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <TouchableOpacity 
                style={{ flex: 1 }}
                activeOpacity={1}
                onPress={() => setIsSidebarOpen(false)}
              />
              <View style={{
                width: 280,
                marginRight: 12,
                marginTop: 12,
                marginBottom: 12,
                backgroundColor: 'white',
                borderRadius: 12,
                shadowColor: '#000',
                shadowOffset: { width: -4, height: 0 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 8,
              }}>
                <ConversationSidebar
                  conversationList={conversation_list}
                  onSelectConversation={handleSelectConversation}
                  onNewChat={handleNewChat}
                  currentConversationId={currentConversationId}
                  onRenameConversation={handleRenameConversation}
                  onDeleteConversation={handleDeleteConversation}
                />
              </View>
            </View>
          </View>
        )}

      </View>
    </View>
  );
};

export default VibeGradientLayout;