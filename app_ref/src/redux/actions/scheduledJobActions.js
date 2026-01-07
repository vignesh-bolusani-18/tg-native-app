import { setLoading, setError, addScheduledJob, setScheduledJobs, removeScheduledJob } from '../slices/scheduledJobsSlice';
import { addScheduledJobToDatabase, deleteScheduledJob } from '../../utils/createDBEntry';
import { getScheduledJobsByCompany } from '../../utils/getScheduledJobs';
import { processTokens, verifyScheduledJobsResponse } from '../../utils/jwtUtils';

export const createScheduledJob = (userInfo, currentCompany, jobData) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));

      // Add company and user info to job data
      const scheduledJobData = {
        ...jobData
      };

      // Add to database
      const response = await addScheduledJobToDatabase(scheduledJobData);

      // Add to Redux store
      dispatch(addScheduledJob(response));
      dispatch(setLoading(false));

      return response;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  };
};

export const loadScheduledJobs = (userInfo) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));

      // Fetch scheduled jobs from database
      const response = await getScheduledJobsByCompany(userInfo.userID);
      const verifiedScheduledJobs = await verifyScheduledJobsResponse(response, userInfo.userID);
    
      const sortedScheduledJobs = verifiedScheduledJobs.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  
      // Update Redux store
      dispatch(setScheduledJobs(sortedScheduledJobs));
      dispatch(setLoading(false));

      return response;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  };
};

export const deleteScheduledJobAction = (scheduledJobID, workflowID) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));

      // Delete from database
      const response = await deleteScheduledJob(scheduledJobID, workflowID);

      // Remove from Redux store
      dispatch(removeScheduledJob(scheduledJobID));
      dispatch(setLoading(false));

      return response;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  };
}; 
