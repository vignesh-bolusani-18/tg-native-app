// src/redux/slices/experimentSlice.js
import { createSlice, current } from "@reduxjs/toolkit";
import {
  areMandatoryFieldsFilled,
  getColumnInUse,
  updateDataBlock,
} from "../../utils/moduleUtils";
import {
  cleanFillNA,
  getDataSteps,
  useDataSteps,
} from "../../utils/getDataStepsConfigurable";

import { loadDatasets } from "./datasetSlice";
import { getContextBuckets } from "../../utils/Context Utils Configurable/getContextBuckets";
import { uploadJsonToS3 } from "../../utils/s3Utils";
import moment from "moment";
import { getAdvanceSettingsBucket } from "../../utils/Advanced Settings Configurable/getAdvanceSettingsBuckets";
import { removeDuplicates } from "../../utils/removeDuplicates";
import { transformLoadedDataSet } from "../../utils/transformLoadedDatasetsConfigurable";
import updateObjectByPath from "../../utils/updateObjectByPath";
import { processJsonWithContext } from "../../utils/processJsonWithContext";
import { processConfirmAddDataTransformation } from "../../utils/processConfirmAddDataTransformation";
import { cleanUpConfigObjects } from "../../utils/cleanUpConfigObjects";

const initialState = {
  ui_config: {
    datasets: {
      dataset_groups: {
        mandatory_datasets_tags: [],
        optional_datasets_tags: ["item_master", "others"],
        future_datasets_tags: ["future"],
        bom_datasets_tags: ["bom_mapping", "bom_inventory", "bomothers"],
        forecast_datasets_tags: ["forecast"],
        new_product_datasets_tags: ["new_product"],
        simple_disaggregation_mapping_datasets_tags: [
          "simple_disaggregation_mapping",
        ],
        rewrite_forecast_datasets_tags: ["rewrite_forecast"],
      },
      dataset_info: {},
    },
  },
  show_dataset_groups: {},
  defaultConfig: null,
  experiments_list: [],
  currentDatasetTag: "none",
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
  },
  dialogState: {
    dialogOpen: false,
    dialogDatasetTag: "",
    dialogDatasetTitle: "",
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
  RiskColumn: null,
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
  bom_input_data_cols: [],
  join_operations: [],
  join_operations_future: [],
  join_operations_bom: [],
  join_operations_forecast: [],
  join_operations_new_product: [],
  join_operations_simple_disaggregation_mapping: [],
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
  config: null,
  dateColumns: ["None"],
  numericColumns: ["None"],
  categoricalColumns: ["None"],
  contextBuckets: null,
  advanceSettingBuckets: null,
  contextConfig: null,
  currentBucket: "None",
  currentAdvanceSettingBucket: "None",
  currentFeatureGroup: "None",
  contextBucketsFilledFlags: {},
  advanceSettingBucketsFilledFlags: {},
  isNoInstanceAvailable: false,
  advancedSettingConfig: null,
  enrichment_bydate: [],
  enrichment: {
    operation: "enrich_data",
    kwargs: {
      dimension: "None",
      value: null,
      date_range: [null, null],
      enrichment_type: "uplift",
      enrichment_value: 0,
    },
  },
  operations: [],
  adjust_data: {
    operation: "adjust_data",
    kwargs: {
      dimension: "None",
      value: null,
      date_range: [null, null],
      adjustment_type: "uplift",
      adjustment_value: 0,
      time_steps: 1,
      future_history: "history",
    },
  },
  exogenous_features: [],
  exogenous_feature: {
    new_column: null,
    start_dt: [],
    end_dt: [],
  },
  datePair: {
    start_dt: null,
    end_dt: null,
  },
  trial_params_mlp: [],
  trial_params_lstm: [],
  trial_params_gru: [],
  isMLSettingsDone: false,
  isFeatureSettingsDone: false,
  job_list: [],
  showBomDataset: false,
  showFutureDataset: false,
  showForecastDataset: false,
  showNewProductsDataset: false,
  showSimpleDisaggregateMappingDataset: false,
  showForecastRewriteDataset: false,
  taggedOptions: ["None"],
  editedFiles: {},
  editHistories: {},
  hasConflict: false,
  isBOMDataLoaded: false,
  dashboardLoading: false,
};

const moduleSlice = createSlice({
  name: "module",
  initialState,
  reducers: {
    loadExperiments(state, action) {
      state.experiments_list = action.payload;
    },
    addExperiment(state, action) {
      state.experiments_list.push(action.payload);
    },
    setDatasetInfo(state, action) {
      state.ui_config.datasets.dataset_info = action.payload;
    },
    setConfigCache(state, action) {
      const { ai_config, ui_config } = action.payload;

      // Initialize config with default values
      state.config = {
        ...ai_config,
        etl: {
          ...ai_config.etl,
          inventory_input_data:
            ai_config.etl?.loaded_datasets?.["inventory"]?.length > 0
              ? ai_config.etl?.loaded_datasets?.["inventory"][0].filename
              : null,
          inventory_input_data_cols:
            ai_config.etl?.loaded_datasets?.["inventory"]?.length > 0
              ? ai_config.etl?.loaded_datasets?.["inventory"][0]
                  ?.data_attributes?.cols
              : [],
        },
        scenario_plan: {
          ...ai_config.scenario_plan,
          file_type: ai_config.scenario_plan?.file_type ?? ["csv"],
          historical_horizon_snop:
            ai_config.scenario_plan?.historical_horizon_snop ?? 4,
          multiprocessing_disaggregation:
            ai_config.scenario_plan?.multiprocessing_disaggregation ?? false,
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
            ai_config.scenario_plan?.multiprocessing_inventory ?? false,
          inventory_constraints: (() => {
            const constraints = {
              ...ai_config.scenario_plan?.inventory_constraints,
              disaggregate_inventory_metrics:
                ai_config.scenario_plan?.inventory_constraints
                  ?.disaggregate_inventory_metrics ?? [],
              disaggregate_inventory_metrics_history:
                ai_config.scenario_plan?.inventory_constraints
                  ?.disaggregate_inventory_metrics_history ?? 90,
              disaggregate_inventory_metrics_granularity:
                ai_config.scenario_plan?.inventory_constraints
                  ?.disaggregate_inventory_metrics_granularity ?? [],
              unconstriant_stock_transfer:
                ai_config.scenario_plan?.inventory_constraints
                  ?.unconstriant_stock_transfer ?? false,
              stock_transfer_adjusted_reorder:
                ai_config.scenario_plan?.inventory_constraints
                  ?.stock_transfer_adjusted_reorder ?? false,
              stock_transfer_zone:
                typeof ai_config.scenario_plan?.inventory_constraints
                  ?.stock_transfer_zone === "string"
                  ? ai_config.scenario_plan.inventory_constraints
                      .stock_transfer_zone === "None"
                    ? []
                    : [
                        ai_config.scenario_plan.inventory_constraints
                          .stock_transfer_zone,
                      ]
                  : Array.isArray(
                      ai_config.scenario_plan?.inventory_constraints
                        ?.stock_transfer_zone
                    )
                  ? ai_config.scenario_plan.inventory_constraints
                      .stock_transfer_zone
                  : [],
              disaggregation_type:
                ai_config.scenario_plan?.inventory_constraints
                  ?.disaggregation_type ?? "ml_based_disaggregation",
              inventory_distribution_key:
                ai_config.scenario_plan?.inventory_constraints
                  ?.inventory_distribution_key ?? [],
              disaggregation_distribution_key:
                ai_config.scenario_plan?.inventory_constraints
                  ?.disaggregation_distribution_key ?? [],
              item_id_dimensions:
                ai_config.scenario_plan?.inventory_constraints
                  ?.item_id_dimensions ?? [],
              facility_dimensions:
                ai_config.scenario_plan?.inventory_constraints
                  ?.facility_dimensions ?? [],
              zone_dimensions:
                ai_config.scenario_plan?.inventory_constraints
                  ?.zone_dimensions ?? [],
              sales_joining_keys:
                ai_config.scenario_plan?.inventory_constraints
                  ?.sales_joining_keys ?? [],
              inventory_joining_keys:
                ai_config.scenario_plan?.inventory_constraints
                  ?.inventory_joining_keys ?? [],
              optimize_cutsize:
                ai_config.scenario_plan?.inventory_constraints
                  ?.optimize_cutsize ?? false,
              size_column:
                ai_config.scenario_plan?.inventory_constraints?.size_column ??
                "None",
              all_size_level:
                ai_config.scenario_plan?.inventory_constraints
                  ?.all_size_level ?? "None",
            };

            // ❌ Remove ml_based_disaggregation if present
            delete constraints.ml_based_disaggregation;

            return constraints;
          })(),

          new_product_forecasting: {
            ...ai_config.scenario_plan?.new_product_forecasting,
            new_prod_granularity:
              ai_config.scenario_plan?.new_product_forecasting
                ?.new_prod_granularity ?? [],
            data_generation_dimension:
              ai_config.scenario_plan?.new_product_forecasting
                ?.data_generation_dimension ?? [],
            days_to_be_generated:
              ai_config.scenario_plan?.new_product_forecasting
                ?.days_to_be_generated ?? 30,
            new_product_dimensions:
              ai_config.scenario_plan?.new_product_forecasting
                ?.new_product_dimensions ?? [],
            new_product_driver:
              ai_config.scenario_plan?.new_product_forecasting
                ?.new_product_driver ?? [],
            new_product_replenishment_constraints:
              ai_config.scenario_plan?.new_product_forecasting
                ?.new_product_replenishment_constraints ?? [],
          },

          simple_disaggr: {
            ...ai_config.scenario_plan?.simple_disaggr,
            bundle_mapping_granularity:
              ai_config.scenario_plan?.simple_disaggr
                ?.bundle_mapping_granularity ?? "None",
            bundle_forecast_granularity:
              ai_config.scenario_plan?.simple_disaggr
                ?.bundle_forecast_granularity ?? "None",
            simple_mapping:
              ai_config.scenario_plan?.simple_disaggr?.simple_mapping ?? "None",
            simple_disaggregation_quantity:
              ai_config.scenario_plan?.simple_disaggr
                ?.simple_disaggregation_quantity ?? "None",
            ts_id_columns_simple_disaggr:
              ai_config.scenario_plan?.simple_disaggr
                ?.ts_id_columns_simple_disaggr ?? [],
          },

          pricing_constraints: {
            ...ai_config.scenario_plan?.pricing_constraints,
            budget:
              ai_config.scenario_plan?.pricing_constraints?.budget || "None",
          },
          accuracy_calculation: ai_config.scenario_plan?.accuracy_calculation
            ? ai_config.scenario_plan.accuracy_calculation
            : false,
          current_sales_including_open_po: ai_config.scenario_plan
            ?.current_sales_including_open_po
            ? ai_config.scenario_plan.current_sales_including_open_po
            : false,
          convert_to_integer: ai_config.scenario_plan?.convert_to_integer
            ? ai_config.scenario_plan.convert_to_integer
            : false,
          demand_alignment_report: {
            ...ai_config.scenario_plan?.demand_alignment_report,
            ts_id_view1:
              ai_config.scenario_plan?.demand_alignment_report?.ts_id_view1 ??
              [],
            enable_aggregation:
              ai_config.scenario_plan?.demand_alignment_report
                ?.enable_aggregation ?? false,
            view0_report_name:
              ai_config.scenario_plan?.demand_alignment_report
                ?.view0_report_name ?? "Default",
            view1_report_name:
              ai_config.scenario_plan?.demand_alignment_report
                ?.view1_report_name ?? "View 1",
            create_future_locked_forecast_data:
              ai_config.scenario_plan?.demand_alignment_report
                ?.create_future_locked_forecast_data ?? false,
            create_future_sales_data:
              ai_config.scenario_plan?.demand_alignment_report
                ?.create_future_sales_data ?? false,
          },
        },

        data: {
          ...ai_config.data,
          filter_target_gt_zero: ai_config.data?.filter_target_gt_zero ?? true,
          week_active_days: ai_config.data?.week_active_days ?? 7,
          date_offset: ai_config.data?.date_offset ?? 0,
        },

        training: {
          ...ai_config.training,
          train_metrics_weight: ai_config.training?.train_metrics_weight ?? 0,
        },
        feature_engg: {
          ...ai_config.feature_engg,
          backfill_time_series:
            ai_config.feature_engg?.backfill_time_series ?? false,
          offset_params: {
            ...ai_config.feature_engg?.offset_params,
            function_types: ai_config.feature_engg?.offset_params
              ?.function_types ?? ["linear_regression"],
          },
        },
        stacking: {
          ...ai_config.stacking,
          include_train_metrics:
            ai_config.stacking?.include_train_metrics ?? false,
          data_generation_dimension_recents:
            ai_config.stacking?.data_generation_dimension_recents ?? [],
          rl_agents: ai_config.stacking?.rl_agents ?? false,
          editedFiles:
            cleanUpConfigObjects(
              ai_config.stacking?.editedFiles ?? {},
              ai_config.common.job_id,
              ai_config.common.parent_job_id
            ) ?? {},
        },
        tables_filter_data: ai_config.tables_filter_data ?? {},
        byor_base_datasets: ai_config.byor_base_datasets ?? [],
        deleted_base_datasets: ai_config.deleted_base_datasets ?? [],
        resource_config: ai_config.resource_config ?? {
          instance_size: "4xLarge",
        },
        dashboard_settings: ai_config.dashboard_settings ?? {
          show_forecasting_pivot_disaggregated:
            ai_config.dashboard_settings
              ?.show_forecasting_pivot_disaggregated ?? false,
          hide_forecasting_pivot_table:
            ai_config.dashboard_settings?.hide_forecasting_pivot_table ?? false,
          forecast_data_reference:
            ai_config.dashboard_settings?.forecast_data_reference ?? [],
          align_period_labels_to_start:
            ai_config.dashboard_settings?.align_period_labels_to_start !==
            undefined
              ? ai_config.dashboard_settings?.align_period_labels_to_start
              : false,
        },
        agent_settings: {
          ...ai_config.agent_settings,
          forecast_type_for_reward:
            ai_config.agent_settings?.forecast_type_for_reward ?? "ML Forecast",
          forecast_deviation: ai_config.agent_settings?.forecast_deviation ?? 1,
          test_horizon:
            ai_config.agent_settings?.test_horizon ??
            ai_config.data?.validation_horizon ??
            2,
          accuracy_by_test_horizon:
            ai_config.agent_settings?.accuracy_by_test_horizon ?? false,
          experiments_history:
            ai_config.agent_settings?.experiments_history ?? [],
        },
      };

      if (ai_config.show_dataset_groups) {
        state.show_dataset_groups = ai_config.show_dataset_groups;
      } else {
        state.show_dataset_groups["future_datasets_tags"] =
          ai_config.showFutureDataset ?? false;
        state.show_dataset_groups["new_product_datasets_tags"] =
          ai_config.showNewProductsDataset ?? false;
        state.show_dataset_groups[
          "simple_disaggregation_mapping_datasets_tags"
        ] = ai_config.showSimpleDisaggregateMappingDataset ?? false;
        state.show_dataset_groups["forecast_datasets_tags"] =
          ai_config.showForecastDataset ?? false;
        state.show_dataset_groups["rewrite_forecast_datasets_tags"] =
          ai_config.showForecastRewriteDataset ?? false;
        state.show_dataset_groups["bom_datasets_tags"] =
          ai_config.showBomDataset ?? false;
      }
      // Set other config-related state
      state.showBomDataset = ai_config.showBomDataset ?? false;
      state.showFutureDataset = ai_config.showFutureDataset ?? false;
      state.showNewProductsDataset = ai_config.showNewProductsDataset ?? false;
      state.showSimpleDisaggregateMappingDataset =
        ai_config.showSimpleDisaggregateMappingDataset ?? false;
      state.showForecastDataset = ai_config.showForecastDataset ?? false;
      state.showForecastRewriteDataset =
        ai_config.showForecastRewriteDataset ?? false;

      state.defaultConfig = { ...state.config };
      state.contextConfig = initialState.contextConfig;
      state.contextBucketsFilledFlags = initialState.contextBucketsFilledFlags;
      state.advanceSettingBucketsFilledFlags =
        initialState.advanceSettingBucketsFilledFlags;

      // Calculate forecast dates based on config parameters
      const frequency = ai_config?.data?.frequency;
      const forecastHorizon = ai_config?.data?.forecast_horizon;
      const activityEndDate = ai_config?.etl?.activity_end_date;

      let startDate, endDate;

      if (activityEndDate) {
        // If activity_end_date exists, use it as reference
        startDate = moment(activityEndDate);
      } else {
        // Otherwise use current date
        startDate = moment();
      }

      // Calculate end date based on frequency and horizon
      switch (frequency) {
        case "D":
          endDate = startDate.clone().add(forecastHorizon, "days");
          break;
        case "W":
          endDate = startDate.clone().add(forecastHorizon, "weeks");
          break;
        case "M":
          endDate = startDate.clone().add(forecastHorizon, "months");
          break;
        case "Q":
          endDate = startDate.clone().add(forecastHorizon * 3, "months");
          break;
        case "Y":
          endDate = startDate.clone().add(forecastHorizon, "years");
          break;
        case "H":
          endDate = startDate.clone().add(forecastHorizon, "hours");
          break;
        case "30T":
          endDate = startDate.clone().add(forecastHorizon * 30, "minutes");
          break;
        case "15T":
          endDate = startDate.clone().add(forecastHorizon * 15, "minutes");
          break;
        case "10T":
          endDate = startDate.clone().add(forecastHorizon * 10, "minutes");
          break;
        case "5T":
          endDate = startDate.clone().add(forecastHorizon * 5, "minutes");
          break;
        default:
          endDate = startDate.clone().add(forecastHorizon, "months");
      }

      // Set the calculated dates in enrichment object
      state.enrichment = {
        ...initialState.enrichment,
        kwargs: {
          ...initialState.enrichment.kwargs,
          date_range: [
            startDate.format("YYYY-MM-DD"),
            endDate.format("YYYY-MM-DD"),
          ],
        },
      };
      state.adjust_data = initialState.adjust_data;
      state.exogenous_feature = initialState.exogenous_feature;

      if (ai_config.common.job_id === null) {
        state.config.project_setup = {
          project_name: "",
          usecase_name: ai_config.common.module_name,
        };

        state.job_list = initialState.job_list;
        state.operations = ai_config?.preprocess?.serial_ops[0]?.operations;
        if (
          ai_config?.preprocess?.serial_ops[0]?.operations?.length === 0 ||
          ai_config?.preprocess?.serial_ops[0]?.operations[0]?.operation !==
            "aggregate_data"
        ) {
          state.operations = [
            {
              operation: "aggregate_data",
              kwargs: {
                grouping_columns: [],
                aggregations: {},
              },
            },
            ...state.operations,
          ];
        }

        state.exogenous_features = ai_config?.feature_engg?.exogenous_features;
        if (ai_config?.stacking?.enrichment_bydate !== undefined) {
          state.enrichment_bydate = ai_config?.stacking?.enrichment_bydate;
        }

        state.trial_params_mlp = ai_config?.training?.models?.MLP?.trial_params;
        state.trial_params_lstm =
          ai_config?.training?.models?.LSTM?.trial_params;
        state.trial_params_gru = ai_config?.training?.models?.GRU?.trial_params;
        state.show_dataset_groups = initialState.show_dataset_groups;
        state.showBomDataset = initialState.showBomDataset;
        state.showFutureDataset = initialState.showFutureDataset;
        state.showNewProductsDataset = initialState.showNewProductsDataset;
        state.showSimpleDisaggregateMappingDataset =
          initialState.showSimpleDisaggregateMappingDataset;
        state.showForecastDataset = initialState.showForecastDataset;
        state.showForecastRewriteDataset =
          initialState.showForecastRewriteDataset;
      } else {
        state.editHistories =
          cleanUpConfigObjects(
            ai_config.editHistories ?? {},
            ai_config.common.job_id,
            ai_config.common.parent_job_id
          ) ?? {};

        state.editedFiles =
          cleanUpConfigObjects(
            ai_config.stacking?.editedFiles ?? {},
            ai_config.common.job_id,
            ai_config.common.parent_job_id
          ) ?? {};
        state.contextBuckets = ai_config?.contextBuckets || {};
        state.contextBucketsFilledFlags =
          ai_config?.contextBucketsFilledFlags || {};
        state.advanceSettingBuckets = ai_config?.advanceSettingBuckets || {};
        state.advanceSettingBucketsFilledFlags =
          ai_config?.advanceSettingBucketsFilledFlags || {};
        state.operations =
          ai_config?.preprocess?.serial_ops[0]?.operations ||
          initialState.operations;

        if (
          ai_config?.preprocess?.serial_ops[0]?.operations?.length === 0 ||
          ai_config?.preprocess?.serial_ops[0]?.operations[0]?.operation !==
            "aggregate_data"
        ) {
          state.operations = [
            {
              operation: "aggregate_data",
              kwargs: {
                grouping_columns: [],
                aggregations: {},
              },
            },
            ...state.operations,
          ];
        }
        state.exogenous_features =
          ai_config?.feature_engg?.exogenous_features || [];
        state.enrichment_bydate = ai_config?.stacking?.enrichment_bydate || [];
        state.trial_params_mlp = ai_config?.training?.models?.MLP?.trial_params;
        state.trial_params_lstm =
          ai_config?.training?.models?.LSTM?.trial_params;
        state.trial_params_gru = ai_config?.training?.models?.GRU?.trial_params;

        state.isMLSettingsDone = ai_config?.isMLSettingsDone || false;
        state.isFeatureSettingsDone = ai_config?.isFeatureSettingsDone || false;
      }

      // Reset column arrays
      state.allColumns = ["None"];
      state.dateColumns = ["None"];
      state.numericColumns = ["None"];
      state.categoricalColumns = ["None"];

      // Then do the setCache task from moduleSlice
      state.ui_config = ui_config;
      state.defaultConfig = ai_config;
      state.hasParquetFiles =
        ai_config?.scenario_plan?.file_type?.includes("parquet");
      state.moduleName = ai_config.common.module_name;
      state.tabValue = "0";

      // Populate renderDatasets
      // Get all dataset group keys and populate renderDatasets
      Object.entries(state.ui_config.datasets.dataset_groups).forEach(
        ([groupKey, tags]) => {
          // Convert group key to renderDatasets key by removing "_tags" suffix
          const renderKey = groupKey.replace("_tags", "");

          // Initialize array if undefined
          if (!state.renderDatasets[renderKey]) {
            state.renderDatasets[renderKey] = [];
          }

          // Populate datasets for this group
          tags.forEach((tag) => {
            const datasetObject = ui_config.datasets.dataset_info[tag];
            state.renderDatasets[renderKey].push(datasetObject);
          });
        }
      );

      // Handle loaded datasets
      const allTags = [];
      Object.entries(state.ui_config.datasets.dataset_groups).forEach(
        ([key, tags]) => {
          if (Array.isArray(tags)) {
            allTags.push(...tags);
          }
        }
      );

      if (
        ai_config.common.job_id === "job_id" ||
        ai_config.common.job_id === null
      ) {
        allTags.forEach((tag) => {
          if (!state.loadedDatasets[tag]) {
            state.loadedDatasets[tag] = [];
            state.datasetsLoaded[tag] = false;
          }
        });
      } else {
        state.loadedDatasets = ai_config.loadedDatasets;
        state.datasetsLoaded = ai_config.datasetsLoaded;
        state.joinsAdded = ai_config.joinsAdded;
        state.needToJoin = ai_config.needToJoin;
        if (ai_config.datasetsAdded !== undefined) {
          state.datasetsAdded = ai_config.datasetsAdded;
        } else {
          let datasetsAdded = [];
          Object.keys(ai_config.loadedDatasets).forEach((key) => {
            if (ai_config.datasetsLoaded[key]) {
              ai_config.loadedDatasets[key].forEach((dataset) => {
                datasetsAdded.push(dataset.filename);
              });
            }
          });
          state.datasetsAdded = [...new Set(datasetsAdded)];
        }
        // Loop through join input data mapping from UI config
        for (const [key, mapping] of Object.entries(
          state.ui_config.join_input_data_mapping
        )) {
          // Get paths from mapping
          const inputDataPath = mapping.input_data_path;
          const inputDataColsPath = mapping.input_data_cols_path;

          // Set input data by following the path in ai_config
          const [inputDataRoot, inputDataKey] = inputDataPath.split(".");
          state[key] = ai_config[inputDataRoot][inputDataKey];

          // Set input data cols
          const colsKey = inputDataColsPath.split(".")[1];
          state[colsKey] =
            ai_config.etl.loaded_datasets[key]?.length > 0
              ? ai_config.etl.loaded_datasets[key][0].data_attributes.cols
              : initialState[colsKey];
        }
        if (ai_config.joinsAdded) {
          // Loop through join groups from UI config
          state.ui_config.join_groups.forEach((group) => {
            // Get join operation key from group config
            const joinOpKey = group.join_operation_key.split(".")[1];

            // Set join operations from ai_config, defaulting to empty array if undefined
            state[joinOpKey] = ai_config.etl[joinOpKey] || [];
          });
        }
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
            production_plan_metrics: action.payload.scenario_plan
              ?.production_plan?.production_plan_metrics ?? [
              "Beginning Inventory",
              "ML Forecast",
              "Sales",
              "Reorder Plan",
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
    setDashboardLoading(state, action) {
      state.dashboardLoading = action.payload;
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
      console.log("datasetTag", datasetTag);
      if (datasetTag !== "none") {
        state.tagFieldConfig =
          state.ui_config.datasets.dataset_info[datasetTag].tagFieldConfig;
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
          state.loadedDataset,
          state.ui_config.datasets.dataset_info[state.currentDatasetTag]
            .dataStepConfig
        ).data;
        state.renderDataStepsList = getDataSteps(
          state.currentDatasetTag,
          state.loadedDataset,
          state.ui_config.datasets.dataset_info[state.currentDatasetTag]
            .dataStepConfig
        ).renderList;

        state.columnsInUse = getColumnInUse(
          state.loadedDataset,
          JSON.parse(JSON.stringify(state.ui_config.datasets.dataset_info))
        );
        state.areMandatoryFieldsFilled = areMandatoryFieldsFilled(
          state.currentDatasetTag,
          state.loadedDataset,
          state.ui_config.datasets.dataset_info[state.currentDatasetTag]
            .tagFieldConfig
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
    setMetadata: (state, action) => {
      console.log(
        "Set Meta Data Called with module ",
        action.payload.loadedDataset
      );

      const tag = action.payload.currentDatasetTag;
      console.log("TAG", tag);
      state.currentDatasetTag = tag;
      state.tagFieldConfig =
        state.ui_config.datasets.dataset_info[tag].tagFieldConfig;
      state.loadedDataset = { ...action.payload.loadedDataset };
      console.log("HOOO");
      state.renderDataStepsList = initialState.renderDataStepsList;
      state.dataSteps = initialState.dataSteps;
      // Generate new data steps
      const { renderList, data } = getDataSteps(
        tag,
        action.payload.loadedDataset,
        state.ui_config.datasets.dataset_info[tag].dataStepConfig
      );
      state.renderDataStepsList = renderList;

      // Update kwargs immutably
      state.loadedDataset = {
        ...state.loadedDataset,
        data_steps: state.loadedDataset.data_steps.map((step, index) =>
          index === 0 ? { ...step, kwargs: data } : step
        ),
      };

      state.columnsInUse = getColumnInUse(
        action.payload.loadedDataset,
        JSON.parse(JSON.stringify(state.ui_config.datasets.dataset_info))
      );
      console.log("HIII");
      state.areMandatoryFieldsFilled = areMandatoryFieldsFilled(
        tag,
        action.payload.loadedDataset,
        state.ui_config.datasets.dataset_info[tag].tagFieldConfig
      );
      console.log("loadedDataset Updated to: ", state.loadedDataset);
    },
    updateMetadata: (state, action) => {
      state.loadedDataset = { ...state.loadedDataset, ...action.payload };
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
    setNeedToJoin: (state, action) => {
      state.needToJoin = action.payload;
    },

    addMetaData: (state, action) => {
      const { loadedDataset } = action.payload;
      console.log("MetaData at addMetaData", loadedDataset);
      console.log("state.currentDatasetTag", state.currentDatasetTag);
      const cleanedDataset = cleanFillNA(loadedDataset);
      if (state.loadedDatasets[state.currentDatasetTag] === undefined) {
        state.loadedDatasets[state.currentDatasetTag] = [];
      }
      state.loadedDatasets[state.currentDatasetTag].push(cleanedDataset);
      const join_input_data_mapping = state.ui_config.join_input_data_mapping;
      // Get unique input_data_tags from join_groups
      if (
        Object.keys(join_input_data_mapping).includes(state.currentDatasetTag)
      ) {
        const join_input_data_mapping_tag =
          join_input_data_mapping[state.currentDatasetTag];
        if (join_input_data_mapping_tag) {
          state.config = updateObjectByPath(
            state.config,
            join_input_data_mapping_tag.input_data_cols_path,
            loadedDataset.data_attributes.cols
          );
          state.config = updateObjectByPath(
            state.config,
            join_input_data_mapping_tag.input_data_path,
            loadedDataset.filename
          );
        }
      }
      state.datasetsAdded = [...state.datasetsAdded, loadedDataset.filename];

      /*  if (state.currentDatasetTag === "sales") {
        state.input_data_cols = loadedDataset.data_attributes.cols;
      } else if (state.currentDatasetTag === "bom_mapping") {
        state.bom_input_data_cols = loadedDataset.data_attributes.cols;
      }
      if (!state.input_data && state.currentDatasetTag === "sales") {
        state.input_data = loadedDataset.filename;
        state.input_data_cols = loadedDataset.data_attributes.cols;
        state.datasetsAdded = [...state.datasetsAdded, loadedDataset.filename];
        state.config = { ...state.config, etl: { ...state.config.etl, input_data: loadedDataset.filename } };
      } else if (
        !state.bom_input_data &&
        state.currentDatasetTag === "bom_mapping"
      ) {
        state.bom_input_data = loadedDataset.filename;
        state.bom_input_data_cols = loadedDataset.data_attributes.cols;
        state.datasetsAdded = [...state.datasetsAdded, loadedDataset.filename];
        state.config = {
          ...state.config,
          etl: { ...state.config.etl, bom_input_data: loadedDataset.filename },
        };
      } else {
        state.datasetsAdded = [...state.datasetsAdded, loadedDataset.filename];
      } */

      // Check if any join group has more than one loaded dataset
      const checkJoinGroups = () => {
        const joinGroups = state.ui_config.join_groups;
        return joinGroups.some((group) => {
          // Get all datasets for this group including input_data_tag
          const allGroupDatasets = [group.input_data_tag, ...group.datasets];
          // Count how many of these datasets have actual loaded data
          const loadedCount = allGroupDatasets.filter(
            (dataset) =>
              state.loadedDatasets[dataset] &&
              state.loadedDatasets[dataset].length > 0
          ).length;
          // Return true if more than one dataset is loaded
          return loadedCount > 1;
        });
      };

      state.needToJoin = checkJoinGroups();
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
      /*  if (state.currentDatasetTag === "sales") {
        state.input_data_cols = loadedDataset.data_attributes.cols;
      } else if (state.currentDatasetTag === "bom_mapping") {
        state.bom_input_data_cols = loadedDataset.data_attributes.cols;
      }
      if (!state.input_data && tag === "sales") {
        state.input_data = loadedDataset.filename;
        state.input_data_cols = loadedDataset.data_attributes.cols;
        state.datasetsAdded = [...state.datasetsAdded, loadedDataset.filename];
      } else if (!state.bom_input_data && tag === "bom_mapping") {
        state.bom_input_data = loadedDataset.filename;
        state.bom_input_data_cols = loadedDataset.data_attributes.cols;
        state.datasetsAdded = [...state.datasetsAdded, loadedDataset.filename];
      } else {
        state.datasetsAdded = [...state.datasetsAdded, loadedDataset.filename];
      } */
      const join_input_data_mapping = state.ui_config.join_input_data_mapping;
      // Get unique input_data_tags from join_groups
      if (
        Object.keys(join_input_data_mapping).includes(state.currentDatasetTag)
      ) {
        const join_input_data_mapping_tag =
          join_input_data_mapping[state.currentDatasetTag];
        if (join_input_data_mapping_tag) {
          state.config = updateObjectByPath(
            state.config,
            join_input_data_mapping_tag.input_data_cols_path,
            loadedDataset.data_attributes.cols
          );
          state.config = updateObjectByPath(
            state.config,
            join_input_data_mapping_tag.input_data_path,
            loadedDataset.filename
          );
        }
      }
      state.datasetsAdded = [...state.datasetsAdded, loadedDataset.filename];

      const checkJoinGroups = () => {
        const joinGroups = state.ui_config.join_groups;
        return joinGroups.some((group) => {
          // Get all datasets for this group including input_data_tag
          const allGroupDatasets = [group.input_data_tag, ...group.datasets];
          // Count how many of these datasets have actual loaded data
          const loadedCount = allGroupDatasets.filter(
            (dataset) =>
              state.loadedDatasets[dataset] &&
              state.loadedDatasets[dataset].length > 0
          ).length;
          // Return true if more than one dataset is loaded
          return loadedCount > 1;
        });
      };

      state.needToJoin = checkJoinGroups();
      state.renderDataStepsList = initialState.renderDataStepsList;
      state.columnsInUse = initialState.columnsInUse;
      state.areMandatoryFieldsFilled = initialState.areMandatoryFieldsFilled;
    },
    loadJoins: (state) => {
      const loadedDatasets = state.loadedDatasets;
      const { join_groups, join_input_data_mapping } = JSON.parse(
        JSON.stringify(state.ui_config)
      );
      // Initialize operations object
      let operations = {};
      let new_join_operations_map = {};

      // Get unique join operation keys from join_groups
      join_groups.forEach((group) => {
        const join_operation_key = group.join_operation_key.split(".").pop();
        console.log("join_operation_key", join_operation_key);
        operations[join_operation_key] = [];
        new_join_operations_map[join_operation_key] = state.config.etl[
          join_operation_key
        ]
          ? [...state.config.etl[join_operation_key]]
          : [];
      });

      console.log("Loaded the joins");
      const findExistingJoin = (operations, file1, file2) => {
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

        return foundJoin || null;
      };

      const removeDuplicates = (array) => {
        const uniqueArray = [...new Set(array)];
        return uniqueArray;
      };
      join_groups.forEach((group) => {
        const join_operation_key = group.join_operation_key.split(".").pop();
        const input_data_mapping =
          join_input_data_mapping[group.input_data_tag];

        // Get nested path values from config
        const getNestedValue = (obj, path) => {
          return path.split(".").reduce((acc, part) => acc && acc[part], obj);
        };

        const input_data = getNestedValue(
          state.config,
          input_data_mapping.input_data_path
        );
        const input_data_cols = getNestedValue(
          state.config,
          input_data_mapping.input_data_cols_path
        );

        group.datasets.forEach((datasetTag) => {
          if (
            loadedDatasets[datasetTag] &&
            loadedDatasets[datasetTag].length > 0
          ) {
            loadedDatasets[datasetTag].forEach((loadedDataset) => {
              if (loadedDataset.filename !== input_data) {
                const destination = new_join_operations_map[join_operation_key];

                if (operations[join_operation_key].length === 0) {
                  let join_object = findExistingJoin(
                    destination,
                    input_data,
                    loadedDataset.filename
                  );

                  if (!join_object) {
                    join_object = {
                      file1: input_data,
                      file1_allCols: input_data_cols,
                      file2: loadedDataset.filename,
                      file2_allCols: loadedDataset.data_attributes.cols,
                      file1_col: [],
                      file2_col: [],
                      join_type: group.join_type,
                    };
                  }
                  operations[join_operation_key].push(join_object);
                } else {
                  const last_object =
                    operations[join_operation_key][
                      operations[join_operation_key].length - 1
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
                      join_type: group.join_type,
                    };
                  }
                  operations[join_operation_key].push(join_object);
                }
              }
            });
          }
        });
      });

      Object.keys(operations).forEach((operation_key) => {
        const join_group = join_groups.find(
          (group) => group.join_operation_key === `etl.${operation_key}`
        );
        if (join_group) {
          state.config.etl[operation_key] = operations[operation_key];
        }
      });
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
          Object.entries(state.ui_config.join_input_data_mapping).forEach(
            ([mappingTag, paths]) => {
              const input_data_key = paths.input_data_path.split(".").pop();
              const input_data_cols_key = paths.input_data_cols_path
                .split(".")
                .pop();
              if (
                tag === mappingTag &&
                state.config.etl[input_data_key] === loadedDataset.filename
              ) {
                state.config.etl[input_data_key] = null;
                state.config.etl[input_data_cols_key] = [];
              }
            }
          );
          const index = remainingDatasets.indexOf(loadedDataset.filename);
          if (index !== -1) {
            remainingDatasets.splice(index, 1);
          }
        });
        const checkJoinGroups = (datasetsAdded) => {
          const joinGroups = state.ui_config.join_groups;
          return joinGroups.some((group) => {
            // Get all datasets for this group including input_data_tag
            const allGroupDatasets = [group.input_data_tag, ...group.datasets];
            // Count how many of these datasets have actual loaded data
            const loadedCount = allGroupDatasets.filter(
              (dataset) => datasetsAdded[dataset]
            ).length;
            // Return true if more than one dataset is loaded
            return loadedCount > 1;
          });
        };
        state.needToJoin = checkJoinGroups(remainingDatasets);
        state.datasetsAdded = remainingDatasets;
        state.loadedDatasets[tag] = [];
        state.datasetsLoaded[tag] = false;
      } else {
        const loadedDataset = state.loadedDatasets[tag][index];
        Object.entries(state.ui_config.join_input_data_mapping).forEach(
          ([mappingTag, paths]) => {
            const input_data_key = paths.input_data_path.split(".").pop();
            const input_data_cols_key = paths.input_data_cols_path
              .split(".")
              .pop();
            if (
              tag === mappingTag &&
              state.config.etl[input_data_key] === loadedDataset.filename
            ) {
              state.config.etl[input_data_key] = null;
              state.config.etl[input_data_cols_key] = [];
            }
          }
        );
        const idx = remainingDatasets.indexOf(loadedDataset.filename);
        if (idx !== -1) {
          remainingDatasets.splice(idx, 1);
        }
        const checkJoinGroups = (datasetsAdded) => {
          const joinGroups = state.ui_config.join_groups;
          return joinGroups.some((group) => {
            // Get all datasets for this group including input_data_tag
            const allGroupDatasets = [group.input_data_tag, ...group.datasets];
            // Count how many of these datasets have actual loaded data
            const loadedCount = allGroupDatasets.filter(
              (dataset) => datasetsAdded[dataset]
            ).length;
            // Return true if more than one dataset is loaded
            return loadedCount > 1;
          });
        };
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
      state.tagFieldConfig =
        state.ui_config.datasets.dataset_info[tag].tagFieldConfig;
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

    setEditedFile: (state, action) => {
      const isValidTimestamp = (timestamp) => {
        return timestamp !== null && /^\d{4}-\d{2}-\d{2}$/.test(timestamp);
      };
      const { fileName, editedCells } = action.payload;
      state.editedFiles[fileName] = editedCells;

      if (!state.config.stacking["editedFiles"]) {
        state.config.stacking["editedFiles"] = {};
        state.contextConfig.stacking["editedFiles"] = {};
      }
      state.config.stacking["editedFiles"][fileName] = editedCells;
      state.contextConfig.stacking["editedFiles"][fileName] = editedCells;
    },
    setEditHistories: (state, action) => {
      const { fileName, editHistory } = action.payload;
      if (!state.config["editHistories"]) {
        state.config["editHistories"] = {};
        state.contextConfig["editHistories"] = {};
      }
      state.editHistories[fileName] = editHistory;
      state.config["editHistories"][fileName] = editHistory;
      state.contextConfig["editHistories"][fileName] = editHistory;
    },
    setNewRows: (state, action) => {
      const { fileName, newRows } = action.payload;
      if (!state.config.stacking["newRows"]) {
        state.config.stacking["newRows"] = {};
      }
      if (!state.contextConfig.stacking["newRows"]) {
        state.contextConfig.stacking["newRows"] = {};
      }

      state.config.stacking["newRows"][fileName] = newRows;
      state.contextConfig.stacking["newRows"][fileName] = newRows;
    },
    setDeletedRows: (state, action) => {
      const { fileName, deletedRows } = action.payload;
      if (!state.config.stacking["deletedRows"]) {
        return;
      }
      if (!state.contextConfig.stacking["deletedRows"]) {
        return;
      }

      state.config.stacking["deletedRows"] = null;
      state.contextConfig.stacking["deletedRows"] = null;
    },
    updateConfig: (state, action) => {
      state.config = { ...state.config, ...action.payload };
      // console.log("Config Updated to: ", state.config);
    },
    setIsNoInstanceAvailable: (state, action) => {
      state.isNoInstanceAvailable = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setHasConflict: (state, action) => {
      state.hasConflict = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setShowDatasetGroups: (state, action) => {
      const { key, value } = action.payload;
      state.show_dataset_groups[key] = value;
    },
    setShowBomDataset: (state, action) => {
      state.showBomDataset = action.payload;
    },
    setShowFutureDataset: (state, action) => {
      state.showFutureDataset = action.payload;
    },
    setShowNewProductsDataset: (state, action) => {
      state.showNewProductsDataset = action.payload;
    },
    setShowForecastRewriteDataset: (state, action) => {
      state.showForecastRewriteDataset = action.payload;
    },

    setshowSimpleDisaggregateMappingDataset: (state, action) => {
      state.showSimpleDisaggregateMappingDataset = action.payload;
    },
    setShowForecastDataset: (state, action) => {
      state.showForecastDataset = action.payload;
    },
    removePlannerAdjustment: (state, action) => {
      const id = action.payload;
      function removeItemAtIndex(array, index) {
        if (index >= 0 && index < array.length) {
          array.splice(index, 1); // Remove 1 item at the specified index
        }
        return array;
      }
      state.operations = removeItemAtIndex(state.operations, id);
    },
    setEnrichmentDimension: (state, action) => {
      state.enrichment.kwargs.dimension = action.payload;
    },
    setEnrichmentValue: (state, action) => {
      state.enrichment.kwargs.value = action.payload;
    },
    setEnrichmentEnrichmentValue: (state, action) => {
      state.enrichment.kwargs.enrichment_value = action.payload;
    },

    setAdjustmentDimension: (state, action) => {
      state.adjust_data.kwargs.dimension = action.payload;
    },
    setAdjustmentValue: (state, action) => {
      state.adjust_data.kwargs.value = action.payload;
    },
    setAdjustmentAdjustValue: (state, action) => {
      state.adjust_data.kwargs.adjustment_value = action.payload;
    },
    setEnrichmentStartDate: (state, action) => {
      state.enrichment.kwargs.date_range[0] = action.payload;
    },
    setEnrichmentEndDate: (state, action) => {
      state.enrichment.kwargs.date_range[1] = action.payload;
    },

    setAdjustmentStartDate: (state, action) => {
      state.adjust_data.kwargs.date_range[0] = action.payload;
    },
    setAdjustmentEndDate: (state, action) => {
      state.adjust_data.kwargs.date_range[1] = action.payload;
    },
    removeEnrichment: (state, action) => {
      const id = action.payload;
      function removeItemAtIndex(array, index) {
        if (index >= 0 && index < array.length) {
          array.splice(index, 1); // Remove 1 item at the specified index
        }
        return array;
      }
      state.enrichment_bydate = removeItemAtIndex(state.enrichment_bydate, id);
    },
    // This will remove ALL instances of the matching rlAgentEnrichment, not just the first.
    removeRLAgentEnrichment: (state, action) => {
      const dictionary = {
        "ML Forecast": "ml_forecast",
        "Upper Bound": "upper_bound",
        "Lower Bound": "lower_bound",
        Offset: "offset",
        P10: "P10",
        P20: "P20",
        P30: "P30",
        P40: "P40",
        P50: "P50",
        P60: "P60",
        P70: "P70",
        P80: "P80",
        P90: "P90",
        P99: "P99",
      };
      const convertDimension = (dimension) => {
        const dict = {
          Forecast_Granularity: "ts_id",
          Cluster: "cluster",
        };
        return dict[dimension] || dimension;
      };
      const rlAgentEnrichment = action.payload;
      state.enrichment_bydate = state.enrichment_bydate.filter(
        (enrichment) =>
          !(
            enrichment.dimension ===
              convertDimension(rlAgentEnrichment.Dimension) &&
            enrichment.value === rlAgentEnrichment.Value &&
            enrichment.enrichment_type === dictionary[rlAgentEnrichment.Type]
          )
      );
    },
    removeExogenousFeature: (state, action) => {
      const id = action.payload;
      function removeItemAtIndex(array, index) {
        if (index >= 0 && index < array.length) {
          array.splice(index, 1); // Remove 1 item at the specified index
        }
        return array;
      }
      state.exogenous_features = removeItemAtIndex(
        state.exogenous_features,
        id
      );
    },

    // common.user_name , vasu
    updateConfigByPath: (state, action) => {
      const { path, value } = action.payload;

      const updateNestedByPath = (obj, path, value) => {
        console.log("path", path);
        console.log("value", value);
        console.log("obj", obj);
        const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
        const updateRecursively = (currentObj, keys) => {
          const [firstKey, ...remainingKeys] = keys;

          // Check if firstKey is a numeric index
          const index = Number(firstKey);
          if (!isNaN(index)) {
            // Handle array case
            console.log("Array case");
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
      console.log("Update Config By Path:");
      console.log("path", path);
      console.log("value", value);

      state.config = updateNestedByPath(state.config, path, value);
    },
    setConfigByKeyValue: (state, action) => {
      const { key, value } = action.payload;
      state.config[key] = value;

      console.log("Config Updated to:", state.config);
    },

    confirmAddData: (state, action) => {
      const { loadedDatasets, datasetsLoaded } = action.payload;
      console.log("loadedDatasets", loadedDatasets);
      console.log("datasetsLoaded", datasetsLoaded);

      // const removeDuplicates = (array) => {
      //   const uniqueArray = [...new Set(array)];
      //   // console.log("group column tags", uniqueArray);
      //   return uniqueArray;
      // };
      // state.config[project_setup] = project_setup;
      // if (!state.config["data_connections"]) {
      state.config["data_connections"] = {};
      state.config["show_dataset_groups"] = state.show_dataset_groups;
      // }
      state.config["loadedDatasets"] = loadedDatasets;
      state.config["datasetsLoaded"] = datasetsLoaded;
      state.config.etl.loaded_datasets = transformLoadedDataSet(
        loadedDatasets,
        JSON.parse(
          JSON.stringify(state.ui_config.datasets.multi_select_dataset_tags)
        )
      );
      //sales data handling
      if (
        loadedDatasets.hasOwnProperty("sales") &&
        loadedDatasets.sales.length > 0
      ) {
        if (state.config.data.ts_id_columns.length === 0) {
          state.config.data.ts_id_columns =
            loadedDatasets.sales[0].field_tags.ts_id_columns;
        }
        if (
          state.config.scenario_plan.inventory_constraints
            .inventory_distribution_key.length === 0
        ) {
          state.config.scenario_plan.inventory_constraints.inventory_distribution_key =
            loadedDatasets.sales[0].field_tags.ts_id_columns;
        }

        if (
          state.config.scenario_plan.inventory_constraints
            .disaggregation_distribution_key.length === 0
        ) {
          state.config.scenario_plan.inventory_constraints.disaggregation_distribution_key =
            loadedDatasets.sales[0].field_tags.ts_id_columns;
        }
        state.config.data.timestamp_column =
          loadedDatasets.sales[0].field_tags.timestamp_column;
        state.config.data.date_format =
          loadedDatasets.sales[0].field_tags.date_format;
        state.config.data.target_column =
          loadedDatasets.sales[0].field_tags.target_column;
      }

      //Forecast data handling
      if (
        loadedDatasets.hasOwnProperty("forecast") &&
        loadedDatasets.forecast.length > 0
      ) {
        loadedDatasets.forecast?.forEach((forecast_data) => {
          for (const key in forecast_data.field_tags) {
            if (
              key !== "timestamp_column" &&
              key !== "date_format" &&
              key !== "comments"
            ) {
              if (
                state.config.data[key] !== undefined ||
                state.config.data[key] !== null
              ) {
                state.config.data[key] = forecast_data.field_tags[key];
              }
            }
            if (key === "comments") {
              state.config.data[key] = [
                ...new Set([
                  ...state.config.data[key],
                  forecast_data.field_tags[key],
                ]),
              ];
            }
          }
        });
      }

      if (state.ui_config.confirm_add_data_trasformation) {
        state.config = processConfirmAddDataTransformation(
          loadedDatasets,
          JSON.parse(JSON.stringify(state.config)),
          JSON.parse(
            JSON.stringify(state.ui_config.confirm_add_data_trasformation)
          )
        );
        /* console.log("config after confirmAddData transformation", state.config);
        debugger; */
        if (state.contextConfig) {
          state.contextConfig = processConfirmAddDataTransformation(
            loadedDatasets,
            JSON.parse(JSON.stringify(state.contextConfig)),
            JSON.parse(
              JSON.stringify(state.ui_config.confirm_add_data_trasformation)
            )
          );
        } else {
          state.contextConfig = processConfirmAddDataTransformation(
            loadedDatasets,
            JSON.parse(JSON.stringify(state.config)),
            JSON.parse(
              JSON.stringify(state.ui_config.confirm_add_data_trasformation)
            )
          );
        }
        /* console.log("contextConfig after confirmAddData transformation", state.contextConfig);
        debugger; */
        //console.log("Config after the add data transformation:", state.config);
      }

      //common code
      state.taggedOptions = initialState.taggedOptions;
      Object.keys(loadedDatasets).forEach((tag) => {
        loadedDatasets[tag].forEach((dataset) => {
          console.log("tag :-" + tag);
          Object.keys(dataset.field_tags).forEach((field) => {
            if (field !== "date_format") {
              const fieldValue = dataset.field_tags[field];
              console.log("fieldValue " + fieldValue);
              if (fieldValue) {
                // Check that the value is not "None"
                if (Array.isArray(fieldValue)) {
                  state.taggedOptions = removeDuplicates([
                    ...state.taggedOptions,
                    ...fieldValue,
                  ]);
                } else {
                  state.taggedOptions = removeDuplicates([
                    ...state.taggedOptions,
                    fieldValue, // Add non-array values as before
                  ]);
                }
              }
            }
          });
        });
      });

      let keysToSkip = [
        "ts_id_columns",
        "timestamp_column",
        "date_format",
        "target_column",
        "frequency",
        "tg_forecast",
        "sales_forecast",
        "marketing_forecast",
        "ops_forecast",
        "consensus_forecast",
        "comments",
      ];
      if (state.ui_config.confirm_add_data_trasformation) {
        keysToSkip = [
          ...keysToSkip,
          ...Object.keys(state.ui_config.confirm_add_data_trasformation),
        ];
      }
      if (!state.contextConfig) {
        state.contextConfig = updateDataBlock(
          state.config,
          loadedDatasets,
          keysToSkip
        );
      } else {
        state.contextConfig = updateDataBlock(
          state.contextConfig,
          loadedDatasets,
          keysToSkip
        );
      }
      state.config = updateDataBlock(state.config, loadedDatasets, keysToSkip);
      /*  console.log("Config after the update data block :", state.config);
      console.log("contextConfig after the update data block :", state.contextConfig);
      debugger; */
      let allCols = [];
      let dateCols = [];
      let numCols = [];
      let catCols = [];
      /* const frequencyValues = [
        "W",
        "M",
        "Q",
        "D",
        "Y",
        "H",
        "30T",
        "15T",
        "10T",
        "5T",
      ];
      const frequencyValuesDict = {
        W: "Weekly",
        M: "Monthly",
        Q: "Quarterly",
        D: "Daily",
        Y: "Yearly",
        H: "Hourly",
        "30T": "30 minute",
        "15T": "15 minute",
        "10T": "10 minute",
        "5T": "5 minute",
      };

      const getInventoryMetricsOptions = (config) => {
        const inventory_column = config.data?.inventory_column || "";
        const replenishment_columns = Array.isArray(
          config.etl.loaded_datasets?.inventory?.[0]?.field_tags
            ?.replenishment_columns
        )
          ? config.etl.loaded_datasets?.inventory?.[0]?.field_tags
              ?.replenishment_columns
          : [];

        return [
          ...new Set([
            inventory_column,
            ...replenishment_columns,
            "running_purchase_order",
            "MOQ",
          ]),
        ].filter(Boolean);
      }; */

      for (const tag in loadedDatasets) {
        loadedDatasets[tag].forEach((data) => {
          // Ensure that each filename in data_connections is initialized
          if (!state.config["data_connections"][data.filename]) {
            state.config["data_connections"][data.filename] = {};
          }
          if (data.source_name !== "File Upload") {
            state.job_list.push({
              dataset_name: data.filename,
              data_tag: tag,
              source_name: data.source_name,
              load_type:
                data.field_tags.timestamp_column !== undefined &&
                data.field_tags.timestamp_column !== null
                  ? "append"
                  : "full_refresh",
            });
          }

          state.config["data_connections"][data.filename]["source_name"] =
            data.source_name;
          state.config["data_connections"][data.filename]["source_label"] =
            data.source_label;
          state.allColumns = removeDuplicates(
            state.allColumns.concat(data.data_attributes.cols)
          );
          allCols.concat(data.data_attributes.cols);
          state.dateColumns = removeDuplicates(
            state.dateColumns.concat(data.data_attributes.col_types.ts_cols)
          );
          dateCols.concat(data.data_attributes.col_types.ts_cols);
          state.numericColumns = removeDuplicates(
            state.numericColumns.concat(data.data_attributes.col_types.num_cols)
          );
          numCols.concat(data.data_attributes.col_types.num_cols);
          state.categoricalColumns = removeDuplicates(
            state.categoricalColumns.concat(
              data.data_attributes.col_types.cat_cols
            )
          );
          catCols.concat(data.data_attributes.col_types.cat_cols);
        });
      }

      // Clean up job_list to remove entries not in loadedDatasets
      state.job_list = removeDuplicates(
        state.job_list.filter((job) => {
          // // Check if the job's data_tag exists in loadedDatasets
          if (!loadedDatasets[job.data_tag]) {
            return false;
          }

          // Check if there's a matching dataset with the same filename
          return loadedDatasets[job.data_tag].some(
            (dataset) => dataset.filename === job.dataset_name
          );
        })
      );

      state.isBOMDataLoaded = false;
      if (
        state.ui_config.datasets.dataset_groups.hasOwnProperty(
          "bom_datasets_tags"
        )
      ) {
        for (const tag in loadedDatasets) {
          if (
            loadedDatasets[tag].length > 0 &&
            state.ui_config.datasets.dataset_groups.bom_datasets_tags.includes(
              tag
            )
          ) {
            state.isBOMDataLoaded = true;
          }
        }
      }

      console.log("isBOM", state.isBOMDataLoaded);

      state.contextBuckets = processJsonWithContext(
        JSON.parse(JSON.stringify(state.ui_config.context_buckets)),
        {
          config: JSON.parse(JSON.stringify(state.config)),
          taggedColumns: state.taggedOptions,
          ui_config: JSON.parse(JSON.stringify(state.ui_config)),
        }
      );
      console.log("contextBuckets", state.contextBuckets);

      const contextBuckets = state.contextBuckets;
      if (
        state.contextBucketsFilledFlags ===
        initialState.contextBucketsFilledFlags
      ) {
        Object.keys(contextBuckets).forEach((bucket) => {
          state.contextBucketsFilledFlags[bucket] = false;
          Object.keys(contextBuckets[bucket].featureGroups).forEach(
            (featureGroup) => {
              state.contextBucketsFilledFlags[featureGroup] = false;
            }
          );
        });
      }

      /* if (state.config.scenario_plan.historical_horizon_snop === undefined) {
        state.config.scenario_plan.historical_horizon_snop = 4;
      } */

      if (state.currentBucket === "None") {
        state.currentBucket = state.ui_config.default_context_bucket;
      }
      state.currentFeatureGroup = "None";

      if (state.currentAdvanceSettingBucket === "None") {
        state.currentAdvanceSettingBucket =
          state.ui_config.default_advance_setting_bucket;
      }

      /*  console.log("contextConfig at the end of confirmAddData:", state.contextConfig);
      console.log("config at the end of confirmAddData:", state.config);
      debugger; */

      /*    // Ensure scenario_plan exists and is extensible
      state.config.scenario_plan = {
        ...state.config.scenario_plan,
        historical_horizon_snop:
          state.config.scenario_plan?.historical_horizon_snop ?? 4,
        inventory_constraints: {
          ...state.config.scenario_plan?.inventory_constraints,
          disaggregate_inventory_metrics:
            state.config.scenario_plan?.inventory_constraints
              ?.disaggregate_inventory_metrics ?? [],
          disaggregate_inventory_metrics_history:
            state.config.scenario_plan?.inventory_constraints
              ?.disaggregate_inventory_metrics_history ?? 90,
          disaggregate_inventory_metrics_granularity:
            state.config.scenario_plan?.inventory_constraints
              ?.disaggregate_inventory_metrics_granularity ?? [],
        },
      }; */
    },

    confirmPlannerCoding: (state, action) => {
      /*  let newGranularityOptions = [];
      let newDriverOptions = [];
      let newReplenishmentOptions = [];
      let newDimensionsOptions = []; */

      state.contextConfig.scenario_plan = {
        ...state.contextConfig.scenario_plan,
        historical_horizon_snop:
          state.contextConfig.scenario_plan?.historical_horizon_snop ?? 4,
        inventory_constraints: {
          ...state.contextConfig.scenario_plan?.inventory_constraints,
          disaggregate_inventory_metrics:
            state.contextConfig.scenario_plan?.inventory_constraints
              ?.disaggregate_inventory_metrics ?? [],
          disaggregate_inventory_metrics_history:
            state.contextConfig.scenario_plan?.inventory_constraints
              ?.disaggregate_inventory_metrics_history ?? 90,
          disaggregate_inventory_metrics_granularity:
            state.contextConfig.scenario_plan?.inventory_constraints
              ?.disaggregate_inventory_metrics_granularity ?? [],
        },
      };

      const loadedDatasets = action.payload;
      state.config["loadedDatasets"] = loadedDatasets;

      Object.keys(loadedDatasets).forEach((tag) => {
        loadedDatasets[tag].forEach((dataset) => {
          Object.keys(dataset.field_tags).forEach((field) => {
            if (field !== "date_format") {
              const fieldValue = dataset.field_tags[field];
              if (fieldValue) {
                // Check that the value is not "None"
                if (Array.isArray(fieldValue)) {
                  state.taggedOptions = removeDuplicates([
                    ...state.taggedOptions,
                    ...fieldValue,
                  ]);
                } else {
                  state.taggedOptions = removeDuplicates([
                    ...state.taggedOptions,
                    fieldValue, // Add non-array values as before
                  ]);
                }
              }
            }
          });
        });
      });

      var isBOMAdded = false;
      for (const tag in loadedDatasets) {
        if (
          loadedDatasets[tag].length > 0 &&
          ["bom_mapping", "bom_inventory", "bomothers"].includes(tag)
        ) {
          isBOMAdded = true;
        }
      }

      /*   if (
        loadedDatasets["new_product"] &&
        loadedDatasets["new_product"].length > 0
      ) {
        // Extract field tags from the first item
        const newProductData = loadedDatasets["new_product"][0];
        if (newProductData.field_tags) {
          // Extract ts_id_columns as granularity options
          newGranularityOptions = Array.isArray(
            newProductData.field_tags.ts_id_columns
          )
            ? [...newProductData.field_tags.ts_id_columns]
            : [];

          // Extract driver_columns
          newDriverOptions = Array.isArray(
            newProductData.field_tags.driver_columns
          )
            ? [...newProductData.field_tags.driver_columns]
            : [];

          // Extract replenishment_columns
          newReplenishmentOptions = Array.isArray(
            newProductData.field_tags.replenishment_columns
          )
            ? [...newProductData.field_tags.replenishment_columns]
            : [];

          // Extract dimensions
          newDimensionsOptions = Array.isArray(
            newProductData.field_tags.dimensions
          )
            ? [...newProductData.field_tags.dimensions]
            : [];
        }
      } */

      state.contextBuckets = processJsonWithContext(
        JSON.parse(JSON.stringify(state.ui_config.context_buckets)),
        {
          config: JSON.parse(JSON.stringify(state.config)),
          taggedColumns: state.taggedOptions,
          ui_config: JSON.parse(JSON.stringify(state.ui_config)),
        }
      );

      const contextBuckets = state.contextBuckets;

      if (
        state.contextBucketsFilledFlags ===
        initialState.contextBucketsFilledFlags
      ) {
        Object.keys(contextBuckets).forEach((bucket) => {
          state.contextBucketsFilledFlags[bucket] = false;
          Object.keys(contextBuckets[bucket].featureGroups).forEach(
            (featureGroup) => {
              state.contextBucketsFilledFlags[featureGroup] = false;
            }
          );
        });
      }
      console.log("confirmPlannerCoding");
    },

    addDisaggregateInventoryMetricsGranularity: (state, action) => {
      const metrics =
        state.contextConfig.scenario_plan.inventory_constraints
          .disaggregate_inventory_metrics || [];

      // Initialize the granularity array if it doesn't exist
      if (
        !state.contextConfig.scenario_plan.inventory_constraints
          .disaggregate_inventory_metrics_granularity
      ) {
        state.contextConfig.scenario_plan.inventory_constraints.disaggregate_inventory_metrics_granularity =
          [];
      }

      // Ensure the granularity array has an entry for each metric
      for (let i = 0; i < metrics.length; i++) {
        // Check if there's already a value at this index
        if (
          !state.contextConfig.scenario_plan.inventory_constraints
            .disaggregate_inventory_metrics_granularity[i]
        ) {
          // If not, insert an empty array
          state.contextConfig.scenario_plan.inventory_constraints.disaggregate_inventory_metrics_granularity[
            i
          ] = [];
        }
      }

      // Trim any extra entries if the granularity array is longer than the metrics array
      if (
        state.contextConfig.scenario_plan.inventory_constraints
          .disaggregate_inventory_metrics_granularity.length > metrics.length
      ) {
        state.contextConfig.scenario_plan.inventory_constraints.disaggregate_inventory_metrics_granularity =
          state.contextConfig.scenario_plan.inventory_constraints.disaggregate_inventory_metrics_granularity.slice(
            0,
            metrics.length
          );
      }
    },

    addJoins: (state, action) => {
      const {
        input_data,
        bom_input_data,
        join_operations,
        join_operations_future,
        join_operations_bom,
        join_operations_forecast,
        join_operations_new_product,
        join_operations_simple_disaggregation_mapping,
      } = action.payload;
      state.config.etl["input_data"] = input_data;
      state.config.etl["bom_input_data"] = bom_input_data;
      state.config.etl["join_operations"] = join_operations;
      state.config.etl["join_operations_future"] = join_operations_future;
      state.config.etl["join_operations_forecast"] = join_operations_forecast;
      state.config.etl["join_operations_bom"] = join_operations_bom;
      state.config.etl["join_operations_new_product"] =
        join_operations_new_product;
      state.config.etl["join_operations_simple_disaggregation_mapping"] =
        join_operations_simple_disaggregation_mapping;
    },

    updateContextConfigByPath: (state, action) => {
      const { path, value } = action.payload;

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

      state.contextConfig = updateNestedByPath(
        state.contextConfig,
        path,
        value
      );
    },

    confirmAddContext: (state, action) => {
      const loadedDatasets = action.payload;

      const copyFromContextConfigByPath = (path) => {
        const getContextConfigFieldByPath = (path) => {
          const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
          let current = state.contextConfig;

          for (let i = 0; i < pathParts.length; i++) {
            const key = pathParts[i];

            // Check if key is a numeric index
            const index = Number(key);
            if (!isNaN(index)) {
              // Handle array case
              if (!Array.isArray(current) || index >= current.length) {
                console.log(
                  path,
                  "not found!!!!!!!!!!!!!!!!!",
                  "The index:=>>",
                  key
                );
                return null;
              }
              current = current[index];
            } else {
              // Handle object case
              if (current[key] === undefined) {
                console.log(
                  path,
                  "not found!!!!!!!!!!!!!!!!!",
                  "The key:=>>",
                  key
                );
                return null;
              }
              current = current[key];
            }
          }

          return current;
        };
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

        const value = getContextConfigFieldByPath(path);
        state.contextConfig.project_setup.project_name =
          state.config.project_setup.project_name;
        state.config = updateNestedByPath(state.config, path, value);

        return state.config;
      };

      if (
        loadedDatasets["new_product"] &&
        loadedDatasets["new_product"].length > 0
      ) {
        // Extract field tags from the first item
        const newProductData = loadedDatasets["new_product"][0];
        if (newProductData.field_tags) {
          // Extract ts_id_columns as granularity options

          // Extract driver_columns

          // Extract replenishment_columns

          // Extract dimensions
          const newDimensionsOptions = Array.isArray(
            newProductData.field_tags.dimensions
          )
            ? [...newProductData.field_tags.dimensions]
            : [];

          const dataGenerationDimensions =
            state.config.scenario_plan.new_product_forecasting
              .data_generation_dimension || [];

          // Filter out dimensions that are already in data_generation_dimension
          state.config.scenario_plan.new_product_forecasting.new_product_dimensions =
            newDimensionsOptions.filter(
              (dimension) => !dataGenerationDimensions.includes(dimension)
            );
        }
      }

      Object.keys(state.contextBuckets).forEach((bucket) => {
        Object.keys(state.contextBuckets[bucket].featureGroups).forEach(
          (featureGroup) => {
            state.contextBuckets[bucket].featureGroups[
              featureGroup
            ].features.forEach((feature) => {
              if (feature.path) {
                copyFromContextConfigByPath(feature.path);
              }
            });
          }
        );
      });

      state.config["contextBuckets"] = state.contextBuckets;
      state.config["contextBucketsFilledFlags"] =
        state.contextBucketsFilledFlags;

      state.advancedSettingConfig = state.config;

      state.advanceSettingBuckets = processJsonWithContext(
        JSON.parse(JSON.stringify(state.ui_config.advance_setting_buckets)),
        {
          CONFIG: JSON.parse(JSON.stringify(state.config)),
          taggedColumns: state.taggedOptions,
        }
      );

      const advanceSettingBuckets = state.advanceSettingBuckets;

      if (!state.advanceSettingBucketsFilledFlags) {
        state.advanceSettingBucketsFilledFlags = {};

        Object.keys(advanceSettingBuckets).forEach((bucket) => {
          Object.keys(advanceSettingBuckets[bucket].featureGroups).forEach(
            (featureGroup) => {
              state.advanceSettingBucketsFilledFlags[featureGroup] = false;
            }
          );
        });
      }

      if (state.operations.length > 1) {
        state["advanceSettingBucketsFilledFlags"]["APA"] = true;
      }
      if (state.exogenous_features?.length > 0) {
        state["advanceSettingBucketsFilledFlags"]["AEF"] = true;
      }
      if (state.enrichment_bydate.length > 0) {
        state["advanceSettingBucketsFilledFlags"]["APE"] = true;
      }
      if (
        state.advanceSettingBucketsFilledFlags ===
        initialState.advanceSettingBucketsFilledFlags
      ) {
        Object.keys(advanceSettingBuckets).forEach((bucket) => {
          Object.keys(advanceSettingBuckets[bucket].featureGroups).forEach(
            (featureGroup) => {
              state.advanceSettingBucketsFilledFlags[featureGroup] = false;
            }
          );
        });
      }

      if (state.currentAdvanceSettingBucket === "None") {
        state.currentAdvanceSettingBucket =
          state.ui_config.default_advance_setting_bucket;
      }
    },
    setContextConfig: (state, action) => {
      state.contextConfig = action.payload;
    },
    restoreToDefault: (state, action) => {
      const { bucket, featureGroup } = action.payload;

      const copyFromConfigByPath = (path) => {
        const getConfigFieldByPath = (path) => {
          const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
          let current = state.config;

          for (let i = 0; i < pathParts.length; i++) {
            const key = pathParts[i];

            // Check if key is a numeric index
            const index = Number(key);
            if (!isNaN(index)) {
              // Handle array case
              if (!Array.isArray(current) || index >= current.length) {
                console.log(
                  path,
                  "not found!!!!!!!!!!!!!!!!!",
                  "The index:=>>",
                  key
                );
                return null;
              }
              current = current[index];
            } else {
              // Handle object case
              if (current[key] === undefined) {
                console.log(
                  path,
                  "not found!!!!!!!!!!!!!!!!!",
                  "The key:=>>",
                  key
                );
                return null;
              }
              current = current[key];
            }
          }

          return current;
        };
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

        const value = getConfigFieldByPath(path);

        state.contextConfig = updateNestedByPath(
          state.contextConfig,
          path,
          value
        );
      };

      if (!featureGroup) {
        state.contextBucketsFilledFlags[bucket] = false;
        Object.keys(state.contextBuckets[bucket].featureGroups).forEach(
          (featureGroup) => {
            state.contextBucketsFilledFlags[featureGroup] = false;
            state.contextBuckets[bucket].featureGroups[
              featureGroup
            ].features.forEach((feature) => {
              if (feature?.path) {
                copyFromConfigByPath(feature.path);
              }
            });
          }
        );
      } else {
        state.contextBucketsFilledFlags[featureGroup] = false;
        state.contextBuckets[bucket].featureGroups[
          featureGroup
        ].features.forEach((feature) => {
          if (feature.path) {
            copyFromConfigByPath(feature.path);
          }
        });
      }
    },

    restoreMLToDefault: (state, action) => {
      const { bucket, featureGroup } = action.payload;

      const copyFromConfigByPath = (path) => {
        const getConfigFieldByPath = (path) => {
          const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
          let current = state.config;

          for (let i = 0; i < pathParts.length; i++) {
            const key = pathParts[i];

            // Check if key is a numeric index
            const index = Number(key);
            if (!isNaN(index)) {
              // Handle array case
              if (!Array.isArray(current) || index >= current.length) {
                console.log(
                  path,
                  "not found!!!!!!!!!!!!!!!!!",
                  "The index:=>>",
                  key
                );
                return null;
              }
              current = current[index];
            } else {
              // Handle object case
              if (current[key] === undefined) {
                console.log(
                  path,
                  "not found!!!!!!!!!!!!!!!!!",
                  "The key:=>>",
                  key
                );
                return null;
              }
              current = current[key];
            }
          }

          return current;
        };
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

        const value = getConfigFieldByPath(path);

        state.config = updateNestedByPath(state.config, path, value);
      };

      if (!featureGroup) {
        state.advanceSettingBucketsFilledFlags[bucket] = false;
        Object.keys(state.advanceSettingBuckets[bucket].featureGroups).forEach(
          (featureGroup) => {
            state.advanceSettingBucketsFilledFlags[featureGroup] = false;
            state.advanceSettingBuckets[bucket].featureGroups[
              featureGroup
            ].features.forEach((feature) => {
              copyFromConfigByPath(feature.path);
            });
          }
        );
      } else {
        state.advanceSettingBucketsFilledFlags[featureGroup] = false;
        console.log("advanceSettingBuckets " + bucket + " " + featureGroup);
        state.advanceSettingBuckets[bucket].featureGroups[
          featureGroup
        ].features.forEach((feature) => {
          copyFromConfigByPath(feature.path);
        });
      }
    },
    setCurrentBucket: (state, action) => {
      state.currentBucket = action.payload;
    },
    setCurrentAdvanceSettingBucket: (state, action) => {
      state.currentAdvanceSettingBucket = action.payload;
    },
    setFeatureGroup: (state, action) => {
      state.currentFeatureGroup = action.payload;
    },
    confirmContextGroup: (state, action) => {
      const compareWithDefault = (path) => {
        console.log("Comparing with default for", path);
        const getConfigFieldByPath = (path) => {
          const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
          let current = state.defaultConfig;

          for (let i = 0; i < pathParts.length; i++) {
            const key = pathParts[i];

            // Check if current is an array and path directly refers to it
            if (Array.isArray(current) && i === pathParts.length - 1) {
              // If it's a Proxy array, convert it to a regular array
              return Array.isArray(current) ? [...current] : current;
            }

            // Check if key is a numeric index
            const index = Number(key);
            if (!isNaN(index)) {
              // Handle array case
              if (!Array.isArray(current) || index >= current.length) {
                console.log(
                  path,
                  "not found!!!!!!!!!!!!!!!!!",
                  "The index:=>>",
                  key
                );
                return null;
              }
              current = current[index];
            } else {
              // Handle object case
              if (current[key] === undefined) {
                console.log(
                  path,
                  "not found!!!!!!!!!!!!!!!!!",
                  "The key:=>>",
                  key
                );
                return null;
              }
              current = current[key];
            }
          }

          // If the final value is a Proxy array, convert it to a regular array
          if (Array.isArray(current)) {
            return [...current];
          }

          return current;
        };

        const getContextConfigFieldByPath = (path) => {
          const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
          let current = state.contextConfig;

          for (let i = 0; i < pathParts.length; i++) {
            const key = pathParts[i];

            // Check if current is an array and path directly refers to it
            if (Array.isArray(current) && i === pathParts.length - 1) {
              // If it's a Proxy array, convert it to a regular array
              return Array.isArray(current) ? [...current] : current;
            }

            // Check if key is a numeric index
            const index = Number(key);
            if (!isNaN(index)) {
              // Handle array case
              if (!Array.isArray(current) || index >= current.length) {
                console.log(
                  path,
                  "not found!!!!!!!!!!!!!!!!!",
                  "The index:=>>",
                  key
                );
                return null;
              }
              current = current[index];
            } else {
              // Handle object case
              if (current[key] === undefined) {
                console.log(
                  path,
                  "not found!!!!!!!!!!!!!!!!!",
                  "The key:=>>",
                  key
                );
                return null;
              }
              current = current[key];
            }
          }

          // If the final value is a Proxy array, convert it to a regular array
          if (Array.isArray(current)) {
            return [...current];
          }

          return current;
        };
        // Deep equality check for arrays and objects
        function deepEqual(obj1, obj2) {
          if (obj1 === obj2) return true;

          // Check if both are arrays
          if (Array.isArray(obj1) && Array.isArray(obj2)) {
            if (obj1.length !== obj2.length) return false;
            for (let i = 0; i < obj1.length; i++) {
              if (!deepEqual(obj1[i], obj2[i])) return false;
            }
            return true;
          }

          // Check if both are objects
          if (
            obj1 &&
            typeof obj1 === "object" &&
            obj2 &&
            typeof obj2 === "object"
          ) {
            const keys1 = Object.keys(obj1);
            const keys2 = Object.keys(obj2);
            if (keys1.length !== keys2.length) return false;
            for (let key of keys1) {
              if (!deepEqual(obj1[key], obj2[key])) return false;
            }
            return true;
          }

          return false;
        }

        const defaultValue = getConfigFieldByPath(path);
        const newValue = getContextConfigFieldByPath(path);
        console.log("defaultValue", defaultValue);
        console.log("newValue", newValue);
        const isSame = deepEqual(defaultValue, newValue);
        const isEmpty = newValue === null || isSame;
        console.log("notEmpty", isEmpty);
        return isSame;
      };

      const group = action.payload;
      let isSame = true;
      if (Object.keys(state.contextBuckets).includes(group)) {
        Object.keys(state.contextBuckets[group].featureGroups).forEach(
          (featureGroup) => {
            state.contextBuckets[group].featureGroups[
              featureGroup
            ].features.forEach((feature) => {
              if (feature.path) {
                if (!compareWithDefault(feature.path)) {
                  isSame = false;
                }
              }
            });
          }
        );
      } else {
        Object.keys(state.contextBuckets).forEach((bucket) => {
          const featureGroups = Object.keys(
            state.contextBuckets[bucket].featureGroups
          );
          if (featureGroups.includes(group)) {
            state.contextBuckets[bucket].featureGroups[group].features.forEach(
              (feature) => {
                if (feature.path) {
                  if (!compareWithDefault(feature.path)) {
                    console.log("Miss match at", feature.path);
                    isSame = false;
                  }
                }
              }
            );
          }
        });
      }

      console.log("isSame", isSame);
      if (!isSame) {
        console.log("Setting the bucket filled flag to true for", group);
        state.contextBucketsFilledFlags[group] = true;
      }

      if (
        [Object.keys(state.ui_config.default_context_bucket)].includes(group)
      ) {
        state.currentBucket = "None";
      } else {
        state.currentFeatureGroup = "None";
      }
    },

    confirmMLAdvancedSettings: (state) => {
      state.isMLSettingsDone = true;
    },
    setContextBucketsFilledFlags: (state, action) => {
      state.contextBucketsFilledFlags = action.payload;
    },

    //Advanced Settings

    updateAdjustDataByPath: (state, action) => {
      const { path, value } = action.payload;

      console.log("Path", path, "value", value);
      const updateNestedByPath = (obj, path, value) => {
        const pathParts = path.split(/[\.\[\]]/).filter(Boolean); // Split path and remove empty strings
        const updateRecursively = (currentObj, keys) => {
          const [firstKey, ...remainingKeys] = keys;
          console.log("First key", firstKey);
          // Check if firstKey is a numeric index
          const index = Number(firstKey);
          if (!isNaN(index)) {
            // Handle array case
            console.log("Array case");
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

      state.adjust_data = updateNestedByPath(state.adjust_data, path, value);
    },
    updateExogenousFeatureByPath: (state, action) => {
      const { path, value } = action.payload;

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

      state.exogenous_feature = updateNestedByPath(
        state.exogenous_feature,
        path,
        value
      );
    },
    updateEnrichmentByPath: (state, action) => {
      const { path, value } = action.payload;

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

      state.enrichment = updateNestedByPath(state.enrichment, path, value);
    },
    updateDatePairByPath: (state, action) => {
      const { path, value } = action.payload;

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

      state.datePair = updateNestedByPath(state.datePair, path, value);
    },

    removeItem: (state, action) => {
      const { arrayName, index, featureGroup } = action.payload;
      if (state[arrayName] && Array.isArray(state[arrayName])) {
        state[arrayName] = state[arrayName].filter((_, i) => i !== index);
      }

      if (
        featureGroup === "MLP" ||
        featureGroup === "LSTM" ||
        featureGroup === "GRU"
      ) {
        return;
      }
      if (arrayName === "operations") {
        if (state[arrayName]?.length <= 1) {
          state.advanceSettingBucketsFilledFlags[featureGroup] = false;
        }
      } else {
        if (state[arrayName]?.length <= 0) {
          state.advanceSettingBucketsFilledFlags[featureGroup] = false;
        }
      }
    },

    ///Add things

    resetAdvanceSettingToDefault: (state, action) => {
      const { featureGroup } = action.payload;

      switch (featureGroup) {
        case "MLA":
          state.isMLSettingsDone = true;

          break;
        case "AFS":
          state.isFeatureSettingsDone = true;
          break;
        case "APA":
          state.operations = [state.operations[0]];
          break;
        case "AEF":
          state.exogenous_features = [];

          break;

        case "APE":
          state.enrichment_bydate = [];
          break;
      }
      state.advanceSettingBucketsFilledFlags[featureGroup] = false;
    },

    addTrialParams: (state, action) => {
      const { newParam, modelType } = action.payload;
      if (modelType === "MLP") {
        state.trial_params_mlp.push(newParam);
      } else if (modelType === "LSTM") {
        state.trial_params_lstm.push(newParam);
      } else if (modelType === "GRU") {
        state.trial_params_gru.push(newParam);
      }
    },

    deleteTrialParams: (state, action) => {
      const newParam = action.payload;

      state.trial_params_mlp.push(newParam);
    },

    editTrialParams: (state, action) => {
      const { newParam, index, modelType } = action.payload;

      switch (modelType) {
        case "MLP":
          if (newParam && Array.isArray(state.trial_params_mlp)) {
            state.trial_params_mlp[index] = newParam;
          }
          break;

        case "LSTM":
          if (newParam && Array.isArray(state.trial_params_lstm)) {
            state.trial_params_lstm[index] = newParam;
          }
          break;
        case "GRU":
          if (newParam && Array.isArray(state.trial_params_gru)) {
            state.trial_params_gru[index] = newParam;
          }
          break;

        default:
          break;
      }
    },

    confirmAdvanceSettingsGroup: (state, action) => {
      const group = action.payload;
      console.log("groups " + group);
      state.config["advanceSettingBuckets"] = state.advanceSettingBuckets;
      state.config["advanceSettingBucketsFilledFlags"] =
        state.advanceSettingBucketsFilledFlags;
      const hyperParameterPattern = /^HyperParameter-(.+)$/;
      const match = group.match(hyperParameterPattern);
      if (match) {
        const extractedGroup = match[1];

        state.advanceSettingBucketsFilledFlags[extractedGroup] = true;
        return;
      }
      switch (group) {
        case "MLA":
          state.isMLSettingsDone = true;
          state.advanceSettingBucketsFilledFlags[group] = true; // Equivalent to confirmMLAdvancedSettings
          break;
        case "AFS":
          state.isFeatureSettingsDone = true;
          state.advanceSettingBucketsFilledFlags[group] = true; // Equivalent to confirmMLAdvancedSettings
          break;
        case "APA":
          state.operations.push(state.adjust_data); // Equivalent to addAdjustData
          state.adjust_data = initialState.adjust_data;
          if (state.operations.length > 1) {
            state.advanceSettingBucketsFilledFlags[group] = true;
          }
          break;
        case "AEF":
          state.exogenous_features.push(state.exogenous_feature); // Equivalent to addExogenousFeature
          state.exogenous_feature = initialState.exogenous_feature;
          state.datePair = initialState.datePair;
          if (state.exogenous_features?.length > 0) {
            state.advanceSettingBucketsFilledFlags[group] = true;
          }

          break;
        case "APE":
          state.enrichment_bydate.push(state.enrichment.kwargs); // Equivalent to addEnrichment
          const frequency = state.config.data.frequency;
          const forecastHorizon = state.config.data.forecast_horizon;
          const activityEndDate = state.config.etl.activity_end_date;

          let startDate, endDate;

          if (activityEndDate) {
            // If activity_end_date exists, use it as reference
            startDate = moment(activityEndDate);
          } else {
            // Otherwise use current date
            startDate = moment();
          }

          // Calculate end date based on frequency and horizon
          switch (frequency) {
            case "D":
              endDate = startDate.clone().add(forecastHorizon, "days");
              break;
            case "W":
              endDate = startDate.clone().add(forecastHorizon, "weeks");
              break;
            case "M":
              endDate = startDate.clone().add(forecastHorizon, "months");
              break;
            case "Q":
              endDate = startDate.clone().add(forecastHorizon * 3, "months");
              break;
            case "Y":
              endDate = startDate.clone().add(forecastHorizon, "years");
            case "H":
              endDate = startDate.clone().add(forecastHorizon, "hours");
              break;
            case "30T":
              endDate = startDate.clone().add(forecastHorizon * 30, "minutes");
              break;
            case "15T":
              endDate = startDate.clone().add(forecastHorizon * 15, "minutes");
              break;
            case "10T":
              endDate = startDate.clone().add(forecastHorizon * 10, "minutes");
              break;
            case "5T":
              endDate = startDate.clone().add(forecastHorizon * 5, "minutes");
              break;
            default:
              endDate = startDate.clone().add(forecastHorizon, "months");
          }

          // Set the calculated dates in enrichment object
          state.enrichment = {
            ...initialState.enrichment,
            kwargs: {
              ...initialState.enrichment.kwargs,
              date_range: [
                startDate.format("YYYY-MM-DD"),
                endDate.format("YYYY-MM-DD"),
              ],
            },
          };

          if (state.enrichment_bydate.length > 0) {
            state.advanceSettingBucketsFilledFlags[group] = true;
          }
          break;
        case "MLP":
          state.config.training.models.MLP.trial_params =
            state.trial_params_mlp;
          state.advanceSettingBucketsFilledFlags[group] = true;
          break;

        case "LSTM":
          state.config.training.models.LSTM.trial_params =
            state.trial_params_lstm;
          state.advanceSettingBucketsFilledFlags[group] = true;
          break;

        case "GRU":
          state.config.training.models.GRU.trial_params =
            state.trial_params_gru;
          state.advanceSettingBucketsFilledFlags[group] = true;
          break;
        default:
          console.error(`Unknown group: ${group}`);
      }
    },

    setAdvanceSettingBucketsFilledFlags: (state, action) => {
      state.advanceSettingBucketsFilledFlags = action.payload;
    },

    addAdjustData: (state) => {
      const changables = ["Cluster", "Forecast_Granularity"];
      const dict = { Cluster: "cluster", Forecast_Granularity: "ts_id" };

      const convert = (dimension) => {
        if (changables.includes(dimension)) {
          return dict[dimension];
        }
        return dimension;
      };
      const adjustment = {
        ...state.adjust_data,
        kwargs: {
          ...state.adjust_data.kwargs,
          dimension: convert(state.adjust_data.kwargs.dimension),
        },
      };
      state.operations.push(adjustment);
      state.adjust_data = initialState.adjust_data;
    },
    addEnrichment: (state) => {
      const changables = ["Cluster", "Forecast_Granularity"];
      const dict = { Cluster: "cluster", Forecast_Granularity: "ts_id" };

      const convert = (dimension) => {
        if (changables.includes(dimension)) {
          return dict[dimension];
        }
        return dimension;
      };
      const enrichment = {
        ...state.enrichment.kwargs,
        dimension: convert(state.enrichment.kwargs.dimension),
      };
      state.enrichment_bydate.push(enrichment);

      state.enrichment = initialState.enrichment;
      const frequency = state.config.data.frequency;
      const forecastHorizon = state.config.data.forecast_horizon;
      const activityEndDate = state.config.etl.activity_end_date;

      let startDate, endDate;

      if (activityEndDate) {
        // If activity_end_date exists, use it as reference
        startDate = moment(activityEndDate);
      } else {
        // Otherwise use current date
        startDate = moment();
      }

      // Calculate end date based on frequency and horizon
      switch (frequency) {
        case "D":
          endDate = startDate.clone().add(forecastHorizon, "days");
          break;
        case "W":
          endDate = startDate.clone().add(forecastHorizon, "weeks");
          break;
        case "M":
          endDate = startDate.clone().add(forecastHorizon, "months");
          break;
        case "Q":
          endDate = startDate.clone().add(forecastHorizon * 3, "months");
          break;
        case "Y":
          endDate = startDate.clone().add(forecastHorizon, "years");
          break;
        case "H":
          endDate = startDate.clone().add(forecastHorizon, "hours");
          break;
        case "30T":
          endDate = startDate.clone().add(forecastHorizon * 30, "minutes");
          break;
        case "15T":
          endDate = startDate.clone().add(forecastHorizon * 15, "minutes");
          break;
        case "10T":
          endDate = startDate.clone().add(forecastHorizon * 10, "minutes");
          break;
        case "5T":
          endDate = startDate.clone().add(forecastHorizon * 5, "minutes");
          break;
        default:
          endDate = startDate.clone().add(forecastHorizon, "months");
      }

      // Set the calculated dates in enrichment object
      state.enrichment = {
        ...initialState.enrichment,
        kwargs: {
          ...initialState.enrichment.kwargs,
          date_range: [
            startDate.format("YYYY-MM-DD"),
            endDate.format("YYYY-MM-DD"),
          ],
        },
      };
    },
    addExogenousFeature: (state) => {
      state.exogenous_features.push(state.exogenous_feature);
      state.exogenous_feature = initialState.exogenous_feature;
      state.datePair = initialState.datePair;
    },
    addDates: (state) => {
      state.exogenous_feature.start_dt.push(state.datePair.start_dt);
      state.exogenous_feature.end_dt.push(state.datePair.end_dt);
      state.datePair = initialState.datePair;
    },

    deleteBaseDataset: (state, action) => {
      const datasetName = action.payload;
      state.config.deleted_base_datasets.push(datasetName);
      state.config.byor_base_datasets = state.config.byor_base_datasets.filter(
        (name) => name !== datasetName
      );
    },
    addBaseDataset: (state, action) => {
      const datasetName = action.payload;
      state.config.byor_base_datasets.push(datasetName);
    },

    setBaseDatasets: (state, action) => {
      state.config.byor_base_datasets = action.payload || [];
    },

    setDeletedBaseDatasets: (state, action) => {
      state.config.deleted_base_datasets = action.payload || [];
    },

    confirmAdvancedSettings: (state) => {
      const sanitizeDeep = (input) => {
        if (Array.isArray(input)) {
          return input.map(sanitizeDeep);
        } else if (input && typeof input === "object") {
          const sanitized = {};
          for (const key in input) {
            const value = input[key];
            sanitized[key] =
              value === null || value === undefined
                ? "None"
                : sanitizeDeep(value);
          }
          return sanitized;
        } else {
          return input;
        }
      };

      const sanitizedEnrichmentByDate = sanitizeDeep(state.enrichment_bydate);
      const sanitizedOperations = sanitizeDeep(state.operations);
      state.config["advanceSettingBuckets"] = state.advanceSettingBuckets;
      state.config["advanceSettingBucketsFilledFlags"] =
        state.advanceSettingBucketsFilledFlags;
      if (state.config.preprocess?.serial_ops?.[0]) {
        state.config.preprocess.serial_ops[0].operations = sanitizedOperations;
      }
      if (state.config.feature_engg) {
        state.config.feature_engg.exogenous_features = state.exogenous_features;
      }
      if (state.config.stacking) {
        state.config.stacking.enrichment_bydate = sanitizedEnrichmentByDate;
      }
    },
    loadFilterToConfig: (state, action) => {
      const { filterData, fileName } = action.payload;
      if (state.config["tables_filter_data"] !== undefined) {
        state.config["tables_filter_data"][fileName] = filterData;
      } else {
        state.config["tables_filter_data"] = {};
        state.config["tables_filter_data"][fileName] = filterData;
      }
    },
    setRiskColumn: (state, action) => {
      state.RiskColumn = action.payload;
    },
    clearConfigCache: (state) => {
      Object.keys(initialState).forEach((key) => {
        state[key] = initialState[key];
      });
    },
    setEnrichment_bydate: (state, action) => {
      state.enrichment_bydate = action.payload;
    },
    setEnrichment: (state, action) => {
      state.enrichment = action.payload;
    },
    setAdjustment: (state, action) => {
      state.adjustment = action.payload;
    },

    remove_new_product_operation: (state) => {
      // Check if operations has at least 2 elements (index 0 and 1)
      if (state.operations.length > 1) {
        // Check if the operation at index 1 is 'new_product_forecasting'
        if (state.operations[1]?.operation === "new_product_forecasting") {
          // Remove the operation at index 1
          state.operations.splice(1, 1);
        }
      }
      return state;
    },
    setAdjustment_bydate: (state, action) => {
      state.operations = [state.operations[0], ...action.payload];
    },

    openDatasetDialog(state, action) {
      state.dialogState = {
        dialogOpen: true,
        dialogDatasetTag: action.payload.tag,
        dialogDatasetTitle: action.payload.title || "",
      };
    },
    closeDatasetDialog(state) {
      state.dialogState = {
        dialogOpen: false,
        dialogDatasetTag: "",
        dialogDatasetTitle: "",
      };
    },

    clearCache(state) {
      state.defaultConfig = initialState.defaultConfig;
      state.contextBuckets = initialState.contextBuckets;
      state.currentDatasetTag = initialState.currentDatasetTag;
      state.ui_config = initialState.ui_config;
      state.config = initialState.config;
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
      state.join_operations = initialState.join_operations;
      state.input_data_cols = initialState.input_data_cols;
      state.join_operations_future = initialState.join_operations_future;
      state.join_operations_forecast = initialState.join_operations_forecast;
      state.join_operations_new_product =
        initialState.join_operations_new_product;
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
      state.experiments_list = initialState.experiments_list;
      state.contextConfig = initialState.contextConfig;
      state.contextBucketsFilledFlags = initialState.contextBucketsFilledFlags;
      state.advanceSettingBuckets = initialState.advanceSettingBuckets;
      state.advanceSettingBucketsFilledFlags =
        initialState.advanceSettingBucketsFilledFlags;
      state.operations = initialState.operations;
      state.exogenous_features = initialState.exogenous_features;
      state.exogenous_feature = initialState.exogenous_feature;
      state.datePair = initialState.datePair;
      state.trial_params_mlp = initialState.trial_params_mlp;
      state.trial_params_lstm = initialState.trial_params_lstm;
      state.trial_params_gru = initialState.trial_params_gru;
      state.isMLSettingsDone = initialState.isMLSettingsDone;
      state.isFeatureSettingsDone = initialState.isFeatureSettingsDone;
      state.job_list = initialState.job_list;
      state.showBomDataset = initialState.showBomDataset;
      state.show_dataset_groups = initialState.show_dataset_groups;
      state.showFutureDataset = initialState.showFutureDataset;
      state.showForecastDataset = initialState.showForecastDataset;
      state.showNewProductsDataset = initialState.showNewProductsDataset;
      state.showSimpleDisaggregateMappingDataset =
        initialState.showSimpleDisaggregateMappingDataset;
      state.showForecastRewriteDataset =
        initialState.showForecastRewriteDataset;
      state.taggedOptions = initialState.taggedOptions;
      state.editedFiles = initialState.editedFiles;
      state.editHistories = initialState.editHistories;
      state.hasConflict = initialState.hasConflict;
      state.RiskColumn = initialState.RiskColumn;
      state.dialogState = initialState.dialogState;
    },
  },
});

export const {
  setShowDatasetGroups,
  loadExperiments,
  addExperiment,
  setConfigCache,
  setExperimentConfig,
  setTabValue,
  setExperimentStatus,
  setPreprocessMetadata,
  resetExperimentConfig,
  selectDatasetCard,
  updateLoadedDatasetByPath,
  setMetadata,
  updateMetadata,
  setLoading,
  setError,
  setJoinsAdded,
  addMetaData,
  editMetaData,
  updateJoinDataByPath,
  clearMetaData,
  addMoreData,
  setPath,
  setLogs,
  setLoadedDataCSV,
  setSearchString,
  setCreatedStartDate,
  setCreatedEndDate,
  setUpdatedStartDate,
  setUpdatedEndDate,
  setModuleNames,
  setIsProduction,
  setStatuses,
  setEditedFile,
  setNewRows,
  setDeletedRows,
  setEditHistories,
  updateConfig,
  setIsNoInstanceAvailable,
  setHasConflict,
  setShowBomDataset,
  setShowFutureDataset,
  setShowNewProductsDataset,
  setShowForecastRewriteDataset,
  setshowSimpleDisaggregateMappingDataset,
  setShowForecastDataset,
  removePlannerAdjustment,
  setEnrichmentDimension,
  setEnrichmentValue,
  setEnrichmentEnrichmentValue,
  setAdjustmentDimension,
  setAdjustmentValue,
  setAdjustmentAdjustValue,
  setEnrichmentStartDate,
  setEnrichmentEndDate,
  setAdjustmentStartDate,
  setAdjustmentEndDate,
  removeEnrichment,
  removeExogenousFeature,
  updateConfigByPath,
  setConfigByKeyValue,
  confirmAddData,
  confirmPlannerCoding,
  addDisaggregateInventoryMetricsGranularity,
  addJoins,
  updateContextConfigByPath,
  confirmAddContext,
  setContextConfig,
  restoreToDefault,
  restoreMLToDefault,
  setCurrentBucket,
  setCurrentAdvanceSettingBucket,
  setFeatureGroup,
  confirmContextGroup,
  setContextBucketsFilledFlags,
  updateAdjustDataByPath,
  updateExogenousFeatureByPath,
  updateEnrichmentByPath,
  updateDatePairByPath,
  removeItem,
  resetAdvanceSettingToDefault,
  addTrialParams,
  deleteTrialParams,
  editTrialParams,
  confirmAdvanceSettingsGroup,
  setAdvanceSettingBucketsFilledFlags,
  deleteBaseDataset,
  addBaseDataset,
  setBaseDatasets,
  setDeletedBaseDatasets,
  loadFilterToConfig,
  setEnrichment_bydate,
  setAdjustment_bydate,
  clearCache,
  setNewAdvanceSettingBucketsFilledFlags,
  setAdvanceSettingBuckets,
  addAdjustData,
  addExogenousFeature,
  addEnrichment,
  addDates,
  confirmAdvancedSettings,
  confirmMLAdvancedSettings,
  loadJoins,
  resetFilters,
  clearConfigCache,
  setNeedToJoin,
  setEnrichment,
  setAdjustment,
  removeRLAgentEnrichment,
  setRiskColumn,
  setDashboardLoading,
  openDatasetDialog,
  closeDatasetDialog,
  remove_new_product_operation,
  setDatasetInfo,
} = moduleSlice.actions;

export default moduleSlice.reducer;
