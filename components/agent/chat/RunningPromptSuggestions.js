/**
 * 💡 RUNNING PROMPT SUGGESTIONS - Quick action suggestions during chat
 * Converted from: D:\TrueGradient\tg-application\src\components\VibeGradient\RunningPromptSuggestions.js
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RunningPromptSuggestions({
  suggestions = [],
  onSuggestionClick,
  onRefresh,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Default suggestions if none provided
  const defaultSuggestions = [
    "Can you explain that in more detail?",
    "Show me the code for this",
    "What are the next steps?",
    "Can you add more features?",
  ];

  const displaySuggestions =
    suggestions.length > 0 ? suggestions : defaultSuggestions;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="lightbulb-on" size={14} color="#f59e0b" />
          <Text style={styles.headerText}>Quick Actions</Text>
        </View>

        {onRefresh && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="refresh" size={12} color="#64748b" />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsContainer}
      >
        {displaySuggestions.map((suggestion, index) => (
          <TouchableOpacity
            key={suggestion}
            style={styles.suggestionChip}
            onPress={() => onSuggestionClick && onSuggestionClick(suggestion)}
            activeOpacity={0.7}
          >
            <Text style={styles.suggestionText} numberOfLines={1}>
              {suggestion}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 12.8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  refreshText: {
    fontSize: 11.2,
    color: '#64748b',
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 28,
    justifyContent: 'center',
    maxWidth: 200,
  },
  suggestionText: {
    fontSize: 11.2,
    color: '#374151',
    fontWeight: '400',
  },
});
