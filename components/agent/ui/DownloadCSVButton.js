/**
 * ⬇️ DOWNLOAD CSV BUTTON - Export table data to CSV
 * Source: D:\TrueGradient\tg-application\src\components\Chatbot\DownloadCSVButton.js
 * Converted: Web blob/download → Mobile FileSystem + Sharing
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

export default function DownloadCSVButton({ data, fileName = 'table_data.csv' }) {
  const handleDownloadCSV = async () => {
    if (!data || data.length === 0) {
      Alert.alert('No Data', 'There is no data to export.');
      return;
    }

    try {
      // Generate CSV content (same logic as web)
      const csvContent = [
        Object.keys(data[0]).join(','), // Headers
        ...data.map((row) => Object.values(row).join(',')), // Rows
      ].join('\n');

      // Create file path
      const fileUri = FileSystem.documentDirectory + fileName;

      // Write CSV file
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file (mobile equivalent of download)
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Success', 'CSV file saved to documents');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error', 'Failed to export CSV file');
    }
  };

  return (
    <TouchableOpacity
      onPress={handleDownloadCSV}
      style={styles.button}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons name="download" size={20} color="#1976d2" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});
