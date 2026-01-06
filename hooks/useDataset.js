/**
 * useDataset Hook - Dataset Management
 * ⭐ MATCHES tg-application: Fetches datasets from /datasetByCompany API
 * NOT extracted from experiments - uses dedicated endpoint
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getDatasets } from '../utils/getDatasets';

export default function useDataset() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [datasets_name_list, setDatasetsNameList] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const hasFetchedRef = useRef(false);

  // Get company from auth slice
  const company = useSelector((state) => state.auth?.currentCompany || null);
  const userInfo = useSelector((state) => state.auth?.user || null);

  // ⭐ MATCHES tg-application: Fetch datasets from dedicated API endpoint
  const fetchDatasets = useCallback(async (force = false) => {
    console.log('🔍 [useDataset] fetchDatasets called, force:', force);
    console.log('   Company:', company?.companyID);
    console.log('   Current datasets:', datasets.length);
    
    // Already fetched and not forcing - return early
    if (!force && hasFetchedRef.current && datasets.length > 0) {
      console.log('✅ [useDataset] Using cached datasets:', datasets.length);
      return datasets;
    }

    if (!company?.companyID) {
      console.log('⚠️ [useDataset] No company ID available');
      return [];
    }

    // Mark as fetched immediately to prevent duplicate calls
    hasFetchedRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      // ⭐ CRITICAL: Call /datasetByCompany API like tg-application
      // This is NOT extracted from experiments - it's a separate endpoint!
      console.log('🚀 [useDataset] Fetching datasets from API...');
      const response = await getDatasets(userInfo?.userID);
      
      let datasetsList = [];
      
      if (response && response.datasets && Array.isArray(response.datasets)) {
        datasetsList = response.datasets;
        console.log('✅ [useDataset] Found datasets:', datasetsList.length);
      } else if (Array.isArray(response)) {
        datasetsList = response;
        console.log('✅ [useDataset] Direct array response:', datasetsList.length);
      }
      
      if (datasetsList.length > 0) {
        console.log('   First dataset keys:', Object.keys(datasetsList[0]).join(', '));
        console.log('   Dataset names:', datasetsList.slice(0, 3).map(d => d.datasetName).join(', '));
      }
      
      setDatasets(datasetsList);
      setDatasetsNameList(datasetsList.map(d => d.datasetName));
      setLoading(false);
      console.log('✅ [useDataset] Datasets set successfully:', datasetsList.length);
      return datasetsList;
    } catch (err) {
      console.error('❌ [useDataset] Error fetching datasets:', err.message);
      setError(err.message);
      setDatasets([]);
      setDatasetsNameList([]);
      setLoading(false);
      return [];
    }
  }, [company?.companyID, userInfo?.userID, datasets.length]);

  // ⭐ Auto-fetch datasets when company changes
  useEffect(() => {
    if (company?.companyID && !hasFetchedRef.current) {
      console.log('🔄 [useDataset] Company available, fetching datasets...');
      fetchDatasets();
    }
  }, [company?.companyID, fetchDatasets]);

  // Get dataset by name
  const getDatasetByName = useCallback((name) => {
    return datasets.find(d => (d.datasetName || d.name) === name);
  }, [datasets]);

  // Add dataset to selection (dispatch to Redux)
  const addDatasetToSelection = useCallback((dataset) => {
    console.log('[useDataset] Adding dataset to selection:', dataset);
    // This will be handled by useVibe's addDatasetToSelection
  }, []);

  // Remove dataset from selection
  const removeDatasetFromSelection = useCallback((datasetName) => {
    console.log('[useDataset] Removing dataset from selection:', datasetName);
    // This will be handled by useVibe's removeDatasetFromSelection
  }, []);

  return {
    // State
    datasets,
    datasets_name_list,
    loading,
    error,
    
    // Actions
    fetchDatasets,
    getDatasetByName,
    addDatasetToSelection,
    removeDatasetFromSelection,
  };
}