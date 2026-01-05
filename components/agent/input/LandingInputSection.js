// D:\TG_REACT_NATIVE_MOBILE_APP\components\agent\input\LandingInputSection.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

// Components
import MentionEditor from "./MentionEditor";

// Hooks
// import useDataset from "../../../hooks/useDataset"; // TODO: Create this hook
// import { useVibe } from "../../../hooks/useVibe"; // Commented out as not used

const LandingInputSection = ({
  onSendMessage,
  canSendMessage: canSendMessageProp,
  isWaitingForAI,
}) => {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);
  
  // Hooks
  // const { datasets_name_list } = useDataset(); // TODO: Create hook
  // const { creditScore } = useVibe(); // Commented out as creditScore is not used

  // Allow typing even if socket is not ready, but disable if waiting for AI or no credits
  const isEditorDisabled = isWaitingForAI; // Removed creditScore check as requested
  const hasText = inputValue.trim().length > 0;

  // Transform dataset names for suggestions
  // const datasets_name_list = []; // TODO: Get from useDataset hook
  const suggestions = []; // TODO: Uncomment when useDataset available
  // (datasets_name_list || []).map(name => ({
  //   id: name,
  //   name: name,
  //   type: 'dataset'
  // }));

  const handleSend = (text = inputValue) => {
    if (text.trim() && canSendMessageProp && !isWaitingForAI) {
      onSendMessage(text.trim());
      setInputValue("");
    }
  };

  // Send is disabled if editor is disabled OR socket is not ready OR no text
  const isSendDisabled = isEditorDisabled || !hasText; 
  // Note: We don't strictly disable button on !canSendMessageProp so we can show loading spinner

  return (
    <View style={{ width: '100%', maxWidth: '100%', alignSelf: 'center', paddingHorizontal: 4, paddingBottom: 4 }}>
      <View 
        style={{ 
          minHeight: 56, 
          maxHeight: 150,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isEditorDisabled ? '#f9fafb' : '#ffffff',
          borderWidth: 1,
          borderColor: '#e5e7eb',
          borderRadius: 9999,
          paddingHorizontal: 16,
          paddingVertical: 12,
          opacity: isEditorDisabled ? 0.6 : 1
        }}
      >
        {/* Editor Area */}
        <View style={{ flex: 1, marginRight: 12 }}>
          <MentionEditor
            ref={inputRef}
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            placeholder="Ask me anything..."
            editable={!isEditorDisabled}
            suggestions={suggestions}
          />
        </View>

        {/* Send Button */}
        <TouchableOpacity
          onPress={() => handleSend(inputValue)}
          disabled={isSendDisabled && canSendMessageProp}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: hasText && !isEditorDisabled ? '#111827' : '#f3f4f6',
          }}
        >
          {!canSendMessageProp && hasText ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialCommunityIcons 
              name="arrow-up" 
              size={20} 
              color={hasText && !isEditorDisabled ? "white" : "#9ca3af"} 
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LandingInputSection;