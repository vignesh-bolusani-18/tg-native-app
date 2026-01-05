import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
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
import { useRouter } from "expo-router";
import * as Yup from "yup";

// Logic & Validation
import { loginUser, setError } from "../../redux/actions/authActions";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";

// Create a basic validation schema if you haven't migrated 'validation.js' yet
const loginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
  companyName: Yup.string().required("Company Name is required"),
});

// Assets
const TGIcon = require("../../assets/images/icon.png");

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { initiateGoogleAuth } = useGoogleAuth();

  // Access Redux state directly
  const { error: authError, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Clear errors on mount
    dispatch(setError(null));
  }, [dispatch]);

  const handleLogin = async (values) => {
    console.log("Login Values:", values);
    dispatch(
      loginUser(
        values.email.toLowerCase(),
        values.password,
        values.companyName.toLowerCase()
      )
    );
  };

  const handleGoogleLogin = async () => {
    try {
      dispatch(setError(null));
      await initiateGoogleAuth();
    } catch (error) {
      console.error("Google login error:", error);
      dispatch(setError("Google login failed. Please try again."));
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
                color: '#6B7280',
                textAlign: 'center',
                lineHeight: 22
              }}>
                Log in to TrueGradient to access your{"\n"}AI-powered planning tools.
              </Text>
            </View>

            {/* Google OAuth Button */}
            <Button
              mode="outlined"
              icon="google"
              onPress={handleGoogleLogin}
              style={{ 
                borderRadius: 8,
                borderWidth: 1.5,
                borderColor: '#E5E7EB',
                height: 48,
                marginBottom: 20
              }}
              labelStyle={{ 
                fontSize: 15, 
                fontWeight: '600',
                color: '#374151',
                letterSpacing: 0.2
              }}
              contentStyle={{ height: 48 }}
            >
              Continue with Google
            </Button>

            {/* Divider */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center',
              marginVertical: 24
            }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
              <Text style={{ 
                fontSize: 13, 
                color: '#9CA3AF',
                marginHorizontal: 16,
                fontWeight: '500'
              }}>
                OR
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
            </View>

            {/* Formik Form */}
            <Formik
              initialValues={{ email: "", password: "", companyName: "" }}
              validationSchema={loginSchema}
              onSubmit={handleLogin}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View>
                  {/* Company Name Input */}
                  <View style={{ marginBottom: 16 }}>
                    <TextInput
                      mode="outlined"
                      label="Company name*"
                      placeholder="Enter your company name"
                      value={values.companyName}
                      onChangeText={handleChange("companyName")}
                      onBlur={handleBlur("companyName")}
                      error={touched.companyName && errors.companyName}
                      outlineStyle={{ borderRadius: 8, borderColor: "#E5E7EB", borderWidth: 1.5 }}
                      style={{ backgroundColor: '#FFFFFF' }}
                      textColor="#1F2937"
                    />
                    {touched.companyName && errors.companyName && (
                      <Text style={{ 
                        color: '#DC2626', 
                        fontSize: 12, 
                        marginTop: 4,
                        marginLeft: 4
                      }}>
                        {errors.companyName}
                      </Text>
                    )}
                  </View>

                  {/* Email Input */}
                  <View style={{ marginBottom: 16 }}>
                    <TextInput
                      mode="outlined"
                      label="Email*"
                      placeholder="Enter your email"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      error={touched.email && errors.email}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      left={<TextInput.Icon icon="email-outline" color="#9CA3AF" />}
                      outlineStyle={{ borderRadius: 8, borderColor: "#E5E7EB", borderWidth: 1.5 }}
                      style={{ backgroundColor: '#FFFFFF' }}
                      textColor="#1F2937"
                    />
                    {touched.email && errors.email && (
                      <Text style={{ 
                        color: '#DC2626', 
                        fontSize: 12, 
                        marginTop: 4,
                        marginLeft: 4
                      }}>
                        {errors.email}
                      </Text>
                    )}
                  </View>

                  {/* Password Input */}
                  <View style={{ marginBottom: 16 }}>
                    <TextInput
                      mode="outlined"
                      label="Password*"
                      placeholder="Enter your password"
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      error={touched.password && errors.password}
                      secureTextEntry={!showPassword}
                      right={
                        <TextInput.Icon
                          icon={showPassword ? "eye-off" : "eye"}
                          onPress={() => setShowPassword(!showPassword)}
                          color="#9CA3AF"
                        />
                      }
                      outlineStyle={{ borderRadius: 8, borderColor: "#E5E7EB", borderWidth: 1.5 }}
                      style={{ backgroundColor: '#FFFFFF' }}
                      textColor="#1F2937"
                    />
                    {touched.password && errors.password && (
                      <Text style={{ 
                        color: '#DC2626', 
                        fontSize: 12, 
                        marginTop: 4,
                        marginLeft: 4
                      }}>
                        {errors.password}
                      </Text>
                    )}
                  </View>

                  {/* Forgot Password Link */}
                  <TouchableOpacity 
                    onPress={() => console.log("Forgot Password Pressed")}
                    style={{ alignItems: 'flex-end', marginBottom: 20 }}
                  >
                    <Text style={{ 
                      color: '#6366F1', 
                      fontWeight: '600', 
                      fontSize: 14,
                      letterSpacing: 0.1
                    }}>
                      Forgot password?
                    </Text>
                  </TouchableOpacity>

                  {/* Error Message Display */}
                  {authError ? (
                    <View style={{ 
                      backgroundColor: '#FEF2F2', 
                      padding: 12, 
                      borderRadius: 8, 
                      borderWidth: 1,
                      borderColor: '#FECACA',
                      marginBottom: 20
                    }}>
                      <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'flex-start', 
                        gap: 8 
                      }}>
                        <MaterialCommunityIcons name="alert-circle" size={20} color="#DC2626" />
                        <View style={{ flex: 1 }}>
                          <Text style={{ 
                            color: '#991B1B', 
                            fontSize: 14, 
                            fontWeight: '600',
                            marginBottom: 2
                          }}>
                            {authError}
                          </Text>
                          <Text style={{ 
                            color: '#DC2626', 
                            fontSize: 12,
                            lineHeight: 16
                          }}>
                            Check your credentials and try again
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : null}

                  {/* Login Button */}
                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}
                    buttonColor="#6366F1"
                    textColor="white"
                    contentStyle={{ height: 48 }}
                    labelStyle={{ 
                      fontSize: 16, 
                      fontWeight: '600',
                      letterSpacing: 0.3
                    }}
                    style={{ borderRadius: 8, marginBottom: 20 }}
                  >
                    {loading ? "Logging in..." : "Log in"}
                  </Button>

                  {/* Create Account Link */}
                  <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <Text style={{ 
                      color: '#6B7280', 
                      fontSize: 14
                    }}>
                      Don't have an account?
                    </Text>
                    <TouchableOpacity onPress={() => router.push("/auth/signup")}>
                      <Text style={{ 
                        color: '#6366F1', 
                        fontWeight: '600', 
                        fontSize: 14,
                        letterSpacing: 0.1
                      }}>
                        Create Account
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;