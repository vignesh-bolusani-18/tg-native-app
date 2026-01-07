import * as React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import {
  Box,
  DialogActions,
  DialogContent,
  Grid,
  Stack,
  Chip,
  Tooltip,
} from "@mui/material";
import useAuth from "../hooks/useAuth";
import CustomButton from "./CustomButton";
import useExperiment from "../hooks/useExperiment";
import useModule from "../hooks/useModule";
import { oldFlowModules } from "../utils/oldFlowModules";
import useConfig from "../hooks/useConfig";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(3),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(2),
  },
  "& .MuiPaper-root": {
    borderRadius: "16px",
    border: "1px solid #EAECF0",
    backgroundColor: theme.palette.background.default,
    height: "90vh",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
  },
}));

// Use Cases (copied from Solutions.js)
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

// Module Data (adapted from Solutions.js - only enabled modules)
const moduleData = [
  {
    id: "ibp",
    category: "Integrated Business Planning",
    shortName: "IBP",
    description: "AI powered Integrated Business Planning",
    modules: [
      {
        title: "Demand Planning",
        description:
          "Forecast customer demand using advanced analytics and machine learning to optimize inventory levels.",
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
          "Deliver personalized, contextually relevant offers at the optimal moment to maximize conversion.",
        moduleName: "next_best_offer",
        disabled: false,
        useCase: USE_CASES.PERSONALIZATION,
      },
    ],
  },
  {
    id: "automl",
    category: "AutoML Studio",
    shortName: "AutoML",
    description:
      "Automated machine learning platform for building and deploying ML models",
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
    ],
  },
];

const ModuleCard = ({ module, onSelect, loading }) => {
  const {setIsArchive, setIsProduction} = useConfig();
  const handleClick = () => {
    setIsArchive(false);
    setIsProduction(false);
    if (!module.disabled && !loading) {
      onSelect(module.moduleName);
    }
  };

  return (
    <Grid item xs={12} sm={6} md={3}>
      <Box
        sx={{
          border: "1px solid #E5E7EB",
          borderRadius: "12px",
          padding: "16px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          cursor: module.disabled ? "not-allowed" : "pointer",
          opacity: module.disabled ? 0.6 : 1,
          transition: "all 0.2s ease-in-out",
          minHeight: "180px",
          "&:hover": {
            ...(module.disabled
              ? {}
              : {
                  boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.1)",
                  transform: "translateY(-2px)",
                  borderColor: "#D1D5DB",
                }),
          },
        }}
        onClick={handleClick}
      >
        <Stack spacing={2} sx={{ height: "100%" }}>
          {/* Title */}
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: "20px",
              color: "#111827",
            }}
          >
            {module.title}
          </Typography>

          {/* Description */}
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "12px",
              fontWeight: 400,
              lineHeight: "16px",
              color: "#6B7280",
              flex: 1,
            }}
          >
            {module.description}
          </Typography>

          {/* Action Button */}
          <Box
            sx={{
              mt: "auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Use Case Tag */}
            <Box>
              <Chip
                label={module.useCase.name}
                size="small"
                sx={{
                  backgroundColor: module.useCase.backgroundColor,
                  color: module.useCase.textColor,
                  fontWeight: 500,
                  fontSize: "11px",
                  height: "22px",
                }}
              />
            </Box>
            {module.disabled ? (
              <Tooltip title="This module is coming soon">
                <span>
                  <CustomButton
                    title="Coming Soon"
                    outlined
                    disabled
                    size="small"
                    sx={{
                      width: "100%",
                      fontSize: "11px",
                      padding: "6px 12px",
                    }}
                  />
                </span>
              </Tooltip>
            ) : (
              <CustomButton
                title={loading ? "Creating..." : "Create"}
                loading={loading}
                outlined
                size="small"
                onClick={handleClick}
                //sx={{ width: "100%", fontSize: "11px", padding: "6px 12px" }}
              />
            )}
          </Box>
        </Stack>
      </Box>
    </Grid>
  );
};

export default function NewExperimentDialog({ open, handleClose }) {
  const { createExperiment: createExperimentOld } = useExperiment();
  const { createExperiment: createExperimentNew } = useModule();
  const { userInfo } = useAuth();
  const [loadingModule, setLoadingModule] = React.useState(null);
  const [selectedTab, setSelectedTab] = React.useState(0);

  const createExperiment = (moduleName, ...args) => {
    if (oldFlowModules.includes(moduleName)) {
      return createExperimentOld(moduleName, ...args);
    }
    return createExperimentNew(moduleName, ...args);
  };

  const handleModuleSelection = async (moduleName) => {
    if (loadingModule) return;

    try {
      setLoadingModule(moduleName);
      await createExperiment(moduleName, userInfo.userID);
      handleClose();
    } catch (error) {
      console.error("Error creating experiment:", error);
    } finally {
      setLoadingModule(null);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const currentCategory = moduleData[selectedTab];

  return (
    <BootstrapDialog
      onClose={handleClose}
      aria-labelledby="new-experiment-dialog-title"
      open={open}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle
        sx={{
          m: 0,
          padding: "24px 32px 16px 32px",
          borderBottom: "1px solid #E5E7EB",
        }}
        id="new-experiment-dialog-title"
      >
        <Typography
          sx={{
            fontFamily: "Inter",
            fontSize: "18px",
            fontWeight: 600,
            lineHeight: "20px",
            color: "#111827",
          }}
        >
          Create New Experiment
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            color: "#9CA3AF",
            padding: "8px",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Category Selection Tabs */}
      <Box sx={{ padding: "8px 8px 0px 8px", backgroundColor: "#EFF6FF" }}>
        <Stack direction="row" spacing={0}>
          {moduleData.map((category, index) => (
            <Box
              key={category.id}
              onClick={() => setSelectedTab(index)}
              sx={{
                flex: 1,
                padding: "14px 20px",
                borderRadius:
                  selectedTab === index ? "12px 12px 0px 0px" : "0px",
                backgroundColor:
                  selectedTab === index ? "#FFFFFF" : "transparent",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                position: "relative",
                zIndex: selectedTab === index ? 3 : 1,
                // Add divider for unselected tabs (except last one and if next tab is not selected)
                ...(selectedTab !== index &&
                  index !== moduleData.length - 1 &&
                  selectedTab !== index + 1 && {
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      right: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "2px",
                      height: "60%",
                      backgroundColor: "rgba(107, 114, 128, 0.3)",
                    },
                  }),
                "&:hover": {
                  backgroundColor:
                    selectedTab === index
                      ? "#FFFFFF"
                      : "rgba(255, 255, 255, 0.5)",
                  borderRadius: "12px 12px 0px 0px",
                  // Hide divider on hover for unselected tabs
                  ...(selectedTab !== index && {
                    "&::after": {
                      opacity: 0,
                    },
                  }),
                },
                "&:first-of-type": {
                  borderRadius:
                    selectedTab === index
                      ? "12px 12px 0px 0px"
                      : "12px 0px 0px 12px",
                  "&:hover": {
                    borderRadius: "12px 12px 0px 0px",
                  },
                },
                "&:last-of-type": {
                  borderRadius:
                    selectedTab === index
                      ? "12px 12px 0px 0px"
                      : "0px 12px 12px 0px",
                  "&:hover": {
                    borderRadius: "12px 12px 0px 0px",
                  },
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: selectedTab === index ? "#0C66E4" : "#6B7280",
                  lineHeight: "20px",
                  textAlign: "center",
                }}
              >
                {category.category}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      <DialogContent
        sx={{
          padding: "8px !important",
          paddingTop: "0px !important",
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#EFF6FF",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#FFFFFF",
            borderRadius:
              selectedTab === 0
                ? "0px 12px 12px 12px"
                : selectedTab === moduleData.length - 1
                ? "12px 0px 12px 12px"
                : "12px 12px 12px 12px",
            padding: "20px",
            marginTop: "0px",
            flex: 1,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Modules Grid */}
          <Grid container spacing={1}>
            {currentCategory.modules
              .filter((module) => !module.disabled)
              .map((module, moduleIndex) => (
                <ModuleCard
                  key={moduleIndex}
                  module={module}
                  onSelect={handleModuleSelection}
                  loading={loadingModule === module.moduleName}
                />
              ))}
          </Grid>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="flex-end"
            sx={{ flex: 1, paddingTop: "8px" }}
            alignItems="flex-end"
          >
            <CustomButton
              title="Cancel"
              onClick={handleClose}
              outlined
              disabled={!!loadingModule}
            />
          </Stack>
        </Box>
      </DialogContent>

      {/*   <DialogActions sx={{ backgroundColor:"#EFF6FF" }}>

      </DialogActions> */}
    </BootstrapDialog>
  );
}
