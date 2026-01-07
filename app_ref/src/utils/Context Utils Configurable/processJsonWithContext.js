/**
 * Processes a JSON object by evaluating script expressions and resolving context references.
 * This function can handle:
 * 1. Script expressions wrapped in Script(...)
 * 2. Direct references to context variables
 * 3. Nested path references to context properties
 * 4. Arrays and objects with any of the above
 *
 * @example
 * // Basic usage with script expressions
 * const result = processJsonWithContext({
 *   enabled: "Script(return config.settings.enabled;)",
 *   threshold: "Script(return config.settings.threshold;)"
 * }, context);
 *
 * @example
 * // Using direct context references
 * const result = processJsonWithContext({
 *   columns: "taggedColumns",
 *   config: "config"
 * }, context);
 *
 * @example
 * // Using nested path references
 * const result = processJsonWithContext({
 *   role: "state.currentUser.role",
 *   theme: "state.currentUser.preferences.theme"
 * }, context);
 *
 * @param {Object|Array|string|number|boolean} jsonObject - The object to process. Can be:
 *   - An object containing script expressions or context references
 *   - An array of values to process
 *   - A primitive value (returned as-is)
 * @param {Object} context - The context object containing variables and functions available for:
 *   - Script expressions (accessed via parameter names)
 *   - Direct references (accessed via string keys)
 *   - Nested path references (accessed via dot notation)
 * @returns {Object|Array|string|number|boolean} The processed object with:
 *   - Script expressions evaluated
 *   - Context references resolved
 *   - Nested paths resolved
 *   - Arrays and objects processed recursively
 *   - Primitive values preserved
 *
 * @throws {Error} If script evaluation fails, returns the original script content
 */
export const processJsonWithContext = (jsonObject, context) => {
  if (!jsonObject) return jsonObject;

  /**
   * Evaluates a script expression wrapped in Script(...)
   * @param {string} scriptContent - The script content to evaluate
   * @returns {*} The result of script evaluation or original content if evaluation fails
   * @private
   */
  const evaluateScript = (scriptContent) => {
    try {
      // Extract the script content from Script(...)
      const scriptMatch = scriptContent.match(/Script\((.*)\)/s);
      if (!scriptMatch) return scriptContent;

      const scriptBody = scriptMatch[1].trim();

      // Create parameter names from context keys
      const paramNames = Object.keys(context);

      // Create a function with dynamic parameters based on context
      const scriptFn = new Function(...paramNames, scriptBody);

      // Execute the script with all context values
      return scriptFn(...Object.values(context));
    } catch (error) {
      console.error("Error evaluating script:", error);
      return scriptContent; // Return original content if evaluation fails
    }
  };

  /**
   * Resolves a nested path reference in the context object
   * @param {string} path - The dot-notation path to resolve (e.g., "state.currentUser.role")
   * @returns {*} The resolved value or original path if resolution fails
   * @private
   */
  const resolveContextPath = (path) => {
    try {
      // Split the path into parts, handling array indices
      const parts = path.split(/\.|\[|\]/).filter(part => part !== '');
      
      // Start with the context object
      let value = context;
      
      // Traverse the path
      for (const part of parts) {
        // Handle array indices
        if (!isNaN(part)) {
          value = value[parseInt(part)];
        } else {
          value = value[part];
        }
        
        if (value === undefined) return path; // Return path if not found
      }
      return value;
    } catch (error) {
      return path; // Return path if any error occurs
    }
  };

  // Handle arrays
  if (Array.isArray(jsonObject)) {
    // If array contains strings that might be script expressions
    if (jsonObject.every((item) => typeof item === "string")) {
      const resolvedValues = new Set();

      for (const item of jsonObject) {
        let resolvedValue;
        if (item.startsWith("Script(")) {
          resolvedValue = evaluateScript(item);
        } else if (item in context) {
          resolvedValue = context[item];
        } else if (Object.keys(context).some(key => item.startsWith(`${key}.`))) {
          resolvedValue = resolveContextPath(item);
        } else {
          resolvedValue = item;
        }

        // If resolved value is an array, add all its elements
        if (Array.isArray(resolvedValue)) {
          resolvedValue.forEach((val) => resolvedValues.add(val));
        } else if (resolvedValue !== undefined) {
          resolvedValues.add(resolvedValue);
        } else {
          // If resolution failed, keep original value
          resolvedValues.add(item);
        }
      }

      return Array.from(resolvedValues);
    }

    // Handle regular arrays
    return jsonObject.map((item) => processJsonWithContext(item, context));
  }

  // Handle objects
  if (typeof jsonObject === "object") {
    const processed = {};

    for (const [key, value] of Object.entries(jsonObject)) {
      if (typeof value === "string") {
        if (value.startsWith("Script(")) {
          // Handle script expressions
          processed[key] = evaluateScript(value);
        } else if (value in context) {
          // Handle direct context variable references
          processed[key] = context[value];
        } else if (value.includes(".")) {
          // Handle nested context paths
          processed[key] = resolveContextPath(value);
        } else {
          // Keep other string values as is
          processed[key] = value;
        }
      } else if (typeof value === "object") {
        // Recursively process nested objects and arrays
        processed[key] = processJsonWithContext(value, context);
      } else {
        // Keep other values as is
        processed[key] = value;
      }
    }

    return processed;
  }

  // Return primitive values as is
  return jsonObject;
};

// Quick demo to verify core functionality
const demonstrateCapabilities = () => {
  const context = {
    taggedColumns: ["product_id", "store_id", "date", "price"],
    config: {
      data: {
        inventory_column: "inventory_id"
      },
      etl: {
        loaded_datasets: {
          inventory: [
            {
              field_tags: {
                replenishment_columns: [
                  "replenishment_id",
                  "order_quantity",
                  "inventory_id"
                ]
              }
            }
          ]
        }
      },
      settings: {
        enabled: true,
        threshold: 0.8,
      }
    },
    utils: {
      formatPrice: (price) => `$${price.toFixed(2)}`,
    },
    state: {
      currentUser: {
        role: "admin",
        preferences: { theme: "dark" },
      },
    },
  };

  const demoObject = {
    // Test basic script evaluation
    basic: {
      isEnabled: "Script(return config.settings.enabled;)",
      threshold: "Script(return config.settings.threshold;)",
    },
    // Test array handling
    columns: "taggedColumns",
    // Test direct context references
    config_copy: "config",
    role: "state.currentUser.role",
    values : "Script(return config.etl.loaded_datasets.sales[0].field_tags.replenishment_columns ?? [];)",
    theme: "state.currentUser.preferences.theme",
    // Test complex script with multiple operations
    priceInfo: {
      formattedPrice: "Script(return utils.formatPrice(100);)",
      isAdmin: "Script(return state.currentUser.role === 'admin';)",
      theme: "Script(return state.currentUser.preferences.theme;)",
    },
    // Test allContextFields processing
    allContextFields: [
      "config.data.inventory_column",
      "config.etl.loaded_datasets.inventory[0].field_tags.replenishment_columns",
      "running_purchase_order",
      "MOQ"
    ],
    // Test nested array processing with script
    nestedArrays: {
      columns: "Script(const cols = config.etl.loaded_datasets.inventory[0].field_tags.replenishment_columns; return [...cols, 'additional_col'];)"
    },
    // Test combining multiple context references
    combinedReferences: {
      combinedColumns: "Script(const inventoryCol = config.data.inventory_column; const replenishmentCols = config.etl.loaded_datasets.inventory[0].field_tags.replenishment_columns; return [inventoryCol, ...replenishmentCols];)"
    }
  };

  const demoObject2 = {
    values: "Script(return config?.etl?.loaded_datasets?.sales?.[0]?.field_tags?.replenishment_columns ?? [];)",
    values2 :[
      "Script(return config?.etl?.loaded_datasets?.sales?.[0]?.field_tags?.replenishment_columns ?? [];)",
      "Hi"
    ]
  }

  // Process the demo object
  const processedDemo = processJsonWithContext(demoObject2, context);

  console.log("\nQuick Demo Results:\n ===========================");
  console.log(JSON.stringify(processedDemo, null, 2));
};

// Run the demo
demonstrateCapabilities();
