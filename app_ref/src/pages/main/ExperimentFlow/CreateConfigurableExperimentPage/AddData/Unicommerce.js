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

import {
  gSheetFormSchema,
  unicommerceFormSchema,
} from "../../../../../validation";
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

export default function Unicommerce({ open, handleClose, handleConfirm }) {
  const formikRef = React.useRef();
  const {
    createConnection,
    connectionResponse,
    connecting,
    error,
    getError,
    SetError,
  } = useDataConnection();
  const [showPassword, setShowPassword] = React.useState(false);
  const toggleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const handleConnect = async (values) => {
    const payload = {
      tenant: "-",
      tenantURL: values.unicommerceTenantURL,
      user: values.unicommerceUsername,
      password: values.unicommercePassword,
      facility: values.unicommerceFacility,
    };
    console.log("On Click Called");
    const postCreation = () => {
      handleConfirm();
      handleClose();
      SetError(null);
    };
    await createConnection(
      values.unicommerceConnectionName,
      "unicommerce",
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
            Unicommerce
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
              unicommerceConnectionName: "",
              unicommerceTenantURL: "",
              unicommerceFacility: "",
              unicommerceUsername: "",
              unicommercePassword: "",
            }}
            validationSchema={unicommerceFormSchema}
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
                      name="unicommerceConnectionName"
                      value={values.unicommerceConnectionName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.unicommerceConnectionName &&
                        Boolean(errors.unicommerceConnectionName)
                      }
                      helperText={
                        touched.unicommerceConnectionName &&
                        errors.unicommerceConnectionName
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextInput
                      required
                      showLabel
                      label={"Tenant URL"}
                      placeholder="https://<tenant>.unicommerce.com or .co.in"
                      name="unicommerceTenantURL"
                      value={values.unicommerceTenantURL}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.unicommerceTenantURL &&
                        Boolean(errors.unicommerceTenantURL)
                      }
                      helperText={
                        touched.unicommerceTenantURL &&
                        errors.unicommerceTenantURL
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextInput
                      required
                      showLabel
                      label={"Default Facility Code"}
                      placeholder="Enter your facility code"
                      name="unicommerceFacility"
                      value={values.unicommerceFacility}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.unicommerceFacility &&
                        Boolean(errors.unicommerceFacility)
                      }
                      helperText={
                        touched.unicommerceFacility &&
                        errors.unicommerceFacility
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextInput
                      required
                      showLabel
                      label={"Username"}
                      placeholder="Enter your username"
                      name="unicommerceUsername"
                      value={values.unicommerceUsername}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.unicommerceUsername &&
                        Boolean(errors.unicommerceUsername)
                      }
                      helperText={
                        touched.unicommerceUsername &&
                        errors.unicommerceUsername
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <CustomTextInput
                      type={showPassword ? "text" : "password"}
                      required
                      showLabel
                      label={"Password"}
                      placeholder="Enter your password"
                      name="unicommercePassword"
                      value={values.unicommercePassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={toggleShowPassword}
                            onMouseDown={(event) => event.preventDefault()}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                      error={
                        touched.unicommercePassword &&
                        Boolean(errors.unicommercePassword)
                      }
                      helperText={
                        touched.unicommercePassword &&
                        errors.unicommercePassword
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
