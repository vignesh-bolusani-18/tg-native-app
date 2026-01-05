/**
 * 📝 RUNNING INPUT SECTION - Input during active conversation (ChatGPT style)
 * Converted from: D:\TrueGradient\tg-application\src\components\VibeGradient\RunningInputSection.js
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useVibe } from "../../../hooks/useVibe";

export default function RunningInputSection({ onSendMessage }) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { isConnected, isStreaming, canSendMessage } = useVibe();

  // Monitor state changes
  useEffect(() => {
    console.log("📱 RunningInputSection state:", {
      isConnected,
      isStreaming,
      canSendMessage,
    });
  }, [isConnected, isStreaming, canSendMessage]);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleSend = () => {
    if (inputValue.trim() && canSendMessage) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const isActive = inputValue.trim() && canSendMessage;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={[styles.inputWrapper, isActive && styles.inputWrapperActive]}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          multiline
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={
            isStreaming ? "Replying..." : "Continue the conversation..."
          }
          placeholderTextColor="#94a3b8"
          editable={canSendMessage}
          textAlignVertical="center"
        />

        <TouchableOpacity
          onPress={handleSend}
          disabled={!isActive}
          style={[
            styles.sendButton,
            isActive ? styles.sendButtonActive : styles.sendButtonInactive,
          ]}
          activeOpacity={0.7}
        >
          {isStreaming ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialCommunityIcons name="send" size={14} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputWrapperActive: {
    borderColor: '#1976d2',
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#1e293b',
    fontWeight: '400',
    marginRight: 8,
    paddingVertical: 0,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#1976d2',
  },
  sendButtonInactive: {
    backgroundColor: '#e2e8f0',
  },
});