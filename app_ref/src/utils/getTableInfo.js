// Import all Table_Info objects
import { Accuracy_Scorecard_Info } from "./Table Info/Accuracy_Scorecard_Info";
import { Bill_Of_Materials_Info } from "./Table Info/Bill_Of_Materials_Info";
import { Bill_Of_Materials_Time_Forecast_Info } from "./Table Info/Bill_Of_Materials_Time_Forecast_Info";
import { Binary_Classification_Predictions_Info } from "./Table Info/Binary_Classification_Predictions_Info";
import { Customer_Profile_Info } from "./Table Info/Customer_Profile_Info";
import { Demand_Alignment_Report_Info } from "./Table Info/Demand_Alignment_Report_Info";
import { Demand_Alignment_Value_Report_Info } from "./Table Info/Demand_Alignment_Value_Report_Info";
import { Demand_Alignment_Value_View1_Report_Info } from "./Table Info/Demand_Alignment_Value_View1_Report_Info";
import { Demand_Alignment_View1_Report_Info } from "./Table Info/Demand_Alignment_View1_Report_Info";
import { Disaggregated_Forecast_Info } from "./Table Info/Disaggregated_Forecast_Info";
import { DOI_Detailed_View_Info } from "./Table Info/DOI_Detailed_View_Info";
import { DOI_Details_Info } from "./Table Info/DOI_Details_Info";
import { Driver_Elasticity_Info } from "./Table Info/Driver_Elasticity_Info";
import { Elasticity_Detailed_View_Info } from "./Table Info/Elasticity_Detailed_View_Info";
import { Elasticity_Detailed_View_Promo_Info } from "./Table Info/Elasticity_Detailed_View_Promo_Info";
import { F1_Threshold_Info } from "./Table Info/F1_Threshold_Info";
import { Feature_Importance_Info } from "./Table Info/Feature_Importance_Info";
import { Final_DA_Data_Info } from "./Table Info/Final_DA_Data_Info";
import { Final_DA_Data_Value_Info } from "./Table Info/Final_DA_Data_Value_Info";
import { Forecast_Distribution_Info } from "./Table Info/Forecast_Distribution_Info";
import { Forecast_Info } from "./Table Info/Forecast_Info";
import { Forecast_Pivot_Info } from "./Table Info/Forecast_Pivot_Info";
import { Forecast_Value_Pivot_Info } from "./Table Info/Forecast_Value_Pivot_Info";
import { Forecasting_Pivot_Disaggregated_Info } from "./Table Info/Forecasting_Pivot_Disaggregated_Info";
import { Forecasting_Pivot_Info } from "./Table Info/Forecasting_Pivot_Info";
import { Future_Granular_Metrics_Info } from "./Table Info/Future_Granular_Metrics_Info";
import { Future_Time_Metrics_Info } from "./Table Info/Future_Time_Metrics_Info";
import { GRU_Metrics_Info } from "./Table Info/GRU_Metrics_Info";
import { Inventory_Reorder_Plan_Info } from "./Table Info/Inventory_Reorder_Plan_Info";
import { Lgbm_Info } from "./Table Info/Lgbm_Info";
import { LGBM_Metrics_Info } from "./Table Info/LGBM_Metrics_Info";
import { LSTM_Metrics_Info } from "./Table Info/LSTM_Metrics_Info";
import { Metrics_Deep_dive_Info } from "./Table Info/Metrics_Deep_dive_Info";
import { MLP_Info } from "./Table Info/MLP_Info";
import { MLP_Metrics_Info } from "./Table Info/MLP_Metrics_Info";
import { Model_Metrics_Info } from "./Table Info/Model_Metrics_Info";
import { Overall_Metrics_Info } from "./Table Info/Overall_Metrics_Info";
import { Planner_View_Info } from "./Table Info/Planner_View_Info";
import { Planner_View_Value_Info } from "./Table Info/Planner_View_Value_Info";
import { Potential_Stock_Wastage_Info } from "./Table Info/Potential_Stock_Wastage_Info";
import { Prediction_Interval_Info } from "./Table Info/Prediction_Interval_Info";
import { Price_Optimization_Info } from "./Table Info/Price_Optimization_Info";
import { Probability_Score_Info } from "./Table Info/Probability_Score_Info";
import { Production_Plan_Info } from "./Table Info/Production_Plan_Info";
import { Propensity_Score_Info } from "./Table Info/Propensity_Score_Info";
import { Random_Forest_Metrics_Info } from "./Table Info/Random_Forest_Metrics_Info";
import { Raw_Inventory_Info } from "./Table Info/Raw_Inventory_Info";
import { Recommended_Actions_Info } from "./Table Info/Recommended_Actions_Info";
import { Regression_Predictions_Info } from "./Table Info/Regression_Predictions_Info";
import { SOH_Pivot_Info } from "./Table Info/SOH_Pivot_Info";
import { Stock_Transfer_Info } from "./Table Info/Stock_Transfer_Info";
import { Supply_Plan_Info } from "./Table Info/Supply_Plan_Info";
import { Supply_Plan_Value_Info } from "./Table Info/Supply_Plan_Value_Info";
import { Xgblinear_Metrics_Info } from "./Table Info/Xgblinear_Metrics_Info";
import { XgBoost_Info } from "./Table Info/XgBoost_Info";
import { Xgboost_Metrics_Info } from "./Table Info/Xgboost_Metrics_Info";

export const getTableFilePath = (TableName, experimentBasePath) => {
  const fileNamePathDict = {
    "Final DA Data": `${experimentBasePath}/scenario_planning/K_best/forecast/final_da_data_backup.csv`,
    "Final DA Data Value": `${experimentBasePath}/scenario_planning/K_best/forecast/final_da_data_value_backup.csv`,
    "Disaggregated Forecast": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_disaggregated.csv`,
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
    XgBoost: `${experimentBasePath}/training/virtual_future_run/Xgboost/ts_metrics.csv`,
    Lgbm: `${experimentBasePath}/training/virtual_future_run/Lgbm/ts_metrics.csv`,
    MLP: `${experimentBasePath}/training/virtual_future_run/MLP/ts_metrics.csv`,
  };
  return fileNamePathDict[TableName];
};
// We will choose 4 most relevant tables from tableInfoDict for each module (allowing 1-2 common between demand & inventory).
// We will also expand inventory-optimization and pricing-promotion-optimization to have 4 each.

export const modulesTableDict = {
  "demand-planning": [
    "Final DA Data",
    "Final DA Data Value",
    "Disaggregated Forecast",
  ],
  "inventory-optimization": [
    "Final DA Data",
    "DOI Details",
    "Supply Plan",
    "Stock Transfer",
  ],
  "pricing-promotion-optimization": ["Final DA Data", "Price Optimization"],
};

/**
 * Converts a Table_Info JSON object to a structured description string for LLM consumption.
 * Handles all scenarios: string descriptions, empty strings, and nested objects.
 *
 * @param {Object} tableInfoObj - The Table_Info object (e.g., DOI_Details_Info, Supply_Plan_Info)
 * @returns {string} - A structured description string containing table description and column information
 *
 * @example
 * const description = convertTableInfoToDescription(DOI_Details_Info);
 * // Returns: "Table: DOI Details\nDescription: ...\n\nImportant Columns:\n- Component SKU: ...\n..."
 */
export const convertTableInfoToDescription = (tableInfoObj) => {
  if (!tableInfoObj || typeof tableInfoObj !== "object") {
    return "";
  }

  // Get the first (and only) key which is the table name
  const tableName = Object.keys(tableInfoObj)[0];
  if (!tableName) {
    return "";
  }

  const tableData = tableInfoObj[tableName];
  if (!tableData || typeof tableData !== "object") {
    return "";
  }

  let description = `Table: ${tableName}\n`;

  // Add main description
  if (tableData.Description) {
    description += `Description: ${tableData.Description}\n`;
  }

  // Process Important Column Info
  const columnInfo = tableData["Important Column Info"];
  if (columnInfo && typeof columnInfo === "object") {
    const columnDescriptions = processColumnInfo(columnInfo);
    if (columnDescriptions.length > 0) {
      description += `\nImportant Columns:\n${columnDescriptions.join("\n")}`;
    }
  }

  return description;
};

/**
 * Recursively processes column information, handling strings, empty strings, and nested objects.
 *
 * @param {Object} columnInfo - The "Important Column Info" object
 * @param {number} indentLevel - Current indentation level for nested objects
 * @returns {Array<string>} - Array of formatted column description strings
 */
const processColumnInfo = (columnInfo, indentLevel = 0) => {
  const descriptions = [];
  const indent = "  ".repeat(indentLevel);
  const bullet = indentLevel === 0 ? "-" : "  •";

  for (const [key, value] of Object.entries(columnInfo)) {
    if (typeof value === "string") {
      // Handle string values (including empty strings)
      if (value.trim() !== "") {
        descriptions.push(`${indent}${bullet} ${key}: ${value}`);
      } else {
        // Optionally include columns with empty descriptions
        // descriptions.push(`${indent}${bullet} ${key}: (No description available)`);
      }
    } else if (typeof value === "object" && value !== null) {
      // Handle nested objects (like "Variable" in Supply_Plan_Info)
      descriptions.push(`${indent}${bullet} ${key}:`);
      const nestedDescriptions = processColumnInfo(value, indentLevel + 1);
      descriptions.push(...nestedDescriptions);
    }
  }

  return descriptions;
};

// Mapping from table names to their Table_Info objects
const tableInfoObjectMap = {
  "Accuracy Scorecard": Accuracy_Scorecard_Info,
  "Bill Of Materials": Bill_Of_Materials_Info,
  "Bill Of Materials Time Forecast": Bill_Of_Materials_Time_Forecast_Info,
  "Binary Classification Predictions": Binary_Classification_Predictions_Info,
  "Customer Profile": Customer_Profile_Info,
  "Demand Alignment Report": Demand_Alignment_Report_Info,
  "Demand Alignment Value Report": Demand_Alignment_Value_Report_Info,
  "Demand Alignment Value View1 Report":
    Demand_Alignment_Value_View1_Report_Info,
  "Demand Alignment View1 Report": Demand_Alignment_View1_Report_Info,
  "Disaggregated Forecast": Disaggregated_Forecast_Info,
  "DOI Detailed View": DOI_Detailed_View_Info,
  "DOI Details": DOI_Details_Info,
  "Driver Elasticity": Driver_Elasticity_Info,
  "Elasticity Detailed View": Elasticity_Detailed_View_Info,
  "Elasticity Detailed View Promo": Elasticity_Detailed_View_Promo_Info,
  "F1 Threshold": F1_Threshold_Info,
  "Feature Importance": Feature_Importance_Info,
  "Final DA Data": Final_DA_Data_Info,
  "Final DA Data Value": Final_DA_Data_Value_Info,
  "Forecast Distribution": Forecast_Distribution_Info,
  Forecast: Forecast_Info,
  "Forecast Pivot": Forecast_Pivot_Info,
  "Forecast Value Pivot": Forecast_Value_Pivot_Info,
  "Forecasting Pivot": Forecasting_Pivot_Info,
  "Forecasting Pivot Disaggregated": Forecasting_Pivot_Disaggregated_Info,
  "Future Granular Metrics": Future_Granular_Metrics_Info,
  "Future Time Metrics": Future_Time_Metrics_Info,
  "GRU Metrics": GRU_Metrics_Info,
  "Inventory Reorder Plan": Inventory_Reorder_Plan_Info,
  Lgbm: Lgbm_Info,
  "LGBM Metrics": LGBM_Metrics_Info,
  "LSTM Metrics": LSTM_Metrics_Info,
  "Metrics Deep dive": Metrics_Deep_dive_Info,
  MLP: MLP_Info,
  "MLP Metrics": MLP_Metrics_Info,
  "Model Metrics": Model_Metrics_Info,
  "Overall Metrics": Overall_Metrics_Info,
  "Planner View": Planner_View_Info,
  "Planner View Value": Planner_View_Value_Info,
  "Potential Stock Wastage": Potential_Stock_Wastage_Info,
  "Prediction Interval": Prediction_Interval_Info,
  "Price Optimization": Price_Optimization_Info,
  "Probability Score": Probability_Score_Info,
  "Production Plan": Production_Plan_Info,
  "Propensity Score": Propensity_Score_Info,
  "Random Forest Metrics": Random_Forest_Metrics_Info,
  "Raw Inventory": Raw_Inventory_Info,
  "Recommended Actions": Recommended_Actions_Info,
  "Regression Predictions": Regression_Predictions_Info,
  "SOH Pivot": SOH_Pivot_Info,
  "Stock Transfer": Stock_Transfer_Info,
  "Supply Plan": Supply_Plan_Info,
  "Supply Plan Value": Supply_Plan_Value_Info,
  "Xgblinear Metrics": Xgblinear_Metrics_Info,
  XgBoost: XgBoost_Info,
  "Xgboost Metrics": Xgboost_Metrics_Info,
};

// Fallback dictionary for tables that don't have Table_Info objects yet
const fallbackTableInfoDict = {
  "Final DA Data": "",
  "Final DA Data Value": "",
  "Disaggregated Forecast": "",
  "Demand Alignment Report": "",
  "Demand Alignment Value Report":
    "This table provides a value-based view of demand alignment to help assess revenue implications of forecast accuracy.",
  "Demand Alignment View1 Report":
    "This view offers an alternate aggregation of aligned demand for granular analysis.",
  "Demand Alignment Value View1 Report":
    "Displays value-focused alignment at a different granularity, aiding business value review.",
  "Supply Plan":
    "This table shows the planned supply quantities, guiding production and purchase requirements.",
  "Production Plan":
    "This table details finished goods production plans based on demand and supply constraints.",
  "Forecast Value Pivot":
    "Shows forecast values pivoted across key dimensions for further comparison and analytics.",
  "Overall Metrics":
    "Presents overall performance and experiment evaluation metrics.",
  "Xgboost Metrics":
    "Shows evaluation metrics for the Xgboost model run within the experiment.",
  "LGBM Metrics":
    "Shows metrics for the LGBM machine learning model for the experiment.",
  "Random Forest Metrics":
    "Provides accuracy and performance statistics for the Random Forest model.",
  "Xgblinear Metrics":
    "Displays evaluation results for the Xgblinear model component.",
  "MLP Metrics": "Multilayer Perceptron model evaluation metrics and scoring.",
  "LSTM Metrics":
    "Shows Long Short-Term Memory (LSTM) model performance measures.",
  "GRU Metrics": "Presents Gated Recurrent Unit (GRU) model results.",
  "Propensity Score":
    "Lists scores indicating the likelihood of a response (purchase, conversion, etc.) for price/promotion scenarios.",
  "Probability Score":
    "Probability scores for various experiment outcomes (often used in pricing and promotion).",
  "Recommended Actions":
    "Contains the AI/optimization engine's best action recommendations—such as price update, promotion, etc.",
  "Customer Profile":
    "Displays customer segmentation and profiling used for scenario or target selection.",
  "Accuracy Scorecard":
    "Model or prediction accuracy breakdown for further diagnostic review.",
  "F1 Threshold":
    "Shows F1-score-based thresholding information for binary classification tasks.",
  "Binary Classification Predictions":
    "Binary model (yes/no, buy/no-buy, etc.) predictions output from experiments.",
  "Regression Predictions":
    "Regression model predictions for numeric outcome scenarios.",
  XgBoost: "This table shows Xgboost metrics for the experiment.",
  Lgbm: "This table shows LGBM metrics for the experiment.",
  MLP: "This table shows MLP metrics for the experiment.",
  "DOI Details":
    "Detailed inventory (Days Of Inventory) report, tracking stock levels and inventory sufficiency.",
  "Price Optimization":
    "This table provides optimal pricing suggestions/recommendations based on scenario analysis.",
};

export const getTableInfo = (TableName) => {
  // First, try to get the Table_Info object and convert it to description string
  const tableInfoObj = tableInfoObjectMap[TableName];
  if (tableInfoObj) {
    return convertTableInfoToDescription(tableInfoObj);
  }

  // Fallback to the old dictionary for backward compatibility
  return fallbackTableInfoDict[TableName] || "";
};
