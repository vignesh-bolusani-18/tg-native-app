/**
 * 🤖 AI MESSAGE - Display AI responses with tool calls and final answer
 * Converted from: D:\TrueGradient\tg-application\src\components\VibeGradient\AIMessage.js
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AIMessage({ message, toolsUsed = [] }) {
  // Extract tool calls from message if available
  const toolCalls = message.toolCalls || [];

  // Extract final answer (remove "Final Answer:" prefix if present)
  const finalAnswer = message.content.includes('Final Answer:')
    ? message.content.split('Final Answer:')[1].trim()
    : message.content;

  // Function to beautify tool names
  const beautifyToolName = (toolName) => {
    return toolName
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter
  };

  // Function to format the final answer with better typography
  const formatFinalAnswer = (text) => {
    if (!text) return null;

    // Split by lines to handle different formatting
    const lines = text.split('\n').filter((line) => line.trim());

    return lines.map((line, index) => {
      const trimmedLine = line.trim();

      // Check for numbered lists (1., 2., etc.)
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
      if (numberedMatch) {
        return (
          <View key={index} style={styles.listItem}>
            <Text style={styles.numberLabel}>{numberedMatch[1]}.</Text>
            <Text style={styles.listText}>{numberedMatch[2]}</Text>
          </View>
        );
      }

      // Check for bullet points (- or •)
      const bulletMatch = trimmedLine.match(/^[-•]\s+(.+)$/);
      if (bulletMatch) {
        return (
          <View key={index} style={styles.listItem}>
            <Text style={styles.bulletLabel}>•</Text>
            <Text style={styles.listText}>{bulletMatch[1]}</Text>
          </View>
        );
      }

      // Check for headers (lines that end with :)
      if (trimmedLine.endsWith(':')) {
        return (
          <Text key={index} style={styles.headerText}>
            {trimmedLine}
          </Text>
        );
      }

      // Regular paragraph
      return (
        <Text key={index} style={styles.paragraphText}>
          {trimmedLine}
        </Text>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.messageCard}>
        {/* Tool Calls Section */}
        {toolCalls.length > 0 && (
          <View style={styles.toolCallsSection}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="hammer-wrench" size={16} color="#64748b" />
              <Text style={styles.sectionTitle}>TOOLS USED</Text>
            </View>

            <View style={styles.toolsList}>
              {toolCalls.map((toolCall, index) => (
                <View key={index} style={styles.toolCard}>
                  <View style={styles.toolIndicator} />
                  <View style={styles.toolContent}>
                    <View style={styles.toolChip}>
                      <Text style={styles.toolChipText}>
                        {beautifyToolName(toolCall.toolName)}
                      </Text>
                    </View>
                    <Text style={styles.toolMessage}>{toolCall.message}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Final Answer Section */}
        <View style={styles.finalAnswerSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="check-circle" size={18} color="#059669" />
            <Text style={[styles.sectionTitle, { color: '#059669' }]}>
              FINAL ANSWER
            </Text>
          </View>

          {formatFinalAnswer(finalAnswer)}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  messageCard: {
    flex: 1,
    maxWidth: '80%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  toolCallsSection: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toolsList: {
    gap: 8,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  toolIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
    marginTop: 4,
  },
  toolContent: {
    flex: 1,
  },
  toolChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  toolChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1e40af',
  },
  toolMessage: {
    fontSize: 13,
    lineHeight: 18.2,
    color: '#000000',
    fontWeight: '400',
  },
  finalAnswerSection: {
    padding: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  numberLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginRight: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  bulletLabel: {
    fontSize: 14,
    color: '#000000',
    marginRight: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  listText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22.4,
    color: '#000000',
    fontWeight: '400',
  },
  headerText: {
    fontSize: 15.2,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: 0.25,
  },
  paragraphText: {
    fontSize: 14,
    lineHeight: 22.4,
    color: '#000000',
    fontWeight: '400',
    marginBottom: 8,
  },
});
