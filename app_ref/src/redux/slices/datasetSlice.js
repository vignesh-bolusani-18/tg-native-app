// src/redux/slices/experimentSlice.js
import { createSlice, current } from "@reduxjs/toolkit";

const initialState = {
  datasets_list: [],
  datasets_name_list: [],
  pre_processes_metadata: {},
  details: {},
  queries:{},
  dialogState: {
    dialogOpen: false,
    dialogDatasetTag: "",
    dialogDatasetTitle: ""
  }
};

const datasetSlice = createSlice({
  name: "dataset",
  initialState,
  reducers: {
    loadDatasets(state, action) {
      state.datasets_list = action.payload;
    },
    addDataset(state, action) {
      state.datasets_list.push(action.payload);
    },
    setDatasetNameList(state, action) {
      state.datasets_name_list = action.payload;
    },
    addPreprocessMetaData(state, action) {
      state.pre_processes_metadata[action.payload.datasetID] =
        action.payload.metadata;
    },
    addDetails(state, action) {
      state.details[action.payload.datasetID] = action.payload.detail;
    },
    addQuery(state, action) {
      state.queries[action.payload.datasetID] = action.payload.query;
    },
    removePreprocessMetaData(state, action) {
      let newPreprocessMetaData = {};
      Object.keys(state.pre_processes_metadata).forEach((key) => {
        if (key !== action.payload.datasetID) {
          newPreprocessMetaData[key] = state.pre_processes_metadata[key];
        }
      });
      state.pre_processes_metadata = newPreprocessMetaData;
    },
    removeDetail(state, action) {
      let newDetails = {};
      Object.keys(state.details).forEach((key) => {
        if (key !== action.payload.datasetID) {
          newDetails[key] = state.details[key];
        }
      });
      state.details = newDetails;
    },
    removeQuery(state, action) {
      let newQueries = {};
      Object.keys(state.queries).forEach((key) => {
        if (key !== action.payload.datasetID) {
          newQueries[key] = state.queries[key];
        }
      });
      state.queries = newQueries;
    },
    updatePreprocessMetaData(state, action) {
      if (
        state.pre_processes_metadata[action.payload.datasetID] !== undefined
      ) {
        state.pre_processes_metadata = {
          ...state.pre_processes_metadata,
          [action.payload.datasetID]: {
            ...state.pre_processes_metadata[action.payload.datasetID],
            data_preprocess_args: action.payload.data_preprocess_args,
          },
        };
      }
    },
    updateDetail(state, action) {
      if (state.details[action.payload.datasetID] !== undefined) {
        state.details = {
          ...state.details,
          [action.payload.datasetID]: action.payload.detail,
        };
      }
    },
    updateQuery(state, action) {
      if (state.queries[action.payload.datasetID] !== undefined) {
        state.queries = {
          ...state.queries,
          [action.payload.datasetID]: action.payload.query,
        };
      }
    },

    openDatasetDialog(state, action) {
      state.dialogState = {
        dialogOpen: true,
        dialogDatasetTag: action.payload.tag,
        dialogDatasetTitle: action.payload.title || ""
      };
    },
    closeDatasetDialog(state) {
      state.dialogState = {
        dialogOpen: false,
        dialogDatasetTag: "",
        dialogDatasetTitle: ""
      };
    }
  },
});

export const {
  addDataset,
  loadDatasets,
  setDatasetNameList,
  addPreprocessMetaData,
  removePreprocessMetaData,
  updatePreprocessMetaData,
  addDetails,
  updateDetail,
  removeDetail,
  addQuery,
  updateQuery,
  removeQuery,
  
  openDatasetDialog,
  closeDatasetDialog
} = datasetSlice.actions;
export default datasetSlice.reducer;
