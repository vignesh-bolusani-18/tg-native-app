export const getColumnKey = (Type) => {
  const dictionary = {
    "ML Forecast": "ml_forecast",
    "Upper Bound": "pred_upper_bound_range",
    "Lower Bound": "pred_lower_bound_range",
    "Offset": "offset_forecast",
    P10: "P10",
    P20: "P20",
    P30: "P30",
    P40: "P40",
    P50: "P50",
    P60: "P60",
    P70: "P70",
    P80: "P80",
    P90: "P90",
    P99: "P99",
  };

  return dictionary[Type] || null;
};