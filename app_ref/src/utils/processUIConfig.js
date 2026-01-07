import { processJsonWithContext } from './processJsonWithContext';

/**
 * Processes and combines the next best offer configuration files into a final configuration.
 * This function takes the base config and the three reference files (allTags, allContextFeatures, allAdvancedSettings)
 * and uses processJsonWithContext to resolve all references and create the final configuration.
 * 
 * @param {Object} config - The base next_best_offer_ui_config.json
 * @param {Object} allTags - The allTags.json configuration
 * @param {Object} allContextFeatures - The allContextFeatures.json configuration
 * @param {Object} allAdvancedSettings - The allAdvancedSettings.json configuration
 * @returns {Object} The processed final configuration
 */
export const processUIConfig = (config, allTags, allContextFeatures, allAdvancedSettings) => {
  // Create the context object with all our configuration files
  const context = {
    allTags,
    allContextFeatures,
    allAdvancedSettings,
    config
  };

  // Process the configuration using processJsonWithContext
  const processedConfig = processJsonWithContext(config, context);

  // Helper function to resolve references in arrays
  const resolveArrayReferences = (array) => {
    if (!Array.isArray(array)) return array;
    return array.map(item => {
      if (typeof item === 'string') {
        // Handle references like "allTags.timestamp_column"
        const [file, key] = item.split('.');
        if (file === 'allTags' && allTags[key]) {
          return allTags[key];
        } else if (file === 'allContextFeatures' && allContextFeatures[key]) {
          return allContextFeatures[key];
        } else if (file === 'allAdvancedSettings' && allAdvancedSettings[key]) {
          return allAdvancedSettings[key];
        }
      }
      return item;
    });
  };

  // Process arrays in the configuration
  const processArrays = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    const processed = { ...obj };

    // Process all properties
    Object.keys(processed).forEach(key => {
      if (Array.isArray(processed[key])) {
        processed[key] = resolveArrayReferences(processed[key]);
      } else if (typeof processed[key] === 'object') {
        processed[key] = processArrays(processed[key]);
      }
    });

    return processed;
  };

  // Final processing of arrays
  const finalConfig = processArrays(processedConfig);

  return finalConfig;
};

// Example usage:
/*
const config = {
  dataset_config: {
    customer_transaction: {
      dataStepConfig: {
        grouping_columns: ["allTags.timestamp_column", "allTags.id_columns"]
      }
    }
  }
};

const allTags = {
  timestamp_column: {
    label: "Date",
    isMultiSelect: false,
    inputType: "AutoComplete",
    path: "field_tags.timestamp_column",
    showLabel: true,
    xs: 12,
    md: 6
  }
};

const allContextFeatures = {
  prediction_start_date: {
    component: "DatePicker",
    target: "context",
    is_enabled: true,
    label: "Prediction Start Date",
    path: "etl.pred_st_dt",
    showLabel: true,
    required: false,
    xs: 6,
    md: 4
  }
};

const allAdvancedSettings = {
  model_type: {
    component: "AutoComplete",
    target: "advanced_settings",
    is_enabled: true,
    showLabel: true,
    placeholder: "Select model type",
    label: "Model Type",
    isMultiSelect: false,
    values: ["classification", "regression"],
    path: "model.model_type",
    xs: 12,
    md: 6
  }
};

const finalConfig = processNextBestOfferConfig(config, allTags, allContextFeatures, allAdvancedSettings);
console.log(JSON.stringify(finalConfig, null, 2));
*/ 