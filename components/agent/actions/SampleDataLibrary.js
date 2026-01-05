/**
 * ⭐ SAMPLE DATA LIBRARY - Browse sample datasets
 */

import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SampleDataLibrary({ onSelect }) {
  const samples = [
    { id: '1', name: 'Retail Sales', icon: '🛍️' },
    { id: '2', name: 'Customer Data', icon: '👥' },
    { id: '3', name: 'Inventory', icon: '📦' },
  ];
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 Sample Library</Text>
      <FlatList
        data={samples}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemText}>{item.icon} {item.name}</Text>
          </TouchableOpacity>
        )}
      />
      {/* 🔵 ADD YOUR LIBRARY CODE HERE */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  item: { padding: 15, backgroundColor: '#fff', borderRadius: 8, marginBottom: 8 },
  itemText: { fontSize: 16 },
});
