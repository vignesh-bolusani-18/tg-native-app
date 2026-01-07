import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  scheduled_jobs_list: [],
  loading: false,
  error: null,
};

const scheduledJobsSlice = createSlice({
  name: 'scheduledJobs',
  initialState,
  reducers: {
    setScheduledJobs: (state, action) => {
      state.scheduled_jobs_list = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    addScheduledJob: (state, action) => {
      state.scheduled_jobs_list.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    removeScheduledJob: (state, action) => {
      state.scheduled_jobs_list = state.scheduled_jobs_list.filter(
        job => job.jobID !== action.payload
      );
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setScheduledJobs, setLoading, setError, addScheduledJob, removeScheduledJob } = scheduledJobsSlice.actions;
export default scheduledJobsSlice.reducer; 