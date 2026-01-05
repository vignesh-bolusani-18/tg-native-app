/**
 * 🤖 BOT DISPLAY - Display bot messages with results
 * Converted from: D:\TrueGradient\tg-application\src\components\Chatbot\BotDisplay.js
 * Simplified for React Native - displays messages, tables, code, and related queries
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomChatbotTable from './CustomChatbotTable';
import DownloadCSVButton from './DownloadCSVButton';
import PythonBotDisplay from './PythonBotDisplay';
import Related from './Related';
import Summary from './Summary';

export default function BotDisplay({ messages, noContext, conversationId }) {
  const [isCodeOpen, setIsCodeOpen] = useState(false);

  const parseResult = (result) => {
    if (typeof result !== 'string') return result;
    try {
      return JSON.parse(result);
    } catch (error) {
      console.error('Failed to parse result:', error);
      return [];
    }
  };

  const userLatestMessage = messages
    .filter((msg) => msg.type === 'user')
    .map((msg) => msg.text)
    .pop();

  // const latestSummaryMessage = messages.find((msg) => msg.summary);
  // const latestSummary = latestSummaryMessage
  //   ? latestSummaryMessage.summary
  //   : 'No summary available';

  return (
    <View style={styles.container}>
      {messages.map((msg, index) => (
        <View
          key={index}
          style={[
            styles.messageWrapper,
            msg.type === 'user' ? styles.userAlign : styles.botAlign,
          ]}
        >
          {/* User Message */}
          {msg.type === 'user' ? (
            <View style={styles.userMessage}>
              <Text style={styles.userText}>{msg.text}</Text>
            </View>
          ) : msg.type === 'loading' && !noContext ? (
            <View
              style={[
                styles.loadingBox,
                {
                  backgroundColor:
                    msg.stage === 'done'
                      ? '#e8f5e9'
                      : msg.stage === 'report'
                      ? '#e3f2fd'
                      : '#e3f2fd',
                },
              ]}
            >
              <MaterialCommunityIcons
                name={
                  msg.stage === 'done'
                    ? 'check-circle'
                    : msg.stage === 'report'
                    ? 'file-document'
                    : 'code-tags'
                }
                size={20}
                color={msg.stage === 'done' ? '#4caf50' : '#2196f3'}
              />
              <Text style={styles.loadingText}>
                {msg.stage === 'done'
                  ? 'Generating Code Done'
                  : msg.stage === 'report'
                  ? 'Creating Report'
                  : 'Generating Code'}
              </Text>
            </View>
          ) : (
            // Bot Message
            <View style={styles.botMessageContainer}>
              {/* Bot Icon */}
              <MaterialCommunityIcons name="robot" size={24} color="#1976d2" />

              {/* Bot Content */}
              <View style={styles.botContent}>
                {msg.type === 'bot' && (
                  <Text style={styles.botText}>{msg.text}</Text>
                )}

                {/* Lambda Result */}
                {msg.type === 'lambdaResult' && (
                  <View style={styles.resultContainer}>
                    {msg.result && msg.result.length > 0 ? (
                      <>
                        {/* Header with Toggle and Download */}
                        <View style={styles.resultHeader}>
                          <Text style={styles.resultTitle}>Result:</Text>
                          
                          <View style={styles.resultActions}>
                            {msg.hasContext && (
                              <TouchableOpacity
                                onPress={() => setIsCodeOpen(!isCodeOpen)}
                                style={styles.toggleButton}
                              >
                                <MaterialCommunityIcons
                                  name={isCodeOpen ? 'chevron-up' : 'chevron-down'}
                                  size={20}
                                  color="#1976d2"
                                />
                              </TouchableOpacity>
                            )}
                            <DownloadCSVButton
                              data={parseResult(msg.result)}
                              fileName={`${conversationId}.csv`}
                            />
                          </View>
                        </View>

                        {/* Table */}
                        <CustomChatbotTable
                          data={parseResult(msg.result)}
                          query={userLatestMessage}
                        />

                        {/* Code Display */}
                        {isCodeOpen && msg.hasContext && (
                          <View style={styles.codeSection}>
                            <PythonBotDisplay message={msg.context} />
                          </View>
                        )}
                      </>
                    ) : (
                      <Text style={styles.noResultText}>No result available</Text>
                    )}
                  </View>
                )}

                {/* Summary */}
                {msg.summary && <Summary parsedSummary={msg.summary} />}

                {/* Related Queries */}
                {msg.related && msg.related.length > 0 && (
                  <Related
                    relatedOptions={msg.related}
                    onSendQuery={(query) => console.log('Send query:', query)}
                    clearRelated={() => console.log('Clear related')}
                  />
                )}
              </View>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 16,
    padding: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
  },
  userAlign: {
    justifyContent: 'flex-end',
  },
  botAlign: {
    justifyContent: 'flex-start',
  },
  userMessage: {
    maxWidth: '85%',
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  userText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  loadingText: {
    fontSize: 13,
    color: '#333',
  },
  botMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    maxWidth: '90%',
  },
  botContent: {
    flex: 1,
  },
  botText: {
    color: '#333',
    fontSize: 16,
    lineHeight: 25.6,
  },
  resultContainer: {
    marginTop: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleButton: {
    padding: 4,
  },
  codeSection: {
    marginTop: 16,
  },
  noResultText: {
    color: '#666',
    fontStyle: 'italic',
  },
});
