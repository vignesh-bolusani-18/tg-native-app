/**
 * 👋 WELCOME SECTION - Welcome message with suggestions (ChatGPT style)
 * Converted from: D:\TrueGradient\tg-application\src\components\VibeGradient\WelcomeMessage.js
 */

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LandingInputSection from '../input/LandingInputSection';

export default function WelcomeSection({
  isConnected,
  isStreaming,
  connectionStatus,
  onStartChat,
  onSendMessage,
  canSendMessage,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const suggestedPrompts = [
    "Sales are unpredictable each month",
    "We have too much warehouse stock",
    "Our prices aren't competitive enough",
  ];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Input Section */}
      <View style={styles.inputContainer}>
        <LandingInputSection
          onSendMessage={onSendMessage}
          isConnected={isConnected}
          isStreaming={isStreaming}
          canSendMessage={canSendMessage}
        />
      </View>

      {/* Suggested Prompts */}
      <View style={styles.suggestionsContainer}>
        {suggestedPrompts.map((prompt, index) => (
          <TouchableOpacity
            key={prompt}
            style={styles.suggestionChip}
            onPress={() => onStartChat && onStartChat(prompt)}
            activeOpacity={0.7}
          >
            <Text style={styles.suggestionText}>{prompt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 600,
    marginTop: 24,
  },
  suggestionsContainer: {
    width: '100%',
    maxWidth: 600,
    marginTop: 16,
    gap: 12,
  },
  suggestionChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  suggestionText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    lineHeight: 18.2,
    textAlign: 'left',
  },
});
