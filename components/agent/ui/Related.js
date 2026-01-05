/**
 * 🔗 RELATED - Display related query suggestions
 * Converted from: D:\TrueGradient\tg-application\src\components\Chatbot\Related.js
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Related({ relatedOptions = [], onSendQuery, clearRelated }) {
  if (relatedOptions.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Related</Text>
      
      <View style={styles.list}>
        {relatedOptions.map((option, index) => (
          <View
            key={index}
            style={[
              styles.listItem,
              index !== relatedOptions.length - 1 && styles.listItemBorder,
            ]}
          >
            <Text style={styles.optionText}>{option}</Text>
            <TouchableOpacity
              onPress={() => {
                clearRelated();
                onSendQuery(option);
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="plus" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    maxWidth: '85%',
    marginLeft: 48,
  },
  title: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    fontSize: 16,
  },
  list: {
    padding: 0,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionText: {
    flex: 1,
    color: '#555',
    fontSize: 15.2,
    fontStyle: 'italic',
  },
});
