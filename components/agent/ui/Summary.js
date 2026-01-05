/**
 * 📄 SUMMARY - Display summary in a card
 * Source: D:\TrueGradient\tg-application\src\components\Chatbot\summary.js
 */

import { StyleSheet, Text, View } from 'react-native';

export default function Summary({ parsedSummary }) {
  console.log('Received parsedSummary in summary block:', parsedSummary);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {parsedSummary || 'No summary available.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  text: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
});
