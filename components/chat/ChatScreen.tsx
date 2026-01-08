// components/chat/ChatScreen.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TGIcon from '../../assets/images/tg_logo6.svg';

interface QuickAction {
  id: string;
  label: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const ChatScreen = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [showAnalyzeDropdown, setShowAnalyzeDropdown] = useState(false);

  const quickActions: QuickAction[] = [
    { id: '1', label: 'Inventory Overview' },
    { id: '2', label: 'Reorder Recommendations' },
    { id: '3', label: 'Sales Loss Drivers' },
    { id: '4', label: 'Inventory Health Summary' },
  ];

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        text: inputText,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages([...messages, newMessage]);
      setInputText('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          {/* Logo with back button */}
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton}>
              <MaterialCommunityIcons name="chevron-left" size={24} color="#333333" />
            </TouchableOpacity>
            
<View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
            <TGIcon width={40} height={40} />
            </View>
            
            {/* User avatar */}
            <View style={styles.userAvatar}>
              <Text style={styles.avatarText}>A</Text>
            </View>
          </View>

          {/* Navigation tabs */}
          <View style={styles.headerBottom}>
            <View style={styles.navContainer}>
              <View style={styles.navButtonActive}>
                <Text style={styles.navTextActive}>Agent</Text>
              </View>
              <TouchableOpacity style={styles.navButton}>
                <Text style={styles.navTextInactive}>Explore</Text>
              </TouchableOpacity>
            </View>

            {/* Quick action buttons */}
            <View style={styles.quickButtonsContainer}>
              <TouchableOpacity style={styles.quickButton}>
                <MaterialCommunityIcons name="clock-fast-forward" size={20} color="#333333" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickButton}>
                <MaterialCommunityIcons name="plus" size={20} color="#333333" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Main chat area */}
        <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.greeting}>How can I help you today?</Text>
              <Text style={styles.subGreeting}>
                I can help you forecast demand, optimize inventory, improve pricing, or plan promotions
              </Text>
            </View>
          ) : (
            messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.sender === 'user' ? styles.userMessage : styles.assistantMessage,
                ]}
              >
                <Text style={msg.sender === 'user' ? styles.userMessageText : styles.assistantMessageText}>
                  {msg.text}
                </Text>
              </View>
            ))
          )}
        </ScrollView>

        {/* Quick action suggestions */}
        {messages.length === 0 && (
          <ScrollView
            horizontal
            style={styles.suggestionsContainer}
            contentContainerStyle={styles.suggestionsContent}
            showsHorizontalScrollIndicator={false}
          >
            {quickActions.map((action) => (
              <TouchableOpacity key={action.id} style={styles.suggestionChip}>
                <Text style={styles.suggestionText}>{action.label}</Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color="#B3B3B3" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Analyze Experiment Dropdown */}
        <View style={styles.analyzeContainer}>
          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={() => setShowAnalyzeDropdown(!showAnalyzeDropdown)}
          >
            <MaterialCommunityIcons name="lightbulb" size={14} color="#FFFFFF" />
            <Text style={styles.analyzeButtonText}>Analyze experiment</Text>
            <MaterialCommunityIcons name="chevron-down" size={14} color="#FFFFFF" />
          </TouchableOpacity>

          {showAnalyzeDropdown && (
            <View style={styles.analyzeDropdown}>
              {/* Search input */}
              <View style={styles.analyzeInputContainer}>
                <TextInput
                  placeholder="Ask anything..."
                  style={styles.analyzeInput}
                  placeholderTextColor="#999999"
                />
              </View>

              {/* Mention options */}
              <View style={styles.mentionSection}>
                <Text style={styles.mentionTitle}>Experiments</Text>
                <TouchableOpacity style={styles.mentionOption}>
                  <Text style={styles.mentionItemName}>01012025 ITEM_Customer_US</Text>
                  <Text style={styles.mentionItemType}>Experiment</Text>
                </TouchableOpacity>
              </View>

              {/* Action buttons */}
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity style={styles.actionButton}>
                  <MaterialCommunityIcons name="at" size={18} color="#808080" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <MaterialCommunityIcons name="attachment" size={18} color="#808080" />
                </TouchableOpacity>

                <View style={styles.rightActions}>
                  <TouchableOpacity style={styles.micButton}>
                    <MaterialCommunityIcons name="microphone" size={18} color="#666666" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendMessage}
                  >
                    <MaterialCommunityIcons name="arrow-up" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Chat input when dropdown is closed */}
          {!showAnalyzeDropdown && (
            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                placeholder="Ask anything..."
                value={inputText}
                onChangeText={setInputText}
                placeholderTextColor="#999999"
                multiline
              />
              <TouchableOpacity style={styles.sendIconButton} onPress={handleSendMessage}>
                <MaterialCommunityIcons name="send" size={20} color="#0F8BFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 19,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 37,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    width: 24,
    height: 24,
  },
  logo: {
    width: 40,
    height: 37,
    resizeMode: 'contain',
  },
  userAvatar: {
    position: 'absolute',
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Inter Display',
    fontSize: 16,
    fontWeight: '600',
    color: '#4D4D4D',
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navContainer: {
    flexDirection: 'row',
    backgroundColor: '#F7F7F7',
    borderRadius: 24,
    padding: 2,
    gap: 0,
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  navButtonActive: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#4D4D4D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  navTextInactive: {
    fontFamily: 'Inter Display',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 24,
    color: '#666666',
  },
  navTextActive: {
    fontFamily: 'Inter Display',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 24,
    color: '#333333',
  },
  quickButtonsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 245, 245, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(230, 230, 230, 0.4)',
    borderRadius: 20,
    padding: 2,
    gap: 12,
  },
  quickButton: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 19,
    paddingTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    gap: 16,
  },
  greeting: {
    fontFamily: 'Inter Display',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    letterSpacing: -0.24,
    color: '#333333',
    textAlign: 'center',
  },
  subGreeting: {
    fontFamily: 'Inter Display',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: '#999999',
    textAlign: 'center',
    maxWidth: 335,
  },
  messageBubble: {
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0F8BFF',
  },
  userMessageText: {
    color: '#FFFFFF',
    fontFamily: 'Inter Display',
    fontSize: 14,
    fontWeight: '500',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
  },
  assistantMessageText: {
    color: '#333333',
    fontFamily: 'Inter Display',
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionsContainer: {
    height: 32,
    paddingHorizontal: 19,
    marginBottom: 16,
  },
  suggestionsContent: {
    gap: 12,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(237, 237, 237, 0.7)',
    borderRadius: 28,
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 4,
    gap: 10,
  },
  suggestionText: {
    fontFamily: 'Inter Display',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 24,
    color: '#666666',
  },
  analyzeContainer: {
    paddingHorizontal: 19,
    paddingBottom: 34,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#008AE5',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  analyzeButtonText: {
    fontFamily: 'Inter Display',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 24,
    color: '#FFFFFF',
  },
  analyzeDropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 138, 229, 0.5)',
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    gap: 28,
    shadowColor: '#333333',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  analyzeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analyzeInput: {
    flex: 1,
    fontFamily: 'Inter Display',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: '#999999',
    paddingVertical: 0,
  },
  mentionSection: {
    gap: 12,
  },
  mentionTitle: {
    fontFamily: 'Inter Display',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#404040',
  },
  mentionOption: {
    paddingVertical: 8,
  },
  mentionItemName: {
    fontFamily: 'Inter Display',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#404040',
  },
  mentionItemType: {
    fontFamily: 'Inter Display',
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 14,
    color: '#999999',
    marginTop: 2,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  micButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    padding: 6,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#0F8BFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    opacity: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  chatInput: {
    flex: 1,
    fontFamily: 'Inter Display',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: '#333333',
    marginRight: 12,
  },
  sendIconButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;
