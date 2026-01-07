import { ReadyState } from "react-use-websocket";
import {
  CONNECTION_CONFIG,
  MESSAGE_TYPES,
  CONNECTION_STATUS,
} from "./websocketConfig";

/**
 * WebSocket Connection Status Constants
 */
export const WebSocketStatus = {
  CONNECTING: ReadyState.CONNECTING,
  OPEN: ReadyState.OPEN,
  CLOSING: ReadyState.CLOSING,
  CLOSED: ReadyState.CLOSED,
  UNINSTANTIATED: ReadyState.UNINSTANTIATED,
};

/**
 * WebSocket Message Types
 */
export const MessageTypes = MESSAGE_TYPES;

/**
 * WebSocket Configuration
 */
export const WebSocketConfig = {
  ...CONNECTION_CONFIG,
};

/**
 * Utility functions for WebSocket operations
 */
export const WebSocketUtils = {
  /**
   * Check if WebSocket is in a connected state
   */
  isConnected: (readyState) => readyState === ReadyState.OPEN,

  /**
   * Check if WebSocket can send messages
   */
  canSendMessage: (readyState) =>
    readyState === ReadyState.OPEN || readyState === ReadyState.CONNECTING,

  /**
   * Format connection status for display
   */
  getConnectionStatus: (readyState) => {
    const statusMap = {
      [ReadyState.CONNECTING]: CONNECTION_STATUS.CONNECTING,
      [ReadyState.OPEN]: CONNECTION_STATUS.CONNECTED,
      [ReadyState.CLOSING]: CONNECTION_STATUS.CLOSING,
      [ReadyState.CLOSED]: CONNECTION_STATUS.DISCONNECTED,
      [ReadyState.UNINSTANTIATED]: CONNECTION_STATUS.UNINSTANTIATED,
    };
    return statusMap[readyState] || "Unknown";
  },

  /**
   * Check if a close event should trigger reconnection
   */
  shouldReconnect: (closeEvent) =>
    closeEvent.code !== CONNECTION_CONFIG.NORMAL_CLOSURE_CODE,

  /**
   * Create a message payload for sending
   */
  createMessagePayload: (message) => ({ query: message }),

  /**
   * Parse incoming WebSocket message
   */
  parseMessage: (messageData) => {
    try {
      return typeof messageData === "string"
        ? JSON.parse(messageData)
        : messageData;
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
      throw error;
    }
  },

  /**
   * Validate message type
   */
  isValidMessageType: (messageType) => {
    return Object.values(MESSAGE_TYPES).includes(messageType);
  },

  /**
   * Get message type display name
   */
  getMessageTypeDisplayName: (messageType) => {
    const displayNames = {
      [MESSAGE_TYPES.AI_UNDERSTANDING]: "AI Understanding",
      [MESSAGE_TYPES.TOOL_CALL]: "Tool Call",
      [MESSAGE_TYPES.TOOL_RESULT]: "Tool Result",
      [MESSAGE_TYPES.FINAL_RESULT]: "Final Result",
      [MESSAGE_TYPES.FINAL_ANSWER]: "Final Answer",
      [MESSAGE_TYPES.ERROR]: "Error",
    };
    return displayNames[messageType] || messageType;
  },
};
