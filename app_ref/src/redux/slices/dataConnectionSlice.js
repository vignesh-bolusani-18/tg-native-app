// src/redux/slices/experimentSlice.js
import { createSlice, current } from "@reduxjs/toolkit";
import { checkSpreadsheetConnection } from "../../utils/Data Connections/googleSheetUtils";
// import { checkSpreadsheetConnection } from "../../utils/Data Connections/Google Sheet/sheetsOperations";

const initialState = {
  dataConnections: [],
  connecting: false,
  connectionResponse: null,
  error: null,
  connectionDetails: [],
  googleDriveDataConnectionDetails: {},
  sampleData: null,
  googleDriveSampleData: null,
  fileName: "",
  googleDriveSampleDataFetchFailed: false,
};

const dataConnectionSlice = createSlice({
  name: "dataConnection",
  initialState,
  reducers: {
    setConnecting: (state, action) => {
      state.connecting = action.payload;
    },
    setConnectionResponse: (state, action) => {
      state.connectionResponse = action.payload;
    },
    loadConnections: (state, action) => {
      state.dataConnections = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setConnectionDetails: (state, action) => {
      state.connectionDetails = action.payload;
    },
    setGoogleDriveDataConnectionDetails: (state, action) => {
      state.googleDriveDataConnectionDetails = action.payload;
    },
    setSampleData: (state, action) => {
      state.sampleData = action.payload;
    },
    setFileName: (state, action) => {
      state.fileName = action.payload;
    },
    setGoogleDriveSampleData: (state, action) => {
      state.googleDriveSampleData = action.payload;
    },
    setGoogleDriveSampleDataFetchFailed: (state, action) => {
      state.googleDriveSampleDataFetchFailed = action.payload;
    },
    clearData: (state) => {
      state.connecting = initialState.connecting;
      state.connectionResponse = initialState.connectionResponse;
      state.connectionDetails = initialState.connectionDetails;
      state.googleDriveDataConnectionDetails =
        initialState.googleDriveDataConnectionDetails;
      state.sampleData = initialState.sampleData;
      state.fileName = initialState.fileName;
      state.googleDriveSampleData = initialState.googleDriveSampleData;
      state.googleDriveSampleDataFetchFailed =
        initialState.googleDriveSampleDataFetchFailed;
    },
  },
});

export const {
  setConnecting,
  setConnectionResponse,
  loadConnections,
  setError,
  setConnectionDetails,
  setGoogleDriveDataConnectionDetails,
  setSampleData,
  setFileName,
  clearData,
  setGoogleDriveSampleData,
  setGoogleDriveSampleDataFetchFailed,
} = dataConnectionSlice.actions;
export default dataConnectionSlice.reducer;
