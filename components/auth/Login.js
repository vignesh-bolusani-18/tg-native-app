import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";
import { setError } from "../../redux/slices/authSlice";

const TGIcon = require("../../assets/images/icon.png");

const loginSchema = Yup.object().shape({
  companyName: Yup.string().required("Company name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Login = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { initiateGoogleAuth } = useGoogleAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const authError = useSelector((state) => state.auth.error);
  const loading = useSelector((state) => state.auth.loading);

  const handleLogin = async (values) => {
    try {
      dispatch(setError(null));
      console.log("Login values:", values);
      // Add your login logic here
    } catch (error) {
      console.error("Login error:", error);
      dispatch(setError(error.message || "Login failed"));
    }
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
                color: '#374151',
                textAlign: 'center',
                lineHeight: 22,
                fontWeight: '500'
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

            {/* Login Form */}
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
                      style={{ backgroundColor: '#FFFFFF' }}
                      outlineStyle={{ 
                        borderRadius: 8, 
                        borderColor: touched.companyName && errors.companyName ? '#EF4444' : '#E5E7EB',
                        borderWidth: 1.5
                      }}
                      theme={{
                        colors: {
                          primary: '#3B82F6',
                          background: '#FFFFFF'
                        }
                      }}
                    />
                    {touched.companyName && errors.companyName && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <MaterialCommunityIcons name="alert-circle" size={12} color="#EF4444" />
                        <Text style={{ fontSize: 12, color: '#EF4444', marginLeft: 4 }}>
                          {errors.companyName}
                        </Text>
                      </View>
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
                      style={{ backgroundColor: '#FFFFFF' }}
                      outlineStyle={{ 
                        borderRadius: 8, 
                        borderColor: touched.email && errors.email ? '#EF4444' : '#E5E7EB',
                        borderWidth: 1.5
                      }}
                      theme={{
                        colors: {
                          primary: '#3B82F6',
                          background: '#FFFFFF'
                        }
                      }}
                    />
                    {touched.email && errors.email && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <MaterialCommunityIcons name="alert-circle" size={12} color="#EF4444" />
                        <Text style={{ fontSize: 12, color: '#EF4444', marginLeft: 4 }}>
                          {errors.email}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Password Input */}
                  <View style={{ marginBottom: 12 }}>
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
                      style={{ backgroundColor: '#FFFFFF' }}
                      outlineStyle={{ 
                        borderRadius: 8, 
                        borderColor: touched.password && errors.password ? '#EF4444' : '#E5E7EB',
                        borderWidth: 1.5
                      }}
                      theme={{
                        colors: {
                          primary: '#3B82F6',
                          background: '#FFFFFF'
                        }
                      }}
                    />
                    {touched.password && errors.password && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <MaterialCommunityIcons name="alert-circle" size={12} color="#EF4444" />
                        <Text style={{ fontSize: 12, color: '#EF4444', marginLeft: 4 }}>
                          {errors.password}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Forgot Password Link */}
                  <TouchableOpacity 
                    onPress={() => console.log("Forgot Password Pressed")}
                    style={{ alignItems: 'flex-end', marginBottom: 16 }}
                  >
                    <Text style={{ color: '#3B82F6', fontWeight: '600', fontSize: 13 }}>
                      Forgot password?
                    </Text>
                  </TouchableOpacity>

                  {/* Error Message Display */}
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
                          Check your credentials and try again
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Login Button */}
                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    loading={loading}
                    disabled={loading}
                    style={{ 
                      borderRadius: 10,
                      height: 52,
                      marginBottom: 16,
                      elevation: 4,
                      shadowColor: '#6366F1',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8
                    }}
                    buttonColor="#6366F1"
                    labelStyle={{ 
                      fontSize: 16, 
                      fontWeight: '700',
                      letterSpacing: 0.5
                    }}
                  >
                    {loading ? "Logging in..." : "Log in"}
                  </Button>

                  {/* Create Account Link */}
                  <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'center', 
                    alignItems: 'center'
                  }}>
                    <Text style={{ fontSize: 14, color: '#6B7280' }}>
                      Don&apos;t have an account?{" "}
                    </Text>
                    <TouchableOpacity onPress={() => router.push("/auth/signup")}>
                      <Text style={{ fontSize: 14, color: '#3B82F6', fontWeight: '600' }}>
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
