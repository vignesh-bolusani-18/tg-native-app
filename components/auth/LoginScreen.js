// components/auth/LoginScreen.js
// Figma-aligned Login and OTP screens
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";
import LoadingScreen from "../LoadingScreen";

// Actions
import {
  initiateOtpLogin,
  setError,
  verifyOtpAndLogin,
} from "../../redux/actions/authActions";

// Logo images - SVG imports
import TGLogo from "../../assets/images/tg_logo1.svg";
import GoogleLogo from "../../assets/images/google-icon-logo-svgrepo-com.svg";

const LoginScreen = () => {
  const [otpSent, setOtpSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { initiateGoogleAuth } = useGoogleAuth();
  
  // Create refs for 6 OTP inputs
  const otpRefs = useRef([...Array(6)].map(() => React.createRef()));

  // Get state from Redux
  const { loading, error: authError } = useSelector((state) => state.auth);

  // Validation Schemas
  const emailValidationSchema = Yup.object().shape({
    email: Yup.string().email("Please enter a valid Email Id").required("Please enter a valid email id"),
  });

  const otpSchema = Yup.object().shape({
    otp: Yup.array()
      .of(
        Yup.string()
          .length(1)
          .matches(/[0-9]/, "Must be a number")
          .required("Required")
      )
      .min(6, "Must be exactly 6 digits"),
  });

  // Handlers
  const handleEmailSubmit = async (values) => {
    console.log("Sending OTP to:", values.email);
    try {
      setShowLoadingScreen(true);
      await dispatch(initiateOtpLogin(values.email.toLowerCase()));
      setUserEmail(values.email);
      
      // Show loading screen for smooth transition
      setTimeout(() => {
        setShowLoadingScreen(false);
        setOtpSent(true);
      }, 1500);
      
      dispatch(setError(null));
    } catch (error) {
      console.error("Error sending OTP:", error);
      setShowLoadingScreen(false);
    }
  };

  const handleOtpSubmit = async (values) => {
    const otpString = values.otp.join("");
    console.log("Verifying OTP:", otpString);
    try {
      setShowLoadingScreen(true);
      const result = await dispatch(verifyOtpAndLogin(otpString));
      console.log("✅ handleOtpSubmit: OTP verification result:", result);
      
      // Show loading screen before navigation
      setTimeout(() => {
        setShowLoadingScreen(false);
        console.log("🚀 Redirecting after auth completion...");
        router.replace("/");
      }, 1500);
    } catch (error) {
      console.error("OTP Verification failed:", error);
      setShowLoadingScreen(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log("🔵 Starting Google OAuth...");
      await initiateGoogleAuth();
    } catch (error) {
      console.error("🔴 Google OAuth failed:", error);
      dispatch(setError("Google sign-in failed. Please try again."));
    }
  };

  const handleResendOTP = async () => {
    if (userEmail) {
      try {
        await dispatch(initiateOtpLogin(userEmail.toLowerCase()));
        console.log("✅ OTP resent successfully");
      } catch (error) {
        console.error("Error resending OTP:", error);
      }
    }
  };

  // Helper to handle OTP input focus
  const handleOtpChange = (text, index, setFieldValue, values) => {
    if (text.length === 1 && index < 5) {
      otpRefs.current[index + 1].current.focus();
    }
    // Update Formik state
    const newOtp = [...values.otp];
    newOtp[index] = text;
    setFieldValue("otp", newOtp);
  };

  const handleOtpBackspace = (key, index, values) => {
    if (key === 'Backspace' && !values.otp[index] && index > 0) {
      otpRefs.current[index - 1].current.focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Loading Screen Overlay */}
      {showLoadingScreen && (
        <View style={styles.loadingOverlay}>
          <LoadingScreen message={otpSent ? "Verifying..." : "Sending code..."} />
        </View>
      )}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* LOGIN SCREEN */}
          {!otpSent && (
            <View style={styles.content}>
              {/* Logo */}
              <View style={styles.logoContainer}>
                <TGLogo width={188} height={40} />
              </View>

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>
                  Enter your Email to get Started!
                </Text>
                <Text style={styles.headerSubtitle}>
                  We&apos;ll send a <Text style={styles.highlightText}>verification code</Text> in your email which you can use to sign in
                </Text>
              </View>

              {/* Email Input Form */}
              <Formik
                initialValues={{ email: "" }}
                validationSchema={emailValidationSchema}
                onSubmit={handleEmailSubmit}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                  <View style={styles.formContainer}>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        mode="outlined"
                        placeholder="Enter your email"
                        value={values.email}
                        onChangeText={handleChange("email")}
                        onBlur={handleBlur("email")}
                        error={touched.email && errors.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={styles.emailInput}
                        outlineStyle={styles.inputOutline}
                        theme={{
                          colors: {
                            primary: '#0F8BFF',
                            text: '#808080',
                            placeholder: '#808080',
                            onSurfaceVariant: '#808080'
                          }
                        }}
                        textColor="#333333"
                      />
                    </View>

                    {/* Email Validation Error */}
                    {touched.email && errors.email && (
                      <Text style={styles.validationError}>{errors.email}</Text>
                    )}

                    {/* Auth Error Message */}
                    {authError && (
                      <Text style={styles.errorText}>{authError}</Text>
                    )}

                    {/* Send OTP Button */}
                    <Button
                      mode="contained"
                      onPress={handleSubmit}
                      loading={loading}
                      disabled={loading || !values.email}
                      style={[
                        styles.continueButton,
                        (!values.email || loading) && styles.continueButtonDisabled
                      ]}
                      buttonColor="#008AE5"
                      labelStyle={styles.continueButtonText}
                    >
                      Continue
                    </Button>

                    {/* Google Sign In Button */}
                    <TouchableOpacity
                      onPress={handleGoogleSignIn}
                      style={styles.googleButton}
                      disabled={loading}
                    >
                      <GoogleLogo width={20} height={20} />
                      <Text style={styles.googleButtonText}>
                        Sign in with Google
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Formik>
            </View>
          )}

          {/* OTP SCREEN */}
          {otpSent && (
            <View style={styles.content}>
              {/* Header with Back Button */}
              <View style={styles.otpHeader}>
                <TouchableOpacity
                  onPress={() => {
                    setOtpSent(false);
                    dispatch(setError(null));
                  }}
                  style={styles.backButton}
                >
                  <MaterialCommunityIcons name="chevron-left" size={24} color="#333333" />
                </TouchableOpacity>
                <View style={styles.logoSmall}>
                  <TGLogo width={188} height={40} />
                </View>
              </View>

              {/* OTP Title */}
              <View style={styles.otpTitleContainer}>
                <Text style={styles.otpTitle}>
                  Please enter the code sent to{'\n'}{userEmail}
                </Text>
              </View>

              {/* OTP Form */}
              <Formik
                initialValues={{ otp: ["", "", "", "", "", ""] }}
                validationSchema={otpSchema}
                onSubmit={handleOtpSubmit}
              >
                {({ values, setFieldValue, handleSubmit }) => (
                  <View style={styles.otpFormContainer}>
                    {/* 6 Digit Inputs */}
                    <View style={styles.otpInputsContainer}>
                      {values.otp.map((digit, index) => (
                        <TextInput
                          key={index}
                          ref={otpRefs.current[index]}
                          mode="flat"
                          value={digit}
                          onChangeText={(text) => handleOtpChange(text, index, setFieldValue, values)}
                          onKeyPress={({ nativeEvent }) => handleOtpBackspace(nativeEvent.key, index, values)}
                          keyboardType="number-pad"
                          maxLength={1}
                          style={styles.otpInput}
                          underlineStyle={styles.otpInputUnderline}
                          theme={{
                            colors: {
                              primary: '#0F8BFF',
                              text: '#333333',
                              background: 'transparent'
                            }
                          }}
                          textColor="#333333"
                          contentStyle={styles.otpInputContent}
                        />
                      ))}
                    </View>

                    {/* Error Message */}
                    {authError && (
                      <View style={styles.otpErrorContainer}>
                        <Text style={styles.otpErrorText}>Invalid code</Text>
                      </View>
                    )}

                    {/* Resend Link */}
                    <View style={styles.resendContainer}>
                      <Text style={styles.resendText}>Didn&apos;t receive the code? </Text>
                      <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
                        <Text style={styles.resendLink}>Resend</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Auto-submit when all 6 digits are entered */}
                    {values.otp.every(d => d.length === 1) && !loading && (
                      <View style={{ marginTop: 20 }}>
                        <Button
                          mode="contained"
                          onPress={handleSubmit}
                          loading={loading}
                          style={styles.continueButton}
                          buttonColor="#0F8BFF"
                          labelStyle={styles.continueButtonText}
                        >
                          Verify
                        </Button>
                      </View>
                    )}
                  </View>
                )}
              </Formik>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 94,
    paddingHorizontal: 32,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    gap: 40,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSmall: {
    position: 'absolute',
    left: '50%',
    marginLeft: -94,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 28,
  },
  headerTitle: {
    fontFamily: 'Inter Display',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: -0.2,
    color: '#333333',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontFamily: 'Inter Display',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#999999',
    textAlign: 'center',
  },
  highlightText: {
    color: '#666666',
  },
  formContainer: {
    width: '100%',
    gap: 28,
  },
  inputWrapper: {
    width: '100%',
  },
  emailInput: {
    backgroundColor: '#FFFFFF',
  },
  inputOutline: {
    borderRadius: 8,
    borderColor: '#EDEDED',
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: -16,
  },
  validationError: {
    fontSize: 11,
    fontFamily: 'Inter Display',
    fontWeight: '500',
    color: '#EF4444',
    marginTop: 4,
    marginBottom: -16,
    width: '100%',
    textAlign: 'left',
    paddingHorizontal: 4,
  },
  continueButton: {
    borderRadius: 8,
    height: 42,
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonContent: {
    height: 42,
  },
  continueButtonText: {
    fontFamily: 'Inter Display',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0,
    color: '#FFFFFF',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 8,
    height: 42,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
  },
  googleButtonText: {
    fontFamily: 'Inter Display',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0,
    color: '#404040',
  },
  // OTP Screen Styles
  otpHeader: {
    width: '100%',
    height: 39,
    position: 'relative',
    marginBottom: 40,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 7.5,
    width: 24,
    height: 24,
  },
  otpTitleContainer: {
    width: '100%',
    marginBottom: 32,
  },
  otpTitle: {
    fontFamily: 'Inter Display',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: '#333333',
    textAlign: 'center',
  },
  otpFormContainer: {
    width: '100%',
    gap: 64,
  },
  otpInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  otpInput: {
    width: 40,
    height: 40,
    backgroundColor: 'transparent',
    textAlign: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  otpInputUnderline: {
    borderBottomWidth: 1.25,
    borderBottomColor: 'rgba(224, 224, 224, 0.8)',
  },
  otpInputContent: {
    fontFamily: 'Inter Display',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    paddingBottom: 8,
    alignSelf: 'center',
  },
  otpErrorContainer: {
    marginTop: -48,
    alignItems: 'center',
  },
  otpErrorText: {
    fontFamily: 'Inter Display',
    fontSize: 12,
    fontWeight: '500',
    color: '#EF4444',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendText: {
    fontFamily: 'Inter Display',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#666666',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  resendLink: {
    fontFamily: 'Inter Display',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#333333',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
