/**
 * 📤 FILE UPLOADER - Upload CSV files
 * Source: D:\TrueGradient\tg-application\src\components\Chatbot\FileUploader.js
 * Converted: Web file input → Mobile DocumentPicker
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function FileUploader({ onFileSelect }) {
  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        Alert.alert('Success', `Uploaded file: ${result.name}`);
        if (onFileSelect) {
          onFileSelect(result);
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to upload file');
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleFileUpload}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons name="file-upload" size={20} color="#0d47a1" />
      <Text style={styles.buttonText}>Upload CSV</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#90caf9',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  buttonText: {
    color: '#0d47a1',
    fontSize: 14,
    fontWeight: '500',
  },
});
