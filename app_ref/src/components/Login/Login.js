// src/components/Login.js

import React, { useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Stack,
  Button,
  InputAdornment,
  IconButton,
  Checkbox,
} from "@mui/material";
import { Formik, Form } from "formik";
import { ReactComponent as Visibility } from "../../assets/Icons/eye.svg";
import { ReactComponent as VisibilityOff } from "../../assets/Icons/eye-off.svg";
import { ReactComponent as MailIcon } from "../../assets/Icons/mail.svg";
import TGIcon from "../../assets/Images/tg_logo6.svg";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import CustomButton from "../CustomButton";
import { loginSchema } from "../../validation";
import useAuth from "../../hooks/useAuth";
import CustomTextInput from "../CustomInputControls/CustomTextInput";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { ERROR } from "../../theme/custmizations/colors";
import CustomAutocomplete from "../CustomInputControls/CustomAutoComplete";

const typoStyles = {
  textfieldStyle: {
    display: "flex",
    justifyContent: "center",
    height: "44px",
    padding: "12px 0px",
    gap: "8px",
    borderRadius: "8px",
    border: "1px solid #D0D5DD",
    backgroundColor: "#FFFFFF",
    boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.1)",
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderWidth: "0",
      },
    },
    "& .MuiOutlinedInput-root.Mui-focused": {
      "& fieldset": {
        borderWidth: "0",
      },
    },
  },
  placeholder: {
    fontFamily: "Inter",
    fontSize: "16px",
    fontWeight: "400",
    lineHeight: "24px",
    textAlign: "center",
    color: "#667085",
  },
  textSmMedium: {
    fontFamily: "Inter",
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "20px",
    textAlign: "left",
    color: "#344054",
  },
  numberText: {
    fontFamily: "Inter",
    fontSize: "12px",
    fontWeight: "400",
    lineHeight: "18px",
    textAlign: "left",
    color: "#8A8A8A",
  },
};

const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: "10px 18px 10px 18px",
          gap: "8px",
          borderRadius: "8px",
          border: "1px solid #0C66E4",
          backgroundColor: "#0C66E4",
          "&:hover": {
            backgroundColor: "#115293",
            color: "red",
          },
          "&.Mui-disabled": {
            backgroundColor: "#C2C2C2",
            color: "#FFFFFF",
          },
        },
      },
    },
  },
});

const Login = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [refresh, setRefresh] = React.useState(false);
  const { login, authError, loading, setError } = useAuth();

  const roleMap = {
    Admin: "admin",
    Creator: "creator",
    Viewer: "viewer",
  };

  const roles = ["Admin", "Creator", "Viewer"];
  const [role, setrole] = React.useState(roles[0]);
  const navigate = useNavigate();

  const toggleShowPassword = () => {
    setShowPassword((show) => !show);
  };
  useEffect(() => {
    setError(null);
  }, []);
  const handleLogin = (values) => {
    console.log(values);
    console.log(roleMap[role]);
    login(
      values.email.toLowerCase(),
      values.password,
      values.companyName.toLowerCase()
    );
    setRefresh(!refresh);
  };
  const formikRef = React.useRef();
  console.log("Error", authError);
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ height: "100%" }}>
        <Container
          sx={{
            width: "443px",
            marginTop: "16px",
            marginBottom: "16px",
            padding: "40px 32px",
            gap: "32px",
            borderRadius: "4px 0px 0px 0px",
            borderTop: "1px solid #E3E9F2",
            boxShadow: "0px 1.6px 3.6px #00000021, 0px 0.3px 0.9px #0000001A",
          }}
        >
          <Formik
            initialValues={{ email: "", password: "", companyName: "" }}
            validationSchema={loginSchema}
            onSubmit={handleLogin}
            innerRef={formikRef}
          >
            {({ errors, touched, handleChange, handleBlur, values }) => (
              <Form>
                <Stack direction="column" spacing={3}>
                  <Stack>
                    <img src={TGIcon} alt="tgicon" height="60px" />
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        paddingTop: "12px",
                        fontSize: "20px",
                        fontWeight: "500",
                        lineHeight: "24px",
                        textAlign: "center",
                        color: "#222222",
                      }}
                    >
                      Welcome back!
                    </Typography>
                  </Stack>

                  <Stack spacing={1}>
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "30px",
                        fontWeight: "500",
                        lineHeight: "36.31px",
                        textAlign: "left",
                        color: "#222222",
                      }}
                    >
                      Log in
                    </Typography>

                    {/* <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "16px",
                        fontWeight: "400",
                        lineHeight: "24px",
                        textAlign: "left",
                        color: "#344054",
                      }}
                    >
                      Welcome back! Please enter your password.
                    </Typography> */}
                  </Stack>

                  <Stack spacing={3}>
                    <Stack>
                      <CustomTextInput
                        showLabel
                        required
                        label={"Company name*"}
                        name="companyName"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.companyName}
                        placeholder={"Enter your company name"}
                        error={
                          touched.companyName && Boolean(errors.companyName)
                        }
                        helperText={touched.companyName && errors.companyName}
                      />
                    </Stack>
                    <Stack spacing={1}>
                      <CustomTextInput
                        required
                        showLabel
                        label={"Email*"}
                        placeholder="Enter your email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        startAdornment={
                          <InputAdornment position="start">
                            <IconButton aria-label="toggle password visibility">
                              <MailIcon />
                            </IconButton>
                          </InputAdornment>
                        }
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                      />
                    </Stack>

                    <Stack spacing={1}>
                      <CustomTextInput
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        showLabel
                        label={"Password*"}
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={toggleShowPassword}
                              onMouseDown={(event) => event.preventDefault()}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password}
                      />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <a href="#" style={{ textDecoration: "none" }}>
                          <Typography
                            sx={{
                              ...typoStyles.textSmMedium,
                              color: "#0C66E4",
                            }}
                          >
                            Forgot password?
                          </Typography>
                        </a>
                      </Box>
                    </Stack>

                    {/* <Stack spacing={1} direction="row" alignItems="center">
                      <Checkbox defaultChecked size="small" />
                      <Typography sx={{ ...typoStyles.textSmMedium, color: "#344054" }}>
                        Remember me for 90 days
                      </Typography>
                    </Stack> */}
                    {authError ? (
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
                          {authError}
                        </Typography>
                      </Stack>
                    ) : null}
                    <CustomButton
                      title={loading ? "Logging in..." : "Log in"}
                      type="submit"
                      fullWidth
                      onClick={() => {
                        formikRef.current.submitForm();
                      }}
                    />
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={1}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "14px",
                        fontWeight: "400",
                        lineHeight: "20px",
                        color: "#667085",
                      }}
                    >
                      Don’t have an account?
                    </Typography>
                    <Typography
                      onClick={() => navigate("/auth/signup")}
                      sx={{
                        fontFamily: "Inter",
                        fontSize: "14px",
                        fontWeight: "500",
                        lineHeight: "20px",
                        color: "#0C66E4",
                        textTransform: "none",
                        cursor: "pointer",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Create Account
                    </Typography>
                  </Stack>
                </Stack>
              </Form>
            )}
          </Formik>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
