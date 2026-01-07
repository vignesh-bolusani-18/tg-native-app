// src/redux/slices/experimentSlice.js
import { createSlice, current } from "@reduxjs/toolkit";
import {
  areMandatoryFieldsFilled,
  getColumnInUse,
  getDatasetObject,
  getTagFieldConfig,
  setDatasets,
} from "../../utils/experimentUtils";
import {
  cleanFillNA,
  getDataSteps,
  useDataSteps,
} from "../../utils/getDataSteps";
import { cleanUpConfigObjects } from "../../utils/cleanUpConfigObjects";

const initialState = {
  defaultConfig: null,
  experiments_list: [],
  currentDatasetTag: "none",
  mandatory_datasets_tags: [],
  optional_datasets_tags: ["item_master", "others"],
  inventory_datasets_tags: ["inventory", "inventoryothers", "item_master"],
  future_datasets_tags: ["future"],
  bom_datasets_tags: ["bom_mapping", "bom_inventory", "bomothers"],
  forecast_datasets_tags: ["forecast"],
  new_product_datasets_tags: ["new_product"],
  transition_item_datasets_tags: ["transition_item"],
  simple_disaggregation_mapping_datasets_tags: [
    "simple_disaggregation_mapping",
  ],
  rewrite_forecast_datasets_tags: ["rewrite_forecast"],
  moduleName: null,
  loadedDatasets: {},
  loadedDataset: null,
  loadedDatasetCSV: null,
  datasetsLoaded: {},
  renderDatasets: {
    mandatory_datasets: [],
    optional_datasets: [],
    future_datasets: [],
    bom_datasets: [],
    forecast_datasets: [],
    new_product_datasets: [],
    simple_disaggregation_mapping_datasets: [],
    rewrite_forecast_datasets: [],
    transition_item_datasets: [],
  },
  tagFieldConfig: {
    mandatory_tags: [],
    optional_tags: [],
  },
  dataSteps: {
    grouping_columns: [],
    aggregations: {},
    fillNA: {},
    in_aggregation: {},
  },
  aggregation_method: null,
  path: "",
  columnsInUse: [],
  areMandatoryFieldsFilled: false,
  renderDataStepsList: [],
  loading: false,
  error: null,
  allColumns: [],
  experiment_config: null,
  hasParquetFiles: false,
  input_data: null,
  input_data_cols: [],
  bom_input_data: null,
  inventory_input_data: null,
  inventory_input_data_cols: [],
  bom_input_data_cols: [],
  join_operations: [],
  join_operations_future: [],
  join_operations_bom: [],
  join_operations_forecast: [],

  join_operations_supply_item_master: [],
  join_operations_new_product: [],
  join_operations_simple_disaggregation_mapping: [],
  join_operations_inventory: [],
  join_operations_transition_item: [],
  needToJoin: false,
  joinsAdded: false,
  datasetsAdded: [],
  logs: null,
  currentExperimentStatus: null,
  tabValue: "0",
  preprocessMetadata: null,
  experimentFiltersState: {
    searchString: "",
    createdAt: {
      startDate: null,
      endDate: null,
    },
    updatedAt: {
      startDate: null,
      endDate: null,
    },
    moduleNames: [],
    statuses: [],
    isProduction: false,
  },
};

const experimentSlice = createSlice({
  name: "experiment",
  initialState,
  reducers: {
    loadExperiments(state, action) {
      state.experiments_list = action.payload;
    },
    addExperiment(state, action) {
      state.experiments_list.push(action.payload);
    },
    setCache(state, action) {
      console.log("action.payload", action.payload);
      state.defaultConfig = action.payload;
      state.hasParquetFiles =
        action.payload?.scenario_plan?.file_type?.includes("parquet");
      state.moduleName = action.payload.common.module_name;
      setDatasets(action.payload.common.module_name, state);
      state.tabValue = "0";
      state.mandatory_datasets_tags.forEach((tag) => {
        const datasetObject = getDatasetObject(tag);
        state.renderDatasets.mandatory_datasets.push(datasetObject);
      });

      state.optional_datasets_tags.forEach((tag) => {
        const datasetObject = getDatasetObject(tag);
        console.log("Optional datasetObject", datasetObject);
        state.renderDatasets.optional_datasets.push(datasetObject);
      });

      state.future_datasets_tags.forEach((tag) => {
        const datasetObject = getDatasetObject(tag);
        state.renderDatasets.future_datasets.push(datasetObject);
      });

      state.bom_datasets_tags.forEach((tag) => {
        const datasetObject = getDatasetObject(tag);
        state.renderDatasets.bom_datasets.push(datasetObject);
      });

      state.forecast_datasets_tags.forEach((tag) => {
        const datasetObject = getDatasetObject(tag);
        state.renderDatasets.forecast_datasets.push(datasetObject);
      });
      state.new_product_datasets_tags.forEach((tag) => {
        const datasetObject = getDatasetObject(tag);
        state.renderDatasets.new_product_datasets.push(datasetObject);
      });

      state.transition_item_datasets_tags.forEach((tag) => {
        const datasetObject = getDatasetObject(tag);
        state.renderDatasets.transition_item_datasets.push(datasetObject);
      });

      state.simple_disaggregation_mapping_datasets_tags.forEach((tag) => {
        const datasetObject = getDatasetObject(tag);
        state.renderDatasets.simple_disaggregation_mapping_datasets.push(
          datasetObject
        );
      });

      state.rewrite_forecast_datasets_tags.forEach((tag) => {
        const datasetObject = getDatasetObject(tag);
        state.renderDatasets.rewrite_forecast_datasets.push(datasetObject);
      });

      const allTags = [
        ...state.mandatory_datasets_tags,
        ...state.optional_datasets_tags,
        ...state.future_datasets_tags,
        ...state.bom_datasets_tags,
        ...state.forecast_datasets_tags,
        ...state.new_product_datasets_tags,
        ...state.simple_disaggregation_mapping_datasets_tags,
        ...state.rewrite_forecast_datasets_tags,
        ...state.transition_item_datasets_tags,
      ];

      if (
        action.payload.common.job_id === "job_id" ||
        action.payload.common.job_id === null
      ) {
        allTags.forEach((tag) => {
          if (!state.loadedDatasets[tag]) {
            state.loadedDatasets[tag] = [];
            state.datasetsLoaded[tag] = false;
          }
        });
      } else {
        state.loadedDatasets = action.payload.loadedDatasets;
        state.datasetsLoaded = action.payload.datasetsLoaded;
        state.joinsAdded = action.payload.joinsAdded;
        state.needToJoin = action.payload.needToJoin;
        if (action.payload.datasetsAdded !== undefined) {
          state.datasetsAdded = action.payload.datasetsAdded;
          console.log("DatasetsAdded1", action.payload.datasetsAdded);
        } else {
          let datasetsAdded = [];
          Object.keys(action.payload.loadedDatasets).forEach((key) => {
            if (action.payload.datasetsLoaded[key]) {
              action.payload.loadedDatasets[key].forEach((dataset) => {
                datasetsAdded.push(dataset.filename);
              });
            }
          });
          console.log("DatasetsAdded", datasetsAdded);
          state.datasetsAdded = [...new Set(datasetsAdded)];
        }
        state.inventory_input_data =
          action.payload.etl?.loaded_datasets?.["inventory"]?.length > 0
            ? action.payload?.etl?.loaded_datasets?.["inventory"][0].filename
            : initialState.inventory_input_data;
        state.inventory_input_data_cols =
          action.payload.etl?.loaded_datasets?.["inventory"]?.length > 0
            ? action.payload.etl?.loaded_datasets?.["inventory"][0]
                ?.data_attributes?.cols
            : initialState.inventory_input_data_cols;

        state.input_data = action.payload.etl?.input_data;
        state.bom_input_data = action.payload.etl?.bom_input_data;
        state.input_data_cols =
          action.payload.etl?.loaded_datasets?.["sales"]?.length > 0
            ? action.payload.etl?.loaded_datasets?.["sales"][0]?.data_attributes
                .cols
            : initialState.input_data_cols;
        state.bom_input_data_cols =
          action?.payload?.etl?.loaded_datasets?.["bom_mapping"]?.length > 0
            ? action?.payload?.etl?.loaded_datasets?.["bom_mapping"][0]
                ?.data_attributes?.cols
            : initialState.bom_input_data_cols;
        if (action.payload.joinsAdded) {
          state.join_operations = action.payload?.etl?.join_operations;
          state.join_operations_inventory =
            action.payload?.etl?.join_operations_inventory || [];
          state.join_operations_future =
            action.payload?.etl?.join_operations_future;
          state.join_operations_forecast =
            action.payload?.etl?.join_operations_forecast || [];
          state.join_operations_supply_item_master = // Add this line
            action.payload?.etl?.join_operations_supply_item_master || [];

          state.join_operations_new_product =
            action.payload?.etl?.join_operations_new_product || [];
          state.join_operations_transition_item =
            action.payload?.etl?.join_operations_transition_item || [];
          state.join_operations_simple_disaggregation_mapping =
            action.payload?.etl
              ?.join_operations_simple_disaggregation_mapping || [];
          state.join_operations_bom = action.payload?.etl?.join_operations_bom;
        }

        // Object.keys(action.payload.loadedDatasets).forEach((datasetTag) => {
        //   action.payload.loadedDatasets[datasetTag].forEach((dataset) => {
        //     const path = `accounts/${user_name}/customer_data/data_library/metadata/${dataset.filename}.json`;
        //     uploadJsonToS3(path, dataset);
        //   });
        // });
      }
    },
    setExperimentConfig(state, action) {
      state.experiment_config = {
        ...action.payload,
        scenario_plan: {
          ...action.payload.scenario_plan,
          file_type: action.payload.scenario_plan?.file_type ?? ["csv"],
          historical_horizon_snop:
            action.payload.scenario_plan?.historical_horizon_snop ?? 4,
          multiprocessing_disaggregation:
            action.payload.scenario_plan?.multiprocessing_disaggregation ??
            false,
          production_plan: {
            ...action.payload.scenario_plan?.production_plan,
            production_plan_dimensions:
              action.payload.scenario_plan?.production_plan
                ?.production_plan_dimensions ?? [],
            production_plan_metrics:
              action.payload.scenario_plan?.production_plan?.production_plan_metrics?.map(
                (item) => (item === "Production Plan" ? "Reorder Plan" : item)
              ) ?? [
                "Beginning Inventory",
                "ML Forecast",
                "Sales",
                "Reorder Plan", // default already corrected
                "Production Plan Add-on",
                "Safety Stock Days",
                "Days On Inventory",
              ],

            capacity_constraint:
              action.payload.scenario_plan?.production_plan
                ?.capacity_constraint ?? "None",
            production_plan_historical_horizon:
              action.payload.scenario_plan?.production_plan
                ?.production_plan_historical_horizon ?? 0,
            production_plan_avg_calc_horizon:
              action.payload.scenario_plan?.production_plan
                ?.production_plan_avg_calc_horizon ?? 3,
            production_plan_forecast_final_calculation:
              action.payload.scenario_plan?.production_plan
                ?.production_plan_forecast_final_calculation ??
              "average_forecasts",
          },
          multiprocessing_inventory:
            action.payload.scenario_plan?.multiprocessing_inventory ?? false,
          inventory_constraints: (() => {
            const constraints = {
              ...action.payload.scenario_plan?.inventory_constraints,
              disaggregate_inventory_metrics:
                action.payload.scenario_plan?.inventory_constraints
                  ?.disaggregate_inventory_metrics ?? [],
              disaggregate_inventory_metrics_history:
                action.payload.scenario_plan?.inventory_constraints
                  ?.disaggregate_inventory_metrics_history ?? 90,
              disaggregate_inventory_metrics_granularity:
                action.payload.scenario_plan?.inventory_constraints
                  ?.disaggregate_inventory_metrics_granularity ?? [],
              unconstriant_stock_transfer:
                action.payload.scenario_plan?.inventory_constraints
                  ?.unconstriant_stock_transfer ?? false,
              stock_transfer_adjusted_reorder:
                action.payload.scenario_plan?.inventory_constraints
                  ?.stock_transfer_adjusted_reorder ?? false,
              stock_transfer_zone:
                typeof action.payload.scenario_plan?.inventory_constraints
                  ?.stock_transfer_zone === "string"
                  ? action.payload.scenario_plan.inventory_constraints
                      .stock_transfer_zone === "None"
                    ? []
                    : [
                        action.payload.scenario_plan.inventory_constraints
                          .stock_transfer_zone,
                      ]
                  : Array.isArray(
                      action.payload.scenario_plan?.inventory_constraints
                        ?.stock_transfer_zone
                    )
                  ? action.payload.scenario_plan.inventory_constraints
                      .stock_transfer_zone
                  : [],
              disaggregation_type:
                action.payload.scenario_plan?.inventory_constraints
                  ?.disaggregation_type ?? "ml_based_disaggregation",
              inventory_distribution_key:
                action.payload.scenario_plan?.inventory_constraints
                  ?.inventory_distribution_key ?? [],
              disaggregation_distribution_key:
                action.payload.scenario_plan?.inventory_constraints
                  ?.disaggregation_distribution_key ?? [],
              sales_joining_keys:
                action.payload.scenario_plan?.inventory_constraints
                  ?.sales_joining_keys ?? [],
              inventory_joining_keys:
                action.payload.scenario_plan?.inventory_constraints
                  ?.inventory_joining_keys ?? [],
              optimize_cutsize:
                action.payload.scenario_plan?.inventory_constraints
                  ?.optimize_cutsize ?? false,
              size_column:
                action.payload.scenario_plan?.inventory_constraints
                  ?.size_column ?? "None",
              all_size_level:
                action.payload.scenario_plan?.inventory_constraints
                  ?.all_size_level ?? "None",
            };

            // ❌ Remove ml_based_disaggregation if present
            delete constraints.ml_based_disaggregation;

            return constraints;
          })(),

          new_product_forecasting: {
            ...action.payload.scenario_plan?.new_product_forecasting,
            new_prod_granularity:
              action.payload.scenario_plan?.new_product_forecasting
                ?.new_prod_granularity ?? [],
            data_generation_dimension:
              action.payload.scenario_plan?.new_product_forecasting
                ?.data_generation_dimension ?? [],
            days_to_be_generated:
              action.payload.scenario_plan?.new_product_forecasting
                ?.days_to_be_generated ?? 30,
            new_product_dimensions:
              action.payload.scenario_plan?.new_product_forecasting
                ?.new_product_dimensions ?? [],
            new_product_driver:
              action.payload.scenario_plan?.new_product_forecasting
                ?.new_product_driver ?? [],
            new_product_replenishment_constraints:
              action.payload.scenario_plan?.new_product_forecasting
                ?.new_product_replenishment_constraints ?? [],
          },

          simple_disaggr: {
            ...action.payload.scenario_plan?.simple_disaggr,
            bundle_mapping_granularity:
              action.payload.scenario_plan?.simple_disaggr
                ?.bundle_mapping_granularity ?? "None",
            bundle_forecast_granularity:
              action.payload.scenario_plan?.simple_disaggr
                ?.bundle_forecast_granularity ?? "None",
            simple_mapping:
              action.payload.scenario_plan?.simple_disaggr?.simple_mapping ??
              "None",
            simple_disaggregation_quantity:
              action.payload.scenario_plan?.simple_disaggr
                ?.simple_disaggregation_quantity ?? "None",
            ts_id_columns_simple_disaggr:
              action.payload.scenario_plan?.simple_disaggr
                ?.ts_id_columns_simple_disaggr ?? [],
          },
        },
        etl: {
          ...action.payload.etl,
          inventory_input_data:
            action.payload.etl?.loaded_datasets?.["inventory"]?.length > 0
              ? action.payload?.etl?.loaded_datasets?.["inventory"][0].filename
              : null,
          inventory_input_data_cols:
            action.payload.etl?.loaded_datasets?.["inventory"]?.length > 0
              ? action.payload.etl?.loaded_datasets?.["inventory"][0]
                  ?.data_attributes?.cols
              : [],
        },

        data: {
          ...action.payload.data,
          filter_target_gt_zero:
            action.payload.data?.filter_target_gt_zero ?? true,
          week_active_days: action.payload.data?.week_active_days ?? 7,
          date_offset: action.payload.data?.date_offset ?? 0,
        },

        training: {
          ...action.payload.training,
          train_metrics_weight:
            action.payload.training?.train_metrics_weight ?? 0,
        },
        feature_engg: {
          ...action.payload.feature_engg,
          backfill_time_series:
            action.payload.feature_engg?.backfill_time_series ?? false,
          offset_params: {
            ...action.payload.feature_engg?.offset_params,
            function_types: action.payload.feature_engg?.offset_params
              ?.function_types ?? ["linear_regression"],
          },
        },
        stacking: {
          ...action.payload.stacking,
          include_train_metrics:
            action.payload.stacking?.include_train_metrics ?? false,
          data_generation_dimension_recents:
            action.payload.stacking?.data_generation_dimension_recents ?? [],
          rl_agents: action.payload.stacking?.rl_agents ?? false,
          editedFiles:
            cleanUpConfigObjects(
              action.payload.stacking?.editedFiles ?? {},
              action.payload.common.job_id,
              action.payload.common.parent_job_id
            ) ?? {},
          newRows:
            cleanUpConfigObjects(
              action.payload.stacking?.newRows ?? {},
              action.payload.common.job_id,
              action.payload.common.parent_job_id
            ) ?? {},
          deletedRows:
            cleanUpConfigObjects(
              {},
              action.payload.common.job_id,
              action.payload.common.parent_job_id
            ) ?? {},
        },
        tables_filter_data: action.payload.tables_filter_data ?? {},
        byor_base_datasets: action.payload.byor_base_datasets ?? [],
        deleted_base_datasets: action.payload.deleted_base_datasets ?? [],
        dashboard_settings: {
          ...action.payload.dashboard_settings,
          show_forecasting_pivot_disaggregated:
            action.payload.dashboard_settings
              ?.show_forecasting_pivot_disaggregated ?? false,
          hide_forecasting_pivot_table:
            action.payload.dashboard_settings?.hide_forecasting_pivot_table ??
            false,
          forecast_data_reference:
            action.payload.dashboard_settings?.forecast_data_reference ?? [],
          align_period_labels_to_start:
            action.payload.dashboard_settings?.align_period_labels_to_start !==
            undefined
              ? action.payload.dashboard_settings?.align_period_labels_to_start
              : false,
        },
        editedFiles:
          cleanUpConfigObjects(
            action.payload.stacking?.editedFiles ?? {},
            action.payload.common.job_id,
            action.payload.common.parent_job_id
          ) ?? {},
        editHistories:
          cleanUpConfigObjects(
            action.payload.stacking?.editHistories ?? {},
            action.payload.common.job_id,
            action.payload.common.parent_job_id
          ) ?? {},
        agent_settings: {
          ...action.payload.agent_settings,
          forecast_type_for_reward:
            action.payload.agent_settings?.forecast_type_for_reward ??
            "ML Forecast",
          forecast_deviation:
            action.payload.agent_settings?.forecast_deviation ?? 1,
          test_horizon:
            action.payload.agent_settings?.test_horizon ??
            action.payload.data?.validation_horizon ??
            2,
          accuracy_by_test_horizon:
            action.payload.agent_settings?.accuracy_by_test_horizon ?? false,
          experiments_history:
            action.payload.agent_settings?.experiments_history ?? [],
        },
      };
    },
    setTabValue(state, action) {
      state.tabValue = action.payload;
    },
    setExperimentStatus(state, action) {
      state.currentExperimentStatus = action.payload;
    },
    setPreprocessMetadata(state, action) {
      state.preprocessMetadata = action.payload;
    },
    resetExperimentConfig(state) {
      state.experiment_config = initialState.experiment_config;
    },

    selectDatasetCard(state, action) {
      const datasetTag = action.payload;
      state.currentDatasetTag = datasetTag;
      if (datasetTag !== "none") {
        state.tagFieldConfig = getTagFieldConfig(datasetTag);
      }
    },
    updateLoadedDatasetByPath: (state, action) => {
      const { path, value } = action.payload;
      const pathParts = path.split(/[\.\[\]]/).filter(Boolean);
      const updateNestedByPath = (obj, path, value) => {
        const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
        const updateRecursively = (currentObj, keys) => {
          const [firstKey, ...remainingKeys] = keys;

          // Check if firstKey is a numeric index
          const index = Number(firstKey);
          if (!isNaN(index)) {
            // Handle array case
            if (remainingKeys.length === 0) {
              currentObj[index] = castValue(currentObj[index], value);
            } else {
              currentObj[index] = updateRecursively(
                currentObj[index],
                remainingKeys
              );
            }
          } else {
            // Handle object case
            if (remainingKeys.length === 0) {
              currentObj[firstKey] = castValue(currentObj[firstKey], value);
            } else {
              currentObj[firstKey] = updateRecursively(
                currentObj[firstKey],
                remainingKeys
              );
            }
          }
          return currentObj;
        };

        return updateRecursively(obj, pathParts);
      };

      const castValue = (existingValue, newValue) => {
        if (
          existingValue === null ||
          existingValue === undefined ||
          newValue === null
        ) {
          return newValue;
        }

        const typeOfExistingValue = typeof existingValue;
        switch (typeOfExistingValue) {
          case "number":
            return Number(newValue);
          case "boolean":
            return newValue === "true" || newValue === true;
          case "object":
            if (Array.isArray(existingValue)) {
              return Array.isArray(newValue) ? newValue : [newValue];
            }
            return typeof newValue === "object" ? newValue : {};
          case "string":
            return String(newValue);
          default:
            return newValue;
        }
      };

      state.loadedDataset = updateNestedByPath(
        state.loadedDataset,
        path,
        value
      );
      if (pathParts[0] === "field_tags") {
        state.dataSteps = getDataSteps(
          state.currentDatasetTag,
          state.loadedDataset
        ).data;
        state.renderDataStepsList = getDataSteps(
          state.currentDatasetTag,
          state.loadedDataset
        ).renderList;

        state.columnsInUse = getColumnInUse(state.loadedDataset);
        state.areMandatoryFieldsFilled = areMandatoryFieldsFilled(
          state.currentDatasetTag,
          state.loadedDataset
        );
        state.loadedDataset = updateNestedByPath(
          state.loadedDataset,
          "data_steps[0].kwargs",
          state.dataSteps
        );
        console.log("DataSteps:->", state.dataSteps);
        console.log("RenderList:->", state.renderDataStepsList);
      }
    },
    // setMetadata: (state, action) => {
    //   console.log("Set Meta Data Called with ", action.payload.loadedDataset);
    //   const tag = action.payload.currentDatasetTag;

    //   // Update loadedDataset
    //   state.loadedDataset = { ...action.payload.loadedDataset };

    //   console.log("HOOO");

    //   // Reset dataSteps and renderDataStepsList
    //   state.renderDataStepsList = initialState.renderDataStepsList;
    //   state.dataSteps = initialState.dataSteps;

    //   // Get new dataSteps and renderDataStepsList
    //   const { renderList, data } = getDataSteps(
    //     tag,
    //     action.payload.loadedDataset
    //   );
    //   state.renderDataStepsList = renderList;

    //   // Update kwargs immutably
    //   state.loadedDataset = {
    //     ...state.loadedDataset,
    //     data_steps: state.loadedDataset.data_steps.map((step, index) =>
    //       index === 0 ? { ...step, kwargs: data } : step
    //     ),
    //   };

    //   // Update columnsInUse and areMandatoryFieldsFilled
    //   state.columnsInUse = getColumnInUse(action.payload.loadedDataset);
    //   console.log("HIII");
    //   state.areMandatoryFieldsFilled = areMandatoryFieldsFilled(
    //     tag,
    //     action.payload.loadedDataset
    //   );

    //   console.log("loadedDataset Updated to: ", state.loadedDataset);
    // },

    setMetadata: (state, action) => {
      console.log("Set Meta Data Called with ", action.payload.loadedDataset);

      const tag = action.payload.currentDatasetTag;
      console.log("TAG", tag);
      state.currentDatasetTag = tag;
      state.tagFieldConfig = getTagFieldConfig(tag);
      state.loadedDataset = { ...action.payload.loadedDataset };
      console.log("HOOO");
      state.renderDataStepsList = initialState.renderDataStepsList;
      state.dataSteps = initialState.dataSteps;
      // Generate new data steps
      // if (tag !== "transition_item") {
      const { renderList, data } = getDataSteps(
        tag,
        action.payload.loadedDataset
      );
      state.renderDataStepsList = renderList;

      // Update kwargs immutably
      state.loadedDataset = {
        ...state.loadedDataset,
        data_steps: state.loadedDataset.data_steps.map((step, index) =>
          index === 0 ? { ...step, kwargs: data } : step
        ),
      };
      // }

      state.columnsInUse = getColumnInUse(action.payload.loadedDataset);
      console.log("HIII");
      state.areMandatoryFieldsFilled = areMandatoryFieldsFilled(
        tag,
        action.payload.loadedDataset
      );
      console.log("loadedDataset Updated to: ", state.loadedDataset);
    },
    updateMetadata: (state, action) => {
      state.loadedDataset = { ...state.loadedDataset, ...action.payload };
      // console.log("Config Updated to: ", state.config);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setJoinsAdded: (state, action) => {
      state.joinsAdded = action.payload;
    },

    addMetaData: (state, action) => {
      const { loadedDataset } = action.payload;
      console.log("MetaData at addMetaData", loadedDataset);
      const cleanedDataset = cleanFillNA(loadedDataset);
      if (state.loadedDatasets[state.currentDatasetTag] === undefined) {
        state.loadedDatasets[state.currentDatasetTag] = [];
      }
      state.loadedDatasets[state.currentDatasetTag].push(cleanedDataset);
      if (state.currentDatasetTag === "sales") {
        state.input_data_cols = loadedDataset.data_attributes.cols;
      } else if (state.currentDatasetTag === "bom_mapping") {
        state.bom_input_data_cols = loadedDataset.data_attributes.cols;
      } else if (state.currentDatasetTag === "inventory") {
        state.inventory_input_data_cols = loadedDataset.data_attributes.cols;
      }
      if (!state.input_data && state.currentDatasetTag === "sales") {
        state.input_data = loadedDataset.filename;
        state.input_data_cols = loadedDataset.data_attributes.cols;
        state.datasetsAdded = [...state.datasetsAdded, loadedDataset.filename];
      } else if (
        !state.bom_input_data &&
        state.currentDatasetTag === "bom_mapping"
      ) {
        state.bom_input_data = loadedDataset.filename;
        state.bom_input_data_cols = loadedDataset.data_attributes.cols;
        state.datasetsAdded = [...state.datasetsAdded, loadedDataset.filename];
      } else if (
        !state.inventory_input_data &&
        state.currentDatasetTag === "inventory"
      ) {
        state.inventory_input_data = loadedDataset.filename;
        state.inventory_input_data_cols = loadedDataset.data_attributes.cols;
        state.datasetsAdded = [...state.datasetsAdded, loadedDataset.filename];
      } else {
        state.datasetsAdded = [...state.datasetsAdded, loadedDataset.filename];
      }

      state.needToJoin =
        [...new Set([...state.datasetsAdded, loadedDataset.filename])].length >
        1;
      state.datasetsLoaded[state.currentDatasetTag] = true;
      state.currentDatasetTag = "none";
      state.renderDataStepsList = initialState.renderDataStepsList;
      state.columnsInUse = initialState.columnsInUse;
      state.areMandatoryFieldsFilled = initialState.areMandatoryFieldsFilled;
    },
    editMetaData: (state, action) => {
      const { loadedDataset, tag, index } = action.payload;
      console.log("MetaData at editMetaData", loadedDataset);
      const cleanedDataset = cleanFillNA(loadedDataset);
      state.loadedDatasets[tag][index] = cleanedDataset;
      if (state.currentDatasetTag === "sales") {
        state.input_data_cols = loadedDataset.data_attributes.cols;
      } else if (state.currentDatasetTag === "bom_mapping") {
        state.bom_input_data_cols = loadedDataset.data_attributes.cols;
      } else if (state.currentDatasetTag === "inventory") {
        state.inventory_input_data_cols = loadedDataset.data_attributes.cols;
      }
      if (!state.input_data && tag === "sales") {
        state.input_data = loadedDataset.filename;
        state.input_data_cols = loadedDataset.data_attributes.cols;
        state.datasetsAdded = [...state.datasetsAdded, loadedDataset.filename];
      } else if (!state.bom_input_data && tag === "bom_mapping") {
        state.bom_input_data = loadedDataset.filename;
        state.bom_input_data_cols = loadedDataset.data_attributes.cols;
        state.datasetsAdded = [...state.datasetsAdded, loadedDataset.filename];
      } else if (!state.inventory_input_data && tag === "inventory") {
        state.inventory_input_data = loadedDataset.filename;
        state.inventory_input_data_cols = loadedDataset.data_attributes.cols;
        state.datasetsAdded = [...state.datasetsAdded, loadedDataset.filename];
      } else {
        state.datasetsAdded = [...state.datasetsAdded, loadedDataset.filename];
      }

      state.needToJoin =
        [...new Set([...state.datasetsAdded, loadedDataset.filename])].length >
        1;

      state.renderDataStepsList = initialState.renderDataStepsList;
      state.columnsInUse = initialState.columnsInUse;
      state.areMandatoryFieldsFilled = initialState.areMandatoryFieldsFilled;
    },
    loadJoins: (state) => {
      const loadedDatasets = state.loadedDatasets;
      // const datasetsAdded = state.datasetsAdded; // List of datasets added at this point
      let new_join_operations = [...state.join_operations];
      let new_join_operations_inventory = [...state.join_operations_inventory];
      let new_join_operations_future = [...state.join_operations_future];
      let new_join_operations_forecast = [...state.join_operations_forecast];
      let new_join_operations_supply_item_master = [
        ...state.join_operations_supply_item_master,
      ];

      let new_join_operations_bom = [...state.join_operations_bom];
      let new_join_operations_new_product = [
        ...state.join_operations_new_product,
      ];
      let new_join_operations_transition_item = [
        ...state.join_operations_transition_item,
      ];
      let new_join_operations_simple_disaggregation_mapping = [
        ...state.join_operations_simple_disaggregation_mapping,
      ];

      let operations = {
        join_operations: [],
        join_operations_future: [],
        join_operations_forecast: [],
        join_operations_bom: [],
        join_operations_new_product: [],
        join_operations_simple_disaggregation_mapping: [],
        join_operations_inventory: [],
        join_operations_transition_item: [],
        join_operations_supply_item_master: [],
      };

      console.log("Loaded the joins");
      // Helper function to find an existing join object
      const findExistingJoin = (operations, file1, file2) => {
        // Find the first operation where both file1 and file2 match exactly
        const normalOperations = operations.map((op) => {
          return JSON.parse(JSON.stringify(op));
        });
        const foundJoin = normalOperations.find(
          (join) => join.file1 === file1 && join.file2 === file2
        );

        console.log("operations", normalOperations);
        console.log("file1", file1);
        console.log("file2", file2);
        console.log("foundJoin", foundJoin);

        return foundJoin || null; // Return the found join or null if none exists
      };

      const createFileMapping = (operations) => {
        const fileMapping = {};

        operations.forEach((operation) => {
          const { file1, file2 } = operation;

          // Add or update the mapping in the result object
          if (!fileMapping[file2]) {
            fileMapping[file2] = file1;
          }
        });
        console.log(fileMapping);

        return fileMapping;
      };
      const removeDuplicates = (array) => {
        const uniqueArray = [...new Set(array)];
        // console.log("group column tags", uniqueArray);
        return uniqueArray;
      };
      // Iterate over loaded datasets and create or reuse join objects
      Object.keys(loadedDatasets).forEach((currentDatasetTag) => {
        loadedDatasets[currentDatasetTag].forEach((loadedDataset) => {
          if (
            (!state.bom_datasets_tags.includes(currentDatasetTag) &&
              !state.inventory_datasets_tags.includes(currentDatasetTag) &&
              loadedDataset?.field_tags?.supply_item_master !== true) ||
            (currentDatasetTag === "item_master" &&
              loadedDataset?.field_tags?.supply_item_master !== true)
          ) {
            if (currentDatasetTag === "item_master") {
              console.log(loadedDataset);
            }
            if (loadedDataset.filename !== state.input_data) {
              let destination = new_join_operations;
              let destinationKey = "join_operations";
              if (state.future_datasets_tags.includes(currentDatasetTag)) {
                destination = new_join_operations_future;
                destinationKey = "join_operations_future";
              } else if (
                state.forecast_datasets_tags.includes(currentDatasetTag)
              ) {
                destination = new_join_operations_forecast;
                destinationKey = "join_operations_forecast";
              } else if (
                state.new_product_datasets_tags.includes(currentDatasetTag)
              ) {
                destination = new_join_operations_new_product;
                destinationKey = "join_operations_new_product";
              } else if (
                state.transition_item_datasets_tags.includes(currentDatasetTag)
              ) {
                destination = new_join_operations_transition_item;
                destinationKey = "join_operations_transition_item";
              } else if (
                state.simple_disaggregation_mapping_datasets_tags.includes(
                  currentDatasetTag
                )
              ) {
                destination = new_join_operations_simple_disaggregation_mapping;
                destinationKey =
                  "join_operations_simple_disaggregation_mapping";
              }

              destination = destination.map((op) =>
                JSON.parse(JSON.stringify(op))
              );
              if (operations[destinationKey].length === 0) {
                let join_object = findExistingJoin(
                  destination,
                  state.input_data,
                  loadedDataset.filename
                );
                if (!join_object) {
                  join_object = {
                    file1: state.input_data,
                    file1_allCols: state.input_data_cols,
                    file2: loadedDataset.filename,
                    file2_allCols: loadedDataset.data_attributes.cols,
                    file1_col: [],
                    file2_col: [],
                    join_type: "left",
                  };
                }
                operations[destinationKey].push(join_object);
              } else {
                const last_object =
                  operations[destinationKey][
                    operations[destinationKey].length - 1
                  ];
                let file1_name = `${last_object.file1}+${last_object.file2}`;
                let file1_allCols = removeDuplicates([
                  ...last_object.file1_allCols,
                  ...last_object.file2_allCols,
                ]);
                let join_object = findExistingJoin(
                  destination,
                  file1_name,
                  loadedDataset.filename
                );
                if (!join_object) {
                  join_object = {
                    file1: file1_name,
                    file1_allCols: file1_allCols,
                    file2: loadedDataset.filename,
                    file2_allCols: loadedDataset.data_attributes.cols,
                    file1_col: [],
                    file2_col: [],
                    join_type: "left",
                  };
                }
                operations[destinationKey].push(join_object);
              }
            }
          } else {
            if (state.bom_datasets_tags.includes(currentDatasetTag)) {
              if (loadedDataset.filename !== state.bom_input_data) {
                let destination = new_join_operations_bom;
                let destinationKey = "join_operations_bom";

                destination = destination.map((op) =>
                  JSON.parse(JSON.stringify(op))
                );
                if (operations[destinationKey].length === 0) {
                  let join_object = findExistingJoin(
                    destination,
                    state.bom_input_data,
                    loadedDataset.filename
                  );
                  if (!join_object) {
                    join_object = {
                      file1: state.bom_input_data,
                      file1_allCols: state.bom_input_data_cols,
                      file2: loadedDataset.filename,
                      file2_allCols: loadedDataset.data_attributes.cols,
                      file1_col: [],
                      file2_col: [],
                      join_type: "left",
                    };
                  }
                  operations[destinationKey].push(join_object);
                } else {
                  const last_object =
                    operations[destinationKey][
                      operations[destinationKey].length - 1
                    ];
                  let file1_name = `${last_object.file1}+${last_object.file2}`;
                  let file1_allCols = removeDuplicates([
                    ...last_object.file1_allCols,
                    ...last_object.file2_allCols,
                  ]);
                  let join_object = findExistingJoin(
                    destination,
                    file1_name,
                    loadedDataset.filename
                  );
                  if (!join_object) {
                    join_object = {
                      file1: file1_name,
                      file1_allCols: file1_allCols,
                      file2: loadedDataset.filename,
                      file2_allCols: loadedDataset.data_attributes.cols,
                      file1_col: [],
                      file2_col: [],
                      join_type: "left",
                    };
                  }
                  operations[destinationKey].push(join_object);
                }
              }
            } else if (
              state.inventory_datasets_tags.includes(currentDatasetTag) &&
              currentDatasetTag === "item_master" &&
              loadedDataset?.field_tags?.supply_item_master === true
            ) {
              console.log(loadedDataset, state.inventory_input_data);
              if (loadedDataset.filename !== state.inventory_input_data) {
                let destination = new_join_operations_supply_item_master;
                let destinationKey = "join_operations_supply_item_master";
                destination = destination.map((op) =>
                  JSON.parse(JSON.stringify(op))
                );
                if (operations[destinationKey].length === 0) {
                  let join_object = findExistingJoin(
                    destination,
                    state.inventory_input_data,
                    loadedDataset.filename
                  );
                  if (!join_object) {
                    join_object = {
                      file1: state.inventory_input_data,
                      file1_allCols: state.inventory_input_data_cols,
                      file2: loadedDataset.filename,
                      file2_allCols: loadedDataset.data_attributes.cols,
                      file1_col: [],
                      file2_col: [],
                      join_type: "left",
                    };
                  }
                  operations[destinationKey].push(join_object);
                } else {
                  const last_object =
                    operations[destinationKey][
                      operations[destinationKey].length - 1
                    ];
                  let file1_name = `${last_object.file1}+${last_object.file2}`;
                  let file1_allCols = removeDuplicates([
                    ...last_object.file1_allCols,
                    ...last_object.file2_allCols,
                  ]);
                  let join_object = findExistingJoin(
                    destination,
                    file1_name,
                    loadedDataset.filename
                  );
                  if (!join_object) {
                    join_object = {
                      file1: file1_name,
                      file1_allCols: file1_allCols,
                      file2: loadedDataset.filename,
                      file2_allCols: loadedDataset.data_attributes.cols,
                      file1_col: [],
                      file2_col: [],
                      join_type: "left",
                    };
                  }
                  operations[destinationKey].push(join_object);
                }
              }
            } else if (
              state.inventory_datasets_tags.includes(currentDatasetTag)
            ) {
              console.log(loadedDataset);
              if (loadedDataset.filename !== state.inventory_input_data) {
                let destination = new_join_operations_inventory;
                let destinationKey = "join_operations_inventory";
                destination = destination.map((op) =>
                  JSON.parse(JSON.stringify(op))
                );
                if (operations[destinationKey].length === 0) {
                  let join_object = findExistingJoin(
                    destination,
                    state.inventory_input_data,
                    loadedDataset.filename
                  );
                  if (!join_object) {
                    join_object = {
                      file1: state.inventory_input_data,
                      file1_allCols: state.inventory_input_data_cols,
                      file2: loadedDataset.filename,
                      file2_allCols: loadedDataset.data_attributes.cols,
                      file1_col: [],
                      file2_col: [],
                      join_type: "left",
                    };
                  }
                  operations[destinationKey].push(join_object);
                } else {
                  const last_object =
                    operations[destinationKey][
                      operations[destinationKey].length - 1
                    ];
                  let file1_name = `${last_object.file1}+${last_object.file2}`;
                  let file1_allCols = removeDuplicates([
                    ...last_object.file1_allCols,
                    ...last_object.file2_allCols,
                  ]);
                  let join_object = findExistingJoin(
                    destination,
                    file1_name,
                    loadedDataset.filename
                  );
                  if (!join_object) {
                    join_object = {
                      file1: file1_name,
                      file1_allCols: file1_allCols,
                      file2: loadedDataset.filename,
                      file2_allCols: loadedDataset.data_attributes.cols,
                      file1_col: [],
                      file2_col: [],
                      join_type: "left",
                    };
                  }
                  operations[destinationKey].push(join_object);
                }
              }
            }
          }
        });
      });

      // Set the reconstructed join arrays in the state
      state.join_operations = operations["join_operations"];
      state.join_operations_future = operations["join_operations_future"];
      state.join_operations_bom = operations["join_operations_bom"];
      state.join_operations_forecast = operations["join_operations_forecast"];
      state.join_operations_supply_item_master =
        operations["join_operations_supply_item_master"];
      state.join_operations_new_product =
        operations["join_operations_new_product"];
      state.join_operations_simple_disaggregation_mapping =
        operations["join_operations_simple_disaggregation_mapping"];
      state.join_operations_inventory = operations["join_operations_inventory"];
      state.join_operations_transition_item =
        operations["join_operations_transition_item"];
    },

    updateJoinDataByPath: (state, action) => {
      const { path, value } = action.payload;
      console.log("Trying to update at path :", path, "With value : ", value);
      const updateNestedByPath = (obj, path, value) => {
        const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
        const updateRecursively = (currentObj, keys) => {
          const [firstKey, ...remainingKeys] = keys;

          // Check if firstKey is a numeric index
          const index = Number(firstKey);
          if (!isNaN(index)) {
            // Handle array case
            if (remainingKeys.length === 0) {
              currentObj[index] = castValue(currentObj[index], value);
            } else {
              currentObj[index] = updateRecursively(
                currentObj[index],
                remainingKeys
              );
            }
          } else {
            // Handle object case
            if (remainingKeys.length === 0) {
              currentObj[firstKey] = castValue(currentObj[firstKey], value);
            } else {
              currentObj[firstKey] = updateRecursively(
                currentObj[firstKey],
                remainingKeys
              );
            }
          }
          return currentObj;
        };

        return updateRecursively(obj, pathParts);
      };

      const castValue = (existingValue, newValue) => {
        if (
          existingValue === null ||
          existingValue === undefined ||
          newValue === null
        ) {
          return newValue;
        }

        const typeOfExistingValue = typeof existingValue;
        switch (typeOfExistingValue) {
          case "number":
            return Number(newValue);
          case "boolean":
            return newValue === "true" || newValue === true;
          case "object":
            if (Array.isArray(existingValue)) {
              return Array.isArray(newValue) ? newValue : [newValue];
            }
            return typeof newValue === "object" ? newValue : {};
          case "string":
            return String(newValue);
          default:
            return newValue;
        }
      };

      state = updateNestedByPath(state, path, value);
    },
    clearMetaData: (state, action) => {
      const { tag, index } = action.payload;
      console.log("Index:", index);
      let remainingDatasets = state.datasetsAdded;
      if (index == null) {
        state.loadedDatasets[tag].forEach((loadedDataset) => {
          if (state.input_data === loadedDataset.filename && tag === "sales") {
            state.input_data = null;
            state.input_data_cols = [];
          }
          if (
            state.bom_input_data === loadedDataset.filename &&
            tag === "bom_mapping"
          ) {
            state.bom_input_data = null;
            state.bom_input_data_cols = [];
          }
          if (
            state.inventory_input_data === loadedDataset.filename &&
            tag === "inventory"
          ) {
            state.inventory_input_data = null;
            state.inventory_input_data_cols = [];
          }
          const index = remainingDatasets.indexOf(loadedDataset.filename);
          if (index !== -1) {
            remainingDatasets.splice(index, 1);
          }
        });

        state.needToJoin = [...new Set(remainingDatasets)].length > 1;
        state.datasetsAdded = remainingDatasets;
        state.loadedDatasets[tag] = [];
        state.datasetsLoaded[tag] = false;
      } else {
        const loadedDataset = state.loadedDatasets[tag][index];
        if (state.input_data === loadedDataset.filename && tag === "sales") {
          state.input_data = null;
          state.input_data_cols = [];
        }
        if (
          state.bom_input_data === loadedDataset.filename &&
          tag === "bom_mapping"
        ) {
          state.bom_input_data = null;
          state.bom_input_data_cols = [];
        }
        if (
          state.inventory_input_data === loadedDataset.filename &&
          tag === "inventory"
        ) {
          state.inventory_input_data = null;
          state.inventory_input_data_cols = [];
        }
        const idx = remainingDatasets.indexOf(loadedDataset.filename);
        if (idx !== -1) {
          remainingDatasets.splice(idx, 1);
        }
        state.needToJoin = [...new Set(remainingDatasets)].length > 1;
        state.datasetsAdded = remainingDatasets;
        const filteredTagDatasets = state.loadedDatasets[tag].filter(
          (dataset, ind) => index !== ind
        );
        console.log("final datasets list", filteredTagDatasets);
        state.loadedDatasets[tag] = filteredTagDatasets;
        state.datasetsLoaded[tag] = filteredTagDatasets.length > 0;
      }
    },
    addMoreData: (state, action) => {
      const tag = action.payload;
      state.currentDatasetTag = tag;
      state.tagFieldConfig = getTagFieldConfig(tag);
    },
    setPath: (state, action) => {
      state.path = action.payload;
    },
    setLogs: (state, action) => {
      state.logs = action.payload;
    },
    setLoadedDataCSV: (state, action) => {
      state.loadedDatasetCSV = action.payload;
    },

    setSearchString(state, action) {
      state.experimentFiltersState.searchString = action.payload;
    },
    setCreatedStartDate(state, action) {
      state.experimentFiltersState.createdAt.startDate = action.payload;
    },
    setCreatedEndDate(state, action) {
      state.experimentFiltersState.createdAt.endDate = action.payload;
    },
    setUpdatedStartDate(state, action) {
      state.experimentFiltersState.updatedAt.startDate = action.payload;
    },
    setUpdatedEndDate(state, action) {
      state.experimentFiltersState.updatedAt.endDate = action.payload;
    },
    setModuleNames(state, action) {
      state.experimentFiltersState.moduleNames = action.payload;
    },
    setIsProduction(state, action) {
      state.experimentFiltersState.isProduction = action.payload;
    },
    setStatuses(state, action) {
      state.experimentFiltersState.statuses = action.payload;
    },

    resetFilters(state) {
      state.experimentFiltersState = initialState.experimentFiltersState;
    },

    clearCache(state) {
      state.defaultConfig = initialState.defaultConfig;
      state.currentDatasetTag = initialState.currentDatasetTag;
      state.mandatory_datasets_tags = initialState.mandatory_datasets_tags;
      state.optional_datasets_tags = initialState.optional_datasets_tags;
      state.future_datasets_tags = initialState.future_datasets_tags;
      state.bom_datasets_tags = initialState.bom_datasets_tags;
      state.forecast_datasets_tags = initialState.forecast_datasets_tags;
      state.new_product_datasets_tags = initialState.new_product_datasets_tags;
      state.simple_disaggregation_mapping_datasets_tags =
        initialState.simple_disaggregation_mapping_datasets_tags;
      state.rewrite_forecast_datasets_tags =
        initialState.rewrite_forecast_datasets_tags;
      state.moduleName = initialState.moduleName;
      state.loadedDatasets = initialState.loadedDatasets;
      state.loadedDataset = initialState.loadedDataset;
      state.renderDatasets = initialState.renderDatasets;
      state.tagFieldConfig = initialState.tagFieldConfig;
      state.datasetsLoaded = initialState.datasetsLoaded;
      state.dataSteps = initialState.dataSteps;
      state.path = initialState.path;
      state.renderDataStepsList = initialState.renderDataStepsList;
      state.columnsInUse = initialState.columnsInUse;
      state.areMandatoryFieldsFilled = initialState.areMandatoryFieldsFilled;
      state.loadedDatasetCSV = initialState.loadedDatasetCSV;
      state.experiment_config = initialState.experiment_config;
      state.input_data = initialState.input_data;
      state.inventory_input_data = initialState.inventory_input_data;
      state.inventory_input_data_cols = initialState.inventory_input_data_cols;
      state.join_operations = initialState.join_operations;
      state.input_data_cols = initialState.input_data_cols;
      state.join_operations_future = initialState.join_operations_future;
      state.join_operations_forecast = initialState.join_operations_forecast;
      state.join_operations_supply_item_master =
        initialState.join_operations_supply_item_master;

      state.join_operations_inventory = initialState.join_operations_inventory;
      state.join_operations_new_product =
        initialState.join_operations_new_product;
      state.join_operations_transition_item =
        initialState.join_operations_transition_item;
      state.join_operations_simple_disaggregation_mapping =
        initialState.join_operations_simple_disaggregation_mapping;
      state.join_operations_bom = initialState.join_operations_bom;
      state.datasetsAdded = initialState.datasetsAdded;
      state.needToJoin = initialState.needToJoin;
      state.joinsAdded = initialState.joinsAdded;
      state.logs = initialState.logs;
      state.currentExperimentStatus = initialState.currentExperimentStatus;
      state.bom_input_data = initialState.bom_input_data;
      state.bom_input_data_cols = initialState.bom_input_data_cols;
      state.preprocessMetadata = initialState.preprocessMetadata;
    },
  },
});

export const {
  setCache,
  selectDatasetCard,
  clearCache,
  updateLoadedDatasetByPath,
  setMetadata,
  setError,
  setLoading,
  addMetaData,
  clearMetaData,
  addMoreData,
  setPath,
  addExperiment,
  loadExperiments,
  setLoadedDataCSV,
  setExperimentConfig,
  resetExperimentConfig,
  loadJoins,
  updateJoinDataByPath,
  setJoinsAdded,
  setLogs,
  setExperimentStatus,
  setTabValue,
  setPreprocessMetadata,
  editMetaData,
  setSearchString,
  setCreatedStartDate,
  setCreatedEndDate,
  setUpdatedStartDate,
  setUpdatedEndDate,
  setModuleNames,
  setIsProduction,
  setStatuses,
  resetFilters,
} = experimentSlice.actions;
export default experimentSlice.reducer;
