/**
 * 🤖 AI MESSAGE - Display AI responses with tool calls, final answer, and workflow actions
 * Includes workflow action sections: Approval, Data Upload, Tags, Context Questions, etc.
 * ⭐ MATCHES tg-application: Full markdown rendering support
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

// Hooks
import { useVibe } from '../../../hooks/useVibe';

// Action Sections
import AdvancedQuestionsSection from '../actions/AdvancedQuestionsSection';
import ApprovalSection from '../actions/ApprovalSection';
import ContextQuestionsSection from '../actions/ContextQuestionsSection';
import DataUploadSection from '../actions/DataUploadSection';
import ExperimentExecutorSection from '../actions/ExperimentExecutorSection';
import ExperimentProgressTracker from '../actions/ExperimentProgressTracker';
import SampleDataSection from '../actions/SampleDataSection';
import TagsSection from '../actions/TagsSection';

// ⭐ Import enhanced data table component (includes code modal inside)
import AIMessageDataTable from './AIMessageDataTable';

// Assets
const TGLogo = require('../../../assets/images/icon.png');

/**
 * ⭐ MATCHES tg-application: Render bold text (**text**)
 */
const renderBoldText = (text) => {
  if (!text || !text.includes('**')) return <Text>{text}</Text>;
  
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={index} style={{ fontWeight: '600', color: '#111827' }}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <Text key={index}>{part}</Text>;
  });
};

/**
 * ⭐ MATCHES tg-application: Format AI response with markdown
 * Handles: headers (#), lists (- or •), numbered lists (1.), code blocks, bold
 */
const formatAIResponse = (text) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  const result = [];
  let i = 0;
  let inCodeBlock = false;
  let codeLines = [];
  let tableRows = [];
  let inTable = false;

  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Handle fenced code blocks ```...```
    if (trimmedLine.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLines = [];
        i++;
        continue;
      } else {
        inCodeBlock = false;
        const codeContent = codeLines.join('\n');
        result.push(
          <View key={`code-${i}`} style={markdownStyles.codeBlock}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={markdownStyles.codeText}>{codeContent}</Text>
            </ScrollView>
          </View>
        );
        i++;
        continue;
      }
    }

    if (inCodeBlock) {
      codeLines.push(line);
      i++;
      continue;
    }

    // Handle markdown tables (lines with |)
    if (trimmedLine.includes('|') && trimmedLine.startsWith('|')) {
      tableRows.push(trimmedLine);
      inTable = true;
      i++;
      continue;
    } else if (inTable && tableRows.length > 0) {
      // Render the table
      result.push(renderMarkdownTable(tableRows, i));
      tableRows = [];
      inTable = false;
      // Don't increment i, process current line
      continue;
    }

    // Skip empty lines but add spacing
    if (!trimmedLine) {
      if (i > 0 && result.length > 0) {
        result.push(<View key={`spacer-${i}`} style={{ height: 8 }} />);
      }
      i++;
      continue;
    }

    // Check for markdown-style headings (#, ##, etc.)
    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      const fontSize = level === 1 ? 18 : level === 2 ? 16 : level === 3 ? 15 : 14;
      
      result.push(
        <Text key={`heading-${i}`} style={[markdownStyles.heading, { fontSize }]}>
          {renderBoldText(content)}
        </Text>
      );
      i++;
      continue;
    }

    // Check for numbered lists (1., 2., etc.)
    const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      result.push(
        <View key={`num-${i}`} style={markdownStyles.listItem}>
          <Text style={markdownStyles.listNumber}>{numberedMatch[1]}.</Text>
          <Text style={markdownStyles.listText}>{renderBoldText(numberedMatch[2])}</Text>
        </View>
      );
      i++;
      continue;
    }

    // Check for bullet points (- or •)
    const bulletMatch = trimmedLine.match(/^[-•]\s+(.+)$/);
    if (bulletMatch) {
      result.push(
        <View key={`bullet-${i}`} style={markdownStyles.listItem}>
          <Text style={markdownStyles.bulletPoint}>•</Text>
          <Text style={markdownStyles.listText}>{renderBoldText(bulletMatch[1])}</Text>
        </View>
      );
      i++;
      continue;
    }

    // Check for headers (lines that end with :)
    if (trimmedLine.endsWith(':') && trimmedLine.length < 60) {
      result.push(
        <Text key={`subhead-${i}`} style={markdownStyles.subHeading}>
          {renderBoldText(trimmedLine)}
        </Text>
      );
      i++;
      continue;
    }

    // Regular paragraph
    result.push(
      <Text key={`para-${i}`} style={markdownStyles.paragraph}>
        {renderBoldText(trimmedLine)}
      </Text>
    );
    i++;
  }

  // Handle any remaining table rows
  if (tableRows.length > 0) {
    result.push(renderMarkdownTable(tableRows, 'final'));
  }

  return result;
};

/**
 * ⭐ MATCHES tg-application: Render markdown table
 */
const renderMarkdownTable = (rows, keyPrefix) => {
  if (!rows || rows.length === 0) return null;
  
  // Parse table rows
  const parsedRows = rows
    .filter(row => !row.match(/^\|[-:\s|]+\|$/)) // Filter out separator rows (|---|---|)
    .map(row => {
      return row
        .split('|')
        .filter(cell => cell.trim() !== '')
        .map(cell => cell.trim());
    });
  
  if (parsedRows.length === 0) return null;
  
  const headerRow = parsedRows[0];
  const dataRows = parsedRows.slice(1);
  
  return (
    <View key={`table-${keyPrefix}`} style={markdownStyles.tableContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={markdownStyles.table}>
          {/* Header Row */}
          <View style={markdownStyles.tableHeaderRow}>
            {headerRow.map((cell, cellIndex) => (
              <View key={`header-${cellIndex}`} style={markdownStyles.tableHeaderCell}>
                <Text style={markdownStyles.tableHeaderText}>{cell}</Text>
              </View>
            ))}
          </View>
          
          {/* Data Rows */}
          {dataRows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={[
              markdownStyles.tableRow,
              rowIndex % 2 === 0 ? markdownStyles.tableRowEven : null
            ]}>
              {row.map((cell, cellIndex) => (
                <View key={`cell-${rowIndex}-${cellIndex}`} style={markdownStyles.tableCell}>
                  <Text style={markdownStyles.tableCellText}>{cell}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default function AIMessage({ message, toolsUsed = [], isStreaming = false }) {
  const { currentConversation } = useVibe();
  
  // Extract experiment info
  const experiments = currentConversation?.experiments;
  const experimentTriggered = experiments && typeof experiments === 'object' && Object.keys(experiments).length > 0;
  const experimentId = experimentTriggered ? Object.keys(experiments)[0] : null;

  // Extract tool calls from message if available
  const toolCalls = message.toolCalls || [];

  // Extract langgraph state for workflow actions
  const langState = message?.langgraphState;

  // ⭐ ENHANCED: Extract data and other properties from message
  // These come from final_output_node responses in vibeSlice
  const messageData = message?.data;
  const messageDataTitle = message?.dataTitle;
  const messageDataPath = message?.dataPath;
  const hasS3Data = message?.hasS3Data;
  const messageDataTotalRows = message?.dataTotalRows;

  // Determine which workflow action sections to show
  const needsApproval = langState?.next_step?.user === 'approve_module' || langState?.next_step?.user === 'approved';
  const needsUploadData = langState?.next_step?.user === 'upload_data' || langState?.next_step?.user === 'uploaded_data';
  const hasSampleData = message?.sampleData;
  const hasTagsData = message?.tagsData;
  const showContextQuestions = message?.nodeName === 'context_questions_generator';
  const showAdvancedQuestions = message?.nodeName === 'advanced_questions_generator';
  const showExperimentValidator = message?.nodeName === 'experiment_validator';
  const showExperimentProgressTracker = message?.nodeName === 'workflow_complete';

  // Extract final answer (remove "Final Answer:" prefix if present)
  const finalAnswer = message.content?.includes('Final Answer:')
    ? message.content.split('Final Answer:')[1].trim()
    : message.content;

  // Function to beautify tool names
  const beautifyToolName = (toolName) => {
    return toolName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Check if we have any workflow actions to show
  const hasWorkflowActions = needsApproval || needsUploadData || hasSampleData || 
    hasTagsData || showContextQuestions || showAdvancedQuestions || 
    showExperimentValidator || showExperimentProgressTracker;

  // Check if we have data to display (code is accessed through data table modal)
  const hasDataOutput = messageData && (Array.isArray(messageData) ? messageData.length > 0 : Object.keys(messageData).length > 0);

  return (
    <View style={styles.container}>
      {/* AI Avatar */}
      <View style={styles.avatar}>
        <Image source={TGLogo} style={styles.avatarImage} resizeMode="contain" />
      </View>
      
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
          {(!hasWorkflowActions) && (
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="check-circle" size={18} color="#059669" />
              <Text style={[styles.sectionTitle, { color: '#059669' }]}>
                FINAL ANSWER
              </Text>
            </View>
          )}

          {/* AI Response Text - ⭐ MATCHES tg-application: Use formatAIResponse for markdown */}
          {finalAnswer && (
            <View style={styles.answerContainer}>
              {formatAIResponse(finalAnswer)}
            </View>
          )}

          {/* ⭐ Data Table Component with code modal inside - code only shows when user clicks "Code" button */}
          {hasDataOutput && (
            <AIMessageDataTable 
              data={messageData}
              title={messageDataTitle}
              message={message}
              hasS3Data={hasS3Data}
              dataPath={messageDataPath}
              dataTotalRows={messageDataTotalRows}
            />
          )}
        </View>

        {/* WORKFLOW ACTION SECTIONS */}
        
        {/* Approval Section - for module approval */}
        {needsApproval && langState && (
          <ApprovalSection approvalData={langState} messageId={message.id} />
        )}

        {/* Data Upload Section - for uploading training data */}
        {needsUploadData && langState && (
          <DataUploadSection uploadData={langState} messageId={message.id} />
        )}

        {/* Sample Data Section */}
        {hasSampleData && message.sampleData && (
          <SampleDataSection sampleData={message.sampleData} />
        )}

        {/* Tags Section - for data tagging */}
        {hasTagsData && message.tagsData && (
          <TagsSection
            tagsData={message.tagsData}
            messageId={message.id}
            langgraphState={langState}
          />
        )}

        {/* Context Questions Section */}
        {showContextQuestions && langState?.context_questions && (
          <ContextQuestionsSection
            contextQuestions={langState.context_questions}
            messageId={message.id}
            langgraphState={langState}
          />
        )}

        {/* Advanced Questions Section */}
        {showAdvancedQuestions && langState?.advanced_questions && (
          <AdvancedQuestionsSection
            advancedQuestions={langState.advanced_questions}
            messageId={message.id}
            langgraphState={langState}
          />
        )}

        {/* Experiment Validator/Executor Section */}
        {showExperimentValidator && (
          <ExperimentExecutorSection
            messageId={message.id}
            langgraphState={langState}
          />
        )}

        {/* Experiment Progress Tracker */}
        {showExperimentProgressTracker && experimentId && experimentTriggered && (
          <ExperimentProgressTracker experimentId={experimentId} />
        )}

        {/* Streaming Indicator */}
        {isStreaming && (
          <View style={styles.streamingIndicator}>
            <Text style={styles.streamingText}>AI is typing...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 8,
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarImage: {
    width: 20,
    height: 20,
  },
  messageCard: {
    flex: 1,
    maxWidth: '85%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    borderTopLeftRadius: 4, // Tail effect pointing to avatar
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
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
    padding: 16,
  },
  answerContainer: {
    flex: 1,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#1F2937',
    fontWeight: '400',
  },
  streamingIndicator: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  streamingText: {
    color: '#9ca3af',
    fontStyle: 'italic',
    fontSize: 12,
  },
  // ⭐ ENHANCED: Code section styles
  codeSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  codeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  codeTitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366f1',
  },
  // ⭐ ENHANCED: Data section styles
  dataSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  dataTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dataTitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0891b2',
  },
  dataRowCount: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  moreDataIndicator: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  moreDataText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  s3LinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  s3LinkText: {
    fontSize: 12,
    color: '#6b7280',
  },
});

/**
 * ⭐ MATCHES tg-application: Markdown-specific styles
 */
const markdownStyles = StyleSheet.create({
  heading: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    marginTop: 8,
  },
  subHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    marginTop: 12,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#1F2937',
    fontWeight: '400',
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
    width: 16,
    textAlign: 'center',
  },
  listNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginRight: 8,
    minWidth: 20,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: '#1F2937',
  },
  codeBlock: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginVertical: 12,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
    color: '#1F2937',
  },
  // Table styles
  tableContainer: {
    marginVertical: 12,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  table: {
    minWidth: '100%',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderCell: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 100,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRowEven: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 100,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  tableCellText: {
    fontSize: 13,
    color: '#1F2937',
  },
});
