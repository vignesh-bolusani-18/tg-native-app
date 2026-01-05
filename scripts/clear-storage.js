// scripts/clear-storage.js
// Clear all auth tokens and storage - run this to reset app

const { getItem, setItem, removeItem } = require('../utils/storage');

async function clearAllStorage() {
  console.log('\n🧹 CLEARING ALL STORAGE...\n');
  
  const keysToRemove = [
    'token',
    'refresh_token',
    'refresh_auth_token',
    'refresh_token_company',
    'userInfo',
    'userData',
    'currentCompany',
    'companies_list',
  ];
  
  for (const key of keysToRemove) {
    try {
      const value = await getItem(key);
      if (value) {
        console.log(`❌ Removing: ${key}`);
        await removeItem(key);
      } else {
        console.log(`⚪ Not found: ${key}`);
      }
    } catch (error) {
      console.log(`⚠️ Error removing ${key}:`, error.message);
    }
  }
  
  console.log('\n✅ STORAGE CLEARED!\n');
  console.log('Please restart the app to see login screen.\n');
}

clearAllStorage().catch(console.error);
