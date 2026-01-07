import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ChatHistorySidebar = ({ conversations = [], currentConversationId, onSelectConversation, onCreateNew, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Chat History</Text>
        </View>

        {/* Search Bar + New Chat Button */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={16} color="#999999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#808080"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.newChatButton}
            onPress={onCreateNew}
          >
            <MaterialIcons name="add" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat List */}
      <View style={styles.chatListSection}>
        <Text style={styles.sectionTitle}>Your chats</Text>
        
        <ScrollView 
          style={styles.chatList}
          showsVerticalScrollIndicator={false}
        >
          {filteredConversations.length === 0 ? (
            <Text style={styles.emptyText}>No chats found</Text>
          ) : (
            filteredConversations.map((conversation) => (
              <TouchableOpacity
                key={conversation.id}
                style={[
                  styles.chatItem,
                  currentConversationId === conversation.id && styles.chatItemActive
                ]}
                onPress={() => {
                  onSelectConversation(conversation.id);
                  onClose?.();
                }}
              >
                <Text 
                  style={[
                    styles.chatItemText,
                    currentConversationId === conversation.id && styles.chatItemTextActive
                  ]}
                  numberOfLines={1}
                >
                  {conversation.title || 'New Chat'}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 16,
  },
  titleContainer: {
    paddingVertical: 4,
  },
  title: {
    fontFamily: 'Inter Display',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: -0.18,
    color: '#333333',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 4,
    paddingLeft: 8,
    paddingRight: 12,
    paddingVertical: 4,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter Display',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    color: '#333333',
    padding: 0,
  },
  newChatButton: {
    width: 24,
    height: 24,
    backgroundColor: '#008AE5',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  chatListSection: {
    paddingHorizontal: 20,
    flex: 1,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter Display',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#808080',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  chatItemActive: {
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
  },
  chatItemText: {
    fontFamily: 'Inter Display',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 24,
    color: '#595959',
  },
  chatItemTextActive: {
    color: '#404040',
  },
  emptyText: {
    fontFamily: 'Inter Display',
    fontSize: 14,
    fontWeight: '500',
    color: '#999999',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ChatHistorySidebar;
