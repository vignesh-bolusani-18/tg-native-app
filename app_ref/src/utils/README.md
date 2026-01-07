# WebSocket Management System

This directory contains the WebSocket management utilities for the VibeGradient feature.

## 📁 File Structure

```
src/
├── hooks/
│   ├── useWebSocketManager.js  # Main WebSocket management hook
│   └── useVibe.js             # VibeGradient hook wrapper
└── utils/
    ├── websocketConfig.js     # Configuration and constants
    ├── websocketUtils.js      # Utility functions (non-hooks)
    └── README.md             # This documentation
```

## 🔧 Components

### 1. `websocketConfig.js`
Centralized configuration for all WebSocket-related settings.

**Features:**
- Environment-specific configurations
- Connection settings (reconnect attempts, intervals, etc.)
- Message type constants
- Error message definitions
- Logging configuration

**Usage:**
```javascript
import { 
  VIBE_GRADIENT_WS_URL, 
  CONNECTION_CONFIG, 
  MESSAGE_TYPES,
  getEnvironmentConfig 
} from '../utils/websocketConfig';

// Get environment-specific config
const config = getEnvironmentConfig();
```

### 2. `websocketUtils.js`
Utility functions for WebSocket operations (non-hook functions).

**Features:**
- Connection status utilities
- Message parsing and validation
- Helper functions for common operations

**Usage:**
```javascript
import { WebSocketUtils, WebSocketStatus } from '../utils/websocketUtils';

// Check connection status
const isConnected = WebSocketUtils.isConnected(readyState);
const status = WebSocketUtils.getConnectionStatus(readyState);

// Validate message type
const isValid = WebSocketUtils.isValidMessageType(messageType);
```

### 3. `useWebSocketManager.js` (in hooks folder)
Main WebSocket management hook.

**Features:**
- Persistent WebSocket connection
- Automatic reconnection
- Message queuing
- State management integration
- Comprehensive logging

**Usage:**
```javascript
import { useWebSocketManager } from '../hooks/useWebSocketManager';

// In a React component
const {
  messages,
  isConnected,
  sendMessage,
  resetChat,
  connectionStatus
} = useWebSocketManager();
```

## 🚀 Key Features

### **Persistent Connection**
- WebSocket stays alive throughout the VibeGradient session
- Automatic reconnection on unexpected closures
- Connection persists during "New Chat" operations

### **Smart Message Handling**
- Message queuing when connection is not ready
- Automatic message sending when connection opens
- Proper message parsing and validation

### **Environment-Aware Configuration**
- Different settings for development and production
- Faster reconnection in development
- More frequent heartbeats in development

### **Comprehensive Logging**
- Configurable logging levels
- Environment-specific logging
- Detailed connection and message tracking

### **Error Handling**
- Graceful error recovery
- User-friendly error messages
- Automatic error state management

## 📋 API Reference

### `useWebSocketManager()`
Main hook for WebSocket management.

**Returns:**
```javascript
{
  // State
  messages: Array,
  isConnected: boolean,
  isStreaming: boolean,
  currentProgress: Array,
  error: string | null,
  lastMessage: Object,
  connectionStatus: string,

  // Actions
  sendMessage: Function,
  resetChat: Function,
  getCurrentStreamingMessage: Function,
  canSendMessage: boolean,

  // WebSocket utilities
  readyState: number,
  getWebSocket: Function,
}
```

### `WebSocketUtils`
Utility functions for WebSocket operations.

**Methods:**
- `isConnected(readyState)` - Check if WebSocket is connected
- `canSendMessage(readyState)` - Check if messages can be sent
- `getConnectionStatus(readyState)` - Get human-readable status
- `shouldReconnect(closeEvent)` - Check if reconnection is needed
- `createMessagePayload(message)` - Create message payload
- `parseMessage(messageData)` - Parse incoming messages
- `isValidMessageType(messageType)` - Validate message type
- `getMessageTypeDisplayName(messageType)` - Get display name

## 🔄 Connection Lifecycle

1. **Initialization**: WebSocket connects when component mounts
2. **Message Sending**: Messages are sent immediately if connected, or queued if not
3. **Message Receiving**: Incoming messages are parsed and dispatched to Redux
4. **Reconnection**: Automatic reconnection on unexpected closures
5. **Cleanup**: Connection persists until component unmounts

## 🛠️ Configuration

### Environment Variables
- `NODE_ENV` - Determines development vs production settings

### Logging Configuration
```javascript
LOGGING_CONFIG = {
  ENABLE_LOGS: true,
  LOG_LEVEL: "info", // 'debug', 'info', 'warn', 'error'
  LOG_CONNECTION_EVENTS: true,
  LOG_MESSAGE_EVENTS: true,
  LOG_ERROR_EVENTS: true,
}
```

### Connection Settings
```javascript
CONNECTION_CONFIG = {
  RECONNECT_ATTEMPTS: 10,
  RECONNECT_INTERVAL: 2000, // 2 seconds
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  NORMAL_CLOSURE_CODE: 1000,
  MAX_MESSAGE_SIZE: 65536, // 64KB
}
```

## 🎯 Best Practices

1. **Always use the hook**: Use `useWebSocketManager()` instead of direct WebSocket manipulation
2. **Check connection status**: Always verify `isConnected` before sending messages
3. **Handle errors gracefully**: Use the provided error handling mechanisms
4. **Use utility functions**: Leverage `WebSocketUtils` for common operations
5. **Monitor logs**: Use the comprehensive logging for debugging

## 🔍 Debugging

The system provides extensive logging for debugging:

```javascript
// Enable debug logging
LOGGING_CONFIG.LOG_LEVEL = "debug";

// Check connection status
console.log("Connection status:", connectionStatus);

// Monitor message flow
console.log("Messages:", messages);
console.log("Current progress:", currentProgress);
```

## 🚀 Migration from Old System

The new system is backward compatible. Simply replace:

```javascript
// Old
import { useVibe } from '../hooks/useVibe';

// New (same interface, better implementation)
import { useVibe } from '../hooks/useVibe';
```

The API remains the same, but the underlying implementation is now more robust and maintainable.

## 📁 File Organization

### **Hooks Folder (`src/hooks/`)**
- `useWebSocketManager.js` - Main WebSocket management hook
- `useVibe.js` - VibeGradient hook wrapper

### **Utils Folder (`src/utils/`)**
- `websocketConfig.js` - Configuration and constants
- `websocketUtils.js` - Utility functions (non-hooks)
- `README.md` - Documentation

This organization follows React best practices:
- **Hooks** are in the `hooks/` folder
- **Utilities** are in the `utils/` folder
- **Configuration** is separated from logic
- **Documentation** is comprehensive and up-to-date
