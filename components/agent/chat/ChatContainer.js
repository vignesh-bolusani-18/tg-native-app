// D:\TG_REACT_NATIVE_MOBILE_APP\components\agent\chat\ChatContainer.js
import React, { useEffect, useRef } from "react";
import { FlatList, Image, Text, View } from "react-native";

// Hooks
import { useVibe } from "../../../hooks/useVibe";

// Components
import AIMessage from "./AIMessage";
import TypingIndicator from "./TypingIndicator";
import UserMessage from "./UserMessage";

// Assets (Ensure path is correct)
const TGIcon = require("../../../assets/images/icon.png"); 

const ChatContainer = () => {
  // const theme = useTheme();
  const flatListRef = useRef(null);

  const {
    messages, // From Redux via useVibe
    isStreaming,
    currentProgress,
    processingStepText,
    isWaitingForAI,
    currentConversationId,
    currentConversation,
    conversations,
  } = useVibe();
  
  // Debug logging - only log on significant state changes (commented out for production)
  // console.log('[ChatContainer] Render:', { messageCount: messages.length, isStreaming, isWaitingForAI });

  // Scroll to bottom on new messages or streaming
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, isStreaming, currentConversationId]);

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
        data={messages}
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
            {/* 1. Typing Indicator when waiting for initial response */}
            {isWaitingForAI && !isStreaming && (
              <View style={{ marginBottom: 16, marginLeft: 0, paddingHorizontal: 8 }}>
                <TypingIndicator isTyping={true} message={processingStepText || "Thinking..."} />
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