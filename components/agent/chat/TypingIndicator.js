// D:\TG_REACT_NATIVE_MOBILE_APP\components\agent\chat\TypingIndicator.js
/**
 * ⭐ MATCHES tg-application: TypingIndicator with spinning TG logo
 * Shows AI is processing with animated logo and pulsing text
 */
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

// Assets - TG Logo
const TGLogo = require("../../../assets/images/icon.png");

const TypingIndicator = ({ isTyping, message }) => {
  // Animation Values - must be at top level for hooks rules
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(0)).current;
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isTyping) return;
    
    // 1. Rotation Animation (Infinite) - Matches tg-application CSS rotate
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 2. Text Pulse Animation (Infinite)
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

    // 3. Shimmer effect for the text (like gradient animation)
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    spinAnimation.start();
    pulseAnimation.start();
    shimmerAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
      shimmerAnimation.stop();
    };
  }, [spinValue, pulseValue, shimmerValue, isTyping]);

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
    outputRange: [0.6, 1],
  });

  // Don't render if not typing
  if (!isTyping) return null;

  return (
    <View style={styles.container}>
      {/* Spinning Container - Matches tg-application */}
      <Animated.View
        style={[
          styles.spinnerContainer,
          { transform: [{ rotate: spin }] }
        ]}
      >
        {/* Counter-Spinning Image to keep it upright while orbiting */}
        <Animated.Image
          source={TGLogo}
          style={[
            styles.logo,
            { transform: [{ rotate: counterSpin }] }
          ]}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Pulsing Text - Matches tg-application processingGlow */}
      <View style={styles.textContainer}>
        <Animated.Text
          style={[
            styles.text,
            { opacity: textOpacity }
          ]}
        >
          {message || "Thinking..."}
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 4,
    backgroundColor: 'transparent',
    alignItems: 'center',
    gap: 12,
  },
  spinnerContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#10B981', // TG Green
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  logo: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6", // Blue gradient approximation
    letterSpacing: 0.3,
  },
});

export default TypingIndicator;