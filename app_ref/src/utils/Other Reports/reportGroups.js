import { allReports } from "./allReports";

export const reportGroups = {
  Demand_Forecasting: {
    title: "Demand Forecasting",
    description:
      "Demand forecasting is the process of predicting future demand for a product or service.",
    reports: [
      allReports.Forecast,
      allReports.Forecast_Pivot,
      allReports.Prediction_Interval,
      allReports.Disaggregated_Forecast,
      allReports.Forecast_Distribution,
      allReports.Forecast_Value_Pivot,
      allReports.Planner_View
    ],
  },
  Demand_Alignment: {
    title: "Demand Alignment",
    description: "Demand Alignment description",
    reports: [allReports.Demand_Alignment_Report],
  },
  Production_Planning: {
    title: "Production Planning",
    description: "Production Planning description",
    reports: [allReports.Production_Plan_FG],
  },
  Inventory_Optimization: {
    title: "Inventory Optimization",
    description:
      "Inventory optimization is the process of ensuring that the right amount of stock is held to meet demand without overstocking or stockouts.",
    reports: [
      allReports.DOI_Detailed_View,
      allReports.Inventory_Reorder_Plan,
      allReports.Stock_Transfer,
      allReports.Potential_Stock_Wastage,
      allReports.Raw_Inventory,
      allReports.SOH_Pivot,
    ],
  },
  Bill_Of_Materials: {
    title: "Bill Of Materials",
    description: "Bill Of Materials Description",
    reports: [
      allReports.Bill_Of_Materials,
      allReports.Bill_Of_Materials_Time_Forecast,
    ],
  },
  Price_Optimization: {
    title: "Price Optimization",
    description:
      "Price optimization is the process of determining the best price for a product or service to maximize revenue and profit.",
    reports: [allReports.Price_Optimization],
  },
  Model_Assets: {
    title: "Model Assets",
    description:
      "Model assets include key components such as driver elasticity, model metrics, and feature importance, which are essential for evaluating and understanding the performance of forecasting models.",
    reports: [
      allReports.Driver_Elasticity,
      allReports.Model_Metrics,
      allReports.Feature_Importance,
    ],
  },
  Future_Metrics: {
    title: "Future Metrics",
    description: "Future Metrics Description",
    reports: [
      allReports.Future_Granular_Metrics,
      allReports.Future_Time_Metrics,
    ],
  },
};
