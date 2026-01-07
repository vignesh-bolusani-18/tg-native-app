import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  workflows_list: [],
  openCreateWorkflowModal: false,
  workflowForm: {
    workflowName: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    frequency: "daily",
    time: {
      hours: "12",
      minutes: "00",
      period: "AM"
    },
    selectedDays: [],
    monthlyDate: "1"
  },
  workflowLoading: false,
  workflowsListLoading: false,
};

const workflowSlice = createSlice({
  name: "workflow",
  initialState,
  reducers: {
    loadWorkflows(state, action) {
      state.workflows_list = action.payload;
    },
    setOpenCreateWorkflowModal(state, action) {
      state.openCreateWorkflowModal = action.payload;
    },
    updateWorkflowForm(state, action) {
      const { field, value } = action.payload;
      if (field === "time") {
        state.workflowForm.time = value;
      } else {
        state.workflowForm[field] = value;
      }
    },
    clearWorkflowForm(state) {
      state.workflowForm = initialState.workflowForm;
    },
    setWorkflowLoading(state, action) {
      state.workflowLoading = action.payload;
    },
    setWorkflowsListLoading(state, action) {
      state.workflowsListLoading = action.payload;
    }
  },
});

export const {
  loadWorkflows,
  setOpenCreateWorkflowModal,
  updateWorkflowForm,
  clearWorkflowForm,
  setWorkflowLoading,
  setWorkflowsListLoading,
} = workflowSlice.actions;

export default workflowSlice.reducer; 