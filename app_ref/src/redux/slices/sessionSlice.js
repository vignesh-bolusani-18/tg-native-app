// src/redux/slices/sessionSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sessions_list: [],
  sessionCode:"",
  current_session: {
    sessionID: null,
    userID:null,
    process_type:"",
    status: "",
    stop_instance : false,
    company_s3_prefix: "",
    language: "python",
    updated_at: "",
    created_at: "",
    datasets: [],
  },
};

const sessionSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {
    loadSessions(state, action) {
      state.sessions_list = action.payload;
    },
    setCurrentSession(state, action) {
      state.current_session = action.payload;
    },
    setSessionCode(state, action) {
      state.sessionCode = action.payload;
    },
    updateCurrentSessionID(state, action) {
      state.current_session.sessionID = action.payload;
    },


    updateLastModified(state, action) {
  
      const {date , index} = action.payload
      
      state.current_session.datasets[index].last_modified = date;
    },
    updateSessionByPath: (state, action) => {
      const { path, value } = action.payload;

      const updateNestedByPath = (obj, path, value) => {
        const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
        const updateRecursively = (currentObj, keys) => {
          const [firstKey, ...remainingKeys] = keys;

          // Check if firstKey is a numeric index
          const index = Number(firstKey);
          if (!isNaN(index)) {
            // Handle array case
            if (remainingKeys.length === 0) {
              currentObj[index] = castValue(currentObj[index], value);
            } else {
              currentObj[index] = updateRecursively(
                currentObj[index],
                remainingKeys
              );
            }
          } else {
            // Handle object case
            if (remainingKeys.length === 0) {
              currentObj[firstKey] = castValue(currentObj[firstKey], value);
            } else {
              currentObj[firstKey] = updateRecursively(
                currentObj[firstKey],
                remainingKeys
              );
            }
          }
          return currentObj;
        };

        return updateRecursively(obj, pathParts);
      };

      const castValue = (existingValue, newValue) => {
        if (
          existingValue === null ||
          existingValue === undefined ||
          newValue === null
        ) {
          return newValue;
        }

        const typeOfExistingValue = typeof existingValue;
        switch (typeOfExistingValue) {
          case "number":
            return Number(newValue);
          case "boolean":
            return newValue === "true" || newValue === true;
          case "object":
            if (Array.isArray(existingValue)) {
              return Array.isArray(newValue) ? newValue : [newValue];
            }
            return typeof newValue === "object" ? newValue : {};
          case "string":
            return String(newValue);
          default:
            return newValue;
        }
      };

      state.current_session = updateNestedByPath(
        state.current_session,
        path,
        value
      );
    },
    addDataset: (state, action) => {
      
      state.current_session.datasets = action.payload ;
    },
    updateDatasetStatus: (state, action) => {
      const { index, isLoaded } = action.payload;
      state.current_session.datasets[index].is_loaded = isLoaded;
    },
    removeDataset: (state, action) => {
      state.current_session.datasets = state.current_session.datasets.filter(
        (_, index) => index !== action.payload
      );
    },
    updateSessionLanguage: (state, action) => {
      state.current_session.language = action.payload;
    },
    updateSessionStatus: (state, action) => {
      state.current_session.status = action.payload;
    },
    updateSessionTimestamp: (state, action) => {
      state.current_session.updated_at = action.payload;
    },
    clearSession: (state) => {
      state.current_session = initialState.current_session;
    },
  },
});

export const {
  loadSessions,
  setCurrentSession,
  updateSessionByPath,
  addDataset,
  updateDatasetStatus,
  removeDataset,
  updateSessionLanguage,
  updateSessionStatus,
  setSessionCode,
  updateLastModified,
  updateSessionTimestamp,
  updateCurrentSessionID,
  clearSession,
} = sessionSlice.actions;

export default sessionSlice.reducer;