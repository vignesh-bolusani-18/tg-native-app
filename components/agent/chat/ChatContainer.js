// D:\TG_REACT_NATIVE_MOBILE_APP\components\agent\chat\ChatContainer.js
import React, { useEffect, useRef } from "react";
import { FlatList, Image, Text, View } from "react-native";

// Hooks
import { useVibe } from "../../../hooks/useVibe";
import useAuth from "../../../hooks/useAuth";

// Utils
import { uploadJsonToS3 } from "../../../utils/s3Utils";

// Components
import AIMessage from "./AIMessage";
import TypingIndicator from "./TypingIndicator";
import UserMessage from "./UserMessage";

// Assets (Ensure path is correct)
const TGIcon = require("../../../assets/images/icon.png"); 

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
  
  // Debug logging - only log on significant state changes (commented out for production)
  // console.log('[ChatContainer] Render:', { messageCount: currentMessages.length, isStreaming, isWaitingForAI });

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
            {/* 1. AI Loading Bubble when waiting for response */}
            {isWaitingForAI && (
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'flex-start', 
                marginBottom: 16, 
                marginTop: 8, 
                paddingHorizontal: 8 
              }}>
                {/* TG Avatar */}
                <View style={{ 
                  width: 36, 
                  height: 36, 
                  borderRadius: 18, 
                  backgroundColor: '#DBEAFE', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginRight: 10 
                }}>
                  <Image source={TGIcon} style={{ width: 18, height: 18 }} resizeMode="contain" />
                </View>
                {/* Loading Bubble */}
                <View style={{ 
                  flex: 1, 
                  backgroundColor: '#F9FAFB', 
                  padding: 14, 
                  borderRadius: 12, 
                  borderTopLeftRadius: 4,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  shadowColor: '#000', 
                  shadowOffset: { width: 0, height: 1 }, 
                  shadowOpacity: 0.05, 
                  shadowRadius: 2, 
                  elevation: 1 
                }}>
                  <TypingIndicator isTyping={true} message={processingStepText || "Thinking..."} />
                </View>
              </View>
            )}

            {/* 2. Streaming Progress Text */}
            {isStreaming && currentProgress.length > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, marginTop: 8, paddingHorizontal: 8 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                   <Image source={TGIcon} style={{ width: 18, height: 18 }} resizeMode="contain" />
                </View>
                <View style={{ flex: 1, backgroundColor: '#F3F4F6', padding: 14, borderRadius: 12, borderTopLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
                  {/* Show the last progress message */}
                  <Text style={{ color: '#1F2937', fontSize: 14, lineHeight: 21, fontWeight: '500' }}>
                    {currentProgress[currentProgress.length - 1]?.message || "Processing..."}
                  </Text>
                </View>
              </View>
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