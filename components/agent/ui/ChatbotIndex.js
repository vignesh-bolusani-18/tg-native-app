/**
 * 💬 CHATBOT INDEX - Main chatbot component (entry point)
 * Converted from: D:\TrueGradient\tg-application\src\components\Chatbot\index1.js (763 lines)
 * Simplified for React Native - combines all chatbot functionality
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import BotDisplay from './BotDisplay';
import FileSelector from './FileSelector';
import InitialMessage from './InitialMessage';
import ModelSelector from './ModelSelector';
// import { fetchRelatedQueries } from '../../utils/Agent Utils/chatbotFunctions'; // Missing file

// Mock function
const fetchRelatedQueries = async (query) => {
  return ["Related query 1", "Related query 2"];
};

export default function ChatbotIndex({ userID, conversationId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('OpenAi');
  const [contextFiles] = useState([]); 
  const [selectedContextFile, setSelectedContextFile] = useState(null);
  const scrollViewRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSendQuery = async (queryText) => {
    const query = queryText || input;
    if (!query.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { type: 'user', text: query }]);
    setInput('');
    setIsLoading(true);

    try {
      // Add loading indicator
      setMessages((prev) => [...prev, { type: 'loading', stage: 'processing' }]);

      // Simulate API call (replace with actual API)
      const response = await simulateBotResponse(query);

      // Remove loading indicator
      setMessages((prev) => prev.filter((msg) => msg.type !== 'loading'));

      // Add bot response
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          text: response.text,
        },
      ]);

      // Fetch related queries
      if (response.shouldFetchRelated) {
        const relatedQueries = await fetchRelatedQueries(
          userID,
          query,
          selectedModel,
          conversationId
        );

        if (relatedQueries.length > 0) {
          setMessages((prev) => [
            ...prev,
            {
              type: 'bot',
              related: relatedQueries,
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Error sending query:', error);
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          text: 'Sorry, an error occurred. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate bot response (replace with actual API call)
  const simulateBotResponse = async (query) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      text: `I received your query: "${query}". This is a placeholder response.`,
      shouldFetchRelated: true,
    };
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Assistant</Text>
        <View style={styles.headerActions}>
          <ModelSelector onSelectModel={setSelectedModel} />
          <TouchableOpacity onPress={handleClearChat} style={styles.clearButton}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#d32f2f" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 ? (
          <InitialMessage onSendQuery={handleSendQuery} />
        ) : (
          <BotDisplay
            messages={messages}
            noContext={!selectedContextFile}
            conversationId={conversationId}
          />
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <FileSelector
          contextFiles={contextFiles}
          selectedContextFile={selectedContextFile}
          setSelectedContextFile={setSelectedContextFile}
        />
        
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            multiline
            maxHeight={100}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, isLoading && styles.disabledButton]}
            onPress={() => handleSendQuery()}
            disabled={isLoading || !input.trim()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isLoading ? 'loading' : 'send'}
              size={24}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingBottom: 16,
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 12,
    gap: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  sendButton: {
    backgroundColor: '#1976d2',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
