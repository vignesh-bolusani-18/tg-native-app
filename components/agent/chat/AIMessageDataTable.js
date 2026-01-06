/**
 * ⭐ AI MESSAGE DATA TABLE - Table display in chat with pagination
 * MATCHES tg-application: 5 rows per page, max 50 rows, CSV download, Show Code button
 */

import { MaterialIcons } from '@expo/vector-icons';
import { documentDirectory, writeAsStringAsync } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Use React Native's deprecated Clipboard or expo-clipboard if available
let Clipboard;
try {
  Clipboard = require('expo-clipboard');
} catch {
  // Fallback to React Native Clipboard (deprecated but works)
  Clipboard = require('react-native').Clipboard;
}

// Constants matching tg-application
const MAX_ROWS = 50;
const PAGE_SIZE = 5;

// Helper to safely stringify objects
const safeStringify = (value) => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

// Normalize data to array format
const normalizeData = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object') return [data];
  return [];
};

export default function AIMessageDataTable({ 
  data, 
  title, 
  message,
  hasS3Data = false,
  dataPath = null,
  dataTotalRows = null 
}) {
  const [page, setPage] = useState(1);
  const [codeModalVisible, setCodeModalVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Normalize and limit data
  const rows = normalizeData(data);
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  const limitedRows = rows.slice(0, MAX_ROWS);
  const totalPages = Math.max(1, Math.ceil(limitedRows.length / PAGE_SIZE));
  
  // Calculate current page rows
  const startIndex = (page - 1) * PAGE_SIZE;
  const previewRows = limitedRows.slice(startIndex, startIndex + PAGE_SIZE);

  // Check if we have code to show
  const hasCode = message?.code && typeof message.code === 'string';
  const codeContent = message?.code || '';
  const codeTitle = message?.codeTitle || 'Code';

  // Convert to CSV helper
  const convertToCsv = (rowsData, cols) => {
    if (!rowsData.length || !cols.length) return '';

    const escape = (value) => {
      if (value === null || value === undefined) return '';
      const str = typeof value === 'object' ? safeStringify(value) : String(value);
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const header = cols.map(escape).join(',');
    const body = rowsData
      .map((row) => cols.map((col) => escape(row[col])).join(','))
      .join('\n');

    return `${header}\n${body}`;
  };

  // Handle CSV download
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const csv = convertToCsv(rows, columns);
      const fileName = `${title || 'data'}.csv`;

      if (Platform.OS === 'web') {
        // Web download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Mobile download using expo-file-system and expo-sharing
        const fileUri = documentDirectory + fileName;
        await writeAsStringAsync(fileUri, csv, {
          encoding: 'utf8',
        });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Download CSV',
          });
        } else {
          Alert.alert('Success', `File saved to: ${fileUri}`);
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download CSV');
    } finally {
      setDownloading(false);
    }
  };

  // Copy code to clipboard
  const handleCopyCode = async () => {
    try {
      // Support both expo-clipboard and RN Clipboard APIs
      if (Clipboard.setStringAsync) {
        await Clipboard.setStringAsync(codeContent);
      } else if (Clipboard.setString) {
        Clipboard.setString(codeContent);
      } else {
        throw new Error('Clipboard not available');
      }
      Alert.alert('Copied!', 'Code copied to clipboard');
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  // Build pagination items with ellipsis
  const buildPageItems = (current, total) => {
    const items = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) items.push(i);
      return items;
    }
    if (current <= 3) {
      items.push(1, 2, 3, 4, 5, '...', total);
      return items;
    }
    if (current >= total - 2) {
      items.push(1, '...', total - 4, total - 3, total - 2, total - 1, total);
      return items;
    }
    items.push(1, '...', current - 1, current, current + 1, '...', total);
    return items;
  };

  if (rows.length === 0 || columns.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header with title and action buttons */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <MaterialIcons name="table-chart" size={18} color="#0891b2" />
          <Text style={styles.title}>{title || 'Data Table'}</Text>
          {dataTotalRows && (
            <Text style={styles.rowCount}>({dataTotalRows} total rows)</Text>
          )}
        </View>
        
        <View style={styles.actionButtons}>
          {/* Code Button */}
          {hasCode && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setCodeModalVisible(true)}
            >
              <MaterialIcons name="code" size={16} color="#374151" />
              <Text style={styles.actionButtonText}>Code</Text>
            </TouchableOpacity>
          )}
          
          {/* Download Button */}
          <TouchableOpacity 
            style={[styles.actionButton, downloading && styles.actionButtonDisabled]}
            onPress={handleDownload}
            disabled={downloading}
          >
            <MaterialIcons 
              name={downloading ? "hourglass-empty" : "download"} 
              size={16} 
              color="#374151" 
            />
            <Text style={styles.actionButtonText}>
              {downloading ? 'Saving...' : 'Download'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableHeaderRow}>
            {columns.map((col, idx) => (
              <View key={`header-${idx}`} style={styles.tableHeaderCell}>
                <Text style={styles.tableHeaderText} numberOfLines={1}>
                  {col}
                </Text>
              </View>
            ))}
          </View>
          
          {/* Data Rows */}
          {previewRows.map((row, rowIdx) => (
            <View 
              key={`row-${rowIdx}`} 
              style={[
                styles.tableRow, 
                rowIdx % 2 === 0 ? styles.tableRowEven : null
              ]}
            >
              {columns.map((col, cellIdx) => (
                <View key={`cell-${rowIdx}-${cellIdx}`} style={styles.tableCell}>
                  <Text style={styles.tableCellText} numberOfLines={2}>
                    {safeStringify(row[col])}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Pagination */}
      {limitedRows.length > PAGE_SIZE && (
        <View style={styles.pagination}>
          <Text style={styles.paginationInfo}>
            Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, limitedRows.length)} of {Math.min(rows.length, MAX_ROWS)}
            {rows.length > MAX_ROWS && ` (limited from ${rows.length})`}
          </Text>
          
          <View style={styles.paginationControls}>
            {/* Previous */}
            <TouchableOpacity 
              style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
              onPress={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <Text style={styles.pageButtonText}>‹</Text>
            </TouchableOpacity>
            
            {/* Page Numbers */}
            {buildPageItems(page, totalPages).map((item, index) =>
              item === '...' ? (
                <View key={`ellipsis-${index}`} style={styles.ellipsis}>
                  <Text style={styles.ellipsisText}>...</Text>
                </View>
              ) : (
                <TouchableOpacity
                  key={`page-${item}`}
                  style={[
                    styles.pageButton,
                    item === page && styles.pageButtonActive
                  ]}
                  onPress={() => setPage(item)}
                >
                  <Text style={[
                    styles.pageButtonText,
                    item === page && styles.pageButtonTextActive
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )
            )}
            
            {/* Next */}
            <TouchableOpacity 
              style={[styles.pageButton, page === totalPages && styles.pageButtonDisabled]}
              onPress={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <Text style={styles.pageButtonText}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* S3 Data Indicator */}
      {hasS3Data && dataPath && (
        <View style={styles.s3Indicator}>
          <MaterialIcons name="cloud" size={14} color="#6b7280" />
          <Text style={styles.s3Text}>Full dataset available in cloud storage</Text>
        </View>
      )}

      {/* Code Modal */}
      <Modal
        visible={codeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCodeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{codeTitle}</Text>
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalActionButton}
                  onPress={handleCopyCode}
                >
                  <MaterialIcons name="content-copy" size={20} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setCodeModalVisible(false)}
                >
                  <MaterialIcons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>
            </View>
            
            <ScrollView style={styles.codeContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <Text style={styles.codeText}>{codeContent}</Text>
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
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'column',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0891b2',
    marginLeft: 8,
    flexShrink: 1,
  },
  rowCount: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 4,
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
    maxWidth: 200,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
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
    maxWidth: 200,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
  },
  tableCellText: {
    fontSize: 13,
    color: '#1f2937',
  },
  pagination: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  paginationInfo: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pageButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  pageButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    fontSize: 12,
    color: '#374151',
  },
  pageButtonTextActive: {
    color: '#ffffff',
  },
  ellipsis: {
    paddingHorizontal: 6,
  },
  ellipsisText: {
    fontSize: 12,
    color: '#6b7280',
  },
  s3Indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  s3Text: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalActionButton: {
    padding: 4,
  },
  modalCloseButton: {
    padding: 4,
  },
  codeContainer: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    maxHeight: 400,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#d4d4d4',
    lineHeight: 20,
  },
});
