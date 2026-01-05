/**
 * 👋 INITIAL MESSAGE - Welcome screen with example questions
 * Converted from: D:\TrueGradient\tg-application\src\components\Chatbot\InitialMessage.js
 */

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function InitialMessage({ onSendQuery }) {
  const exampleQueries = [
    'Identify the row items where where lost sales exists and sort the data based on the lost sales value',
    'Identify the row items where where excess stock exists and sort the data based on the excess stock value',
    'Identify the row items contributing 90% forecast and sort the data based on forecast',
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Hi</Text>
      <Text style={styles.subtitle}>What can I help you with?</Text>
      <Text style={styles.description}>
        Ask any question related to your data on TG. For example:
      </Text>

      <View style={styles.questionsContainer}>
        {exampleQueries.map((query, index) => (
          <TouchableOpacity
            key={index}
            style={styles.questionButton}
            onPress={() => onSendQuery(query)}
            activeOpacity={0.7}
          >
            <Text style={styles.questionText}>{query}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 24,
    minHeight: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 20,
    marginBottom: 16,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  questionsContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  questionButton: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  questionText: {
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
  },
});
