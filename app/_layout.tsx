// app/_layout.tsx
// import "../global.css"; // Commented out to prevent crash without Metro config
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { Provider } from "react-redux";
import { store } from "../redux/store"; // Ensure path matches your structure

// Import and expose test utility in dev mode
if (__DEV__) {
  import('../utils/testAuthFlow').then(({ testTokenFlow }) => {
    // @ts-ignore
    global.testAuthFlow = testTokenFlow;
    console.log('💡 Debug: Run testAuthFlow() in console to test auth tokens');
  }).catch(err => {
    console.log('⚠️ testAuthFlow import failed:', err.message);
  });
}


export default function RootLayout() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/signup" />
          <Stack.Screen name="auth/callback" options={{ presentation: 'modal' }} />
          <Stack.Screen name="auth/oauth-callback" options={{ presentation: 'modal' }} />
        </Stack>
      </PaperProvider>
    </Provider>
  );
}