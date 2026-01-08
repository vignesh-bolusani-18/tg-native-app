/**
 * AI Loading Spinner - Spinning TG Logo with Progress Text
 * Matches app_ref CurrentProgress component
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import TGIcon from '../../../assets/images/tg_logo6.svg';

export default function AILoadingSpinner({ 
  progress = [], 
  isStreaming = false,
  processingStepText = "Thinking..."
}) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Spinning animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    pulseAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, [spinValue, pulseValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Get progress text based on message type
  const getProgressText = (messageType) => {
    switch (messageType) {
      case "ai_understanding":
        return "Understanding your request...";
      case "tool_call":
        return "Calling tool...";
      case "tool_result":
        return "Processing results...";
      case "processing":
        return "Processing...";
      default:
        return processingStepText || "Thinking...";
    }
  };

  // Beautify tool names
  const beautifyToolName = (toolName) => {
    if (!toolName) return "";
    return toolName
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Get active tools from progress
  const getActiveTools = () => {
    if (!progress || progress.length === 0) {
      return isStreaming ? [{ type: "thinking", messageType: null }] : [];
    }

    const toolStates = new Map();
    const activeTools = [];

    progress.forEach((item) => {
      const toolName = item.details?.tool_name;
      const messageType = item.message_type;
      const step = item.step;

      if (toolName) {
        toolStates.set(toolName, {
          toolName,
          messageType,
          step,
          timestamp: item.timestamp,
        });
      } else if (messageType === "ai_understanding") {
        activeTools.push({
          type: "ai_understanding",
          messageType,
          step,
          timestamp: item.timestamp,
        });
      }
    });

    const tools = Array.from(toolStates.values()).map((tool) => ({
      type: "tool",
      ...tool,
    }));

    const allItems = [...activeTools, ...tools].sort(
      (a, b) => a.timestamp - b.timestamp
    );

    return allItems.filter((item) => item.messageType !== "final_answer");
  };

  const activeTools = getActiveTools();
  const currentTool = activeTools.length > 0 ? activeTools[0] : null;

  // Get display text
  const displayText = currentTool 
    ? (currentTool.messageType ? getProgressText(currentTool.messageType) : processingStepText)
    : processingStepText;

  const toolName = currentTool?.toolName ? beautifyToolName(currentTool.toolName) : null;

  // Don't hide - parent ChatContainer controls visibility with isWaitingForAI || isStreaming
  // if (!isStreaming && activeTools.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Spinning Logo */}
        <Animated.View
          style={{
            transform: [
              { rotate: spin },
              { scale: pulseValue },
            ],
          }}
        >
          <TGIcon width={20} height={20} />
        </Animated.View>

        {/* Progress Text */}
        <Text style={styles.progressText}>{displayText}</Text>

        {/* Tool Name Badge */}
        {toolName && (
          <View style={styles.toolBadge}>
            <Text style={styles.toolBadgeText}>{toolName}</Text>
          </View>
        )}

        {/* Step Number */}
        {currentTool?.step && currentTool.type === "tool" && (
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>Step {currentTool.step}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  progressText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    letterSpacing: 0.25,
  },
  toolBadge: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  toolBadgeText: {
    fontSize: 11,
    color: '#1e40af',
    fontWeight: '600',
    letterSpacing: 0.25,
  },
  stepBadge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stepText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
  },
});
