import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';

export default function ConversationSidebar({ 
  conversationList, 
  onSelectConversation, 
  onNewChat, 
  currentConversationId,
  onDeleteConversation 
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = (conversationList || []).filter(conv => {
    const title = conv.conversation_name || conv.title || "New Chat";
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
            <MaterialIcons name="search" size={16} color="#999999" style={{ marginRight: 0 }} />
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
            onPress={onNewChat}
            activeOpacity={0.7}
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
            filteredConversations.map((conversation) => {
              const isSelected = conversation.conversationID === currentConversationId;
              return (
                <TouchableOpacity
                  key={conversation.conversationID}
                  style={[styles.item, isSelected && styles.selectedItem]}
                  onPress={() => onSelectConversation(conversation)}
                  activeOpacity={0.7}
                >
                  <Text 
                    style={[styles.itemText, isSelected && styles.selectedItemText]}
                    numberOfLines={1}
                  >
                    {conversation.conversation_name || conversation.title || 'Sample chat'}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
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
  item: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  selectedItem: {
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
  },
  itemText: {
    fontFamily: 'Inter Display',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 24,
    color: '#595959',
  },
  selectedItemText: {
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
