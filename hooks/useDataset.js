/**
 * useDataset Hook - Dataset Management
 * Fetches and manages available datasets for the current company
 * Datasets are retrieved from experiments' metadata paths
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

export default function useDataset() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [datasets_name_list, setDatasetsNameList] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const hasFetchedRef = useRef(false);

  // Get company from auth slice
  const company = useSelector((state) => state.auth?.currentCompany || null);
  const experiments_list = useSelector((state) => state.vibe?.experiments_list || []);

  // Extract datasets from experiments metadata
  const extractDatasetsFromExperiments = useCallback((experimentsList) => {
    if (!Array.isArray(experimentsList) || experimentsList.length === 0) {
      return [];
    }

    const datasetsMap = new Map();
    
    experimentsList.forEach((experiment) => {
      // Check for datasets in experiment data
      if (experiment.data) {
        Object.keys(experiment.data).forEach((dataKey) => {
          const dataEntry = experiment.data[dataKey];
          if (dataEntry && dataEntry.dataset_info) {
            const { datasetName, datasetTag, sourceName, metaDataPath } = dataEntry.dataset_info;
            if (datasetName && !datasetsMap.has(datasetName)) {
              datasetsMap.set(datasetName, {
                name: datasetName,
                datasetName,
                tag: datasetTag || 'base',
                source: sourceName || 'Unknown',
                metadataPath: metaDataPath,
                experimentId: experiment.experimentID || experiment.id,
                sampleDataPath: dataEntry.sample_data_path,
              });
            }
          }
        });
      }
    });

    return Array.from(datasetsMap.values());
  }, []);

  // Fetch all datasets for current company
  // ⭐ FIX: Datasets are ONLY extracted from experiments, no separate API call
  const fetchDatasets = useCallback(async (force = false) => {
    console.log('🔍 [useDataset] fetchDatasets called, force:', force);
    console.log('   Company:', company?.companyID);
    console.log('   Experiments:', experiments_list?.length || 0);
    console.log('   Current datasets:', datasets.length);
    
    // Already fetched and not forcing - return early
    if (!force && hasFetchedRef.current && datasets.length > 0) {
      console.log('✅ [useDataset] Using cached datasets:', datasets.length);
      return;
    }

    if (!company?.companyID) {
      console.log('⚠️ [useDataset] No company ID available');
      return;
    }

    // Mark as fetched immediately to prevent duplicate calls
    hasFetchedRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      // ⭐ CRITICAL: Extract datasets from experiments that have been loaded
      // This matches tg-application - datasets come FROM experiments, not separate API
      const extractedDatasets = extractDatasetsFromExperiments(experiments_list);
      
      console.log('📊 [useDataset] Datasets extracted from experiments:', extractedDatasets.length);
      console.log('   Dataset names:', extractedDatasets.map(d => d.datasetName).join(', '));
      
      setDatasets(extractedDatasets);
      setDatasetsNameList(extractedDatasets.map(d => d.datasetName));
      setLoading(false);
      console.log('✅ [useDataset] Datasets set successfully');
    } catch (err) {
      console.error('❌ [useDataset] Error:', err);
      setError(err.message);
      setDatasets([]);
      setDatasetsNameList([]);
      setLoading(false);
    }
  }, [company?.companyID, experiments_list, extractDatasetsFromExperiments, datasets.length]);

  // ⭐ FIX: Auto-extract datasets when experiments list changes
  // Only update if experiments_list changes, not on every render
  useEffect(() => {
    console.log('🔄 [useDataset] Experiments changed, count:', experiments_list?.length || 0);
    console.log('   Company:', company?.companyID);
    
    if (experiments_list && experiments_list.length > 0 && company?.companyID) {
      const extractedDatasets = extractDatasetsFromExperiments(experiments_list);
      console.log('📊 [useDataset] Extracted datasets:', extractedDatasets.length);
      
      if (extractedDatasets.length > 0) {
        setDatasets(extractedDatasets);
        setDatasetsNameList(extractedDatasets.map(d => d.datasetName));
        hasFetchedRef.current = true; // Mark as fetched
        console.log('✅ [useDataset] Datasets auto-extracted:', extractedDatasets.map(d => d.datasetName).join(', '));
      } else {
        console.warn('⚠️ [useDataset] No datasets found in experiments');
      }
    } else if (experiments_list?.length === 0) {
      console.warn('⚠️ [useDataset] Experiments list is empty');
    }
  }, [experiments_list, company?.companyID, extractDatasetsFromExperiments]);

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