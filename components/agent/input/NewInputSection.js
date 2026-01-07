import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const NewInputSection = ({
  onSendMessage,
  onStartChat,
  canSendMessage,
  isWaitingForAI,
  hasConversation,
  experiments = [],
  onToggleExperiments,
  showExperiments = false,
}) => {
  const [message, setMessage] = useState('');
  const [selectedExperiment, setSelectedExperiment] = useState(null);

  const handleSend = () => {
    if (!message.trim() || !canSendMessage) return;

    if (hasConversation) {
      onSendMessage(message.trim());
    } else {
      onStartChat(message.trim());
    }
    setMessage('');
  };

  const canSubmit = message.trim().length > 0 && canSendMessage && !isWaitingForAI;

  return (
    <View style={styles.container}>
      {/* Analyze Experiment Bar (Collapsible) */}
      <View style={styles.experimentContainer}>
        <TouchableOpacity 
          style={styles.experimentHeader}
          onPress={onToggleExperiments}
          activeOpacity={0.8}
        >
          <View style={styles.experimentHeaderContent}>
            <MaterialIcons name="lightbulb" size={14} color="#FFFFFF" />
            <Text style={styles.experimentHeaderText}>Analyze experiment</Text>
            <MaterialIcons 
              name={showExperiments ? "expand-less" : "expand-more"} 
              size={14} 
              color="#FFFFFF" 
            />
          </View>
        </TouchableOpacity>

        {/* Experiment List (Shown when expanded) */}
        {showExperiments && experiments.length > 0 && (
          <View style={styles.experimentList}>
            <View style={styles.experimentListHeader}>
              <Text style={styles.experimentListTitle}>
                Select from the list of experiments
              </Text>
            </View>
            {experiments.slice(0, 3).map((exp, index) => (
              <TouchableOpacity
                key={exp.experimentID || index}
                style={[
                  styles.experimentItem,
                  selectedExperiment?.experimentID === exp.experimentID && styles.experimentItemActive
                ]}
                onPress={() => setSelectedExperiment(exp)}
              >
                <View style={styles.experimentItemContent}>
                  <Text style={styles.experimentItemTitle} numberOfLines={1}>
                    {exp.experimentID || 'Untitled Experiment'}
                  </Text>
                  <MaterialIcons name="info-outline" size={12} color="#808080" />
                </View>
                <View style={styles.experimentTags}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>inventory optimization</Text>
                  </View>
                  <View style={[styles.tag, styles.tagSecondary]}>
                    <Text style={[styles.tagText, styles.tagTextSecondary]}>US Supply chain</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Main Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          {/* Left Icons */}
          <View style={styles.leftIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialIcons name="alternate-email" size={18} color="#808080" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialIcons name="attach-file" size={18} color="#808080" />
            </TouchableOpacity>
          </View>

          {/* Text Input */}
          <TextInput
            style={styles.input}
            placeholder="Ask anything..."
            placeholderTextColor="#999999"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
            editable={canSendMessage && !isWaitingForAI}
          />

          {/* Right Icons */}
          <View style={styles.rightIcons}>
            <TouchableOpacity style={styles.micButton}>
              <MaterialIcons name="mic" size={18} color="#666666" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.sendButton,
                !canSubmit && styles.sendButtonDisabled
              ]}
              onPress={handleSend}
              disabled={!canSubmit}
            >
              <MaterialIcons 
                name="arrow-upward" 
                size={18} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  experimentContainer: {
    width: '100%',
  },
  experimentHeader: {
    backgroundColor: '#008AE5',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  experimentHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  experimentHeaderText: {
    fontFamily: 'Inter Display',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 24,
    color: '#FFFFFF',
    flex: 1,
  },
  experimentList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: 'rgba(0, 138, 229, 0.5)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    shadowColor: '#333333',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  experimentListHeader: {
    backgroundColor: 'rgba(0, 138, 229, 0.1)',
    paddingHorizontal: 18,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 16,
  },
  experimentListTitle: {
    fontFamily: 'Inter Display',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#CCEBFF',
  },
  experimentItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    gap: 16,
  },
  experimentItemActive: {
    borderColor: 'rgba(0, 138, 229, 0.5)',
  },
  experimentItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  experimentItemTitle: {
    fontFamily: 'Inter Display',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    color: '#333333',
    flex: 1,
  },
  experimentTags: {
    flexDirection: 'row',
    gap: 12,
  },
  tag: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagSecondary: {
    backgroundColor: '#FFF5DB',
  },
  tagText: {
    fontFamily: 'Geist Mono',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
    color: '#0069CC',
  },
  tagTextSecondary: {
    color: '#8F6900',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 138, 229, 0.5)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#333333',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leftIcons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  iconButton: {
    padding: 4,
    borderRadius: 4,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter Display',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: '#333333',
    paddingVertical: 0,
    maxHeight: 100,
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  micButton: {
    backgroundColor: '#F0F0F0',
    padding: 6,
    borderRadius: 16,
  },
  sendButton: {
    backgroundColor: '#0F8BFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    shadowColor: 'rgba(0, 31, 59, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default NewInputSection;
