import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Typography from "@mui/material/Typography";
import { Stack, Grid, Divider, Tooltip, Box, Link } from "@mui/material";
import { ReactComponent as AlertIcon } from "../.././../../../assets/Icons/alert.svg";
import { StyledInput, TextFieldBox } from "../../../../../components/Search";
import useConfig from "../../../../../hooks/useConfig";
import CustomDatePicker from "../../../../../components/CustomInputControls/CustomDatePicker";
import CustomCounter from "../../../../../components/CustomInputControls/CustomCounter";
import CustomAutocomplete from "../../../../../components/CustomInputControls/CustomAutoComplete";
import CustomCheck from "../../../../../components/CustomInputControls/CustomCheck";
import { DialogActions } from "@mui/material";
import CustomButton from "../../../../../components/CustomButton";
import useExperiment from "../../../../../hooks/useExperiment";
import DynamicInfoTooltip from "../../../../docs/DynamicInfoTooltip";

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

// Inline InfoTooltip Component
const InfoTooltip = ({ infoTooltip, docLink }) => {
  const [open, setOpen] = React.useState(false);

  if (!infoTooltip) return null;

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  const handleLinkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (docLink) {
      // Extract base path (everything before the third slash after protocol)
      const currentUrl = window.location.href;
      const urlParts = currentUrl.split("/");
      // Get protocol, host, and first path segment (test1)
      const basePath = `${urlParts[0]}//${urlParts[2]}/${urlParts[3]}`;

      // Ensure docLink starts with / for absolute path
      const absoluteDocLink = docLink.startsWith("/") ? docLink : `/${docLink}`;
      const fullUrl = `${basePath}${absoluteDocLink}`;

      window.open(fullUrl, "_blank", "noopener,noreferrer");
    }
  };

  const TooltipContent = () => (
    <Box sx={{ maxWidth: 250, p: 1.5 }}>
      <Typography
        variant="body2"
        sx={{
          mb: docLink ? 1 : 0,
          color: "#344054",
          fontSize: "13px",
          lineHeight: "18px",
        }}
      >
        {infoTooltip}
      </Typography>
      {docLink && (
        <Link
          href={docLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleLinkClick}
          onMouseDown={handleLinkClick}
          sx={{
            fontSize: "12px",
            color: "#1976d2",
            textDecoration: "underline",
            cursor: "pointer",
            display: "inline-block",
            "&:hover": {
              color: "#1565c0",
            },
          }}
        >
          Explore more
        </Link>
      )}
    </Box>
  );

  return (
    <Tooltip
      title={<TooltipContent />}
      arrow
      placement="top"
      open={open}
      onClose={handleTooltipClose}
      onOpen={handleTooltipOpen}
      disableHoverListener={false}
      disableFocusListener={false}
      disableTouchListener={false}
      leaveDelay={300}
      enterDelay={200}
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: "white",
            color: "#344054",
            fontSize: "13px",
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
            border: "1px solid #E4E7EC",
            "& .MuiTooltip-arrow": {
              color: "white",
              "&::before": {
                border: "1px solid #E4E7EC",
              },
            },
          },
          onMouseEnter: () => setOpen(true),
          onMouseLeave: () => setOpen(false),
        },
      }}
    >
      <IconButton
        size="small"
        onMouseEnter={handleTooltipOpen}
        onMouseLeave={() => {
          // Don't close immediately, let the tooltip handle it
        }}
        sx={{
          ml: 0.5,
          p: 0.25,
          color: "#666",
          "&:hover": {
            color: "#1976d2",
            backgroundColor: "rgba(25, 118, 210, 0.04)",
          },
        }}
      >
        <InfoOutlinedIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Tooltip>
  );
};

export default function FeatureGroupDialog({
  open,
  handleClose,
  featureGroup,
  bucket,
  refresh,
  onRestore,
}) {
  const {
    contextBuckets,
    contextBucketsFilledFlags,
    confirmContextGroup,
    contextConfig,
    configState,
    addDisaggregateInventoryMetricsGranularity,
  } = useConfig();

  const { loadedDatasets } = useExperiment();

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

  console.log("adjust_lead_time", contextConfig.scenario_plan.inventory_constraints.adjust_lead_time);

  // Helper function to render label with info tooltip
  const renderLabelWithInfo = (feature, isRequired = false) => {
    if (!feature.showLabel) return null;

    return (
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}
      >
        <Typography
          component="label"
          sx={{
            fontFamily: "Inter",
            fontSize: "14px",
            fontWeight: 500,
            color: "#344054",
            display: "flex",
            alignItems: "center",
          }}
        >
          {feature.label}
          {isRequired && (
            <span style={{ color: "#F04438", marginLeft: "2px" }}>*</span>
          )}
        </Typography>
        <DynamicInfoTooltip
          fieldPath={feature.path}
          fieldLabel={feature.label}
        />
      </div>
    );
  };

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
              confirmContextGroup(featureGroup);
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
                if (
                  feature.path ===
                  "scenario_plan.inventory_constraints.disaggregate_inventory_metrics_granularity"
                )
                  return;

                const isRequired =
                  feature.path === "etl.activity_end_date" &&
                  !contextConfig.etl.activity_end_date;

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
                      <div>
                        {renderLabelWithInfo(feature, isRequired)}
                        <CustomDatePicker
                          showLabel={false} // We're handling the label separately now
                          label={feature.label}
                          path={feature.path}
                          key={`${feature.path}-${refresh}`}
                          target={feature.target}
                          isRequired={isRequired}
                          dependentFieldsToUpdate={
                            feature?.dependentFieldsToUpdate ?? []
                          }
                        />
                      </div>
                    )}
                    {feature.component === "heading" && (
                      <Typography sx={subHeadingStyle}>
                        {feature.title}
                      </Typography>
                    )}
                    {feature.component === "Counter" && (
                      <div>
                        {renderLabelWithInfo(feature)}
                        <CustomCounter
                          target={feature.target}
                          showLabel={false} // We're handling the label separately now
                          label={feature.label}
                          path={feature.path}
                          placeholder={feature.placeholder}
                          maxRange={feature.maxRange}
                          minRange={feature.minRange}
                          key={`${feature.path}-${refresh}`}
                          dependentFieldsToUpdate={
                            feature?.dependentFieldsToUpdate ?? []
                          }
                          disabled={
                            (feature.path ===
                              "scenario_plan.inventory_constraints.adjusted_lead_time" &&
                            !contextConfig?.scenario_plan?.inventory_constraints
                              ?.adjust_lead_time) ||
                            ( feature.path === "scenario_plan.inventory_constraints.lead_time_reorder" &&
                              contextConfig.scenario_plan.inventory_constraints.adjust_lead_time === false) 
                          }
                        />
                      </div>
                    )}
                    {feature.component === "AutoComplete" && (
                      <div>
                        {renderLabelWithInfo(feature)}
                        <CustomAutocomplete
                          key={`${feature.path}-${refresh}`}
                          showLabel={false} // We're handling the label separately now
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
                           ( feature.label === "Select lead time reorder column" &&
                              contextConfig.scenario_plan.inventory_constraints.adjust_lead_time === false) ||
                            (feature.label === "Select Facility Dimensions" &&
                              contextConfig.scenario_plan.inventory_constraints
                                .stock_transfer_facility === "None") ||
                            (feature.label === "Select Zone Dimensions" &&
                              contextConfig.scenario_plan.inventory_constraints
                                .stock_transfer_zone?.length === 0) ||
                            ((feature.label === "Forecast Granularity" ||
                              feature.label === "Cross Learning Dimensions" ||
                              feature.label ===
                                "Historical Reference Period") &&
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
                                .disaggregation_type !==
                                "simple_disaggregation") ||
                            ([
                              "Size Column Tag",
                              "Global Tag for All Sizes",
                            ].includes(feature.label) &&
                              contextConfig.scenario_plan.inventory_constraints
                                .optimize_cutsize === false)
                          }
                          formatLabel={false}
                        />
                      </div>
                    )}
                    {feature.component === "Check" && (
                      <div>
                        {renderLabelWithInfo(feature)}
                        <CustomCheck
                          question={feature.question}
                          direction={feature.direction}
                          path={feature.path}
                          key={`${feature.path}-${refresh}`}
                          target={feature.target}
                          showLabel={false}
                        />
                      </div>
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
              ))}
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
