// utils/storage.js
// Platform-agnostic storage utility
// Uses SecureStore for native (iOS/Android) and localStorage for web

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const setItem = async (key, value) => {
  try {
    console.log(`[storage.js] 📝 Setting ${key}:`, typeof value, value ? `${value.substring(0, 30)}...` : value);
    if (isWeb) {
      // Use localStorage for web
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        console.log(`[storage.js] ✅ Successfully stored ${key} in localStorage`);
        // Verify it was stored
        const verification = localStorage.getItem(key);
        console.log(`[storage.js] 🔍 Verification: ${key} =`, verification ? `${verification.substring(0, 30)}...` : 'NULL');
      } else {
        console.error(`[storage.js] ❌ localStorage not available for ${key}`);
      }
    } else {
      // Use SecureStore for native
      await SecureStore.setItemAsync(key, value);
      console.log(`[storage.js] ✅ Successfully stored ${key} in SecureStore`);
      // Verify it was stored
      const verification = await SecureStore.getItemAsync(key);
      console.log(`[storage.js] 🔍 Verification: ${key} =`, verification ? `${verification.substring(0, 30)}...` : 'NULL');
    }
  } catch (error) {
    console.error(`[storage.js] ❌ Error storing ${key}:`, error);
    console.error(`[storage.js]    Error type:`, error.constructor.name);
    console.error(`[storage.js]    Error message:`, error.message);
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
