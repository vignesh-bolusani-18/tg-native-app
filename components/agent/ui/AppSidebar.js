import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import useAuth from '../../../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { signOutUser } from '../../../redux/actions/authActions';
import { useRouter } from 'expo-router';
import { removeItem } from '../../../utils/storage';

// Design Tokens
const COLORS = {
  primary: '#008AE5',
  text80: '#333333',
  text65: '#595959',
  text60: '#666666',
  surfacePrimary: '#FFFFFF',
  surfaceSecondary: '#F0F8FF', // Light blue background
  stroke: '#E6E6E6',
};

const FONTS = {
  interDisplay: 'Inter Display',
};

const AppSidebar = ({ onClose }) => {
  const { currentCompany, userInfo } = useAuth();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    // Clear auth state
    await dispatch(signOutUser());
    // Clear auth_completed flag
    await removeItem('auth_completed');
    // Direct redirect to login
    router.replace('/auth/signup');
    if (onClose) onClose();
  };

  const handleSwitchWorkspace = () => {
    router.replace('/company-selection');
    if (onClose) onClose();
  };

  const menuItems = [
    { icon: 'star-outline', label: 'Agent', route: '/vibe' },
    { icon: 'flag-outline', label: 'Plan', route: '/plan' },
    { icon: 'cube-outline', label: 'Experiment', route: '/experiment' },
    { icon: 'flash-outline', label: 'Impact', route: '/impact' },
    { icon: 'database', label: 'Data', route: '/data' },
    { icon: 'insert-chart', label: 'Insights', route: '/insights' },
    { icon: 'account-tree', label: 'Workflows', route: '/workflows' },
    { icon: 'bar-chart', label: 'Optimize', route: '/optimize' },
  ];

  const bottomItems = [
    { icon: 'lightbulb-outline', label: 'Solutions', route: '/solutions' },
    { icon: 'settings', label: 'Settings', route: '/settings' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity 
            style={styles.profileHeader}
            onPress={handleSwitchWorkspace}
            activeOpacity={0.7}
          >
            <View style={styles.profileRow}>
              <MaterialIcons name="person-outline" size={18} color={COLORS.text80} />
              <Text style={styles.profileName} numberOfLines={1}>
                {currentCompany?.companyName || 'Angelcare'}
              </Text>
              <View style={{ transform: [{ rotate: '90deg' }] }}>
                <MaterialIcons name="code" size={12} color={COLORS.text80} />
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.profileSubtext}>
            <Text style={styles.userName} numberOfLines={1}>
              {userInfo?.name || userInfo?.email || 'Atharva Dikondawar'}
            </Text>
          </View>
        </View>

        {/* Main Navigation */}
        <View style={styles.navSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.navItem}
              activeOpacity={0.7}
              onPress={() => {
                // router.push(item.route);
                // if (onClose) onClose();
              }}
            >
              <MaterialIcons name={item.icon} size={18} color={COLORS.text65} />
              <Text style={styles.navLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Spacer */}
        <View style={{ height: 135 }} />

        {/* Bottom Actions */}
        <View style={styles.bottomSection}>
          {bottomItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.navItem}
              activeOpacity={0.7}
              onPress={() => {
                if (item.label === 'Settings') {
                  handleLogout();
                } else {
                  // router.push(item.route);
                  // if (onClose) onClose();
                }
              }}
            >
              <MaterialIcons name={item.icon} size={18} color={COLORS.text65} />
              <Text style={styles.navLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfacePrimary,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileCard: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 12,
    gap: 4,
    marginBottom: 20,
  },
  profileHeader: {
    paddingHorizontal: 8,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 4,
  },
  profileName: {
    flex: 1,
    fontFamily: FONTS.interDisplay,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text80,
  },
  profileSubtext: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  userName: {
    fontFamily: FONTS.interDisplay,
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(51, 51, 51, 0.8)',
  },
  navSection: {
    gap: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: COLORS.surfacePrimary,
    height: 32,
  },
  navLabel: {
    fontFamily: FONTS.interDisplay,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 24,
    color: COLORS.text65,
  },
  bottomSection: {
    gap: 16,
    paddingBottom: 20,
  },
});

export default AppSidebar;
