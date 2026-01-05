// app/upgrade-required.tsx
// Freemium limit reached - upgrade required

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../redux/actions/authActions';

export default function UpgradeRequiredScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleContactSales = () => {
    // Open sales contact (update with actual URL)
    Linking.openURL('mailto:sales@truegradient.ai?subject=Workspace Upgrade Request');
  };

  const handleLogout = async () => {
    try {
      await (dispatch as any)(logoutUser());
      router.replace('/auth/signup');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="alert-circle" size={80} color="#F59E0B" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Workspace Limit Reached</Text>

        {/* Message */}
        <Text style={styles.message}>
          You&apos;ve reached the freemium workspace limit. Please upgrade your subscription to create more workspaces.
        </Text>

        {/* Contact Sales Button */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleContactSales}>
          <MaterialCommunityIcons name="email" size={20} color="#FFF" />
          <Text style={styles.primaryButtonText}>Contact Sales</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.secondaryButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          <Text style={styles.secondaryButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    maxWidth: 300,
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    width: '100%',
    maxWidth: 300,
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
