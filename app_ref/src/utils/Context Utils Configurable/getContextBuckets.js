import { featureGroups } from "./featureGroups";

export const getContextBuckets = (moduleName) => {
  const FeatureGroup = featureGroups();
  let allBuckets = {
    FC: {
      title: "Forecasting Details",
      description: "Forecasting Details Description",
      featureGroups: {
        FD: FeatureGroup.FP,
        FGS: FeatureGroup.FGS,
        OFC: FeatureGroup.OFC,
        NPS: FeatureGroup.NPS,
      },
    },
    IR: {
      title: "Inventory & Replenishment",
      description: "Inventory & Replenishment Description",
      featureGroups: {
        IGP: FeatureGroup.IGP,
        SSC: FeatureGroup.SSC,
        STR: FeatureGroup.STR,
        BLIT: FeatureGroup.BLIT,
        NNO: FeatureGroup.NNO,
        PVS: FeatureGroup.PVS,
        BOMD: FeatureGroup.BOMD,
        BOMSC: FeatureGroup.BOMSC,
      },
    },
    BOMIR: {
      title: "Inventory & Replenishment",
      description: "Inventory & Replenishment Description",
      featureGroups: {
        IGP: FeatureGroup.IGP,
        SSC: FeatureGroup.SSC,
        STR: FeatureGroup.STR,
        BLIT: FeatureGroup.BLIT,
        NNO: FeatureGroup.NNO,
        PVS: FeatureGroup.PVS,
        BOMD: FeatureGroup.BOMD,
        BOMSC: FeatureGroup.BOMSC,
      },
    },
    PP: {
      title: "Price & Promotion",
      description: "Price & Promotion Description",
      featureGroups: { PC: FeatureGroup.PC, PAS: FeatureGroup.PAS },
    },
    PRP: {
      title: "Production Plan",
      description: "Production Plan Description",
      featureGroups: {
        PPP: FeatureGroup.PPP,
        PPC: FeatureGroup.PPC,
        OPPC: FeatureGroup.OPPC,
      },
    },
  };

  switch (moduleName) {
    case "demand-planning":
      return {
        FC: allBuckets.FC,
        //PRP: allBuckets.PRP,
        PP: allBuckets.PP,
      };
    case "supply_chain":
      return {
        FC: allBuckets.FC,
        //PRP: allBuckets.PRP,
        PP: allBuckets.PP,
      };
    case "inventory-optimization":
      return {
        FC: allBuckets.FC,
        IR: allBuckets.IR,
        PRP: allBuckets.PRP,
        PP: allBuckets.PP,
      };
    case "replenishment":
      return {
        FC: allBuckets.FC,
        IR: allBuckets.IR,
        PRP: allBuckets.PRP,
        PP: allBuckets.PP,
      };
    case "pricing-promotion-optimization":
      return {
        FC: allBuckets.FC,
        //PRP: allBuckets.PRP,
        PP: allBuckets.PP,
      };
    case "advanced-planning-system":
      return {
        FC: allBuckets.FC,
        IR: allBuckets.IR,
        //PRP: allBuckets.PRP,
        PP: allBuckets.PP,
      };
    case "assortment-planning":
      return {
        FC: allBuckets.FC,
        IR: allBuckets.IR,
        //PRP: allBuckets.PRP,
        PP: allBuckets.PP,
      };

    default:
      break;
  }
};
