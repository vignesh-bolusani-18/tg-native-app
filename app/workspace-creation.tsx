// app/workspace-creation.tsx
// Workspace creation screen - matches web app's company/workspace naming flow

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, setCurrCompany } from '../redux/actions/authActions';
import { createCompany } from '../utils/createCompany';
import { getCompaniesList } from '../utils/getCompaniesList';
import { getRefreshToken } from '../utils/getRefreshToken';
import { getUserById } from '../utils/getUserById';
import { getItem, setItem } from '../utils/storage';

/**
 * Workspace Creation Screen
 * 
 * Matches web app's workspace creation flow:
 * - Shows URL format: app.truegradient.ai/[WorkspaceName]/agent/...
 * - Pre-fills workspace name with email prefix (e.g., "vbolusani43")
 * - Creates workspace and redirects to agent/chatbot
 */
export default function WorkspaceCreationScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const companies = useSelector((state: any) => state.auth.companies_list || []);
  const [workspaceName, setWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const hasRedirected = React.useRef(false);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      // Prevent multiple redirects
      if (hasRedirected.current) {
        return;
      }

      const token = await getItem('token');
      
      if (!token) {
        console.log('⚠️ Workspace Creation: No token - redirecting to login');
        hasRedirected.current = true;
        router.replace('/auth/signup');
        return;
      }
      
      // Check if userInfo exists in Redux (should be set during login)
      if (userInfo && userInfo.email) {
        console.log('✅ Workspace Creation: Auth check passed');
        console.log('   User:', userInfo.email);
        setIsCheckingAuth(false);
      } else {
        console.log('⚠️ Workspace Creation: No userInfo in Redux');
        console.log('   This might indicate an incomplete login - user can still try to create workspace');
        // Don't redirect - let them try to create workspace
        // The backend call will fail if auth is truly invalid
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [userInfo, router]);

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out from workspace creation...');
      await (dispatch as any)(logoutUser());
      router.replace('/auth/signup');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  // Extract email prefix for default workspace name (like web app)
  useEffect(() => {
    if (userInfo?.email && !workspaceName) {
      // Extract part before @ and add "Workspace" suffix
      const emailPrefix = userInfo.email.split('@')[0];
      // Remove special characters and add suffix (e.g., "vbolusani43Workspace")
      const defaultName = emailPrefix.replace(/[^a-zA-Z0-9]/g, '') + 'Workspace';
      setWorkspaceName(defaultName);
      console.log('📝 Default workspace name:', defaultName);
    }
  }, [userInfo, workspaceName]);

  // If user already has companies, show option to skip or go to company selection
  useEffect(() => {
    if (!isCheckingAuth && companies && companies.length > 0) {
      console.log('✅ User already has', companies.length, 'workspace(s)');
      // Don't redirect automatically - let them create another workspace if they want
    }
  }, [companies, isCheckingAuth]);

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) {
      Alert.alert('Error', 'Please enter a workspace name');
      return;
    }

    try {
      setIsCreating(true);
      console.log('🏗️ Creating workspace:', workspaceName);

      if (!userInfo?.userID) {
        throw new Error('User ID not found. Please log in again.');
      }

      // Get FRESH access token before creating workspace (matches web app)
      console.log('🔄 Fetching FRESH access token before creating workspace...');
      const refreshToken = await getItem("refresh_auth_token") || await getItem("refresh_token");

      if (!refreshToken) {
        throw new Error('No refresh token found. Please log in again.');
      }

      // Get fresh token and STORE it
      const freshAccessToken = await getUserById(refreshToken);
      await setItem('token', freshAccessToken); // IMPORTANT: Store the fresh token
      console.log('✅ Fresh token obtained and stored for workspace creation');

      // Encode workspace name (replace spaces with zero-width spaces and URI encode)
      const encodedName = encodeURIComponent(workspaceName.trim().replace(/ /g, "\u200B"));

      console.log('📦 Creating with payload:', { companyName: encodedName, userID: userInfo.userID });

      // Create the workspace/company
      const result = await createCompany({ companyName: encodedName, userID: userInfo.userID });

      // Check if freemium limit reached (405)
      if (result === null) {
        Alert.alert(
          'Upgrade Required',
          'You have reached the freemium workspace limit. Please upgrade your subscription or contact sales for more access.',
          [
            { text: 'OK', style: 'cancel' },
            {
              text: 'Contact Sales',
              onPress: () => {
                console.log('User requested to contact sales');
                // TODO: Add sales contact link
              }
            }
          ]
        );
        setIsCreating(false);
        return;
      }

      console.log('✅ Workspace created successfully:', result);

      // Fetch updated companies list
      const companiesResponse = await getCompaniesList();
      const companies = companiesResponse?.companies || companiesResponse || [];
      
      // Find the newly created company and select it
      const newCompany = companies.find((c: any) => 
        (c.name || c.companyName) === workspaceName || 
        (c.id || c.companyID) === result.id
      ) || companies[0];

      if (newCompany) {
        const companyId = newCompany.id || newCompany.companyID;
        
        // Get company-specific refresh token
        await getRefreshToken(companyId);
        console.log('✅ Company token retrieved');

        // Set current company in Redux
        (dispatch as any)(setCurrCompany({
          ...newCompany,
          id: companyId,
          companyName: newCompany.companyName || newCompany.name,
        }));

        console.log('✅ Workspace setup complete - Navigating to agent/chatbot');
        
        // Navigate to chatbot (matches web app redirect)
        router.replace('/vibe');
      } else {
        throw new Error('Failed to find created workspace');
      }
    } catch (error: any) {
      console.error('❌ Error creating workspace:', error);
      Alert.alert('Error', error.message || 'Failed to create workspace');
      setIsCreating(false);
    }
  };

  // Generate preview URL (like web app shows)
  const previewUrl = `app.truegradient.ai/${workspaceName || '[WorkspaceName]'}/agent/...`;

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading workspace setup...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Header with Logout */}
        <View style={styles.contaiRow}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Your Workspace</Text>
          <Text style={styles.subtitle}>
            Choose a name for your workspace
          </Text>
        </View>

        {/* URL Preview */}
        <View style={styles.urlPreview}>
          <Text style={styles.urlLabel}>Your workspace URL will be:</Text>
          <Text style={styles.urlText} numberOfLines={1}>
            {previewUrl}
          </Text>
        </View>

        {/* Workspace Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Enter Your Workspace Name</Text>
          <TextInput
            style={styles.input}
            value={workspaceName}
            onChangeText={setWorkspaceName}
            placeholder="e.g., MyWorkspace"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isCreating}
          />
          <Text style={styles.inputHint}>
            This will be visible in your workspace URL
          </Text>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, isCreating && styles.createButtonDisabled]}
          onPress={handleCreateWorkspace}
          disabled={isCreating || !workspaceName.trim()}
        >
          {isCreating ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.createButtonText}>Create Workspace</Text>
          )}
        </TouchableOpacity>

        {/* User Info */}
        {userInfo?.email && (
          <View style={styles.userInfo}>
            <Text style={styles.userInfoText}>
              Creating workspace for: {userInfo.email}
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  contaiRow: {
    position: 'absolute',
    top: 48,
    right: 24,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  logoutText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  urlPreview: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  urlLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  urlText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  inputHint: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  createButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  userInfo: {
    marginTop: 24,
    alignItems: 'center',
  },
  userInfoText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
