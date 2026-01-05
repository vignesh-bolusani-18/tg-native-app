// components/auth/SignUpPage.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";

// Actions
import {
  initiateOtpLogin,
  setError,
  verifyOtpAndLogin,
} from "../../redux/actions/authActions";

// TrueGradient Logo
const TGIcon = require("../../assets/images/tg_logo6.svg");

const SignUpPage = () => {
  const [otpSent, setOtpSent] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  
  // Create refs for 6 OTP inputs
  const otpRefs = useRef([...Array(6)].map(() => React.createRef()));

  // Get state from Redux
  const { loading, error: authError } = useSelector((state) => state.auth);

  // Validation Schemas
  const emailValidationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
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
      await dispatch(initiateOtpLogin(values.email.toLowerCase()));
      setOtpSent(true);
      dispatch(setError(null));
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  };

  const handleOtpSubmit = async (values) => {
    const otpString = values.otp.join("");
    console.log("Verifying OTP:", otpString);
    try {
      const result = await dispatch(verifyOtpAndLogin(otpString));
      console.log("✅ handleOtpSubmit: OTP verification result:", result);
      
      // Don't navigate immediately - wait for auth flow to complete
      // The verifyOtpAndLogin already handles company fetching/selection
      // Just wait a moment for Redux to update
      setTimeout(() => {
        console.log("🚀 Redirecting after auth completion...");
        router.replace("/");
      }, 100);
    } catch (error) {
      console.error("OTP Verification failed:", error);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ 
            flexGrow: 1, 
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 40
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Card */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 32,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
            maxWidth: 440,
            alignSelf: 'center',
            width: '100%'
          }}>
            
            {/* Header Section */}
            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <Image
                source={TGIcon}
                style={{ width: 64, height: 64, marginBottom: 16, resizeMode: 'contain' }}
              />
              <Text style={{ 
                fontSize: 28, 
                fontWeight: '700', 
                color: '#3B82F6',
                marginBottom: 4,
                letterSpacing: -0.5
              }}>
                TrueGradient
              </Text>
              <Text style={{ 
                fontSize: 24, 
                fontWeight: '600', 
                color: '#1F2937',
                marginBottom: 12
              }}>
                Welcome!
              </Text>
              <Text style={{ 
                fontSize: 15, 
                color: '#374151',
                textAlign: 'center',
                lineHeight: 22,
                paddingHorizontal: 8,
                fontWeight: '500'
              }}>
                {otpSent 
                  ? "We've sent a 6-digit code to your email." 
                  : "Log in to TrueGradient to access your\nAI-powered planning tools."}
              </Text>
            </View>

            {/* Success Message */}
            {otpSent && (
              <View style={{
                backgroundColor: '#ECFDF5',
                borderRadius: 8,
                padding: 12,
                marginBottom: 24,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#86EFAC'
              }}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                <Text style={{ 
                  fontSize: 13, 
                  color: '#047857',
                  marginLeft: 8,
                  flex: 1,
                  fontWeight: '500'
                }}>
                  OTP has been sent to your email. Please check and verify.
                </Text>
              </View>
            )}

            {/* Email Form */}
            {!otpSent && (
              <Formik
                initialValues={{ email: "" }}
                validationSchema={emailValidationSchema}
                onSubmit={handleEmailSubmit}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                  <View>
                    <Text style={{
                      fontSize: 15,
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: 16
                    }}>
                      Continue with Email
                    </Text>
                    
                    <TextInput
                      mode="outlined"
                      label="Email"
                      placeholder="Enter your email"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      error={touched.email && errors.email}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={{
                        backgroundColor: '#FFFFFF',
                        marginBottom: 8
                      }}
                      outlineStyle={{ 
                        borderRadius: 8, 
                        borderColor: touched.email && errors.email ? '#EF4444' : '#E5E7EB',
                        borderWidth: 1.5
                      }}
                      theme={{
                        colors: {
                          primary: '#3B82F6',
                          background: '#FFFFFF',
                          text: '#000000',
                          placeholder: '#9CA3AF',
                          onSurfaceVariant: '#000000'
                        }
                      }}
                      textColor="#000000"
                    />
                    {touched.email && errors.email && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <MaterialCommunityIcons name="alert-circle" size={14} color="#EF4444" />
                        <Text style={{ fontSize: 12, color: '#EF4444', marginLeft: 4 }}>
                          {errors.email}
                        </Text>
                      </View>
                    )}

                    {authError && (
                      <View style={{
                        backgroundColor: '#FEF2F2',
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 16,
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        borderWidth: 1,
                        borderColor: '#FECACA'
                      }}>
                        <MaterialCommunityIcons name="alert-circle" size={18} color="#EF4444" />
                        <View style={{ marginLeft: 8, flex: 1 }}>
                          <Text style={{ fontSize: 13, color: '#991B1B', fontWeight: '600' }}>
                            {authError}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#DC2626', marginTop: 2 }}>
                            Please try again or use Google OAuth
                          </Text>
                        </View>
                      </View>
                    )}

                    <Button
                      mode="contained"
                      onPress={handleSubmit}
                      loading={loading}
                      disabled={loading || !values.email}
                      style={{ 
                        borderRadius: 10, 
                        marginTop: 8,
                        height: 52,
                        elevation: 4,
                        shadowColor: '#2563eb',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        justifyContent: 'center'
                      }}
                      buttonColor="#2563eb"
                      labelStyle={{ 
                        fontSize: 16, 
                        fontWeight: '700',
                        letterSpacing: 0.5,
                        color: '#FFFFFF',
                        lineHeight: 52,
                        textAlign: 'center'
                      }}
                      contentStyle={{ height: 52, justifyContent: 'center' }}
                    >
                      {loading ? "Sending..." : "Send OTP"}
                    </Button>
                  </View>
                )}
              </Formik>
            )}

            {/* OTP Form */}
            {otpSent && (
              <Formik
                initialValues={{ otp: ["", "", "", "", "", ""] }}
                validationSchema={otpSchema}
                onSubmit={handleOtpSubmit}
              >
                {({ values, setFieldValue, handleSubmit }) => (
                  <View>
                    {/* Back Button */}
                    <TouchableOpacity 
                      onPress={() => {
                        setOtpSent(false);
                        dispatch(setError(null));
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 20,
                        paddingVertical: 4
                      }}
                    >
                      <MaterialCommunityIcons name="arrow-left" size={22} color="#6B7280" />
                      <Text style={{ fontSize: 14, color: '#6B7280', marginLeft: 4, fontWeight: '500' }}>
                        Back
                      </Text>
                    </TouchableOpacity>

                    <Text style={{
                      fontSize: 15,
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: 16
                    }}>
                      Enter OTP
                    </Text>

                    {/* 6 Digit Inputs */}
                    <View style={{ 
                      flexDirection: 'row', 
                      justifyContent: 'center',
                      gap: 6,
                      marginBottom: 20,
                      flexWrap: 'nowrap'
                    }}>
                      {values.otp.map((digit, index) => (
                        <TextInput
                          key={index}
                          ref={otpRefs.current[index]}
                          mode="outlined"
                          value={digit}
                          onChangeText={(text) => handleOtpChange(text, index, setFieldValue, values)}
                          onKeyPress={({ nativeEvent }) => handleOtpBackspace(nativeEvent.key, index, values)}
                          keyboardType="number-pad"
                          maxLength={1}
                          style={{ 
                            width: 40, 
                            height: 48, 
                            backgroundColor: '#FFFFFF',
                            textAlign: 'center',
                            minWidth: 40
                          }}
                          outlineStyle={{ 
                            borderRadius: 8, 
                            borderColor: "#D1D5DB",
                            borderWidth: 1.5
                          }}
                          theme={{
                            colors: {
                              primary: '#3B82F6',
                              background: '#FFFFFF',
                              text: '#000000',
                              onSurfaceVariant: '#000000'
                            }
                          }}
                          textColor="#000000"
                          contentStyle={{
                            fontSize: 18,
                            fontWeight: '700',
                            textAlign: 'center',
                            color: '#000000'
                          }}
                        />
                      ))}
                    </View>

                    {authError && (
                      <View style={{
                        backgroundColor: '#FEF2F2',
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#FECACA'
                      }}>
                        <MaterialCommunityIcons name="alert-circle" size={16} color="#EF4444" />
                        <Text style={{ fontSize: 13, color: '#991B1B', marginLeft: 8, fontWeight: '600' }}>
                          {authError}
                        </Text>
                      </View>
                    )}

                    <Button
                      mode="contained"
                      onPress={handleSubmit}
                      loading={loading}
                      disabled={loading}
                      style={{ 
                        borderRadius: 10,
                        height: 52,
                        elevation: 4,
                        shadowColor: '#2563eb',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        justifyContent: 'center'
                      }}
                      buttonColor="#2563eb"
                      labelStyle={{ 
                        fontSize: 16, 
                        fontWeight: '700',
                        letterSpacing: 0.5,
                        color: '#FFFFFF',
                        lineHeight: 52,
                        textAlign: 'center'
                      }}
                      contentStyle={{ height: 52, justifyContent: 'center' }}
                    >
                      {loading ? "Verifying..." : "Verify OTP"}
                    </Button>
                  </View>
                )}
              </Formik>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpPage;