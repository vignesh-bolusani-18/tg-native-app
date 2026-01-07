// src/redux/slices/impactSlice.js
import { createSlice, current } from "@reduxjs/toolkit";

const initialState = {
  impact_pipelines_list: [],
  openCreateImpactPipelineModal: false,
  impactPipelineForm: { name: "", tag: "", experimentIDs: [] },
  impactPipeline: {},
  impactPipelineLoading: false,
  currentImpactMetricsFeature: "all",
  currentImpactMetricsValue: "all",
  metricsAnalysisGraphMetrics: [],
};

const impactSlice = createSlice({
  name: "impact",
  initialState,
  reducers: {
    loadImpactPipelines(state, action) {
      state.impact_pipelines_list = action.payload;
    },
    setOpenCreateImpactPipelineModal(state, action) {
      state.openCreateImpactPipelineModal = action.payload;
    },
    updateImpactPipelineByPath: (state, action) => {
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

      state.impactPipelineForm = updateNestedByPath(
        state.impactPipelineForm,
        path,
        value
      );
    },
    setMetricsAnalysisGraphMetrics(state, action) {
      state.metricsAnalysisGraphMetrics = action.payload;
    },
    clearMetricsAnalysisGraphMetrics(state) {
      state.metricsAnalysisGraphMetrics = [];
    },
    clearImpactPipelineForm(state) {
      state.impactPipelineForm = { name: "", tag: "", experimentIDs: [] };
    },
    setImpactPipeline(state, action) {
      state.impactPipeline = action.payload;
      state.impactPipelineForm = {
        name: action.payload.impactPipelineName,
        tag: action.payload.impactPipelineTag,
        experimentIDs: action.payload.experimentIDs,
      };
    },
    clearImpactPipeline(state) {
      state.impactPipeline = {};
      state.impactPipelineForm = { name: "", tag: "", experimentIDs: [] };
    },
    setImpactPipelineLoading(state, action) {
      state.impactPipelineLoading = action.payload;
    },
    setCurrentImpactMetricsFeature(state, action) {
      state.currentImpactMetricsFeature = action.payload;
    },
    setCurrentImpactMetricsValue(state, action) {
      state.currentImpactMetricsValue = action.payload;
    },
    clearImpactPipelineData(state) {
      state.currentImpactMetricsFeature = "all";
      state.currentImpactMetricsValue = "all";
    },
  },
});

export const {
  loadImpactPipelines,
  setOpenCreateImpactPipelineModal,
  updateImpactPipelineByPath,
  clearImpactPipelineForm,
  setImpactPipeline,
  clearImpactPipeline,
  setImpactPipelineLoading,
  setCurrentImpactMetricsFeature,
  setCurrentImpactMetricsValue,
  clearImpactPipelineData,
  setMetricsAnalysisGraphMetrics,
  clearMetricsAnalysisGraphMetrics,
} = impactSlice.actions;
export default impactSlice.reducer;
