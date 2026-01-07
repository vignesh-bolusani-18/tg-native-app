import * as React from "react";
import { useState } from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Grid, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import CustomCounter from "../../../../components/CustomInputControls/CustomCounter";
import CustomSelector from "../../../../components/CustomInputControls/CustomSelector";
import CustomDatePicker from "../../../../components/CustomInputControls/CustomDatePicker";
import { AddOutlined } from "@mui/icons-material";
import CustomAutocomplete from './../../../../components/CustomInputControls/CustomAutoComplete';

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

export default function AddPlannerEnrichments({ open, handleClose }) {
  const [count, setCount] = useState(0); // Initial count value
  const maxRange = 10; // Maximum allowed count value
  const minRange = 0;
  const [selectedValues, setSelectedValues] = useState({});
  const options = ["Option 1", "Option 2", "Option 3", "Option 4"];


  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="md"
        fullWidth
      >
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
          sx={{ padding: "20px 24px 19px 24px" }}
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
          <Stack direction="row" gap={"12px"}>
            <Button
              size="medium"
              sx={{
                border: "1px solid #D0D5DD",
                borderRadius: "8px",
                padding: "10px 16px",
                maxHeight: "40px",
              }}
            >
              <Stack direction="row" spacing={1}>
                <Typography sx={btnText}>Copy</Typography>
              </Stack>
            </Button>

            <Button
              variant="contained"
              onClick={handleClose}
              sx={{
                border: "1px solid #0C66E4",
                borderRadius: "8px",
                backgroundColor: "#0C66E4",
                padding: "10px 16px",
                maxHeight: "40px",
              }}
            >
              <Stack spacing={1} direction="row" alignItems={"center"}>
                <AddOutlined />
                <Typography
                  sx={{
                    fontFamily: "Inter",
                    fontSize: "14px",
                    fontWeight: 600,
                    lineHeight: "20px",
                    textAlign: "center",
                    color: "#FFFFFF",
                    textTransform: "none",
                  }}
                >
                  Add Enrichment
                </Typography>
              </Stack>
            </Button>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>
        <DialogContent dividers>
          <Stack padding="24px 32px 24px 32px" gap="24px">
            <Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <CustomAutocomplete
                    showLabel
                    placeholder="None"
                    label="Operation Type"
                    values={options}
                    isMultiSelect={false}
                    selectedValues={selectedValues}
                    setSelectedValues={setSelectedValues}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <CustomSelector
                    showLabel
                    placeholder="Select"
                    label="Select Dimension"
                    values={options}
                    isMultiSelect={false}
                    selectedValues={selectedValues}
                    setSelectedValues={setSelectedValues}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <CustomSelector
                    showLabel
                    placeholder="Select"
                    label="Select Value"
                    values={options}
                    isMultiSelect={false}
                    selectedValues={selectedValues}
                    setSelectedValues={setSelectedValues}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <CustomDatePicker
                    showLabel
                    label="Enrichment Start Date"
                    initialDate={new Date()} // Initial date
                    // Callback function to handle date change
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <CustomDatePicker
                    showLabel
                    label="Enrichment End Date"
                    initialDate={new Date()} // Initial date
                    // Callback function to handle date change
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <CustomSelector
                    showLabel
                    placeholder="Select"
                    label="Operation Type"
                    values={options}
                    isMultiSelect={false}
                    selectedValues={selectedValues}
                    setSelectedValues={setSelectedValues}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <CustomCounter
                    showLabel
                    placeholder="Set your count"
                    label="Enrichment Value"
                    value={count}
                    setValue={setCount}
                    maxRange={maxRange}
                    minRange={minRange}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Stack>
        </DialogContent>
      </BootstrapDialog>
    </React.Fragment>
  );
}
