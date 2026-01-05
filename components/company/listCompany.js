// components/company/listCompany.js
// Company selection UI - Alternative simplified component

import { StyleSheet, Text, View } from 'react-native';

const ListCompany = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Company Selection - Alternative UI</Text>
      <Text style={styles.subtext}>Use ListCompany2 for full implementation</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ListCompany;
