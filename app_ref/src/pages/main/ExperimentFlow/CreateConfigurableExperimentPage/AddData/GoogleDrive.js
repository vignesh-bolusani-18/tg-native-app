import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import { Stack, Grid, InputAdornment, DialogActions } from "@mui/material";
import { ReactComponent as AlertIcon } from "../.././../../../assets/Icons/alert.svg";
import { StyledInput, TextFieldBox } from "../../../../../components/Search";
import { Formik, Form } from "formik";

import { gDriveFormSchema } from "../../../../../validation";
import CustomTextInput from "../../../../../components/CustomInputControls/CustomTextInput";
import CustomButton from "../../../../../components/CustomButton";
import useDataConnection from "../../../../../hooks/useDataConnection";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { ERROR } from "../../../../../theme/custmizations/colors";
import { useEffect } from "react";

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

export default function GoogleDrive({ open, handleClose, handleConfirm }) {
  const formikRef = React.useRef();
  const {
    createConnection,
    connectionResponse,
    connecting,
    error,
    getError,
    SetError,
  } = useDataConnection();

  const handleConnect = async (values) => {
    const payload = { folderId: values.gDriveFolderId};
    console.log("On Click Called");
    const postCreation = () => {
      handleConfirm();
      handleClose();
      SetError(null);
    };
    await createConnection(
      values.gDriveConnectionName,
      "gdrive",
      payload,
      postCreation
    );
  };

  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={async () => {
          await handleClose();
          SetError(null);
        }}
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
            Google Drive
          </Typography>
          <IconButton
            aria-label="close"
            onClick={async () => {
              await handleClose();
              SetError(null);
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
          <Formik
            initialValues={{
              gDriveConnectionName: "",
              gDriveFolderId: "",
              gDriveServiceId:
                "service-acc@test-project-406809.iam.gserviceaccount.com",
            }}
            validationSchema={gDriveFormSchema}
            onSubmit={handleConnect}
            innerRef={formikRef}
          >
            {({ errors, touched, handleChange, handleBlur, values }) => (
              <Form>
                <Grid container padding="24px 16px 24px 16px" spacing={2}>
                  <Grid item xs={12} md={12}>
                    <CustomTextInput
                      required
                      showLabel
                      label={"Connection Name"}
                      placeholder="Enter your connection name"
                      name="gDriveConnectionName"
                      value={values.gDriveConnectionName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.gDriveConnectionName &&
                        Boolean(errors.gDriveConnectionName)
                      }
                      helperText={
                        touched.gDriveConnectionName &&
                        errors.gDriveConnectionName
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <Stack
                      // direction="row"
                      // spacing={2}
                      // alignItems="center"
                      sx={{
                        backgroundColor: "#F5EFFF",
                        padding: "4px 16px 4px 16px",
                        borderRadius: "4px",
                        flexDirection: { xs: "column", md: "row" },
                        gap: "16px",
                        alignItems: "center",
                        boxShadow:
                          "0px 4px 12px -2px rgba(9, 30, 66, 0.1), 0px 0px 1px -4px rgba(9, 30, 66, 0.31)", // Combined box shadows
                        // justifyContent: "center",
                      }}
                    >
                      <AlertIcon />

                      <Typography
                        sx={{
                          fontFamily: "Inter",
                          fontSize: "14px",
                          color: "#172B4D",
                          lineHeight: "20px",
                        }}
                      >
                        To connect any Google Drive; Share your google drive folder
                        with the following service account id to
                        <br /> programatically import data:
                        <span style={{ fontWeight: 600 }}>
                           service-acc@test-project-406809.iam.gserviceaccount.com
                        </span>
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextInput
                      required
                      showLabel
                      label={"Service Id"}
                      placeholder="Enter your service Id"
                      name="gDriveServiceId"
                      value={values.gDriveServiceId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.gDriveServiceId &&
                        Boolean(errors.gDriveServiceId)
                      }
                      helperText={
                        touched.gDriveServiceId && errors.gDriveServiceId
                      }
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextInput
                      required
                      showLabel
                      label={"Folder Id"}
                      placeholder="Enter your folder id"
                      name="gDriveFolderId"
                      value={values.gDriveFolderId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.gDriveFolderId&&
                        Boolean(errors.gDriveFolderId)
                      }
                      helperText={
                        touched.gDriveFolderId&&
                        errors.gDriveFolderId
                      }
                    />
                  </Grid>

                  {error ? (
                    <Grid item xs={12} md={12}>
                      <Stack
                        direction={"row"}
                        spacing={1}
                        alignItems={"center"}
                      >
                        <WarningRoundedIcon
                          fontSize="small"
                          style={{ color: ERROR[600] }}
                        />
                        <Typography
                          sx={{
                            fontFamily: "Inter",

                            fontSize: "12px",
                            fontWeight: "600",
                            lineHeight: "14px",
                            textAlign: "center",
                            color: ERROR[600],
                          }}
                        >
                          Unable to connect
                        </Typography>
                      </Stack>
                    </Grid>
                  ) : null}
                </Grid>
              </Form>
            )}
          </Formik>

        </DialogContent>
        <DialogActions>
          <CustomButton
            title="Cancel"
            onClick={async () => {
              await handleClose();
              SetError(null);
            }}
            outlined
          />
          <CustomButton
            title={connecting ? "Connecting" : "Connect"}
            onClick={() => formikRef.current.submitForm()}
          />
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}
