export const Price_Optimization_Info = {
  "Price Optimization": {
    Description:
      "Gives the details of the price change promotion and how it affects the sales due to promotion",
    "Important Column Info": {
      ts_id: "Concat of Item Code and Channel",
      "Avg Retail Unit Price":
        "Price at which the item is sold on the channel eg Walmart",
      "promo flag": "flag which tells promotion is active or not",
      "Avg Retail Unit Price_elasticity":
        "Price Elasticity for that item. If multiple channel is selected, then this is avg elasticity",
      "strategic_%price_change": "Price change percentage",
      strategic_price: "Final price after change",
      "lift_%_forecast": "percent change in forecast",
      "lift_%_revenue": "percent change in revenue",
      "lift_%_margin": "percent change in margin",
      funding_column: "funding amount",
      forecast_per_day: "forecast per day before price change",
      strategic_forecast_per_day: "forecast per day after price change",
      strategic_revenue_per_day: "revenue per day after price change",
    },
  },
};
