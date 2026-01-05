// components/auth/ForgotPassword.js
import React, { useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

// Assets
const TGIcon = require("../../assets/images/icon.png");

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleResend = () => {
    console.log("Resend email for", email);
    // Add logic here if needed
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-8 justify-center gap-8">
        
        {/* Header */}
        <View className="items-center">
          <Image source={TGIcon} style={{ width: 60, height: 60, resizeMode: "contain" }} />
          <Text className="text-xl font-medium text-gray-900 mt-3">Welcome back!</Text>
        </View>

        {/* Info Text */}
        <View className="gap-2">
          <Text className="text-3xl font-medium text-gray-900">Forgot password?</Text>
          <Text className="text-base text-gray-600">
            Enter the email address you used when you joined and we’ll send you instructions to reset your password.
          </Text>
        </View>

        {/* Form */}
        <View className="gap-6">
          <View>
            <TextInput
              mode="outlined"
              label="Email*"
              placeholder="you@company.com"
              value={email}
              onChangeText={setEmail}
              left={<TextInput.Icon icon="email-outline" color="#667085" />}
              outlineStyle={{ borderRadius: 8, borderColor: "#D0D5DD" }}
              className="bg-white"
              textColor="#101828"
            />
          </View>

          <Button
            mode="contained"
            onPress={() => console.log("Send Reset Link")}
            disabled={!email}
            buttonColor="#0C66E4"
            textColor="white"
            style={{ borderRadius: 8 }}
            contentStyle={{ paddingVertical: 8 }}
          >
            Log in
          </Button>

          <View className="items-center gap-1">
            <Text className="text-gray-600 text-sm">
              Haven&apos;t received the notification email yet?
            </Text>
            <TouchableOpacity onPress={handleResend}>
              <Text className="text-[#0C66E4] font-medium text-sm">Resend</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
};

export default ForgotPassword;