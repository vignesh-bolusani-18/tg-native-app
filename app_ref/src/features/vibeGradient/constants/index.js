// VibeGradient Feature Constants

export const SUGGESTED_PROMPTS = [
  "Sales are unpredictable each month",
  "We have too much warehouse stock",
  "Our prices aren't competitive enough",
];

export const CHAT_CONFIG = {
  MAX_INPUT_ROWS: 5,
  MAX_LANDING_INPUT_ROWS: 8,
  AUTO_SCROLL_DELAY: 100,
  TYPING_ANIMATION_DURATION: 1400,
  CHAT_CONTAINER_PADDING: "60px 0 0 0",

};

export const STYLES = {
  COLORS: {
    PRIMARY: "#0C66E4",
    SECONDARY: "#0C66E4",
    BACKGROUND: "#ffffff",
    BORDER: "#e5e5e5",
    TEXT_PRIMARY: "#374151",
    TEXT_SECONDARY: "#6b7280",
    USER_MESSAGE_BG: "#f7f7f8",
  },
  FONTS: {
    PRIMARY: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  SPACING: {
    CHAT_CONTAINER_PADDING: "80px 0 120px 0",
    MESSAGE_PADDING: "24px",
    INPUT_PADDING: "16px 24px",
  },
};

export const ANIMATIONS = {
  TYPING_KEYFRAMES: `
    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.4;
      }
      30% {
        transform: translateY(-4px);
        opacity: 1;
      }
    }
  `,
};
