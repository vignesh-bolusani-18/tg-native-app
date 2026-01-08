// TrueGradient Full Logo Component
import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const TrueGradientLogo = ({ width = 180, height = 44 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 180 44" fill="none">
      <Defs>
        <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#008AE5" />
          <Stop offset="100%" stopColor="#00C6FB" />
        </LinearGradient>
      </Defs>
      {/* This is a placeholder - you'll need to export the actual SVG paths from Figma */}
      {/* For now, showing "TrueGradient" text */}
      <Path
        d="M10 22 L170 22"
        stroke="url(#gradient)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default TrueGradientLogo;
