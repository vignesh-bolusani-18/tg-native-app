/**
 * useExperiment Hook - Experiment Management
 * Fetches and manages experiments for the current company
 */

import { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllExperiments, getExperimentById } from '../utils/getExperiments';
import { 
  setExperimentsList, 
  setSelectedAnalysisExperiment,
  clearSelectedAnalysisExperiment 
} from '../redux/slices/vibeSlice';

export default function useExperiment() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasFetchedRef = useRef(false);

  // Get from Redux - company from auth slice
  const experiments_list = useSelector((state) => state.vibe?.experiments_list || []);
  const selectedAnalysisExperiment = useSelector((state) => state.vibe?.selectedAnalysisExperiment || null);
  const company = useSelector((state) => state.auth?.currentCompany || null);
  const currentExperiment = useSelector((state) => state.experiment?.current || null);
  const loadedDatasets = useSelector((state) => state.experiment?.datasets || {});

  const mandatoryDatasetTags = ['sales', 'inventory'];

  // Fetch all experiments for current company
  const fetchExperiments = useCallback(async (force = false) => {
    if (!company?.companyID) {
      console.log('[useExperiment] No company ID available');
      return [];
    }

    // Prevent duplicate fetches
    if (!force && hasFetchedRef.current && experiments_list.length > 0) {
      return experiments_list;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await getAllExperiments(company.companyID);
      
      if (response && response.experiments) {
        dispatch(setExperimentsList(response.experiments));
        hasFetchedRef.current = true;
        setLoading(false);
        return response.experiments;
      } else if (Array.isArray(response)) {
        dispatch(setExperimentsList(response));
        hasFetchedRef.current = true;
        setLoading(false);
        return response;
      }
      
      setLoading(false);
      return [];
    } catch (err) {
      console.error('[useExperiment] Error fetching experiments:', err);
      setError(err.message);
      setLoading(false);
      return [];
    }
  }, [company?.companyID, dispatch, experiments_list]);

  // Get a single experiment by ID
  const getExperiment = useCallback(async (experimentId) => {
    if (!experimentId) return null;
    
    setLoading(true);
    try {
      const experiment = await getExperimentById(experimentId);
      setLoading(false);
      return experiment;
    } catch (err) {
      console.error('[useExperiment] Error getting experiment:', err);
      setError(err.message);
      setLoading(false);
      return null;
    }
  }, []);

  // Get completed experiments suitable for analysis
  const getCompletedExperiments = useCallback(() => {
    if (!experiments_list || experiments_list.length === 0) {
      return [];
    }
    
    return experiments_list.filter(
      (exp) =>
        !exp.inTrash &&
        exp.experimentStatus === 'Completed' &&
        !exp.isArchive &&
        ['demand-planning', 'inventory-optimization', 'price-promotion-optimization'].includes(
          exp.experimentModuleName
        )
    );
  }, [experiments_list]);

  // Select an experiment for analysis
  const selectExperiment = useCallback((experiment) => {
    if (experiment) {
      dispatch(setSelectedAnalysisExperiment(experiment));
    }
  }, [dispatch]);

  // Clear selected experiment
  const clearExperiment = useCallback(() => {
    dispatch(clearSelectedAnalysisExperiment());
  }, [dispatch]);

  // Mock create experiment (for future use)
  const createExperiment = useCallback(async (experimentData) => {
    setLoading(true);
    try {
      console.log('[useExperiment] Creating experiment:', experimentData);
      setLoading(false);
      return { success: true, experimentId: Date.now().toString() };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  // Mock update experiment (for future use)
  const updateExperiment = useCallback(async (experimentId, updates) => {
    setLoading(true);
    try {
      console.log('[useExperiment] Updating experiment:', experimentId, updates);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false };
    }
  }, []);

  // Mock delete experiment (for future use)
  const deleteExperiment = useCallback(async (experimentId) => {
    setLoading(true);
    try {
      console.log('[useExperiment] Deleting experiment:', experimentId);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false };
    }
  }, []);

  // Discard current experiment (reset state)
  const discardExperiment = useCallback(() => {
    console.log('[useExperiment] Discarding experiment');
    dispatch(clearSelectedAnalysisExperiment());
  }, [dispatch]);

  return {
    // State
    currentExperiment,
    experiments_list,
    selectedAnalysisExperiment,
    loadedDatasets,
    mandatoryDatasetTags,
    loading,
    error,
    
    // Actions
    fetchExperiments,
    getExperiment,
    getCompletedExperiments,
    selectExperiment,
    clearExperiment,
    createExperiment,
    updateExperiment,
    deleteExperiment,
    discardExperiment,
  };
}
