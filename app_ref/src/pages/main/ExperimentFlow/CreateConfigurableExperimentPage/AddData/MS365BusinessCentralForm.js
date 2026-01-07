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

import { Formik, Form } from "formik";

import { ms365BusinessCentralFormSchema } from "../../../../../validation";
import CustomTextInput from "../../../../../components/CustomInputControls/CustomTextInput";
import CustomButton from "../../../../../components/CustomButton";
import useDataConnection from "../../../../../hooks/useDataConnection";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { ERROR } from "../../../../../theme/custmizations/colors";
import { ReactComponent as Visibility } from "../../../../../assets/Icons/eye.svg";
import { ReactComponent as VisibilityOff } from "../../../../../assets/Icons/eye-off.svg";
import { useEffect } from "react";
import { getValueFromValueOptions } from "@mui/x-data-grid/components/panel/filterPanel/filterPanelUtils";
import { Password } from "@mui/icons-material";
import { Editor } from "@monaco-editor/react";

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

export default function MS365BusinessCentralForm({ open, handleClose, handleConfirm }) {
  const formikRef = React.useRef();
  const { createConnection, connecting, error, SetError } = useDataConnection();
  const [showPassword, setShowPassword] = React.useState(false);
  const toggleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const handleConnect = async (values) => {
    const payload = {
      baseURL: values.ms365BusinessCentralBaseURL,
      userID: values.ms365BusinessCentralUserID,
      password: values.ms365BusinessCentralPassword,
    };
    console.log("On Click Called");
    const postCreation = () => {
      handleConfirm();
      handleClose();
      SetError(null);
    };
    await createConnection(
      values.ms365BusinessCentralConnectionName,
      "MS 365 Business Central",
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
            MS 365 Business Central
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
              ms365BusinessCentralConnectionName: "",
              ms365BusinessCentralBaseURL: "",
              ms365BusinessCentralUserID: "",
              ms365BusinessCentralPassword: "",
            }}
            validationSchema={ms365BusinessCentralFormSchema}
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
                      name="ms365BusinessCentralConnectionName"
                      value={values.ms365BusinessCentralConnectionName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.ms365BusinessCentralConnectionName &&
                        Boolean(errors.ms365BusinessCentralConnectionName)
                      }
                      helperText={
                        touched.ms365BusinessCentralConnectionName &&
                        errors.ms365BusinessCentralConnectionName
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <CustomTextInput
                      required
                      showLabel
                      label={"Base URL"}
                      placeholder="Enter your base URL"
                      name="ms365BusinessCentralBaseURL"
                      value={values.ms365BusinessCentralBaseURL}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.ms365BusinessCentralBaseURL &&
                        Boolean(errors.ms365BusinessCentralBaseURL)
                      }
                      helperText={
                        touched.ms365BusinessCentralBaseURL &&
                        errors.ms365BusinessCentralBaseURL
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <CustomTextInput
                      required
                      showLabel
                      label={"User ID"}
                      placeholder="Enter your User ID"
                      name="ms365BusinessCentralUserID"
                      value={values.ms365BusinessCentralUserID}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.ms365BusinessCentralUserID &&
                        Boolean(errors.ms365BusinessCentralUserID)
                      }
                      helperText={
                        touched.ms365BusinessCentralUserID &&
                        errors.ms365BusinessCentralUserID
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={12}>
                    <CustomTextInput
                      required
                      showLabel
                      label={"Password"}
                      placeholder="Enter your password"
                      name="ms365BusinessCentralPassword"
                      type={showPassword ? "text" : "password"}
                      value={values.ms365BusinessCentralPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.ms365BusinessCentralPassword &&
                        Boolean(errors.ms365BusinessCentralPassword)
                      }
                      helperText={
                        touched.ms365BusinessCentralPassword &&
                        errors.ms365BusinessCentralPassword
                      }
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={toggleShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
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
            loadable
            title={connecting ? "Connecting" : "Connect"}
            onClick={() => formikRef.current.submitForm()}
          />
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}

