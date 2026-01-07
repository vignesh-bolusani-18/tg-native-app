import { mlAdvancedSettingsGroups } from "./AdvancedSettingsGroups";

export const getAdvanceSettingsBucket = (moduleName) => {
  //   const { allColumns, categoricalColumns, configState } = useConfig();
  //   const nonUniquegroupsArray = ["cluster"]
  //     .concat(configState.scenario_plan.post_model_demand_pattern.dimensions)
  //     .concat(configState.data.ts_id_columns);

  const FeatureGroup = mlAdvancedSettingsGroups();

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
      title: "HyperParameters Setting",
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
      },
    },
  };

  switch (moduleName) {
    case "demand-planning":
      return {
        MS: allBuckets.MS,
        HP: allBuckets.HP,
        AS: allBuckets.AS,
        DS: allBuckets.DS,
      };
    case "supply_chain":
      return {
        MS: allBuckets.MS,
        HP: allBuckets.HP,
        AS: allBuckets.AS,
        DS: allBuckets.DS,
      };
    case "inventory-optimization":
      return {
        MS: allBuckets.MS,
        HP: allBuckets.HP,
        AS: allBuckets.AS,
        DS: allBuckets.DS,
      };
    case "replenishment":
      return {
        MS: allBuckets.MS,
        HP: allBuckets.HP,
        AS: allBuckets.AS,
        DS: allBuckets.DS,
      };
    case "pricing-promotion-optimization":
      return {
        MS: allBuckets.MS,
        HP: allBuckets.HP,
        AS: allBuckets.AS,
        DS: allBuckets.DS,
      };
    case "advanced-planning-system":
      return {
        MS: allBuckets.MS,
        HP: allBuckets.HP,
        AS: allBuckets.AS,
        DS: allBuckets.DS,
      };
    case "assortment-planning":
      return {
        MS: allBuckets.MS,
        HP: allBuckets.HP,
        AS: allBuckets.AS,
        DS: allBuckets.DS,
      };

    default:
      break;
  }

  return;
};
