/**
 * 📊 CUSTOM CHATBOT TABLE - Display tabular data from chatbot results
 * Converted from: D:\TrueGradient\tg-application\src\components\Chatbot\CustomChatbotTable.js (511 lines)
 * Simplified for React Native using FlatList and DataTable
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CustomChatbotTable({ data, query }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;

  // Parse data if string
  const parsedData = useMemo(() => {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    return Array.isArray(data) ? data : [];
  }, [data]);

  // Get columns from data
  const columns = useMemo(() => {
    if (parsedData.length === 0) return [];
    return Object.keys(parsedData[0]);
  }, [parsedData]);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return parsedData;
    
    const sorted = [...parsedData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [parsedData, sortConfig]);

  // Pagination
  const paginatedData = useMemo(() => {
    const start = currentPage * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage]);

  const handleSort = (columnKey) => {
    setSortConfig((prev) => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  if (parsedData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View>
          {/* Header */}
          <View style={styles.headerRow}>
            {columns.map((column) => (
              <TouchableOpacity
                key={column}
                style={styles.headerCell}
                onPress={() => handleSort(column)}
                activeOpacity={0.7}
              >
                <Text style={styles.headerText}>{column}</Text>
                {sortConfig.key === column && (
                  <MaterialCommunityIcons
                    name={sortConfig.direction === 'asc' ? 'arrow-up' : 'arrow-down'}
                    size={14}
                    color="#1976d2"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Data Rows */}
          {paginatedData.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={[styles.dataRow, rowIndex % 2 === 0 && styles.evenRow]}
            >
              {columns.map((column) => (
                <View key={column} style={styles.dataCell}>
                  <Text style={styles.cellText} numberOfLines={2}>
                    {row[column] !== null && row[column] !== undefined
                      ? String(row[column])
                      : '-'}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            onPress={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            style={[styles.pageButton, currentPage === 0 && styles.disabledButton]}
          >
            <MaterialCommunityIcons name="chevron-left" size={20} color="#1976d2" />
          </TouchableOpacity>

          <Text style={styles.pageText}>
            Page {currentPage + 1} of {totalPages}
          </Text>

          <TouchableOpacity
            onPress={() =>
              setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
            }
            disabled={currentPage === totalPages - 1}
            style={[
              styles.pageButton,
              currentPage === totalPages - 1 && styles.disabledButton,
            ]}
          >
            <MaterialCommunityIcons name="chevron-right" size={20} color="#1976d2" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 2,
    borderBottomColor: '#1976d2',
  },
  headerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    minWidth: 120,
    gap: 4,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#1976d2',
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  evenRow: {
    backgroundColor: '#fafafa',
  },
  dataCell: {
    padding: 12,
    minWidth: 120,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 13,
    color: '#333',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  pageButton: {
    padding: 4,
  },
  disabledButton: {
    opacity: 0.3,
  },
  pageText: {
    fontSize: 13,
    color: '#333',
  },
});
