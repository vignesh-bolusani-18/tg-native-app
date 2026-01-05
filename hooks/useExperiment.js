/**
 * useExperiment Hook - Experiment Management
 */

import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';

export default function useExperiment() {
  // const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data for now
  const currentExperiment = useSelector((state) => state.experiment?.current || null);
  const experiments = useSelector((state) => state.experiment?.list || []);
  const loadedDatasets = useSelector((state) => state.experiment?.datasets || {});

  const mandatoryDatasetTags = ['sales', 'inventory'];

  const createExperiment = useCallback(async (experimentData) => {
    setLoading(true);
    try {
      // API call would go here
      console.log('Creating experiment:', experimentData);
      setLoading(false);
      return { success: true, experimentId: Date.now().toString() };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  const updateExperiment = useCallback(async (experimentId, updates) => {
    setLoading(true);
    try {
      console.log('Updating experiment:', experimentId, updates);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false };
    }
  }, []);

  const deleteExperiment = useCallback(async (experimentId) => {
    setLoading(true);
    try {
      console.log('Deleting experiment:', experimentId);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false };
    }
  }, []);

  return {
    currentExperiment,
    experiments,
    loadedDatasets,
    mandatoryDatasetTags,
    loading,
    error,
    createExperiment,
    updateExperiment,
    deleteExperiment,
  };
}
