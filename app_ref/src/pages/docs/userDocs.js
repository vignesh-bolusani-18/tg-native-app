// Your original guideData with only fieldPath identifiers added
export const guideData = {
  1: {
    title: "Background",
    items: [
      {
        id: "1.1",
        title: "Introduction",
        description: "Overview of TrueGradient's product features and functions",
        tags: ["overview", "introduction"],
        content: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                content:
                  "This is a living document about the features and functions of TrueGradient's product. This is supposed to be an asset for the user community.",
              },
            ],
          },
        ],
      },
    ],
  },
  2: {
    title: "Experiment (Self-Serve)",
    items: [
      {
        id: "2.1",
        title: "Demand Planning",
        description: "AI-powered demand forecasting using Neural Engine",
        tags: ["demand", "forecasting", "AI", "machine learning"],
        content: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                content:
                  "Demand Forecasting enabled by AI Neural Engine (Ensemble of Deep Learning + Machine Learning + Econometrics) that extracts maximum predictability out of the data. The engine leverages several data elements, and considers various demand drivers such as promotions, festive season, holidays, events etc. to generate the most accurate forecast.",
              },
            ],
          },
          {
            type: "image",
            src: "/docImages/doc_demand_planning.webp",
            alt: "Demand Planning Overview",
          },
        ],
        subitems: [
          {
            id: "2.1.1",
            title: "Add data",
            description: "Configure datasets for demand planning",
            content: [
              {
                type: "heading",
                level: 2,
                children: [
                  {
                    type: "text",
                    content: "a. Add Sales / Transaction Dataset",
                  },
                ],
              },
              {
                type: "paragraph",
                children: [
                  {
                    type: "text",
                    content:
                      "This is key dataset which has historical sales data or customer purchases. Select the respective dataset and fill the tags.",
                  },
                ],
              },
              {
                type: "image",
                src: "/docImages/doc_add_data.png",
                alt: "Sales Dataset Configuration",
              },
              {
                type: "heading",
                level: 3,
                children: [
                  {
                    type: "text",
                    content: "Tagging Sales Data",
                  },
                ],
              },
              {
                type: "table",
                headers: [
                  {
                    children: [{ type: "text", content: "Field" }],
                  },
                  {
                    children: [{ type: "text", content: "Description" }],
                  },
                  {
                    children: [{ type: "text", content: "Required" }],
                  },
                ],
                rows: [
                  [
                    {
                      children: [{ type: "bold", children: [{ type: "text", content: "Date Format" }] }],
                    },
                    {
                      children: [{ type: "text", content: "Select the date format as per the sales data." }],
                      fieldPath: "data.date_format",
                    },
                    {
                      children: [{ type: "text", content: "Mandatory" }],
                    },
                  ],
                  [
                    {
                      children: [{ type: "bold", children: [{ type: "text", content: "Date" }] }],
                    },
                    {
                      children: [{ type: "text", content: "Select the date column in sales data." }],
                      fieldPath: "data.date_column",
                    },
                    {
                      children: [{ type: "text", content: "Mandatory" }],
                    },
                  ],
                  [
                    {
                      children: [{ type: "bold", children: [{ type: "text", content: "Target" }] }],
                    },
                    {
                      children: [{ type: "text", content: "Select the column to predict." }],
                      fieldPath: "data.target_column",
                    },
                    {
                      children: [{ type: "text", content: "Mandatory" }],
                    },
                  ],
                  [
                    {
                      children: [{ type: "bold", children: [{ type: "text", content: "Granularity" }] }],
                    },
                    {
                      children: [
                        {
                          type: "text",
                          content: "Set of granular features which defines the level at which forecasts need to done.",
                        },
                      ],
                      fieldPath: "data.ts_id_columns",
                    },
                    {
                      children: [{ type: "text", content: "Mandatory" }],
                    },
                  ],
                  [
                    {
                      children: [{ type: "bold", children: [{ type: "text", content: "Driver" }] }],
                    },
                    {
                      children: [{ type: "text", content: "Features which can impact / drive forecasts." }],
                      fieldPath: "data.driver_columns",
                    },
                    {
                      children: [{ type: "text", content: "Optional" }],
                    },
                  ],
                  [
                    {
                      children: [{ type: "bold", children: [{ type: "text", content: "Optimization Field" }] }],
                    },
                    {
                      children: [{ type: "text", content: "Feature which needs to be optimised." }],
                      fieldPath: "data.optimization_field",
                    },
                    {
                      children: [{ type: "text", content: "Optional" }],
                    },
                  ],
                  [
                    {
                      children: [
                        { type: "bold", children: [{ type: "text", content: "Other Interesting Dimensions" }] },
                      ],
                    },
                    {
                      children: [
                        {
                          type: "text",
                          content:
                            "Fields which you want to be added in the dashboard. Please note that the granularity of these features should be higher than model granularity.",
                        },
                      ],
                      fieldPath: "data.other_dimensions",
                    },
                    {
                      children: [{ type: "text", content: "Optional" }],
                    },
                  ],
                  [
                    {
                      children: [{ type: "bold", children: [{ type: "text", content: "Returns" }] }],
                    },
                    {
                      children: [{ type: "text", content: "Field which has returns quantity." }],
                      fieldPath: "data.returns_column",
                    },
                    {
                      children: [{ type: "text", content: "Optional" }],
                    },
                  ],
                ],
              },
              {
                type: "callout",
                variant: "info",
                children: [
                  {
                    type: "bold",
                    children: [{ type: "text", content: "Example:" }],
                  },
                  {
                    type: "text",
                    content:
                      " You cannot put SKU granularity here if you are predicting at category level but vice versa is applicable.",
                  },
                ],
              },
              {
                type: "paragraph",
                children: [
                  {
                    type: "bold",
                    children: [{ type: "text", content: "Field type and aggregation method panel:" }],
                  },
                  {
                    type: "text",
                    content:
                      " Default aggregation method is 'sum' for numerical and 'max' for categorical. Change it as per the feature if needed. Example - method will be 'mean' for price feature as you cannot sum the price.",
                  },
                ],
              },
              {
                type: "heading",
                level: 2,
                children: [
                  {
                    type: "text",
                    content: "b. Add Additional Features",
                  },
                ],
              },
              {
                type: "paragraph",
                children: [
                  {
                    type: "text",
                    content:
                      "Add more datasets such as promotions, price, item master etc. These additional features help in improving prediction accuracy. Metrics such as forecast accuracy and bias.",
                  },
                ],
              },
              {
                type: "heading",
                level: 3,
                children: [
                  {
                    type: "text",
                    content: "Tagging Additional Data",
                  },
                ],
              },
              {
                type: "paragraph",
                children: [
                  {
                    type: "text",
                    content: "Tagging approach is similar to previous section.",
                  },
                ],
              },
              {
                type: "image",
                src: "/docImages/doc_additional_data.png",
                alt: "Additional Features Configuration",
              },
            ],
          },
          {
            id: "2.1.2",
            title: "Add joins",
            description: "Configure dataset relationships",
            content: [
              {
                type: "paragraph",
                children: [
                  {
                    type: "text",
                    content:
                      "Mention the columns to join with different datasets. All the joins will be left joined with the sales data.",
                  },
                ],
              },
              {
                type: "image",
                src: "/docImages/doc_add_joins.png",
                alt: "Join Configuration",
              },
              {
                type: "paragraph",
                children: [
                  {
                    type: "text",
                    content:
                      "Joining operation is left join with the sales data. Join the datasets based on the relationship to be created.",
                  },
                ],
              },
            ],
          },
          {
            id: "2.1.3",
            title: "Add Context",
            description: "Configure business-specific parameters",
            content: [
              {
                type: "paragraph",
                children: [
                  {
                    type: "text",
                    content:
                      "Context means adding details or parameters specific to your business requirement. Example – forecasting parameter, granularity, business constraints, etc.",
                  },
                ],
              },
              {
                type: "heading",
                level: 2,
                children: [
                  {
                    type: "text",
                    content: "a. Forecasting Details",
                  },
                ],
              },
              {
                type: "paragraph",
                children: [
                  {
                    type: "text",
                    content:
                      "Add details of forecasting parameters such as granularity for forecasting, forecast horizon etc.",
                  },
                ],
              },
              {
                type: "heading",
                level: 3,
                children: [
                  {
                    type: "text",
                    content: "I. Forecasting Parameters",
                  },
                ],
              },
              {
                type: "image",
                src: "/docImages/doc_forecast_parameter.png",
                alt: "Forecasting Parameters",
              },
              {
                type: "table",
                headers: [
                  {
                    children: [{ type: "text", content: "Parameter" }],
                  },
                  {
                    children: [{ type: "text", content: "Description" }],
                  },
                  {
                    children: [{ type: "text", content: "Required" }],
                  },
                ],
                rows: [
                  [
                    {
                      children: [{ type: "bold", children: [{ type: "text", content: "Select a date" }] }],
                    },
                    {
                      children: [
                        {
                          type: "text",
                          content: "Forecast start date, this is date from which forecast will be generated.",
                        },
                      ],
                      fieldPath: "etl.activity_end_date",
                    },
                    {
                      children: [{ type: "text", content: "Mandatory" }],
                    },
                  ],
                  [
                    {
                      children: [{ type: "bold", children: [{ type: "text", content: "History Since (Days)" }] }],
                    },
                    {
                      children: [{ type: "text", content: "Number of days for which historical data is available." }],
                      fieldPath: "etl.history",
                    },
                    {
                      children: [{ type: "text", content: "Mandatory" }],
                    },
                  ],
                  [
                    {
                      children: [{ type: "bold", children: [{ type: "text", content: "Active Since Days" }] }],
                    },
                    {
                      children: [
                        {
                          type: "text",
                          content:
                            "Help select only active SKUs. E.g. 180 days represents the items which are sold in last 180 days.",
                        },
                      ],
                      fieldPath: "etl.activity_period",
                    },
                    {
                      children: [{ type: "text", content: "Optional" }],
                    },
                  ],
                  [
                    {
                      children: [{ type: "bold", children: [{ type: "text", content: "Time Granularity" }] }],
                    },
                    {
                      children: [
                        { type: "text", content: "Level at which you want to forecast. E.g. weekly, monthly etc." },
                      ],
                      fieldPath: "data.frequency",
                    },
                    {
                      children: [{ type: "text", content: "Mandatory" }],
                    },
                  ],
                  [
                    {
                      children: [{ type: "bold", children: [{ type: "text", content: "Forecast Horizon" }] }],
                    },
                    {
                      children: [{ type: "text", content: "Time horizon for which forecasts need to be generated." }],
                      fieldPath: "data.forecast_horizon",
                    },
                    {
                      children: [{ type: "text", content: "Mandatory" }],
                    },
                  ],
                  [
                    {
                      children: [{ type: "bold", children: [{ type: "text", content: "Historical Reference Date" }] }],
                    },
                    {
                      children: [
                        {
                          type: "text",
                          content: "If forecast start date is back in time, then select True else False.",
                        },
                      ],
                      fieldPath: "scenario_plan.historical_reference_date",
                    },
                    {
                      children: [{ type: "text", content: "Optional" }],
                    },
                  ],
                ],
              },
            ],
          },
        ],
      },
      {
        id: "2.2",
        title: "Inventory Planning",
        description: "Cost-optimal inventory optimization",
        tags: ["inventory", "optimization", "safety stock"],
        content: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                content:
                  "Inventory optimization model leverages a variety of data to compute cost optimal re-order quantity, ideal inventory and safety stock.",
              },
            ],
          },
          {
            type: "image",
            src: "/docImages/doc_inventory_planning.png",
            alt: "Inventory Planning Overview",
          },
        ],
        subitems: [
          {
            id: "2.2.1",
            title: "Add Inventory Dataset",
            description: "Configure inventory data sources",
            content: [
              {
                type: "heading",
                level: 2,
                children: [
                  {
                    type: "text",
                    content: "Tagging Inventory data",
                  },
                ],
              },
              {
                type: "image",
                src: "/docImages/doc_add_inventory_dataset.png",
                alt: "Inventory Dataset Configuration",
              },
              {
                type: "table",
                headers: [
                  {
                    children: [{ type: "text", content: "Field" }],
                  },
                  {
                    children: [{ type: "text", content: "Description" }],
                  },
                  {
                    children: [{ type: "text", content: "Required" }],
                  },
                ],
                rows: [
                  [
                    {
                      children: [{ type: "bold", children: [{ type: "text", content: "Granularity" }] }],
                    },
                    {
                      children: [
                        {
                          type: "text",
                          content:
                            "Set of granular features to define the level at which inventory optimization needs to be performed.",
                        },
                      ],
                      fieldPath: "inventory.granularity",
                    },
                    {
                      children: [{ type: "text", content: "Mandatory" }],
                    },
                  ],
                  [
                    {
                      children: [{ type: "bold", children: [{ type: "text", content: "Inventory" }] }],
                    },
                    {
                      children: [{ type: "text", content: "Field which has stock on Hand (SOH) value." }],
                      fieldPath: "inventory.stock_on_hand",
                    },
                    {
                      children: [{ type: "text", content: "Mandatory" }],
                    },
                  ],
                  [
                    {
                      children: [{ type: "bold", children: [{ type: "text", content: "Date" }] }],
                    },
                    {
                      children: [{ type: "text", content: "Date field (if exists)." }],
                      fieldPath: "inventory.date_field",
                    },
                    {
                      children: [{ type: "text", content: "Optional" }],
                    },
                  ],
                  [
                    {
                      children: [{ type: "bold", children: [{ type: "text", content: "Replenishment Constraints" }] }],
                    },
                    {
                      children: [
                        { type: "text", content: "Select columns which consist of replenishment constraints data." },
                      ],
                      fieldPath: "inventory.replenishment_constraints",
                    },
                    {
                      children: [{ type: "text", content: "Optional" }],
                    },
                  ],
                  [
                    {
                      children: [{ type: "bold", children: [{ type: "text", content: "Batch Id" }] }],
                    },
                    {
                      children: [
                        {
                          type: "text",
                          content: "Select column with Batch Id, if POs are delivered in tranches/batches.",
                        },
                      ],
                      fieldPath: "inventory.batch_id",
                    },
                    {
                      children: [{ type: "text", content: "Optional" }],
                    },
                  ],
                ],
              },
              {
                type: "paragraph",
                children: [
                  {
                    type: "bold",
                    children: [{ type: "text", content: "Field type and aggregation method panel:" }],
                  },
                  {
                    type: "text",
                    content:
                      " Default aggregation method is 'sum' for numerical and 'max' for categorical. Change it as per the feature if needed.",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  3: {
    title: "Dashboard",
    items: [
      {
        id: "3.1",
        title: "Executive View",
        description: "Summary view for executives and leadership",
        tags: ["executive", "summary", "metrics"],
        content: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                content:
                  "Summary view for executives and leadership. It covers demand, inventory and growth metrics at all level of product and location hierarchy.",
              },
            ],
          },
          {
            type: "image",
            src: "/docImages/doc_dashboard.png",
            alt: "Executive Dashboard",
          },
          {
            type: "table",
            headers: [
              {
                children: [{ type: "text", content: "Metric" }],
              },
              {
                children: [{ type: "text", content: "Description" }],
              },
            ],
            rows: [
              [
                {
                  children: [{ type: "bold", children: [{ type: "text", content: "Dimension" }] }],
                },
                {
                  children: [{ type: "text", content: "Select dimension / level." }],
                  fieldPath: "dashboard.dimension",
                },
              ],
              [
                {
                  children: [{ type: "bold", children: [{ type: "text", content: "Value" }] }],
                },
                {
                  children: [{ type: "text", content: "Select Value." }],
                  fieldPath: "dashboard.value",
                },
              ],
              [
                {
                  children: [{ type: "bold", children: [{ type: "text", content: "Predicted demand" }] }],
                },
                {
                  children: [{ type: "text", content: "Total demand predicted for the defined forecast horizon." }],
                  fieldPath: "dashboard.predicted_demand",
                },
              ],
              [
                {
                  children: [{ type: "bold", children: [{ type: "text", content: "Total Combinations" }] }],
                },
                {
                  children: [{ type: "text", content: "Number of product and locations." }],
                  fieldPath: "dashboard.total_combinations",
                },
              ],
              [
                {
                  children: [{ type: "bold", children: [{ type: "text", content: "Horizon" }] }],
                },
                {
                  children: [{ type: "text", content: "Forecasting period." }],
                  fieldPath: "dashboard.horizon",
                },
              ],
              [
                {
                  children: [{ type: "bold", children: [{ type: "text", content: "Accuracy" }] }],
                },
                {
                  children: [
                    {
                      type: "text",
                      content: "Accuracy at the most granular level. (1- (sum of absolute error/ sum of actuals)).",
                    },
                  ],
                  fieldPath: "dashboard.accuracy",
                },
              ],
              [
                {
                  children: [{ type: "bold", children: [{ type: "text", content: "Current Inventory" }] }],
                },
                {
                  children: [{ type: "text", content: "Existing stock on hand." }],
                  fieldPath: "dashboard.current_inventory",
                },
              ],
              [
                {
                  children: [{ type: "bold", children: [{ type: "text", content: "Excess stock" }] }],
                },
                {
                  children: [{ type: "text", content: "Total stock which is in excess out of current inventory." }],
                  fieldPath: "dashboard.excess_stock",
                },
              ],
              [
                {
                  children: [{ type: "bold", children: [{ type: "text", content: "Days of inventory supply" }] }],
                },
                {
                  children: [{ type: "text", content: "Days of inventory covering future demand / forecast" }],
                  fieldPath: "dashboard.days_inventory_supply",
                },
              ],
              [
                {
                  children: [{ type: "bold", children: [{ type: "text", content: "Growth" }] }],
                },
                {
                  children: [
                    { type: "text", content: "Year on year growth rate. (YOY = Forecast/ Same period Last Year)" },
                  ],
                  fieldPath: "dashboard.growth",
                },
              ],
              [
                {
                  children: [{ type: "bold", children: [{ type: "text", content: "MoM Growth rate" }] }],
                },
                {
                  children: [{ type: "text", content: "Month over Month growth rate for all the combinations." }],
                  fieldPath: "dashboard.mom_growth_rate",
                },
              ],
              [
                {
                  children: [{ type: "bold", children: [{ type: "text", content: "Projected lost sales" }] }],
                },
                {
                  children: [{ type: "text", content: "Sales loss due to out of stock situations" }],
                  fieldPath: "dashboard.projected_lost_sales",
                },
              ],
            ],
          },
        ],
      },
    ],
  },
  4: {
    title: "Scenario Planning",
    items: [
      {
        id: "4.1",
        title: "Overview",
        description: "Powerful feature for demand planners to incorporate human intelligence",
        tags: ["scenario", "planning", "human intelligence"],
        content: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                content:
                  "Scenario Planning is a powerful feature that empowers demand planners and teams to incorporate human intelligence and expertise into the forecasting process. By leveraging insights derived from thorough analysis, it enables more informed and strategic decision-making. This feature bridges gaps in the model's knowledge by integrating valuable inputs from qualified individuals, addressing situations where the model may have limited or incomplete information.",
              },
            ],
          },
        ],
      },
    ],
  },
  5: {
    title: "Planning Workbench",
    items: [
      {
        id: "5.1",
        title: "Forecast Enrichment",
        description: "Adjust and enrich forecasted results",
        tags: ["workbench", "enrichment", "adjustments"],
        content: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                content:
                  "Demand planners can utilize this feature to adjust / enrich forecasted results for any category, brand or SKU either by increasing or decreasing the values. This capability allows for greater flexibility and precision in tailoring forecasts to align with business objectives, market trends, or specific insights that may not be fully captured by the model.",
              },
            ],
          },
          {
            type: "heading",
            level: 2,
            children: [
              {
                type: "text",
                content: "Steps to enrich:",
              },
            ],
          },
          {
            type: "numbered-list",
            items: [
              {
                children: [{ type: "text", content: "Select dimension" }],
              },
              {
                children: [{ type: "text", content: "Select Start date" }],
              },
              {
                children: [{ type: "text", content: "Select End date" }],
              },
              {
                children: [{ type: "text", content: "Select Percentage value to Enrich" }],
              },
              {
                children: [{ type: "text", content: "Preview Enrichment" }],
              },
              {
                children: [{ type: "text", content: "If demand shape looks good, Run Scenario Planning." }],
              },
            ],
          },
        ],
      },
      {
        id: "5.2",
        title: "S&OP Report",
        description: "Individual item-level forecast management",
        tags: ["S&OP", "item-level", "forecasts"],
        content: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                content:
                  "This tab enables precise management of individual item-level forecasts, offering enhanced control and visibility. During S&OP planning meetings, teams can leverage this functionality to make informed decisions at the most granular level, ensuring alignment with strategic goals and operational requirements. Enable the edit mode to make changes and run Scenario Planning.",
              },
            ],
          },
        ],
      },
      {
        id: "5.3",
        title: "Production Planning",
        description: "Comprehensive production planning view",
        tags: ["production", "planning", "scenarios"],
        content: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                content:
                  "Production Planning report provides comprehensive view over all key metrics, offering flexibility and adaptability to meet business needs. Each metric is fully editable, enabling teams to make real-time adjustments. Additionally, multiple scenario versions can be created and evaluated, fostering informed decision-making during discussions and strategic planning.",
              },
            ],
          },
        ],
      },
    ],
  },
}
