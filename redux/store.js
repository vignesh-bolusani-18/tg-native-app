// redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import vibeReducer from "./slices/vibeSlice";

// Add other reducers here if you have them
export const store = configureStore({
  reducer: {
    auth: authReducer,
    vibe: vibeReducer,
  },
  // Middleware setup is automatic with Redux Toolkit
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Useful if you store non-serializable data like classes
    }),
});

// Helper to reset store (mimicking your web logic)
export const resetStore = async () => {
  // In Redux Toolkit, the cleanest way to reset is often to have a root reducer
  // that handles a RESET_STORE action, or manually dispatch clear actions.
  // For now, we'll implement a basic reset if you need it.
  console.log("Store reset requested");
};