/**
 * WebSocket Configuration for VibeGradient
 * Centralized configuration for all WebSocket-related settings
 */

// WebSocket URL
export const VIBE_BASE_URL = process.env.REACT_APP_VIBE_BASE_URL;
export const isLocal = VIBE_BASE_URL?.startsWith("localhost");
export const VIBE_GRADIENT_WS_URL = `${
  isLocal ? "ws" : "wss"
}://${VIBE_BASE_URL}/workflows/stream/tg_workflow`;

// Connection Settings
export const CONNECTION_CONFIG = {
  RECONNECT_ATTEMPTS: 10,
  RECONNECT_INTERVAL: 2000, // 2 seconds
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  NORMAL_CLOSURE_CODE: 1000,
  MAX_MESSAGE_SIZE: 65536, // 64KB
};

// Message Types
export const MESSAGE_TYPES = {
  AI_UNDERSTANDING: "ai_understanding",
  TOOL_CALL: "tool_call",
  TOOL_RESULT: "tool_result",
  FINAL_RESULT: "final_result",
  FINAL_ANSWER: "final_answer",
  ERROR: "error",
};

// Connection Status
export const CONNECTION_STATUS = {
  CONNECTING: "Connecting",
  CONNECTED: "Connected",
  CLOSING: "Closing",
  DISCONNECTED: "Disconnected",
  UNINSTANTIATED: "Uninstantiated",
};

// Error Messages
export const ERROR_MESSAGES = {
  CONNECTION_ERROR: "WebSocket connection error",
  PARSE_ERROR: "Failed to parse message",
  SEND_ERROR: "Failed to send message",
  TIMEOUT_ERROR: "Connection timeout",
};

// Logging Configuration
export const LOGGING_CONFIG = {
  ENABLE_LOGS: true,
  LOG_LEVEL: "info", // 'debug', 'info', 'warn', 'error'
  LOG_CONNECTION_EVENTS: true,
  LOG_MESSAGE_EVENTS: true,
  LOG_ERROR_EVENTS: true,
};

// Development/Production Environment Detection
export const isDevelopment = process.env.NODE_ENV === "development";

// Environment-specific configurations
export const getEnvironmentConfig = () => {
  if (isDevelopment) {
    return {
      ...CONNECTION_CONFIG,
      RECONNECT_INTERVAL: 1000, // Faster reconnection in development
      HEARTBEAT_INTERVAL: 15000, // More frequent heartbeats in development
    };
  }

  return CONNECTION_CONFIG;
};
