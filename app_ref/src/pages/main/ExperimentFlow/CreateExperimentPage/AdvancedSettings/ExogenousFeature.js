import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
// import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { Box, DialogActions, Grid, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";

import CustomDatePicker from "../../../../../components/CustomInputControls/CustomDatePicker";
import { useState } from "react";

import CustomTextInput from "../../../../../components/CustomInputControls/CustomTextInput2";
import useConfig from "../../../../../hooks/useConfig";
import { useEffect } from "react";
import CustomButton from "../../../../../components/CustomButton";

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

export default function ExogenousFeatures({ open, handleClose }) {
  const [refresh, setRefresh] = useState(false);
  const { datePair, addDates, addExogenousFeature, exogenous_feature } =
    useConfig();
  useEffect(() => {
    setRefresh(!refresh);
  }, [datePair, exogenous_feature.start_dt]);

  function formatDate(inputDate) {
    // Parse the input string as a Date object
    const date = new Date(inputDate);

    // Specify options for formatting
    const options = { year: "numeric", month: "long", day: "2-digit" };

    // Format the date as "MMMM, dd, yyyy"
    return date.toLocaleDateString("en-US", options);
  }
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
          Add Exogenous Features
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
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <CustomTextInput
                  showLabel
                  placeholder="Your feature name"
                  label="Exogenous Feature Name"
                  required
                  path="new_column"
                  target="exogenous"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomDatePicker
                  showLabel
                  label="Enrichment Start Data"
                  path="start_dt"
                  target="datePair"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <CustomDatePicker
                  showLabel
                  label="Enrichment End Data"
                  path="end_dt"
                  target="datePair"
                />
              </Grid>
              {exogenous_feature.start_dt.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Typography
                      sx={{
                        color: "#344054",
                        fontFamily: "Inter",
                        fontWeight: "500",
                        fontSize: "14px",
                        lineHeight: "20px",
                        // marginBottom: "6px",
                      }}
                    >
                      Date Ranges
                    </Typography>
                    <Stack spacing={1} direction={"row"}>
                      <Stack>
                        {exogenous_feature.start_dt.map((date) => {
                          return (
                            <Typography
                              sx={{
                                color: "#344054",
                                fontFamily: "Inter",
                                fontWeight: "500",
                                fontSize: "12px",
                                lineHeight: "20px",
                              }}
                            >
                              {formatDate(date)} -
                            </Typography>
                          );
                        })}
                      </Stack>
                      <Stack>
                        {exogenous_feature.end_dt.map((date) => {
                          return (
                            <Typography
                              sx={{
                                color: "#344054",
                                fontFamily: "Inter",
                                fontWeight: "500",
                                fontSize: "12px",
                                lineHeight: "20px",
                              }}
                            >
                              {formatDate(date)}
                            </Typography>
                          );
                        })}
                      </Stack>
                    </Stack>
                  </Stack>
                </Grid>
              )}
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <CustomButton
            title={"Add Dates"}
            outlined
            onClick={addDates}
            disabled={!datePair.start_dt || !datePair.end_dt}
          />
          <CustomButton
            title={"Add Feature"}
            // outlined
            onClick={async () => {
              await addExogenousFeature();
              handleClose();
            }}
            disabled={
              !exogenous_feature.new_column ||
              exogenous_feature.start_dt.length === 0
            }
          />
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}
