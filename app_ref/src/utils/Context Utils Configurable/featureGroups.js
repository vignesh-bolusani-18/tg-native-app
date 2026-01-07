import { allContextFields } from "./allContextFields";

export const featureGroups = () => {
  const allContextFieldsList = allContextFields();
  return {
    FP: {
      title: "Forecasting Parameters",
      description: "Forecasting Parameters Description",
      is_enabled: true,
      features: [
        allContextFieldsList.activity_end_date,
        allContextFieldsList.history,
        allContextFieldsList.activity_period,
        allContextFieldsList.frequency,
        allContextFieldsList.forecast_horizon,
        allContextFieldsList.validation_horizon,
        allContextFieldsList.historical_reference_date,
        allContextFieldsList.filter_target_gt_zero,
      ],
    },
    FGS: {
      title: " Forecast Granularity Settings",
      description: " Forecast Granularity Settings Description",
      is_enabled: true,
      features: [
        allContextFieldsList.ts_id_columns,
        allContextFieldsList.ts_id_columns_disagg,
        allContextFieldsList.Oscillator_based_on_disaggregation,
        allContextFieldsList.ml_based_disaggregation,
        allContextFieldsList.multiprocessing_disaggregation,
        allContextFieldsList.disaggregation_distribution_key,
        allContextFieldsList.simple_disaggregation_forecasting_heading_1,
        allContextFieldsList.ts_id_columns_simple_disaggr,
        allContextFieldsList.bundle_mapping_granularity,
        allContextFieldsList.bundle_forecast_granularity,
        allContextFieldsList.simple_mapping,
        allContextFieldsList.simple_disaggregation_quantity,
      ],
    },

    NPS: {
      title: "New Products Settings",
      description: "New Products Forecast Description",
      is_enabled: true,
      features: [
        allContextFieldsList.new_product_forecasting_heading_1,
        allContextFieldsList.need_new_product_forecasting,
        allContextFieldsList.new_product_days_cutoff,
        allContextFieldsList.new_product_sale_days,
        allContextFieldsList.data_generation_dimension_recents,
        allContextFieldsList.new_product_forecasting_heading_2,

        allContextFieldsList.new_prod_granularity,
        allContextFieldsList.data_generation_dimension,
        allContextFieldsList.days_to_be_generated,
      ],
    },
    OFC: {
      title: "Optimization Fields",
      description: "Optimization Fields Description",
      is_enabled:
        "Script(return config.data.optimization_column !== 'None' && config.data.optimization_column !== null;)",
      features: [
        allContextFieldsList.optimization_period,
        allContextFieldsList.optimization_forecast_period,
        allContextFieldsList.epsilon,
        allContextFieldsList.sku_id_col,
      ],
    },
    IGP: {
      title: "Inventory Granularity & Planning", // Tested
      description: "Inventory Granularity & Planning Description",
      is_enabled: true,
      features: [
        allContextFieldsList.inventory_optimisation_granularity,
        allContextFieldsList.inventory_planning_frequency,
        allContextFieldsList.multiprocessing_inventory,
        allContextFieldsList.inventory_distribution_key,
        allContextFieldsList.adjust_reorder_basis_moving_forecast,
        allContextFieldsList.add_non_sellable_inventory,
        allContextFieldsList.disaggregate_inventory_metrics_history,
        allContextFieldsList.disaggregate_inventory_metrics,
        allContextFieldsList.disaggregate_inventory_metrics_granularity,
      ],
    },
    SSC: {
      title: "Supply Side Constraints", //Tested
      description: "Supply Side Constraints Description",
      is_enabled: true,
      features: [
        allContextFieldsList.lead_time_col,
        allContextFieldsList.lead_time,
        allContextFieldsList.safety_stock_days_col,
        allContextFieldsList.safety_stock_days,
        allContextFieldsList.current_safety_stock_col,
        allContextFieldsList.Ideal_DOI_col,
        allContextFieldsList.Ideal_DOI,
        allContextFieldsList.service_level_col,
        allContextFieldsList.service_level,
        allContextFieldsList.minimum_order_qty_col,
        allContextFieldsList.minimum_order_qty,
        allContextFieldsList.running_purchase_order,
        allContextFieldsList.open_purchase_order,
        allContextFieldsList.days_to_running_po,
      ],
    },
    STR: {
      title: "Stock Transfer & Re-Balancing",
      description: "Stock Transfer & Re-Balancing Description",
      is_enabled: true,
      features: [
        allContextFieldsList.enable_stock_transfer,
        allContextFieldsList.stock_transfer_level,
        allContextFieldsList.stock_transfer_dimension,
        allContextFieldsList.stock_transfer_facility,
        allContextFieldsList.stock_transfer_facility_dimension,
        allContextFieldsList.stock_transfer_zone,
        allContextFieldsList.stock_transfer_zone_dimensions,
        allContextFieldsList.unconstriant_stock_transfer,
        allContextFieldsList.stock_transfer_adjusted_reorder,
      ],
    },
    BLIT: {
      title: "Batch Level Inventory Tracking",
      description: "Batch Level Inventory Tracking Description",
      is_enabled: true,
      features: [
        allContextFieldsList.batch_column,
        allContextFieldsList.expiry_date,
        allContextFieldsList.expiry_date_format,
        allContextFieldsList.tolerance_level_days_col,
        allContextFieldsList.tolerance_level_days,
      ],
    },
    NNO: {
      title: "Network Node Optimization",
      description: "Network Node Optimization Description",
      is_enabled: true,
      features: [
        allContextFieldsList.enable_network_optimization,
        allContextFieldsList.parent_warehouse_node_buffer,
        allContextFieldsList.item_node,
        allContextFieldsList.warehouse_node,
        allContextFieldsList.fulfillment_node,
        allContextFieldsList.network_sequence,
      ],
    },
    PVS: {
      title: "Other planner levels",
      description: "Other planner levels (Planner View Settings) Description",
      is_enabled: true,
      features: [
        allContextFieldsList.rewrite_forecast,
        allContextFieldsList.total_demand,
        allContextFieldsList.inventory_pivot_data,
        allContextFieldsList.row_dim,
        allContextFieldsList.column_dim,
        allContextFieldsList.pivot_features,
        allContextFieldsList.round_off_reorder,
        allContextFieldsList.round_off_reorder_col,
        allContextFieldsList.round_off_by,
        allContextFieldsList.dead_stock_granularity,
        allContextFieldsList.inventory_ageing_flag,
      ],
    },
    BOMD: {
      title: "Bill of Material Details",
      description: "Bill of Material Details Description",
      is_enabled: `Script(
      let isBOMDataLoaded = false;
      const loadedDatasets = config.etl.loaded_datasets;
      if (ui_config.datasets.dataset_groups.hasOwnProperty("bom_datasets_tags")) {
        for (const tag in loadedDatasets) {
          if (
            loadedDatasets[tag].length > 0 &&
            ui_config.datasets.dataset_groups.bom_datasets_tags.includes(
              tag
            )
          ) {
            isBOMDataLoaded = true;
          }
        }
      }
      return isBOMDataLoaded;
      )`,
      features: [
        allContextFieldsList.finished_good_column_mapping_granularity,
        allContextFieldsList.plant_column_mapping_granularity,
        allContextFieldsList.finished_good_column_forecast_granularity,
        allContextFieldsList.plant_column_forecast_granularity,
        allContextFieldsList.raw_material_column_mapping,
        allContextFieldsList.raw_material_qty,
      ],
    },
    BOMSC: {
      title: "Bill of Materials Supply Constraints",
      description: "Bill of Materials Supply Constraints Description",
      is_enabled: `Script(
      let isBOMDataLoaded = false;
      const loadedDatasets = config.etl.loaded_datasets;
      if (ui_config.datasets.dataset_groups.hasOwnProperty("bom_datasets_tags")) {
        for (const tag in loadedDatasets) {
          if (
            loadedDatasets[tag].length > 0 &&
            ui_config.datasets.dataset_groups.bom_datasets_tags.includes(
              tag
            )
          ) {
            isBOMDataLoaded = true;
          }
        }
      }
      return isBOMDataLoaded;
      )`,
      features: [
        allContextFieldsList.bom_lead_time_col,
        allContextFieldsList.bom_lead_time,
        allContextFieldsList.bom_safety_stock_days_col,
        allContextFieldsList.bom_safety_stock_days,
        allContextFieldsList.bom_Ideal_DOI_col,
        allContextFieldsList.bom_Ideal_DOI,
        allContextFieldsList.bom_service_level_col,
        allContextFieldsList.bom_service_level,
        allContextFieldsList.bom_minimum_order_qty_col,
        allContextFieldsList.bom_minimum_order_qty,
        allContextFieldsList.bom_running_purchase_order,
        allContextFieldsList.bom_days_to_running_po,
      ],
    },
    PC: {
      title: "Pricing Constraints",
      description: "Pricing Constraints Description",
      is_enabled: true,
      features: [
        allContextFieldsList.currency,
        allContextFieldsList.cost,
        allContextFieldsList.price,
        allContextFieldsList.MRP,
        allContextFieldsList.budget,
        allContextFieldsList.Objective,
        allContextFieldsList.revenue_weight_col,
        allContextFieldsList.revenue_weight,
        allContextFieldsList.Revenue_target_Percent,
        allContextFieldsList.Margin_Target_Percent,
        allContextFieldsList.Min_Price_Change_col,
        allContextFieldsList.Min_Price_Change,
        allContextFieldsList.Max_Price_Change_col,
        allContextFieldsList.Max_Price_Change,
        allContextFieldsList.step_change_min_to_max,
        allContextFieldsList.cuts_by_sales_buckets,
        allContextFieldsList.current_discount_assumption,
        allContextFieldsList.rounding_off_price,
        allContextFieldsList.round_off_by_multiplication,
        allContextFieldsList.round_off_by_addition,
      ],
    },
    PAS: {
      title: "Pricing Advanced Setting",
      description: "Pricing Advanced Setting Description",
      is_enabled: true,
      features: [
        allContextFieldsList.margin_assumption,
        allContextFieldsList.Iterations,
        allContextFieldsList.mkd_margin_perc_min,
        allContextFieldsList.mkd_margin_perc_step_size,
        allContextFieldsList.lqd_margin_perc_min,
        allContextFieldsList.lqd_margin_perc_step_size,
        allContextFieldsList.liquidation_multiplier,
      ],
    },
    PPP: {
      title: "Production Plan Parameters",
      description: "Production Plan Parameters Description",
      is_enabled: true,
      features: [
        allContextFieldsList.production_plan_dimensions,
        allContextFieldsList.production_plan_metrics,
      ],
    },
    PPC: {
      title: "Production Plan Constraints",
      description: "Production Plan Constraints Description",
      is_enabled: true,
      features: [allContextFieldsList.capacity_constraint],
    },
    OPPC: {
      title: "Other Production Plan Constraints",
      description: "Other Production Plan Constraints Description",
      is_enabled: true,
      features: [
        allContextFieldsList.production_plan_historical_horizon,
        allContextFieldsList.production_plan_avg_calc_horizon,
        allContextFieldsList.production_plan_forecast_final_calculation,
      ],
    },
  };
};
