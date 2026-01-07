import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Stack, Grid, Divider } from "@mui/material";
import { ReactComponent as AlertIcon } from "../.././../../../assets/Icons/alert.svg";
import { StyledInput, TextFieldBox } from "../../../../../components/Search";
import useConfig from "../../../../../hooks/useConfig";

import { DialogActions } from "@mui/material";
import CustomButton from "../../../../../components/CustomButton";
import useExperiment from "../../../../../hooks/useExperiment";
import useModule from "../../../../../hooks/useModule";
import CustomDatePicker from "../../../../../components/ConfigurableCustomInputControls/CustomDatePicker";
import CustomCounter from "../../../../../components/ConfigurableCustomInputControls/CustomCounter";
import CustomAutocomplete from "../../../../../components/ConfigurableCustomInputControls/CustomAutoComplete";
import CustomCheck from "../../../../../components/ConfigurableCustomInputControls/CustomCheck";
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    // padding: theme.spacing(2),
    padding: 0,
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

const titleStyle = {
  fontFamily: "Inter",
  fontSize: "16px",
  fontWeight: 500,
  lineHeight: "24px",
  color: "#344054",
  textAlign: "left",
};
const subHeadingStyle = {
  fontFamily: "Inter",
  fontSize: "16px",
  fontWeight: 600,
  lineHeight: "30px",
  color: "#101828",
  textAlign: "left",
};

export default function FeatureGroupDialog({
  open,
  handleClose,
  featureGroup,
  bucket,
  refresh,
  onRestore,
  missingFeatures,
}) {
  const {
    contextBuckets,
    confirmContextGroup,
    contextConfig,
    configState,
    addDisaggregateInventoryMetricsGranularity,
  } = useModule();

  const { loadedDatasets } = useModule();

  React.useEffect(() => {
    addDisaggregateInventoryMetricsGranularity();
    console.log(
      "inventory_metrics_one " +
        contextConfig.scenario_plan.inventory_constraints
          .disaggregate_inventory_metrics_granularity
    );
  }, [
    contextConfig.scenario_plan.inventory_constraints
      .disaggregate_inventory_metrics,
    contextConfig.scenario_plan.inventory_constraints
      .disaggregate_inventory_metrics_granularity,
  ]);
  return (
    <React.Fragment>
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
            {contextBuckets[bucket].featureGroups[featureGroup].title}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={async () => {
              await handleClose();
              //confirmContextGroup(featureGroup);
            }}
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
          <Grid container spacing={2} padding={4}>
            {contextBuckets[bucket].featureGroups[featureGroup].features.map(
              (feature) => {
                const isRequired = missingFeatures.some(
                  (missingFeature) => missingFeature.path === feature.path
                );
                return (
                  <Grid
                    item
                    xs={feature.xs}
                    md={feature.md}
                    alignItems={"center"}
                    justifyContent={"center"}
                    key={`${feature.path}-${refresh}`}
                  >
                    {feature.component === "DatePicker" && (
                      <CustomDatePicker
                        showLabel={feature.showLabel}
                        label={feature.label}
                        path={feature.path}
                        key={`${feature.path}-${refresh}`}
                        target={feature.target}
                        isRequired={isRequired}
                      />
                    )}
                    {feature.component === "heading" && (
                      <Typography sx={subHeadingStyle}>
                        {feature.title}
                      </Typography>
                    )}
                    {feature.component === "Counter" && (
                      <CustomCounter
                        target={feature.target}
                        showLabel={feature.showLabel}
                        label={feature.label}
                        path={feature.path}
                        placeholder={feature.placeholder}
                        maxRange={feature.maxRange}
                        minRange={feature.minRange}
                        key={`${feature.path}-${refresh}`}
                      />
                    )}
                    {feature.component === "AutoComplete" && (
                      <CustomAutocomplete
                        isRequired={isRequired}
                        key={`${feature.path}-${refresh}`}
                        showLabel={feature.showLabel}
                        label={feature.label}
                        path={feature.path}
                        placeholder={feature.placeholder}
                        isMultiSelect={feature.isMultiSelect}
                        values={feature.values}
                        valuesDict={feature.valuesDict}
                        dateFormat={feature.dateFormat}
                        target={feature.target}
                        conflictCheck={
                          feature.conflictCheck === undefined
                            ? false
                            : feature.conflictCheck
                        }
                        disabled={
                          (feature.label === "Select Product Dimensions" &&
                            contextConfig.scenario_plan.inventory_constraints
                              .stock_transfer_level === "None") ||
                          (feature.label === "Select Facility Dimensions" &&
                            contextConfig.scenario_plan.inventory_constraints
                              .stock_transfer_facility === "None") ||
                          (feature.label === "Select Zone Dimensions" &&
                            contextConfig.scenario_plan.inventory_constraints
                              .stock_transfer_zone?.length === 0) ||
                          ((feature.label === "Forecast Granularity" ||
                            feature.label === "Cross Learning Dimensions" ||
                            feature.label === "Historical Reference Period") &&
                            (!loadedDatasets["new_product"] ||
                              loadedDatasets["new_product"].length === 0)) ||
                          ([
                            "Bundle Mapping Granularity",
                            "Bundle Forecast Granularity",
                            "Simple Mapping",
                            "Simple Disaggregation Quantity",
                            "Simple Disaggregated Granularity",
                          ].includes(feature.label) &&
                            contextConfig.scenario_plan.inventory_constraints
                              .disaggregation_type !== "simple_disaggregation")
                        }
                        formatLabel={false}
                      />
                    )}{" "}
                    {feature.component === "Check" && (
                      <CustomCheck
                        question={feature.question}
                        direction={feature.direction}
                        path={feature.path}
                        key={`${feature.path}-${refresh}`}
                        target={feature.target}
                      />
                    )}
                  </Grid>
                );
              }
            )}
            {featureGroup === "IGP" &&
              (
                contextConfig.scenario_plan.inventory_constraints
                  .disaggregate_inventory_metrics_granularity || []
              ).map((metric, index) => (
                <Grid
                  item
                  xs={6}
                  md={6}
                  alignItems={"center"}
                  justifyContent={"center"}
                  key={`disaggregate-granularity-${index}-${refresh}`}
                >
                  <CustomAutocomplete
                    key={`disaggregate-granularity-${index}-${refresh}`}
                    showLabel={true}
                    label={`${contextConfig.scenario_plan.inventory_constraints.disaggregate_inventory_metrics[index]} disaggregated granularity`}
                    path={`scenario_plan.inventory_constraints.disaggregate_inventory_metrics_granularity[${index}]`}
                    placeholder={`Granularity for ${index}`}
                    isMultiSelect={true}
                    values={configState.data.ts_id_columns}
                    dateFormat={false}
                    target="context"
                    formatLabel={false}
                  />
                </Grid>
              ))}{" "}
          </Grid>
        </DialogContent>
        <DialogActions>
          <CustomButton
            title="Restore"
            outlined
            onClick={() => {
              onRestore();
            }}
          />
          <CustomButton
            title="Confirm"
            disabled={missingFeatures.length > 0}
            onClick={async () => {
              await handleClose();
              confirmContextGroup(featureGroup);
            }}
          />
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}
