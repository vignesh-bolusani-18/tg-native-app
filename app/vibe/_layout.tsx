/**
 * 🚀 VIBE LAYOUT
 * Wrapper layout for all /vibe routes
 * Applies gradient background and common styling
 */

import { Stack } from 'expo-router';
import React from 'react';
import VibeGradientLayout from '../../components/agent/VibeGradientLayout';

export default function VibeLayout() {
  return (
    <VibeGradientLayout>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="[id]" />
      </Stack>
    </VibeGradientLayout>
  );
}
