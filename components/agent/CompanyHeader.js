// components/agent/CompanyHeader.js
// Header component displaying current company with logout and switch company options

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import useAuth from '../../hooks/useAuth';
import { logoutUser } from '../../redux/actions/authActions';

const CompanyHeader = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentCompany, userInfo } = useAuth();

  const handleSwitchCompany = () => {
    console.log('🔄 Switching company...');
    router.push('/company-selection');
  };

  const handleCreateWorkspace = () => {
    console.log('🏗️ Creating new workspace...');
    router.push('/workspace-creation');
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      await dispatch(logoutUser());
      router.replace('/auth/signup');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // If no company selected, show workspace selector
  if (!currentCompany) {
    return (
      <View style={styles.container}>
        <View style={styles.companyInfo}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="domain-plus" size={24} color="#F59E0B" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.companyName} numberOfLines={1}>
              Select or Create Workspace
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {userInfo?.email || 'User'}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={handleSwitchCompany}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#3B82F6" />
            <Text style={styles.actionText}>Select</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCreateWorkspace}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="plus-circle" size={20} color="#3B82F6" />
            <Text style={styles.actionText}>Create</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            onPress={handleLogout}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
            <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.companyInfo}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="domain" size={24} color="#3B82F6" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.companyName} numberOfLines={1}>
            {currentCompany.companyName || currentCompany.name || 'My Company'}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {userInfo?.email || 'User'}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleSwitchCompany}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="swap-horizontal" size={20} color="#6B7280" />
          <Text style={styles.actionText}>Switch</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          onPress={handleLogout}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  logoutText: {
    color: '#EF4444',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
  },
});

export default CompanyHeader;
