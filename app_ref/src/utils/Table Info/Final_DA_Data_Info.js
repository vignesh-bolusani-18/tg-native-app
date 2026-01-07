export const Final_DA_Data_Info = {
  "Final DA Data": {
    "Description": "Gives the details about the various Demand Planning metrics like forecast, sales etc. in terms of units, not monetary value.",
    "Important Column Info": {
      Product_id: "SKU code",
      platform_name: "Retailer where the product sales is recorded",
      "<YYYY-MM-DD> Sales": "Total Sales UNITS for the month",
      "<YYYY-MM-DD> Raw Actual":
        "Total Sales UNITS for the month without any imputations to the values",
      "<YYYY-MM-DD> Consensus Forecast":
        "Total Consensus Forecast UNITS for the month",
      "<YYYY-MM-DD> Locked ML Forecast":
        "Total Locked ML Forecast UNITS for the month.",
      "<YYYY-MM-DD> Forecast": "Forecast UNITS for the month",
      "<YYYY-MM-DD> Lower Bound": "Lower Bound Forecast UNITS for the month",
      "<YYYY-MM-DD> Upper Bound": "Upper Bound Forecast UNITS for the month",
      "<YYYY-MM-DD> ML Forecast": "ML Forecast UNITS for the month",
      "<YYYY-MM-DD> LY Sales": "Last Year Sales UNITS for the month",
      "<YYYY-MM-DD> Offset Forecast": "Offset Forecast UNITS for the month",
      "<YYYY-MM-DD> P10": "P10 Forecast UNITS for the month",
      "<YYYY-MM-DD> P20": "P20 Forecast UNITS for the month",
      "<YYYY-MM-DD> Locked ML Forecast Abs Error":
        "Calculated as abs(Locked ML Forecast UNITS minus Actual Sales UNITS)",
      "<YYYY-MM-DD> Consensus Forecast Abs Error":
        "Calculated as abs(Consensus Forecast UNITS minus Actual Sales UNITS)",
    },
  },
}
