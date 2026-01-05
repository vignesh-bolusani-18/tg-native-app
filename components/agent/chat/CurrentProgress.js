/**
 * ⏳ CURRENT PROGRESS - Show AI thinking/tool usage progress
 * Converted from: D:\TrueGradient\tg-application\src\components\VibeGradient\CurrentProgress.js
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

export default function CurrentProgress({ progress, isStreaming }) {
  // Helper function to check if we should show progress
  const shouldShowProgress = (progressArray) => {
    if (isStreaming) return true;
    if (!progressArray || progressArray.length === 0) return false;
    const latestProgress = progressArray[progressArray.length - 1];
    return latestProgress.message_type !== 'final_answer';
  };

  // Function to beautify tool names
  const beautifyToolName = (toolName) => {
    return toolName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Get progress text based on message type
  const getProgressText = (messageType) => {
    switch (messageType) {
      case 'ai_understanding':
        return 'Understanding your request...';
      case 'tool_call':
        return 'Calling tool...';
      case 'tool_result':
        return 'Processing results...';
      case 'processing':
        return 'Processing...';
      default:
        return 'Thinking...';
    }
  };

  // Group progress by tool to show multiple active tools
  const getActiveTools = () => {
    if (!progress || progress.length === 0) {
      return isStreaming ? [{ type: 'thinking', messageType: null }] : [];
    }

    const activeTools = [];
    const toolStates = new Map();

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
      } else if (messageType === 'ai_understanding') {
        activeTools.push({
          type: 'ai_understanding',
          messageType,
          step,
          timestamp: item.timestamp,
        });
      }
    });

    const tools = Array.from(toolStates.values()).map((tool) => ({
      type: 'tool',
      ...tool,
    }));

    const allItems = [...activeTools, ...tools].sort(
      (a, b) => a.timestamp - b.timestamp
    );

    return allItems.filter((item) => item.messageType !== 'final_answer');
  };

  if (!shouldShowProgress(progress)) return null;

  const activeTools = getActiveTools();

  // Show generic thinking if no active tools but streaming
  if (activeTools.length === 0 && isStreaming) {
    return (
      <View style={styles.container}>
        <View style={styles.progressCard}>
          <View style={styles.pulseIndicator} />
          <Text style={styles.progressText}>Thinking...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {activeTools.map((tool, index) => (
        <View
          key={`${tool.type}-${tool.toolName || tool.messageType}-${index}`}
          style={styles.progressCard}
        >
          {/* Progress Indicator */}
          <View style={styles.pulseIndicator} />

          {/* Progress Text */}
          <Text style={styles.progressText}>
            {tool.messageType ? getProgressText(tool.messageType) : 'Thinking...'}
          </Text>

          {/* Tool Name Chip */}
          {tool.type === 'tool' && tool.toolName && (
            <View style={styles.toolChip}>
              <MaterialCommunityIcons name="hammer-wrench" size={12} color="#1e40af" />
              <Text style={styles.toolChipText}>
                {beautifyToolName(tool.toolName)}
              </Text>
            </View>
          )}

          {/* Step Number */}
          {tool.step && tool.type === 'tool' && (
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>Step {tool.step}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    marginHorizontal: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pulseIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
  },
  progressText: {
    fontSize: 14.4,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
    letterSpacing: 0.25,
  },
  toolChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  toolChipText: {
    fontSize: 11.2,
    color: '#1e40af',
    fontWeight: '600',
    letterSpacing: 0.25,
  },
  stepBadge: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  stepText: {
    fontSize: 10.4,
    color: '#6b7280',
    fontWeight: '600',
    letterSpacing: 0.25,
  },
});
