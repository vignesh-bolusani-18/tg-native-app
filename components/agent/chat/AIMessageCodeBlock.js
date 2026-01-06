/**
 * ⭐ AI MESSAGE CODE BLOCK - Code snippet display with modal and copy
 * MATCHES tg-application: Full code modal, syntax highlighting, copy functionality
 */

import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Use React Native's deprecated Clipboard or expo-clipboard if available
let Clipboard;
try {
  Clipboard = require('expo-clipboard');
} catch {
  // Fallback to React Native Clipboard (deprecated but works)
  Clipboard = require('react-native').Clipboard;
}

export default function AIMessageCodeBlock({ code, language, title }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      // Support both expo-clipboard and RN Clipboard APIs
      if (Clipboard.setStringAsync) {
        await Clipboard.setStringAsync(code);
      } else if (Clipboard.setString) {
        Clipboard.setString(code);
      } else {
        throw new Error('Clipboard not available');
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy error:', error);
      Alert.alert('Error', 'Failed to copy code');
    }
  };

  // Determine language label
  const langLabel = language || 'python';

  // Preview: Show first 5 lines
  const lines = code?.split('\n') || [];
  const previewLines = lines.slice(0, 5);
  const hasMore = lines.length > 5;

  if (!code || typeof code !== 'string') {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.langBadge}>
          <MaterialIcons name="code" size={14} color="#6366f1" />
          <Text style={styles.langText}>{langLabel}</Text>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
            <MaterialIcons 
              name={copied ? "check" : "content-copy"} 
              size={16} 
              color={copied ? "#10b981" : "#6b7280"} 
            />
            <Text style={[styles.actionText, copied && styles.copiedText]}>
              {copied ? 'Copied!' : 'Copy'}
            </Text>
          </TouchableOpacity>
          
          {hasMore && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => setModalVisible(true)}
            >
              <MaterialIcons name="open-in-full" size={16} color="#6b7280" />
              <Text style={styles.actionText}>Expand</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Code Preview */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        style={styles.codePreview}
      >
        <Text style={styles.codeText}>
          {previewLines.join('\n')}
          {hasMore && `\n... ${lines.length - 5} more lines`}
        </Text>
      </ScrollView>

      {/* View Full Code Button */}
      {hasMore && (
        <TouchableOpacity 
          style={styles.viewMoreButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.viewMoreText}>View full code ({lines.length} lines)</Text>
          <MaterialIcons name="chevron-right" size={18} color="#2563eb" />
        </TouchableOpacity>
      )}

      {/* Full Code Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleSection}>
                <MaterialIcons name="code" size={20} color="#6366f1" />
                <Text style={styles.modalTitle}>{title || langLabel}</Text>
              </View>
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalActionButton}
                  onPress={handleCopy}
                >
                  <MaterialIcons 
                    name={copied ? "check" : "content-copy"} 
                    size={20} 
                    color={copied ? "#10b981" : "#2563eb"} 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                >
                  <MaterialIcons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Full Code Content */}
            <ScrollView style={styles.modalCodeContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View style={styles.codeWithLineNumbers}>
                  {/* Line Numbers */}
                  <View style={styles.lineNumbers}>
                    {lines.map((_, idx) => (
                      <Text key={idx} style={styles.lineNumber}>
                        {idx + 1}
                      </Text>
                    ))}
                  </View>
                  
                  {/* Code Content */}
                  <Text style={styles.modalCodeText}>{code}</Text>
                </View>
              </ScrollView>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1e1e1e',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2d2d2d',
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  langBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langText: {
    fontSize: 12,
    color: '#a78bfa',
    fontWeight: '500',
    marginLeft: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  copiedText: {
    color: '#10b981',
  },
  codePreview: {
    padding: 12,
    maxHeight: 150,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#d4d4d4',
    lineHeight: 20,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#404040',
    backgroundColor: '#262626',
  },
  viewMoreText: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2d2d2d',
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  modalTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f3f4f6',
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  modalActionButton: {
    padding: 4,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCodeContainer: {
    flex: 1,
    padding: 12,
  },
  codeWithLineNumbers: {
    flexDirection: 'row',
  },
  lineNumbers: {
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#404040',
    marginRight: 12,
  },
  lineNumber: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 20,
    textAlign: 'right',
    minWidth: 30,
  },
  modalCodeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#d4d4d4',
    lineHeight: 20,
  },
});
