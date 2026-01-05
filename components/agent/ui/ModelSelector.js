/**
 * 🤖 MODEL SELECTOR - Select AI model (OpenAI/Claude)
 * Converted from: D:\TrueGradient\tg-application\src\components\Chatbot\ModelSelector.js
 */

import { Picker } from '@react-native-picker/picker';
import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
// import useDashboard from '../../hooks/useDashboard'; // Hook missing

export default function ModelSelector({ onSelectModel }) {
  // Mock hook
  const selectedModel = 'OpenAi';
  const setSelectedModel = (model) => console.log('Set model:', model);
  
  const models = useMemo(() => ['OpenAi', 'Claude'], []);

  const handleChange = (model) => {
    if (onSelectModel) onSelectModel(model);
    setSelectedModel(model);
  };

  useEffect(() => {
    console.log('Available models:', models);
    console.log('Currently selected model:', selectedModel);
  }, [models, selectedModel]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Model</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedModel || ''}
          onValueChange={handleChange}
          style={styles.picker}
        >
          {models.map((model) => (
            <Picker.Item key={model} label={model} value={model} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 150,
  },
  label: {
    fontSize: 11,
    color: '#0d47a1',
    marginBottom: 4,
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#90caf9',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  picker: {
    height: 50,
  },
});
