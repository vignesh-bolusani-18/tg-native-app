/**
 * useDataset Hook - Dataset Management
 * Fetches and manages available datasets for the current company
 */

import { useCallback, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { apiConfig } from '../utils/apiConfig';
import { getAccessToken } from '../utils/getAccessToken';

export default function useDataset() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [datasets_name_list, setDatasetsNameList] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const hasFetchedRef = useRef(false);

  // Get company from auth slice
  const company = useSelector((state) => state.auth?.currentCompany || null);

  // Fetch all datasets for current company
  const fetchDatasets = useCallback(async (force = false) => {
    if (!company?.companyID) {
      console.log('[useDataset] No company ID available');
      return [];
    }

    // Prevent duplicate fetches
    if (!force && hasFetchedRef.current && datasets.length > 0) {
      return datasets;
    }

    setLoading(true);
    setError(null);
    
    try {
      const accessToken = await getAccessToken();
      
      const response = await fetch(`${apiConfig.apiBaseURL}/getDatasetsList`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        },
        body: JSON.stringify({ companyID: company.companyID }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch datasets: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && Array.isArray(data.datasets)) {
        setDatasets(data.datasets);
        // Extract just the names for suggestions
        const names = data.datasets.map(d => d.datasetName || d.name).filter(Boolean);
        setDatasetsNameList(names);
        hasFetchedRef.current = true;
        setLoading(false);
        return data.datasets;
      } else if (Array.isArray(data)) {
        setDatasets(data);
        const names = data.map(d => d.datasetName || d.name || d).filter(Boolean);
        setDatasetsNameList(names);
        hasFetchedRef.current = true;
        setLoading(false);
        return data;
      }
      
      setLoading(false);
      return [];
    } catch (err) {
      console.error('[useDataset] Error fetching datasets:', err);
      setError(err.message);
      setLoading(false);
      
      // Return mock data for development/demo purposes
      const mockDatasets = [
        { id: '1', name: 'Titanic', datasetName: 'Titanic', path: 's3://datasets/titanic.csv' },
        { id: '2', name: 'Sales Data', datasetName: 'Sales Data', path: 's3://datasets/sales.csv' },
        { id: '3', name: 'Inventory', datasetName: 'Inventory', path: 's3://datasets/inventory.csv' },
        { id: '4', name: 'Customer Data', datasetName: 'Customer Data', path: 's3://datasets/customers.csv' },
        { id: '5', name: 'Product Catalog', datasetName: 'Product Catalog', path: 's3://datasets/products.csv' },
      ];
      setDatasets(mockDatasets);
      setDatasetsNameList(mockDatasets.map(d => d.name));
      hasFetchedRef.current = true;
      return mockDatasets;
    }
  }, [company?.companyID, datasets]);

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
