import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Grid,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { ReactComponent as Visibility } from "../../assets/Icons/eye.svg";
import { ReactComponent as VisibilityOff } from "../../assets/Icons/eye-off.svg";
import TGIcon from "../../assets/Images/tg_logo6.svg";
import DotIcon from "../../assets/Images/Dot.svg";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Form, Formik, useFormik } from "formik";
import { CognitoIdentityServiceProvider } from "aws-sdk";
import * as Yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAuth from "./../../hooks/useAuth";
import { generateToken, processToken } from "../../utils/jwtUtils";
import { updateUserInDatabase } from "../../utils/createUserEntry";
import { registerSchema } from "../../validation";
import CustomButton from "../../components/CustomButton";
import CustomTextInput from "../../components/CustomInputControls/CustomTextInput";
import { values } from "lodash";
import * as JWSL from "jsrsasign";

// RSA public key (used for verification)
const publicKey = `-----BEGIN PUBLIC KEY-----
YOUR_PUBLIC_KEY_HERE
-----END PUBLIC KEY-----`;

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
          backgroundColor: "#0C66E4", // Default color for buttons
          "&:hover": {
            backgroundColor: "#115293", // Hover color
          },
          "&.Mui-disabled": {
            backgroundColor: "#C2C2C2", // Custom color for disabled buttons
            color: "#FFFFFF", // Ensure text is visible
          },
        },
      },
    },
  },
});

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [payload, setPayload] = useState(null);
  const [message, setMessage] = useState("");
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const cognito = new CognitoIdentityServiceProvider({
    region: "ap-south-1",
  });

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const payload = await processToken(token);
        setPayload(payload);
      } catch (error) {
        setMessage("Invalid token");
      }
    };

    fetchToken();
  }, [token]);

  useEffect(() => {
    // Broadcast registration event to log out other tabs
    sessionStorage.setItem("registration-initiated", "true");
    localStorage.setItem("registration", Date.now()); // Trigger registration event
  }, []);

  const formikRef = React.useRef();
  console.log("Token:", token);
  console.log("Payload:", JSON.stringify(payload));
  console.log("Email:", payload?.email);
  const toggleShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword((show) => !show);
  };

  const handleSetPassword = async (values) => {
    console.log("setPassword called ");
    try {
      // Initiate Auth with temporary password
      const initiateAuthResponse = await cognito
        .initiateAuth({
          AuthFlow: "USER_PASSWORD_AUTH",
          ClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID,
          AuthParameters: {
            USERNAME: payload.userName,
            PASSWORD: payload.tempPassword,
          },
        })
        .promise();

      // Respond to new password required challenge
      await cognito
        .respondToAuthChallenge({
          ChallengeName: "NEW_PASSWORD_REQUIRED",
          ClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID,
          ChallengeResponses: {
            USERNAME: payload.userName,
            NEW_PASSWORD: values.password,
          },
          Session: initiateAuthResponse.Session,
        })
        .promise();
      console.log(payload.userID, values.fullName, "USERS");
      await updateUserInDatabase(
        payload.userID,
        values.fullName,
        `USERS`,
        `INVITATIONS`
      )
        .then(async (response) => {
          console.log("Add User Response", response);
          toast.success(
            "Password set successfully. You can now log in with your new password."
          );
          navigate(`${payload?.companyName.toLowerCase()}/dashboard`);
        })
        .catch((error) => {
          console.log("Error in Add User Response", error);
        });

      setMessage(
        "Password set successfully. You can now log in with your new password."
      );
      try {
        login(
          payload?.email,
          values.password,
          payload?.companyName.toLowerCase()
        );
      } catch (error) {
        console.log("Error in login", error);
      }
    } catch (error) {
      setMessage(`Error setting password: ${error.message}`);
      toast.error(message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <ToastContainer />
      <Box>
        <Container
          sx={{
            maxWidth: { xs: "90%", md: "900px" },
            padding: "40px 32px",
            gap: "32px",
            borderRadius: "4px 0px 0px 0px",
            borderTop: "1px solid #E3E9F2",
            boxShadow: "0px 1.6px 3.6px #00000021, 0px 0.3px 0.9px #0000001A",
            marginY: "16px",
          }}
        >
          <Grid container spacing={5}>
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Stack spacing={5}>
                <Stack alignItems={"center"} justifyContent={"center"}>
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
                    Welcome to Truegradient!!
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  <Typography
                    sx={{
                      fontFamily: "Inter",
                      fontSize: "16px",
                      fontWeight: "400",
                      lineHeight: "24px",
                      textAlign: "left",
                      color: "#344054",
                    }}
                  >
                    You've been warmly invited by{" "}
                    <Typography
                      component="span"
                      sx={{ fontWeight: "bold", fontSize: "20px" }}
                    >
                      {payload?.companyName}
                    </Typography>{" "}
                    to join our team as the{" "}
                    <Typography component="span" sx={{ fontWeight: "bold" }}>
                      {payload?.userRole}
                    </Typography>
                    !
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={5}>
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
                  Create an account
                </Typography>
                <Formik
                  initialValues={{
                    password: "",
                    fullName: "",
                    confirmPassword: "",
                  }}
                  validationSchema={registerSchema}
                  onSubmit={handleSetPassword}
                  innerRef={formikRef}
                >
                  {({ errors, touched, handleChange, handleBlur, values }) => (
                    <Form>
                      <Stack spacing={3}>
                        <CustomTextInput
                          required
                          showLabel
                          label={"Email"}
                          placeholder="Enter your email"
                          name="email"
                          disabled={true}
                          value={payload?.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.email && Boolean(errors.email)}
                          helperText={touched.email && errors.email}
                        />

                        <CustomTextInput
                          placeholder="Your name"
                          showLabel
                          label={"Full Name*"}
                          name="fullName"
                          value={values.fullName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.fullName && Boolean(errors.fullName)}
                          helperText={touched.fullName && errors.fullName}
                        />

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

                        <CustomTextInput
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          showLabel
                          label={"Confirm Password*"}
                          name="confirmPassword"
                          value={values.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={toggleShowConfirmPassword}
                                onMouseDown={(event) => event.preventDefault()}
                              >
                                {showConfirmPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
                              </IconButton>
                            </InputAdornment>
                          }
                          error={
                            touched.confirmPassword &&
                            Boolean(errors.confirmPassword)
                          }
                          helperText={
                            touched.confirmPassword && errors.confirmPassword
                          }
                        />

                        <CustomButton
                          title={"Create Account"}
                          type="submit"
                          onClick={() => {
                            formikRef.current.submitForm();
                          }}
                          fullWidth
                          loadable
                        />
                      </Stack>
                    </Form>
                  )}
                </Formik>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default RegisterPage;
