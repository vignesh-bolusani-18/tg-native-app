import * as React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Box, Button, DialogActions, Stack } from "@mui/material";

import { Form, Formik } from "formik";

import CustomButton from "./CustomButton";
import { reportNameSchema } from "../validation";
import useDashboard from "../hooks/useDashboard";
import CustomTextInput from "./CustomInputControls/CustomTextInput";

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

export default function SaveReportDialog({ open, handleClose, fileName }) {
  const { saveReport } = useDashboard();

  const handleSaveReport = async (values) => {
    console.log("Saving report for", fileName, values.reportName);
    await saveReport(fileName, values.reportName);
    handleClose();
  };

  const formikRef = React.useRef();

  return (
    <Box>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        maxWidth="md"
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
            Save Report
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

        <Stack
          sx={{
            padding: "24px 32px 48px 32px",
            gap: "24px",
          }}
        >
          <Formik
            initialValues={{ reportName: "" }}
            validationSchema={reportNameSchema}
            onSubmit={handleSaveReport}
            innerRef={formikRef}
          >
            {({ errors, touched, handleChange, handleBlur, values }) => (
              <Form>
                {errors.reportName &&
                  console.log("Validation Error:", errors.reportName)}
                <CustomTextInput
                  required
                  fullWidth
                  showLabel
                  label={"Report Name"}
                  placeholder="Enter the Report Name"
                  name="reportName"
                  value={values.reportName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.reportName && Boolean(errors.reportName)}
                  helperText={touched.reportName && errors.reportName}
                />
              </Form>
            )}
          </Formik>
        </Stack>
        <DialogActions>
          <CustomButton title="Cancel" onClick={handleClose} outlined />
          <CustomButton
            title="Save Report"
            onClick={() => {
              console.log("Hi");
              formikRef.current.submitForm();
            }}
            loadable
          />
        </DialogActions>
      </BootstrapDialog>
    </Box>
  );
}
