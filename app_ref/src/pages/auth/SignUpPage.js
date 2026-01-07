import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  Stack,
  Divider,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Form, Field, Formik } from "formik";
import * as Yup from "yup";
import CustomButton from "../../components/CustomButton";
import CustomTextInput from "../../components/CustomInputControls/CustomTextInput";
// import TGIcon from "../../assets/Images/tg_logo6.svg";
import { useNavigate } from "react-router-dom";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ERROR } from "../../theme/custmizations/colors";
import { setError } from "../../redux/slices/authSlice";
import { useDispatch } from "react-redux";
import TGIcon from "../../assets/Images/tg_logo4.svg";
import GoogleSignIn from "../../components/GoogleSignIn";
import {
  initiateOtpLogin,
  verifyOtpAndLogin,
} from "../../redux/actions/authActions";

const SignUpPage = () => {
  const [otpError, setOtpError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const formikRef = useRef();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const emailValidationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
  });

  const OtpSchema = Yup.object().shape({
    otp: Yup.array()
      .of(
        Yup.string()
          .length(1)
          .matches(/[0-9]/, "Must be a number")
          .required("Required")
      )
      .length(6, "Must be exactly 6 digits"),
  });

  const handleEmailSubmit = async (values) => {
    console.log("🟡 handleEmailSubmit: Email submission button clicked");
    setEmailLoading(true);
    setEmailError("");

    try {
      await dispatch(initiateOtpLogin(values.email.toLowerCase()));
      setOtpSent(true);
      setOtpError(null);
      setEmailError(null);
      console.log("✅ handleEmailSubmit: OTP sent successfully");
    } catch (error) {
      console.error("🔴 handleEmailSubmit: Error occurred:", error);
      // Handle rate limit errors
      if (
        error.code === "RATE_LIMIT_EXCEEDED" ||
        error.message?.includes("Too many OTP")
      ) {
        setEmailError(
          error.message ||
            `Too many OTP requests. Please wait ${
              error.retryAfter || 60
            } seconds before requesting another OTP.`
        );
      } else {
        setEmailError(
          "Network error. Please check your connection and try again."
        );
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handleOtpSubmit = async (values) => {
    console.log("🟡 handleOtpSubmit: OTP submission started");
    setLoading(true);
    setOtpError("");
    const otpString = values.otp.join("");

    try {
      await dispatch(verifyOtpAndLogin(otpString));
      console.log("✅ handleOtpSubmit: OTP verification successful");

      // Routing will automatically redirect to company path if company is auto-selected,
      // or to /sso/listCompany if no company is available
      // No explicit navigation needed
    } catch (error) {
      console.error("🔴 handleOtpSubmit: Error occurred:", error);
      setOtpError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Container
        sx={{
          width: { xs: "90%", sm: "443px" },
          marginTop: "16px",
          marginBottom: "16px",
          padding: "40px 32px",
          gap: "32px",
          borderRadius: "4px 0px 0px 0px",
          borderTop: "1px solid #E3E9F2",
          boxShadow: "0px 1.6px 3.6px #00000021, 0px 0.3px 0.9px #0000001A",
        }}
      >
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
              Welcome!
            </Typography>
          </Stack>
          <Stack
            spacing={2}
            sx={{
              mb: 4,
              textAlign: "center",
              maxWidth: "300px",
              alignSelf: "center",
            }}
          >
            {process.env.REACT_APP_ENV === "staging" ||
            process.env.REACT_APP_ENV === "production" ? (
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "16px",
                  fontWeight: "350",
                  lineHeight: "24px",
                  color: "#222222",
                }}
              >
                {process.env.REACT_APP_ENV === "staging" ||
                process.env.REACT_APP_ENV === "production"
                  ? "Log in to TrueGradient to access your AI-powered planning tools."
                  : "Login with OTP"}
              </Typography>
            ) : (
              <Typography
                sx={{
                  fontFamily: "Inter",
                  fontSize: "30px",
                  fontWeight: "500",
                  lineHeight: "36.31px",
                  color: "#222222",
                }}
              >
                Login with OTP
              </Typography>
            )}
          </Stack>
        </Stack>
        <Divider sx={{ my: 3 }} />

        {/* Always show email input first */}
        {!otpSent && (
          <Formik
            initialValues={{ email: "" }}
            validationSchema={emailValidationSchema}
            onSubmit={handleEmailSubmit}
            innerRef={formikRef}
          >
            {({ errors, touched, handleChange, handleBlur, values }) => (
              <Form>
                <Stack spacing={3}>
                  {(process.env.REACT_APP_ENV === "staging" ||
                    process.env.REACT_APP_ENV === "production") && (
                    <>
                      {/* Google Sign-In Button */}
                      <GoogleSignIn />
                      {/* OR Divider */}
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        sx={{ my: 2 }}
                      >
                        <Divider sx={{ flex: 1 }} />
                        <Typography
                          sx={{
                            fontFamily: "Inter",
                            fontSize: "14px",
                            fontWeight: "400",
                            color: "#667085",
                            px: 1,
                          }}
                        >
                          OR
                        </Typography>
                        <Divider sx={{ flex: 1 }} />
                      </Stack>
                    </>
                  )}
                  <CustomTextInput
                    placeholder="Email"
                    showLabel
                    label="Continue with Email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                  {emailError ? (
                    <Stack direction={"row"} spacing={1} alignItems={"center"}>
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
                        {emailError}
                      </Typography>
                    </Stack>
                  ) : null}
                  <CustomButton
                    title={`${emailLoading ? "Loading..." : "Send OTP"}`}
                    type="submit"
                    onClick={() => {
                      console.log("This button is clicked");
                    }}
                    fullWidth
                    disabled={!values.email || emailLoading}
                  />
                </Stack>
              </Form>
            )}
          </Formik>
        )}

        {/* OTP input form */}
        {otpSent && (
          <Formik
            initialValues={{ otp: ["", "", "", "", "", ""] }}
            validationSchema={OtpSchema}
            onSubmit={handleOtpSubmit}
          >
            {({ values, errors, touched, isSubmitting, setFieldValue }) => {
              const handlePaste = (event) => {
                event.preventDefault();
                const pastedData = event.clipboardData
                  .getData("text")
                  .slice(0, 6);
                const newOtp = [...values.otp];
                for (let i = 0; i < pastedData.length; i++) {
                  if (i < 6) {
                    newOtp[i] = pastedData[i];
                  }
                }
                setFieldValue("otp", newOtp);
                // Focus on the last filled input or the next empty one
                const lastFilledIndex = newOtp.findLastIndex(
                  (val) => val !== ""
                );
                const focusIndex =
                  lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
                inputRefs.current[focusIndex]?.focus();
              };

              return (
                <Form>
                  {/* Back Button */}
                  <IconButton
                    sx={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      color: "#222222",
                    }}
                    onClick={() => {
                      setOtpSent(false); // Reset the OTP state
                      setError(null); // Reset the error state when going back
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>

                  <Typography
                    sx={{
                      mb: 2,
                      fontFamily: "Inter",
                      fontSize: "16px",
                      fontWeight: "500",
                      color: "#222222",
                    }}
                  >
                    Enter OTP
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <Field name={`otp[${index}]`} key={index}>
                        {({ field }) => (
                          <TextField
                            {...field}
                            inputProps={{
                              maxLength: 1,
                              style: {
                                textAlign: "center",
                                fontSize: "1.5rem",
                              },
                            }}
                            sx={{
                              width: "3rem",
                              "& .MuiOutlinedInput-root": {
                                height: "3rem",
                              },
                            }}
                            variant="outlined"
                            error={touched.otp && errors.otp}
                            inputRef={(el) => (inputRefs.current[index] = el)}
                            onChange={(e) => {
                              field.onChange(e);
                              if (e.target.value !== "" && index < 5) {
                                inputRefs.current[index + 1]?.focus();
                              }
                            }}
                            onKeyDown={(e) => {
                              if (
                                e.key === "Backspace" &&
                                field.value === "" &&
                                index > 0
                              ) {
                                inputRefs.current[index - 1]?.focus();
                              }
                            }}
                            onPaste={handlePaste}
                            aria-label={`OTP digit ${index + 1}`}
                          />
                        )}
                      </Field>
                    ))}
                  </Box>

                  {touched.otp && errors.otp && (
                    <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                      {errors.otp[0]}
                    </Typography>
                  )}
                  {otpError ? (
                    <Stack
                      direction={"row"}
                      spacing={1}
                      alignItems={"center"}
                      mb={2}
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
                        {otpError}
                      </Typography>
                    </Stack>
                  ) : null}

                  {loading && (
                    <Box
                      sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        zIndex: 9999,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: "20px",
                          borderRadius: "8px",
                          backgroundColor: "white",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <CircularProgress size={60} thickness={4} />
                        <Typography
                          sx={{
                            mt: 2,
                            fontFamily: "Inter",
                            fontSize: "16px",
                            fontWeight: "500",
                            color: "#222222",
                          }}
                        >
                          Verifying OTP...
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  <CustomButton
                    title={`${loading ? "Loading..." : "Verify OTP"}`}
                    type="submit"
                    onClick={() => {
                      console.log("This button is clicked");
                    }}
                    fullWidth
                  />
                </Form>
              );
            }}
          </Formik>
        )}
      </Container>
    </Box>
  );
};

export default SignUpPage;
