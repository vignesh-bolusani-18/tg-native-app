// D:\TG_REACT_NATIVE_MOBILE_APP\components\agent\chat\TypingIndicator.js
import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

// Assets
const TGLogo = require("../../../assets/images/icon.png"); // Ensure path is correct

const TypingIndicator = ({ isTyping, message }) => {
  // Animation Values - must be at top level for hooks rules
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isTyping) return;
    
    // 1. Rotation Animation (Infinite)
    // Matches the CSS 'rotate' and 'counterRotate' logic
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 2. Text Pulse Animation (Infinite)
    // Replaces the CSS 'processingGlow' gradient effect
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    pulseAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, [spinValue, pulseValue, isTyping]);

  // Interpolations
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const counterSpin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-360deg"],
  });

  const textOpacity = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1], // Pulse between 60% and 100% opacity
  });

  return (
    <View style={{ flexDirection: 'row', width: '100%', paddingVertical: 12, backgroundColor: 'transparent', paddingHorizontal: 8, alignItems: 'center', gap: 12 }}>
      {/* Spinning Container with Gradient Background */}
      <Animated.View
        style={{
          width: 42,
          height: 42,
          borderRadius: 21,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: '#3B82F6',
          shadowColor: '#3B82F6',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 4,
          transform: [{ rotate: spin }], // Rotate container clockwise
        }}
      >
        {/* Counter-Spinning Image to keep it upright while orbiting */}
        <Animated.Image
          source={TGLogo}
          style={{
            width: 24,
            height: 24,
            tintColor: '#FFFFFF',
            transform: [{ rotate: counterSpin }], // Rotate image counter-clockwise
          }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Pulsing Text */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Animated.Text
          style={{
            opacity: textOpacity,
            fontSize: 15,
            fontWeight: "600", // Semi-bold text
            color: "#1F2937", // Dark gray color for better readability
          }}
        >
          {message || "Thinking..."}
        </Animated.Text>
      </View>
    </View>
  );
};

export default TypingIndicator;