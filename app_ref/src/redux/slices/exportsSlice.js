// src/redux/slices/experimentSlice.js
import { createSlice, current } from "@reduxjs/toolkit";

const initialState = {
  export_pipelines_list: [],
  export_jobs_list: [],
  export_pipeline: {
    dataConnection: null,
    name: null,
    dataset: null,
    create_table: true,
    existing_table_name: "",
    create_query: "",
    insert_query: "",
    transform_query: "",
    create_query_language: "sql",
    insert_query_language: "sql",
    transform_query_language: "python",
    status: "Created",
  },
  export_job: null,
  create_step: 1,
  export_jobs_open: false,
};

const exportsSlice = createSlice({
  name: "exports",
  initialState,
  reducers: {
    loadExportPipelines(state, action) {
      state.export_pipelines_list = action.payload;
    },
    loadExportJobs(state, action) {
      state.export_jobs_list = action.payload;
    },
    updateExportPipelineByPath: (state, action) => {
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

      state.export_pipeline = updateNestedByPath(
        state.export_pipeline,
        path,
        value
      );
    },
    setDataConnectionInfo: (state, action) => {
      state.export_pipeline.dataConnection = action.payload;
    },

    setCreateQuery: (state, action) => {
      state.export_pipeline.create_query = action.payload;
    },

    setInsertQuery: (state, action) => {
      state.export_pipeline.insert_query = action.payload;
    },

    setTransformQuery: (state, action) => {
      state.export_pipeline.transform_query = action.payload;
    },

    setCreateStep: (state, action) => {
      state.create_step = action.payload;
    },
    setExportJobsOpen: (state, action) => {
      state.export_jobs_open = action.payload;
    },

    clearCache: (state, action) => {
      state.create_step = initialState.create_step;
      state.export_pipeline = initialState.export_pipeline;
      state.all_cols = initialState.all_cols;
      state.export_job = initialState.export_job;
    },

    setExportJob: (state, action) => {
      state.export_job = action.payload;
    },
  },
});

export const {
  loadExportJobs,
  loadExportPipelines,
  updateExportPipelineByPath,
  setDataConnectionInfo,
  setCreateQuery,
  setInsertQuery,
  setTransformQuery,
  setCreateStep,
  clearCache,
  setExportJobsOpen,
  setExportJob,
} = exportsSlice.actions;
export default exportsSlice.reducer;
