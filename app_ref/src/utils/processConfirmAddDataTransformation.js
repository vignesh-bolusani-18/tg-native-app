import { processJsonWithContext } from "./processJsonWithContext.js";

/**
 * Updates config values based on confirm_add_data_transformation rules
 * @param {Object} loadedDatasets - The loaded datasets object
 * @param {Object} config - The config object to update
 * @param {Object} confirmAddDataTransformation - The transformation rules
 * @returns {Object} Updated config object
 */
export const processConfirmAddDataTransformation = (
  loadedDatasets,
  config,
  confirmAddDataTransformation
) => {
  console.log("Loaded datasets:", loadedDatasets);
  console.log("Config:", config);
  console.log("Confirm add data transformation:", confirmAddDataTransformation);

  // Create a deep copy of config to avoid mutating the original
  const updatedConfig = JSON.parse(JSON.stringify(config));

  // Create context for script evaluation
  const context = {
    loadedDatasets,
    config: updatedConfig,
  };

  // Process each transformation rule
  for (const [key, rule] of Object.entries(confirmAddDataTransformation)) {
    const { path, value } = rule;

    // Get the resolved value using processJsonWithContext
    const { resolvedValue } = processJsonWithContext(
      { resolvedValue: value },
      context
    );

    console.log(`Processing ${key}:`);
    console.log("Original value:", value);
    console.log("Resolved value:", resolvedValue);

    // If no value was resolved, skip this rule
    if (!resolvedValue || resolvedValue === value) {
      console.log("Skipping - no resolution");
      continue;
    }

    // Split the path into parts
    const pathParts = path.split(".");

    // Navigate to the target location in config
    let current = updatedConfig;
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {};
      }
      current = current[pathParts[i]];
    }

    const lastPart = pathParts[pathParts.length - 1];
    const originalValue = current[lastPart];

    console.log("Original value at path:", originalValue);

    // Handle type matching
    if (Array.isArray(originalValue)) {
      // If original is array, ensure new value is array
      current[lastPart] = Array.isArray(resolvedValue)
        ? resolvedValue
        : [resolvedValue];
    } else if (typeof originalValue === "object" && originalValue !== null) {
      // If original is object, merge with new value
      current[lastPart] = { ...originalValue, ...resolvedValue };
    } else {
      // For primitive values, use the resolved value directly
      current[lastPart] = resolvedValue;
    }

    console.log("Updated value:", current[lastPart]);
    console.log("---");
  }
  console.log("Updated config:", updatedConfig);
  return updatedConfig;
};

// Test function
const testProcessConfirmAddDataTransformation = () => {
  // Sample loaded datasets
  const loadedDatasets = {
    customer_transaction: [
      {
        field_tags: {
          timestamp_column: "InvoiceDate",
          target_column: "Quantity",
          id_columns: ["CustomerID"],
        },
      },
    ],
  };

  // Sample config
  const config = {
    etl: {
      transaction_cols: {
        date_: "",
        value_cols: [],
        days_since_features: [],
        base_features: {
          features: [],
        },
      },
    },
  };

  // Sample transformation rules
  const confirmAddDataTransformation = {
    date_: {
      path: "etl.transaction_cols.date_",
      value:
        "Script(return loadedDatasets.customer_transaction[0].field_tags.timestamp_column)",
    },
    value_cols: {
      path: "etl.transaction_cols.value_cols",
      value:
        "Script(return loadedDatasets.customer_transaction[0].field_tags.target_column)",
    },
    days_since_features: {
      path: "etl.transaction_cols.days_since_features",
      value:
        "Script(return loadedDatasets.customer_transaction[0].field_tags.id_columns)",
    },
    base_features: {
      path: "etl.transaction_cols.base_features.features",
      value:
        "Script(return loadedDatasets.customer_transaction[0].field_tags.target_column)",
    },
  };

  console.log("Input loadedDatasets:", JSON.stringify(loadedDatasets, null, 2));
  console.log("Input config:", JSON.stringify(config, null, 2));
  console.log(
    "Input transformation rules:",
    JSON.stringify(confirmAddDataTransformation, null, 2)
  );
  console.log("\nProcessing...\n");

  // Process the transformation
  const result = processConfirmAddDataTransformation(
    loadedDatasets,
    config,
    confirmAddDataTransformation
  );

  console.log("\nFinal Result:");
  console.log(JSON.stringify(result, null, 2));
};

// Run the test
//testProcessConfirmAddDataTransformation();
