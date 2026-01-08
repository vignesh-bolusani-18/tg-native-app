// D:\TG_REACT_NATIVE_MOBILE_APP\components\agent\chat\ChatContainer.js
import React, { useEffect, useRef } from "react";
import { FlatList, View } from "react-native";

// Hooks
import { useVibe } from "../../../hooks/useVibe";
import useAuth from "../../../hooks/useAuth";

// Utils
import { uploadJsonToS3 } from "../../../utils/s3Utils";

// Components
import AIMessage from "./AIMessage";
import AILoadingSpinner from "./AILoadingSpinner";
import UserMessage from "./UserMessage"; 

const ChatContainer = () => {
  // const theme = useTheme();
  const flatListRef = useRef(null);
  const { currentCompany } = useAuth();

  const {
    currentMessages, // Use currentMessages from current conversation (not legacy messages)
    isStreaming,
    currentProgress,
    processingStepText,
    isWaitingForAI,
    currentConversationId,
    currentConversation,
  } = useVibe();
  
  // Debug logging - log state changes to help track issues
  console.log('[ChatContainer] Render:', { 
    messageCount: currentMessages.length, 
    isStreaming, 
    isWaitingForAI,
    conversationId: currentConversationId 
  });

  // Scroll to bottom on new messages or streaming
  useEffect(() => {
    if (currentMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [currentMessages.length, isStreaming, currentConversationId]);

  // ⭐ MATCHES app_ref: Save conversation to S3 when messages change
  useEffect(() => {
    // Debug logging
    console.log("💾 [ChatContainer] Save effect triggered:", {
      hasCompany: !!currentCompany?.companyName,
      companyName: currentCompany?.companyName,
      companyID: currentCompany?.companyID,
      conversationId: currentConversationId,
      messageCount: currentMessages?.length,
    });

    if (!currentCompany?.companyName || !currentCompany?.companyID || !currentConversationId) {
      console.log("💾 [ChatContainer] Skipping save - missing company or conversation ID");
      return;
    }
    
    // Don't save empty conversations
    if (!currentMessages || currentMessages.length === 0) {
      console.log("💾 [ChatContainer] Skipping save - no messages");
      return;
    }

    const conversationPath = `accounts/${currentCompany.companyName}_${currentCompany.companyID}/conversations/${currentConversationId}/conversation_state.json`;
    console.log("💾 [ChatContainer] Saving to S3:", conversationPath);
    
    // Save the current conversation state to S3
    uploadJsonToS3(conversationPath, currentConversation)
      .then((result) => {
        if (result) {
          console.log("✅ [ChatContainer] Saved to S3 successfully");
        } else {
          console.warn("⚠️ [ChatContainer] S3 save returned null");
        }
      })
      .catch((err) => {
        console.error("❌ [ChatContainer] S3 save error:", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMessages]);

  // Combine messages with a "footer" for streaming state if needed
  // Note: FlatList ListFooterComponent is better for this in RN
  
  const renderItem = ({ item }) => {
    if (item.type === "user") {
      return <UserMessage message={item} />;
    } else {
      return (
        <AIMessage 
          message={item} 
          isStreaming={isStreaming && item.id === 'streaming_placeholder'} 
        />
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <FlatList
        ref={flatListRef}
        data={currentMessages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ 
          paddingHorizontal: 16, 
          paddingVertical: 16,
          paddingBottom: 20 
        }}
        // ListFooterComponent renders the "Thinking..." or Streaming text
        ListFooterComponent={() => (
          <View>
            {/* 1. AI Loading Spinner when waiting for response */}
            {(isWaitingForAI || isStreaming) && (
              <AILoadingSpinner 
                progress={currentProgress} 
                isStreaming={isWaitingForAI || isStreaming}
                processingStepText={processingStepText}
              />
            )}


          </View>
        )}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
    </View>
  );
};

export default ChatContainer;