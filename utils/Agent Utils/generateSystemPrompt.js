/**
 * ⭐ GENERATE SYSTEM PROMPT - Create AI system prompts
 * Source: D:\TrueGradient\tg-application\src\utils\Agent Utils\generateSystemPrompt.js
 */

/**
 * ⭐ MATCHES tg-application: modulesTableDict
 * Maps module names to their relevant datasets
 */
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
  "price-promotion-optimization": ["Final DA Data", "Price Optimization"],
};

/**
 * ⭐ MATCHES tg-application: getTableFilePath
 * Returns the file path for a given table name
 */
export const getTableFilePath = (TableName, experimentBasePath) => {
  const fileNamePathDict = {
    "Final DA Data": `${experimentBasePath}/scenario_planning/K_best/forecast/final_da_data_backup.csv`,
    "Final DA Data Value": `${experimentBasePath}/scenario_planning/K_best/forecast/final_da_data_value_backup.csv`,
    "Disaggregated Forecast": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_disaggregated.csv`,
    "Forecasting Pivot": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot.csv`,
    "DOI Details": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data.csv`,
    "DOI Detailed View": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data.csv`,
    "Stock Transfer": `${experimentBasePath}/scenario_planning/K_best/inventory_plan/stock_transfer_df.csv`,
    "Supply Plan": `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/production_plan_finished_goods.csv`,
    "Supply Plan Value": `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/production_plan_finished_goods_value.csv`,
    "Price Optimization": `${experimentBasePath}/scenario_planning/K_best/scenario_plan/scenario_planner_data.csv`,
    "Driver Elasticity": `${experimentBasePath}/stacking/future/K_best/coeffs.csv`,
    "Model Metrics": `${experimentBasePath}/stacking/future/K_best/metric.csv`,
    "Feature Importance": `${experimentBasePath}/feature_score/feature_score.csv`,
    "Forecast": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data.csv`,
    "Forecast Pivot": `${experimentBasePath}/scenario_planning/K_best/forecast/forecast_data_pivot.csv`,
  };
  return fileNamePathDict[TableName] || `${experimentBasePath}/${TableName.replace(/\s/g, '_').toLowerCase()}.csv`;
};

/**
 * ⭐ MATCHES tg-application: getTableInfo
 * Returns description for a given table name
 */
export const getTableInfo = (TableName) => {
  const fallbackTableInfoDict = {
    "Final DA Data": "This table contains the final demand alignment data with forecast values.",
    "Final DA Data Value": "Value-based view of demand alignment to help assess revenue implications.",
    "Disaggregated Forecast": "Contains disaggregated forecast data at granular level.",
    "DOI Details": "Detailed inventory (Days Of Inventory) report, tracking stock levels.",
    "Supply Plan": "Shows the planned supply quantities, guiding production and purchase requirements.",
    "Stock Transfer": "Contains stock transfer recommendations between locations.",
    "Price Optimization": "Provides optimal pricing suggestions based on scenario analysis.",
  };
  return fallbackTableInfoDict[TableName] || `Dataset containing ${TableName} information.`;
};

export const generateSystemPrompt = (
  experimentBasePath,
  moduleName,
  experimentName
) => {
  const datasets = modulesTableDict[moduleName] || [];
  const dataPathDict = {};
  
  if (datasets.length === 0) {
    console.warn(`[generateSystemPrompt] No datasets found for module: ${moduleName}`);
    return { 
      systemPrompt: `You are a data analyst helping to analyze the experiment "${experimentName}".`, 
      dataPathDict: {} 
    };
  }
  
  datasets.forEach((dataset) => {
    dataPathDict[dataset] = getTableFilePath(dataset, experimentBasePath);
  });

  // Prepare dataset info strings
  const datasetInfos = datasets
    .map(
      (dataset, idx) =>
        `${idx + 1}. ${dataset}: ${getTableInfo(dataset)}`
    )
    .join("\n");

  // Compose system prompt - MATCHES tg-application exactly
  const systemPrompt = `You are a data analyst with access to the following datasets for the experiment "${experimentName}":\n\n${datasetInfos}\n\nYou can use any of these datasets, and if needed, you may use multiple datasets together to answer the question. Don't hesitate to do so if required.\n\nAnswer the following questions based strictly on this data and your domain knowledge. Do NOT make mistakes because your mistake may cause losses of thousands of dollars. Do not say anything about mistakes or these dangers in your answer—just answer accurately. Do not include any information about mistakes or their consequences in your response. Be precise and accurate, and respond as an expert data analyst would.`;
  
  return { systemPrompt, dataPathDict };
};

export default generateSystemPrompt;
