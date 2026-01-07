export const allReports = {
  Forecast: {
    title: "Forecast",
    path: "scenario_planning/K_best/forecast/forecast_data.csv",
    data: null,
    isSingle: true,
  },
  Forecast_Pivot: {
    title: "Forecast Pivot",
    path: "scenario_planning/K_best/forecast/forecast_data_pivot.csv",
    data: null,
    isSingle: true,
  },
  Forecast_Pivot_Disaggregated: {
    title: "Forecasting Pivot Disaggregated",
    path: "scenario_planning/K_best/forecast/forecast_disaggregated.csv",
    data: null,
    isSingle: true,
  },
  Forecast_Value_Pivot: {
    title: "Forecast Value Pivot",
    path: "scenario_planning/K_best/forecast/forecast_data_value_pivot.csv",
    data: null,
    isSingle: true,
  },

  Planner_View: {
    title: "Planner View",
    path: "scenario_planning/K_best/forecast/final_da_data_wide.csv",
    data: null,
    isSingle: true,
  },


  Demand_Alignment_Report: {
    title: "Demand Alignment Report",
    path: "scenario_planning/K_best/forecast/demand_alignment_report.csv",
    data: null,
    isSingle: true,
  },
  Demand_Alignment_View1_Report: {
    title: "Demand Alignment Report",
    path: "scenario_planning/K_best/forecast/demand_alignment_report_view1.csv",
    data: null,
    isSingle: true,
  },
  Prediction_Interval: {
    title: "Prediction Interval",
    path: "scenario_planning/K_best/forecast/forecast_prediction_interval.csv",
    data: null,
    isSingle: true,
  },

  Disaggregated_Forecast: {
    title: "Disaggregated Forecast",
    path: "scenario_planning/K_best/forecast/forecast_disaggregated.csv",
    data: null,
    isSingle: true,
  },
  Forecast_Distribution: {
    title: "Forecast Distribution",
    path: "scenario_planning/K_best/forecast/forecast_distribution.csv",
    data: null,
    isSingle: true,
  },
  DOI_Detailed_View: {
    title: "DOI Detailed View",
    path: "scenario_planning/K_best/inventory_plan/soh_data.csv",
    data: null,
    isSingle: true,
  },
  Inventory_Reorder_Plan: {
    title: "Inventory Reorder Plan",
    path: "scenario_planning/K_best/inventory_plan/reorder_table.csv",
    data: null,
    isSingle: true,
  },
  Stock_Transfer: {
    title: "Stock Transfer",
    path: "scenario_planning/K_best/inventory_plan/stock_transfer_df.csv",
    data: null,
    isSingle: true,
  },
  Potential_Stock_Wastage: {
    title: "Potential Stock Wastage",
    path: "scenario_planning/K_best/inventory_plan/potential_stock_wastage.csv",
    data: null,
    isSingle: true,
  },
  Raw_Inventory: {
    title: "Raw Inventory",
    path: "etl_data/202110/inv_data.csv",
    data: null,
    isSingle: true,
  },
  SOH_Pivot: {
    title: "SOH Pivot",
    path: "scenario_planning/K_best/forecast/soh_data_pivot.csv",
    data: null,
    isSingle: true,
  },
  Bill_Of_Materials: {
    title: "Bill Of Materials",
    path: "scenario_planning/K_best/inventory_plan/bill_of_material_inv_details.csv",
    data: null,
    isSingle: true,
  },
  Bill_Of_Materials_Time_Forecast: {
    title: "Bill Of Materials Time Forecast",
    path: "scenario_planning/K_best/inventory_plan/bom_forecast.csv",
    data: null,
    isSingle: true,
  },
  Price_Optimization: {
    title: "Price Optimization",
    path: "scenario_planning/K_best/scenario_plan/scenario_planner_data.csv",
    data: null,
    isSingle: true,
  },
  Driver_Elasticity: {
    title: "Driver Elasticity",
    path: "stacking/future/K_best/coeffs.csv",
    data: null,
    isSingle: true,
  },
  Model_Metrics: {
    title: "Model Metrics",
    path: "stacking/future/K_best/metric.csv",
    data: null,
    isSingle: false,
    reportsArray: [
      {
        title: "Overall Metrics",
        path: "stacking/future/K_best/metric.csv",
        data: null,
        isSingle: true,
      },
      {
        title: "Xgboost Metrics",
        path: "training/cluster/future/Xgboost/metrics.csv",
        data: null,
        isSingle: true,
      },
      {
        title: "LGBM Metrics",
        path: "training/cluster/future/Lgbm/metrics.csv",
        data: null,
        isSingle: true,
      },
      {
        title: "Random Forest Metrics",
        path: "training/cluster/future/RandomForest/metrics.csv",
        data: null,
        isSingle: true,
      },
      {
        title: "Xgblinear Metrics",
        path: "training/cluster/future/Xgblinear/metrics.csv",
        data: null,
        isSingle: true,
      },
      {
        title: "MLP Metrics",
        path: "training/cluster/future/MLP/metrics.csv",
        data: null,
        isSingle: true,
      },
      {
        title: "LSTM Metrics",
        path: "training/cluster/future/LSTM/metrics.csv",
        data: null,
        isSingle: true,
      },
      {
        title: "GRU Metrics",
        path: "training/cluster/future/GRU/metrics.csv",
        data: null,
        isSingle: true,
      },
    ],
  },
  Feature_Importance: {
    title: "Feature Importance",
    path: "feature_score/feature_score.csv",
    data: null,
    isSingle: true,
  },
  Future_Granular_Metrics: {
    title: "Future Granular Metrics",
    path: "scenario_planning/K_best/forecast/future_data_metrics.csv",
    data: null,
    isSingle: true,
  },
  Future_Time_Metrics: {
    title: "Future Time Metrics",
    path: "scenario_planning/K_best/forecast/time_metrics.csv",
    data: null,
    isSingle: true,
  },
  Production_Plan_FG: {
    title: "Supply Plan",
    path: "scenario_planning/K_best/post_model_demand_pattern/production_plan_finished_goods.csv",
    data: null,
    isSingle: true,
  },
  Production_Plan: {
    title: "Production Plan",
    path: "scenario_planning/K_best/post_model_demand_pattern/production_plan_forecast.csv",
    data: null,
    isSingle: true,
  },

};
