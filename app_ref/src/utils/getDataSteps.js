import { allTags } from "./allTags";

export const getDataSteps = (tag, loadedDataset) => {
  console.log("Tag", tag);
  console.log("Loaded Dataset", loadedDataset);
  const getDefaultAggregations = (
    tags,
    existingAggregations,
    existingInAggregation
  ) => {
    console.log("existingAggregation:", existingAggregations);
    const aggregations = {};
    const in_aggregation = {};
    tags.forEach((tag) => {
      const values = getTagFieldByPath(tag.path);
      if (!values) return;
      if (tag.isMultiSelect) {
        console.log("It's multi select", tag.label);
        values.forEach((value) => {
          if (value) {
            if (existingAggregations.hasOwnProperty(value)) {
              aggregations[value] = existingAggregations[value];
            } else {
              aggregations[value] = tag.default_aggregate_option;
            }
          }
          if (value) {
            if (existingInAggregation.hasOwnProperty(value)) {
              in_aggregation[value] = existingInAggregation[value];
            } else {
              in_aggregation[value] = tag.in_aggregation;
            }
          }
        });
      } else {
        console.log("It's not multi select", tag.label);
        const value = values;
        if (value) {
          if (existingAggregations.hasOwnProperty(value)) {
            aggregations[value] = existingAggregations[value];
          } else {
            aggregations[value] = tag.default_aggregate_option;
          }
        }
        if (value) {
          if (existingInAggregation.hasOwnProperty(value)) {
            in_aggregation[value] = existingInAggregation[value];
          } else {
            in_aggregation[value] = tag.in_aggregation;
          }
        }
      }
    });
    return { aggregations, in_aggregation };
  };

  const getDataSetRenderList = (tags) => {
    const renderList = [];
    tags.forEach((tag) => {
      const values = getTagFieldByPath(tag.path);
      if (!values) return;
      if (tag.isMultiSelect) {
        console.log("It's multi select", tag.label);
        values.forEach((value) => {
          if (
            value
            // && !tag.aggregate_disabled
          ) {
            const DataStepRow = {
              label: value,
              aggregate_disabled: tag.aggregate_disabled,
              fillNa_disabled: tag.fillNa_disabled,
              aggregate_path: `data_steps[0].kwargs.aggregations.${value}`,
              fillNa_path: `data_steps[0].kwargs.fillNA.${value}`,
              tag: tag.label,
            };
            renderList.push(DataStepRow);
          }
        });
      } else {
        console.log("It's not multi select", tag.label);
        const value = values;
        if (
          value
          // && !tag.aggregate_disabled
        ) {
          const DataStepRow = {
            label: value,
            aggregate_disabled: tag.aggregate_disabled,
            fillNa_disabled: tag.fillNa_disabled,
            aggregate_path: `data_steps[0].kwargs.aggregations.${value}`,
            fillNa_path: `data_steps[0].kwargs.fillNA.${value}`,
            tag: tag.label,
          };
          renderList.push(DataStepRow);
        }
      }
    });
    return renderList;
  };

  const getDefaultFillNA = (tags, existingFillNA) => {
    const fillNA = {};
    tags.forEach((tag) => {
      const values = getTagFieldByPath(tag.path);
      if (!values) return;
      if (tag.isMultiSelect) {
        values.forEach((value) => {
          if (value && !tag.fillNa_disabled) {
            if (existingFillNA.hasOwnProperty(value)) {
              fillNA[value] = existingFillNA[value];
            } else {
              fillNA[value] = tag.default_fillNa_option;
            }
          }
        });
      } else {
        const value = values;
        if (value && !tag.fillNa_disabled) {
          if (existingFillNA.hasOwnProperty(value)) {
            fillNA[value] = existingFillNA[value];
          } else {
            fillNA[value] = tag.default_fillNa_option;
          }
        }
      }
    });
    return fillNA;
  };

  const getTagFieldByPath = (path) => {
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

  const removeDuplicates = (array) => {
    const uniqueArray = [...new Set(array)];
    // console.log("group column tags", uniqueArray);
    return uniqueArray;
  };
  // Instead of evaluating getTagFieldByPath etc for every key on object creation,
  // wrap config in a function so field values are only computed for the requested tag.

  const dataStepConfigs = (tag) => {
    switch (tag) {
      case "sales":
        return {
          grouping_columns: [
            getTagFieldByPath(allTags.timestamp_column.path),
            ...getTagFieldByPath(allTags.ts_id_columns.path),
          ],
          aggregations: [
            allTags.target_column,
            allTags.driver_columns,
            allTags.optimization_column,
            allTags.replenishment_columns,
            allTags.dimensions,
            allTags.return_qty_column,
          ],
          fillNa: [
            allTags.target_column,
            allTags.driver_columns,
            allTags.optimization_column,
            allTags.replenishment_columns,
            allTags.dimensions,
            allTags.return_qty_column,
          ],
        };
      case "inventory":
        return {
          grouping_columns: [
            getTagFieldByPath(allTags.timestamp_column.path),
            ...getTagFieldByPath(allTags.ts_id_columns.path),
          ],
          aggregations: [
            allTags.driver_columns,
            allTags.replenishment_columns,
            allTags.return_qty_column,
            allTags.inventory_column,
            allTags.inventory_column_bom,
            allTags.intransit,
          ],
          fillNa: [
            allTags.driver_columns,
            allTags.replenishment_columns,
            allTags.return_qty_column,
            allTags.inventory_column,
            allTags.inventory_column_bom,
            allTags.intransit,
          ],
        };
      case "bom_inventory":
        return {
          grouping_columns: [
            getTagFieldByPath(allTags.timestamp_column.path),
            ...getTagFieldByPath(allTags.ts_id_columns.path),
          ],
          aggregations: [
            allTags.driver_columns,
            allTags.replenishment_columns,
            allTags.return_qty_column,
            allTags.inventory_column,
            allTags.inventory_column_bom,
          ],
          fillNa: [
            allTags.driver_columns,
            allTags.replenishment_columns,
            allTags.return_qty_column,
            allTags.inventory_column,
            allTags.inventory_column_bom,
          ],
        };
      case "others":
        return {
          grouping_columns: [
            getTagFieldByPath(allTags.timestamp_column.path),
            ...getTagFieldByPath(allTags.ts_id_columns.path),
          ],
          aggregations: [
            allTags.target_column,
            allTags.driver_columns,
            allTags.optimization_column,
            allTags.replenishment_columns,
            allTags.dimensions,
            allTags.return_qty_column,
            allTags.inventory_column,
            allTags.inventory_column_bom,
            allTags.intransit,
          ],
          fillNa: [
            allTags.target_column,
            allTags.driver_columns,
            allTags.optimization_column,
            allTags.replenishment_columns,
            allTags.dimensions,
            allTags.return_qty_column,
            allTags.intransit,
          ],
        };
      case "inventoryothers":
        return {
          grouping_columns: [
            getTagFieldByPath(allTags.timestamp_column.path),
            ...getTagFieldByPath(allTags.ts_id_columns.path),
          ],
          aggregations: [
            allTags.target_column,
            allTags.driver_columns,
            allTags.optimization_column,
            allTags.replenishment_columns,
            allTags.dimensions,
            allTags.return_qty_column,
            allTags.inventory_column,
            allTags.inventory_column_bom,
            allTags.intransit,
          ],
          fillNa: [
            allTags.target_column,
            allTags.driver_columns,
            allTags.optimization_column,
            allTags.replenishment_columns,
            allTags.dimensions,
            allTags.return_qty_column,
            allTags.intransit,
          ],
        };
      case "new_product":
        return {
          grouping_columns: [
            getTagFieldByPath(allTags.timestamp_column.path),
            ...getTagFieldByPath(allTags.ts_id_columns.path),
          ],
          aggregations: [
            allTags.target_column,
            allTags.driver_columns,
            allTags.optimization_column,
            allTags.replenishment_columns,
            allTags.dimensions,
            allTags.return_qty_column,
            allTags.inventory_column,
            allTags.inventory_column_bom,
            allTags.intransit,
          ],
          fillNa: [
            allTags.target_column,
            allTags.driver_columns,
            allTags.optimization_column,
            allTags.replenishment_columns,
            allTags.dimensions,
            allTags.return_qty_column,
            allTags.intransit,
          ],
        };
      case "simple_disaggregation_mapping":
        return {
          grouping_columns: [
            getTagFieldByPath(allTags.timestamp_column.path),
            ...getTagFieldByPath(allTags.ts_id_columns.path),
          ],
          aggregations: [
            allTags.target_column,
            allTags.driver_columns,
            allTags.optimization_column,
            allTags.replenishment_columns,
            allTags.dimensions,
            allTags.return_qty_column,
            allTags.inventory_column,
            allTags.inventory_column_bom,
            allTags.intransit,
          ],
          fillNa: [
            allTags.target_column,
            allTags.driver_columns,
            allTags.optimization_column,
            allTags.replenishment_columns,
            allTags.dimensions,
            allTags.return_qty_column,
            allTags.intransit,
          ],
        };
      case "item_master":
        return {
          grouping_columns: [
            getTagFieldByPath(allTags.timestamp_column.path),
            ...getTagFieldByPath(allTags.ts_id_columns.path),
          ],
          aggregations: [
            allTags.target_column,
            allTags.driver_columns,
            allTags.optimization_column,
            allTags.replenishment_columns,
            allTags.dimensions,
            allTags.return_qty_column,
          ],
          fillNa: [
            allTags.target_column,
            allTags.driver_columns,
            allTags.optimization_column,
            allTags.replenishment_columns,
            allTags.dimensions,
            allTags.return_qty_column,
            allTags.inventory_column,
            allTags.inventory_column_bom,
          ],
        };
      case "future":
        return {
          grouping_columns: [
            getTagFieldByPath(allTags.timestamp_column.path),
            ...getTagFieldByPath(allTags.ts_id_columns.path),
          ],
          aggregations: [
            allTags.target_column,
            allTags.driver_columns,
            allTags.optimization_column,
            allTags.replenishment_columns,
            allTags.dimensions,
            allTags.return_qty_column,
            allTags.inventory_column,
            allTags.inventory_column_bom,
            allTags.intransit,
          ],
          fillNa: [
            allTags.target_column,
            allTags.driver_columns,
            allTags.optimization_column,
            allTags.replenishment_columns,
            allTags.dimensions,
            allTags.return_qty_column,
            allTags.inventory_column,
            allTags.inventory_column_bom,
            allTags.intransit,
          ],
        };
      case "bom_mapping":
        return {
          grouping_columns: [
            getTagFieldByPath(allTags.timestamp_column.path),
            ...getTagFieldByPath(allTags.ts_id_columns.path),
          ],
          aggregations: [
            allTags.target_column,
            allTags.driver_columns,
            allTags.optimization_column,
            allTags.replenishment_columns,
            allTags.dimensions,
            allTags.return_qty_column,
            allTags.inventory_column,
            allTags.inventory_column_bom,
            allTags.intransit,
          ],
          fillNa: [
            allTags.target_column,
            allTags.driver_columns,
            allTags.optimization_column,
            allTags.replenishment_columns,
            allTags.dimensions,
            allTags.return_qty_column,
            allTags.inventory_column,
            allTags.inventory_column_bom,
            allTags.intransit,
          ],
        };
      case "bomothers":
        return {
          grouping_columns: [
            getTagFieldByPath(allTags.timestamp_column.path),
            ...getTagFieldByPath(allTags.ts_id_columns.path),
          ],
          aggregations: [
            allTags.target_column,
            allTags.driver_columns,
            allTags.optimization_column,
            allTags.replenishment_columns,
            allTags.dimensions,
            allTags.return_qty_column,
            allTags.inventory_column,
            allTags.inventory_column_bom,
            allTags.intransit,
          ],
          fillNa: [
            allTags.target_column,
            allTags.driver_columns,
            allTags.optimization_column,
            allTags.replenishment_columns,
            allTags.dimensions,
            allTags.return_qty_column,
            allTags.inventory_column,
            allTags.inventory_column_bom,
            allTags.intransit,
          ],
        };
      case "forecast":
        return {
          grouping_columns: [
            getTagFieldByPath(allTags.timestamp_column.path),
            ...getTagFieldByPath(allTags.ts_id_columns.path),
          ],
          aggregations: [
            allTags.tg_forecast,
            allTags.sales_forecast,
            allTags.marketing_forecast,
            allTags.ops_forecast,
            allTags.consensus_forecast,
            allTags.comments,
            allTags.intransit,
          ],
          fillNa: [
            allTags.tg_forecast,
            allTags.sales_forecast,
            allTags.marketing_forecast,
            allTags.ops_forecast,
            allTags.consensus_forecast,
            allTags.comments,
            allTags.intransit,
          ],
        };
      case "rewrite_forecast":
        return {
          grouping_columns: [
            getTagFieldByPath(allTags.timestamp_column.path),
            ...getTagFieldByPath(allTags.ts_id_columns.path),
          ],
          aggregations: [allTags.target_column],
          fillNa: [allTags.target_column],
        };
      case "transition_item":
        return {
          grouping_columns: [],
          aggregations: [],
          fillNa: [],
        };
      default:
        return {
          grouping_columns: [],
          aggregations: [],
          fillNa: [],
        };
    }
  };

  const datastep = () => {
    const existingDataSteps = loadedDataset.data_steps
      ? loadedDataset.data_steps[0].kwargs
      : { aggregations: {}, fillNA: {}, in_aggregation: {} };
    const dataStep = {
      grouping_columns: removeDuplicates(
        dataStepConfigs(tag).grouping_columns
      ).filter((element) => element !== null),
      aggregations: getDefaultAggregations(
        dataStepConfigs(tag).aggregations,
        existingDataSteps.aggregations,
        existingDataSteps.in_aggregation
      ).aggregations,
      in_aggregation: getDefaultAggregations(
        dataStepConfigs(tag).aggregations,
        existingDataSteps.aggregations,
        existingDataSteps.in_aggregation
      ).in_aggregation,
      fillNA: getDefaultFillNA(
        dataStepConfigs(tag).fillNa,
        existingDataSteps.fillNA
      ),
    };
    console.log("updatedDataStep:->", dataStep);
    return dataStep;
  };
  const renderList = removeDuplicates(
    getDataSetRenderList(dataStepConfigs(tag).aggregations)
  );
  const data = datastep();

  return { data, renderList };
};

export const cleanFillNA = (loadedDataset) => {
  // Destructure and extract the first step's details
  const { operation, kwargs } = loadedDataset.data_steps[0];
  const { grouping_columns, aggregations, fillNA, in_aggregation } = kwargs;

  // Clean the fillNA object by filtering out "None" and null values
  const cleanedFillNA = Object.keys(fillNA).reduce((acc, key) => {
    if (fillNA[key] !== "None" && fillNA[key] !== null) {
      acc[key] = fillNA[key];
    }
    return acc;
  }, {});

  // Return the updated dataset with only the first step modified
  return {
    ...loadedDataset,
    data_steps: [
      {
        operation,
        kwargs: {
          grouping_columns,
          aggregations,
          fillNA: cleanedFillNA,
          in_aggregation,
        },
      },
      // Spread the remaining steps unchanged
      // ...loadedDataset.data_steps.slice(1),
    ],
  };
};
