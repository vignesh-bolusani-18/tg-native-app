//Set the Datasets according to the moduleName
export const setDatasets = (moduleName, state) => {
  switch (moduleName) {
    case "supply_chain":
      state.mandatory_datasets_tags = ["sales"];
      break;
    case "demand-planning":
      state.mandatory_datasets_tags = ["sales"];
      break;
    case "replenishment":
      state.mandatory_datasets_tags = ["sales", "inventory"];
      break;
    case "inventory-optimization":
      state.mandatory_datasets_tags = ["sales", "inventory"];
      break;
    case "pricing-promotion-optimization":
      state.mandatory_datasets_tags = ["sales"];
      break;
    case "assortment":
      state.mandatory_datasets_tags = ["store", "product"];
      state.optional_datasets_tags = ["others", "sales", "inventory"];
      break;
    case "image_processing":
      state.mandatory_datasets_tags = ["images"];
      state.optional_datasets_tags = [];
      break;
    default:
      break;
  }
};

export const getDatasetObject = (tag) => {
  const datasetObject = {
    tag,
    title: "",
    description: "",
  };
  switch (tag) {
    case "sales":
      datasetObject.title = "Add Sales/Transaction Dataset";
      datasetObject.description =
        "Contains data on sales transactions and customer purchases.";
      break;
    case "inventory":
      datasetObject.title = "Add Inventory/SOH(Stock on Hand) Dataset";
      datasetObject.description =
        "Includes information about current stock levels and inventory status.";
      break;
    case "inventoryothers":
      datasetObject.title = "Add Supply Constraints";
      datasetObject.description =
        "Includes information about current stock levels and inventory status.";
      break;
    case "pricing":
      datasetObject.title = "Add SKU Pricing Dataset";
      datasetObject.description =
        "Details the pricing information for various SKUs.";
      break;
    case "store":
      datasetObject.title = "Add Store Fixtures Dimensions Dataset";
      datasetObject.description =
        "Provides dimensions and layout information for store fixtures.";
      break;
    case "product":
      datasetObject.title = "Add Product/SKU Dimensions Dataset";
      datasetObject.description =
        "Includes dimensions and attributes of products/SKUs.";
      break;
    case "images":
      datasetObject.title = "Add Raw Images";
      datasetObject.description =
        "Contains raw image files related to products or stores.";
      break;
    case "image_metadata":
      datasetObject.title = "Add Images Metadata";
      datasetObject.description =
        "Metadata associated with image files, including tags and descriptions.";
      break;
    case "others":
      datasetObject.title = "Add Causal Data";
      datasetObject.description =
        "Causal data and features that may influence outcomes.";
      break;
    case "item_master":
      datasetObject.title = "Add Item Master";
      datasetObject.description =
        "Item Master data that do not fit into other categories.";
      break;
    case "future":
      datasetObject.title = "Add Future Data";
      datasetObject.description =
        "Data related to future predictions or forecasts.";
      break;
    case "bom_mapping":
      datasetObject.title = "Add BOM Mapping";
      datasetObject.description =
        "Bill of Materials (BOM) mapping data for products.";
      break;
    case "bom_inventory":
      datasetObject.title = "Add BOM Inventory";
      datasetObject.description =
        "Inventory data related to the Bill of Materials (BOM).";
      break;
    case "bomothers":
      datasetObject.title = "Add BOM Additional Features";
      datasetObject.description =
        "Additional features related to the Bill of Materials (BOM).";
      break;
    case "forecast":
      datasetObject.title = "Add Forecast Data";
      datasetObject.description =
        "Additional Information about previous forecasts";
      break;
    case "new_product":
      datasetObject.title = "New Products";
      datasetObject.description = "Additional Information about New Products";
      break;
    case "simple_disaggregation_mapping":
      datasetObject.title = "Add Disaggregate Mapping";
      datasetObject.description =
        "Additional Information about Disaggregate Mapping";
      break;
    case "rewrite_forecast":
      datasetObject.title = "Add Forecast Rewrites";
      datasetObject.description =
        "Additional Information about Forecast Rewrites";
      break;
    default:
      datasetObject.title = "Unknown Dataset Tag";
      datasetObject.description =
        "The dataset tag provided does not match any known categories.";
      break;
  }
  return datasetObject;
};

// get tagFieldConfig

const getTagFieldByPath = (path, loadedDataset) => {
  const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
  let current = loadedDataset;

  for (let i = 0; i < pathParts.length; i++) {
    const key = pathParts[i];

    // Check if key is a numeric index
    const index = Number(key);
    if (!isNaN(index)) {
      // Handle array case
      if (!Array.isArray(current) || index >= current.length) {
        console.log(path, "not found!!!!!!!!!!!!!!!!!", "The index:=>>", key);
        return null;
      }
      current = current[index];
    } else {
      // Handle object case
      if (current[key] === undefined) {
        console.log(path, "not found!!!!!!!!!!!!!!!!!", "The key:=>>", key);
        return null;
      }
      current = current[key];
    }
  }

  // console.log("default value at :", path, "is ---> ", current);
  return current;
};

export const getColumnInUse = (loadedDataset, dataset_info) => {
  // Helper function to get value from loadedDataset by path
  console.log("Dataset Info", dataset_info);
  // Gather all tags from tagFieldConfigs
  let allTags = [];
  Object.values(dataset_info).forEach((dataset) => {
    console.log("Dataset", dataset);

    allTags = [
      ...allTags,
      ...dataset.tagFieldConfig.mandatory_tags,
      ...dataset.tagFieldConfig.optional_tags,
    ];
  });

  // Remove duplicates from allTags
  const uniqueTags = [...new Set(allTags)];
  console.log(uniqueTags);
  const columnSelected = [];

  // Iterate over each unique tag
  uniqueTags.forEach((tag) => {
    const tagValues = getTagFieldByPath(tag.path, loadedDataset);

    if (tag.isMultiSelect) {
      (tagValues || []).forEach((value) => {
        if (value !== null && value !== "null") {
          columnSelected.push(value);
        }
      });
    } else {
      if (tagValues !== null && tagValues !== "null") {
        columnSelected.push(tagValues);
      }
    }
  });

  // Get all columns from data_attributes
  const cols = loadedDataset.data_attributes.cols;

  // Filter out the columns that are not selected
  const columnInUse = cols.filter((col) => !columnSelected.includes(col));

  console.log("column in use: ", columnInUse);
  return columnInUse;
};

export const areMandatoryFieldsFilled = (
  tag,
  loadedDataset,
  tagFieldConfig
) => {
  const mandatoryTags = tagFieldConfig.mandatory_tags;
  let allFilled = true;
  let dateFormatMatches = true;

  mandatoryTags.forEach((tag) => {
    const tagValues = getTagFieldByPath(tag.path, loadedDataset);

    if (tag.isMultiSelect) {
      if (
        !tagValues ||
        tagValues.length === 0 ||
        tagValues.every((value) => value === null || value === "null")
      ) {
        allFilled = false;
      }
    } else {
      if (tagValues === null || tagValues === "null") {
        allFilled = false;
      }
    }
  });

  console.log("areFilled", allFilled);

  return allFilled;
};

export const updateDataBlock = (state, loadedDatasets, keysToSkip) => {
  // List of keys that should not be updated

  // Create a new state object to maintain immutability
  const newState = { ...state };
  console.log("config before updateDataBlock", newState);

  // Update the inventory column
  if (loadedDatasets.inventory && loadedDatasets.inventory.length > 0) {
    newState.data.inventory_column =
      loadedDatasets.inventory[0].field_tags.inventory_column;
  }

  // Helper function to remove duplicates from an array
  const removeDuplicates = (array) => [...new Set(array)];

  // Helper function to determine the type of the key and get values accordingly
  const getValue = (key) => {
    let values = [];

    for (const tag in loadedDatasets) {
      loadedDatasets[tag].forEach((dataset) => {
        if (dataset.field_tags[key] !== undefined) {
          const fieldValue = dataset.field_tags[key];
          if (fieldValue && fieldValue !== "None") {
            values.push(fieldValue);
          }
        }
      });
      //   if (
      //     loadedDatasets[tag].length > 0 &&
      //     loadedDatasets[tag][0].field_tags[key] !== undefined
      //   ) {
      //     const fieldValue = loadedDatasets[tag][0].field_tags[key];
      //     if (fieldValue && fieldValue !== "None") {
      //       values.push(fieldValue);
      //     }
      //   }
    }

    if (values.length === 0) return null;

    // Determine if the key represents a list or a single value
    const isList = values.some((value) => Array.isArray(value));

    if (isList) {
      return removeDuplicates(values.flat());
    } else {
      return values.length > 0 ? values[0] : null;
    }
  };

  // Helper function to combine aggregation and fillNA from all datasets
  const combineAggregationsAndFillNA = () => {
    const combinedAggregations = {};
    const combinedFillNA = {};

    for (const tag in loadedDatasets) {
      if (loadedDatasets[tag].length > 0) {
        loadedDatasets[tag].forEach((dataset) => {
          dataset.data_steps.forEach((step) => {
            if (step.operation === "aggregate_data") {
              // Combine aggregations
              const { aggregations, in_aggregation } = step.kwargs;
              for (const key in aggregations) {
                if (
                  !combinedAggregations[key] &&
                  in_aggregation[key] === true &&
                  aggregations[key] !== "auto"
                ) {
                  combinedAggregations[key] = aggregations[key];
                } else if (combinedAggregations[key] !== aggregations[key]) {
                  // Handle conflict if needed
                }
              }

              // Combine fillNA
              const { fillNA } = step.kwargs;
              for (const key in fillNA) {
                if (!combinedFillNA[key] && combinedFillNA[key] !== "None") {
                  combinedFillNA[key] = fillNA[key];
                } else if (combinedFillNA[key] !== fillNA[key]) {
                  // Handle conflict if needed
                }
              }
            }
          });
        });
      }
    }

    return { combinedAggregations, combinedFillNA };
  };

  const { combinedAggregations, combinedFillNA } =
    combineAggregationsAndFillNA();

  console.log("Combined FillNA:", combinedFillNA);

  /* // Iterate over all keys in newState.data and update them with the value from getValue
  for (const key in newState.data) {
    if (!keysToSkip.includes(key)) {
      const value = getValue(key);
      if (value !== null) {
        newState.data[key] = value;
      }
    }
  }
 */
  // Update aggregation_method and fillna_method in newState.data
  newState.data.aggregation_method = {
    ...combinedAggregations,
  };
  newState.data.fillna_method = {
    value: { ...combinedFillNA },
  };

  if (newState?.scenario_plan?.post_model_demand_pattern?.dimensions) {
    const dimensionKey = "dimensions";
    if (
      newState.scenario_plan &&
      Array.isArray(
        newState.scenario_plan.post_model_demand_pattern[dimensionKey]
      )
    ) {
      const dimensionValues = getValue(dimensionKey);
      if (dimensionValues) {
        newState.scenario_plan.post_model_demand_pattern[dimensionKey] =
          // removeDuplicates([
          //   ...newState.scenario_plan.post_model_demand_pattern[dimensionKey],
          //   ...dimensionValues,
          // ]);
          removeDuplicates([...dimensionValues]);
      }
    }
  }
  // Update dimensions in scenario_plan
  console.log("config after updateDataBlock", newState);
  return newState;
};
