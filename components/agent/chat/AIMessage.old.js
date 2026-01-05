// D:\TG_REACT_NATIVE_MOBILE_APP\components\agent\chat\AIMessage.js
import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import Markdown from "react-native-markdown-display";
import { useTheme } from "react-native-paper";

// Hooks
import { useVibe } from "../../../hooks/useVibe";

// Sub-components (We will build these in Phase 5: User Actions)
// For now, these are placeholders to prevent crashes until built
const ApprovalSection = () => null; 
const DataUploadSection = () => null;
const SampleDataSection = () => null;
const TagsSection = () => null;
const ContextQuestionsSection = () => null;
const AdvancedQuestionsSection = () => null;
const ExperimentExecutorSection = () => null;
const ExperimentProgressTracker = () => null;

// Assets
const TGLogo = require("../../../assets/images/tg_logo6.png"); // Ensure this path matches your assets

const AIMessage = ({
  message,
  toolsUsed = [],
  setIsWaitingForAI,
  isDrawer,
  isStreaming, // Passed from ChatContainer
}) => {
  const theme = useTheme();
  const { currentConversation } = useVibe();
  
  // Extract experiment info
  const experiments = currentConversation?.experiments;
  const experimentTriggered = experiments && typeof experiments === "object" && Object.keys(experiments).length > 0;
  const experimentId = experimentTriggered ? Object.keys(experiments)[0] : null;

  // Extract tool calls
  const toolCalls = message.toolCalls || [];

  // Scenarios logic
  const scenarios = Array.isArray(message?.scenarios) ? message.scenarios : [];
  const showCodeSection = scenarios.includes("code");
  const showDataSection = scenarios.includes("data");

  // Determine needed sections
  const langState = message?.langgraphState;
  const needsApproval = langState?.next_step?.user === "approve_module" || langState?.next_step?.user === "approved";
  const needsUploadData = langState?.next_step?.user === "upload_data" || langState?.next_step?.user === "uploaded_data";
  const hasSampleData = message?.sampleData;
  const hasTagsData = message?.tagsData;
  const showContextQuestions = message?.nodeName === "context_questions_generator";
  const showAdvancedQuestions = message?.nodeName === "advanced_questions_generator";
  const showExperimentValidator = message?.nodeName === "experiment_validator";
  const showExperimentProgressTracker = message?.nodeName === "workflow_complete";

  const beautifyToolName = (toolName) => {
    return toolName
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <View style={styles.messageRow}>
      {/* AI Avatar */}
      {!isDrawer && (
        <View style={styles.avatar}>
          <Image
            source={TGLogo}
            style={{ width: 20, height: 20 }}
            resizeMode="contain"
          />
        </View>
      )}

      {/* Message Content Container */}
      <View style={styles.contentContainer}>
        
        {/* Tool Calls Section */}
        {toolCalls.length > 0 && (
          <View className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="w-2 h-2 rounded-full bg-blue-500" />
              <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Tools Used
              </Text>
            </View>
            {toolCalls.map((toolCall, index) => (
              <View key={index} className="flex-row items-start gap-2 mb-2">
                <View className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-blue-800 mb-0.5">
                    {beautifyToolName(toolCall.toolName)}
                  </Text>
                  <Text className="text-xs text-gray-700 leading-5">
                    {toolCall.message}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* AI Text Content with Markdown */}
        {message?.content && (
          <View className="mb-3">
            <Markdown
              style={{
                body: { color: "#1F2937", fontSize: 15, lineHeight: 22 },
                heading1: { fontSize: 20, fontWeight: "bold", marginBottom: 8, marginTop: 12 },
                heading2: { fontSize: 18, fontWeight: "bold", marginBottom: 8, marginTop: 12 },
                code_block: { backgroundColor: "#F3F4F6", padding: 10, borderRadius: 8, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12 },
                code_inline: { backgroundColor: "#F3F4F6", padding: 2, borderRadius: 4, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
                list_item: { marginBottom: 4 },
              }}
            >
              {message.content}
            </Markdown>
          </View>
        )}

        {/* Render Action Sections (Placeholders until Phase 5) */}
        
        {/* Approval Section */}
        {needsApproval && langState && (
          <ApprovalSection approvalData={langState} messageId={message.id} />
        )}

        {/* Data Upload Section */}
        {needsUploadData && langState && (
          <DataUploadSection uploadData={langState} messageId={message.id} />
        )}

        {/* Sample Data Section */}
        {hasSampleData && message.sampleData && (
          <SampleDataSection sampleData={message.sampleData} />
        )}

        {/* Tags Section */}
        {hasTagsData && message.tagsData && (
          <TagsSection
            tagsData={message.tagsData}
            messageId={message.id}
            langgraphState={langState}
          />
        )}

        {/* Context Questions */}
        {showContextQuestions && langState?.context_questions && (
          <ContextQuestionsSection
            contextQuestions={langState.context_questions}
            messageId={message.id}
            langgraphState={langState}
          />
        )}

        {/* Advanced Questions */}
        {showAdvancedQuestions && langState?.advanced_questions && (
          <AdvancedQuestionsSection
            advancedQuestions={langState.advanced_questions}
            messageId={message.id}
            langgraphState={langState}
          />
        )}

        {/* Experiment Validator */}
        {showExperimentValidator && (
          <ExperimentExecutorSection
            messageId={message.id}
            langgraphState={langState}
          />
        )}

        {/* Experiment Progress */}
        {showExperimentProgressTracker && experimentId && experimentTriggered && (
          <ExperimentProgressTracker experimentId={experimentId} />
        )}

        {/* Streaming Placeholder */}
        {isStreaming && (
           <Text className="text-gray-400 italic text-xs mt-2">AI is typing...</Text>
        )}

      </View>
    </View>
  );
};

export default AIMessage;

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#ffffff',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  contentContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  toolsSection: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  toolsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  toolDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3b82f6',
  },
  toolsTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toolItem: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  toolItemDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#3b82f6',
    marginTop: 6,
  },
  toolItemContent: {
    flex: 1,
  },
  toolName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  toolMessage: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 16,
  },
  contentText: {
    fontSize: 13,
    color: '#1f2937',
    lineHeight: 20,
    marginBottom: 8,
  },
  typingText: {
    fontSize: 11,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 8,
  },
});
