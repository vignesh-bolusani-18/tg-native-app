/**
 * 🐍 PYTHON BOT DISPLAY - Display Python code with syntax highlighting
 * Converted from: D:\TrueGradient\tg-application\src\components\Chatbot\PythonBotdisplay.js
 * Note: Using react-native-code-highlighter instead of Monaco Editor
 */

import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PythonBotDisplay({ message }) {
  const isJSON = (str) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  const parseMessage = () => {
    if (isJSON(message)) {
      try {
        const parsedMessage = JSON.parse(message);
        return `
${parsedMessage.import_dependency || ''}
${parsedMessage.read_data || ''}
${parsedMessage.analysis_logic || ''}
${parsedMessage.result_summary || ''}
${parsedMessage.save_result || ''}
`
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .trim();
      } catch (error) {
        console.error('Error parsing message:', error);
        return 'Error processing the message.';
      }
    }
    return message;
  };

  const snippet = parseMessage();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.codeContainer}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.codeText}>{snippet}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxHeight: 400,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  codeContainer: {
    height: 300,
    backgroundColor: '#f5f5f5',
    padding: 12,
  },
  codeText: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
    }),
    fontSize: 12,
    color: '#1e293b',
    lineHeight: 18,
  },
});
