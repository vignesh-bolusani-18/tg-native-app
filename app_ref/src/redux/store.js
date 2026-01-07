// // src/redux/store.js
// import { combineReducers, configureStore } from "@reduxjs/toolkit";
// import { thunk } from "redux-thunk";
// import authSlice from "./slices/authSlice";
// import configSlice from "./slices/configSlice";
// import persistReducer from "redux-persist/es/persistReducer";
// import storage from "redux-persist/lib/storage";
// import persistStore from "redux-persist/es/persistStore";
// import experimentSlice from "./slices/experimentSlice";
// import dashboardSlice from "./slices/dashboardSlice";
// import datasetSlice from "./slices/datasetSlice";
// import dataConnectionSlice from "./slices/dataConnectionSlice";

// const persistConfig = {
//   key: "root",
//   storage,
// };

// // Combine all reducers
// const appReducer = combineReducers({
//   auth: authSlice,
//   config: configSlice,
//   experiment: experimentSlice,
//   dashboard: dashboardSlice,
//   dataset: datasetSlice,
//   dataConnection: dataConnectionSlice,
// });

// // Root reducer with RESET action to clear state
// const rootReducer = (state, action) => {
//   if (action.type === "RESET") {
//     // When RESET action is dispatched, return the initial state
//     state = undefined;
//   }
//   return appReducer(state, action);
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// // Add redux-thunk middleware to the store
// const middleware = (getDefaultMiddleware) =>
//   getDefaultMiddleware({
//     immutableCheck: false, // Disable immutable state check
//   }).concat(thunk);

// // Configure the store
// export const store = configureStore({
//   reducer: persistedReducer,
//   middleware,
//   devTools: process.env.NODE_ENV !== "production", // Enable Redux DevTools only in development mode
// });

// export const persistor = persistStore(store);

// // Function to reset the state and clear persisted storage
// export const resetStore = () => {
//   persistor.purge(); // Clear persisted state
//   store.dispatch({ type: "RESET" }); // Dispatch RESET action to clear Redux state
// };
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { thunk } from "redux-thunk";
import authSlice from "./slices/authSlice";
import configSlice from "./slices/configSlice";
import experimentSlice from "./slices/experimentSlice";
import dashboardSlice from "./slices/dashboardSlice";
import datasetSlice from "./slices/datasetSlice";
import exportsSlice from "./slices/exportsSlice";
import dataConnectionSlice from "./slices/dataConnectionSlice";
import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage";
import persistStore from "redux-persist/es/persistStore";
import impactSlice from "./slices/impactSlice";
import sessionSlice from "./slices/sessionSlice";
import moduleSlice from "./slices/moduleSlice";
import workflowSlice from "./slices/workflowSlice";
import scheduledJobsReducer from "./slices/scheduledJobsSlice";
import meetingNoteSlice from "./slices/meetingNoteSlice";
import vibeSlice from "./slices/vibeSlice";

const authPersistConfig = {
  key: "auth",
  storage,
};

const appPersistConfig = {
  key: "app",
  storage,
  version: 72, // Increment version to force migration
  migrate: (state) => {
    if (!state || state._persist.version !== appPersistConfig.version) {
      // Force migration to new structure
      return Promise.resolve(undefined);
    }

    // Ensure vibe slice has the new structure
    if (state.vibe && !state.vibe.conversations) {
      state.vibe = {
        ...state.vibe,
        conversations: {},
        currentConversationId: null,
      };
    }

    return Promise.resolve(state);
  },
};

// Combine all reducers
const appReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authSlice),
  config: configSlice,
  experiment: experimentSlice,
  dashboard: dashboardSlice,
  dataset: datasetSlice,
  dataConnection: dataConnectionSlice,
  exports: exportsSlice,
  impact: impactSlice,
  session: sessionSlice,
  module: moduleSlice,
  workflow: workflowSlice,
  scheduledJobs: scheduledJobsReducer,
  vibe: vibeSlice,
  meetingNotes:meetingNoteSlice,
});

// Root reducer
const rootReducer = (state, action) => {
  if (action.type === "RESET") {
    state = undefined;
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(appPersistConfig, rootReducer);

// Middleware configuration
const middleware = (getDefaultMiddleware) =>
  getDefaultMiddleware({
    immutableCheck: false,
  }).concat(thunk);

// Store configuration
export const store = configureStore({
  reducer: persistedReducer,
  middleware,
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);

// Function to reset the state and clear persisted storage
export const resetStore = async () => {
  persistor.purge();
  store.dispatch({ type: "RESET" });
};

export default store;
