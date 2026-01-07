/**
 * WebSocket Types for TG Workflow Integration
 * Based on the TrueGradient WebSocket protocol specification
 */

// Base WebSocket Message Interface
export const WebSocketMessageTypes = {
  CONNECTION_ESTABLISHED: "connection_established",
  PROGRESS_UPDATE: "progress_update",
  HUMAN_APPROVAL_REQUEST: "human_approval_request",
  QUERY_COMPLETED: "query_completed",
  APPROVAL_RESULT: "approval_result",
  PING: "ping",
  PONG: "pong",
  KEEP_ALIVE: "keep_alive",
  ERROR: "error",
};

// Client → Server Messages
export const ClientMessageTypes = {
  QUERY_REQUEST: "query_request",
  APPROVAL_RESPONSE: "approval_response",
  PONG_RESPONSE: "pong_response",
};

// Server → Client Messages
export const ServerMessageTypes = {
  CONNECTION_ESTABLISHED: "connection_established",
  PROGRESS_UPDATE: "progress_update",
  HUMAN_APPROVAL_REQUEST: "human_approval_request",
  LANGGRAPH_STATE: "langgraph_state",
  SYSTEM_MESSAGE: "system_message",
};

// Progress Update Status
export const ProgressStatus = {
  PROCESSING: "processing",
  COMPLETED: "completed",
  ERROR: "error",
  ROUTING: "routing",
};

// Approval Response Types
export const ApprovalResponse = {
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

// WebSocket Event Types
export const WebSocketEventTypes = {
  PROGRESS_UPDATE: "progress_update",
  HUMAN_APPROVAL_REQUEST: "human_approval_request",
  LANGGRAPH_STATE: "langgraph_state",
  SYSTEM_MESSAGE: "system_message",
};

// Message Interfaces (for documentation and type checking)
export const MessageInterfaces = {
  // Client → Server
  QueryRequest: {
    query: "string",
    conversation_id: "optional-uuid-for-resume",
  },

  ApprovalResponse: {
    approval_response: "APPROVED | REJECTED",
    conversation_id: "uuid-from-interrupt",
    checkpoint_id: "checkpoint_uuid",
    state_snapshot: "object",
    interrupt_timestamp: "number",
    approval_timestamp: "number",
  },

  PongResponse: {
    message_type: "pong",
    timestamp: "number",
  },

  // Server → Client
  ConnectionEstablished: {
    message_type: "connection_established",
    message: "string",
    timestamp: "number",
  },

  ProgressUpdate: {
    type: "progress_update",
    node: "string",
    message: "string",
    status: "processing | completed | error | routing",
  },

  HumanApprovalRequest: {
    type: "human_approval_request",
    module_name: "string",
    reasoning: "string",
    thread_id: "string",
    checkpoint_id: "string",
    interrupt_timestamp: "number",
    state_snapshot: "object",
  },

  LangGraphState: {
    langgraph_state: "object",
    conversation_id: "string",
    timestamp: "number",
  },

  SystemMessage: {
    message_type:
      "query_completed | approval_result | ping | keep_alive | error",
    message: "string",
    timestamp: "number",
  },
};

// Utility functions for message validation
export const MessageValidators = {
  isQueryRequest: (data) => {
    return data && typeof data.query === "string";
  },

  isApprovalResponse: (data) => {
    return (
      data &&
      data.approval_response &&
      (data.approval_response === "APPROVED" ||
        data.approval_response === "REJECTED") &&
      data.conversation_id &&
      data.checkpoint_id
    );
  },

  isProgressUpdate: (data) => {
    return data && data.type === "progress_update" && data.node && data.message;
  },

  isHumanApprovalRequest: (data) => {
    return (
      data &&
      data.type === "human_approval_request" &&
      data.module_name &&
      data.thread_id &&
      data.checkpoint_id
    );
  },

  isLangGraphState: (data) => {
    return data && data.langgraph_state;
  },

  isSystemMessage: (data) => {
    return (
      data && data.message_type && WebSocketMessageTypes[data.message_type]
    );
  },
};

// Message builders for consistent message creation
export const MessageBuilders = {
  createQueryRequest: (query, conversationId = null) => ({
    query,
    ...(conversationId && { conversation_id: conversationId }),
  }),

  createApprovalResponse: (
    approved,
    conversationId,
    checkpointId,
    stateSnapshot,
    interruptTimestamp
  ) => ({
    approval_response: approved ? "APPROVED" : "REJECTED",
    conversation_id: conversationId,
    checkpoint_id: checkpointId,
    state_snapshot: stateSnapshot,
    interrupt_timestamp: interruptTimestamp,
    approval_timestamp: Date.now() / 1000,
  }),

  createPongResponse: () => ({
    message_type: "pong",
    timestamp: Date.now() / 1000,
  }),
};

export default {
  WebSocketMessageTypes,
  ClientMessageTypes,
  ServerMessageTypes,
  ProgressStatus,
  ApprovalResponse,
  WebSocketEventTypes,
  MessageInterfaces,
  MessageValidators,
  MessageBuilders,
};



