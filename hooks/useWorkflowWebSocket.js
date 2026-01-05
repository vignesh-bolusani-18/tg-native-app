// D:\TG_REACT_NATIVE_MOBILE_APP\hooks\useWorkflowWebSocket.js
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Import your configs from utils
import { CONNECTION_CONFIG, LOGGING_CONFIG, MessageBuilders, WebSocketMessageTypes } from "../utils/websocketConfig";
import useAuth from "./useAuth";

/**
 * Improved WebSocket Hook for TG Workflow
 * Adapted for React Native
 */
export const useWorkflowWebSocket = (workflowName = "master_workflow") => {
  const dispatch = useDispatch();
  const { currentCompany, userInfo, userData } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [authToken, setAuthToken] = useState(null);

  // Get conversationId from Redux state
  const conversationId = useSelector(
    (state) => state.vibe?.currentConversationId
  );

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pingTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);
  const isConnectedRef = useRef(false);
  const isMountedRef = useRef(true);
  const handleMessageRef = useRef(null);
  const maxReconnectAttempts = CONNECTION_CONFIG.RECONNECT_ATTEMPTS;

  // Logging utility
  const log = (level, message, data = null) => {
    if (!LOGGING_CONFIG.ENABLE_LOGS) return;
    const logMessage = `[TG Workflow WebSocket] ${message}`;
    switch (level) {
      case "debug": console.log(logMessage, data); break;
      case "info": console.log(logMessage, data); break;
      case "warn": console.warn(logMessage, data); break;
      case "error": console.error(logMessage, data); break;
      default: console.log(logMessage, data);
    }
  };

  // Generate JWT token for WebSocket authentication
  const generateAuthToken = useCallback(async () => {
    try {
      // ⚠️ If no company selected, we still need to authenticate for some basic operations
      // But conversation operations will fail without company ID
      if (!userInfo?.userID) {
        log("error", "Missing user ID for token generation");
        return null;
      }

      // If company is not selected, we can still generate a token but with limitations
      if (!currentCompany?.companyID) {
        log("warn", "No company selected - WebSocket operations will be limited");
        // For now, return null as most operations require a company
        // In production, you might implement company-less operations
        return null;
      }

      log("info", "Generating JWT token for WebSocket authentication");
      const baseUrl = process.env.EXPO_PUBLIC_VIBE_BASE_URL;
      
      // In React Native/Expo, localhost usually refers to the device itself.
      // If you are testing on a real device, ensure your API uses your computer's IP address.
      // Remove /api/v1 from baseUrl if it exists, as generate-token might be at root or specific path
      // But based on user env, it seems everything is under /api/v1
      const url = `https://${baseUrl}/generate-token`;

      const response = await axios.post(
        url,
        {},
        {
          params: {
            user_id: userInfo.userID,
            company_id: currentCompany.companyID,
            expires_hours: 24,
          },
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userData?.token}`
          },
        }
      );

      if (response.status !== 200) {
        throw new Error(
          `Token generation failed: ${response.status} ${response.statusText}`
        );
      }

      const data = response.data;
      const token = data.access_token;

      log("info", "JWT token generated successfully");
      setAuthToken(token);
      return token;
    } catch (error) {
      log("error", "Failed to generate JWT token:", error);
      dispatch({ type: "vibe/setError", payload: "WebSocket authentication failed" });
      return null;
    }
  }, [currentCompany?.companyID, userInfo?.userID, dispatch, userData?.token]);

  // Custom JSON parser that handles NaN values
  const parseJSONWithNaN = useCallback((jsonString) => {
    try {
      return JSON.parse(jsonString);
    } catch (_error) {
      try {
        let sanitized = jsonString;
        sanitized = sanitized.replace(/:\s*NaN\s*([,}])/g, ": null$1");
        sanitized = sanitized.replace(/:\s*NaN\s*$/g, ": null");
        sanitized = sanitized.replace(/"([^"]*)"\s*:\s*NaN\s*([,}])/g, '"$1": null$2');
        sanitized = sanitized.replace(/"([^"]*)"\s*:\s*NaN\s*$/g, '"$1": null');
        sanitized = sanitized.replace(/:\s*Infinity\s*([,}])/g, ": null$1");
        sanitized = sanitized.replace(/:\s*-Infinity\s*([,}])/g, ": null$1");
        sanitized = sanitized.replace(/:\s*Infinity\s*$/g, ": null");
        sanitized = sanitized.replace(/:\s*-Infinity\s*$/g, ": null");
        return JSON.parse(sanitized);
      } catch (secondError) {
        log("error", "Failed to parse JSON even after NaN sanitization");
        throw secondError;
      }
    }
  }, []);

  const startPingPong = useCallback(() => {
    if (pingTimeoutRef.current) {
      clearTimeout(pingTimeoutRef.current);
    }
  }, []);

  // Message handling
  const handleMessage = useCallback((data) => {
      if (data.message_type !== "heartbeat") {
        log("info", "Received message:", data);
      }
      
      if (data.message_type === WebSocketMessageTypes.CONNECTION_ESTABLISHED) {
        log("info", "Connection established message received");
        return;
      }

      if (data.message_type === "query_completed") {
        log("info", "Query completed:", data);
        setIsLoading(false);
        dispatch({ type: "vibe/setStreamingStatus", payload: false });
        dispatch({ type: "vibe/setWaitingForAI", payload: false });
        return;
      }

      if (data.error) {
        log("error", "Error message received:", data.error);
        dispatch({ type: "vibe/setError", payload: data.error });
        setIsLoading(false);
        dispatch({ type: "vibe/setStreamingStatus", payload: false });
        return;
      }

      if (data.langgraph_state) {
        log("info", "LangGraph state update received:", data);

        if (data.conversation_id && !conversationId) {
          dispatch({
            type: "vibe/updateConversationId",
            payload: data.conversation_id,
          });
        }

        dispatch({
          type: "vibe/updateLangGraphState",
          payload: {
            langgraph_state: data.langgraph_state,
            conversation_id: data.conversation_id,
          },
        });
        return;
      }

      dispatch({
        type: "vibe/updateLastMessage",
        payload: data,
      });
    }, [dispatch, conversationId]
  );

  // Update the ref whenever handleMessage changes
  useEffect(() => {
    handleMessageRef.current = handleMessage;
  }, [handleMessage]);

  // Connection management
  const connect = useCallback(async () => {
    if (isConnectingRef.current) {
      log("info", "Connection attempt already in progress");
      return;
    }

    if (isConnectedRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
      log("info", "WebSocket already connected and ready");
      setIsConnected(true);
      setConnectionStatus("connected");
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      log("info", "WebSocket already connected (readyState check)");
      setIsConnected(true);
      setConnectionStatus("connected");
      isConnectedRef.current = true;
      return;
    }

    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      log("info", "WebSocket connection already in progress");
      return;
    }

    if (wsRef.current?.readyState === WebSocket.CLOSING) {
      log("info", "WebSocket is closing, waiting for closure");
      return;
    }

    if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
      log("info", "Creating new WebSocket connection");
    } else {
      log("info", "Using existing WebSocket connection");
      return;
    }

    isConnectingRef.current = true;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    let token = authToken;
    if (!token) {
      token = await generateAuthToken();
      if (!token) {
        log("error", "Failed to generate authentication token");
        if (!currentCompany?.companyID) {
          log("info", "⚠️ WebSocket connection requires a company to be selected");
          dispatch({ type: "vibe/setError", payload: "Please select a workspace to use the chat" });
          setConnectionStatus("disconnected");
        }
        isConnectingRef.current = false;
        return;
      }
    }

    const vibeBaseUrl = process.env.EXPO_PUBLIC_VIBE_BASE_URL;
    // If vibeBaseUrl contains /api/v1, we need to be careful.
    // Usually wss endpoint is at root or specific path.
    // Assuming the user's env: vibe-gradient-api-staging-ap-south-1.truegradient.ai/api/v1
    // The websocket might be at wss://domain/api/v1/workflows/stream...
    const baseUrl = `wss://${vibeBaseUrl}/workflows/stream`;
    const wsUrl = `${baseUrl}/${workflowName}?token=${token}`;
    
    log("info", `Connecting to WebSocket: ${wsUrl}`);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      log("info", "🔗 WebSocket connected successfully");
      setIsConnected(true);
      setConnectionStatus("connected");
      isConnectedRef.current = true;
      reconnectAttemptsRef.current = 0;
      isConnectingRef.current = false;
      startPingPong();

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

      if (pingTimeoutRef.current) {
        clearTimeout(pingTimeoutRef.current);
        pingTimeoutRef.current = null;
      }

      dispatch({ type: "vibe/setConnectionStatus", payload: false });
      dispatch({ type: "vibe/setStreamingStatus", payload: false });

      if (
        event.code !== 1000 && 
        event.code !== 1001 && 
        reconnectAttemptsRef.current < maxReconnectAttempts
      ) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        log("info", `Attempting reconnection in ${delay}ms`);

        reconnectTimeoutRef.current = setTimeout(async () => {
          reconnectAttemptsRef.current++;
          setAuthToken(null);
          await connect();
        }, delay);
      } else if (event.code === 1000) {
        log("info", "WebSocket closed normally");
      } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        log("error", "Max reconnection attempts reached");
        dispatch({ type: "vibe/setError", payload: "Connection failed after maximum retry attempts" });
      }
    };

    ws.onerror = (error) => {
      log("error", "WebSocket error:", error.message);
      dispatch({ type: "vibe/setError", payload: "Connection error" });
    };

    ws.onmessage = (event) => {
      try {
        const data = parseJSONWithNaN(event.data);
        if (handleMessageRef.current) {
          handleMessageRef.current(data);
        }
      } catch (error) {
        log("error", "Failed to parse message:", error);
        dispatch({ type: "vibe/setError", payload: "Invalid message format" });
      }
    };
  }, [workflowName, dispatch, authToken, generateAuthToken, maxReconnectAttempts, parseJSONWithNaN, startPingPong, currentCompany?.companyID]);



  /* Unused - keeping for future use
  const handleInterrupt = useCallback((data) => {
      if (data.conversation_id) {
        dispatch({
          type: "vibe/updateConversationId",
          payload: data.conversation_id,
        });
      }

      if (data.langgraph_state?.__interrupt__) {
        const interruptData = data.langgraph_state.__interrupt__;
        if (interruptData.data) {
          setCurrentCheckpoint({
            checkpointId: interruptData.data.checkpoint_id,
            stateSnapshot: interruptData.data.state_snapshot,
            interruptTimestamp: interruptData.data.interrupt_timestamp,
            threadId: interruptData.data.thread_id,
          });

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
    }, [dispatch]
  );

  /* Unused - keeping for future use
  const updateConversationIdFromProgress = useCallback((data) => {
      if (data.conversation_id && !conversationId) {
        dispatch({
          type: "vibe/updateConversationId",
          payload: data.conversation_id,
        });
      }
    }, [conversationId, dispatch]
  );
  */

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      log("info", "Message sent:", message);
    } else {
      log("error", "WebSocket not connected");
      dispatch({ type: "vibe/setError", payload: "WebSocket not connected" });
    }
  }, [dispatch]);

  const sendQuery = useCallback(({ query = "", updated_state = null, data = {} }) => {
      if (!query.trim() && !updated_state) return;

      const conversation_path = `accounts/${currentCompany?.companyName}_${currentCompany?.companyID}/conversations`;
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
      if (conversationId) {
        message.conversation_id = conversationId;
      }

      setIsLoading(true);
      console.log("sendQuery: message =", message);
      sendMessage(message);
    }, [sendMessage, conversationId, currentCompany?.companyName, currentCompany?.companyID]
  );

  const sendApproval = useCallback((approved) => {
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
    }, [currentCheckpoint, sendMessage, dispatch]
  );

  /* Unused - keeping for future use
  const sendPong = useCallback(() => {
    const message = MessageBuilders.createPongResponse();
    sendMessage(message);
  }, [sendMessage]);
  */



  const disconnect = useCallback(() => {
    if (!isMountedRef.current) {
      log("info", "Component unmounted, skipping disconnect");
      return;
    }

    log("info", "Disconnecting WebSocket...");
    isConnectedRef.current = false;
    isConnectingRef.current = false;

    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);
    if (wsRef.current) wsRef.current.close(1000, "Manual disconnect");

    log("info", "WebSocket disconnect initiated");
  }, []);

  const resetConversation = useCallback(async () => {
    log("info", "Resetting conversation...");
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    setCurrentCheckpoint(null);
    setIsLoading(false);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      log("info", "WebSocket connection is stable");
      setIsConnected(true);
      setConnectionStatus("connected");
      isConnectedRef.current = true;
    } else if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      log("info", "WebSocket is connecting");
    } else {
      log("info", "WebSocket not connected, reconnecting");
      isConnectedRef.current = false;
      isConnectingRef.current = false;
      await connect();
    }
    log("info", "Conversation reset completed");
  }, [connect]);

  useEffect(() => {
    isMountedRef.current = true;
    log("info", `Initializing WebSocket connection for workflow: ${workflowName}`);
    const initializeConnection = async () => {
      await connect();
    };
    initializeConnection();

    return () => {
      isMountedRef.current = false;
      log("info", "Cleaning up WebSocket connection");
      disconnect();
    };
  }, [workflowName, connect, disconnect, currentCompany?.companyID, userInfo?.userID]);

  const canSendMessage = isConnected && !isLoading;
  return {
    canSendMessage,
    conversationId,
    currentCheckpoint,
    connectionStatus,
    sendQuery,
    sendApproval,
    disconnect,
    connect,
    resetConversation,
    getWebSocket: () => wsRef.current,
  };
};