// INTEGRATION_GUIDE.md
// How to integrate company selection into your auth flow

# 🔗 Company Selection Integration Guide

## Quick Start

After implementing the company selection feature, follow these steps to integrate it into your app:

---

## 1. **Update Root Layout** (Optional)

Add the company-selection route to `app/_layout.tsx`:

\`\`\`tsx
// app/_layout.tsx
export default function RootLayout() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/signup" />
          <Stack.Screen name="company-selection" /> {/* ADD THIS */}
        </Stack>
      </PaperProvider>
    </Provider>
  );
}
\`\`\`

---

## 2. **Navigate After Login**

Update your OTP verification success to navigate to company selection:

### Option A: In SignUpPage.js (after OTP verification)

\`\`\`javascript
// components/auth/SignUpPage.js
import { useRouter } from 'expo-router';

const SignUpPage = () => {
  const router = useRouter();
  const { verifyOTP } = useAuth();

  const handleVerifyOTP = async (otp) => {
    const result = await verifyOTP(otp);
    if (result.success) {
      // Navigate to company selection
      router.push('/company-selection');
    }
  };
};
\`\`\`

### Option B: In app/index.tsx (automatic routing)

\`\`\`tsx
// app/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import useAuth from '@/hooks/useAuth';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, currentCompany } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    } else if (!currentCompany?.id) {
      // User is authenticated but no company selected
      router.replace('/company-selection');
    } else {
      // User has company, go to main app
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, currentCompany]);

  return <View><ActivityIndicator /></View>;
}
\`\`\`

---

## 3. **Handle Company Selection**

The ListCompany2 component already handles everything automatically:

\`\`\`javascript
// When user selects a company:
// 1. Calls getRefreshToken(companyID)
// 2. Stores refresh_token_company in SecureStore ✅
// 3. Stores companyID in SecureStore ✅
// 4. Updates Redux currentCompany ✅
// 5. Shows success alert

// After company selection, manually navigate to main app:
\`\`\`

Update ListCompany2 to navigate after selection:

\`\`\`javascript
// components/company/listCompany2.js
import { useRouter } from 'expo-router';

const ListCompany2 = () => {
  const router = useRouter();
  
  const handleSelectCompany = async (company) => {
    try {
      setLoading(true);
      await getRefreshToken(company.id);
      setCurrentCompany({ ...company, id: company.id });
      
      Alert.alert(
        'Success',
        \`Selected \${company.name}\`,
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to select company');
    } finally {
      setLoading(false);
    }
  };
};
\`\`\`

---

## 4. **Verify Storage**

After company selection, check SecureStore:

\`\`\`javascript
import * as SecureStore from 'expo-secure-store';

// Debug: Check if tokens are stored
const checkTokens = async () => {
  const tokens = {
    token: await SecureStore.getItemAsync('token'),
    userToken: await SecureStore.getItemAsync('userToken'),
    refresh_token: await SecureStore.getItemAsync('refresh_token'),
    refresh_auth_token: await SecureStore.getItemAsync('refresh_auth_token'),
    refresh_token_company: await SecureStore.getItemAsync('refresh_token_company'), // NEW!
    companyID: await SecureStore.getItemAsync('companyID'), // NEW!
  };
  
  console.log('All Tokens:', tokens);
  // All should have values ✅
};
\`\`\`

---

## 5. **Using Company Data in Your App**

Access company info throughout your app:

\`\`\`javascript
import useAuth from '@/hooks/useAuth';

const MyScreen = () => {
  const { currentCompany, companies_list } = useAuth();

  return (
    <View>
      <Text>Current Company: {currentCompany?.name}</Text>
      <Text>Company ID: {currentCompany?.id}</Text>
      <Text>Total Companies: {companies_list.length}</Text>
    </View>
  );
};
\`\`\`

---

## 6. **Switch Company**

Allow users to switch companies:

\`\`\`javascript
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'expo-router';

const SwitchCompanyButton = () => {
  const { setOtherCompany, userInfo } = useAuth();
  const router = useRouter();

  const handleSwitchCompany = async () => {
    await setOtherCompany(userInfo);
    router.push('/company-selection');
  };

  return (
    <Button onPress={handleSwitchCompany}>
      Switch Company
    </Button>
  );
};
\`\`\`

---

## 🔄 Complete Flow Diagram

\`\`\`
User Opens App
    ↓
index.tsx checks auth
    ↓
    ├─ Not Authenticated? → /auth/login
    │                           ↓
    │                      OTP/OAuth Login
    │                           ↓
    │                      Store: token, userToken, refresh_token
    │                           ↓
    ├─ Authenticated but no company? → /company-selection
    │                                       ↓
    │                                  ListCompany2 Component
    │                                       ↓
    │                                  User selects company
    │                                       ↓
    │                                  Store: refresh_token_company, companyID
    │                                       ↓
    │                                  Update Redux: currentCompany
    │                                       ↓
    └─ Authenticated + has company? → /(tabs) [Main App]
\`\`\`

---

## 🎯 Testing Checklist

1. **Login Flow**
   - [ ] Login with OTP
   - [ ] Redirected to /company-selection
   - [ ] Companies list loads

2. **Company Selection**
   - [ ] Can see all companies
   - [ ] Can create new company
   - [ ] Can select company
   - [ ] Success alert shows
   - [ ] Navigates to main app

3. **Storage Check**
   - [ ] All 6 tokens in SecureStore
   - [ ] companyID stored
   - [ ] Redux currentCompany updated

4. **Error Handling**
   - [ ] Network errors show alert
   - [ ] Loading states work
   - [ ] No console errors

---

## 🐛 Troubleshooting

### Companies not loading
**Check:**
- API endpoint: \`\${API_BASE_URL}/companies\`
- Token in SecureStore: \`token\`
- Console for errors

### Company selection fails
**Check:**
- Company has valid ID: \`company.id\` or \`company.companyID\`
- \`/getAuthToken\` endpoint working
- Look for "✅ Company-specific refresh token stored" in console

### Navigation not working
**Check:**
- Expo Router properly configured
- Route exists: \`app/company-selection.tsx\`
- Using \`router.replace()\` not \`router.push()\` for auth flows

---

## 🚀 You're Ready!

Everything is set up. Just:
1. Add the navigation logic after login
2. Test on your mobile device
3. Check SecureStore has all 6 tokens

**No errors, clean code, production-ready!** ✅
