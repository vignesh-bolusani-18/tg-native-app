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

  // ⭐ FIX: Fetch all experiments for current company with improved caching
  const fetchExperiments = useCallback(async (force = false) => {
    console.log('🔍 [useExperiment] fetchExperiments called');
    console.log('   Company:', company?.companyID);
    console.log('   Force:', force);
    console.log('   HasFetched:', hasFetchedRef.current);
    console.log('   Cached count:', experiments_list.length);
    
    if (!company?.companyID) {
      console.log('⚠️ [useExperiment] No company ID available');
      return [];
    }

    // ⭐ CRITICAL: Prevent duplicate fetches unless forced
    if (!force && hasFetchedRef.current && experiments_list.length > 0) {
      console.log('✅ [useExperiment] Using cached experiments:', experiments_list.length);
      return experiments_list;
    }

    console.log('🚀 [useExperiment] Fetching experiments from backend...');
    console.log('   Company ID:', company.companyID);
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAllExperiments(company.companyID);
      console.log('📦 [useExperiment] Response received:', response ? 'yes' : 'no');
      console.log('   Response type:', typeof response);
      console.log('   Is array:', Array.isArray(response));
      
      // Handle different response structures
      let experimentsList = [];
      
      if (response) {
        // Case 1: response.experiments (most common)
        if (response.experiments && Array.isArray(response.experiments)) {
          experimentsList = response.experiments;
          console.log('✅ [useExperiment] Found response.experiments:', experimentsList.length);
        }
        // Case 2: Direct array response
        else if (Array.isArray(response)) {
          experimentsList = response;
          console.log('✅ [useExperiment] Direct array response:', experimentsList.length);
        }
        // Case 3: response.data.experiments
        else if (response.data && Array.isArray(response.data.experiments)) {
          experimentsList = response.data.experiments;
          console.log('✅ [useExperiment] Found response.data.experiments:', experimentsList.length);
        }
        // Case 4: response.data as array
        else if (Array.isArray(response.data)) {
          experimentsList = response.data;
          console.log('✅ [useExperiment] Found response.data array:', experimentsList.length);
        }
        else {
          console.warn('⚠️ [useExperiment] Unknown response structure');
          console.log('   Available keys:', Object.keys(response).join(', '));
        }
      }
      
      if (experimentsList.length > 0) {
        console.log('✅ [useExperiment] Experiments found:', experimentsList.length);
        console.log('   First experiment keys:', Object.keys(experimentsList[0]).join(', '));
        console.log('   Experiment IDs:', experimentsList.slice(0, 3).map(e => e.experimentID || e.id || 'no-id').join(', '));
        
        // ⭐ DEBUG: Log first experiment details to verify flattening worked
        const first = experimentsList[0];
        console.log('   First experiment status:', first.experimentStatus, '(type:', typeof first.experimentStatus, ')');
        console.log('   First experiment module:', first.experimentModuleName);
        console.log('   First experiment inTrash:', first.inTrash);
      } else {
        console.warn('⚠️ [useExperiment] No experiments in response');
      }
      
      dispatch(setExperimentsList(experimentsList));
      hasFetchedRef.current = true;
      setLoading(false);
      return experimentsList;
    } catch (err) {
      console.error('❌ [useExperiment] Error fetching experiments:', err);
      console.error('   Error details:', err.message);
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

  // Upload metadata to S3 - used by DataUploadSection
  const uploadMetadataToS3 = useCallback(async ({ metaData, path }) => {
    try {
      console.log('[useExperiment] Uploading metadata to S3:', path);
      // For now, we'll use a simple fetch to the backend
      // The backend should handle the actual S3 upload
      const { apiConfig } = await import('../utils/apiConfig');
      const { getItem } = await import('../utils/storage');
      const { getAccessToken } = await import('../utils/getAccessToken');
      
      const refreshToken = await getItem('refresh_token_company') || await getItem('refresh_token');
      let accessToken = null;
      if (refreshToken) {
        try {
          accessToken = await getAccessToken(refreshToken);
        } catch (e) {
          console.warn('[useExperiment] Could not get access token:', e.message);
        }
      }

      const response = await fetch(`${apiConfig.apiBaseURL}/upload-metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiConfig.apiKey || '',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ metaData, path }),
      });

      if (!response.ok) {
        throw new Error(`Failed to upload metadata: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('[useExperiment] Error uploading metadata:', err);
      throw err;
    }
  }, []);

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
    uploadMetadataToS3,
  };
}
