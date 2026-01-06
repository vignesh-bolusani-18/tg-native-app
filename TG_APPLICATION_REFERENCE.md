# TG-Application Reference - Dataset Upload Flow

## Overview
This document contains the complete implementation details from the mobile app (which was converted from tg-application). Since the tg-application workspace is not accessible through VS Code's API even though it's open in a split view, this provides the reference implementation.

---

## 📁 File 1: DataUploadSection Component

**Location**: `components/agent/actions/DataUploadSection.js`  
**Original Source**: `D:\TrueGradient\tg-application\src\components\VibeGradient\DataUploadSection.js`

### Key Features:
1. **File Selection** - Uses expo-document-picker for CSV file selection
2. **Metadata Upload** - Uploads metadata to S3 via `uploadMetadataToS3` hook
3. **Workflow State Management** - Updates langgraph state with dataset info
4. **Optimized State Updates** - Removed `editMessage` to prevent massive reload

### Implementation Details:

```javascript
const DataUploadSection = ({ uploadData, messageId }) => {
  const currentDataTag = uploadData?.data ? Object.keys(uploadData.data)[0] : 'base';
  const { sendQuery } = useWorkflowWebSocket();
  const { setProcessingStepText, setIsWaitingForAI, currentConversation, setDataUploaded } = useVibe();
  const { uploadMetadataToS3 } = useExperiment();
  const { currentCompany } = useAuth();
```

### Upload Flow:

```javascript
const handleUpload = async () => {
  // 1. Prepare paths
  const companyPath = `accounts/${currentCompany?.companyName}_${currentCompany?.companyID}`;
  const metaDataPath = `${companyPath}/customer_data/data_library/metadata/${fileName}.json`;
  const uploadCSVPath = `${companyPath}/customer_data/data_library/uploads/${fileName}.csv`;
  
  // 2. Create metadata
  const metadata = {
    columns: [],
    preview: {},
    fileName,
    tags,
    source: "File Upload"
  };
  
  // 3. Upload metadata (optional - may fail if endpoint doesn't exist)
  try {
    await uploadMetadataToS3({ metaData: metadata, path: metaDataPath });
  } catch (metaErr) {
    console.warn('Metadata upload skipped:', metaErr.message);
  }
  
  // 4. Create dataset info
  const datasetInfo = {
    datasetName: fileName,
    datasetTag: tags[0] || 'base',
    metaDataPath: metaDataPath,
    sourceName: "File Upload",
    dataConnectionName: "",
  };
  
  // 5. Update workflow state
  const uploadState = {
    ...uploadData,
    workflow_status: { ...uploadData?.workflow_status, data_loaded: true },
    next_step: { user: "", ai: "tags_generator" },
    data: {
      ...uploadData?.data,
      [currentDataTag]: {
        ...uploadData?.data?.[currentDataTag],
        sample_data_path: uploadCSVPath,
        metadata_path: metaDataPath,
        dataset_info: datasetInfo,
      },
    },
  };
  
  // 6. Update local state
  setIsWaitingForAI(true);
  setProcessingStepText("Processing data...");
  setDataUploaded(true);
  
  // 7. Send to backend - NO DELAY NEEDED
  sendQuery({ query: "", updated_state: uploadState });
};
```

### Critical Optimization:
```javascript
// ⚠️ DO NOT call editMessage - it triggers massive state update
// The sendQuery below will handle state propagation
console.log('⚡ [DataUpload] Skipping editMessage to prevent reload');

// ⭐ Send immediately - no delay needed since we removed editMessage
sendQuery({ query: "", updated_state: uploadState });
```

---

## 📁 File 2: useExperiment Hook

**Location**: `hooks/useExperiment.js`  
**Original Source**: `D:\TrueGradient\tg-application\src\hooks\useExperiment.js`

### uploadMetadataToS3 Function:

```javascript
const uploadMetadataToS3 = useCallback(async ({ metaData, path }) => {
  try {
    console.log('[useExperiment] Uploading metadata to S3:', path);
    
    // Import utilities
    const { apiConfig } = await import('../utils/apiConfig');
    const { getItem } = await import('../utils/storage');
    const { getAccessToken } = await import('../utils/getAccessToken');
    
    // Get authentication token
    const refreshToken = await getItem('refresh_token_company') || await getItem('refresh_token');
    let accessToken = null;
    if (refreshToken) {
      try {
        accessToken = await getAccessToken(refreshToken);
      } catch (e) {
        console.warn('[useExperiment] Could not get access token:', e.message);
      }
    }

    // Upload to backend (which handles S3)
    const response = await fetch(`${apiConfig.apiBaseURL}/upload-metadata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiConfig.apiKey || '',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ metaData, path }),
    });

    if (!response.ok) {
      throw new Error(`Failed to upload metadata: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error('[useExperiment] Error uploading metadata:', err);
    throw err;
  }
}, []);
```

### Key Features:
- **Authentication Chain**: Tries refresh_token_company → refresh_token → no auth
- **Backend Proxy**: Sends to `/upload-metadata` endpoint which handles S3
- **Error Handling**: Throws errors but doesn't crash the flow

---

## 📁 File 3: WebSocket Hook - Message Flow

**Location**: `hooks/useWorkflowWebSocket.js`

### sendQuery Function:

```javascript
const sendQuery = useCallback(({ query = "", updated_state = null, data = {} }) => {
  console.log('🚀 [WEBSOCKET] SENDING QUERY TO AGENT');
  
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
  sendMessage(message);
}, [sendMessage, conversationId, currentCompany?.companyName, currentCompany?.companyID]);
```

### handleMessage Function:

```javascript
const handleMessage = useCallback((data) => {
  console.log('📨 [WEBSOCKET] MESSAGE RECEIVED');
  console.log('   Type:', data.message_type);
  console.log('   Has langgraph_state:', !!data.langgraph_state);
  
  // CRITICAL: Check for langgraph_state FIRST before message_type
  if (data.langgraph_state) {
    console.log('📦 LangGraph State Data');
    
    const lgState = data.langgraph_state;
    const currentNode = Object.keys(lgState)[0];
    
    // Check if this is a final response node
    const finalResponseNodes = [
      'conversation_handler',
      'final_output_node', 
      'module_decider_final_response',
      'data_demander',
      'sample_data_fetcher',
      'tags_generator_final_response'
    ];
    
    const isFinalResponse = finalResponseNodes.includes(currentNode);
    
    // Update conversation ID if provided
    if (data.conversation_id && !conversationId) {
      dispatch({
        type: "vibe/updateConversationId",
        payload: data.conversation_id,
      });
    }

    // Dispatch to Redux - this adds the message
    dispatch({
      type: "vibe/updateLangGraphState",
      payload: {
        langgraph_state: data.langgraph_state,
        conversation_id: data.conversation_id,
      },
    });
    return;
  }
  
  // Handle other message types...
}, [dispatch, conversationId]);
```

---

## 📁 File 4: Redux Slice - State Management

**Location**: `redux/slices/vibeSlice.js`

### updateLangGraphState Reducer:

```javascript
updateLangGraphState: (state, action) => {
  const { langgraph_state, conversation_id } = action.payload;
  
  // ⭐ OPTIMIZATION: Check if state actually changed
  const targetConversationId = conversation_id || state.currentConversationId;
  const currentState = state.conversations?.[targetConversationId]?.langgraphState;
  const currentStateJSON = JSON.stringify(currentState);
  const newStateJSON = JSON.stringify(langgraph_state);
  
  if (currentStateJSON === newStateJSON) {
    console.log('⚡ State unchanged - skipping update');
    return; // Early return prevents re-render
  }
  
  // Ensure conversations object exists
  if (!state.conversations) {
    state.conversations = {};
  }
  
  // Update conversation ID if provided
  if (conversation_id && conversation_id !== state.currentConversationId) {
    state.currentConversationId = conversation_id;
  }

  // Create conversation if it doesn't exist
  if (!state.conversations[targetConversationId]) {
    state.conversations[targetConversationId] = {
      id: targetConversationId,
      title: `Chat ${targetConversationId.slice(-4)}`,
      messages: [],
      // ... other properties
    };
  }
  
  // Update langgraph state
  state.conversations[targetConversationId].langgraphState = langgraph_state;
  const currentNode = Object.keys(langgraph_state)[0];
  
  // Define final response states
  const finalResponseStates = [
    "module_decider_final_response",
    "data_demander",
    "sample_data_fetcher",
    "tags_generator_final_response",
    "context_questions_generator",
    "advanced_questions_generator",
    "experiment_validator",
    "workflow_complete",
    "conversation_handler",
    "final_output_node",
  ];
  
  const isFinalResponse = finalResponseStates.includes(currentNode);
  
  if (isFinalResponse) {
    // Extract AI response from different node types
    let aiResponse = null;
    const finalStateName = currentNode;
    const finalState = langgraph_state[finalStateName];
    
    if (finalStateName === "conversation_handler") {
      aiResponse = finalState.answer;
    } else if (finalStateName === "final_output_node") {
      aiResponse = finalState.final_output?.explanation;
    } else {
      const responseKey = responseKeyMapping[finalStateName];
      if (responseKey && finalState?.response?.[responseKey]) {
        aiResponse = finalState.response[responseKey];
      }
    }
    
    // Create AI message if response found
    if (aiResponse && typeof aiResponse === "string") {
      const aiMessage = {
        id: Date.now(),
        type: "ai",
        nodeName: finalStateName,
        timestamp: new Date().toISOString(),
        content: aiResponse,
        langgraphState: finalState,
        conversationId: conversation_id,
      };
      
      const conversation = state.conversations[targetConversationId];
      if (!conversation.messages) {
        conversation.messages = [];
      }
      
      // ⭐ OPTIMIZATION: Prevent duplicate messages
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      const isDuplicate = lastMessage && 
        lastMessage.type === 'ai' && 
        lastMessage.nodeName === finalStateName &&
        Math.abs(lastMessage.id - aiMessage.id) < 1000;
      
      if (!isDuplicate) {
        conversation.messages.push(aiMessage);
        conversation.messageCount = conversation.messages.length;
        conversation.lastMessagePreview = aiResponse.substring(0, 100);
        conversation.updatedAt = new Date().toISOString();
      }
    }
  }
}
```

---

## 🔄 Complete Upload Workflow

### Step-by-Step Flow:

1. **User Selects File**
   ```javascript
   DocumentPicker.getDocumentAsync() → setSelectedFile(file)
   ```

2. **User Clicks Upload**
   ```javascript
   handleUpload() → setIsUploading(true)
   ```

3. **Generate Paths**
   ```javascript
   metaDataPath = accounts/{company}/customer_data/data_library/metadata/{fileName}.json
   uploadCSVPath = accounts/{company}/customer_data/data_library/uploads/{fileName}.csv
   ```

4. **Upload Metadata (Optional)**
   ```javascript
   uploadMetadataToS3({ metaData: {...}, path: metaDataPath })
   // May fail - that's OK, workflow continues
   ```

5. **Build Dataset Info**
   ```javascript
   datasetInfo = {
     datasetName: fileName,
     datasetTag: tags[0],
     metaDataPath: metaDataPath,
     sourceName: "File Upload"
   }
   ```

6. **Update Workflow State**
   ```javascript
   uploadState = {
     ...uploadData,
     workflow_status: { data_loaded: true },
     next_step: { user: "", ai: "tags_generator" },
     data: { [currentDataTag]: { dataset_info: datasetInfo } }
   }
   ```

7. **Update Local UI State**
   ```javascript
   setDataUploaded(true)
   setIsWaitingForAI(true)
   setProcessingStepText("Processing data...")
   ```

8. **Send to Backend**
   ```javascript
   sendQuery({ query: "", updated_state: uploadState })
   // This sends via WebSocket to backend workflow
   ```

9. **Backend Processes**
   - Receives updated_state via WebSocket
   - Workflow transitions to `tags_generator` node
   - Processes the dataset

10. **Backend Response**
    ```javascript
    { 
      langgraph_state: { 
        tags_generator_final_response: { 
          response: { tags_generator: "Tags generated..." } 
        } 
      },
      conversation_id: "xyz"
    }
    ```

11. **WebSocket Receives Response**
    ```javascript
    handleMessage(data) → dispatch(updateLangGraphState)
    ```

12. **Redux Updates State**
    ```javascript
    updateLangGraphState → Creates AI message → Updates conversation
    ```

13. **UI Re-renders**
    - Shows AI message with tags
    - Hides "Processing..." indicator
    - Shows next workflow step

---

## 🎯 Key Differences from Web Version

### Mobile App (React Native):
1. Uses `expo-document-picker` instead of HTML file input
2. Uses `AsyncStorage` for token storage
3. Uses React Native WebSocket API
4. Requires special handling for file URIs

### Web Version (tg-application):
1. Uses HTML `<input type="file">`
2. Uses `localStorage` for tokens
3. Uses browser WebSocket API
4. Direct file access via File API

---

## 🔧 API Endpoints Used

### 1. Generate WebSocket Token
```
POST https://{VIBE_BASE_URL}/generate-token
Params: { user_id, company_id, expires_hours: 24 }
Headers: { Authorization: Bearer {refresh_token_company} }
Response: { access_token, expires_at }
```

### 2. Upload Metadata
```
POST https://{API_BASE_URL}/upload-metadata
Headers: { 
  Content-Type: application/json,
  x-api-key: {API_KEY},
  Authorization: Bearer {access_token}
}
Body: { metaData: {...}, path: "s3/path/to/metadata.json" }
Response: { success: true }
```

### 3. WebSocket Connection
```
wss://{VIBE_BASE_URL}/workflows/stream/master_workflow?token={ws_token}
```

### 4. WebSocket Message Format
```javascript
// Query with state update
{
  query: "",
  updated_state: { workflow_status: {...}, next_step: {...}, data: {...} },
  conversation_path: "accounts/{company}/conversations",
  conversation_id: "uuid"
}

// Response format
{
  langgraph_state: { [nodeName]: { response: {...} } },
  conversation_id: "uuid"
}
```

---

## 📊 Workflow State Structure

```javascript
{
  workflow_status: {
    data_loaded: boolean,
    tags_generated: boolean,
    context_collected: boolean,
    experiment_created: boolean
  },
  next_step: {
    user: "uploaded_data" | "confirmed_tags" | "",
    ai: "tags_generator" | "context_questions_generator" | ""
  },
  data: {
    [dataTag]: {
      sample_data_path: "s3/path/to/data.csv",
      metadata_path: "s3/path/to/metadata.json",
      dataset_info: {
        datasetName: string,
        datasetTag: string,
        metaDataPath: string,
        sourceName: string,
        dataConnectionName: string
      }
    }
  }
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Metadata Upload Fails
**Symptom**: 404 or 500 error on `/upload-metadata`  
**Solution**: Wrapped in try-catch, workflow continues without metadata

### Issue 2: Duplicate Messages
**Symptom**: Same AI response appears multiple times  
**Solution**: Added duplicate detection in Redux reducer

### Issue 3: Page Reload After Upload
**Symptom**: UI reloads, losing conversation context  
**Solution**: Removed `editMessage` call, only use `sendQuery`

### Issue 4: WebSocket Connection Lost
**Symptom**: No response after sending query  
**Solution**: Reconnection logic with exponential backoff

### Issue 5: Wrong Conversation ID
**Symptom**: Messages appear in wrong conversation  
**Solution**: Always use `conversation_id` from backend response

---

## 💡 Optimization Tips

1. **Prevent Unnecessary Re-renders**
   - Check if state changed before updating
   - Use duplicate message detection
   - Skip editMessage for workflow updates

2. **Improve Upload Speed**
   - Make metadata upload optional
   - Don't wait for S3 confirmation
   - Send workflow update immediately

3. **Better Error Handling**
   - Catch and log errors
   - Continue workflow on non-critical failures
   - Show user-friendly error messages

4. **State Management**
   - Keep workflow state separate from UI state
   - Use conversation-scoped state
   - Clear stale data on new conversation

---

## 🔍 Debugging Tips

### Enable Detailed Logging:
```javascript
// In DataUploadSection.js
console.log('📤 [DataUpload] Starting upload...');
console.log('   File:', selectedFile.name);
console.log('   Company:', currentCompany?.companyName);

// In useWorkflowWebSocket.js
console.log('🚀 [WEBSOCKET] SENDING QUERY TO AGENT');
console.log('📨 [WEBSOCKET] MESSAGE RECEIVED');

// In vibeSlice.js
console.log('🔴 [updateLangGraphState] REDUCER CALLED');
console.log('🔴 [updateLangGraphState] currentNode:', currentNode);
```

### Check State at Each Step:
1. File selection: `console.log('Selected file:', selectedFile)`
2. Metadata upload: `console.log('Metadata response:', response)`
3. State update: `console.log('Upload state:', uploadState)`
4. WebSocket send: `console.log('Sending message:', message)`
5. WebSocket receive: `console.log('Received data:', data)`
6. Redux update: `console.log('New state:', state)`

---

## 📚 Related Files

### Mobile App Files:
- `components/agent/actions/DataUploadSection.js` - Main upload component
- `hooks/useExperiment.js` - Experiment & metadata management
- `hooks/useWorkflowWebSocket.js` - WebSocket connection & messaging
- `redux/slices/vibeSlice.js` - State management
- `hooks/useVibe.js` - Vibe context & helpers
- `utils/storage.js` - AsyncStorage wrapper
- `utils/apiConfig.js` - API configuration

### Original tg-application Files:
- `src/components/VibeGradient/DataUploadSection.js`
- `src/hooks/useExperiment.js`
- `src/hooks/useWorkflowWebSocket.js`
- `src/redux/slices/vibeSlice.js`

---

## 🎓 Summary

The dataset upload flow in TG is a multi-step process that:

1. **Accepts CSV files** via file picker
2. **Uploads metadata** to S3 (optional)
3. **Updates workflow state** with dataset info
4. **Sends to backend** via WebSocket
5. **Receives AI response** with generated tags
6. **Updates Redux state** and UI

The key optimization was **removing the `editMessage` call** which caused massive state updates and page reloads. Now the workflow progresses smoothly using only `sendQuery` with `updated_state`.

The mobile implementation matches the web version's logic but uses React Native APIs for file handling and storage.
