
const changables = ["Cluster", "Forecast_Granularity"];
const dict = { Cluster: "cluster", Forecast_Granularity: "ts_id" };

export const convertDimension = (dimension) => {
  if (changables.includes(dimension)) {
    return dict[dimension];
  }
  return dimension;
};