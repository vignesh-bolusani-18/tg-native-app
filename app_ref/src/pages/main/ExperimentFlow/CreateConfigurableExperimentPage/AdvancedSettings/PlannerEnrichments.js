import * as React from "react";
import { useState } from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Box, DialogActions, Grid, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";

import CustomTextInput from "../../../../../components/ConfigurableCustomInputControls/CustomTextInput2";
import CustomDatePicker from "../../../../../components/ConfigurableCustomInputControls/CustomDatePicker";
import CustomCounter from "../../../../../components/ConfigurableCustomInputControls/CustomCounter";
import CustomAutocomplete from "../../../../../components/ConfigurableCustomInputControls/CustomAutoComplete";

import CustomButton from "../../../../../components/CustomButton";
import { add } from "lodash";
import { useEffect } from "react";
import { RefreshIcon } from "@mui/icons-material/Refresh";
import useModule from "../../../../../hooks/useModule";

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
const btnText = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: "20px",
  textAlign: "left",
  color: "#344054",
  textTransform: "none",
};

export default function PlannerEnrichments({ open, handleClose }) {
  const maxRange = 1000; // Maximum allowed count value
  const minRange = -1000;

  const { configState, addEnrichment, enrichment } = useModule();

  const nonUniquegroupsArray = ["cluster"]
    .concat(configState.scenario_plan.post_model_demand_pattern.dimensions)
    .concat(configState.data.ts_id_columns);
  const dimensionOptions = [...new Set(nonUniquegroupsArray)];

  const operations = ["enrich_data"];

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setRefresh(!refresh);
    console.log("Enrichment Changed");
  }, [enrichment.kwargs.date_range]);

  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontFamily: "Inter",
            fontWeight: "500",
            fontSize: "18px",
            lineHeight: "28px",
          }}
          id="customized-dialog-title"
        >
          Add Planner Enrichments
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers key={refresh}>
          <Stack padding="24px 32px 24px 32px" gap="24px">
            <Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <CustomAutocomplete
                    showLabel
                    placeholder="Select"
                    label="Operation name"
                    values={operations}
                    isMultiSelect={false}
                    path="operation"
                    target="enrichment"
                    key={`operation-${refresh}`}
                    disableClearable
                    formatLabel={false}
                    // selectedValues={featureNames}
                    // setSelectedValues={setFeatureNames}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <CustomAutocomplete
                    showLabel
                    placeholder="Select"
                    label="Select Dimension"
                    values={dimensionOptions}
                    isMultiSelect={false}
                    path="kwargs.dimension"
                    target="enrichment"
                    disableClearable
                    formatLabel={false}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <CustomTextInput
                    showLabel
                    placeholder="type here..."
                    label="Select Value"
                    required
                    path="kwargs.value"
                    target="enrichment"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <CustomDatePicker
                    showLabel
                    label="Enrichment Start Date"
                    path="kwargs.date_range[0]"
                    target="enrichment"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <CustomDatePicker
                    showLabel
                    label="Enrichment End Date"
                    path="kwargs.date_range[1]"
                    target="enrichment"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <CustomAutocomplete
                    showLabel
                    placeholder="Select enrichment type"
                    label="Enrichment type"
                    values={["uplift", "upper_bound", "lower_bound", "offset"]}
                    isMultiSelect={false}
                    path="kwargs.enrichment_type"
                    target="enrichment"
                    disableClearable
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <CustomCounter
                    showLabel
                    placeholder="Select enrichment value"
                    label="Enrichment Value"
                    path="kwargs.enrichment_value"
                    target={"enrichment"}
                    maxRange={maxRange}
                    minRange={minRange}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <CustomButton
            title={"Add Enrichment"}
            onClick={async () => {
              await addEnrichment();
              handleClose();
            }}
          />
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}
