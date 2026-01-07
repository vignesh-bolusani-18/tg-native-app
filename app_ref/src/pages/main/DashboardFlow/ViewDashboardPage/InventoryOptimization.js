import { Box, Grid, Skeleton, Stack, Typography } from "@mui/material";
import React from "react";
import { useState } from "react";
import InventoryHealth from "./FocusView/InventoryHelath";
import CustomButton from "../../../../components/CustomButton";
import useDashboard from "../../../../hooks/useDashboard";
import _ from "lodash";

import CustomTable from "../../../../components/TanStackCustomTable";
import { useEffect } from "react";
import CustomAutocomplete from "../../../../components/CustomInputControls/CustomAutoComplete";
import useExperiment from "../../../../hooks/useExperiment";
import useAuth from "../../../../hooks/useAuth";
import FilterBlock from "../../../../components/FilterBlock";
import useConfig from "../../../../hooks/useConfig";

const titleStyle = {
  fontFamily: "Inter",
  fontSize: "18px",
  fontWeight: 500,
  lineHeight: "28px",
  textAlign: "left",
  color: "#101828",
  textTransform: "none",
};

// Add a utility function for parallel processing
const parallelProcess = (items, processor) => {
  // Use Promise.all for true parallelization when possible
  return Promise.all(
    items.map((item) => Promise.resolve().then(() => processor(item)))
  );
};

const calculateValues = (aggData, aggMethodsDict) => {
  // Create a map of risk levels to their corresponding values for parallel processing
  const riskLevelMap = {
    StockOut: "stockout_Val",
    CriticalStock: "criticalStock_Val",
    LowInventory: "lowInventory_Val",
  };

  // Initialize result object with null values
  const result = {
    stockout_Val: null,
    criticalStock_Val: null,
    lowInventory_Val: null,
    excessStock_Val: null,
    total_Val: null,
    totalSoh_Val: null,
    stableStock_Val: null,
  };

  // Process Potential_Sales_Loss_value in parallel if it exists
  if (aggMethodsDict.hasOwnProperty("Potential_Sales_Loss_value")) {
    // Process all risk levels in parallel
    Object.entries(riskLevelMap).forEach(([riskLevel, valKey]) => {
      result[valKey] = aggData
        .filter((item) => item.Stock_Risk_Level === riskLevel)
        .reduce(
          (sum, item) => sum + parseInt(item.Potential_Sales_Loss_value),
          0
        );
    });
  }

  // Process Excess_Stock_value if it exists
  if (aggMethodsDict.hasOwnProperty("Excess_Stock_value")) {
    result.excessStock_Val = _.sumBy(aggData, (item) =>
      parseInt(item.Excess_Stock_value)
    );
  }

  // Process soh_value if it exists
  if (aggMethodsDict.hasOwnProperty("soh_value")) {
    result.totalSoh_Val = _.sumBy(aggData, (item) => parseInt(item.soh_value));
    const potentialSalesLossValue = _.sumBy(aggData, (item) =>
      parseInt(item.Potential_Sales_Loss_value)
    );
    result.total_Val = result.totalSoh_Val + potentialSalesLossValue;
  }

  // Calculate stableStock_Val
  try {
    result.stableStock_Val = result.totalSoh_Val - result.excessStock_Val;
  } catch (error) {
    result.stableStock_Val = null;
  }

  return result;
};

const transformData = (data) => {
  const keys = Object.keys(data);
  const length = data[keys[0]].length;

  // Create an array of indices to process in parallel
  const indices = Array.from({ length }, (_, i) => i);

  // Process each row in parallel
  return indices.map((i) => {
    const newObj = {};
    // Use a more efficient approach for key iteration
    for (let j = 0; j < keys.length; j++) {
      const key = keys[j];
      const value = data[key][i];
      newObj[key] =
        value === ""
          ? null
          : isNaN(parseFloat(value))
          ? value
          : parseFloat(value);
    }
    return newObj;
  });
};

const filterInvalidEntries = (data) => {
  return data.filter(
    (entry) =>
      entry.Stock_Risk_Level !== null && entry.Stock_Risk_Level !== undefined
  );
};

const get_Inventory_Metrics = (data, currency) => {
  console.log("Inv Metrics data", data);

  // Create a more efficient memoization cache
  const memoCache = new Map();

  // Memoize these functions to avoid recalculating the same values
  const getValueInFloat = (columnName) => {
    if (memoCache.has(columnName)) return memoCache.get(columnName);
    const stringValue = data[columnName] || "0";
    const floatValue = parseFloat(stringValue);
    memoCache.set(columnName, floatValue);
    return floatValue;
  };

  const getValueInInteger = (columnName) => {
    if (memoCache.has(columnName)) return memoCache.get(columnName);
    const stringValue = data[columnName] || "0";
    const IntegerValue = parseInt(stringValue);
    memoCache.set(columnName, IntegerValue);
    return IntegerValue;
  };

  if (data["ts_id"] === undefined) {
    // Pre-calculate common values to avoid repetition
    const stockOnHandValues = {
      criticalStock: getValueInFloat("Stock_On_Hand_CriticalStock"),
      lowInventory: getValueInFloat("Stock_On_Hand_LowInventory"),
      stable: getValueInFloat("Stock_On_Hand_Stable"),
      stockOut: getValueInFloat("Stock_On_Hand_StockOut"),
      excessStock: getValueInFloat("Stock_On_Hand_ExcessStock"),
    };

    const excessStockValues = {
      criticalStock: getValueInFloat("Excess_Stock_CriticalStock"),
      excessStock: getValueInFloat("Excess_Stock_ExcessStock"),
      lowInventory: getValueInFloat("Excess_Stock_LowInventory"),
      stable: getValueInFloat("Excess_Stock_Stable"),
      stockOut: getValueInFloat("Excess_Stock_StockOut"),
    };

    const sohValueValues = {
      criticalStock: getValueInFloat("soh_value_CriticalStock"),
      lowInventory: getValueInFloat("soh_value_LowInventory"),
      stable: getValueInFloat("soh_value_Stable"),
      stockOut: getValueInFloat("soh_value_StockOut"),
      excessStock: getValueInFloat("soh_value_ExcessStock"),
    };

    const excessStockValueValues = {
      criticalStock: getValueInFloat("Excess_Stock_value_CriticalStock"),
      excessStock: getValueInFloat("Excess_Stock_value_ExcessStock"),
      lowInventory: getValueInFloat("Excess_Stock_value_LowInventory"),
      stable: getValueInFloat("Excess_Stock_value_Stable"),
      stockOut: getValueInFloat("Excess_Stock_value_StockOut"),
    };

    // Calculate sums in parallel using Object.values().reduce
    const stockOnHandSum = Object.values(stockOnHandValues).reduce(
      (sum, val) => sum + val,
      0
    );
    const excessStockSum = Object.values(excessStockValues).reduce(
      (sum, val) => sum + val,
      0
    );
    const sohValueSum = Object.values(sohValueValues).reduce(
      (sum, val) => sum + val,
      0
    );
    const excessStockValueSum = Object.values(excessStockValueValues).reduce(
      (sum, val) => sum + val,
      0
    );

    // Pre-calculate additional values
    const unitsStockOut = getValueInFloat("_units__StockOut");
    const unitsCriticalStock = getValueInFloat("_units__CriticalStock");
    const unitsLowInventory = getValueInFloat("_units__LowInventory");

    const valueStockOut = getValueInFloat("_value__StockOut");
    const valueCriticalStock = getValueInFloat("_value__CriticalStock");
    const valueLowInventory = getValueInFloat("_value__LowInventory");

    const inventoryMetrics = {
      units: {
        total: Math.round(
          stockOnHandSum +
            unitsStockOut +
            unitsCriticalStock +
            unitsLowInventory
        ),
        total_soh: Math.round(stockOnHandSum),
        stockout: getValueInInteger("_units__StockOut"),
        critical_stock: getValueInInteger("_units__CriticalStock"),
        low_inventory: getValueInInteger("_units__LowInventory"),
        stable_stock: Math.round(stockOnHandSum - excessStockSum),
        excess_stock: Math.round(excessStockSum),
      },
      value: {
        total:
          sohValueSum + valueStockOut + valueCriticalStock + valueLowInventory,
        total_soh: sohValueSum,
        stockout: valueStockOut,
        critical_stock: valueCriticalStock,
        low_inventory: valueLowInventory,
        stable_stock: sohValueSum - excessStockValueSum,
        excess_stock: excessStockValueSum,
      },
      count: {
        total:
          getValueInInteger("cnt_flag_StockOut") +
          getValueInInteger("cnt_flag_CriticalStock") +
          getValueInInteger("cnt_flag_LowInventory") +
          getValueInInteger("cnt_flag_Stable") +
          getValueInInteger("cnt_flag_ExcessStock"),
        stockout: getValueInInteger("cnt_flag_StockOut"),
        critical_stock: getValueInInteger("cnt_flag_CriticalStock"),
        low_inventory: getValueInInteger("cnt_flag_LowInventory"),
        stable_stock: getValueInInteger("cnt_flag_Stable"),
        excess_stock: getValueInInteger("cnt_flag_ExcessStock"),
      },
      currency: currency,
    };
    console.log("Inventory Metrics", inventoryMetrics);
    return inventoryMetrics;
  }

  console.log("Data", data);
  const transformedData = transformData(data);
  console.log("Transformed Data:", transformedData);
  const aggCols = [
    "Stock_On_Hand",
    "Potential_Sales_Loss",
    "Potential_Sales_Loss_value",
    "Excess_Stock",
    "Excess_Stock_value",
    "soh_value",
  ];

  // Initialize aggregation object
  let aggMethodsDict = { ts_id: "count" };

  // Check each column and update aggregation method if column exists in data
  aggCols.forEach((col) => {
    if (data.hasOwnProperty(col)) {
      aggMethodsDict[col] = "sum";
    }
  });

  const filteredData = filterInvalidEntries(transformedData);

  const groupedData = Object.groupBy(
    filteredData,
    ({ Stock_Risk_Level }) => Stock_Risk_Level
  );

  // Process aggregation in parallel
  const aggregatedData = Object.keys(groupedData).map((riskLevel) => {
    const group = groupedData[riskLevel];
    const aggregatedRow = { Stock_Risk_Level: riskLevel };

    Object.keys(aggMethodsDict).forEach((key) => {
      const method = aggMethodsDict[key];
      if (method === "sum") {
        aggregatedRow[key] = _.sumBy(group, key);
      } else if (method === "count") {
        aggregatedRow[key] = group.length;
      }
    });

    return aggregatedRow;
  });

  // Create a map for faster lookups
  const riskLevelMap = new Map();
  aggregatedData.forEach((row) => {
    riskLevelMap.set(row.Stock_Risk_Level, row);
  });

  // Process calculations in parallel
  const [
    total_Inventory,
    total_Soh,
    stockout,
    critical_Stock,
    low_Inventory,
    excess_Stock,
  ] = [
    _.sumBy(aggregatedData, "Stock_On_Hand") +
      _.sumBy(aggregatedData, "Potential_Sales_Loss"),
    _.sumBy(aggregatedData, "Stock_On_Hand"),
    riskLevelMap.get("StockOut")?.Potential_Sales_Loss || 0,
    riskLevelMap.get("CriticalStock")?.Potential_Sales_Loss || 0,
    riskLevelMap.get("LowInventory")?.Potential_Sales_Loss || 0,
    _.sumBy(aggregatedData, "Excess_Stock"),
  ];

  const stable_Stock = total_Soh - excess_Stock;

  // Process combinations in parallel
  const [
    total_Combinations,
    stockout_Comb,
    criticalStock_Comb,
    lowInventory_Comb,
    excessStock_Comb,
    stableStock_Comb,
  ] = [
    _.sumBy(aggregatedData, "ts_id"),
    riskLevelMap.get("StockOut")?.ts_id || 0,
    riskLevelMap.get("CriticalStock")?.ts_id || 0,
    riskLevelMap.get("LowInventory")?.ts_id || 0,
    riskLevelMap.get("ExcessStock")?.ts_id || 0,
    riskLevelMap.get("Stable")?.ts_id || 0,
  ];

  const metric_val = calculateValues(aggregatedData, aggMethodsDict);
  console.log("give this values", metric_val);

  const inventoryMetrics = {
    units: {
      total: total_Inventory,
      total_soh: total_Soh,
      stockout: stockout,
      critical_stock: critical_Stock,
      low_inventory: low_Inventory,
      stable_stock: stable_Stock,
      excess_stock: excess_Stock,
    },
    value: {
      total: metric_val.total_Val,
      total_soh: metric_val.totalSoh_Val,
      stockout: metric_val.stockout_Val,
      critical_stock: metric_val.criticalStock_Val,
      stable_stock: metric_val.stableStock_Val,
      low_inventory: metric_val.lowInventory_Val,
      excess_stock: metric_val.excessStock_Val,
    },
    count: {
      total: total_Combinations,
      stockout: stockout_Comb,
      critical_stock: criticalStock_Comb,
      low_inventory: lowInventory_Comb,
      stable_stock: stableStock_Comb,
      excess_stock: excessStock_Comb,
    },
    currency: null,
  };

  console.log("invent metrics Data:", inventoryMetrics);
  return inventoryMetrics;
};

const inventoryMetricsPanel = (invMetrics) => {
  // Process all formatting operations in parallel
  const [counts, units, values] = [
    // Format counts
    {
      total: invMetrics.count.total.toLocaleString(),
      stockout: invMetrics.count.stockout.toLocaleString(),
      critical_stock: invMetrics.count.critical_stock.toLocaleString(),
      low_inventory: invMetrics.count.low_inventory.toLocaleString(),
      stable_stock: invMetrics.count.stable_stock.toLocaleString(),
      excess_stock: invMetrics.count.excess_stock.toLocaleString(),
    },
    // Format units
    {
      total: invMetrics.units.total.toLocaleString(),
      total_soh: invMetrics.units.total_soh.toLocaleString(),
      stockout: invMetrics.units.stockout.toLocaleString(),
      critical_stock: invMetrics.units.critical_stock.toLocaleString(),
      low_inventory: invMetrics.units.low_inventory.toLocaleString(),
      stable_stock: invMetrics.units.stable_stock.toLocaleString(),
      excess_stock: invMetrics.units.excess_stock.toLocaleString(),
    },
    // Format values
    {
      total: invMetrics.value.total.toLocaleString(),
      total_soh: invMetrics.value.total_soh.toLocaleString(),
      stockout: invMetrics.value.stockout.toLocaleString(),
      critical_stock: invMetrics.value.critical_stock.toLocaleString(),
      low_inventory: invMetrics.value.low_inventory.toLocaleString(),
      stable_stock: invMetrics.value.stable_stock.toLocaleString(),
      excess_stock: invMetrics.value.excess_stock.toLocaleString(),
    },
  ];

  // Calculate percentages
  const formatToFirstNonZero = (value) => {
    if (value === 0) return "0%";

    // Find the power of 10 to scale the number to the first significant digit
    const magnitude = Math.floor(Math.log10(Math.abs(value)));
    const scale = Math.pow(10, -magnitude);

    // Round to one significant digit
    const roundedValue = Math.round(value * scale) / scale;

    return `${roundedValue}%`;
  };

  // Pre-calculate common values for percentage calculations
  const totalUnits = invMetrics.units.total;
  const stockoutUnits = invMetrics.units.stockout;
  const criticalStockUnits = invMetrics.units.critical_stock;
  const lowInventoryUnits = invMetrics.units.low_inventory;
  const stableStockUnits = invMetrics.units.stable_stock;
  const excessStockUnits = invMetrics.units.excess_stock;

  // Calculate all percentages in parallel
  const percentages = {
    stockout_pct: formatToFirstNonZero((stockoutUnits / totalUnits) * 100),
    critical_pct: formatToFirstNonZero((criticalStockUnits / totalUnits) * 100),
    low_pct: formatToFirstNonZero((lowInventoryUnits / totalUnits) * 100),
    stable_pct: formatToFirstNonZero((stableStockUnits / totalUnits) * 100),
    excess_pct: formatToFirstNonZero((excessStockUnits / totalUnits) * 100),
  };

  console.log(percentages);

  const currency = invMetrics.currency;
  // Return the structured object
  return {
    counts,
    units,
    values,
    percentages,
    currency,
  };
};

const DashInventoryPlanning = () => {
  const {
    inventoryOptimizationData,
    inventoryOptimizationFilterData,
    InvCurrentDimension,
    setCurrentInvDimension,
    InvCurrentValue,
    setCurrentInvValue,
    InvPriceFilterData,
    loadInventoryOptimizationData,
    experimentBasePath,
    InventoryMetricsData,
    loadInventoryMetricsData,
    setFilterData,
    tablesFilterData,
    supplyPlanFilterData,
    filterData: filterDataProp,
  } = useDashboard();
  const { experiment_config, hasParquetFiles } = useExperiment();
  const {configState} = useConfig();
  const moduleName = configState.common.module_name

  const [inventoryDimensionToFilter, setInventoryDimensionToFilter] = useState(() => {
  if (moduleName === "inventory-optimization" && supplyPlanFilterData) {
    return Object.keys(supplyPlanFilterData).filter((key) => key !== "all");
  }
  return Object.keys(InvPriceFilterData).filter((key) => key !== "all") || [];
});

  /*   useEffect(() => {
    const dict = { Forecast_Granularity: "ts_id", Cluster: "cluster" };
    const changable = ["Forecast_Granularity", "Cluster"];
    const convert = (dimension) => {
      if (changable.includes(dimension)) {
        return dict[dimension];
      }
      return dimension;
    };
    const fetchInventory = async () => {
      await loadInventoryOptimizationData(
        `${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data.csv`,
        experiment_config,
        {
          dimensionFilters: {
            [convert(InvCurrentDimension)]: [InvCurrentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        },
        userInfo.userID,
        hasParquetFiles
      );
    };
    fetchInventory();
  }, []); */
  const { userInfo, currentCompany } = useAuth();
  const [filtersApplied, setFiltersApplied] = useState([]);
  const [filterData, setfilterData] = useState(
  moduleName === "inventory-optimization" && supplyPlanFilterData
    ? supplyPlanFilterData
    : InvPriceFilterData
);
  const [inventoryFilterDimensions, setInventoryFilterDimensions] = useState(
    []
  );
  useEffect(() => {
  if (moduleName === "inventory-optimization" && supplyPlanFilterData) {
    setfilterData(supplyPlanFilterData);
  } else if (InvPriceFilterData) {
    setfilterData(InvPriceFilterData);
  }
}, []);
  const currencyDict = {
    USD: "$",
    INR: "₹",
  };
  const [values, setvalues] = useState(filterData[InvCurrentDimension]);
  const [getinventoryMetric, setGetinventoryMetric] = useState(null);
  const [inventoryMetrics, setInventoryMetrics] = useState(null);
  const soh_data_fileName =
    `${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data.csv`
      .split(".csv")[0]
      .split("/")
      .join("_");
  useEffect(() => {
    setvalues(filterData[InvCurrentDimension]);
    setCurrentInvValue(filterData[InvCurrentDimension][0]);
  }, [InvCurrentDimension]);

  const changables = ["Cluster", "Forecast_Granularity"];
  const dict = { Cluster: "cluster", Forecast_Granularity: "ts_id" };
  const convert = (dimension) => {
    if (changables.includes(dimension)) {
      return dict[dimension];
    }

    return dimension;
  };

  useEffect(() => {
    const columnFilter =
      tablesFilterData[`${soh_data_fileName}`]?.["Default"]?.filterData
        ?.columnFilter ?? [];

    setInventoryDimensionToFilter((prev) =>
      Array.isArray(columnFilter) && columnFilter.length > 0
        ? prev.filter((dim) => columnFilter.includes(convert(dim)))
        : prev
    );
  }, [
    tablesFilterData[`${soh_data_fileName}`]?.["Default"]?.filterData
      ?.columnFilter,
  ]);
  useEffect(() => {
    const fetchInventoryData = async () => {
      const dict = { Forecast_Granularity: "ts_id", Cluster: "cluster" };
      const changable = ["Forecast_Granularity", "Cluster"];
      const dimension = changable.includes(InvCurrentDimension)
        ? dict[InvCurrentDimension]
        : InvCurrentDimension;
      const filterData = {
        dimensionFilters: {
          [dimension]: [InvCurrentValue],
        },
        columnFilter:
          tablesFilterData[`${soh_data_fileName}`]?.["Default"]?.filterData
            ?.columnFilter ?? [],
        selectAllColumns:
          tablesFilterData[`${soh_data_fileName}`]?.["Default"]?.filterData
            ?.selectAllColumns ?? true,
      };

      const allFilterData = {
        dimensionFilters: {},
        columnFilter:
          tablesFilterData[`${soh_data_fileName}`]?.["Default"]?.filterData
            ?.columnFilter ?? [],
        selectAllColumns:
          tablesFilterData[`${soh_data_fileName}`]?.["Default"]?.filterData
            ?.selectAllColumns ?? true,
      };

      const convert = (dimension) => {
        if (changable.includes(dimension)) {
          return dict[dimension];
        }
        return dimension;
      };
      await setFilterData(
        InvCurrentValue === "all" ? allFilterData : filterData,
        "DOI Details",
        `${soh_data_fileName}`,
        "Default"
      );

      // Ensure tablesFilterData[`${soh_data_fileName}`] exists before accessing its "Default" property
      if (tablesFilterData[`${soh_data_fileName}`]?.["Default"]?.filterData) {
        // await loadInventoryOptimizationData(
        //   `${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data.csv`,
        //   experiment_config,
        //   tablesFilterData[`${soh_data_fileName}`]["Default"].filterData,
        //   userInfo.userID
        // );
      } else {
        console.error(
          'tablesFilterData[`${soh_data_fileName}`]["Default"].filterData is undefined'
        );
        // await loadInventoryOptimizationData(
        //   `${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data.csv`,
        //   experiment_config,
        //   {
        //     dimensionFilters: {
        //       [convert(InvCurrentDimension)]: [InvCurrentValue],
        //     },
        //     columnFilter: [],
        //     selectAllColumns: true,
        //   },
        //   userInfo.userID
        // );
        // Handle error accordingly (e.g., show a message, fallback data, etc.)
      }
    };
    fetchInventoryData();
  }, [InvCurrentValue]);
  useEffect(() => {
    const fetchInventoryMetricsData = async () => {
      const dict = { Cluster: "cluster" };
      const changable = ["Cluster"];
      const convert = (dimension) => {
        if (changable.includes(dimension)) {
          return dict[dimension];
        }
        return dimension;
      };
      await loadInventoryMetricsData(
        `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/inventory_metrics.csv`,
        {
          dimensionFilters: {
            feature: [convert(InvCurrentDimension)],
            value: [InvCurrentValue],
          },
          columnFilter: [],
          selectAllColumns: true,
        },
        userInfo.userID,
        hasParquetFiles
      );
    };
    fetchInventoryMetricsData();
  }, [InvCurrentValue]);
  useEffect(() => {
    if (InventoryMetricsData) {
      setGetinventoryMetric(
        get_Inventory_Metrics(
          InventoryMetricsData,
          experiment_config.scenario_plan.pricing_constraints.currency !==
            undefined &&
            experiment_config.scenario_plan.pricing_constraints.currency
            ? currencyDict[
                experiment_config.scenario_plan.pricing_constraints.currency
              ]
            : null
        )
      );
      setInventoryMetrics(
        inventoryMetricsPanel(
          get_Inventory_Metrics(
            InventoryMetricsData,
            experiment_config.scenario_plan.pricing_constraints.currency !==
              undefined &&
              experiment_config.scenario_plan.pricing_constraints.currency
              ? currencyDict[
                  experiment_config.scenario_plan.pricing_constraints.currency
                ]
              : null
          )
        )
      );
    } else if (inventoryOptimizationData) {
      setGetinventoryMetric(
        get_Inventory_Metrics(
          inventoryOptimizationData,
          experiment_config.scenario_plan.pricing_constraints.currency !==
            undefined &&
            experiment_config.scenario_plan.pricing_constraints.currency
            ? currencyDict[
                experiment_config.scenario_plan.pricing_constraints.currency
              ]
            : null
        )
      );
      setInventoryMetrics(
        inventoryMetricsPanel(
          get_Inventory_Metrics(
            inventoryOptimizationData,
            experiment_config.scenario_plan.pricing_constraints.currency !==
              undefined &&
              experiment_config.scenario_plan.pricing_constraints.currency
              ? currencyDict[
                  experiment_config.scenario_plan.pricing_constraints.currency
                ]
              : null
          )
        )
      );
    }
  }, [InventoryMetricsData, inventoryOptimizationData]);

  useEffect(() => {
    const fileName = soh_data_fileName;
    console.log("tablesFilterData", tablesFilterData);
    console.log("fileName", fileName);
    const filtersData = {
      dimensionFilters:
        tablesFilterData[fileName]?.["Default"]?.filterData?.dimensionFilters ??
        {},
      frozenColumns:
        tablesFilterData[fileName]?.["Default"]?.filterData?.frozenColumns ??
        [],
      columnFilter:
        tablesFilterData[fileName]?.["Default"]?.filterData?.columnFilter ?? [],
      selectAllColumns:
        tablesFilterData[fileName]?.["Default"]?.filterData?.selectAllColumns ??
        true,
    };
    console.log("filtersData", filtersData);
    const dimensionFilters = filtersData.dimensionFilters;
    console.log("dimensionFilters", dimensionFilters);
    const tempData = Object.entries(dimensionFilters)
      .filter(([key, value]) => Array.isArray(value) && value.length > 0)
      .map(([key]) => (key === "cluster" ? "Cluster" : key));

    if (dimensionFilters) {
      let filtersArray = [];
      Object.keys(dimensionFilters).forEach((key) => {
        filtersArray = filtersArray.concat(dimensionFilters[key]);
      });
      setFiltersApplied(filtersArray);

      console.log("Filters Applied:", filtersArray);
    }
  }, [tablesFilterData]);
  const handleClearFilter = async () => {
    setCurrentInvDimension("all");
  };
  return (
    <Box>
      {(filterData !== null) &
      (InvCurrentDimension !== null) &
      (InvCurrentValue !== null) ? (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          padding={"12px 16px"}
          gap={2}
        >
          <CustomAutocomplete
            disableClearable
            showLabel
            label="Dimension"
            placeholder="select option.."
            values={Object.keys(filterData)}
            // isMultiSelect={true}
            selectedValues={InvCurrentDimension}
            setSelectedValues={setCurrentInvDimension}
          />
          <CustomAutocomplete
            disableClearable
            showLabel
            label="Value"
            placeholder="select option.."
            values={values}
            // isMultiSelect={true}
            selectedValues={InvCurrentValue}
            setSelectedValues={setCurrentInvValue}
          />

          <Stack
            direction={"row"}
            spacing={2}
            justifyContent={"flex-end"}
            alignItems={"flex-end"}
            // border={"1px solid"}
          >
            <CustomButton
              title="Clear"
              onClick={() => {
                handleClearFilter();
              }}
              backgroundColor="#FFFF"
              borderColor="#D0D5DD"
              textColor="#344054"
            />
          </Stack>
        </Stack>
      ) : (
        <Skeleton variant="rectangular" height={"20px"} />
      )}

      {inventoryMetrics !== null ? (
        <InventoryHealth inventoryMetrics={inventoryMetrics} />
      ) : (
        <Grid container spacing={3} padding={"12px 16px 12px 16px"}>
          <Grid item xs={12} md={2.4}>
            <Skeleton variant="rectangular" height={"250px"} />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Skeleton variant="rectangular" height={"250px"} />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Skeleton variant="rectangular" height={"250px"} />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Skeleton variant="rectangular" height={"250px"} />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Skeleton variant="rectangular" height={"250px"} />
          </Grid>
        </Grid>
      )}

      <FilterBlock
        filtersApplied={filtersApplied}
        dimensionsToFilter={inventoryDimensionToFilter}
        setDimensionsToFilter={setInventoryDimensionToFilter}
        dimensionOptions={Object.keys(filterData)}
        fileName={soh_data_fileName}
        reportName="DOI Details"
        filterOptions={filterData}
        filterData={filterDataProp}
        path={`${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data.csv`}
      />

      <CustomTable title="DOI Details" />
    </Box>
  );
};

export default DashInventoryPlanning;
