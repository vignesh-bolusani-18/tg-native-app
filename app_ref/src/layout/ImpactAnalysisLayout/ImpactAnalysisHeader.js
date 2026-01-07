import {
  Box,
  Button,
  Stack,
  Typography,
  ButtonGroup,
  Grid,
  Chip,
} from "@mui/material";
import { ReactComponent as PlusIcon } from "../../assets/Icons/plus.svg";
import React, { useContext, useEffect } from "react";
import { ThemeContext } from "../../theme/config/ThemeContext";
import { useNavigate, useParams } from "react-router-dom";
import useExperiment from "../../hooks/useExperiment";
import { useState } from "react";
import CustomButton from "../../components/CustomButton";
import useConfig from "../../hooks/useConfig";
import { v4 as uuidv4 } from "uuid";

import useAuth from "../../hooks/useAuth";
import { navigateTo } from "../../utils/navigate";
import ReportsAndAnalysis from "../../pages/main/DashboardFlow/ViewDashboardPage/ReportsAndAnalysis";
import useDashboard from "../../hooks/useDashboard";
import { clearCache, uploadJsonToS3 } from "../../utils/s3Utils";
import { configureStore } from "@reduxjs/toolkit";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import ContactSalesDialog from "../../components/ContactSalesDialog";
import { areJsonEqual } from "../../utils/jsonCompare";
import ExecuteButtonDialog from "../../components/ExecuteButtonDialog";
import useImpact from "../../hooks/useImpact";
import { runImpactPipeline } from "../../utils/runImpactPipeline";
import { loadImpactPipelines } from "./../../redux/actions/impactActions";
import CreateImpactPipeline from "../../pages/main/ImpactAnalysisFlow/CreateImpactPipeline";
import { useFormStatus } from "react-dom";

const getTabs = (haveAccuracyAnalysis) => {
  if (haveAccuracyAnalysis) {
    return [
      { page: "metrics-analysis", label: "Metrics Analysis" },
      { page: "accuracy-analysis", label: "Accuracy Analysis" },
    ];
  } else {
    return [{ page: "metrics-analysis", label: "Metrics Analysis" }];
  }
};

const ImpactAnalysisHeader = ({ currentpage }) => {
  const {
    userInfo,
    currentCompany,
    isContactSalesDialogOpen,
    setIsContactSalesDialogOpen,
  } = useAuth();
  const navigate = useNavigate();
  const {
    impactPipeline,
    impactPipelineLoading,
    loadImpactPipelines,
    impact_pipelines_list,
    setImpactPipeline,
    clearImpactPipeline,
    clearImpactPipelineData,
    setOpenCreateImpactPipelineModal,
    clearImpactPipelineForm,
    openCreateImpactPipelineModal,
  } = useImpact();
  const { impactPipeline_id } = useParams();
  const [updatedAt, setUpdatedAt] = useState("");
  const [status, setStatus] = useState("");
  const [impactPipelineName, setImpactPipelineName] = useState("");
  const handleContactSales = () => {
    // Redirect to contact sales URL in a new tab
    window.open("https://www.truegradient.ai/contact", "_blank");
    setIsContactSalesDialogOpen(false);
  };
  useEffect(() => {
    if (impact_pipelines_list && impact_pipelines_list.length > 0) {
      const currentPipeline = impact_pipelines_list.find(
        (pipeline) => pipeline.impactPipelineID === impactPipeline_id
      );
      if (currentPipeline) {
        setUpdatedAt(currentPipeline.updatedAt);
        setStatus(currentPipeline.impactPipelineStatus);
        setImpactPipelineName(currentPipeline.impactPipelineName);
      }
    }
  }, [impact_pipelines_list]);

  const CustomizedButtonStyles = ({ page, children }) => {
    const navigate = useNavigate();

    if (page === currentpage) {
      return (
        <Button
          disabled={impactPipelineLoading}
          sx={{
            backgroundColor: "#F1F9FF",
            width: "100%",
            maxWidth: "100%",
            "&:hover": {
              backgroundColor: "#F1F9FF",
              textDecoration: "none",
              // border: "1px solid",
              // borderColor: theme.palette.borderColor.searchBox,
            },

            height: "40px",
          }}
          onClick={() => {
            console.log("clicked : ", page);
            navigate(
              `/${currentCompany.companyName}/impact-analysis/view/${impactPipeline_id}/${page}`
            );
          }}
        >
          <Stack
            direction={"row"}
            spacing={1}
            alignItems={"center"}
            paddingRight={"8px"}
            sx={{
              maxWidth: "100%",
              overflow: "hidden", // Prevents the stack from exceeding the button width
            }}
          >
            <Box
              sx={{
                height: "8px",
                width: "8px",
                borderRadius: "4px",
                backgroundColor: "#12B76A",
              }}
            />
            <Typography sx={btnGrpText}>{children}</Typography>
          </Stack>
        </Button>
      );
    } else {
      return (
        <Button
          disabled={impactPipelineLoading}
          sx={{
            width: "100%",
            "&:hover": {
              backgroundColor: "#F1F9FF",
              // // textDecoration: "none",
              // border: "1px solid",
              // borderColor: theme.palette.borderColor.searchBox,
            },
            height: "40px",
          }}
          onClick={() => {
            console.log("clicked : ", page);

            navigate(
              `/${currentCompany.companyName}/impact-analysis/view/${impactPipeline_id}/${page}`
            );
          }}
        >
          <Stack direction={"row"} spacing={1} paddingRight={"8px"}>
            {/* <Box
              sx={{
                height: "8px",
                width: "8px",
                borderRadius: "4px",
                backgroundColor: "#F1F9FF",
              }}
            /> */}
            <Typography sx={btnGrpText}>{children}</Typography>
          </Stack>
        </Button>
      );
    }
  };
  const { theme } = useContext(ThemeContext);

  const btnGrpText = {
    fontFamily: "Inter",
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "20px",
    textAlign: "left",
    color: "#344054",
    textTransform: "none",
    whiteSpace: "nowrap", // Prevents wrapping
    overflow: "hidden", // Hides overflowed content
    textOverflow: "ellipsis", // Shows ellipsis for overflowed content
    maxWidth: "100%", //
  };
  const textLgMedium = {
    fontFamily: "Inter",
    fontSize: "18px",
    fontWeight: 500,
    lineHeight: "28px",
    textAlign: "left",
    color: "#101828",
  };

  const handleRunPipeline = async () => {
    try {
      await runImpactPipeline(impactPipeline_id, userInfo.userID);
      await clearCache(userInfo.userID, currentCompany.companyName);
    } catch (error) {
      await loadImpactPipelines(userInfo);
    } finally {
      await loadImpactPipelines(userInfo);
    }
  };
  const handleEditImpactPipelineOpen = () => {
    setOpenCreateImpactPipelineModal(true);
  };

  const handleEditImpactPipelineClose = async () => {
    setOpenCreateImpactPipelineModal(false);

    // clearImpactPipelineForm();
  };
  const getStatusStyles = (status) => {
    switch (status) {
      case "Completed":
        return { color: "#027A48", backgroundColor: "#ECFDF3" }; // Green: Success
      case "Running":
        return { color: "#1E40AF", backgroundColor: "#E0E7FF" }; // Blue: Active
      case "Failed":
        return { color: "#B91C1C", backgroundColor: "#FEE2E2" }; // Red: Error
      case "Terminated":
        return { color: "#B91C1C", backgroundColor: "#FEE2E2" }; // Red: Error

      // New cases added below
     case "Initiating...":
        return { color: "#CA8A04", backgroundColor: "#FEF3C7" }; // Yellow: Ongoing, cautious
      case "Executing":
        return { color: "#CA8A04", backgroundColor: "#FEF3C7" }; // Yellow: Ongoing, cautious
      case "Created":
        return { color: "#2563EB", backgroundColor: "#DBEAFE" }; // Blue: Started, stable
      case "Terminating":
        return { color: "#B45309", backgroundColor: "#FDE68A" }; // Amber: Shutting down
      case "On Hold":
        return { color: "#9333EA", backgroundColor: "#F3E8FF" }; // Purple: Paused state
      case "Retrying...":
        return { color: "#EA580C", backgroundColor: "#FFEDD5" }; // Orange: Retrying in progress
      case "Executed":
        return { color: "#1D4ED8", backgroundColor: "#DBEAFE" }; // Dark Blue: Intermediate status
      case "Launching...":
        return { color: "#0EA5E9", backgroundColor: "#E0F2FE" }; // Light Blue: Launching in progress

      // New case for DataProcessCompleted
      case "DataProcessCompleted":
        return { color: "#059669", backgroundColor: "#D1FAE5" }; // Teal Green: Intermediate completion

      // Default styles
      default:
        return { color: "#6B7280", backgroundColor: "#F3F4F6" }; // Gray: Neutral/unknown
    }
  };
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: { xs: "column", md: "row" },

          padding: "15px",
          gap: "16px",
        }}
      >
        <Stack direction="column" spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={textLgMedium}>{impactPipelineName}</Typography>
            <Chip
              // display={"flex"}
              // flex="1"
              label={status}
              size="small"
              sx={{
                fontFamily: "Inter",
                fontSize: "12px",
                fontWeight: 500,
                lineHeight: "18px",
                textAlign: "initial",
                // width: '100%',
                ...getStatusStyles(status),
              }}
            />
          </Stack>

          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 400,
              lineHeight: "20px",
              color: "#475467",
              textAlign: "left",
            }}
          >
            {`Last updated: ${updatedAt}`}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2} alignItems={"flex-start"}>
          <CustomButton title="Run Pipeline" onClick={handleRunPipeline} />
          <CustomButton
            title="Edit Pipeline"
            onClick={handleEditImpactPipelineOpen}
          />
          <CustomButton
            title="Exit"
            outlined
            onClick={async () => {
              navigate(`/${currentCompany.companyName}/impact-analysis`);
              await clearImpactPipeline();
              await clearImpactPipelineData();
            }}
          />
        </Stack>
      </Box>
      <Grid container sx={{ paddingX: "15px", paddingBottom: "8px" }}>
        {getTabs(false).map((button) => {
          return (
            <Grid
              item
              key={button.label}
              xs={6}
              md={12 / getTabs(false).length}
              sx={{
                border: "1px solid",
                borderColor: theme.palette.borderColor.searchBox,
              }}
            >
              <CustomizedButtonStyles page={button.page}>
                {button.label}
              </CustomizedButtonStyles>
            </Grid>
          );
        })}
      </Grid>
      <CreateImpactPipeline
        open={openCreateImpactPipelineModal}
        isEdit
        handleClose={handleEditImpactPipelineClose}
        impactPipelineId={impactPipeline_id}
      />
      <ContactSalesDialog
        open={isContactSalesDialogOpen}
        handleClose={() => setIsContactSalesDialogOpen(false)}
        handleConfirm={handleContactSales}
        WarningText="Upgrade Your Subscription"
        ResultText="Upgrade your subscription or contact sales for more access."
        ConfirmButtonTitle="Contact Sales"
      />
    </>
  );
};

export default ImpactAnalysisHeader;
