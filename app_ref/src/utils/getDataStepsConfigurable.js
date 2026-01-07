import { allTags } from "./allTags";

export const getDataSteps = (tag, loadedDataset, dataStepConfig) => {
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
  /*   const dataStepConfigs = {
    sales: {
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
    },
    inventory: {
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
    },
    bom_inventory: {
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
    },
    others: {
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
      ],
      fillNa: [
        allTags.target_column,
        allTags.driver_columns,
        allTags.optimization_column,
        allTags.replenishment_columns,
        allTags.dimensions,
        allTags.return_qty_column,
      ],
    },

    new_product: {
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
      ],
      fillNa: [
        allTags.target_column,
        allTags.driver_columns,
        allTags.optimization_column,
        allTags.replenishment_columns,
        allTags.dimensions,
        allTags.return_qty_column,
      ],
    },

    simple_disaggregation_mapping: {
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
      ],
      fillNa: [
        allTags.target_column,
        allTags.driver_columns,
        allTags.optimization_column,
        allTags.replenishment_columns,
        allTags.dimensions,
        allTags.return_qty_column,
      ],
    },
    item_master: {
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
    },
    future: {
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
    },
    bom_mapping: {
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
    },
    bomothers: {
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
    },
    forecast: {
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
      ],
      fillNa: [
        allTags.tg_forecast,
        allTags.sales_forecast,
        allTags.marketing_forecast,
        allTags.ops_forecast,
        allTags.consensus_forecast,
        allTags.comments,
      ],
    },
    rewrite_forecast: {
      grouping_columns: [
        getTagFieldByPath(allTags.timestamp_column.path),
        ...getTagFieldByPath(allTags.ts_id_columns.path),
      ],
      aggregations: [allTags.target_column],
      fillNa: [allTags.target_column],
    },
  }; */

  const datastep = () => {
    const existingDataSteps = loadedDataset.data_steps
      ? loadedDataset.data_steps[0].kwargs
      : { aggregations: {}, fillNA: {}, in_aggregation: {} };
    const dataStep = {
      grouping_columns: removeDuplicates(
        dataStepConfig.grouping_columns.reduce((acc, column) => {
          const value = getTagFieldByPath(column.path);
          if (value) {
            if (Array.isArray(value)) {
              acc.push(...value);
            } else {
              acc.push(value);
            }
          }
          return acc;
        }, [])
      ).filter((element) => element !== null),
      aggregations: getDefaultAggregations(
        dataStepConfig.aggregations,
        existingDataSteps.aggregations,
        existingDataSteps.in_aggregation
      ).aggregations,
      in_aggregation: getDefaultAggregations(
        dataStepConfig.aggregations,
        existingDataSteps.aggregations,
        existingDataSteps.in_aggregation
      ).in_aggregation,
      fillNA: getDefaultFillNA(dataStepConfig.fillNa, existingDataSteps.fillNA),
    };
    console.log("updatedDataStep:->", dataStep);
    return dataStep;
  };
  const renderList = removeDuplicates(
    getDataSetRenderList(dataStepConfig.aggregations)
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
