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
  FormControlLabel,
  Stack,
  Switch,
} from "@mui/material";

import CustomAutocomplete from "./CustomInputControls/CustomAutoComplete";
import CustomDatePicker from "./CustomInputControls/CustomDatePicker";
import CustomButton from "./CustomButton";
import CustomCheck from "./CustomInputControls/CustomCheck";

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

const CustomSwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(22px)",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: theme.palette.mode === "dark" ? "#2ECA45" : "#7F56D9",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: "#fff",
    width: 32,
    height: 32,
    boxShadow:
      "0px 1px 2px rgba(16, 24, 40, 0.06), 0px 1px 3px rgba(16, 24, 40, 0.1)",
  },
  "& .MuiSwitch-track": {
    borderRadius: 20,
    backgroundColor: theme.palette.mode === "dark" ? "#39393D" : "#EAECF0",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

export default function ExperimentFiltersDialog({
  open,
  handleClose,
  experimentFiltersState,
  setFilters,
  moduleNameOptions = [
    "demand-planning",
    "inventory-optimization",
    "pricing-promotion-optimization",
  ],
  statusOptions = ["Completed", "Running", "Failed", "Terminated"],
  isProductionOptions = ["Yes", "No"],
}) {
  const [createdStartDate, setCreatedStartDate] = React.useState(
    experimentFiltersState.createdAt.startDate
  );
  const [createdEndDate, setCreatedEndDate] = React.useState(
    experimentFiltersState.createdAt.endDate
  );
  const [updatedStartDate, setUpdatedStartDate] = React.useState(
    experimentFiltersState.updatedAt.startDate
  );
  const [updatedEndDate, setUpdatedEndDate] = React.useState(
    experimentFiltersState.updatedAt.endDate
  );
  const [moduleNames, setModuleNames] = React.useState(
    experimentFiltersState.moduleNames
  );
  const [isProduction, setIsProduction] = React.useState(
    experimentFiltersState.isProduction
  );
  const [statuses, setStatuses] = React.useState(
    experimentFiltersState.statuses
  );

  React.useEffect(() => {
    if (open) {
      setCreatedStartDate(experimentFiltersState.createdAt.startDate);
      setCreatedEndDate(experimentFiltersState.createdAt.endDate);
      setUpdatedStartDate(experimentFiltersState.updatedAt.startDate);
      setUpdatedEndDate(experimentFiltersState.updatedAt.endDate);
      setModuleNames(experimentFiltersState.moduleNames);
      setIsProduction(experimentFiltersState.isProduction);
      setStatuses(experimentFiltersState.statuses);
    }
  }, [open, experimentFiltersState]);

  const handleApplyFilters = () => {
    setFilters.createdStartDate(createdStartDate);
    setFilters.createdEndDate(createdEndDate);
    setFilters.updatedStartDate(updatedStartDate);
    setFilters.updatedEndDate(updatedEndDate);
    setFilters.moduleNames(moduleNames);
    setFilters.isProduction(isProduction);
    setFilters.statuses(statuses);
    handleClose();
  };

  const handleResetFilters = () => {
    setCreatedStartDate(null);
    setCreatedEndDate(null);
    setUpdatedStartDate(null);
    setUpdatedEndDate(null);
    setModuleNames([]);
    setStatuses([]);
    setIsProduction(false);
    setFilters.reset();
    handleClose();
  };

  return (
    <BootstrapDialog onClose={handleClose} open={open} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          m: 0,
          padding: "20px 26px 19px 26px",
          borderBottom: "1px solid #EAECF0",
        }}
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
          Filter Experiments
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
      <DialogContent>
        <Stack spacing={3} padding="16px 0px">
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 500,
              color: "#344054",
            }}
          >
            Created Date Range
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <CustomDatePicker
              showLabel
              label="Start date"
              initialDate={new Date()}
              selectedValue={createdStartDate}
              setSelectedValue={setCreatedStartDate}
            />
            <CustomDatePicker
              showLabel
              label="End date"
              initialDate={new Date()}
              selectedValue={createdEndDate}
              setSelectedValue={setCreatedEndDate}
            />
          </Stack>
          <Typography
            sx={{
              fontFamily: "Inter",
              fontSize: "14px",
              fontWeight: 500,
              color: "#344054",
              marginTop: "16px",
            }}
          >
            Updated Date Range
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <CustomDatePicker
              showLabel
              label="Start date"
              initialDate={new Date()}
              selectedValue={updatedStartDate}
              setSelectedValue={setUpdatedStartDate}
            />
            <CustomDatePicker
              showLabel
              label="End date"
              initialDate={new Date()}
              selectedValue={updatedEndDate}
              setSelectedValue={setUpdatedEndDate}
            />
          </Stack>
          <Box sx={{ marginTop: "16px" }}>
            <CustomAutocomplete
              isMultiSelect={true}
              multiple
              values={moduleNameOptions}
              selectedValues={moduleNames}
              setSelectedValues={setModuleNames}
              label="Module Names"
              placeholder="Select module names"
              showLabel
            />
          </Box>
          <Box sx={{ marginTop: "16px" }}>
            <CustomAutocomplete
              isMultiSelect={true}
              multiple
              values={statusOptions}
              selectedValues={statuses}
              setSelectedValues={setStatuses}
              label="Statuses"
              placeholder="Select statuses"
              showLabel
            />
          </Box>

          
        </Stack>
      </DialogContent>
      <DialogActions sx={{ padding: "16px 24px" }}>
        <CustomButton
          onClick={handleResetFilters}
          title="Reset Filters"
          outlined
        />
        <CustomButton
          onClick={handleApplyFilters}
          title="Apply Filters"
          loadable
        />
      </DialogActions>
    </BootstrapDialog>
  );
}
