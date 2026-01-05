// app/company-selection.tsx
// Company Selection Screen - Add this to your app routing

import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import ListCompany2 from '../components/company/listCompany2';

/**
 * Company Selection Screen
 * 
 * Navigate here after successful login:
 * router.push('/company-selection')
 * 
 * This screen will:
 * 1. Fetch and display all companies for the user
 * 2. Allow creating a new company
 * 3. Store refresh_token_company when company is selected
 * 4. Update Redux with currentCompany
 */
export default function CompanySelectionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ListCompany2 />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
