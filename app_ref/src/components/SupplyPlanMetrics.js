import React, { useState, useEffect, useCallback } from "react";
import { callQueryEngineQuery } from "../utils/queryEngine";
import useDashboard from "../hooks/useDashboard";
import { IconButton, CircularProgress, Tooltip } from "@mui/material";
import { FileDownloadOutlined } from "@mui/icons-material";
import useAuth from "../hooks/useAuth";
import { downloadParquetFileUsingPreSignedURL } from "../redux/actions/dashboardActions";

const SupplyPlanMetrics = ({ unitOrRevenue }) => {
  const { tablesFilterData, experimentBasePath } = useDashboard();
  const { currentCompany, userInfo } = useAuth();

  const [metrics, setMetrics] = useState({
    stockout: null,
    criticalStock: null,
    lowInventory: null,
    excessStock: null,
    stable: null,
    totalInventory: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [downloadingMetric, setDownloadingMetric] = useState(null);

  const filePath = `${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data.csv`;
  const productionPlanFilePath = `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/production_plan_finished_goods.csv`;
  const productionPlanValueFilePath = `${experimentBasePath}/scenario_planning/K_best/post_model_demand_pattern/production_plan_finished_goods_value.csv`;
  const convertFilePathToFileName = (filePath) => {
    if (!filePath) return "";
    const withoutExtension = filePath.replace(/\.[^/.]+$/, "");
    const pathComponents = withoutExtension.split("/");
    return pathComponents.join("_");
  };

  const titleRiskLevelDict = {
    Stockout: "StockOut",
    "Critical Stock": "CriticalStock",
    "Low Inventory": "LowInventory",
    "Stable Stock": "Stable",
    "Excess Stock": "ExcessStock",
  };

  const metricTitleMap = {
    StockOut: "Stockout",
    Critical: "Critical Stock",
    "Low Inventory": "Low Inventory",
    Excess: "Excess Stock",
    Stable: "Stable Stock",
  };

  const handleDownload = async (metricLabel) => {
    setDownloadingMetric(metricLabel);

    const title = metricTitleMap[metricLabel];
    const newFileName =
      `${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data`
        .split(".csv")[0]
        .split("/")
        .join("_");
    const newFilePath = `${experimentBasePath}/scenario_planning/K_best/inventory_plan/soh_data.csv`;

    const filterDataTable = tablesFilterData[newFileName]?.Default?.filterData;
    const filterData = {
      ...filterDataTable,
      dimensionFilters: {
        ...filterDataTable?.dimensionFilters,
        Stock_Risk_Level: titleRiskLevelDict[title],
      },
    };

    const newTokenPayloadForParquet = {
      filePath: newFilePath,
      fileName: newFileName,
      companyName: currentCompany.companyName,
      filterData,
      paginationData: null,
      sortingData: null,
    };

    try {
      await downloadParquetFileUsingPreSignedURL(
        newTokenPayloadForParquet,
        title,
        userInfo.userID
      );
    } catch (error) {
      console.error("Error during file download:", error);
    } finally {
      setDownloadingMetric(null);
    }
  };

  const formatNumber = (value) => {
    if (value == null || isNaN(value)) return "0";
    const num = Math.abs(Number(value));
    if (num >= 1e9) return (Number(value) / 1e9).toFixed(1) + "B";
    if (num >= 1e6) return (Number(value) / 1e6).toFixed(1) + "M";
    if (num >= 1e3) return (Number(value) / 1e3).toFixed(1) + "K";
    return Number(value).toLocaleString();
  };

  const renderValue = (value, percentage) => {
  if (value === null || value === undefined) return "-";

  const formatted = formatNumber(value);
  const currencyPrefix = unitOrRevenue === "revenue" ? "$" : "";
  console.log(unitOrRevenue)

  return `${currencyPrefix}${formatted} (${percentage}%)`;
};

  const field = (name) => {
    if (unitOrRevenue !== "revenue") return name;

    // Special case only for Stock_On_Hand
    if (name === "Stock_On_Hand") return "soh_value";

    // Default revenue suffix
    return `${name}_value`;
  };

  const fetchMetrics = useCallback(async () => {
    if (!filePath || !experimentBasePath) return;

    setIsLoading(true);
    try {
      const fileName = convertFilePathToFileName(productionPlanFilePath);
      const filterData = tablesFilterData[fileName]?.Default?.filterData || {};

      const queries = [
        {
          key: "base",
          filterConditions: [],
          aggregationColumns: {
            [field("Stock_On_Hand")]: "sum",
            [field("Excess_Stock")]: "sum",
            [field("Potential_Sales_Loss")]: "sum",
          },
        },
        {
          key: "stockout",
          filterConditions: [
            {
              column: "Stock_Risk_Level",
              type: "string",
              operator: "equals",
              value: "StockOut",
            },
          ],
          aggregationColumns: { [field("Potential_Sales_Loss")]: "sum" },
        },
        {
          key: "critical",
          filterConditions: [
            {
              column: "Stock_Risk_Level",
              type: "string",
              operator: "equals",
              value: "CriticalStock",
            },
          ],
          aggregationColumns: { [field("Potential_Sales_Loss")]: "sum" },
        },
        {
          key: "lowInventory",
          filterConditions: [
            {
              column: "Stock_Risk_Level",
              type: "string",
              operator: "equals",
              value: "LowInventory",
            },
          ],
          aggregationColumns: { [field("Potential_Sales_Loss")]: "sum" },
        },
        {
          key: "excess",
          filterConditions: [
            {
              column: "Stock_Risk_Level",
              type: "string",
              operator: "equals",
              value: "ExcessStock",
            },
          ],
          aggregationColumns: { [field("Excess_Stock")]: "sum" },
        },
      ];

      const results = await Promise.all(
        queries.map(({ filterConditions, aggregationColumns }) =>
          callQueryEngineQuery({
            fileName,
            filePath,
            filterData,
            sortingData: null,
            groupByColumns: [],
            aggregationColumns,
            filterConditions,
            paginationData: null,
            time: Date.now(),
          })
        )
      );

      const getSum = (result, key) => {
        if (!result || !result[key]) return 0;
        const value = Array.isArray(result[key]) ? result[key][0] : result[key];
        return parseFloat(value) || 0;
      };

      const [
        baseResults,
        stockoutResults,
        criticalResults,
        lowInventoryResults,
        excessResults,
      ] = results;

      console.log(baseResults);
      console.log(stockoutResults);
      const stockOnHand = getSum(baseResults, `sum_${field("Stock_On_Hand")}`);
      const excessStockBase = getSum(
        baseResults,
        `sum_${field("Excess_Stock")}`
      );
      const potentialSalesLoss = getSum(
        baseResults,
        `sum_${field("Potential_Sales_Loss")}`
      );

      const stockout = getSum(
        stockoutResults,
        `sum_${field("Potential_Sales_Loss")}`
      );
      const criticalStock = getSum(
        criticalResults,
        `sum_${field("Potential_Sales_Loss")}`
      );
      const lowInventory = getSum(
        lowInventoryResults,
        `sum_${field("Potential_Sales_Loss")}`
      );
      const excessStock = getSum(baseResults, `sum_${field("Excess_Stock")}`);

      const totalInventory = stockOnHand + excessStockBase + potentialSalesLoss;
      const stable = stockOnHand - excessStockBase;

      console.log(stockOnHand);

      setMetrics({
        stockout,
        criticalStock,
        lowInventory,
        excessStock: excessStock || excessStockBase,
        stable,
        totalInventory,
      });
    } catch (error) {
      console.error("Error fetching inventory metrics:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filePath, tablesFilterData, experimentBasePath, unitOrRevenue]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics, unitOrRevenue]);

  const getPercentage = (value) => {
    // Calculate the denominator as the sum of all 5 relevant metrics
    const total =
      (metrics.stockout ?? 0) +
      (metrics.criticalStock ?? 0) +
      (metrics.lowInventory ?? 0) +
      (metrics.excessStock ?? 0) +
      (metrics.stable ?? 0);

    if (!total || total === 0) return "0.0";

    return ((value / total) * 100).toFixed(1);
  };

  const getColorForMetric = (label) => {
    switch (label) {
      case "StockOut":
        return "#F04438";
      case "Critical":
        return "#F79009";
      case "Low Inventory":
        return "#FDB022";
      case "Excess":
        return "#7F56D9";
      case "Stable":
        return "#12B76A";
      default:
        return "#344054";
    }
  };

  const metricsList = [
    { label: "StockOut", value: metrics.stockout, icon: "⚠️" },
    { label: "Critical", value: metrics.criticalStock, icon: "🔴" },
    { label: "Low Inventory", value: metrics.lowInventory, icon: "🟡" },
    { label: "Excess", value: metrics.excessStock, icon: "📦" },
    { label: "Stable", value: metrics.stable, icon: "✅" },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: "6px",
        border: "1px solid #D0D5DD",
        minHeight: "38px",
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
        flexWrap: "wrap",
      }}
    >
      {metricsList.map((metric, index) => {
        const percentage = getPercentage(metric.value);
        const color = getColorForMetric(metric.label);
        const isDownloading = downloadingMetric === metric.label;

        return (
          <React.Fragment key={index}>
            <div
              style={{
                flex: "1 1 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                padding: "4px 6px",
                whiteSpace: "nowrap",
                minWidth: "140px",
                marginTop: "auto",
                marginBottom: "auto",
              }}
              className="metric-item"
            >
              <span
                style={{
                  lineHeight: "1",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {metric.icon}
              </span>
              <span
                style={{
                  fontSize: "clamp(11px, 2vw, 14px)",
                  fontWeight: 600,
                  color: "#374151",
                  display: "flex",
                  alignItems: "center",
                  lineHeight: 1,
                }}
              >
                {metric.label}:
              </span>

              {isLoading ? (
                <span
                  style={{
                    fontSize: "clamp(10px, 1.8vw, 13px)",
                    fontWeight: 700,
                    color: "#667085",
                  }}
                >
                  ...
                </span>
              ) : (
                <span
                  style={{
                    fontSize: "clamp(10px, 1.8vw, 13px)",
                    fontWeight: 700,
                    color: color,
                    display: "flex",
                    alignItems: "center",
                    lineHeight: 1,
                  }}
                >
                  {renderValue(metric.value, percentage)}
                </span>
              )}

              <Tooltip title={`Download ${metric.label} data`} arrow>
                <span>
                  <IconButton
                    onClick={() => handleDownload(metric.label)}
                    disabled={isDownloading}
                    sx={{
                      width: { xs: 22, sm: 26, md: 28 },
                      height: { xs: 22, sm: 26, md: 28 },
                      p: { xs: 0.2, sm: 0.25, md: 0.3 },
                      ml: { xs: 0.2, md: 0.3 },
                      color: "#667085",
                      "&:hover": {
                        color: "#344054",
                        backgroundColor: "rgba(0,0,0,0.04)",
                      },
                      "&.Mui-disabled": {
                        color: "#ccc",
                      },
                      position: "relative",
                    }}
                  >
                    {isDownloading ? (
                      <CircularProgress
                        size={14}
                        thickness={5}
                        sx={{ color: "#667085" }}
                      />
                    ) : (
                      <FileDownloadOutlined
                        sx={{
                          fontSize: { xs: 14, sm: 16, md: 18 },
                        }}
                      />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </div>

            {index < metricsList.length - 1 && (
              <div
                style={{
                  width: "1px",
                  height: "20px",
                  backgroundColor: "#D0D5DD",
                  opacity: 0.8,
                  display: window.innerWidth < 768 ? "none" : "block",
                }}
              />
            )}
          </React.Fragment>
        );
      })}

      <style>{`
        @media (max-width: 768px) {
          .metric-item {
            min-width: 100% !important;
            border-bottom: 1px solid #E5E7EB;
            padding: 6px 8px !important;
            justify-content: flex-start !important;
          }
          .metric-item:last-child {
            border-bottom: none;
          }
        }

        @media (max-width: 480px) {
          .metric-item {
            gap: 3px !important;
            padding: 5px 6px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SupplyPlanMetrics;
