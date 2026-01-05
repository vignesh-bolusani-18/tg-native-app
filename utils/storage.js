// utils/storage.js
// Platform-agnostic storage utility
// Uses SecureStore for native (iOS/Android) and localStorage for web

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const setItem = async (key, value) => {
  try {
    if (isWeb) {
      // Use localStorage for web
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } else {
      // Use SecureStore for native
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
    throw error;
  }
};

export const getItem = async (key) => {
  try {
    if (isWeb) {
      // Use localStorage for web
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
      return null;
    } else {
      // Use SecureStore for native
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    return null;
  }
};

export const removeItem = async (key) => {
  try {
    if (isWeb) {
      // Use localStorage for web
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } else {
      // Use SecureStore for native
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
  }
};
