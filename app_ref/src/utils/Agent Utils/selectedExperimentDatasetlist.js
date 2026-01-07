import useExperiment from "../../hooks/useExperiment";
import {useDataset} from "../../hooks/useDataset";

export const selectedExperimentDataset_list = ["Forecasting Pivot","Forecasting Pivot Disaggregated","DOI Details","Elasticity Detailed View","Elasticity Detailed View Promo","Metrics Deep dive","Forecast","Forecast Pivot","Prediction Interval","Disaggregated Forecast","Forecast Distribution","DOI Detailed View","Inventory Reorder Plan","Stock Transfer","Potential Stock Wastage","Raw Inventory","SOH Pivot","Bill Of Materials","Bill Of Materials Time Forecast","Price Optimization","Driver Elasticity","Model Metrics","Feature Importance","Future Granular Metrics","Future Time Metrics","Demand Alignment Report","Demand Alignment Value Report","Planner View","Planner View Value","Demand Alignment View1 Report","Demand Alignment Value View1 Report","Supply Plan","Supply Plan Value","Production Plan","Forecast Value Pivot","Overall Metrics","Xgboost Metrics","LGBM Metrics","Random Forest Metrics","Xgblinear Metrics","MLP Metrics","LSTM Metrics","GRU Metrics","Metrics Analysis","Propensity Score","Probability Score","Recommended Actions","Customer Profile","Accuracy Scorecard","F1 Threshold","Binary Classification Predictions","Regression Predictions","XgBoost","Lgbm","MLP"];

                            // moduleName: row.experimentModuleName,
                            // run_date: formatYearMonth(row.createdAt),
// const { currentExperiment } = useExperiment();
// const { currentCompany } = useAuth();


export const getExperimentDatasetPath = (experimentBasePath,DatasetName) => {
  const fileNamePathDict = {
    "Forecasting Pivot": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot.csv`,
    "Forecasting Pivot Disaggregated": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_disaggregated.csv`,
    "DOI Details": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data.csv`,
    "Elasticity Detailed View": `${experimentBasePath}/scenario_planning/K_best/scenario_plan/scenario_planner_data.csv`,
    "Elasticity Detailed View Promo": `${experimentBasePath}/scenario_planning/K_best/scenario_plan/scenario_planner_data.csv`, // p
    "Metrics Deep dive": `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/post_model_metrics.csv`, // dimension: "feature", value: cd
    Forecast: `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data.csv`,
    "Forecast Pivot": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot.csv`,
    "Prediction Interval": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_prediction_interval.csv`,
    "Disaggregated Forecast": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_disaggregated.csv`,
    "Forecast Distribution": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_distribution.csv`,
    "DOI Detailed View": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data.csv`,
    "Inventory Reorder Plan": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/reorder_table.csv`,
    "Stock Transfer": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/stock_transfer_df.csv`,
    "Potential Stock Wastage": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/potential_stock_wastage.csv`,
    "Raw Inventory": `${experimentBasePath}/etl_data/202110/inv_data.csv`,
    "SOH Pivot": `${experimentBasePath}/scenario_planning/K_best/forecast/soh_data_pivot.csv`,
    "Bill Of Materials": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/bill_of_material_inv_details.csv`,
    "Bill Of Materials Time Forecast": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/bom_forecast.csv`,
    "Price Optimization": `${experimentBasePath}/scenario_planning/K_best/scenario_plan/scenario_planner_data.csv`,
    "Driver Elasticity": `${experimentBasePath}/stacking/future/K_best/coeffs.csv`,
    "Model Metrics": `${experimentBasePath}/stacking/future/K_best/metric.csv`,
    "Feature Importance": `${experimentBasePath}/feature_score/feature_score.csv`,
    "Future Granular Metrics": `${experimentBasePath}/scenario_planning/K_best/forecast/future_data_metrics.csv`,
    "Future Time Metrics": `${experimentBasePath}/scenario_planning/K_best/forecast/time_metrics.csv`,
    "Demand Alignment Report": `${experimentBasePath}/scenario_planning/K_best/forecast/demand_alignment_report.csv`,
    "Demand Alignment Value Report": `${experimentBasePath}/scenario_planning/K_best/forecast/demand_alignment_report_value.csv`,
    "Planner View": `${experimentBasePath}/scenario_planning/K_best/forecast/final_da_data_wide.csv`,
    "Planner View Value": `${experimentBasePath}/scenario_planning/K_best/forecast/final_da_data_value_wide.csv`,
    "Demand Alignment View1 Report": `${experimentBasePath}/scenario_planning/K_best/forecast/demand_alignment_report_view1.csv`,
    "Demand Alignment Value View1 Report": `${experimentBasePath}/scenario_planning/K_best/forecast/demand_alignment_report_value_view1.csv`,
    "Supply Plan": `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/production_plan_finished_goods.csv`,
    "Supply Plan Value": `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/production_plan_finished_goods_value.csv`,
    "Production Plan": `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/production_plan_forecast.csv`,
    "Forecast Value Pivot": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_value_pivot.csv`,
    "Overall Metrics": `${experimentBasePath}/stacking/future/K_best/metric.csv`,
    "Xgboost Metrics": `${experimentBasePath}/training/cluster/future/Xgboost/metrics.csv`,
    "LGBM Metrics": `${experimentBasePath}/training/cluster/future/Lgbm/metrics.csv`,
    "Random Forest Metrics": `${experimentBasePath}/training/cluster/future/RandomForest/metrics.csv`,
    "Xgblinear Metrics": `${experimentBasePath}/training/cluster/future/Xgblinear/metrics.csv`,
    "MLP Metrics": `${experimentBasePath}/training/cluster/future/MLP/metrics.csv`,
    "LSTM Metrics": `${experimentBasePath}/training/cluster/future/LSTM/metrics.csv`,
    "GRU Metrics": `${experimentBasePath}/training/cluster/future/GRU/metrics.csv`,

    "Propensity Score": `${experimentBasePath}/optimization/score_predictions.csv`,
    "Probability Score": `${experimentBasePath}/optimization/propensity_predictions.csv`,
    "Recommended Actions": `${experimentBasePath}/optimization/actions.csv`,
    "Customer Profile": `${experimentBasePath}/optimization/customer_profile.csv`,
    "Accuracy Scorecard": `${experimentBasePath}/training/virtual_future_run/MLP/ts_metrics.csv`,
    "F1 Threshold": `${experimentBasePath}/optimization/threshold_df.csv`,
    "Binary Classification Predictions": `${experimentBasePath}/scenario_planning/predictions/final_predictions.csv`,
    "Regression Predictions": `${experimentBasePath}/scenario_planning/predictions/final_predictions.csv`,
    "XgBoost": `${experimentBasePath}/training/virtual_future_run/Xgboost/ts_metrics.csv`,
    "Lgbm": `${experimentBasePath}/training/virtual_future_run/Lgbm/ts_metrics.csv`,
    "MLP": `${experimentBasePath}/training/virtual_future_run/MLP/ts_metrics.csv`,
  };
  return fileNamePathDict[DatasetName];
};

