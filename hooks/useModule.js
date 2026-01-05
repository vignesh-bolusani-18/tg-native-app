/**
 * useModule Hook - Module Management
 */

import { useCallback, useState } from 'react';

export default function useModule() {
  const [contextConfig, setContextConfig] = useState({
    scenario_plan: {
      inventory_constraints: {
        stock_transfer_level: 'None',
        stock_transfer_facility: 'None',
        stock_transfer_zone: [],
        disaggregation_type: 'simple_disaggregation',
      },
    },
  });

  const [contextBuckets] = useState({});
  const [loadedDatasets] = useState({});

  const getContextConfigFieldByPath = useCallback((path) => {
    const keys = path.split('.');
    let value = contextConfig;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return null;
    }
    return value;
  }, [contextConfig]);

  const updateContextConfigFieldByPath = useCallback((path, value) => {
    const keys = path.split('.');
    setContextConfig((prev) => {
      const newConfig = { ...prev };
      let current = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  }, []);

  const confirmContextGroup = useCallback((group) => {
    console.log('Confirming context group:', group);
  }, []);

  const confirmAddContext = useCallback((datasets) => {
    console.log('Confirming add context with datasets:', datasets);
  }, []);

  const createExperiment = useCallback(async (experimentData) => {
    console.log('Creating experiment:', experimentData);
    return { success: true, experimentId: Date.now().toString() };
  }, []);

  return {
    contextConfig,
    contextBuckets,
    loadedDatasets,
    getContextConfigFieldByPath,
    updateContextConfigFieldByPath,
    confirmContextGroup,
    confirmAddContext,
    createExperiment,
  };
}
