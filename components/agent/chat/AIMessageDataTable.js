/**
 * ⭐ AI MESSAGE DATA TABLE - Table display in chat
 */

import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AIMessageDataTable({ data, columns }) {
  return (
    <ScrollView horizontal style={styles.container}>
      <View>
        <Text style={styles.title}>📊 Data Table</Text>
        {/* 🔵 ADD YOUR TABLE RENDERING CODE HERE */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
});
