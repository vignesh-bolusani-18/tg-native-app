// components/auth/RegisterPage.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    AuthenticationDetails,
    CognitoUser,
    CognitoUserPool,
} from "amazon-cognito-identity-js";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// Logic imports
import useAuth from "../../hooks/useAuth";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";
import { updateUserInDatabase } from "../../utils/createUserEntry";
import { processToken } from "../../utils/jwtUtils";
import { registerSchema } from "../../utils/validation";

// Assets
const TGIcon = require("../../assets/images/icon.png");

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Expo Router replaces react-router-dom
  const { token } = useLocalSearchParams(); 
  const router = useRouter();
  const { login } = useAuth();
  const { initiateGoogleAuth } = useGoogleAuth();

  const handleGoogleSignup = async () => {
    try {
      await initiateGoogleAuth();
    } catch (error) {
      console.error("Google signup error:", error);
      Toast.show({ type: "error", text1: "Google signup failed" });
    }
  };

  // Initialize Cognito Pool
  const userPool = new CognitoUserPool({
    UserPoolId: process.env.REACT_APP_USER_POOL_ID || "",
    ClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID || "",
  });

  useEffect(() => {
    const fetchToken = async () => {
      try {
        if (token) {
          // Token is passed as string, might need decoding
          const decodedPayload = await processToken(token);
          setPayload(decodedPayload);
        }
      } catch (_error) {
        Toast.show({ type: "error", text1: "Invalid Token" });
      }
    };
    fetchToken();
  }, [token]);

  useEffect(() => {
    // Clear legacy sessions if needed
    AsyncStorage.setItem("registration-initiated", "true");
  }, []);

  const handleSetPassword = async (values) => {
    console.log("Setting password for:", payload?.userName);
    setLoading(true);

    if (!payload) {
      Toast.show({ type: "error", text1: "Missing user information" });
      setLoading(false);
      return;
    }

    const authenticationData = {
      Username: payload.userName,
      Password: payload.tempPassword,
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const userData = {
      Username: payload.userName,
      Pool: userPool,
    };
    const cognitoUser = new CognitoUser(userData);

    // Authenticate to trigger NEW_PASSWORD_REQUIRED challenge
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        // This usually won't happen if password change is required
        console.log("Login success directly");
      },
      onFailure: (err) => {
        console.error("Auth failure:", err);
        Toast.show({ type: "error", text1: "Authentication Failed", text2: err.message });
        setLoading(false);
      },
      newPasswordRequired: async (userAttributes, requiredAttributes) => {
        // Handle the challenge by setting the new password
        // We delete userAttributes.email_verified to avoid config errors
        delete userAttributes.email_verified; 
        delete userAttributes.phone_number_verified;

        cognitoUser.completeNewPasswordChallenge(
          values.password,
          userAttributes,
          {
            onSuccess: async (result) => {
              console.log("Password set successfully");
              
              // Update Database via your API
              try {
                await updateUserInDatabase(
                  payload.userID,
                  values.fullName,
                  "USERS",
                  "INVITATIONS"
                );
                
                Toast.show({ type: "success", text1: "Account created successfully!" });
                
                // Auto Login
                login(
                  payload?.email,
                  values.password,
                  payload?.companyName.toLowerCase()
                );
                
                // Redirect to dashboard (or root in mobile app)
                router.replace("/(tabs)"); 
              } catch (dbError) {
                console.error("DB Update Error:", dbError);
                Toast.show({ type: "error", text1: "Database Update Failed" });
              }
              setLoading(false);
            },
            onFailure: (err) => {
              console.error("Challenge failure:", err);
              Toast.show({ type: "error", text1: "Failed to set password", text2: err.message });
              setLoading(false);
            },
          }
        );
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} className="px-6 py-6">
          
          {/* Header Section */}
          <View className="items-center gap-4 mb-8">
            <Image source={TGIcon} style={{ width: 60, height: 60, resizeMode: "contain" }} />
            <Text variant="headlineSmall" className="font-medium text-gray-900 text-center">
              Welcome to TrueGradient!
            </Text>
            
            {payload && (
              <Text className="text-gray-600 text-base text-center">
                You&apos;ve been invited by <Text className="font-bold">{payload.companyName}</Text> to join as <Text className="font-bold">{payload.userRole}</Text>.
              </Text>
            )}
          </View>

          {/* Social Auth */}
          <Button
            mode="outlined"
            icon={() => <MaterialCommunityIcons name="google" color="#0C66E4" size={18} />}
            onPress={handleGoogleSignup}
            textColor="#0C66E4"
            style={{ borderRadius: 10, borderColor: "#D0D5DD", marginBottom: 12 }}
            contentStyle={{ paddingVertical: 6 }}
          >
            Continue with Google
          </Button>

          <View className="flex-row items-center gap-2 mb-4">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-gray-500 text-xs">or</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Form Section */}
          <Text variant="headlineSmall" className="mb-6 font-medium text-gray-900">
            Create an account
          </Text>

          <Formik
            initialValues={{
              password: "",
              fullName: "",
              confirmPassword: "",
            }}
            validationSchema={registerSchema}
            onSubmit={handleSetPassword}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View className="gap-4">
                {/* Email (Read Only) */}
                <View>
                  <TextInput
                    mode="outlined"
                    label="Email"
                    value={payload?.email || ""}
                    disabled={true}
                    style={{ backgroundColor: "#f0f0f0" }}
                    outlineStyle={{ borderRadius: 8, borderColor: "#D0D5DD" }}
                  />
                </View>

                {/* Full Name */}
                <View>
                  <TextInput
                    mode="outlined"
                    label="Full Name*"
                    placeholder="Your name"
                    value={values.fullName}
                    onChangeText={handleChange("fullName")}
                    onBlur={handleBlur("fullName")}
                    error={touched.fullName && errors.fullName}
                    outlineStyle={{ borderRadius: 8, borderColor: "#D0D5DD" }}
                    className="bg-white"
                  />
                  {touched.fullName && errors.fullName && (
                    <Text className="text-red-600 text-xs mt-1">{errors.fullName}</Text>
                  )}
                </View>

                {/* Password */}
                <View>
                  <TextInput
                    mode="outlined"
                    label="Password*"
                    placeholder="Enter your password"
                    value={values.password}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    secureTextEntry={!showPassword}
                    error={touched.password && errors.password}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? "eye-off" : "eye"}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                    outlineStyle={{ borderRadius: 8, borderColor: "#D0D5DD" }}
                    className="bg-white"
                  />
                  {touched.password && errors.password && (
                    <Text className="text-red-600 text-xs mt-1">{errors.password}</Text>
                  )}
                </View>

                {/* Confirm Password */}
                <View>
                  <TextInput
                    mode="outlined"
                    label="Confirm Password*"
                    placeholder="Confirm your password"
                    value={values.confirmPassword}
                    onChangeText={handleChange("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                    secureTextEntry={!showConfirmPassword}
                    error={touched.confirmPassword && errors.confirmPassword}
                    right={
                      <TextInput.Icon
                        icon={showConfirmPassword ? "eye-off" : "eye"}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    }
                    outlineStyle={{ borderRadius: 8, borderColor: "#D0D5DD" }}
                    className="bg-white"
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text className="text-red-600 text-xs mt-1">{errors.confirmPassword}</Text>
                  )}
                </View>

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  buttonColor="#0C66E4"
                  textColor="white"
                  style={{ borderRadius: 8, marginTop: 12 }}
                  contentStyle={{ paddingVertical: 8 }}
                >
                  {loading ? "Creating..." : "Create Account"}
                </Button>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterPage;