// components/auth/SignUpPage.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useState } from "react";
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
import { loginUser, setError } from "../../redux/actions/authActions";

const TGIcon = require("../../assets/images/icon.png");

// Validation Schema
const loginSchema = Yup.object().shape({
  companyName: Yup.string().required("Company name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const SignUpPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  // Get state from Redux
  const { loading, error: authError } = useSelector((state) => state.auth);

  const handleLogin = async (values) => {
    try {
      dispatch(setError(null));
      await dispatch(loginUser(
        values.email.toLowerCase(),
        values.password,
        values.companyName.toLowerCase()
      ));
      // If login succeeds, redirect to main app
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Login error:", error);
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
                marginBottom: 8
              }}>
                Welcome!
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: '#6B7280', 
                textAlign: 'center',
                lineHeight: 20
              }}>
                Sign in to continue to your account
              </Text>
            </View>

            {/* Login Form */}
            <Formik
              initialValues={{ email: "", password: "", companyName: "" }}
              validationSchema={loginSchema}
              onSubmit={handleLogin}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View>
                  {/* Company Name */}
                  <TextInput
                    mode="outlined"
                    label="Company Name"
                    placeholder="Enter company name"
                    value={values.companyName}
                    onChangeText={handleChange("companyName")}
                    onBlur={handleBlur("companyName")}
                    error={touched.companyName && errors.companyName}
                    autoCapitalize="none"
                    style={{
                      backgroundColor: '#FFFFFF',
                      marginBottom: 8
                    }}
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                      <MaterialCommunityIcons name="alert-circle" size={14} color="#EF4444" />
                      <Text style={{ fontSize: 12, color: '#EF4444', marginLeft: 4 }}>
                        {errors.companyName}
                      </Text>
                    </View>
                  )}

                  {/* Email */}
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
                        background: '#FFFFFF'
                      }
                    }}
                  />
                  {touched.email && errors.email && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                      <MaterialCommunityIcons name="alert-circle" size={14} color="#EF4444" />
                      <Text style={{ fontSize: 12, color: '#EF4444', marginLeft: 4 }}>
                        {errors.email}
                      </Text>
                    </View>
                  )}

                  {/* Password */}
                  <TextInput
                    mode="outlined"
                    label="Password"
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
                      />
                    }
                    style={{
                      backgroundColor: '#FFFFFF',
                      marginBottom: 8
                    }}
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                      <MaterialCommunityIcons name="alert-circle" size={14} color="#EF4444" />
                      <Text style={{ fontSize: 12, color: '#EF4444', marginLeft: 4 }}>
                        {errors.password}
                      </Text>
                    </View>
                  )}

                  {/* Error Display */}
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
                      marginTop: 8,
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
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>

                  {/* Divider */}
                  <View style={{ 
                    marginVertical: 24,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
                    <Text style={{ marginHorizontal: 16, fontSize: 14, color: '#6B7280' }}>
                      or
                    </Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: '#E5E7EB' }} />
                  </View>

                  {/* Google Sign-In Button */}
                  <TouchableOpacity
                    onPress={() => router.push('/auth/login')}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#FFFFFF',
                      borderWidth: 1.5,
                      borderColor: '#E5E7EB',
                      borderRadius: 8,
                      paddingVertical: 14,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1
                    }}
                  >
                    <MaterialCommunityIcons name="google" size={20} color="#DB4437" />
                    <Text style={{
                      marginLeft: 8,
                      fontSize: 15,
                      fontWeight: '600',
                      color: '#1F2937'
                    }}>
                      Continue with Google
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>

            {/* Footer */}
            <View style={{ 
              marginTop: 32,
              paddingTop: 24,
              borderTopWidth: 1,
              borderTopColor: '#E5E7EB'
            }}>
              <Text style={{ 
                fontSize: 12, 
                color: '#6B7280', 
                textAlign: 'center',
                lineHeight: 18
              }}>
                By continuing, you agree to TrueGradient's{'\n'}
                <Text style={{ color: '#3B82F6', fontWeight: '600' }}>Terms of Service</Text>
                {' & '}
                <Text style={{ color: '#3B82F6', fontWeight: '600' }}>Privacy Policy</Text>
              </Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpPage;
