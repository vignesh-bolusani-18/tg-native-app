
import useModule from "./useModule";

const useUtility = () => {
  const {
    getConfigFieldByPath,
    getContextConfigFieldByPath,
    getAdjustDataFieldByPath,
    getEnrichmentFieldByPath,
    getExogenousFeatureFieldByPath,
    getDatePairFieldByPath,
    getExportPipelineFieldByPath,
    getImpactPipelineFieldByPath,
    getTagFieldByPath,
    getJoinFieldByPath,
    getFilterDataByPath,
  } = useModule();
  
 
const isFeatureMissing = (feature) => {
    
  const {target, path} = feature;
  
    let defaultValue;
  
    if (target === "tag") {
      defaultValue = getTagFieldByPath(path);
    } else if (target === "config") {
      defaultValue = getConfigFieldByPath(path);
    } else if (target === "join") {
      defaultValue = getJoinFieldByPath(path);
    } else if (target === "context") {
      defaultValue = getContextConfigFieldByPath(path);
    } else if (target === "adjust") {
      defaultValue = getAdjustDataFieldByPath(path);
    } else if (target === "filter") {
      defaultValue = getFilterDataByPath(path);
    } else if (target === "enrichment") {
      defaultValue = getEnrichmentFieldByPath(path);
    } else if (target === "exogenous") {
      defaultValue = getExogenousFeatureFieldByPath(path);
    } else if (target === "datePair") {
      defaultValue = getDatePairFieldByPath(path);
    } else if (target === "exports") {
      defaultValue = getExportPipelineFieldByPath(path);
    } else if (target === "impact") {
      defaultValue = getImpactPipelineFieldByPath(path);
    } else {
      defaultValue = null;
    }
  
    // Check if the value is missing
    if (defaultValue === null || 
        defaultValue === undefined || 
        defaultValue === "" || 
        defaultValue === "None" ||
        (Array.isArray(defaultValue) && defaultValue.length === 0)) {
      return true;
    }
  
    return false;
  };

  return {
    isFeatureMissing,
  };
};

export default useUtility;
