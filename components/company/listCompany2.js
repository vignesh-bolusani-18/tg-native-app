// components/company/listCompany2.js
// Company selection UI - Main UI component for React Native

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import useAuth from '../../hooks/useAuth';
import { logoutUser } from '../../redux/actions/authActions';
import { createCompany } from '../../utils/createCompany';
import { getCompaniesList } from '../../utils/getCompaniesList';
import { getRefreshToken } from '../../utils/getRefreshToken';
import { getUserById } from '../../utils/getUserById';
import { getItem } from '../../utils/storage';

const ListCompany2 = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { setCurrentCompany, companies_list } = useAuth();
  const userID = useSelector((state) => state.auth.userInfo?.userID);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [hasAttemptedAutoSelect, setHasAttemptedAutoSelect] = useState(false);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching companies...');
      console.log('   ℹ️ Will fetch FRESH token to prevent replay detection');
      
      // DON'T pass token - let getCompaniesList fetch a fresh one to prevent token replay
      const data = await getCompaniesList();
      // Ensure we always set an array
      const companiesArray = Array.isArray(data?.companies) ? data.companies : 
                             Array.isArray(data) ? data : [];
      setCompanies(companiesArray);
      console.log('✅ Companies loaded:', companiesArray.length);
    } catch (error) {
      console.error('❌ Error fetching companies:', error);
      setCompanies([]); // Ensure we always have an array on error
      Alert.alert('Error', 'Failed to load companies. ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectCompany = useCallback(async (company) => {
    try {
      setLoading(true);
      console.log('🏢 Selecting company:', company.name, 'ID:', company.id || company.companyID);
      
      // Get company-specific refresh token
      const refreshTokenData = await getRefreshToken(company.id || company.companyID);
      console.log('✅ Company token retrieved:', !!refreshTokenData);
      
      // Set current company in Redux
      setCurrentCompany({
        ...company,
        id: company.id || company.companyID,
      });
      
      console.log('✅ Company selection complete - ready for API calls');
      console.log('🚀 Navigating to /vibe (Chatbot)...');
      
      // Navigate to vibe/chatbot after successful company selection
      router.replace('/vibe');
    } catch (error) {
      console.error('❌ Error selecting company:', error);
      Alert.alert('Error', 'Failed to select company');
    } finally {
      setLoading(false);
    }
  }, [setCurrentCompany, router]);

  // Use companies from Redux if available, otherwise fetch
  useEffect(() => {
    if (Array.isArray(companies_list) && companies_list.length > 0) {
      console.log('📦 Using companies from Redux:', companies_list.length);
      setCompanies(companies_list);
    } else {
      console.log('🔄 No companies in Redux, fetching...');
      fetchCompanies();
    }
  }, [companies_list, fetchCompanies]);
  
  // Auto-select if only one company (only once)
  useEffect(() => {
    if (companies.length === 1 && !loading && !hasAttemptedAutoSelect) {
      console.log('🔄 Only one company found - auto-selecting:', companies[0].name);
      setHasAttemptedAutoSelect(true);
      handleSelectCompany(companies[0]);
    }
  }, [companies, loading, hasAttemptedAutoSelect, handleSelectCompany]);

  const handleCreateCompany = async () => {
    if (!newCompanyName.trim()) {
      Alert.alert('Error', 'Please enter a company name');
      return;
    }

    try {
      setCreatingCompany(true);
      console.log('🏗️ Creating company with name:', newCompanyName);
      
      if (!userID) {
        throw new Error('User ID not found. Please log in again.');
      }
      
      // 🔄 Fetch FRESH access token before creating company (matches web app's getAuthToken())
      console.log('🔄 Fetching FRESH access token before creating company...');
      const refreshToken = await getItem("refresh_auth_token") || await getItem("refresh_token");
      
      if (!refreshToken) {
        throw new Error('No refresh token found. Please log in again.');
      }
      
      const freshToken = await getUserById(refreshToken);
      console.log('✅ Fresh token obtained for company creation');
      console.log('   Fresh token:', freshToken.substring(0, 50) + "...");
      
      // Decode fresh token to check permissions
      const tokenParts = freshToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('📋 Fresh Token Permissions:');
        console.log('   allowed_create_workspaces:', payload.allowed_create_workspaces);
        console.log('   create_workspace:', payload.create_workspace);
      }
      
      // Encode company name (replace spaces with zero-width spaces and URI encode)
      const encodedName = encodeURIComponent(newCompanyName.trim().replace(/ /g, "\u200B"));
      
      console.log('📦 Creating with payload:', { companyName: encodedName, userID });
      
      // Pass correct payload structure with FRESH token (matches web app exactly)
      const result = await createCompany({ companyName: encodedName, userID }, freshToken);
      
      // ⭐ MATCHES WEB APP: Check if null (405 freemium limit)
      if (result === null) {
        Alert.alert(
          'Upgrade Required',
          'You have reached the freemium workspace limit. Please upgrade your subscription or contact sales for more access.',
          [
            { text: 'OK', style: 'cancel' },
            { 
              text: 'Contact Sales', 
              onPress: () => {
                // TODO: Open contact sales URL
                console.log('User requested to contact sales');
              }
            }
          ]
        );
        return;
      }
      
      Alert.alert('Success', `Company "${newCompanyName}" created!`);
      setNewCompanyName('');
      setShowCreateForm(false);
      
      // Fetch companies again
      fetchCompanies();
    } catch (error) {
      console.error('❌ Error creating company:', error);
      Alert.alert('Error', error.message || 'Failed to create company');
    } finally {
      setCreatingCompany(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      await dispatch(logoutUser());
      router.replace('/auth/signup');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  if (loading && companies.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading companies...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select a Company</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialCommunityIcons name="logout" size={24} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Companies List */}
      <View style={styles.companiesList}>
        {!Array.isArray(companies) || companies.length === 0 ? (
          <Text style={styles.emptyText}>
            No companies found. Create one to get started!
          </Text>
        ) : (
          companies.map((company, index) => (
            <TouchableOpacity
              key={company.id || company.companyID || index}
              style={styles.companyCard}
              onPress={() => handleSelectCompany(company)}
            >
              <View style={styles.companyIcon}>
                <Text style={styles.iconText}>
                  {(company.name || company.companyName || "UN").substring(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>{company.name || company.companyName || "Unnamed Company"}</Text>
                {company.role && (
                  <Text style={styles.companyRole}>{company.role}</Text>
                )}
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Create Company Section */}
      {!showCreateForm ? (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {
            console.log('🔄 Navigating to workspace creation...');
            router.push('/workspace-creation');
          }}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
          <Text style={styles.createButtonText}>Create New Workspace</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.createForm}>
          <Text style={styles.formTitle}>Create New Company</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter company name"
            placeholderTextColor="#9CA3AF"
            value={newCompanyName}
            onChangeText={setNewCompanyName}
            editable={!creatingCompany}
          />
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setShowCreateForm(false);
                setNewCompanyName('');
              }}
              disabled={creatingCompany}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleCreateCompany}
              disabled={creatingCompany}
            >
              {creatingCompany ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    gap: 6,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  companiesList: {
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  companyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  companyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  companyRole: {
    fontSize: 12,
    color: '#6B7280',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    padding: 16,
    marginVertical: 20,
    elevation: 4,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  createForm: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
    color: '#111827',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default ListCompany2;
