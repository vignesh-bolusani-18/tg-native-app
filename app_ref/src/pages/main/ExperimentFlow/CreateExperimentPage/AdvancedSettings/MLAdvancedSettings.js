import * as React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Button, DialogActions } from "@mui/material";
import { Box, Stack, DialogContent, Grid } from "@mui/material";

import CustomAutocomplete from "../../../../../components/CustomInputControls/CustomAutoComplete";

import { useState } from "react";
import CustomCheck from "../../../../../components/CustomInputControls/CustomCheck";
import CustomCounter from "../../../../../components/CustomInputControls/CustomCounter";
import CustomButton from "./../../../../../components/CustomButton";
import useConfig from "../../../../../hooks/useConfig";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
  "& .MuiPaper-root": {
    borderRadius: "12px",
    border: " 1px solid #EAECF0",
    backgroundColor: theme.palette.background.default,
  },
}));

export default function MLAdvancedSettings({ open, handleClose }) {
  const { confirmMLAdvancedSettings, configState, confirmAdvanceSettingsGroup } = useConfig();

  const nonUniquegroupsArray = ["cluster"]
    .concat(configState.scenario_plan.post_model_demand_pattern.dimensions)
    .concat(configState.data.ts_id_columns);
  const groupsArray = [...new Set(nonUniquegroupsArray)];
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

  const driverColumns = configState.data.driver_columns;

  //Couters

  const kBestCandidatesMaxRange = 5000;
  const kBestCandidatesMinRange = 0;
  const candidatesMaxRange = 5000;
  const candidatesMinRange = 0;
  const percentageMaxRange = 100;
  const percentageMinRange = 0;

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
            ML Advanced Settings
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
          <Stack padding="24px 32px 24px 32px" gap="24px">
            <Grid container spacing={2}>
              <Grid item md={12}>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "16px",
                    fontWeight: 600,
                    lineHeight: "30px",
                    color: "#101828",
                    textAlign: "left",
                  }}
                >
                  Forecasting Settings
                </Typography>
              </Grid>
              <Grid item md={4}>
                <CustomCheck
                  question="Cluster using ABC-XYZ classification?"
                  path="feature_engg.cluster_abc_xyz"
                  direction="column" // Example direction
                  target="config"
                />
              </Grid>
              <Grid item md={4}>
                <CustomCheck
                  question="Turn On time-based seasonality?"
                  path="feature_engg.time_seasonality"
                  direction="column" // Example direction
                  target="config"
                />
              </Grid>
              <Grid item md={4}>
                <CustomCheck
                  question="Turn on time to event features?"
                  path="feature_engg.time_to_event"
                  direction="column" // Example direction
                  target="config"
                />
              </Grid>

              {/* <Grid item md={3}>
                <CustomCheck
                  question="Turn on dimension time interaction?"
                  path="feature_engg.dimension_time_interaction"
                  direction="column" // Example direction
                  target="config"
                />
              </Grid> */}
              <Grid item md={12}>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "16px",
                    fontWeight: 600,
                    lineHeight: "30px",
                    color: "#101828",
                    textAlign: "left",
                  }}
                >
                  Model Selection
                </Typography>
              </Grid>
              <Grid item md={6}>
                <CustomAutocomplete
                  target="config"
                  showLabel
                  placeholder="Select"
                  label="Select Groups For Data Segmentation"
                  values={groupsArray}
                  isMultiSelect
                  path="feature_engg.groups[0].group_id_columns"
                />
              </Grid>
              <Grid item md={6}>
                <CustomAutocomplete
                  target="config"
                  showLabel
                  placeholder="Select"
                  label="Select Models For Run"
                  values={modelsArray}
                  isMultiSelect
                  path="training.groups.cluster.model_names"
                />
              </Grid>
              <Grid item md={12}>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "16px",
                    fontWeight: 600,
                    lineHeight: "30px",
                    color: "#101828",
                    textAlign: "left",
                  }}
                >
                  Model Feature Settings
                </Typography>
              </Grid>
              <Grid item md={12}>
                <CustomAutocomplete
                  target="config"
                  showLabel
                  placeholder="Type here...."
                  label="Select Feature Types to be created"
                  values={featuresArray}
                  isMultiSelect
                  path="feature_engg.feature_types"
                />
              </Grid>

              <Grid item md={12}>
                <CustomAutocomplete
                  target="config"
                  showLabel
                  placeholder="Select the drivers whose offset should be created (used only when offset is selected in Feature Types)"
                  label="Driver Offset columns"
                  values={driverColumns}
                  isMultiSelect
                  path="feature_engg.driver_offset_cols"
                />
              </Grid>
              <Grid item md={12}>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 500,
                    lineHeight: "20px",
                    color: "#101828",
                    textAlign: "left",
                  }}
                >
                  Offset Parameters
                </Typography>
              </Grid>
              <Grid item md={3}>
                <CustomCheck
                  question="Create gap"
                  path="feature_engg.offset_params.create_gap"
                  direction="column"
                  target="config"
                />
              </Grid>
              <Grid item md={9}>
                <CustomAutocomplete
                  target="config"
                  showLabel
                  placeholder="Choose an option"
                  label="Select Period for Creating Offsets"
                  values={numericArray}
                  isMultiSelect
                  path="feature_engg.offset_params.period_types"
                />
              </Grid>
              <Grid item md={12}>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 500,
                    lineHeight: "20px",
                    color: "#101828",
                    textAlign: "left",
                  }}
                >
                  Lag Parameters
                </Typography>
              </Grid>
              <Grid item md={3}>
                <CustomCheck
                  question="Create gap"
                  path="feature_engg.lag_params.create_gap"
                  direction="column"
                  target="config"
                />
              </Grid>
              <Grid item md={2}>
                <CustomAutocomplete
                  target="config"
                  showLabel
                  placeholder="Select"
                  label="Min lag"
                  values={numericArray}
                  path="feature_engg.lag_params.range[0]"
                />
              </Grid>
              <Grid item md={2}>
                <CustomAutocomplete
                  target="config"
                  showLabel
                  placeholder="Select"
                  label="Max lag"
                  values={numericArray}
                  path="feature_engg.lag_params.range[1]"
                />
              </Grid>
              <Grid item md={2}>
                <CustomAutocomplete
                  target="config"
                  showLabel
                  placeholder="Select"
                  label="Lag step"
                  values={numericArray}
                  path="feature_engg.lag_params.range[2]"
                />
              </Grid>
              <Grid item md={3}>
                <CustomAutocomplete
                  target="config"
                  showLabel
                  placeholder="Select"
                  label="Customer tag values"
                  isMultiSelect
                  values={numericArray}
                  path="feature_engg.lag_params.values"
                />
              </Grid>
              <Grid item md={12}>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 500,
                    lineHeight: "20px",
                    color: "#101828",
                    textAlign: "left",
                  }}
                >
                  Time Interaction
                </Typography>
              </Grid>
              <Grid item md={12}>
                <CustomAutocomplete
                  target="config"
                  showLabel
                  placeholder="Select time interaction dimensions"
                  label="Select Time Interaction Dimensions"
                  values={groupsArray}
                  isMultiSelect
                  path="feature_engg.time_interaction_dimensions"
                />
              </Grid>
              <Grid item md={12}>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "16px",
                    fontWeight: 600,
                    lineHeight: "30px",
                    color: "#101828",
                    textAlign: "left",
                  }}
                >
                  Miscellaneous Settings
                </Typography>
              </Grid>

              <Grid item md={3}>
                <CustomCheck
                  question="Use Candidate Weight?"
                  path="stacking.candidate_weight"
                  direction="column" // Example direction
                  target="config"
                />
              </Grid>
              <Grid item md={4.5}>
                <CustomCounter
                  showLabel
                  placeholder="Set your count"
                  label="Select no. of candidates for stacking"
                  path="stacking.n_candidates"
                  maxRange={candidatesMaxRange}
                  minRange={candidatesMinRange}
                  target="config"
                />
              </Grid>
              <Grid item md={4.5}>
                <CustomCounter
                  showLabel
                  placeholder="Set your count"
                  label="Select k best candidates for stacking"
                  path="stacking.k_best_candidates"
                  maxRange={kBestCandidatesMaxRange}
                  minRange={kBestCandidatesMinRange}
                  target="config"
                />
              </Grid>
              <Grid item md={6}>
                <CustomCounter
                  showLabel
                  placeholder="Set your count"
                  label="Select Percentage for planner enrichment"
                  path="stacking.enrichment"
                  maxRange={percentageMaxRange}
                  minRange={percentageMinRange}
                  target="config"
                />
              </Grid>
              <Grid item md={6}>
                <CustomCounter
                  showLabel
                  placeholder="Set your count"
                  label="Multiprocessing Threshold"
                  path="feature_engg.multiprocessing_threshold"
                  maxRange={5000}
                  minRange={percentageMinRange}
                  target="config"
                />
              </Grid>
              <Grid item md={12}>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "16px",
                    fontWeight: 600,
                    lineHeight: "30px",
                    color: "#101828",
                    textAlign: "left",
                  }}
                >
                  New Product Settings
                </Typography>
              </Grid>
              <Grid item md={3}>
                <CustomCheck
                  question="Need new product forecasting?"
                  path="stacking.NewProduct"
                  direction="column" // Example direction
                  target="config"
                />
              </Grid>
              {/* <Grid item md={4.5}>
                <CustomCounter
                  showLabel
                  placeholder="Set your count"
                  label="New Product Days Cutoff"
                  path="stacking.NewProduct_DaysCutoff"
                  maxRange={5000}
                  minRange={0}
                  target="config"
                />
              </Grid> */}
              <Grid item md={4.5}>
                <CustomCounter
                  showLabel
                  placeholder="Set your count"
                  label="New Product Sale Days"
                  path="stacking.NewProduct_SaleDays"
                  maxRange={5000}
                  minRange={0}
                  target="config"
                />
              </Grid>
              <Grid item md={12}>
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "16px",
                    fontWeight: 600,
                    lineHeight: "30px",
                    color: "#101828",
                    textAlign: "left",
                  }}
                >
                  Out Of Stock Settings
                </Typography>
              </Grid>
              <Grid item md={3}>
                <CustomCheck
                  question="Impute Out Of Stock?"
                  path="feature_engg.impute_outofstock"
                  direction="column" // Example direction
                  target="config"
                />
              </Grid>
              <Grid item md={4.5}>
                <CustomAutocomplete
                  target="config"
                  showLabel
                  placeholder="Select out of stock clusters"
                  label="Select Out Of Stock Clusters"
                  values={clustersArray}
                  isMultiSelect
                  path="feature_engg.oos_clusters"
                />
              </Grid>
              <Grid item md={4.5}>
                <CustomCounter
                  showLabel
                  placeholder="Set rate of decline"
                  label="Rate Of Decline"
                  path="feature_engg.rate_of_decline"
                  maxRange={10}
                  minRange={-10}
                  target="config"
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <CustomButton
            title={"Confirm"}
            onClick={async () => {
              await confirmMLAdvancedSettings();
              handleClose();
            }}
          />
        </DialogActions>
      </BootstrapDialog>
    </Box>
  );
}
