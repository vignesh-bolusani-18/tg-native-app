import React from 'react';
import { Redirect } from 'expo-router';

export default function HomeScreen() {
  // Redirect to the vibe index screen
  return <Redirect href="/vibe" />;
}