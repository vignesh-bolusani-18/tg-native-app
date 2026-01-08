import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions, TouchableOpacity, StyleSheet, Easing } from 'react-native';

const AnimatedSidebarModal = ({ visible, onClose, children, side = 'left' }) => {
  const [shouldRender, setShouldRender] = useState(visible);
  
  // Animation values
  const startPos = side === 'left' ? -300 : 300;
  const slideAnim = useRef(new Animated.Value(startPos)).current; 
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Sync shouldRender with visible
  useEffect(() => {
    if (visible) {
      setShouldRender(true);
    }
  }, [visible]);

  useEffect(() => {
    // Determine start/end positions based on side
    const hiddenPos = side === 'left' ? -300 : 300;
    const shownPos = 0;

    console.log('[AnimatedSidebarModal] Animation triggered:', { visible, side, hiddenPos, shownPos, shouldRender });

    if (visible) {
      // Force reset to start position to prevent "fast" opening/jumping
      slideAnim.setValue(hiddenPos);
      fadeAnim.setValue(0);
      
      console.log('[AnimatedSidebarModal] Starting OPEN animation, duration: 600ms');
      
      // Animate IN with smooth bezier easing - much slower and smoother
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: shownPos,
          duration: 600,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ]).start(() => {
        console.log('[AnimatedSidebarModal] OPEN animation COMPLETE');
      });
    } else if (shouldRender) {
      console.log('[AnimatedSidebarModal] Starting CLOSE animation, duration: 500ms');
      
      // Animate OUT with smooth bezier easing - slower and smoother
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: hiddenPos,
          duration: 500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ]).start(() => {
        console.log('[AnimatedSidebarModal] CLOSE animation COMPLETE, unmounting');
        // Unmount after animation
        setShouldRender(false);
      });
    }
  }, [visible, slideAnim, fadeAnim, shouldRender, side]);

  if (!shouldRender) return null;

  return (
    <View style={styles.overlay}>
       {/* Backdrop */}
       <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
         <TouchableOpacity style={styles.backdropTouch} onPress={onClose} activeOpacity={1} />
       </Animated.View>

       {/* Sidebar Content */}
       <Animated.View style={[
         styles.sidebarContainer, 
         { transform: [{ translateX: slideAnim }] },
         side === 'left' ? { left: 0, marginLeft: 12 } : { right: 0, marginRight: 12 }
       ]}>
         {children}
       </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1050,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdropTouch: {
    flex: 1,
  },
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 280,
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
});

export default AnimatedSidebarModal;
