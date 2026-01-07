import { createSlice } from "@reduxjs/toolkit";
import { transformLoadedDataSet } from "../../utils/transformLoadedDatasets";
import { updateDataBlock } from "../../utils/experimentUtils";
import { forEach, initial } from "lodash";
import { getContextBuckets } from "../../utils/Context Utils/getContextBuckets";
import { featureGroups } from "./../../utils/Context Utils/featureGroups";
import InventoryHealth from "./../../pages/main/DashboardFlow/ViewDashboardPage/FocusView/InventoryHelath";
import { getAdvanceSettingsBucket } from "../../utils/Advanced Settings/getAdvanceSettingsBuckets";
import moment from "moment";
import { removeDuplicates } from "../../utils/removeDuplicates";

import { cleanUpConfigObjects } from "../../utils/cleanUpConfigObjects";
import { syncConfigWithEdits } from "../../utils/syncConfigWithEdits";

const initialState = {
  config: null,
  defaultConfig: null,
  loading: false,
  error: null,
  allColumns: ["None"],
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
  enrichment_bydate_multi_filter: [],
  enrichment_bydate_pricing: [],
  enrichment_bydate_pricing_multi_filter: [],
  enrichment: {
    operation: "enrich_data",
    kwargs: {
      dimension: "None",
      value: null,
      date_range: [null, null],
      enrichment_type: "uplift",
      enrichment_value: 0,
      changed_price_percent: null,
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
  forecast_data_reference_item: {
    exp_path: null,
    forecast_type: null,
    column_tag: null,
  },
  experiments_history_item: {
    exp_path: null,
    date_tag: null,
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
  isArchive: false,
  isProduction: false,
  exp_description: "",
  showNewProductsDataset: false,
  showSimpleDisaggregateMappingDataset: false,
  showForecastRewriteDataset: false,
  showTransitionItemDataset: false,
  taggedOptions: ["None"],
  previewEnrichment: {
    date_range: [null, null],

    enrichment_value: 0,
    changed_price_percent: null,
  },
  isTGScenario: true,
  editedFiles: {},
  editHistories: {},
  lastSavedEditAt: {},
  hasConflict: false,

  editsConfig: {
    editedFiles: {},
    editHistories: {},
    newRows: {},
    lastSavedEditAt: {},
  },
  chartMetricVisibility: {},
};

const getExperimentName = (projectName) => {
  if (projectName === "") {
    return projectName;
  }

  // Check if the name ends with 'Clone' (e.g., 'Project_Clone')
  const cloneRegex = /_Clone$/;
  // Check if the name ends with 'Clone_<number>' (e.g., 'Project_Clone_1')
  const cloneWithNumberRegex = /_Clone_(\d+)$/;

  if (cloneWithNumberRegex.test(projectName)) {
    // If it ends with 'Clone_<number>', increment the number
    return projectName.replace(
      cloneWithNumberRegex,
      (_, num) => `_Clone_${parseInt(num, 10) + 1}`
    );
  } else if (cloneRegex.test(projectName)) {
    // If it ends with 'Clone', append '_1'
    return projectName + "_1";
  } else {
    // Default case: Append '_Clone'
    return `${projectName}_Clone`;
  }
};
const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setConfig: (state, action) => {
      // First ensure the config and its nested objects are properly initialized

      const frequency = action.payload?.data?.frequency;
      const forecastHorizon = action.payload?.data?.forecast_horizon;
      const activityEndDate = action.payload?.etl?.activity_end_date;

      let startDate, endDate;

      if (activityEndDate) {
        // If activity_end_date exists, use it as reference
        startDate = moment(activityEndDate);
      } else {
        // Otherwise use current date
        startDate = moment();
      }

      const defaultCutoffPromo =
        frequency === "W"
          ? 13
          : frequency === "M"
          ? 3
          : frequency === "D"
          ? 90
          : 1;
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

      state.config = {
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
                "Reorder Plan", // default already renamed
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
              lead_time_reorder_col:
                action.payload.scenario_plan?.inventory_constraints
                  ?.lead_time_reorder_col ??
                action.payload.scenario_plan?.inventory_constraints
                  ?.lead_time_col,
              lead_time_reorder:
                action.payload.scenario_plan?.inventory_constraints
                  ?.lead_time_reorder ??
                action.payload.scenario_plan?.inventory_constraints?.lead_time,

              stock_transfer_lead_time_col:
                action.payload.scenario_plan?.inventory_constraints
                  ?.stock_transfer_lead_time_col ?? "None",

              stock_transfer_lead_time:
                action.payload.scenario_plan?.inventory_constraints
                  ?.stock_transfer_lead_time ?? 60,
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
              adjust_lead_time:
                action.payload.scenario_plan?.inventory_constraints
                  ?.adjust_lead_time ?? false,
              adjusted_lead_time:
                action.payload.scenario_plan?.inventory_constraints
                  ?.adjusted_lead_time ??
                action.payload.scenario_plan.inventory_constraints.lead_time,
              optimize_cutsize:
                action.payload.scenario_plan?.inventory_constraints
                  ?.optimize_cutsize ?? false,
              size_column:
                action.payload.scenario_plan?.inventory_constraints
                  ?.size_column ?? "None",
              all_size_level:
                action.payload.scenario_plan?.inventory_constraints
                  ?.all_size_level ?? "None",
              intransit_date:
                action.payload.scenario_plan?.inventory_constraints
                  ?.intransit_date ?? "None",
              intransit_date_format:
                action.payload.scenario_plan?.inventory_constraints
                  ?.intransit_date_format ?? "%d/%m/%y",
            };

            // ❌ Remove ml_based_disaggregation if present
            delete constraints.ml_based_disaggregation;

            return constraints;
          })(),

          pricing_constraints: {
            ...action.payload.scenario_plan?.pricing_constraints,
            promo_column:
              action.payload.scenario_plan?.pricing_constraints?.promo_column ||
              "None",
            base_price:
              action.payload.scenario_plan?.pricing_constraints?.base_price ||
              "None",
            cutoff_promo:
              action.payload.scenario_plan?.pricing_constraints?.cutoff_promo ??
              90,
            promo_lag:
              action.payload.scenario_plan?.pricing_constraints?.promo_lag ?? 1,
            postpromo_e_factor:
              action.payload.scenario_plan?.pricing_constraints
                ?.postpromo_e_factor ?? 0.2,
            postpromo_dip:
              action.payload.scenario_plan?.pricing_constraints
                ?.postpromo_dip ?? 3,
            enable_funding:
              action.payload.scenario_plan?.pricing_constraints
                ?.enable_funding ?? false,

            funding_column:
              action.payload.scenario_plan?.pricing_constraints
                ?.funding_column || "None",

            funding_value:
              action.payload.scenario_plan?.pricing_constraints
                ?.funding_value ?? 0,

            shipment_selling_price_col:
              action.payload.scenario_plan?.pricing_constraints
                ?.shipment_selling_price_col || "None",
          },

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
            bundle_mapping_granularity: Array.isArray(
              action.payload.scenario_plan?.simple_disaggr
                ?.bundle_mapping_granularity
            )
              ? action.payload.scenario_plan.simple_disaggr
                  .bundle_mapping_granularity
              : ["None"],

            bundle_forecast_granularity: Array.isArray(
              action.payload.scenario_plan?.simple_disaggr
                ?.bundle_forecast_granularity
            )
              ? action.payload.scenario_plan.simple_disaggr
                  .bundle_forecast_granularity
              : ["None"],
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
          impute_irregular_spikes:
            action.payload.feature_engg?.impute_irregular_spikes ?? false,
          spike_clusters: action.payload.feature_engg?.spike_clusters ?? [
            "A",
            "B",
          ],
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
        promoPlanningFilterColumns:
          action.payload.promoPlanningFilterColumns ?? [],
        snopFilterColumns: action.payload.snopFilterColumns ?? [],
        supplyPlanningFilterColumns:
          action.payload.supplyPlanningFilterColumns ?? [],

        demandForecastingFilterColumns:
          action.payload.demandForecastingFilterColumns ?? [],

        supplyPlanDataType: action.payload.supplyPlanDataType ?? "time",
        chartMetricVisibility: action.payload.chartMetricVisibility ?? {},
        showUnitsChart: action.payload.showUnitsChart ?? true,
        showDOIChart: action.payload.showDOIChart ?? true,
        activeSeries: Array.isArray(action.payload.activeSeries)
          ? action.payload.activeSeries
          : ["Beginning Inventory"],

        activeDaysSeries: Array.isArray(action.payload.activeDaysSeries)
          ? action.payload.activeDaysSeries
          : ["Days On Inventory"],
        deleted_base_datasets: action.payload.deleted_base_datasets ?? [],
        editedFiles:
          cleanUpConfigObjects(
            action.payload.editedFiles ?? {},
            action.payload.common.job_id,
            action.payload.common.parent_job_id
          ) ?? {},
        editHistories:
          cleanUpConfigObjects(
            action.payload.editHistories ?? {},
            action.payload.common.job_id,
            action.payload.common.parent_job_id
          ) ?? {},
        lastSavedEditAt:
          cleanUpConfigObjects(
            action.payload?.lastSavedEditAt ?? {},
            action.payload.common.job_id,
            action.payload.common.parent_job_id
          ) ?? {},
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
          accuracy_by_n_horizon:
            action.payload.agent_settings?.accuracy_by_n_horizon ?? false,
          past_accuracy_horizon:
            action.payload.agent_settings?.past_accuracy_horizon ?? 4,

          enable_rl_agent_forecast:
            action.payload.agent_settings?.enable_rl_agent_forecast ?? false,
          rl_agent_forecast_granularity:
            action.payload.agent_settings?.rl_agent_forecast_granularity ??
            "Forecast_Granularity",
          rl_agent_forecast_start_date:
            action.payload.agent_settings?.rl_agent_forecast_start_date ??
            startDate.format("YYYY-MM-DD"),
          rl_agent_forecast_end_date:
            action.payload.agent_settings?.rl_agent_forecast_end_date ??
            endDate.format("YYYY-MM-DD"),
          rl_agent_forecast_eligible_actions: action.payload.agent_settings
            ?.rl_agent_forecast_eligible_actions ?? [
            "upper_bound",
            "lower_bound",
            "offset",
            "P10",
            "P20",
            "P30",
            "P40",
            "P50",
            "P60",
            "P70",
            "P80",
            "P90",
            "P99",
            "ml_forecast",
          ],
          experiments_history:
            action.payload.agent_settings?.experiments_history ?? [],
        },
      };

      state.showBomDataset = action.payload.showBomDataset ?? false;
      state.showFutureDataset = action.payload.showFutureDataset ?? false;
      state.showNewProductsDataset =
        action.payload.showNewProductsDataset ?? false;
      state.showTransitionItemDataset =
        action.payload.showTransitionItemDataset ?? false;
      state.showSimpleDisaggregateMappingDataset =
        action.payload.showSimpleDisaggregateMappingDataset ?? false;
      state.showForecastDataset = action.payload.showForecastDataset ?? false;
      state.showForecastRewriteDataset =
        action.payload.showForecastRewriteDataset ?? false;

      state.defaultConfig = {
        ...action.payload,
        scenario_plan: {
          ...action.payload.scenario_plan,
          historical_horizon_snop:
            action.payload.scenario_plan?.historical_horizon_snop ?? 4,
        },
        tables_filter_data: action.payload.tables_filter_data ?? {},
      };

      state.contextConfig = initialState.contextConfig;
      state.contextBucketsFilledFlags = initialState.contextBucketsFilledFlags;
      state.advanceSettingBucketsFilledFlags =
        initialState.advanceSettingBucketsFilledFlags;

      // Calculate forecast dates based on config parameters

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

      state.config.scenario_plan.accuracy_calculation = action.payload
        .scenario_plan.accuracy_calculation
        ? action.payload.scenario_plan.accuracy_calculation
        : false;

      if (action.payload.common.user_name === "ankurv857") {
        state.config.project_setup = {
          project_name: "",
          usecase_name: action.payload.common.module_name,
        };
        state.config.scenario_plan.historical_horizon_snop = action.payload
          .scenario_plan.historical_horizon_snop
          ? action.payload.scenario_plan.historical_horizon_snop
          : 4;

        state.config.scenario_plan.current_sales_including_open_po = action
          .payload.scenario_plan.current_sales_including_open_po
          ? action.payload.scenario_plan.current_sales_including_open_po
          : false;

        state.config.scenario_plan.pricing_constraints = {
          ...state.config.scenario_plan.pricing_constraints,
          budget:
            action.payload.scenario_plan?.pricing_constraints?.budget || "None",
        };

        state.config.scenario_plan.inventory_constraints = {
          ...state.config.scenario_plan.inventory_constraints,
          disaggregate_inventory_metrics:
            action.payload.scenario_plan.inventory_constraints
              ?.disaggregate_inventory_metrics ||
            state.config.scenario_plan.inventory_constraints
              .disaggregate_inventory_metrics ||
            [],
          disaggregate_inventory_metrics_history: action.payload.scenario_plan
            .inventory_constraints?.disaggregate_inventory_metrics_history
            ? action.payload.scenario_plan.inventory_constraints
                .disaggregate_inventory_metrics_history
            : 90,
          disaggregate_inventory_metrics_granularity:
            action.payload.scenario_plan.inventory_constraints
              ?.disaggregate_inventory_metrics_granularity ||
            state.config.scenario_plan.inventory_constraints
              ?.disaggregate_inventory_metrics_granularity ||
            [],
        };

        if (!action.payload?.resource_config) {
          state.config.resource_config = {
            instance_size: "4xLarge",
          };
        }

        if (!action.payload.scenario_plan.convert_to_integer) {
          state.config.scenario_plan.convert_to_integer = false;
        }
        if (
          !action.payload?.scenario_plan?.inventory_constraints
            ?.item_id_dimensions
        ) {
          state.config.scenario_plan.inventory_constraints = {
            ...state.config.scenario_plan.inventory_constraints,
            item_id_dimensions: [],
          };
        }
        if (
          !action.payload?.scenario_plan?.inventory_constraints
            ?.facility_dimensions
        ) {
          state.config.scenario_plan.inventory_constraints = {
            ...state.config.scenario_plan.inventory_constraints,
            facility_dimensions: [],
          };
        }
        if (
          !action.payload?.scenario_plan?.inventory_constraints?.zone_dimensions
        ) {
          state.config.scenario_plan.inventory_constraints = {
            ...state.config.scenario_plan.inventory_constraints,
            zone_dimensions: [],
          };
        }
        state.job_list = initialState.job_list;
        state.operations =
          action.payload?.preprocess?.serial_ops[0]?.operations;
        if (
          action.payload?.preprocess?.serial_ops[0]?.operations?.length === 0 ||
          action.payload?.preprocess?.serial_ops[0]?.operations[0]
            ?.operation !== "aggregate_data"
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
          action.payload?.feature_engg?.exogenous_features;
        if (action.payload?.stacking?.enrichment_bydate !== undefined) {
          state.enrichment_bydate = action.payload?.stacking?.enrichment_bydate;
        }
        state.enrichment_bydate_pricing =
          action.payload?.stacking?.enrichment_bydate_pricing ?? [];
        state.enrichment_bydate_pricing_multi_filter =
          action.payload?.stacking?.enrichment_bydate_pricing_multi_filter ??
          [];

        state.enrichment_bydate_multi_filter =
          action.payload?.stacking?.enrichment_bydate_multi_filter ?? [];

        if (!action.payload?.scenario_plan?.demand_alignment_report) {
          state.config.scenario_plan.demand_alignment_report = {
            ts_id_view1: [],
            enable_aggregation: false,
            view0_report_name: "Default",
            view1_report_name: "View 1",
            create_future_locked_forecast_data: false,
            create_future_sales_data: false,
            consensus_overwrite: false,
            zero_sales_lag: 1,
            zero_forecast_horizon: 1,
            dimensions_for_accuracy: action.payload.data.ts_id_columns,
            calc_dimensions_accuracy: false,
          };
        } else {
          // Safely handle the case where demand_alignment_report exists but enable_aggregation might not
          const existingReport =
            action.payload?.scenario_plan?.demand_alignment_report;
          state.config.scenario_plan.demand_alignment_report = {
            ...existingReport,
            ts_id_view1: existingReport.ts_id_view1 || [],
            enable_aggregation:
              existingReport.enable_aggregation === undefined
                ? false
                : existingReport.enable_aggregation,
            view0_report_name:
              action.payload?.scenario_plan?.demand_alignment_report
                ?.view0_report_name || "Default",
            view1_report_name:
              action.payload?.scenario_plan?.demand_alignment_report
                .view1_report_name || "View 1",
            create_future_locked_forecast_data:
              action.payload?.scenario_plan?.demand_alignment_report
                ?.create_future_locked_forecast_data || false,

            create_future_sales_data:
              action.payload?.scenario_plan?.demand_alignment_report
                ?.create_future_sales_data || false,
            consensus_overwrite:
              action.payload?.scenario_plan?.demand_alignment_report
                ?.consensus_overwrite || false,

            zero_sales_lag:
              action.payload.scenario_plan?.demand_alignment_report
                ?.zero_sales_lag ?? 1,
            zero_forecast_horizon:
              action.payload.scenario_plan?.demand_alignment_report
                ?.zero_forecast_horizon ?? 1,
            dimensions_for_accuracy:
              action.payload.scenario_plan?.demand_alignment_report
                .dimensions_for_accuracy || action.payload.data.ts_id_columns,
            calc_dimensions_accuracy:
              action.payload.scenario_plan?.demand_alignment_report
                .calc_dimensions_accuracy || false,
          };
        }

        state.trial_params_mlp =
          action.payload?.training?.models?.MLP?.trial_params;
        state.trial_params_lstm =
          action.payload?.training?.models?.LSTM?.trial_params;
        state.trial_params_gru =
          action.payload?.training?.models?.GRU?.trial_params;
        state.showBomDataset = initialState.showBomDataset;
        state.showFutureDataset = initialState.showFutureDataset;
        state.showNewProductsDataset = initialState.showNewProductsDataset;
        state.showTransitionItemDataset =
          initialState.showTransitionItemDataset;
        state.showSimpleDisaggregateMappingDataset =
          initialState.showSimpleDisaggregateMappingDataset;
        state.showForecastDataset = initialState.showForecastDataset;
        state.showForecastRewriteDataset =
          initialState.showForecastRewriteDataset;
      } else {
        state.config.scenario_plan.historical_horizon_snop = action.payload
          .scenario_plan.historical_horizon_snop
          ? action.payload.scenario_plan.historical_horizon_snop
          : 4;

        state.config.scenario_plan.current_sales_including_open_po = action
          .payload.scenario_plan.current_sales_including_open_po
          ? action.payload.scenario_plan.current_sales_including_open_po
          : false;

        state.config.scenario_plan.pricing_constraints = {
          ...state.config.scenario_plan.pricing_constraints,
          budget: action.payload.scenario_plan.pricing_constraints.budget
            ? action.payload.scenario_plan.pricing_constraints.budget
            : "None",
        };

        state.config.scenario_plan.inventory_constraints = {
          ...state.config.scenario_plan.inventory_constraints,
          disaggregate_inventory_metrics:
            action.payload.scenario_plan.inventory_constraints
              ?.disaggregate_inventory_metrics ||
            state.config.scenario_plan.inventory_constraints
              .disaggregate_inventory_metrics ||
            [],
          disaggregate_inventory_metrics_history: action.payload.scenario_plan
            .inventory_constraints?.disaggregate_inventory_metrics_history
            ? action.payload.scenario_plan.inventory_constraints
                .disaggregate_inventory_metrics_history
            : 90,
          disaggregate_inventory_metrics_granularity:
            action.payload.scenario_plan.inventory_constraints
              ?.disaggregate_inventory_metrics_granularity ||
            state.config.scenario_plan.inventory_constraints
              ?.disaggregate_inventory_metrics_granularity ||
            [],
        };

        if (!action.payload.resource_config) {
          state.config.resource_config = {
            instance_size: "4xLarge",
          };
        }

        if (!action.payload.scenario_plan.demand_alignment_report) {
          state.config.scenario_plan.demand_alignment_report = {
            ts_id_view1: [],
            enable_aggregation: false,
            view0_report_name: "Default",
            view1_report_name: "View 1",
            create_future_locked_forecast_data: false,
            create_future_sales_data: false,
            consensus_overwrite: false,
            zero_sales_lag: 1,
            zero_forecast_horizon: 1,
            dimensions_for_accuracy: action.payload.data.ts_id_columns,
            calc_dimensions_accuracy: false,
          };
        } else {
          // Safely handle the case where demand_alignment_report exists but enable_aggregation might not
          const existingReport =
            action.payload.scenario_plan.demand_alignment_report;
          state.config.scenario_plan.demand_alignment_report = {
            ...existingReport,
            ts_id_view1: existingReport.ts_id_view1 || [],
            enable_aggregation:
              existingReport.enable_aggregation === undefined
                ? false
                : existingReport.enable_aggregation,
            view0_report_name:
              action.payload.scenario_plan.demand_alignment_report
                .view0_report_name || "Default",
            view1_report_name:
              action.payload.scenario_plan.demand_alignment_report
                .view1_report_name || "View 1",

            create_future_locked_forecast_data:
              action.payload.scenario_plan.demand_alignment_report
                .create_future_locked_forecast_data || false,

            create_future_sales_data:
              action.payload.scenario_plan.demand_alignment_report
                .create_future_sales_data || false,
            consensus_overwrite:
              action.payload?.scenario_plan?.demand_alignment_report
                ?.consensus_overwrite || false,

            zero_sales_lag:
              action.payload.scenario_plan?.demand_alignment_report
                ?.zero_sales_lag ?? 1,
            zero_forecast_horizon:
              action.payload.scenario_plan?.demand_alignment_report
                ?.zero_forecast_horizon ?? 1,
            dimensions_for_accuracy:
              action.payload.scenario_plan?.demand_alignment_report
                .dimensions_for_accuracy || action.payload.data.ts_id_columns,
            calc_dimensions_accuracy:
              action.payload.scenario_plan?.demand_alignment_report
                .calc_dimensions_accuracy || false,
          };
        }
        state.editedFiles =
          cleanUpConfigObjects(
            action.payload.stacking?.editedFiles ?? {},
            action.payload.common.job_id,
            action.payload.common.parent_job_id
          ) ?? {};
        state.editHistories =
          cleanUpConfigObjects(
            action.payload.editHistories ?? {},
            action.payload.common.job_id,
            action.payload.common.parent_job_id
          ) ?? {};
        state.lastSavedEditAt =
          cleanUpConfigObjects(
            action.payload?.lastSavedEditAt ?? {},
            action.payload.common.job_id,
            action.payload.common.parent_job_id
          ) ?? {};
        state.contextBuckets = action.payload.contextBuckets;
        state.contextBucketsFilledFlags =
          action.payload.contextBucketsFilledFlags;
        state.advanceSettingBuckets = action.payload.advanceSettingBuckets;
        state.advanceSettingBucketsFilledFlags =
          action.payload.advanceSettingBucketsFilledFlags;
        state.operations = action.payload.preprocess.serial_ops[0].operations;

        if (!action.payload.scenario_plan.convert_to_integer) {
          state.config.scenario_plan.convert_to_integer = false;
        }

        if (
          !action.payload.scenario_plan.inventory_constraints.item_id_dimensions
        ) {
          state.config.scenario_plan.inventory_constraints = {
            ...state.config.scenario_plan.inventory_constraints,
            item_id_dimensions: [],
          };
        }
        if (
          !action.payload.scenario_plan.inventory_constraints
            .facility_dimensions
        ) {
          state.config.scenario_plan.inventory_constraints = {
            ...state.config.scenario_plan.inventory_constraints,
            facility_dimensions: [],
          };
        }
        if (
          !action.payload.scenario_plan.inventory_constraints.zone_dimensions
        ) {
          state.config.scenario_plan.inventory_constraints = {
            ...state.config.scenario_plan.inventory_constraints,
            zone_dimensions: [],
          };
        }
        if (
          action.payload.preprocess.serial_ops[0].operations.length === 0 ||
          action.payload.preprocess.serial_ops[0].operations[0].operation !==
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
          action.payload.feature_engg.exogenous_features;
        if (action.payload.stacking.enrichment_bydate !== undefined) {
          state.enrichment_bydate = action.payload.stacking.enrichment_bydate;
        }
        state.enrichment_bydate_pricing_multi_filter =
          action.payload?.stacking?.enrichment_bydate_pricing_multi_filter ??
          [];
        state.enrichment_bydate_multi_filter =
          action.payload?.stacking?.enrichment_bydate_multi_filter ?? [];
        state.trial_params_mlp =
          action.payload.training.models.MLP.trial_params;
        state.trial_params_lstm =
          action.payload.training.models.LSTM.trial_params;
        state.trial_params_gru =
          action.payload.training.models.GRU.trial_params;

        if (action.payload.isMLSettingsDone !== undefined) {
          state.isMLSettingsDone = action.payload.isMLSettingsDone;
        }
        if (action.payload.isFeatureSettingsDone !== undefined) {
          state.isFeatureSettingsDone = action.payload.isFeatureSettingsDone;
        }
      }

      state.allColumns = ["None"];
      state.dateColumns = ["None"];
      state.numericColumns = ["None"];
      state.categoricalColumns = ["None"];

      console.log("Config Updated to: ", state.config);
    },
    setEditsConfig: (state, action) => {
      state.editsConfig = action.payload;
    },
    setExperimentsHistoryExpPath: (state, action) => {
      state.experiments_history_item.exp_path = action.payload;
    },
    setExperimentsHistoryDateTag: (state, action) => {
      state.experiments_history_item.date_tag = action.payload;
    },
    resetExperimentsHistoryItem: (state) => {
      state.experiments_history_item = initialState.experiments_history_item;
    },
    setIsProduction: (state, action) => {
      state.isProduction = action.payload;
    },
    setIsArchive: (state, action) => {
      state.isArchive = action.payload;
    },
    setExperimentDescription: (state, action) => {
      state.exp_description = action.payload;
    },
    addExperimentsHistoryItem: (state) => {
      if (
        state.experiments_history_item.exp_path &&
        state.experiments_history_item.date_tag
      ) {
        state.config.agent_settings.experiments_history.push(
          state.experiments_history_item
        );
        state.experiments_history_item = initialState.experiments_history_item;
      }
    },
    removeExperimentsHistoryItem: (state, action) => {
      const index = action.payload.index;
      if (
        Array.isArray(state.config.agent_settings.experiments_history) &&
        typeof index === "number" &&
        index >= 0 &&
        index < state.config.agent_settings.experiments_history.length
      ) {
        state.config.agent_settings.experiments_history.splice(index, 1);
      }
    },
    setForecastDataReferenceItemExpPath: (state, action) => {
      state.forecast_data_reference_item.exp_path = action.payload;
    },
    setForecastDataReferenceItemForecastType: (state, action) => {
      state.forecast_data_reference_item.forecast_type = action.payload;
    },
    setForecastDataReferenceItemColumnTag: (state, action) => {
      state.forecast_data_reference_item.column_tag = action.payload;
    },
    resetForecastDataReferenceItem: (state) => {
      state.forecast_data_reference_item =
        initialState.forecast_data_reference_item;
    },
    addForecastDataReferenceItem: (state) => {
      if (
        state.forecast_data_reference_item.exp_path &&
        state.forecast_data_reference_item.forecast_type &&
        state.forecast_data_reference_item.column_tag
      ) {
        state.config.dashboard_settings.forecast_data_reference.push(
          state.forecast_data_reference_item
        );
        state.forecast_data_reference_item = {
          ...state.forecast_data_reference_item,
          column_tag: initialState.forecast_data_reference_item.column_tag,
        };
      }
    },
    removeForecastDataReferenceItem: (state, action) => {
      const index = action.payload.index;
      if (
        Array.isArray(
          state.config.dashboard_settings.forecast_data_reference
        ) &&
        typeof index === "number" &&
        index >= 0 &&
        index < state.config.dashboard_settings.forecast_data_reference.length
      ) {
        state.config.dashboard_settings.forecast_data_reference.splice(
          index,
          1
        );
      }
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

      state.editsConfig = {
        ...state.editsConfig,
        editedFiles: {
          ...state.editsConfig.editedFiles,
          [fileName]: editedCells,
        },
      };

      state.config.stacking["editedFiles"][fileName] = editedCells;
      state.contextConfig.stacking["editedFiles"][fileName] = editedCells;
    },
    setNewRows: (state, action) => {
      const { fileName, newRows } = action.payload;
      if (!state.config.stacking["newRows"]) {
        state.config.stacking["newRows"] = {};
      }
      if (!state.contextConfig.stacking["newRows"]) {
        state.contextConfig.stacking["newRows"] = {};
      }

      state.editsConfig = {
        ...state.editsConfig,
        newRows: {
          ...state.editsConfig.newRows,
          [fileName]: newRows,
        },
      };
      state.config.stacking["newRows"][fileName] = newRows;
      state.contextConfig.stacking["newRows"][fileName] = newRows;
    },
    setDeletedRows: (state, action) => {
      const { fileName, deletedRows } = action.payload;
      if (!state.config.stacking["deletedRows"]) {
        state.config.stacking["deletedRows"] = {};
      }
      if (!state.contextConfig.stacking["deletedRows"]) {
        state.contextConfig.stacking["deletedRows"] = {};
      }
      if (!state.config["deletedRows"]) {
        state.config["deletedRows"] = {};
      }
      if (!state.contextConfig["deletedRows"]) {
        state.contextConfig["deletedRows"] = {};
      }
      state.editsConfig = {
        ...state.editsConfig,
        deletedRows: {},
      };
      state.config.stacking["deletedRows"][fileName] = [];
      state.contextConfig.stacking["deletedRows"][fileName] = [];
      state.config["deletedRows"][fileName] = [];
      state.contextConfig["deletedRows"][fileName] = [];
    },
    setEditHistories: (state, action) => {
      const { fileName, editHistory } = action.payload;
      if (!state.config["editHistories"]) {
        state.config["editHistories"] = {};
        state.contextConfig["editHistories"] = {};
      }
      state.editsConfig = {
        ...state.editsConfig,
        editHistories: {
          ...state.editsConfig.editHistories,
          [fileName]: editHistory,
        },
      };
      state.editHistories[fileName] = editHistory;
      state.config["editHistories"][fileName] = editHistory;
      state.contextConfig["editHistories"][fileName] = editHistory;
    },

    setLastSavedEditAt: (state, action) => {
      const { fileName, lastSavedAt } = action.payload;

      // Ensure all required properties exist
      if (!state.config["lastSavedEditAt"]) {
        state.config["lastSavedEditAt"] = {};
      }
      if (!state.contextConfig["lastSavedEditAt"]) {
        state.contextConfig["lastSavedEditAt"] = {};
      }
      if (!state.lastSavedEditAt) {
        // ← Add this initialization
        state.lastSavedEditAt = {};
      }
      if (!state.editsConfig.lastSavedEditAt) {
        // ← Also initialize this if needed
        state.editsConfig.lastSavedEditAt = {};
      }

      console.log(fileName, lastSavedAt, state.editsConfig);

      // Update in editsConfig
      state.editsConfig = {
        ...state.editsConfig,
        lastSavedEditAt: {
          ...state.editsConfig.lastSavedEditAt,
          [fileName]: lastSavedAt,
        },
      };

      console.log(fileName, lastSavedAt, state.editsConfig);

      // Now these are safe to use
      state.lastSavedEditAt[fileName] = lastSavedAt;
      state.config["lastSavedEditAt"][fileName] = lastSavedAt;
      state.contextConfig["lastSavedEditAt"][fileName] = lastSavedAt;
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
    setShowBomDataset: (state, action) => {
      state.showBomDataset = action.payload;
    },
    setShowFutureDataset: (state, action) => {
      state.showFutureDataset = action.payload;
    },
    setShowNewProductsDataset: (state, action) => {
      state.showNewProductsDataset = action.payload;
    },
    setShowTransitionItemDataset: (state, action) => {
      state.showTransitionItemDataset = action.payload;
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

    addEnrichmentMultiFilter: (state, action) => {
      // action.payload = enrichment object/value
      state.enrichment_bydate_multi_filter.push(action.payload);
    },

    addEnrichmentPricingMultiFilter: (state, action) => {
      // action.payload = enrichment object/value

      state.enrichment_bydate_pricing_multi_filter.push(action.payload);
    },

    removeEnrichmentMultifilter: (state, action) => {
      // action.payload = index (number)
      state.enrichment_bydate_multi_filter.splice(action.payload, 1);
    },

    removeEnrichmentPricingMultifilter: (state, action) => {
      // action.payload = index (number)
      state.enrichment_bydate_pricing_multi_filter.splice(action.payload, 1);
    },

    removeEnrichmentPricing: (state, action) => {
      // action.payload = index (number)
      state.enrichment_bydate_pricing.splice(action.payload, 1);
    },

    setTabFilterColumns: (state, action) => {
      const { columns, tab } = action.payload;

      // Mapping of tab names to their corresponding state properties
      const tabToStateMapping = {
        promo: "promoPlanningFilterColumns",
        snop: "snopFilterColumns",
        supplyPlanning: "supplyPlanningFilterColumns",
        demandForecasting: "demandForecastingFilterColumns",
      };

      const stateProperty = tabToStateMapping[tab];
      if (stateProperty) {
        state.config[stateProperty] = columns;
      }
    },

    setSupplyPlanDataType: (state, action) => {
      state.config.supplyPlanDataType = action.payload;
    },
    setShowUnitsChart: (state, action) => {
      state.config.showUnitsChart = action.payload;
    },
    setShowDOIChart: (state, action) => {
      state.config.showDOIChart = action.payload;
    },

    setActiveSeries: (state, action) => {
      state.config.activeSeries = action.payload;
    },
    setActiveDaysSeries: (state, action) => {
      state.config.activeDaysSeries = action.payload;
    },

    removeTabFilterColumns: (state, action) => {
      // Handle both old format (just index) and new format ({index, tab})
      const index =
        typeof action.payload === "number"
          ? action.payload
          : action.payload.index;
      const tab =
        typeof action.payload === "number" ? "promo" : action.payload.tab;

      // Mapping of tab names to their corresponding state properties
      const tabToStateMapping = {
        promo: "promoPlanningFilterColumns",
        snop: "snopFilterColumns",
        supplyPlanning: "supplyPlanningFilterColumns",
        demandForecasting: "demandForecastingFilterColumns",
      };

      const stateProperty = tabToStateMapping[tab];
      if (stateProperty && state.config[stateProperty]) {
        state.config[stateProperty].splice(index, 1);
      }
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
    removeEnrichmentPricing: (state, action) => {
      const id = action.payload;
      function removeItemAtIndex(array, index) {
        if (index >= 0 && index < array.length) {
          array.splice(index, 1); // Remove 1 item at the specified index
        }
        return array;
      }
      state.enrichment_bydate_pricing = removeItemAtIndex(
        state.enrichment_bydate_pricing,
        id
      );
    },
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

      state.config = updateNestedByPath(state.config, path, value);
    },
    setConfigByKeyValue: (state, action) => {
      const { key, value } = action.payload;
      state.config[key] = value;

      console.log("Config Updated to:", state.config);
    },

    toggleChartMetric: (state, action) => {
      const metric = action.payload;
      state.config.chartMetricVisibility[metric] =
        !state.config.chartMetricVisibility[metric];
    },

    initializeChartMetrics: (state, action) => {
      const { availableMetrics, primaryMetrics } = action.payload;

      availableMetrics.forEach((metric) => {
        if (!(metric in state.config.chartMetricVisibility)) {
          const isVisibleByDefault =
            (primaryMetrics.includes(metric) &&
              metric !== "rawActual" &&
              metric !== "lySales") ||
            metric === "forecast";
          state.config.chartMetricVisibility[metric] = isVisibleByDefault;
        }
      });
    },

    confirmAddData: (state, action) => {
      const { loadedDatasets, datasetsLoaded } = action.payload;

      // const removeDuplicates = (array) => {
      //   const uniqueArray = [...new Set(array)];
      //   // console.log("group column tags", uniqueArray);
      //   return uniqueArray;
      // };
      // state.config[project_setup] = project_setup;
      // if (!state.config["data_connections"]) {
      state.config["data_connections"] = {};
      state.config["showBomDataset"] = state.showBomDataset;
      state.config["showFutureDataset"] = state.showFutureDataset;
      state.config["showNewProductsDataset"] = state.showNewProductsDataset;
      state.config["showTransitionItemDataset"] =
        state.showTransitionItemDataset;
      state.config["showSimpleDisaggregateMappingDataset"] =
        state.showSimpleDisaggregateMappingDataset;
      state.config["showForecastDataset"] = state.showForecastDataset;
      state.config["showForecastRewriteDataset"] =
        state.showForecastRewriteDataset;
      // }
      state.config["loadedDatasets"] = loadedDatasets;
      state.config["datasetsLoaded"] = datasetsLoaded;
      state.config.etl.loaded_datasets = transformLoadedDataSet(loadedDatasets);
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
      state.taggedOptions = initialState.taggedOptions;

      console.log("loadedDatasets", loadedDatasets);

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

      // New code to handle new_product data
      let newGranularityOptions = [];
      let newDriverOptions = [];
      let newReplenishmentOptions = [];
      let newDimensionsOptions = [];

      const forecastHasData = loadedDatasets["forecast"]?.length > 0;

      // find index of the operation if it exists
      const syncOpIndex = state.operations.findIndex(
        (op) => op.operation === "sync_tsids_with_forecast"
      );

      if (forecastHasData) {
        // if not present, insert at index 1
        if (syncOpIndex === -1) {
          state.operations.splice(1, 0, {
            operation: "sync_tsids_with_forecast",
            kwargs: {},
          });
        }
      } else {
        // if present, remove it
        if (syncOpIndex !== -1) {
          state.operations.splice(syncOpIndex, 1);
        }
      }

      // Check if new_product array exists and has items

      const newProductHasData = loadedDatasets["new_product"]?.length > 0;

      // find the index if it already exists
      const newProductOpIndex = state.operations.findIndex(
        (op) => op.operation === "new_product_forecasting"
      );
      if (
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

          state.config.scenario_plan.new_product_forecasting.new_prod_granularity =
            newGranularityOptions;
          state.config.scenario_plan.new_product_forecasting.new_product_driver =
            newDriverOptions;
          state.config.scenario_plan.new_product_forecasting.new_product_replenishment_constraints =
            newReplenishmentOptions;

          if (
            !state.operations.some(
              (op) => op.operation === "new_product_forecasting"
            )
          ) {
            state.operations.splice(1, 0, {
              operation: "new_product_forecasting",
              kwargs: {},
            });
          }
        }
      } else {
        if (newProductOpIndex !== -1) {
          state.operations = state.operations.filter(
            (op) => op.operation !== "new_product_forecasting"
          );
        }
      }

      if (!state.contextConfig) {
        state.contextConfig = updateDataBlock(state.config, loadedDatasets);
      } else {
        state.contextConfig = updateDataBlock(
          state.contextConfig,
          loadedDatasets
        );
      }

      let dimensions = [];

      // Case 1: No datasets at all
      if (
        !loadedDatasets?.item_master ||
        loadedDatasets.item_master.length === 0
      ) {
        dimensions = [];
        console.log("No datasets found, dimensions set to empty array");
      } else {
        const itemMaster = loadedDatasets.item_master;
        console.log("itemMaster", itemMaster);

        // Case 2: Only one dataset
        if (itemMaster.length === 1) {
          const dataset = itemMaster[0];
          // Only get dimensions if supply_item_master is explicitly true
          if (
            dataset.field_tags?.supply_item_master === true &&
            dataset.field_tags.dimensions
          ) {
            dimensions = [...dataset.field_tags.dimensions];
            console.log("Single dataset with valid dimensions found");
          }
          // If false/null, dimensions remains empty array
        } else {
          // Case 3: Multiple datasets (max 2 as per your requirement)
          // Find the dataset with supply_item_master true
          const supplyDataset = itemMaster.find(
            (item) => item.field_tags?.supply_item_master === true
          );

          // If found and it has dimensions, use them
          if (supplyDataset && supplyDataset.field_tags?.dimensions) {
            dimensions = [...supplyDataset.field_tags.dimensions];
            console.log(
              "Multiple datasets, found supply dataset with dimensions"
            );
          }
        }
      }

      state.config = updateDataBlock(state.config, loadedDatasets);
      console.log("Config after the add data :", state.config);
      let allCols = [];
      let dateCols = [];
      let numCols = [];
      let catCols = [];
      const frequencyValues = [
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

      const inventory_column = state.config.data?.inventory_column || "";
      const replenishment_columns = Array.isArray(
        state.config.etl.loaded_datasets?.inventory?.[0]?.field_tags
          ?.replenishment_columns
      )
        ? state.config.etl.loaded_datasets?.inventory?.[0]?.field_tags
            ?.replenishment_columns
        : [];

      // Then create the unique options array
      const inventoryMetricsOptions = [
        ...new Set([
          inventory_column,
          ...replenishment_columns,
          "running_purchase_order",
          "MOQ",
        ]),
      ].filter(Boolean);

      const maxRange = 1000; // Maximum allowed count value
      const minRange = -1000;

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

      var isBOMAdded = false;
      for (const tag in loadedDatasets) {
        if (
          loadedDatasets[tag].length > 0 &&
          ["bom_mapping", "bom_inventory", "bomothers"].includes(tag)
        ) {
          isBOMAdded = true;
        }
      }
      const hasOptimizationColumn =
        state.config.data.optimization_column !== "None" &&
        state.config.data.optimization_column !== null;
      console.log("isBOM", isBOMAdded);
      const hasCurrency =
        state.config.scenario_plan.pricing_constraints.currency !== undefined;
      console.log("hasCurrency", hasCurrency);
      state.contextBuckets = getContextBuckets(
        state.config.common.module_name,
        isBOMAdded,
        hasCurrency,
        state.taggedOptions,

        newGranularityOptions,
        newDimensionsOptions,
        removeDuplicates(state.allColumns),
        removeDuplicates(state.dateColumns),
        removeDuplicates(state.numericColumns),
        removeDuplicates(state.categoricalColumns),
        frequencyValues,
        frequencyValuesDict,
        hasOptimizationColumn,
        inventoryMetricsOptions,
        state.config,
        dimensions
      );

      const contextBuckets = getContextBuckets(
        state.config.common.module_name,
        isBOMAdded,
        hasCurrency,
        state.taggedOptions,
        newGranularityOptions,
        newDimensionsOptions,
        removeDuplicates(allCols),
        removeDuplicates(dateCols),
        removeDuplicates(numCols),
        removeDuplicates(catCols),
        frequencyValues,
        frequencyValuesDict,
        hasOptimizationColumn,
        inventoryMetricsOptions,
        state.config,
        dimensions
      );
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

      if (state.config.scenario_plan.historical_horizon_snop === undefined) {
        state.config.scenario_plan.historical_horizon_snop = 4;
      }

      if (state.currentBucket === "None") {
        state.currentBucket = "FC";
      }

      if (state.currentAdvanceSettingBucket === "None") {
        state.currentAdvanceSettingBucket = "MS";
      }

      // Ensure scenario_plan exists and is extensible
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
      };
    },

    confirmPlannerCoding: (state, action) => {
      let newGranularityOptions = [];
      let newDriverOptions = [];
      let newReplenishmentOptions = [];
      let newDimensionsOptions = [];

      let allCols = [];
      let dateCols = [];
      let numCols = [];
      let catCols = [];
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
      const inventory_column = state.config.data?.inventory_column || "";
      const replenishment_columns = Array.isArray(
        state.config.etl.loaded_datasets?.inventory?.[0]?.field_tags
          ?.replenishment_columns
      )
        ? state.config.etl.loaded_datasets?.inventory?.[0]?.field_tags
            ?.replenishment_columns
        : [];

      // Then create the unique options array
      const inventoryMetricsOptions = [
        ...new Set([
          inventory_column,
          ...replenishment_columns,
          "running_purchase_order",
          "MOQ",
        ]),
      ].filter(Boolean);

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

      const frequencyValues = [
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
      var isBOMAdded = false;
      for (const tag in loadedDatasets) {
        if (
          loadedDatasets[tag].length > 0 &&
          ["bom_mapping", "bom_inventory", "bomothers"].includes(tag)
        ) {
          isBOMAdded = true;
        }
      }

      if (
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
      }
      const hasOptimizationColumn =
        state.config.data.optimization_column !== "None" &&
        state.config.data.optimization_column !== null;
      console.log("isBOM", isBOMAdded);
      const hasCurrency =
        state.config.scenario_plan.pricing_constraints.currency !== undefined;
      console.log("hasCurrency", hasCurrency);
      state.contextBuckets = getContextBuckets(
        state.config.common.module_name,
        isBOMAdded,
        hasCurrency,
        state.taggedOptions,
        newGranularityOptions,
        newDimensionsOptions,
        removeDuplicates(allCols),
        removeDuplicates(dateCols),
        removeDuplicates(numCols),
        removeDuplicates(catCols),
        frequencyValues,
        frequencyValuesDict,
        hasOptimizationColumn,
        inventoryMetricsOptions,
        state.config
      );

      const contextBuckets = getContextBuckets(
        state.config.common.module_name,
        isBOMAdded,
        hasCurrency,
        state.taggedOptions,
        newGranularityOptions,
        newDimensionsOptions,
        removeDuplicates(allCols),
        removeDuplicates(dateCols),
        removeDuplicates(numCols),
        removeDuplicates(catCols),
        frequencyValues,
        frequencyValuesDict,
        hasOptimizationColumn,
        inventoryMetricsOptions,
        state.config
      );

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

    setPreviewEnrichment: (state, action) => {
      state.previewEnrichment = {
        ...state.previewEnrichment,
        ...action.payload,
      };
    },

    resetPreviewEnrichment: (state) => {
      state.previewEnrichment = initialState.previewEnrichment;
    },

    // Update specific fields in previewEnrichment
    setPreviewEnrichmentField: (state, action) => {
      const { field, value } = action.payload;
      if (state.previewEnrichment.hasOwnProperty(field)) {
        state.previewEnrichment[field] = value;
      }
    },

    // Set preview enrichment date range
    setPreviewEnrichmentDateRange: (state, action) => {
      const { startDate, endDate } = action.payload;
      state.previewEnrichment.date_range = [startDate, endDate];
    },

    // Set preview enrichment value
    setPreviewEnrichmentValue: (state, action) => {
      state.previewEnrichment.enrichment_value = action.payload;
    },

    // Set preview changed price percent
    setPreviewChangedPricePercent: (state, action) => {
      state.previewEnrichment.changed_price_percent = action.payload;
    },

    setIsTGScenario: (state, action) => {
      state.isTGScenario = action.payload;
    },

    addJoins: (state, action) => {
      const {
        input_data,
        bom_input_data,
        inventory_input_data,
        join_operations_inventory,
        join_operations,
        join_operations_future,
        join_operations_bom,
        join_operations_forecast,
        join_operations_supply_item_master,
        join_operations_new_product,
        join_operations_simple_disaggregation_mapping,
      } = action.payload;
      state.config.etl["input_data"] = input_data;
      state.config.etl["bom_input_data"] = bom_input_data;
      state.config.etl["inventory_input_data"] = inventory_input_data;
      state.config.etl["join_operations_inventory"] = join_operations_inventory;
      state.config.etl["join_operations"] = join_operations;
      state.config.etl["join_operations_future"] = join_operations_future;
      state.config.etl["join_operations_forecast"] = join_operations_forecast;
      state.config.etl["join_operations_supply_item_master"] =
        join_operations_supply_item_master;
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
      if (
        state.config.scenario_plan?.production_plan?.production_plan_metrics
      ) {
        state.config.scenario_plan.production_plan.production_plan_metrics =
          state.config.scenario_plan.production_plan.production_plan_metrics.map(
            (item) => (item === "Production Plan" ? "Reorder Plan" : item)
          );
      }

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

      state.advanceSettingBuckets = getAdvanceSettingsBucket(
        state.config.common.module_name,
        state.taggedOptions,
        state.config.data.driver_columns,
        state.config.data.ts_id_columns,
        state.config
      );

      const advanceSettingBuckets = getAdvanceSettingsBucket(
        state.config.common.module_name,
        state.taggedOptions,
        state.config.data.driver_columns,
        state.config.data.ts_id_columns,
        state.config
      );

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
        state.currentAdvanceSettingBucket = "MS";
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

        state.contextConfig = updateNestedByPath(state.config, path, value);
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

        const isSame = deepEqual(defaultValue, newValue);
        const isEmpty = newValue === null || isSame;
        console.log("notEmpty", isEmpty);
        return isSame;
      };

      const group = action.payload;
      let isSame = true;
      if (["FC", "IR", "PP"].includes(group)) {
        console.log("Confirming the Bucket", group);

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
        state.contextBucketsFilledFlags[group] = true;
      }

      if (["FC", "IR", "PP"].includes(group)) {
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
      if (arrayName === "experiments_history") {
        state.config.agent_settings.experiments_history =
          state.config.agent_settings.experiments_history.filter(
            (_, i) => i !== index
          );
        if (state.config.agent_settings.experiments_history.length > 0) {
          state.advanceSettingBucketsFilledFlags[featureGroup] = true;
        } else {
          state.advanceSettingBucketsFilledFlags[featureGroup] = false;
        }
      }
      if (arrayName === "forecast_data_reference") {
        state.config.dashboard_settings.forecast_data_reference =
          state.config.dashboard_settings.forecast_data_reference.filter(
            (_, i) => i !== index
          );
        if (
          state.config.dashboard_settings.forecast_data_reference.length > 0
        ) {
          state.advanceSettingBucketsFilledFlags[featureGroup] = true;
        } else {
          state.advanceSettingBucketsFilledFlags[featureGroup] = false;
        }
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
        case "AHS":
          if (state.config.agent_settings.experiments_history.length > 0) {
            state.advanceSettingBucketsFilledFlags[group] = true;
          } else {
            state.advanceSettingBucketsFilledFlags[group] = false;
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
        case "FRS":
          if (
            state.config.dashboard_settings.forecast_data_reference.length > 0
          ) {
            state.advanceSettingBucketsFilledFlags[group] = true;
          } else {
            state.advanceSettingBucketsFilledFlags[group] = false;
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
          state.advanceSettingBucketsFilledFlags[group] = true;
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
    addEnrichment: (state, action) => {
      console.log("action.payload " + action.payload);
      const changables = ["Cluster", "Forecast_Granularity"];
      const dict = { Cluster: "cluster", Forecast_Granularity: "ts_id" };

      const convert = (dimension) => {
        if (changables.includes(dimension)) {
          return dict[dimension];
        }
        return dimension;
      };
      const changedPricePercent = state.enrichment.kwargs.changed_price_percent;
      const actionValue = action.payload;

      const enrichment = {
        ...state.enrichment.kwargs,
        dimension: convert(state.enrichment.kwargs.dimension),
        enrichment_value:
          changedPricePercent != null && actionValue != null
            ? changedPricePercent * actionValue
            : state.enrichment.kwargs.enrichment_value,
        ...(changedPricePercent != null &&
          actionValue != null && {
            elasticity: actionValue,
          }),
      };

      // Remove changed_price_percent if both changedPricePercent and actionValue are null
      if (changedPricePercent == null && actionValue == null) {
        const { changed_price_percent, ...enrichmentWithoutChangedPrice } =
          enrichment;
        state.enrichment_bydate.push(enrichmentWithoutChangedPrice);
      }
      // Add to pricing array if both values are not null
      else if (changedPricePercent != null && actionValue != null) {
        if (!state.enrichment_bydate_pricing) {
          state.enrichment_bydate_pricing = []; // Initialize if undefined
        }
        state.enrichment_bydate_pricing.push(enrichment);
      }
      // Default case: add to regular array
      else {
        state.enrichment_bydate.push(enrichment);
      }

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

      // Remove from deleted_base_datasets if it exists there
      state.config.deleted_base_datasets =
        state.config.deleted_base_datasets.filter(
          (name) => name !== datasetName
        );

      // Add to byor_base_datasets (you might also want to check for duplicates)
      if (!state.config.byor_base_datasets.includes(datasetName)) {
        state.config.byor_base_datasets.push(datasetName);
      }
    },

    setBaseDatasets: (state, action) => {
      state.config.byor_base_datasets = action.payload || [];
    },

    setDeletedBaseDatasets: (state, action) => {
      state.config.deleted_base_datasets = action.payload || [];
    },

    confirmAdvancedSettings: (state) => {
      console.log(state.config.scenario_plan.production_plan);
      if (
        state.config.scenario_plan?.production_plan?.production_plan_metrics
      ) {
        state.config.scenario_plan.production_plan.production_plan_metrics =
          state.config.scenario_plan.production_plan.production_plan_metrics.map(
            (item) => (item === "Production Plan" ? "Reorder Plan" : item)
          );
      }

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

      function updateReplenishmentColumnsWithIntransit(loadedDatasets) {
        let changesMade = 0;

        Object.values(loadedDatasets)
          .flat()
          .forEach((dataset) => {
            const { field_tags } = dataset;

            if (field_tags?.intransit && field_tags?.replenishment_columns) {
              console.log(`Processing dataset: ${dataset.filename}`);
              console.log(`intransit: ${field_tags.intransit}`);
              console.log(
                `replenishment_columns before:`,
                field_tags.replenishment_columns
              );

              if (
                !field_tags.replenishment_columns.includes(field_tags.intransit)
              ) {
                field_tags.replenishment_columns.push(field_tags.intransit);
                changesMade++;
                console.log(
                  `Added ${field_tags.intransit} to replenishment_columns`
                );
              } else {
                console.log(
                  `${field_tags.intransit} already exists in replenishment_columns`
                );
              }

              console.log(
                `replenishment_columns after:`,
                field_tags.replenishment_columns
              );
              console.log("---");
            }
          });

        console.log(`Total changes made: ${changesMade}`);
        return loadedDatasets;
      }

      const sanitizedEnrichmentByDate = sanitizeDeep(state.enrichment_bydate);

      const sanitizedOperations = sanitizeDeep(state.operations);
      const sanitizedEnrichmentByDatePricing = sanitizeDeep(
        state.enrichment_bydate_pricing
      );
      const sanitizedEnrichmentByDatePricingMultiFilter = sanitizeDeep(
        state.enrichment_bydate_pricing_multi_filter
      );
      const sanitizedEnrichmentByDateMultiFilter = sanitizeDeep(
        state.enrichment_bydate_multi_filter
      );

      state.config["advanceSettingBuckets"] = state.advanceSettingBuckets;
      state.config["advanceSettingBucketsFilledFlags"] =
        state.advanceSettingBucketsFilledFlags;
      state.config.preprocess.serial_ops[0].operations = sanitizedOperations;
      state.config.feature_engg.exogenous_features = state.exogenous_features;
      state.config.stacking.enrichment_bydate = sanitizedEnrichmentByDate;
      state.config.stacking.enrichment_bydate_pricing =
        sanitizedEnrichmentByDatePricing;
      state.config.stacking.enrichment_bydate_multi_filter =
        sanitizedEnrichmentByDateMultiFilter;
      state.config.stacking.enrichment_bydate_pricing_multi_filter =
        sanitizedEnrichmentByDatePricingMultiFilter;

      const updatedDatasets = updateReplenishmentColumnsWithIntransit(
        state.config.loadedDatasets
      );

      state.config.loadedDatasets = updatedDatasets;

      const updatedETLDatasets = updateReplenishmentColumnsWithIntransit(
        state.config.etl.loaded_datasets
      );

      state.config.etl.loaded_datasets = updatedETLDatasets;

      console.log(
        "FINAL RESULT:",
        JSON.parse(JSON.stringify(state.config.etl.loaded_datasets))
      );
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
    setAdjustment_bydate: (state, action) => {
      state.operations = [state.operations[0], ...action.payload];
    },
    setAdjustment: (state, action) => {
      state.adjustment = action.payload;
    },

    remove_new_product_operation: (state) => {
      state.operations = state.operations.filter(
        (op) => op.operation !== "new_product_forecasting"
      );
      return state;
    },
  },
});

export const {
  setConfig,
  updateConfig,
  removeEnrichmentMultifilter,
  removeEnrichmentPricingMultifilter,
  addEnrichmentMultiFilter,
  addEnrichmentPricingMultiFilter,
  setLoading,
  setError,
  updateConfigByPath,
  setConfigByKeyValue,
  confirmAddData,
  confirmPlannerCoding,
  addJoins,
  updateContextConfigByPath,
  confirmAddContext,
  restoreToDefault,
  restoreMLToDefault,
  setCurrentBucket,
  setCurrentAdvanceSettingBucket,
  setFeatureGroup,
  confirmContextGroup,
  confirmAdvanceSettingsGroup,
  setContextBucketsFilledFlags,
  setAdvanceSettingBucketsFilledFlags,
  setNewAdvanceSettingBucketsFilledFlags,
  setAdvanceSettingBuckets,
  updateAdjustDataByPath,
  updateEnrichmentByPath,
  updateExogenousFeatureByPath,
  updateDatePairByPath,
  addAdjustData,
  addEnrichment,
  addExogenousFeature,
  addTrialParams,
  editTrialParams,
  addDates,
  deleteBaseDataset,
  setDeletedBaseDatasets,
  setBaseDatasets,
  byor_base_datasets,
  confirmAdvancedSettings,
  confirmMLAdvancedSettings,
  setShowBomDataset,
  setShowFutureDataset,
  setShowForecastDataset,
  setShowNewProductsDataset,
  setshowSimpleDisaggregateMappingDataset,
  setShowForecastRewriteDataset,
  setShowTransitionItemDataset,
  resetAdvanceSettingToDefault,
  removeExogenousFeature,
  removePlannerAdjustment,
  removeEnrichment,
  removeEnrichmentPricing,
  removeItem,
  setContextConfig,
  setEnrichmentDimension,
  setEnrichmentValue,
  setEnrichmentStartDate,
  addBaseDataset,
  setEnrichment,
  setAdjustment,
  setEnrichmentEndDate,

  setAdjustmentStartDate,
  setAdjustmentEndDate,
  setEnrichmentEnrichmentValue,
  setAdjustmentDimension,
  setAdjustmentValue,
  setAdjustmentAdjustValue,
  setEditedFile,
  setEditHistories,
  setLastSavedEditAt,
  setHasConflict,
  setIsNoInstanceAvailable,
  loadFilterToConfig,
  clearConfigCache,
  addDisaggregateInventoryMetricsGranularity,
  setEnrichment_bydate,
  setAdjustment_bydate,
  remove_new_product_operation,
  setNewRows,
  setDeletedRows,
  removeRLAgentEnrichment,
  setEditsConfig,
  uploadEditsConfig,
  setTabFilterColumns,
  removeTabFilterColumns,
  // Preview Enrichment exports
  setPreviewEnrichment,
  resetPreviewEnrichment,
  setPreviewEnrichmentField,
  setPreviewEnrichmentDateRange,
  setPreviewEnrichmentValue,
  setPreviewChangedPricePercent,
  setForecastDataReferenceItemExpPath,
  setForecastDataReferenceItemForecastType,
  setForecastDataReferenceItemColumnTag,
  resetForecastDataReferenceItem,
  addForecastDataReferenceItem,
  removeForecastDataReferenceItem,
  setExperimentsHistoryExpPath,
  setExperimentsHistoryDateTag,
  resetExperimentsHistoryItem,
  addExperimentsHistoryItem,
  removeExperimentsHistoryItem,
  setExperimentDescription,
  setIsArchive,
  setIsProduction,
  // isTGScenario exports
  setSupplyPlanDataType,
  toggleChartMetric,
  initializeChartMetrics,
  setIsTGScenario,
  setShowUnitsChart,
  setShowDOIChart,
  setActiveSeries,
  setActiveDaysSeries,
} = configSlice.actions;

export default configSlice.reducer;
