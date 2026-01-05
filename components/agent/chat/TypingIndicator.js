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
    <View className="flex-row w-full py-2 bg-white px-4 items-center gap-3">
      {/* Spinning Container */}
      <Animated.View
        style={{
          width: 35,
          height: 35,
          borderRadius: 17.5,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ rotate: spin }], // Rotate container clockwise
        }}
      >
        {/* Counter-Spinning Image to keep it upright while orbiting */}
        <Animated.Image
          source={TGLogo}
          style={{
            width: 20,
            height: 20,
            transform: [{ rotate: counterSpin }], // Rotate image counter-clockwise
          }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Pulsing Text */}
      <View className="flex-1 justify-center">
        <Animated.Text
          style={{
            opacity: textOpacity,
            fontSize: 14,
            fontWeight: "700", // Bold text
            color: "#3b82f6", // Blue color (approx match to your gradient start)
          }}
        >
          {message || "Thinking..."}
        </Animated.Text>
      </View>
    </View>
  );
};

export default TypingIndicator;