import { reportGroups } from "./reportGroups";

export const getReports = (module_name, havePrice = false) => {
  if (havePrice) {
    switch (module_name) {
      case "demand-planning":
        return {
          Demand_Forecasting: reportGroups.Demand_Forecasting,
          Price_Optimization: reportGroups.Price_Optimization,
          Model_Assets: reportGroups.Model_Assets,
          Future_Metrics: reportGroups.Future_Metrics,
       
        };

      case "supply_chain":
        return {
          Demand_Forecasting: reportGroups.Demand_Forecasting,
          Price_Optimization: reportGroups.Price_Optimization,
          Model_Assets: reportGroups.Model_Assets,
          Future_Metrics: reportGroups.Future_Metrics,

        };
      case "inventory-optimization":
        return {
          Demand_Forecasting: reportGroups.Demand_Forecasting,
          // Inventory_Optimization: reportGroups.Inventory_Optimization,
          Bill_Of_Materials: reportGroups.Bill_Of_Materials,
          // Price_Optimization: reportGroups.Price_Optimization,
          Demand_Alignment: reportGroups.Demand_Alignment,
          // Production_Planning: reportGroups.Production_Planning,
          Model_Assets: reportGroups.Model_Assets,
          Future_Metrics: reportGroups.Future_Metrics,
        };
      case "replenishment":
        return {
          Demand_Forecasting: reportGroups.Demand_Forecasting,
          // Inventory_Optimization: reportGroups.Inventory_Optimization,
          Bill_Of_Materials: reportGroups.Bill_Of_Materials,
          // Price_Optimization: reportGroups.Price_Optimization,
          Demand_Alignment: reportGroups.Demand_Alignment,
          // Production_Planning: reportGroups.Production_Planning,
          Model_Assets: reportGroups.Model_Assets,
          Future_Metrics: reportGroups.Future_Metrics,
        };
      case "pricing-promotion-optimization":
        return {
          Demand_Forecasting: reportGroups.Demand_Forecasting,
         
          Model_Assets: reportGroups.Model_Assets,
          Future_Metrics: reportGroups.Future_Metrics,
        };

      default:
        break;
    }
  } else {
    switch (module_name) {
      case "demand-planning":
        return {
          Demand_Forecasting: reportGroups.Demand_Forecasting,
          Model_Assets: reportGroups.Model_Assets,
          Future_Metrics: reportGroups.Future_Metrics,
        };

      case "supply_chain":
        return {
          Demand_Forecasting: reportGroups.Demand_Forecasting,
          Model_Assets: reportGroups.Model_Assets,
          Future_Metrics: reportGroups.Future_Metrics,
        };
      case "inventory-optimization":
        return {
          Demand_Forecasting: reportGroups.Demand_Forecasting,
          Inventory_Optimization: reportGroups.Inventory_Optimization,
          Bill_Of_Materials: reportGroups.Bill_Of_Materials,
          Demand_Alignment: reportGroups.Demand_Alignment,
          Production_Planning: reportGroups.Production_Planning,
          Model_Assets: reportGroups.Model_Assets,
          Future_Metrics: reportGroups.Future_Metrics,
        };
      case "replenishment":
        return {
          Demand_Forecasting: reportGroups.Demand_Forecasting,
          Inventory_Optimization: reportGroups.Inventory_Optimization,
          Bill_Of_Materials: reportGroups.Bill_Of_Materials,
          Demand_Alignment: reportGroups.Demand_Alignment,
          Production_Planning: reportGroups.Production_Planning,
          Model_Assets: reportGroups.Model_Assets,
          Future_Metrics: reportGroups.Future_Metrics,
        };
      case "pricing-promotion-optimization":
        return {
          Demand_Forecasting: reportGroups.Demand_Forecasting,
          Model_Assets: reportGroups.Model_Assets,
          Future_Metrics: reportGroups.Future_Metrics,
        };

      default:
        break;
    }
  }
};
