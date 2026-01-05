import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ConversationSidebar({ 
  conversationList, 
  onSelectConversation, 
  onNewChat, 
  currentConversationId,
  onDeleteConversation 
}) {
  
  const renderItem = ({ item }) => {
    const isSelected = item.conversationID === currentConversationId;
    
    return (
      <TouchableOpacity 
        style={[styles.item, isSelected && styles.selectedItem]}
        onPress={() => onSelectConversation(item)}
      >
        <View style={styles.itemContent}>
          <MaterialIcons 
            name="chat-bubble-outline" 
            size={20} 
            color={isSelected ? '#2563eb' : '#6b7280'} 
          />
          <Text 
            style={[styles.itemText, isSelected && styles.selectedItemText]} 
            numberOfLines={1}
          >
            {item.title || "New Chat"}
          </Text>
        </View>
        
        {/* Delete Button (only visible if selected or always visible? Let's keep it simple) */}
        {isSelected && (
          <TouchableOpacity 
            onPress={() => onDeleteConversation(item.conversationID)}
            style={styles.deleteButton}
          >
            <MaterialIcons name="delete-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <TouchableOpacity onPress={onNewChat} style={styles.newButton}>
          <MaterialIcons name="add" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversationList}
        keyExtractor={(item) => item.conversationID}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No history yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  newButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
  },
  listContent: {
    padding: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  selectedItem: {
    backgroundColor: '#eff6ff',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  selectedItemText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
  },
});
