// import useConfig from "../../hooks/useConfig";
import MLAdvancedSettings from "../../pages/main/ExperimentFlow/CreateExperimentPage/AdvancedSettings/MLAdvancedSettings";
import { mlAdvancedSettingsGroups } from "./AdvancedSettingsGroups";

const modelsArray = [
  "Lgbm",
  "Xgboost",
  "Xgblinear",
  "RandomForest",
  "MLP",
  "LSTM",
  "GRU",
];
const featuresArray = [
  "regressor",
  "target_encoded",
  "label_encoded",
  "text_encoded",
  "holiday",
  "holiday_US",
  "holiday_CA",
  "datetime",
  "sinusoidal",
  "offset",
  "lagged",
  "driver",
  "exogenous_features",
  "linear_regression", 
  "expanding_mean"
];
const clustersArray = ["A", "B", "C"];
const numericArray = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

const kBestCandidatesMaxRange = 5000;
const kBestCandidatesMinRange = 0;
const candidatesMaxRange = 5000;
const candidatesMinRange = 0;
const percentageMaxRange = 100;
const percentageMinRange = 0;
export const getAdvanceSettingsBucket = (
  moduleName,
  taggedColumns,
  driverColumns,
  ts_id_columns,
  config
) => {
  //   const { allColumns, categoricalColumns, configState } = useConfig();
  //   const nonUniquegroupsArray = ["cluster"]
  //     .concat(configState.scenario_plan.post_model_demand_pattern.dimensions)
  //     .concat(configState.data.ts_id_columns);
  const dimensionOptions = ["cluster"];

  const FeatureGroup = mlAdvancedSettingsGroups(
    dimensionOptions,
    modelsArray,
    featuresArray,
    clustersArray,
    numericArray,
    driverColumns,
    kBestCandidatesMaxRange,
    kBestCandidatesMinRange,
    candidatesMaxRange,
    candidatesMinRange,
    percentageMaxRange,
    percentageMinRange,
    taggedColumns,
    ts_id_columns,
    config
  );

  let allBuckets = {
    MS: {
      title: "ML Settings",
      description: "ML Settings Description",
      isHyperParamTab: false,
      featureGroups: {
        MLA: FeatureGroup.MLAS,
        AFS: FeatureGroup.FS,
        MLO: FeatureGroup.MLO,
      },
    },

    AS: {
      title: "Adjustment Settings",
      description: "Adjustment Settings Description",
      isHyperParamTab: false,
      featureGroups: {
        APE: FeatureGroup.APE,
        APA: FeatureGroup.PA,
        AEF: FeatureGroup.EF,
      },
    },

    HP: {
      title: "HyperParameters Settings",
      description: "Hyper Parameters Description",
      isHyperParamTab: true,
      featureGroups: {
        XGB: FeatureGroup.XGB,
        LGBM: FeatureGroup.LGBM,
        XGBL: FeatureGroup.XGBL,
        RF: FeatureGroup.RF,
        MLP: FeatureGroup.MLP,
        LSTM: FeatureGroup.LSTM,
        GRU: FeatureGroup.GRU,
      },
    },

    DS: {
      title: "Dashboard Settings",
      description: "Dashboard Settings Description",
      isHyperParamTab: false,
      featureGroups: {
        GS: FeatureGroup.GS,
        SNOP: FeatureGroup.SNOP,
        CD: FeatureGroup.CD,
        FRS: FeatureGroup.FRS,
      },
    },
    AGS: {
      title: "Agent Settings",
      description: "Agent Settings Description",
      isHyperParamTab: false,
      featureGroups: {
        FEAS: FeatureGroup.FEAS,
        AHS: FeatureGroup.AHS,
      },
    },
  };

  switch (moduleName) {
    case "demand-planning":
      return {
        MS: allBuckets.MS,
        HP: allBuckets.HP,
        AGS: allBuckets.AGS,
        AS: allBuckets.AS,
        DS: allBuckets.DS,
      };
    case "supply_chain":
      return {
        MS: allBuckets.MS,
        HP: allBuckets.HP,
        AGS: allBuckets.AGS,
        AS: allBuckets.AS,
        DS: allBuckets.DS,
      };
    case "inventory-optimization":
      return {
        MS: allBuckets.MS,
        HP: allBuckets.HP,
        AGS: allBuckets.AGS,
        AS: allBuckets.AS,
        DS: allBuckets.DS,
      };
    case "replenishment":
      return {
        MS: allBuckets.MS,
        HP: allBuckets.HP,
        AGS: allBuckets.AGS,
        AS: allBuckets.AS,
        DS: allBuckets.DS,
      };
    case "pricing-promotion-optimization":
      return {
        MS: allBuckets.MS,
        HP: allBuckets.HP,
        AGS: allBuckets.AGS,
        AS: allBuckets.AS,
        DS: allBuckets.DS,
      };
    case "advanced-planning-system":
      return {
        MS: allBuckets.MS,
        HP: allBuckets.HP,
        AGS: allBuckets.AGS,
        AS: allBuckets.AS,
        DS: allBuckets.DS,
      };
    case "assortment-planning":
      return {
        MS: allBuckets.MS,
        HP: allBuckets.HP,
        AGS: allBuckets.AGS,
        AS: allBuckets.AS,
        DS: allBuckets.DS,
      };

    default:
      break;
  }

  return;
};
