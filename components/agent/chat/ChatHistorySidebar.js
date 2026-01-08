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

  // Helper to categorize conversations by date
  const categorizeConversations = (params) => {
    const groups = {
      'Today': [],
      'Yesterday': [],
      'Previous 7 Days': [],
      'Previous 30 Days': [],
      'Older': []
    };

    // Helper to parse dates robustly (matches app_ref logic)
    const convertToDate = (dateString) => {
        if (!dateString) return new Date(0);
        // Helper to handle " at " format often found in app_ref or backend
        const date = new Date(String(dateString).replace(/ at /, " ")); 
        return isNaN(date.getTime()) ? new Date(0) : date;
    };

    const sorted = [...params].sort((a, b) => convertToDate(b.updatedAt).getTime() - convertToDate(a.updatedAt).getTime());
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const sevenDaysStart = new Date(todayStart);
    sevenDaysStart.setDate(sevenDaysStart.getDate() - 7);
    const thirtyDaysStart = new Date(todayStart);
    thirtyDaysStart.setDate(thirtyDaysStart.getDate() - 30);

    sorted.forEach(conv => {
      // Filter by search query if active
      if (searchQuery && !conv.title?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return;
      }

      const date = convertToDate(conv.updatedAt);
      if (date >= todayStart) {
        groups['Today'].push(conv);
      } else if (date >= yesterdayStart) {
        groups['Yesterday'].push(conv);
      } else if (date >= sevenDaysStart) {
        groups['Previous 7 Days'].push(conv);
      } else if (date >= thirtyDaysStart) {
        groups['Previous 30 Days'].push(conv);
      } else {
        groups['Older'].push(conv);
      }
    });

    return groups;
  };

  const groups = categorizeConversations(conversations);
  const sections = ['Today', 'Yesterday', 'Previous 7 Days', 'Previous 30 Days', 'Older'];
  const hasConversations = Object.values(groups).some(g => g.length > 0);

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
            onPress={onCreateNew}
            activeOpacity={0.7}
          >
            <MaterialIcons name="add" size={20} color="#333333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat List */}
      <View style={styles.chatListSection}>
        <ScrollView 
          style={styles.chatList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {!hasConversations ? (
            <Text style={styles.emptyText}>No chats found</Text>
          ) : (
            sections.map(sectionName => {
              const sectionChats = groups[sectionName];
              if (sectionChats.length === 0) return null;

              return (
                <View key={sectionName} style={{ marginBottom: 16 }}>
                  <Text style={styles.sectionTitle}>{sectionName}</Text>
                  {sectionChats.map((conversation) => (
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
                      activeOpacity={0.7}
                    >
                      <Text 
                        style={[
                          styles.chatItemText,
                          currentConversationId === conversation.id && styles.chatItemTextActive
                        ]}
                        numberOfLines={1}
                      >
                        {conversation.title || 'Sample chat'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })
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
    width: 32,
    height: 32,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 4,
  },
  chatItemActive: {
    backgroundColor: '#F0F0F0',
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
