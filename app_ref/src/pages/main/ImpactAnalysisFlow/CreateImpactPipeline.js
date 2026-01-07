import * as React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import {
  Box,
  Chip,
  DialogActions,
  DialogContent,
  Grid,
  Stack,
  Tooltip,
} from "@mui/material";
import useAuth from "../../../hooks/useAuth";
import { Formik, Form } from "formik";
import { v4 as uuidv4 } from "uuid";
import { impactPipelineSchema } from "../../../validation";
import useExperiment from "../../../hooks/useExperiment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import CustomButton from "../../../components/CustomButton";
import useImpact from "../../../hooks/useImpact";
import CustomTextInput from "../../../components/CustomInputControls/CustomTextInput2";
import CustomAutoComplete from "../../../components/CustomInputControls/CustomAutoComplete";
import { ThemeContext } from "../../../theme/config/ThemeContext";
import { filter } from "lodash";
import { runImpactPipeline } from "../../../utils/runImpactPipeline";
import { clearCache } from "../../../utils/s3Utils";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: "1px solid #EAECF0",
    backgroundColor: theme.palette.background.default,
  },
}));

export default function CreateImpactPipeline({
  open,
  handleClose,
  isEdit,
  impactPipelineId,
}) {
  const { addImpactPipeline, impactPipelineForm, loadImpactPipelines } =
    useImpact();
  const { userInfo, currentCompany } = useAuth();
  const { experiments_list } = useExperiment();
  const { theme } = React.useContext(ThemeContext);
  const { setImpactPipeline, impactPipeline } = useImpact();
  const handleRunPipeline = async (impactPipelineID) => {
    try {
      await runImpactPipeline(impactPipelineID, userInfo.userID);
      await clearCache(userInfo.userID, currentCompany.companyName);
      loadImpactPipelines(userInfo);
    } catch (error) {
      await clearCache(userInfo.userID, currentCompany.companyName);
      loadImpactPipelines(userInfo);
    }
  };
  const handleSubmit = async () => {
    try {
      const impactPipelineID = isEdit ? impactPipelineId : uuidv4();
      const impactPipelineInfo = {
        impactPipelineName: impactPipelineForm.name,
        impactPipelineTag: impactPipelineForm.tag,
        impactPipelineStatus: isEdit ? "Editing" : "Created",
        impactPipelineID,
        createdAt: isEdit ? impactPipeline.createdAt : Date.now(),
        updatedAt: Date.now(),
        createdBy: isEdit ? impactPipeline.createdBy : userInfo.userName,
        inTrash: false,
        experimentIDs: impactPipelineForm.experimentIDs,
      };
      await setImpactPipeline(impactPipelineInfo);
      await addImpactPipeline(userInfo, currentCompany, impactPipelineInfo);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      handleRunPipeline(impactPipelineID);
      handleClose();
    } catch (error) {
      handleClose();
      console.error("Error creating impact pipeline:", error);
    }
  };
  function parseString(input) {
    try {
      // Try to parse the input as JSON
      const json = JSON.parse(input);

      // If successful and it's an object or array, return it
      if (typeof json === "object" && json !== null) {
        return json.status;
      }
    } catch (e) {
      // If JSON.parse throws an error, it means input is not valid JSON
      return input;
    }

    // If input is not valid JSON, return the original string
    return input;
  }
  // Function to get styles based on experimentStatus
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
      case "Initiated":
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
  // Transform experiments list for AutoComplete
  const experimentOptions = [
    ...new Set(
      experiments_list
        .filter(
          (experiment) =>
            !experiment.inTrash &&
            parseString(experiment.experimentStatus) === "Completed"
        )
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((experiment) => experiment.experimentID)
    ),
  ];
  console.log("experimentOptions Length", experimentOptions.length);

  const experimentValuesDict = Object.fromEntries(
    experiments_list
      .filter(
        (experiment) =>
          !experiment.inTrash &&
          parseString(experiment.experimentStatus) === "Completed"
      )
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((experiment) => [experiment.experimentID, experiment.experimentName])
  );

  // Create custom components for each experiment option
  const experimentComponentDict = Object.fromEntries(
    experiments_list
      .filter(
        (experiment) =>
          !experiment.inTrash &&
          parseString(experiment.experimentStatus) === "Completed"
      )
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((experiment) => [
        experiment.experimentID,
        () => (
          <Stack
            direction={"row"}
            // spacing={2}
            alignItems={"center"}
            // justifyContent={"space-between"}
            sx={{ width: "100%", padding: "4px" }}
          >
            <Stack spacing={0.1} width={"30%"}>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "14px",
                  fontWeight: 500,
                  lineHeight: "18px",
                  textAlign: "left",
                  color: theme.palette.text.modalHeading,
                }}
              >
                {experiment.experimentName}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "12px",
                  fontWeight: 400,
                  lineHeight: "20px",
                  color: "#475467",
                  textAlign: "left",
                }}
              >
                {experiment.experimentID}
              </Typography>
            </Stack>
            <Stack direction={"row"} alignItems={"center"} justifyContent={"flex-start"} width={"20%"}>
              <Chip
                label={experiment.experimentModuleName}
                size="small"
              sx={{
                fontFamily: "Inter",
                fontSize: "12px",
                fontWeight: 500,
                lineHeight: "18px",
                textAlign: "initial",
                color: "#027A48",
                backgroundColor: "#ECFDF3",
                }}
              />
            </Stack>
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
              width={"50%"}
            >
              <Stack spacing={0.1}>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 500,
                    lineHeight: "18px",
                    textAlign: "left",
                    color: theme.palette.text.modalHeading,
                  }}
                >
                  Created At
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "12px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    color: "#475467",
                    textAlign: "left",
                  }}
                >
                  {experiment.createdAt}
                </Typography>
              </Stack>
              <Stack spacing={0.1}>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 500,
                    lineHeight: "18px",
                    textAlign: "left",
                    color: theme.palette.text.modalHeading,
                  }}
                >
                  Updated At
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "12px",
                    fontWeight: 400,
                    lineHeight: "20px",
                    color: "#475467",
                    textAlign: "left",
                  }}
                >
                  {experiment.updatedAt}
                </Typography>
              </Stack>

              <Tooltip title="Completed Experiment">
                <Chip
                  label={parseString(experiment.experimentStatus)}
                  size="small"
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "12px",
                    fontWeight: 500,
                    lineHeight: "18px",
                    textAlign: "initial",
                    ...getStatusStyles(
                      parseString(experiment.experimentStatus)
                    ),
                  }}
                />
              </Tooltip>
            </Stack>
          </Stack>
        ),
      ])
  );

  return (
    <Box>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0,
            padding: "20px 26px 19px 26px",
            borderBottom: "1px solid #EAECF0",
          }}
          id="customized-dialog-title"
        >
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "18px",
              fontWeight: 500,
              lineHeight: "28px",
              color: "#101828",
              textAlign: "left",
            }}
          >
            {isEdit ? "Edit Impact Pipeline" : "Create Impact Pipeline"}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "#667085",
              padding: "8px",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <CustomTextInput
                required
                fullWidth
                showLabel
                label="Impact Pipeline Name"
                placeholder="Enter the Impact Pipeline Name"
                target="impact"
                path="name"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomTextInput
                required
                fullWidth
                showLabel
                label="Impact Pipeline Tag"
                placeholder="Enter the Impact Pipeline Tag"
                target="impact"
                path="tag"
              />
            </Grid>
            <Grid item xs={12}>
              <CustomAutoComplete
                fullWidth
                showLabel
                label="Select Experiments"
                placeholder="Select experiments to include"
                values={experimentOptions}
                target="impact"
                path="experimentIDs"
                valuesDict={experimentValuesDict}
                optionComponentDict={experimentComponentDict}
                isMultiSelect={true}
                getOptionLabel={(option) => {
                  const name = experimentValuesDict[option] || option;
                  // Format as "Experiment Name - ID123"
                  return `${name}`;
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Stack
            direction="row"
            alignItems="center"
            alignSelf="flex-end"
            spacing={2}
          >
            <CustomButton title="Cancel" onClick={handleClose} outlined />
            <CustomButton
              title={isEdit ? "Update" : "Create"}
              onClick={handleSubmit}
              disabled={false}
              loadable
            />
          </Stack>
        </DialogActions>
      </BootstrapDialog>
    </Box>
  );
}
