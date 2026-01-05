/**
 * 📁 FILE SELECTOR - Select context file for chatbot
 * Source: D:\TrueGradient\tg-application\src\components\Chatbot\FileSelector.js
 */

import { Picker } from '@react-native-picker/picker';
import { StyleSheet, Text, View } from 'react-native';

export default function FileSelector({
  contextFiles = [],
  selectedContextFile,
  setSelectedContextFile,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Context</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedContextFile}
          onValueChange={(itemValue) => setSelectedContextFile(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="No Context" value={null} />
          {contextFiles.map((file, index) => (
            <Picker.Item
              key={index}
              label={file.split('/').pop()}
              value={file}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 120,
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  picker: {
    height: 50,
  },
});
