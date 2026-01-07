// components/explore/ExploreGrid.tsx
// Figma-aligned Explore page with feature grid
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TGIcon = require('../../assets/images/tg_logo6.svg');

const ExploreGrid = () => {
  const router = useRouter();

  const features = [
    {
      id: 1,
      title: 'Plan',
      description: 'Build and review demand, supply, and financial plans',
      icon: 'file-document-outline',
      color: '#00274b',
    },
    {
      id: 2,
      title: 'Experiment',
      description: 'Test scenarios and see outcomes before acting.',
      icon: 'flask-outline',
      color: '#00274b',
    },
    {
      id: 3,
      title: 'Impact',
      description: 'See how decisions affect revenue, risk, and service.',
      icon: 'chart-line',
      color: '#00274b',
    },
    {
      id: 4,
      title: 'Data',
      description: 'See how decisions affect revenue, risk, and service.',
      icon: 'database',
      color: '#00274b',
    },
    {
      id: 5,
      title: 'Insights',
      description: 'Discover patterns and signals in your data.',
      icon: 'lightbulb-outline',
      color: '#00274b',
    },
    {
      id: 6,
      title: 'Workflows',
      description: 'Discover patterns and signals in your data.',
      icon: 'workflow',
      color: '#00274b',
    },
    {
      id: 7,
      title: 'Optimize',
      description: 'Discover patterns and signals in your data.',
      icon: 'tune',
      color: '#00274b',
    },
    {
      id: 8,
      title: 'Solutions',
      description: 'Pre-built use cases for common planning needs.',
      icon: 'puzzle-outline',
      color: '#00274b',
    },
  ];

  const handleFeaturePress = (featureId: number, featureName: string) => {
    console.log(`Navigate to ${featureName}`);
    // Navigation logic will go here
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        {/* Logo centered */}
        <View style={styles.logoContainer}>
          <Image source={TGIcon} style={styles.logo} />
        </View>

        {/* User Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.navContainer}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.navTextInactive}>Agent</Text>
        </TouchableOpacity>
        
        <View style={styles.navButtonActive}>
          <Text style={styles.navTextActive}>Explore</Text>
        </View>
      </View>

      {/* Feature Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        {features.map((feature) => (
          <TouchableOpacity
            key={feature.id}
            style={styles.card}
            onPress={() => handleFeaturePress(feature.id, feature.title)}
            activeOpacity={0.7}
          >
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{feature.title}</Text>
              <MaterialCommunityIcons
                name="arrow-top-right"
                size={20}
                color={feature.color}
              />
            </View>

            {/* Icon Placeholder */}
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={feature.icon}
                size={48}
                color={feature.color}
              />
            </View>

            {/* Description */}
            <Text style={styles.cardDescription}>{feature.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    position: 'relative',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 40,
    height: 37,
    resizeMode: 'contain',
  },
  avatar: {
    position: 'absolute',
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Inter Display',
    fontSize: 16,
    fontWeight: '600',
    color: '#4D4D4D',
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 24,
    padding: 2,
    marginHorizontal: 20,
    marginBottom: 20,
    alignSelf: 'center',
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  navButtonActive: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#4D4D4D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  navTextInactive: {
    fontFamily: 'Inter Display',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 24,
    color: '#666666',
  },
  navTextActive: {
    fontFamily: 'Inter Display',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 24,
    color: '#333333',
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 22,
  },
  card: {
    width: '47%', // 2 columns with gap
    backgroundColor: 'rgba(250, 250, 250, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(242, 242, 242, 0.9)',
    borderRadius: 16,
    padding: 20,
    paddingVertical: 16,
    gap: 38,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: 'Inter Display',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: '#00274B',
  },
  iconContainer: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDescription: {
    fontFamily: 'Geist Mono',
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 16,
    color: 'rgba(0, 39, 75, 0.8)',
  },
});

export default ExploreGrid;
