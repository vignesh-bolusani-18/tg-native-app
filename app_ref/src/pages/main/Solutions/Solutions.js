import * as React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Stack,
  Divider,
} from "@mui/material";
import ModuleCard from "../../../components/ModuleCard";
import useAuth from "../../../hooks/useAuth";
import useExperiment from "../../../hooks/useExperiment";
import useModule from "../../../hooks/useModule";
import { oldFlowModules } from "../../../utils/oldFlowModules";

// Centralized use cases for better modularity and reusability
const USE_CASES = {
  SUPPLY_CHAIN: {
    name: "Supply Chain",
    textColor: "#1D4ED8",
    backgroundColor: "#EFF6FF",
  },
  OPTIMIZATION: {
    name: "Optimization",
    textColor: "#059669",
    backgroundColor: "#ECFDF5",
  },
  PERSONALIZATION: {
    name: "Personalization",
    textColor: "#7C3AED",
    backgroundColor: "#F3E8FF",
  },

  TIME_SERIES: {
    name: "Time Series Forecasting",
    textColor: "#1D4ED8",
    backgroundColor: "#EFF6FF",
  },
  CLASSIFICATION: {
    name: "Classification",
    textColor: "#059669",
    backgroundColor: "#ECFDF5",
  },
  MULTI_CLASS: {
    name: "Multi-Class",
    textColor: "#7C3AED",
    backgroundColor: "#F3E8FF",
  },
  REGRESSION: {
    name: "Regression",
    textColor: "#7C3AED",
    backgroundColor: "#F3E8FF",
  },
  COMPUTER_VISION: {
    name: "Computer Vision",
    textColor: "#EA580C",
    backgroundColor: "#FFF7ED",
  },
  NLP: {
    name: "NLP",
    textColor: "#BE185D",
    backgroundColor: "#FDF2F8",
  },
};

const moduleData = [
  {
    category: "Integrated Business Planning (IBP)",
    modules: [
      {
        title: "Demand Planning",
        description:
          "Forecast customer demand using advanced analytics and machine learning to optimize inventory levels and reduce stockouts.",
        moduleName: "demand-planning",
        disabled: false,
        useCase: USE_CASES.SUPPLY_CHAIN,
      },
      {
        title: "Supply Planning",
        description:
          "Optimize inventory levels across multiple locations while minimizing carrying costs and maximizing service levels.",
        moduleName: "inventory-optimization",
        disabled: false,
        useCase: USE_CASES.SUPPLY_CHAIN,
      },
      {
        title: "Promo & Markdown Planning",
        description:
          "Develop optimal pricing strategies and promotional campaigns to maximize revenue and market share.",
        moduleName: "pricing-promotion-optimization",
        disabled: false,
        useCase: USE_CASES.SUPPLY_CHAIN,
      },

      {
        title: "Offer Personalization",
        description:
          "Deliver personalized, contextually relevant offers at the optimal moment to maximize conversion and customer satisfaction.",
        moduleName: "next_best_offer",
        disabled: false,
        useCase: USE_CASES.PERSONALIZATION,
      },

      // {
      //   title: "Customer Propensity Scoring",
      //   description:
      //     "Predict customer likelihood to purchase, churn, or engage using advanced propensity modeling techniques.",
      //   moduleName: "customer_propensity",
      //   disabled: true,
      //   useCase: USE_CASES.PERSONALIZATION,
      // },
      // {
      //   title: "Customer Churn Prevention",
      //   description:
      //     "Identify and re-engage lapsed customers through predictive modeling and targeted intervention strategies.",
      //   moduleName: "customer_propensity",
      //   disabled: true,
      //   useCase: USE_CASES.PERSONALIZATION,
      // },
    ],
  },
  {
    category: "AutoML Studio",
    modules: [
      {
        title: "Regression",
        description:
          "Predict continuous numerical values using sophisticated regression techniques and ensemble methods.",
        moduleName: "regression",
        disabled: false,
        useCase: USE_CASES.REGRESSION,
      },
      {
        title: "Binary Classification",
        description:
          "Build models to classify data into two categories with automated feature engineering and model selection.",
        moduleName: "binary_classification",
        disabled: false,
        useCase: USE_CASES.CLASSIFICATION,
      },
      {
        title: "Time Series Forecasting",
        description:
          "Forecast future trends and patterns in time-based data using specialized forecasting algorithms.",
        moduleName: "demand-planning",
        disabled: false,
        useCase: USE_CASES.TIME_SERIES,
      },
      {
        title: "Propensity Prediction",
        description:
          "Predict customer likelihood to purchase, churn, or engage using advanced propensity modeling techniques.",
        moduleName: "next_best_action",
        disabled: false,
        useCase: USE_CASES.PERSONALIZATION,
      },
      {
        title: "Assortment Optimization",
        description:
          "Select the right product mix for each location based on customer preferences and market dynamics.",
        moduleName: "assortment-planning",
        disabled: true,
        useCase: USE_CASES.SUPPLY_CHAIN,
      },
      {
        title: "Multiclass Classification",
        description:
          "Create models for categorizing data into multiple classes using advanced machine learning algorithms.",
        moduleName: "multiclass-classification",
        disabled: true,
        useCase: USE_CASES.CLASSIFICATION,
      },

      {
        title: "Image Processing",
        description:
          "Analyze and process images using computer vision and deep learning techniques.",
        moduleName: "image-processing",
        disabled: true,
        comingSoon: true,
        useCase: {
          name: "Computer Vision",
          textColor: "#EA580C",
          backgroundColor: "#FFF7ED",
        },
      },
      {
        title: "Natural Language Processing",
        description:
          "Extract insights from text data using advanced NLP and language understanding models.",
        moduleName: "natural-language-processing",
        disabled: true,
        comingSoon: true,
        useCase: {
          name: "NLP",
          textColor: "#BE185D",
          backgroundColor: "#FDF2F8",
        },
      },
    ],
  },
];

export default function Solutions() {
  const { createExperiment: createExperimentOld } = useExperiment();
  const { createExperiment: createExperimentNew } = useModule();

  const createExperiment = (moduleName, ...args) => {
    if (oldFlowModules.includes(moduleName)) {
      return createExperimentOld(moduleName, ...args);
    }
    return createExperimentNew(moduleName, ...args);
  };
  const { userInfo } = useAuth();
  const [loadingModule, setLoadingModule] = React.useState(null);

  const handleModuleSelection = async (moduleName, disabled, idx) => {
    if (disabled || loadingModule) return;

    try {
      setLoadingModule(idx);
      console.log("Selected module:", moduleName);
      await createExperiment(moduleName, userInfo.userID);
    } catch (error) {
      console.error("Error creating experiment:", error);
    } finally {
      setLoadingModule(null);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#FFFFFF",
        py: 2,
        padding: "82px 0px 30px 0px",
      }}
    >
      <Container maxWidth="xl">
        {/* Page Header */}

        {/* Module Categories */}
        <Stack spacing={5}>
          {moduleData.map((categoryGroup, categoryIndex) => (
            <Box key={categoryIndex}>
              {/* Category Header */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 3 }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#101828",
                  }}
                >
                  {categoryGroup.category}
                </Typography>
                <Divider
                  sx={{
                    flex: 1,
                    borderColor: "#EAECF0",
                    borderWidth: "1px",
                  }}
                />
              </Stack>

              {/* Module Cards Grid - 4 columns */}
              <Grid container spacing={1}>
                {categoryGroup.modules.map((module, moduleIndex) => {
                  // Create unique index across all categories
                  const uniqueIdx = `${categoryIndex}-${moduleIndex}`;
                  return (
                    <ModuleCard
                      key={moduleIndex}
                      module={module}
                      idx={uniqueIdx}
                      loadingModule={loadingModule}
                      onModuleSelection={handleModuleSelection}
                      gridProps={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                    />
                  );
                })}
              </Grid>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
