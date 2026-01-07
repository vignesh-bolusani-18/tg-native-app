import { useDispatch, useSelector } from 'react-redux';
import { createScheduledJob, deleteScheduledJobAction } from '../redux/actions/scheduledJobActions';
import { loadScheduledJobs as loadScheduledJobsAction } from '../redux/actions/scheduledJobActions';

const useScheduledJob = () => {
  const dispatch = useDispatch();
  const {
    scheduled_jobs_list,
    loading: scheduledJobLoading,
    error: scheduledJobError,
  } = useSelector((state) => state.scheduledJobs);

  const createNewScheduledJob = async (userInfo, currentCompany, jobData) => {
    try {
      const response = await dispatch(createScheduledJob(userInfo, currentCompany, jobData));
      return response;
    } catch (error) {
      console.error('Error creating scheduled job:', error);
      throw error;
    }
  };

  const loadScheduledJobs = async (userInfo) => {
    try {
      const response = await dispatch(loadScheduledJobsAction(userInfo));
      return response;
    } catch (error) {
      console.error('Error loading scheduled jobs:', error);
      throw error;
    }
  };

  const deleteScheduledJob = async (scheduledJobID, workflowID) => {
    try {
      const response = await dispatch(deleteScheduledJobAction(scheduledJobID, workflowID));
      return response;
    } catch (error) {
      console.error('Error deleting scheduled job:', error);
      throw error;
    }
  };

  return {
    scheduled_jobs_list,
    scheduledJobLoading,
    scheduledJobError,
    createNewScheduledJob,
    loadScheduledJobs,
    deleteScheduledJob
  };
};

export default useScheduledJob; 