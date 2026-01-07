const formatNumber = (value) => {
  // Check if value is a number or a string representing a number
  if (
    typeof value === "number" ||
    (typeof value === "string" && !isNaN(value))
  ) {
    // Convert string to number if needed
    const numberValue = Number(value);
    // Return formatted number with commas
    return numberValue.toLocaleString(undefined, { maximumFractionDigits: 0 });
  } else {
    // Return value as is if not a valid number
    return value;
  }
};
const formatToPercent = (numberStr) => {
  // Convert string to number
  const value = parseFloat(numberStr);

  // Determine if value is a fraction or already a percentage
  // const percentageValue = value<1?value*100:value;
  const percentageValue = value;

  // Format the percentage value
  return new Intl.NumberFormat("default", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
    .format(percentageValue / 100)
    .toString();
};

export const ExecutiveCardsContent = (
  transformedData,
  frequency,
  moduleName,
  currency,
  experiment_config
) => {
  switch (moduleName) {
    case "inventory-optimization":
      if(experiment_config.scenario_plan?.simple_disaggr?.ts_id_columns_simple_disaggr?.length > 0 || experiment_config.scenario_plan?.inventory_constraints?.inventory_optimisation_granularity?.length > 0){
         return [
           {
             id: 1,
             type: "graph+metrics",
             description: "Some information about the card",
             title: "Predicted Demand",
             units: formatNumber(transformedData.Forecast),
             value:
               formatNumber(transformedData.Forecast_value) === "0"
                 ? "0"
                 : `${currency ? currency : ""} ${formatNumber(
                     transformedData.Forecast_value
                   )}`,
             subMetric1Title: "Horizon",
             subMetric1: `${transformedData.Forecast_Horizon} ${frequency}`,
             subMetric2Title: "Accuracy",
             dimension: "Predicted Demand",
             subMetric2: formatToPercent(transformedData.Accuracy),
             extraMetrictitle: ["Total Combinations"],
             extraMetric: [
               formatNumber(transformedData?.total_combinations) || undefined,
             ],
             extraSubMetric: [null],
           },

           {
             id: 2,
             title: "Growth",
             type: "graph+metrics",
             description: "Some information about the card",
             units: `${formatToPercent(transformedData["YOY_Growth%"])}`,
             value: "0",
             subMetric1Title: "M-o-M Growth Rate",
             subMetric2Title: "Net Margin%",
             subMetric1: formatToPercent(transformedData["Current_Growth%"]),
             subMetric2: formatToPercent(transformedData["Net_Margin%"]),
             extraMetrictitle:
               transformedData.potential_stock_wastage !== undefined &&
               transformedData.potential_stock_wastage !== "0"
                 ? ["Projected Lost Sales", "Stock Wastage"]
                 : ["Projected Lost Sales"],
             extraMetric:
               transformedData.potential_stock_wastage !== undefined &&
               transformedData.potential_stock_wastage !== "0"
                 ? [
                     formatNumber(transformedData.Potential_Sales_Loss) ===
                       "0" ||
                     formatNumber(transformedData.Potential_Sales_Loss) ===
                       undefined
                       ? formatNumber(transformedData.Potential_Sales_Loss)
                       : `${currency ? currency : ""} ${formatNumber(
                           transformedData.Potential_Sales_Loss
                         )}`,
                     formatNumber(transformedData.potential_stock_wastage) ===
                       "0" ||
                     formatNumber(transformedData.potential_stock_wastage) ===
                       undefined
                       ? formatNumber(transformedData.potential_stock_wastage)
                       : `${currency ? currency : ""} ${formatNumber(
                           transformedData.potential_stock_wastage
                         )}`,
                   ]
                 : [
                     formatNumber(transformedData.Potential_Sales_Loss) ===
                       "0" ||
                     formatNumber(transformedData.Potential_Sales_Loss) ===
                       undefined
                       ? formatNumber(transformedData.Potential_Sales_Loss)
                       : `${currency ? currency : ""} ${formatNumber(
                           transformedData?.Potential_Sales_Loss
                         )}`,
                   ],
             extraSubMetric:
               transformedData.potential_stock_wastage_value !== undefined &&
               transformedData.potential_stock_wastage_value !== "0"
                 ? [
                     formatNumber(
                       transformedData.Potential_Sales_Loss_value
                     ) === "0" ||
                     formatNumber(
                       transformedData.Potential_Sales_Loss_value
                     ) === undefined
                       ? formatNumber(
                           transformedData.Potential_Sales_Loss_value
                         )
                       : `${currency ? currency : ""} ${formatNumber(
                           transformedData.Potential_Sales_Loss_value
                         )}`,
                     formatNumber(
                       transformedData.potential_stock_wastage_value
                     ) === "0" ||
                     formatNumber(
                       transformedData.potential_stock_wastage_value
                     ) === undefined
                       ? formatNumber(
                           transformedData.potential_stock_wastage_value
                         )
                       : `${currency ? currency : ""} ${formatNumber(
                           transformedData.potential_stock_wastage_value
                         )}`,
                   ]
                 : [
                     formatNumber(
                       transformedData.Potential_Sales_Loss_value
                     ) === "0" ||
                     formatNumber(
                       transformedData.Potential_Sales_Loss_value
                     ) === undefined
                       ? formatNumber(
                           transformedData.Potential_Sales_Loss_value
                         )
                       : `${currency ? currency : ""} ${formatNumber(
                           transformedData.Potential_Sales_Loss_value
                         )}`,
                   ],
             dimension: "Potential sales loss",
             metric1title: "Lost Sales (units)",
             metric1: `${formatNumber(transformedData.Potential_Sales_Loss)}`,
             metric2title: "Current Growth Rate",
             metric2: `${formatNumber(transformedData["Current_Growth%"])}`,
             metric3title: "YoY Growth Rate",
             metric3: `${formatToPercent(transformedData["YOY_Growth%"])}`,
           },
         ];
      }
      return [
        {
          id: 1,
          type: "graph+metrics",
          description: "Some information about the card",
          title: "Predicted Demand",
          units: formatNumber(transformedData.Forecast),
          value:
            formatNumber(transformedData.Forecast_value) === "0"
              ? "0"
              : `${currency ? currency : ""} ${formatNumber(
                  transformedData.Forecast_value
                )}`,
          subMetric1Title: "Horizon",
          subMetric1: `${transformedData.Forecast_Horizon} ${frequency}`,
          subMetric2Title: "Accuracy",
          dimension: "Predicted Demand",
          subMetric2: formatToPercent(transformedData.Accuracy),
          extraMetrictitle: ["Total Combinations"],
          extraMetric: [
            formatNumber(transformedData?.total_combinations) || undefined,
          ],
          extraSubMetric: [null],
        },
        {
          id: 2,
          title: "Current Inventory",
          type: "graph+metrics",
          description: "Some information about the card",
          units: formatNumber(transformedData.Stock_On_Hand),
          value:
            formatNumber(transformedData.Forecast_value) === "0"
              ? "0"
              : `${currency ? currency : ""} ${formatNumber(
                  transformedData.soh_value
                )}`,
          subMetric1Title: "Days of Inventory/ Supply",
          subMetric2Title: "Reorder Quantity",
          subMetric1: `${transformedData.DOI_Current_Stock} Days`,
          subMetric2: formatNumber(transformedData.Reorder_now),
          extraMetrictitle:
            transformedData.Dead_Stock !== undefined
              ? ["Excess Stock", "Dead Stock"]
              : ["Excess Stock"],
          extraMetric:
            transformedData.Dead_Stock !== undefined
              ? [
                  formatNumber(transformedData.Excess_Stock),
                  formatNumber(transformedData.Dead_Stock),
                ]
              : [formatNumber(transformedData.Excess_Stock)],
          extraSubMetric:
            transformedData.Dead_Stock !== undefined
              ? [
                  formatNumber(transformedData.Excess_Stock_value) === "0"
                    ? "0"
                    : `${currency ? currency : ""} ${formatNumber(
                        transformedData.Excess_Stock_value
                      )}`,
                  formatNumber(transformedData.Dead_Stock_value) === "0"
                    ? "0"
                    : `${currency ? currency : ""} ${formatNumber(
                        transformedData.Dead_Stock_value
                      )}`,
                ]
              : [
                  formatNumber(transformedData.Excess_Stock_value) === "0"
                    ? "0"
                    : `${currency ? currency : ""} ${formatNumber(
                        transformedData.Excess_Stock_value
                      )}`,
                ],
          dimension: "Excess stock",
        },
        {
          id: 3,
          title: "Growth",
          type: "graph+metrics",
          description: "Some information about the card",
          units: `${formatToPercent(transformedData["YOY_Growth%"])}`,
          value: "0",
          subMetric1Title: "M-o-M Growth Rate",
          subMetric2Title: "Net Margin%",
          subMetric1: formatToPercent(transformedData["Current_Growth%"]),
          subMetric2: formatToPercent(transformedData["Net_Margin%"]),
          extraMetrictitle:
            transformedData.potential_stock_wastage !== undefined &&
            transformedData.potential_stock_wastage !== "0"
              ? ["Projected Lost Sales", "Stock Wastage"]
              : ["Projected Lost Sales"],
          extraMetric:
            transformedData.potential_stock_wastage !== undefined &&
            transformedData.potential_stock_wastage !== "0"
              ? [
                  formatNumber(transformedData.Potential_Sales_Loss),
                  formatNumber(transformedData.potential_stock_wastage),
                ]
              : [formatNumber(transformedData.Potential_Sales_Loss)],
          extraSubMetric:
            transformedData.potential_stock_wastage_value !== undefined &&
            transformedData.potential_stock_wastage_value !== "0"
              ? [
                  formatNumber(transformedData.Potential_Sales_Loss_value) ===
                  "0"
                    ? "0"
                    : `${currency ? currency : ""} ${formatNumber(
                        transformedData.Potential_Sales_Loss_value
                      )}`,
                  formatNumber(
                    transformedData.potential_stock_wastage_value
                  ) === "0"
                    ? "0"
                    : `${currency ? currency : ""} ${formatNumber(
                        transformedData.potential_stock_wastage_value
                      )}`,
                ]
              : [
                  formatNumber(transformedData.Potential_Sales_Loss_value) ===
                    "0" ||
                  formatNumber(transformedData.Potential_Sales_Loss_value) ===
                    undefined
                    ? formatNumber(transformedData.Potential_Sales_Loss_value)
                    : `${currency ? currency : ""} ${formatNumber(
                        transformedData.Potential_Sales_Loss_value
                      )}`,
                ],
          dimension: "Potential sales loss",
          metric1title: "Lost Sales (units)",
          metric1: `${formatNumber(transformedData.Potential_Sales_Loss)}`,
          metric2title: "Current Growth Rate",
          metric2: `${formatNumber(transformedData["Current_Growth%"])}`,
          metric3title: "YoY Growth Rate",
          metric3: `${formatToPercent(transformedData["YOY_Growth%"])}`,
        },
      ];
    case "demand-planning":
      return [
        {
          id: 1,
          type: "graph+metrics",
          description: "Some information about the card",
          title: "Predicted Demand",
          units: formatNumber(transformedData.Forecast),
          value:
            formatNumber(transformedData.Forecast_value) === "0"
              ? "0"
              : `${currency ? currency : ""} ${formatNumber(
                  transformedData.Forecast_value
                )}`,
          subMetric1Title: "Horizon",
          subMetric1: `${transformedData.Forecast_Horizon} ${frequency}`,
          subMetric2Title: "Accuracy",
          dimension: "Predicted Demand",
          subMetric2: formatToPercent(transformedData.Accuracy),
          extraMetrictitle: ["Total Combinations"],
          extraMetric: [
            formatNumber(transformedData?.total_combinations) || undefined,
          ],
          extraSubMetric: [null],
        },

        {
          id: 2,
          title: "Growth",
          type: "graph+metrics",
          description: "Some information about the card",
          units: `${formatToPercent(transformedData["YOY_Growth%"])}`,
          value: "0",
          subMetric1Title: "M-o-M Growth Rate",
          subMetric2Title: "Net Margin%",
          subMetric1: formatToPercent(transformedData["Current_Growth%"]),
          subMetric2: formatToPercent(transformedData["Net_Margin%"]),
          extraMetrictitle:
            transformedData.potential_stock_wastage !== undefined &&
            transformedData.potential_stock_wastage !== "0"
              ? ["Projected Lost Sales", "Stock Wastage"]
              : ["Projected Lost Sales"],
          extraMetric:
            transformedData.potential_stock_wastage !== undefined &&
            transformedData.potential_stock_wastage !== "0"
              ? [
                  formatNumber(transformedData.Potential_Sales_Loss) === "0" ||
                  formatNumber(transformedData.Potential_Sales_Loss) ===
                    undefined
                    ? formatNumber(transformedData.Potential_Sales_Loss)
                    : `${currency ? currency : ""} ${formatNumber(
                        transformedData.Potential_Sales_Loss
                      )}`,
                  formatNumber(transformedData.potential_stock_wastage) ===
                    "0" ||
                  formatNumber(transformedData.potential_stock_wastage) ===
                    undefined
                    ? formatNumber(transformedData.potential_stock_wastage)
                    : `${currency ? currency : ""} ${formatNumber(
                        transformedData.potential_stock_wastage
                      )}`,
                ]
              : [
                  formatNumber(transformedData.Potential_Sales_Loss) === "0" ||
                  formatNumber(transformedData.Potential_Sales_Loss) ===
                    undefined
                    ? formatNumber(transformedData.Potential_Sales_Loss)
                    : `${currency ? currency : ""} ${formatNumber(
                        transformedData?.Potential_Sales_Loss
                      )}`,
                ],
          extraSubMetric:
            transformedData.potential_stock_wastage_value !== undefined &&
            transformedData.potential_stock_wastage_value !== "0"
              ? [
                  formatNumber(transformedData.Potential_Sales_Loss_value) ===
                    "0" ||
                  formatNumber(transformedData.Potential_Sales_Loss_value) ===
                    undefined
                    ? formatNumber(transformedData.Potential_Sales_Loss_value)
                    : `${currency ? currency : ""} ${formatNumber(
                        transformedData.Potential_Sales_Loss_value
                      )}`,
                  formatNumber(
                    transformedData.potential_stock_wastage_value
                  ) === "0" ||
                  formatNumber(
                    transformedData.potential_stock_wastage_value
                  ) === undefined
                    ? formatNumber(
                        transformedData.potential_stock_wastage_value
                      )
                    : `${currency ? currency : ""} ${formatNumber(
                        transformedData.potential_stock_wastage_value
                      )}`,
                ]
              : [
                  formatNumber(transformedData.Potential_Sales_Loss_value) ===
                    "0" ||
                  formatNumber(transformedData.Potential_Sales_Loss_value) ===
                    undefined
                    ? formatNumber(transformedData.Potential_Sales_Loss_value)
                    : `${currency ? currency : ""} ${formatNumber(
                        transformedData.Potential_Sales_Loss_value
                      )}`,
                ],
          dimension: "Potential sales loss",
          metric1title: "Lost Sales (units)",
          metric1: `${formatNumber(transformedData.Potential_Sales_Loss)}`,
          metric2title: "Current Growth Rate",
          metric2: `${formatNumber(transformedData["Current_Growth%"])}`,
          metric3title: "YoY Growth Rate",
          metric3: `${formatToPercent(transformedData["YOY_Growth%"])}`,
        },
      ];
    case "pricing-promotion-optimization":
      return [
        {
          id: 1,
          type: "graph+metrics",
          description: "Some information about the card",
          title: "Predicted Demand",
          units: formatNumber(transformedData.Forecast),
          value:
            formatNumber(transformedData.Forecast_value) === "0"
              ? "0"
              : `${currency ? currency : ""} ${formatNumber(
                  transformedData.Forecast_value
                )}`,
          subMetric1Title: "Horizon",
          subMetric1: `${transformedData.Forecast_Horizon} ${frequency}`,
          subMetric2Title: "Accuracy",
          dimension: "Predicted Demand",
          subMetric2: formatToPercent(transformedData.Accuracy),
          extraMetrictitle: ["Total Combinations"],
          extraMetric: [
            formatNumber(transformedData?.total_combinations) || undefined,
          ],
          extraSubMetric: [null],
        },

        {
          id: 2,
          title: "Growth",
          type: "graph+metrics",
          description: "Some information about the card",
          units: `${formatToPercent(transformedData["YOY_Growth%"])}`,
          value: "0",
          subMetric1Title: "M-o-M Growth Rate",
          subMetric2Title: "Net Margin%",
          subMetric1: formatToPercent(transformedData["Current_Growth%"]),
          subMetric2: formatToPercent(transformedData["Net_Margin%"]),
          extraMetrictitle:
            transformedData.potential_stock_wastage !== undefined &&
            transformedData.potential_stock_wastage !== "0"
              ? ["Projected Lost Sales", "Stock Wastage"]
              : ["Projected Lost Sales"],
          extraMetric:
            transformedData.potential_stock_wastage !== undefined &&
            transformedData.potential_stock_wastage !== "0"
              ? [
                  formatNumber(transformedData.Potential_Sales_Loss) === "0" ||
                  formatNumber(transformedData.Potential_Sales_Loss) ===
                    undefined
                    ? formatNumber(transformedData.Potential_Sales_Loss)
                    : `${currency ? currency : ""} ${formatNumber(
                        transformedData.Potential_Sales_Loss
                      )}`,
                  formatNumber(transformedData.potential_stock_wastage) ===
                    "0" ||
                  formatNumber(transformedData.potential_stock_wastage) ===
                    undefined
                    ? formatNumber(transformedData.potential_stock_wastage)
                    : `${currency ? currency : ""} ${formatNumber(
                        transformedData.potential_stock_wastage
                      )}`,
                ]
              : [
                  formatNumber(transformedData.Potential_Sales_Loss) === "0" ||
                  formatNumber(transformedData.Potential_Sales_Loss) ===
                    undefined
                    ? formatNumber(transformedData.Potential_Sales_Loss)
                    : `${currency ? currency : ""} ${formatNumber(
                        transformedData?.Potential_Sales_Loss
                      )}`,
                ],
          extraSubMetric:
            transformedData.potential_stock_wastage_value !== undefined &&
            transformedData.potential_stock_wastage_value !== "0"
              ? [
                  formatNumber(transformedData.Potential_Sales_Loss_value) ===
                    "0" ||
                  formatNumber(transformedData.Potential_Sales_Loss_value) ===
                    undefined
                    ? formatNumber(transformedData.Potential_Sales_Loss_value)
                    : `${currency ? currency : ""} ${formatNumber(
                        transformedData.Potential_Sales_Loss_value
                      )}`,
                  formatNumber(
                    transformedData.potential_stock_wastage_value
                  ) === "0" ||
                  formatNumber(
                    transformedData.potential_stock_wastage_value
                  ) === undefined
                    ? formatNumber(
                        transformedData.potential_stock_wastage_value
                      )
                    : `${currency ? currency : ""} ${formatNumber(
                        transformedData.potential_stock_wastage_value
                      )}`,
                ]
              : [
                  formatNumber(transformedData.Potential_Sales_Loss_value) ===
                    "0" ||
                  formatNumber(transformedData.Potential_Sales_Loss_value) ===
                    undefined
                    ? formatNumber(transformedData.Potential_Sales_Loss_value)
                    : `${currency ? currency : ""} ${formatNumber(
                        transformedData.Potential_Sales_Loss_value
                      )}`,
                ],
          dimension: "Potential sales loss",
          metric1title: "Lost Sales (units)",
          metric1: `${formatNumber(transformedData.Potential_Sales_Loss)}`,
          metric2title: "Current Growth Rate",
          metric2: `${formatNumber(transformedData["Current_Growth%"])}`,
          metric3title: "YoY Growth Rate",
          metric3: `${formatToPercent(transformedData["YOY_Growth%"])}`,
        },
      ];
    default:
      return [];
  }
};

export const demandForecastingCards = (transformedData, DataSet) => {
  if (transformedData.isNew)
    return [
      {
        icon: DataSet,
        title: "Forecast",
        type: "n-metrics",
        metric1title: "Predicted demand",
        metric1: formatNumber(transformedData.predicted_sales_f),
        subMetric1:
          formatNumber(transformedData.predicted_sales_f_value) === "0"
            ? null
            : `${
                transformedData.currency ? transformedData.currency : ""
              } ${formatNumber(transformedData.predicted_sales_f_value)}`,
        metric2title: "Accuracy",
        metric2: formatToPercent(transformedData.accuracy),
        metric3title: "Bias",
        metric3: formatToPercent(transformedData.bias),
        // metric2: "0",
        bottomMetricTitle: "Forecast Per Day",
        bottomMetric: formatNumber(transformedData.Forecast_Per_Day),
      },
      {
        icon: DataSet,
        title: "Historical Sales",
        type: "n-metrics",
        metric1title: "30 days",
        metric1: formatNumber(transformedData.sales_last30days),
        subMetric1:
          formatNumber(transformedData.sales_value_last30days) === "0"
            ? null
            : `${
                transformedData.currency ? transformedData.currency : ""
              } ${formatNumber(transformedData.sales_value_last30days)}`,
        metric2title: "60 days",
        metric2: formatNumber(transformedData.sales_last60days),
        subMetric2:
          formatNumber(transformedData.sales_value_last60days) === "0"
            ? null
            : `${
                transformedData.currency ? transformedData.currency : ""
              } ${formatNumber(transformedData.sales_value_last60days)}`,
        metric3title: "90 days",
        metric3: formatNumber(transformedData.sales_last90days),
        subMetric3:
          formatNumber(transformedData.sales_value_last90days) === "0"
            ? null
            : `${
                transformedData.currency ? transformedData.currency : ""
              } ${formatNumber(transformedData.sales_value_last90days)}`,

        // metric2: "0",
        bottomMetricTitle: "Sales Per Day",
        bottomMetric: formatNumber(transformedData.Sales_Per_Day),
      },
      {
        icon: DataSet,
        title: "Growth",
        type: "n-metrics",
        metric2title: "Current Growth",
        metric2:
          formatToPercent(transformedData.currentGrowth)[0] !== "-"
            ? `+ ${formatToPercent(
                formatToPercent(transformedData.currentGrowth)
              )}`
            : formatToPercent(transformedData.currentGrowth),
        metric1title: "Year-On-Year Change",
        metric1:
          formatToPercent(transformedData.yoy)[0] !== "-"
            ? `+ ${formatToPercent(formatToPercent(transformedData.yoy))}`
            : formatToPercent(transformedData.yoy),
        bottomMetricTitle: transformedData.new_lastCardBottomMetricTitle,
        bottomMetric: transformedData.new_lastCardBottomMetric,
      },
    ];
  return [
    {
      icon: DataSet,
      title: "Model Performance",
      type: "n-metrics",
      metric1title: "Overall Accuracy",
      metric1: formatToPercent(transformedData.overall_accuracy),
      metric2title: "Forecast Level Accuracy",
      metric2: formatToPercent(transformedData.accuracy),
      metric3title: "Bias",
      metric3: formatToPercent(transformedData.bias),
      bottomMetricTitle: "Validation Period",
      bottomMetric: transformedData.Validation_Period,
      lables: [
        {
          label: "Overall Accuracy ⇢",
          key: formatToPercent(transformedData.overall_accuracy),
        },
        {
          label: "Forecast Level Accuracy ⇢",
          key: formatToPercent(transformedData.accuracy),
        },
        { label: "Bias ⇢", key: formatToPercent(transformedData.bias) },
      ],
    },
    {
      icon: DataSet,
      title: "Predicted Growth Rate",
      type: "n-metrics",
      metric2title: "Current Growth",
      metric2:
        formatToPercent(transformedData.currentGrowth)[0] !== "-"
          ? `+ ${formatToPercent(
              formatToPercent(transformedData.currentGrowth)
            )}`
          : formatToPercent(transformedData.currentGrowth),
      metric1title: "Year-On-Year Change",
      metric1:
        formatToPercent(transformedData.yoy)[0] !== "-"
          ? `+ ${formatToPercent(formatToPercent(transformedData.yoy))}`
          : formatToPercent(transformedData.yoy),
      bottomMetricTitle: "Forecast Horizon",
      bottomMetric: transformedData.Forecast_Period,
    },
    {
      icon: DataSet,
      title: "Predicted demand",
      type: "n-metrics",
      metric1title: "Demand Units",
      metric1: formatNumber(transformedData.predicted_sales_f),
      metric2title: "Demand Value",
      metric2:
        formatNumber(transformedData.predicted_sales_f_value) === "0"
          ? null
          : `${
              transformedData.currency ? transformedData.currency : ""
            } ${formatNumber(transformedData.predicted_sales_f_value)}`,
      // metric2: "0",
      bottomMetricTitle: transformedData.lastCardBottomMetricTitle,
      bottomMetric: transformedData.lastCardBottomMetric,
    },
  ];
};
export const PriceOptimizationCards = (transformedData) => {
  if (transformedData.isNew) {
    if (transformedData.isTactical) {
      return [
        {
          title: "Elasticity",
          type: "n-metrics",
          metric1title: "by Combination",
          metric1: formatToPercent(transformedData.by_combinations * 100),
          // subMetric1: `$ ${formatNumber(transformedData.sales_value_last30days)}`,
          metric2title: "by Units",
          metric2: formatToPercent(transformedData.by_units * 100),
          // subMetric2: `$ ${formatNumber(transformedData.sales_value_last60days)}`,
          metric3title: "by Value",
          metric3: formatToPercent(transformedData.by_value * 100),
        },
        {
          title: "Strategic Growth",
          type: "n-metrics",
          metric1title: "Forecast Per Day",
          metric1:
            formatToPercent(transformedData.strategic_FPD * 100)[0] !== "-"
              ? `+ ${formatToPercent(
                  formatToPercent(transformedData.strategic_FPD * 100)
                )}`
              : formatToPercent(transformedData.strategic_FPD * 100),
          // subMetric1: `$ ${formatNumber(transformedData.sales_value_last30days)}`,
          metric2title: "Margin",
          metric2:
            formatToPercent(transformedData.strategic_Margin * 100)[0] !== "-"
              ? `+ ${formatToPercent(
                  formatToPercent(transformedData.strategic_Margin * 100)
                )}`
              : formatToPercent(transformedData.strategic_Margin * 100),
          // subMetric2: `$ ${formatNumber(transformedData.sales_value_last60days)}`,
          metric3title: "Revenue",
          metric3:
            formatToPercent(transformedData.strategic_Revenue * 100)[0] !== "-"
              ? `+ ${formatToPercent(
                  formatToPercent(transformedData.strategic_Revenue * 100)
                )}`
              : formatToPercent(transformedData.strategic_Revenue * 100),
        },
        {
          title: "Tactical Growth",
          type: "n-metrics",
          metric1title: "Forecast Per Day",
          metric1:
            formatToPercent(transformedData.tactical_FPD * 100)[0] !== "-"
              ? `+ ${formatToPercent(
                  formatToPercent(transformedData.tactical_FPD * 100)
                )}`
              : formatToPercent(transformedData.tactical_FPD * 100),
          // subMetric1: `$ ${formatNumber(transformedData.sales_value_last30days)}`,
          metric2title: "Margin",
          metric2:
            formatToPercent(transformedData.tactical_Margin * 100)[0] !== "-"
              ? `+ ${formatToPercent(
                  formatToPercent(transformedData.tactical_Margin * 100)
                )}`
              : formatToPercent(transformedData.tactical_Margin * 100),
          // subMetric2: `$ ${formatNumber(transformedData.sales_value_last60days)}`,
          metric3title: "Revenue",
          metric3:
            formatToPercent(transformedData.tactical_Revenue * 100)[0] !== "-"
              ? `+ ${formatToPercent(
                  formatToPercent(transformedData.tactical_Revenue * 100)
                )}`
              : formatToPercent(transformedData.tactical_Revenue * 100),
        },
      ];
    } else {
      return [
        {
          title: "Elasticity",
          type: "n-metrics",
          metric1title: "by Combination",
          metric1: formatToPercent(transformedData.by_combinations * 100),
          // subMetric1: `$ ${formatNumber(transformedData.sales_value_last30days)}`,
          metric2title: "by Units",
          metric2: formatToPercent(transformedData.by_units * 100),
          // subMetric2: `$ ${formatNumber(transformedData.sales_value_last60days)}`,
          metric3title: "by Value",
          metric3: formatToPercent(transformedData.by_value * 100),
        },
        {
          title: "Strategic Growth",
          type: "n-metrics",
          metric1title: "Forecast Per Day",
          metric1:
            formatToPercent(transformedData.strategic_FPD * 100)[0] !== "-"
              ? `+ ${formatToPercent(
                  formatToPercent(transformedData.strategic_FPD * 100)
                )}`
              : formatToPercent(transformedData.strategic_FPD * 100),
          // subMetric1: `$ ${formatNumber(transformedData.sales_value_last30days)}`,
          metric2title: "Margin",
          metric2:
            formatToPercent(transformedData.strategic_Margin * 100)[0] !== "-"
              ? `+ ${formatToPercent(
                  formatToPercent(transformedData.strategic_Margin * 100)
                )}`
              : formatToPercent(transformedData.strategic_Margin * 100),
          // subMetric2: `$ ${formatNumber(transformedData.sales_value_last60days)}`,
          metric3title: "Revenue",
          metric3:
            formatToPercent(transformedData.strategic_Revenue * 100)[0] !== "-"
              ? `+ ${formatToPercent(
                  formatToPercent(transformedData.strategic_Revenue * 100)
                )}`
              : formatToPercent(transformedData.strategic_Revenue * 100),
        },
      ];
    }
  }

  return [];
};
