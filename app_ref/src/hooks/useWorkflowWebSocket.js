import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { WebSocketMessageTypes, MessageBuilders } from "../types/websocket";
import { CONNECTION_CONFIG, LOGGING_CONFIG } from "../utils/websocketConfig";
import useAuth from "./useAuth";
import axios from "axios";

/**
 * Improved WebSocket Hook for TG Workflow
 * Based on the TrueGradient WebSocket protocol specification
 * Uses native WebSocket API for better control and performance
 * Now includes JWT authentication
 */
export const useWorkflowWebSocket = (workflowName = "master_workflow") => {
  const dispatch = useDispatch();
  const { currentCompany, userInfo } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [authToken, setAuthToken] = useState(null);

  // Get conversationId from Redux state instead of local state
  const conversationId = useSelector(
    (state) => state.vibe.currentConversationId
  );

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pingTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);
  const isConnectedRef = useRef(false);
  const isMountedRef = useRef(true);
  const maxReconnectAttempts = CONNECTION_CONFIG.RECONNECT_ATTEMPTS;

  // Logging utility
  const log = (level, message, data = null) => {
    if (!LOGGING_CONFIG.ENABLE_LOGS) return;

    const logMessage = `[TG Workflow WebSocket] ${message}`;

    switch (level) {
      case "debug":
        console.log(logMessage, data);
        break;
      case "info":
        console.log(logMessage, data);
        break;
      case "warn":
        console.warn(logMessage, data);
        break;
      case "error":
        console.error(logMessage, data);
        break;
      default:
        console.log(logMessage, data);
    }
  };

  // Generate JWT token for WebSocket authentication
  const generateAuthToken = useCallback(async () => {
    if (!currentCompany?.companyID || !userInfo?.userID) {
      log("error", "Missing company ID or user ID for token generation");
      return null;
    }

    try {
      log("info", "Generating JWT token for WebSocket authentication");
      const baseUrl = process.env.REACT_APP_VIBE_BASE_URL;
      const isLocal = baseUrl?.startsWith("localhost");
      const response = await axios.post(
        `${isLocal ? "http" : "https"}://${baseUrl}/generate-token`,
        {},
        {
          params: {
            user_id: userInfo.userID,
            company_id: currentCompany.companyID,
            expires_hours: 24,
          },
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("response", response);
      if (response.status !== 200) {
        throw new Error(
          `Token generation failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.data;
      console.log("data", data);
      const token = data.access_token;

      log("info", "JWT token generated successfully");
      setAuthToken(token);
      return token;
    } catch (error) {
      log("error", "Failed to generate JWT token:", error);
      dispatch({ type: "vibe/setError", payload: "Authentication failed" });
      return null;
    }
  }, [currentCompany?.companyID, userInfo?.userID, dispatch]);

  // Custom JSON parser that handles NaN values
  const parseJSONWithNaN = (jsonString) => {
    try {
      // First try normal JSON.parse
      return JSON.parse(jsonString);
    } catch (error) {
      // If it fails, try to sanitize NaN values
      try {
        let sanitized = jsonString;

        // Replace various NaN patterns with null
        sanitized = sanitized.replace(/:\s*NaN\s*([,}])/g, ": null$1");
        sanitized = sanitized.replace(/:\s*NaN\s*$/g, ": null");
        sanitized = sanitized.replace(
          /"([^"]*)"\s*:\s*NaN\s*([,}])/g,
          '"$1": null$2'
        );
        sanitized = sanitized.replace(/"([^"]*)"\s*:\s*NaN\s*$/g, '"$1": null');

        // Also handle Infinity and -Infinity
        sanitized = sanitized.replace(/:\s*Infinity\s*([,}])/g, ": null$1");
        sanitized = sanitized.replace(/:\s*-Infinity\s*([,}])/g, ": null$1");
        sanitized = sanitized.replace(/:\s*Infinity\s*$/g, ": null");
        sanitized = sanitized.replace(/:\s*-Infinity\s*$/g, ": null");

        return JSON.parse(sanitized);
      } catch (secondError) {
        log("error", "Failed to parse JSON even after NaN sanitization:", {
          originalError: error.message,
          sanitizationError: secondError.message,
          originalData: jsonString,
        });
        throw secondError;
      }
    }
  };

  // Connection management
  const connect = useCallback(async () => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current) {
      log("info", "Connection attempt already in progress");
      return;
    }

    // Check if already connected using multiple indicators
    if (
      isConnectedRef.current &&
      wsRef.current?.readyState === WebSocket.OPEN
    ) {
      log("info", "WebSocket already connected and ready");
      setIsConnected(true);
      setConnectionStatus("connected");
      return;
    }

    // If we have a WebSocket instance but it's in OPEN state, use it
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      log("info", "WebSocket already connected (readyState check)");
      setIsConnected(true);
      setConnectionStatus("connected");
      isConnectedRef.current = true;
      return;
    }

    // If connection is in progress, wait
    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      log("info", "WebSocket connection already in progress");
      return;
    }

    // If we have a WebSocket that's closing, wait for it to close completely
    if (wsRef.current?.readyState === WebSocket.CLOSING) {
      log("info", "WebSocket is closing, waiting for closure");
      return;
    }

    // Only create a new connection if we don't have a valid WebSocket
    if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
      log("info", "Creating new WebSocket connection");
    } else {
      log("info", "Using existing WebSocket connection");
      return;
    }

    // Mark that we're starting a connection
    isConnectingRef.current = true;

    // Clear any existing reconnection timeout to prevent multiple connections
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Generate authentication token first
    let token = authToken;
    if (!token) {
      token = await generateAuthToken();
      if (!token) {
        log("error", "Failed to generate authentication token");
        isConnectingRef.current = false;
        return;
      }
    }

    // Construct WebSocket URL with authentication token
    const vibeBaseUrl = process.env.REACT_APP_VIBE_BASE_URL;
    const isLocal = vibeBaseUrl?.startsWith("localhost");
    const baseUrl = `${
      isLocal ? "ws" : "wss"
    }://${vibeBaseUrl}/workflows/stream`;
    const wsUrl = `${baseUrl}/${workflowName}?token=${token}`;
    log(
      "info",
      `Connecting to WebSocket: ${baseUrl}/${workflowName} (with token)`
    );

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      log("info", "🔗 WebSocket connected successfully");
      log("info", `Connection URL: ${baseUrl}/${workflowName} (with token)`);
      log("info", `Workflow Name: ${workflowName}`);
      setIsConnected(true);
      setConnectionStatus("connected");
      isConnectedRef.current = true;
      reconnectAttemptsRef.current = 0;
      isConnectingRef.current = false;
      startPingPong();

      // Dispatch connection open event
      dispatch({ type: "vibe/setConnectionStatus", payload: true });
      dispatch({ type: "vibe/clearError" });
    };

    ws.onclose = (event) => {
      log("info", `WebSocket closed: ${event.code} - ${event.reason}`);
      setIsConnected(false);
      setConnectionStatus("disconnected");
      setIsLoading(false);
      isConnectedRef.current = false;
      isConnectingRef.current = false;

      // Clear ping/pong timers
      if (pingTimeoutRef.current) {
        clearTimeout(pingTimeoutRef.current);
        pingTimeoutRef.current = null;
      }

      // Dispatch connection close event
      dispatch({ type: "vibe/setConnectionStatus", payload: false });
      dispatch({ type: "vibe/setStreamingStatus", payload: false });

      // Auto-reconnect logic - only for unexpected closures
      if (
        event.code !== 1000 && // Not a normal closure
        event.code !== 1001 && // Not going away
        reconnectAttemptsRef.current < maxReconnectAttempts
      ) {
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttemptsRef.current),
          30000
        );
        log(
          "info",
          `Attempting reconnection in ${delay}ms (attempt ${
            reconnectAttemptsRef.current + 1
          }/${maxReconnectAttempts})`
        );

        reconnectTimeoutRef.current = setTimeout(async () => {
          reconnectAttemptsRef.current++;
          // Clear the old token before reconnecting to force a new one
          setAuthToken(null);
          await connect();
        }, delay);
      } else if (event.code === 1000) {
        log("info", "WebSocket closed normally (manual disconnect)");
      } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        log("error", "Max reconnection attempts reached");
        dispatch({
          type: "vibe/setError",
          payload: "Connection failed after maximum retry attempts",
        });
      }
    };

    ws.onerror = (error) => {
      log("error", "WebSocket error:", error);
      log("error", `Connection URL: ${baseUrl}/${workflowName} (with token)`);
      log("error", `Workflow Name: ${workflowName}`);
      log("error", `WebSocket Ready State: ${wsRef.current?.readyState}`);
      dispatch({ type: "vibe/setError", payload: "Connection error" });
    };

    ws.onmessage = (event) => {
      try {
        const data = parseJSONWithNaN(event.data);
        handleMessage(data);
      } catch (error) {
        log("error", "Failed to parse message:", error);
        log("error", "Raw message data:", event.data);
        dispatch({ type: "vibe/setError", payload: "Invalid message format" });
      }
    };
  }, [workflowName, dispatch, authToken, generateAuthToken]);

  // Message handling
  const handleMessage = useCallback(
    (data) => {
      if (data.message_type !== "heartbeat") {
        log("info", "Received message:", data);
      }
      // Handle different message types based on protocol
      if (data.message_type === WebSocketMessageTypes.CONNECTION_ESTABLISHED) {
        log("info", "Connection established message received");
        return;
      }

      // if(data.message_type === "notification"){
      //   log("info", "Notification message received:", data);
      //   dispatch({type:"vibe/setProcessingStepText", payload: data.message});
      //   return;
      // }

      // Handle query completion
      if (data.message_type === "query_completed") {
        log("info", "Query completed:", data);
        setIsLoading(false);
        dispatch({ type: "vibe/setStreamingStatus", payload: false });
        dispatch({ type: "vibe/setWaitingForAI", payload: false });
        return;
      }

      if (data.error) {
        // Handle errors
        log("error", "Error message received:", data.error);
        dispatch({ type: "vibe/setError", payload: data.error });
        setIsLoading(false);
        // Stop streaming when there's an error
        dispatch({ type: "vibe/setStreamingStatus", payload: false });
        return;
      }

      // Handle LangGraph state updates
      if (data.langgraph_state) {
        log("info", "LangGraph state update received:", data);

        // Extract and store conversation_id from the first response
        if (data.conversation_id && !conversationId) {
          log(
            "info",
            "Received conversation_id from first response:",
            data.conversation_id
          );
          // Update conversation_id in Redux state
          dispatch({
            type: "vibe/updateConversationId",
            payload: data.conversation_id,
          });
        }

        // Simply dispatch the langgraph state update and let vibeSlice handle the logic
        dispatch({
          type: "vibe/updateLangGraphState",
          payload: {
            langgraph_state: data.langgraph_state,
            conversation_id: data.conversation_id,
          },
        });

        return;
      }

      if (data.error) {
        // Handle errors
        log("error", "Error message received:", data.error);
        dispatch({ type: "vibe/setError", payload: data.error });
        setIsLoading(false);
        // Stop streaming when there's an error
        dispatch({ type: "vibe/setStreamingStatus", payload: false });
        return;
      }

      // Update last message for any other message types
      dispatch({
        type: "vibe/updateLastMessage",
        payload: data,
      });
    },
    [dispatch]
  );

  // Handle interrupt in LangGraph state (if needed)
  const handleInterrupt = useCallback(
    (data) => {
      if (data.conversation_id) {
        // Update conversation_id in Redux state
        dispatch({
          type: "vibe/updateConversationId",
          payload: data.conversation_id,
        });
      }

      // Check for interrupt in LangGraph state
      if (data.langgraph_state?.__interrupt__) {
        const interruptData = data.langgraph_state.__interrupt__;
        if (interruptData.data) {
          setCurrentCheckpoint({
            checkpointId: interruptData.data.checkpoint_id,
            stateSnapshot: interruptData.data.state_snapshot,
            interruptTimestamp: interruptData.data.interrupt_timestamp,
            threadId: interruptData.data.thread_id,
          });

          // Add approval request message
          dispatch({
            type: "vibe/addMessage",
            payload: {
              id: Date.now(),
              type: "approval",
              content: "Human approval required",
              timestamp: new Date().toISOString(),
              approvalData: interruptData.data,
            },
          });
        }
      }
    },
    [dispatch]
  );

  // Update conversation ID from progress updates
  const updateConversationIdFromProgress = useCallback(
    (data) => {
      if (data.conversation_id && !conversationId) {
        // Update conversation_id in Redux state
        dispatch({
          type: "vibe/updateConversationId",
          payload: data.conversation_id,
        });
      }
    },
    [conversationId, dispatch]
  );

  // Send messages
  const sendMessage = useCallback(
    (message) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
        log("info", "Message sent:", message);
      } else {
        log("error", "WebSocket not connected");
        dispatch({ type: "vibe/setError", payload: "WebSocket not connected" });
      }
    },
    [dispatch]
  );

  // Send query
  const sendQuery = useCallback(
    ({ query = "", updated_state = null, data = {} }) => {
      if (!query.trim() && !updated_state) return;

      const conversation_path = `accounts/${currentCompany?.companyName}_${currentCompany?.companyID}/conversations`;
      // For the new format, we just send the query directly
      const messageUpdatedState = {
        query: query,
        updated_state: updated_state || {},
        conversation_path: conversation_path,
      };
      const message = updated_state
        ? messageUpdatedState
        : { query: query, conversation_path: conversation_path };

      if (Object.keys(data).length > 0) {
        message.data = data;
        message.updated_state = null;
      }
      // Only add conversation_id if we have one (not for the first message)
      if (conversationId) {
        message.conversation_id = conversationId;
      }

      setIsLoading(true);
      console.log("sendQuery: message =", message);
      // Don't set streaming to true immediately - wait for first AI response
      // dispatch({ type: "vibe/setStreamingStatus", payload: true });
      // console.log("sendQuery: message =", message);
      sendMessage(message);
    },
    [
      sendMessage,
      dispatch,
      conversationId,
      currentCompany?.companyName,
      currentCompany?.companyID,
    ]
  );

  // Send approval
  const sendApproval = useCallback(
    (approved) => {
      if (!currentCheckpoint) {
        log("error", "No pending approval");
        dispatch({ type: "vibe/setError", payload: "No pending approval" });
        return;
      }

      const message = MessageBuilders.createApprovalResponse(
        approved,
        currentCheckpoint.threadId,
        currentCheckpoint.checkpointId,
        currentCheckpoint.stateSnapshot,
        currentCheckpoint.interruptTimestamp
      );

      setIsLoading(true);
      setCurrentCheckpoint(null);
      sendMessage(message);
    },
    [currentCheckpoint, sendMessage, dispatch]
  );

  // Send pong
  const sendPong = useCallback(() => {
    const message = MessageBuilders.createPongResponse();
    sendMessage(message);
  }, [sendMessage]);

  // Ping/pong management
  const startPingPong = useCallback(() => {
    // Clear existing timeout
    if (pingTimeoutRef.current) {
      clearTimeout(pingTimeoutRef.current);
    }
  }, []);

  // Disconnect function
  const disconnect = useCallback(() => {
    // Only disconnect if component is still mounted
    if (!isMountedRef.current) {
      log("info", "Component unmounted, skipping disconnect");
      return;
    }

    log("info", "Disconnecting WebSocket...");

    // Reset connection state
    isConnectedRef.current = false;
    isConnectingRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pingTimeoutRef.current) {
      clearTimeout(pingTimeoutRef.current);
      pingTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000, "Manual disconnect");
    }

    log("info", "WebSocket disconnect initiated");
  }, []);

  // Reset conversation
  const resetConversation = useCallback(async () => {
    log("info", "Resetting conversation...");

    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Reset conversation state (but keep connection state intact)
    setCurrentCheckpoint(null);
    setIsLoading(false);

    // Check connection status and maintain it if stable
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      log("info", "WebSocket connection is stable, ready for new conversation");
      // Ensure connection state is properly set
      setIsConnected(true);
      setConnectionStatus("connected");
      isConnectedRef.current = true;
    } else if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      log(
        "info",
        "WebSocket is connecting, will be ready for new conversation"
      );
    } else {
      log(
        "info",
        "WebSocket not connected, will reconnect for new conversation"
      );
      // Only reset connection state if we need to reconnect
      isConnectedRef.current = false;
      isConnectingRef.current = false;
      // Trigger a fresh connection if needed
      await connect();
    }

    log("info", "Conversation reset completed");
  }, [dispatch, connect]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    log(
      "info",
      `Initializing WebSocket connection for workflow: ${workflowName}`
    );

    // Connect asynchronously
    const initializeConnection = async () => {
      await connect();
    };

    initializeConnection();

    return () => {
      isMountedRef.current = false;
      log("info", "Cleaning up WebSocket connection");
      disconnect();
    };
  }, [workflowName, connect, currentCompany?.companyID, userInfo?.userID]); // Include dependencies for auth

  const canSendMessage = isConnected && !isLoading;
  return {
    // State
    canSendMessage,
    conversationId,
    currentCheckpoint,
    connectionStatus,

    // Actions
    sendQuery,
    sendApproval,
    disconnect,
    connect,
    resetConversation,

    // WebSocket utilities
    getWebSocket: () => wsRef.current,
  };
};
