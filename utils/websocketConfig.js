/**
 * WebSocket Configuration for Workflow
 */

export const WebSocketMessageTypes = {
  QUERY: 'query',
  PROGRESS: 'progress',
  COMPLETE: 'complete',
  ERROR: 'error',
  PING: 'ping',
  PONG: 'pong',
  CONNECTION_ESTABLISHED: 'connection_established',
  QUERY_COMPLETED: 'query_completed',
  WORKFLOW_SELECTED: 'workflow_selected',
  NOTIFICATION: 'notification',
  HEARTBEAT: 'heartbeat',
  LANGGRAPH_STATE: 'langgraph_state',
};

export const MessageBuilders = {
  createQuery: (query, conversationId, updatedState) => ({
    type: WebSocketMessageTypes.QUERY,
    query,
    conversationId,
    updated_state: updatedState,
  }),
  createPing: () => ({
    type: WebSocketMessageTypes.PING,
    timestamp: Date.now(),
  }),
  createPong: () => ({
    type: WebSocketMessageTypes.PONG,
    timestamp: Date.now(),
  }),
};

export const CONNECTION_CONFIG = {
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  pingInterval: 30000,
  connectionTimeout: 10000,
};

export const LOGGING_CONFIG = {
  enableDebugLogs: __DEV__,
  logPrefix: '[WebSocket]',
};

export default {
  WebSocketMessageTypes,
  MessageBuilders,
  CONNECTION_CONFIG,
  LOGGING_CONFIG,
};
