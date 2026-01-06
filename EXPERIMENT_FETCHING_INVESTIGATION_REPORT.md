# Experiment Fetching Investigation Report

**Date**: January 6, 2026  
**Issue**: User sees infinite loading when pressing experiments, logs show 200 response but "No experiments in response"  
**Company ID**: `5dfb7ae7-41ad-4922-bdf2-952139c2d42c`  
**API Base URL**: `https://api-staging-ap-south-1.truegradient.ai`

---

## 🔍 Executive Summary

After analyzing the complete experiment fetching workflow, I've identified **the root cause**: The code expects the API response to have an `experiments` property (`response.experiments`), but the actual API might be returning a different structure. The code has a fallback to check if the response is an array directly, but it logs "No experiments in response" when the expected structure isn't found.

### Critical Code Path
```
useExperiment.fetchExperiments() 
  → utils/getExperiments.js:getAllExperiments()
  → API: GET /experimentByCompany?companyID={id}&t={timestamp}&sendHash=true
  → Response parsing in useExperiment.js
  → Redux store update via setExperimentsList
```

---

## 📊 Complete Flow Analysis

### 1. API Endpoint Configuration

**File**: [utils/apiConfig.js](utils/apiConfig.js#L8-L26)

```javascript
export const getApiConfig = () => {
  if (__DEV__) {
    return {
      apiBaseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 
                  "https://api-staging-ap-south-1.truegradient.ai",
      apiKey: process.env.EXPO_PUBLIC_API_KEY,
      // ... other config
    };
  }
  // Production config...
};
```

**Current Environment** (from `.env`):
- `EXPO_PUBLIC_API_BASE_URL`: `https://api-staging-ap-south-1.truegradient.ai`
- `EXPO_PUBLIC_API_KEY`: `FjMs3HsjQZ6KOXfznaQFu3ZP4kmvKatJa1Ywt2Ib`

✅ **Configuration is correct**

---

### 2. API Call Implementation

**File**: [utils/getExperiments.js](utils/getExperiments.js#L23-L70)

```javascript
export const getAllExperiments = async (companyID) => {
  try {
    if (!companyID) {
      console.warn('[getAllExperiments] No companyID provided');
      return { experiments: [] };
    }

    const accessToken = await getAuthToken();
    const timestamp = Date.now();
    
    // ⭐ THE EXACT ENDPOINT BEING CALLED:
    const response = await fetch(
      `${apiConfig.apiBaseURL}/experimentByCompany?companyID=${companyID}&t=${timestamp}&sendHash=true`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiConfig.apiKey || '',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
      }
    );
    
    if (!response.ok) {
      console.warn('[getAllExperiments] Response not OK:', response.status);
      return { experiments: [] };
    }
    
    const data = await response.json();
    return data;  // ⚠️ Returns whatever the API sends back
  } catch (error) {
    console.error('Error getting experiments:', error);
    return { experiments: [] };
  }
};
```

**Exact API Call**:
```
GET https://api-staging-ap-south-1.truegradient.ai/experimentByCompany?companyID=5dfb7ae7-41ad-4922-bdf2-952139c2d42c&t=1704537600000&sendHash=true
Headers:
  - Content-Type: application/json
  - x-api-key: FjMs3HsjQZ6KOXfznaQFu3ZP4kmvKatJa1Ywt2Ib
  - Authorization: Bearer {accessToken}
```

✅ **Endpoint is correctly formatted**  
✅ **Request includes company ID, timestamp, and sendHash parameter**  
✅ **Authentication headers are properly set**

---

### 3. Response Parsing Logic

**File**: [hooks/useExperiment.js](hooks/useExperiment.js#L34-L84)

```javascript
const fetchExperiments = useCallback(async (force = false) => {
  console.log('🔍 [useExperiment] fetchExperiments called');
  console.log('   Company:', company?.companyID);
  
  if (!company?.companyID) {
    console.log('⚠️ [useExperiment] No company ID available');
    return [];
  }

  // Cache check...
  if (!force && hasFetchedRef.current && experiments_list.length > 0) {
    return experiments_list;
  }

  setLoading(true);
  setError(null);
  
  try {
    const response = await getAllExperiments(company.companyID);
    console.log('📦 [useExperiment] Response received:', response ? 'yes' : 'no');
    
    // ⚠️ PRIMARY PARSING: Expects response.experiments
    if (response && response.experiments) {
      console.log('✅ [useExperiment] Experiments found:', response.experiments.length);
      console.log('   Experiment IDs:', response.experiments.map(e => e.experimentID || e.id).join(', '));
      dispatch(setExperimentsList(response.experiments));
      hasFetchedRef.current = true;
      setLoading(false);
      return response.experiments;
    } 
    // ⚠️ FALLBACK: Check if response itself is an array
    else if (Array.isArray(response)) {
      console.log('✅ [useExperiment] Experiments array:', response.length);
      dispatch(setExperimentsList(response));
      hasFetchedRef.current = true;
      setLoading(false);
      return response;
    }
    
    // ❌ THIS IS WHERE YOUR ISSUE OCCURS
    console.warn('⚠️ [useExperiment] No experiments in response');
    dispatch(setExperimentsList([]));
    setLoading(false);
    return [];
  } catch (err) {
    console.error('❌ [useExperiment] Error fetching experiments:', err);
    setError(err.message);
    setLoading(false);
    return [];
  }
}, [company?.companyID, dispatch, experiments_list]);
```

---

## 🐛 Root Cause Analysis

### The Problem

The code has **TWO checks** for the response structure:

1. **Primary Check**: `if (response && response.experiments)` - expects `{ experiments: [...] }`
2. **Fallback Check**: `else if (Array.isArray(response))` - expects `[...]`

If **neither condition is met**, it logs:
```
⚠️ [useExperiment] No experiments in response
```

And dispatches an **empty array** to Redux, causing the infinite loading state.

### Possible API Response Structures

Based on the code logic, the API might be returning one of these unexpected structures:

**❌ Case 1: Empty object but 200 OK**
```json
{}
```
Result: Neither condition passes → "No experiments in response"

**❌ Case 2: Different property name**
```json
{
  "data": [...],
  "items": [...],
  "experimentList": [...]
}
```
Result: `response.experiments` is undefined → "No experiments in response"

**❌ Case 3: Nested structure**
```json
{
  "success": true,
  "data": {
    "experiments": [...]
  }
}
```
Result: `response.experiments` is undefined → "No experiments in response"

**❌ Case 4: Response with experiments but it's null/undefined**
```json
{
  "experiments": null
}
```
Result: `response && response.experiments` fails because `experiments` is falsy

**✅ Expected Case 1: Object with experiments array**
```json
{
  "experiments": [
    {
      "experimentID": "abc-123",
      "experimentName": "Test Experiment",
      "experimentStatus": "Completed",
      "experimentModuleName": "demand-planning",
      "data": {...}
    }
  ]
}
```

**✅ Expected Case 2: Direct array**
```json
[
  {
    "experimentID": "abc-123",
    "experimentName": "Test Experiment"
  }
]
```

---

## 🔗 Dependencies

### Relationship with Datasets

**File**: [hooks/useDataset.js](hooks/useDataset.js#L15-L120)

```javascript
// Datasets are EXTRACTED from experiments, not fetched separately
const extractDatasetsFromExperiments = useCallback((experimentsList) => {
  if (!Array.isArray(experimentsList) || experimentsList.length === 0) {
    return [];
  }

  const datasetsMap = new Map();
  
  experimentsList.forEach((experiment) => {
    // Check for datasets in experiment.data
    if (experiment.data) {
      Object.keys(experiment.data).forEach((dataKey) => {
        const dataEntry = experiment.data[dataKey];
        if (dataEntry && dataEntry.dataset_info) {
          const { datasetName, datasetTag, sourceName, metaDataPath } = dataEntry.dataset_info;
          if (datasetName && !datasetsMap.has(datasetName)) {
            datasetsMap.set(datasetName, {
              name: datasetName,
              datasetName,
              tag: datasetTag || 'base',
              source: sourceName || 'Unknown',
              metadataPath: metaDataPath,
              experimentId: experiment.experimentID || experiment.id,
              sampleDataPath: dataEntry.sample_data_path,
            });
          }
        }
      });
    }
  });

  return Array.from(datasetsMap.values());
}, []);
```

**Key Points**:
- ⭐ Datasets are **NOT fetched from a separate API**
- ⭐ They are **extracted from `experiment.data.*.dataset_info`**
- ⭐ If experiments are empty/missing, datasets will also be empty
- ⭐ This explains why the whole workflow breaks when experiments don't load

---

## 🎯 What's Causing the Issue

### Scenario Analysis

Given that you're seeing:
- ✅ **200 OK response** (API request succeeds)
- ❌ **"No experiments in response"** (parsing fails)
- ❌ **Infinite loading** (empty state)

The most likely causes are:

#### 1. **Empty Response from API** (Most Likely)
The API returns `200 OK` with:
```json
{
  "experiments": []
}
```
OR
```json
[]
```

This would pass the structure checks but result in an empty array, causing infinite loading if the component doesn't handle empty states properly.

#### 2. **Unexpected Response Structure**
The API returns:
```json
{
  "success": true,
  "data": []
}
```
OR
```json
{
  "experimentList": []
}
```

This would trigger "No experiments in response" because `response.experiments` is undefined.

#### 3. **Null/Undefined experiments Property**
The API returns:
```json
{
  "experiments": null,
  "message": "No experiments found"
}
```

The condition `response && response.experiments` would fail because `null` is falsy.

#### 4. **Filtering Removing All Experiments**
The API returns experiments, but they're all filtered out by the "completed experiments" filter in the UI components:

**File**: [components/agent/input/ExperimentSelector.js](components/agent/input/ExperimentSelector.js#L40-L49)

```javascript
const completedExperiments = experiments_list.filter(
  (exp) =>
    !exp.inTrash &&
    exp.experimentStatus === "Completed" &&
    !exp.isArchive &&
    ["demand-planning", "inventory-optimization", "price-promotion-optimization"].includes(
      exp.experimentModuleName
    )
);
```

If **all experiments** returned by the API:
- Are in trash (`inTrash: true`)
- Are not completed (`experimentStatus !== "Completed"`)
- Are archived (`isArchive: true`)
- Have incompatible module names

Then the filtered list would be **empty**, causing infinite loading in the UI.

---

## 🔧 Debugging Steps

### Step 1: Inspect the Actual API Response

Add detailed logging to see the EXACT response:

**File**: [utils/getExperiments.js](utils/getExperiments.js#L54-L56)

```javascript
const data = await response.json();
console.log('🔍 [getAllExperiments] RAW API RESPONSE:', JSON.stringify(data, null, 2));
console.log('🔍 [getAllExperiments] Response type:', typeof data);
console.log('🔍 [getAllExperiments] Is array?:', Array.isArray(data));
console.log('🔍 [getAllExperiments] Has experiments?:', data?.experiments);
console.log('🔍 [getAllExperiments] Experiments length?:', data?.experiments?.length);
return data;
```

### Step 2: Check if Experiments Exist but Are Filtered Out

**File**: [hooks/useExperiment.js](hooks/useExperiment.js#L58-L70)

```javascript
if (response && response.experiments) {
  console.log('✅ [useExperiment] Experiments found:', response.experiments.length);
  console.log('📝 [useExperiment] All experiments:', JSON.stringify(response.experiments, null, 2));
  
  // Log each experiment's key properties
  response.experiments.forEach((exp, idx) => {
    console.log(`   [${idx}] ID: ${exp.experimentID || exp.id}`);
    console.log(`       Name: ${exp.experimentName}`);
    console.log(`       Status: ${exp.experimentStatus}`);
    console.log(`       Module: ${exp.experimentModuleName}`);
    console.log(`       InTrash: ${exp.inTrash}`);
    console.log(`       IsArchive: ${exp.isArchive}`);
  });
  
  dispatch(setExperimentsList(response.experiments));
  // ...
}
```

### Step 3: Test the API Directly

Create a test script to call the API independently:

**File**: `scripts/test-experiments-api.js` (NEW)

```javascript
import 'dotenv/config';
import fetch from 'node-fetch';

const COMPANY_ID = '5dfb7ae7-41ad-4922-bdf2-952139c2d42c';
const API_BASE_URL = 'https://api-staging-ap-south-1.truegradient.ai';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

async function testExperimentsAPI() {
  try {
    const timestamp = Date.now();
    const url = `${API_BASE_URL}/experimentByCompany?companyID=${COMPANY_ID}&t=${timestamp}&sendHash=true`;
    
    console.log('🚀 Testing Experiments API');
    console.log('URL:', url);
    console.log('API Key:', API_KEY ? `***${API_KEY.slice(-4)}` : 'MISSING');
    console.log('');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY || '',
      },
    });
    
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('');
    
    const data = await response.json();
    
    console.log('📦 Response Type:', typeof data);
    console.log('📦 Is Array:', Array.isArray(data));
    console.log('📦 Has "experiments" property:', 'experiments' in data);
    console.log('');
    
    console.log('📝 Full Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data && data.experiments) {
      console.log('');
      console.log(`✅ Found ${data.experiments.length} experiments`);
      data.experiments.forEach((exp, idx) => {
        console.log(`\n[${idx}] ${exp.experimentName || 'Unnamed'}`);
        console.log(`    ID: ${exp.experimentID || exp.id}`);
        console.log(`    Status: ${exp.experimentStatus}`);
        console.log(`    Module: ${exp.experimentModuleName}`);
        console.log(`    InTrash: ${exp.inTrash}`);
        console.log(`    IsArchive: ${exp.isArchive}`);
      });
    } else if (Array.isArray(data)) {
      console.log('');
      console.log(`✅ Response is array with ${data.length} items`);
    } else {
      console.log('');
      console.log('❌ Unexpected response structure!');
      console.log('Response keys:', Object.keys(data));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testExperimentsAPI();
```

**Run it**:
```bash
node scripts/test-experiments-api.js
```

---

## 🎯 Recommended Fixes

### Fix 1: Add More Robust Response Parsing

**File**: [hooks/useExperiment.js](hooks/useExperiment.js#L56-L75)

```javascript
try {
  const response = await getAllExperiments(company.companyID);
  console.log('📦 [useExperiment] Response received:', response ? 'yes' : 'no');
  console.log('📦 [useExperiment] Response type:', typeof response);
  console.log('📦 [useExperiment] Response keys:', response ? Object.keys(response) : 'none');
  
  let experimentsList = [];
  
  // Check multiple possible response structures
  if (response && response.experiments && Array.isArray(response.experiments)) {
    experimentsList = response.experiments;
    console.log('✅ [useExperiment] Found experiments in response.experiments');
  } else if (Array.isArray(response)) {
    experimentsList = response;
    console.log('✅ [useExperiment] Response is array of experiments');
  } else if (response && response.data && Array.isArray(response.data)) {
    experimentsList = response.data;
    console.log('✅ [useExperiment] Found experiments in response.data');
  } else if (response && response.data && response.data.experiments) {
    experimentsList = response.data.experiments;
    console.log('✅ [useExperiment] Found experiments in response.data.experiments');
  } else {
    console.warn('⚠️ [useExperiment] No experiments in response');
    console.warn('⚠️ [useExperiment] Response structure:', JSON.stringify(response));
  }
  
  console.log(`📊 [useExperiment] Total experiments: ${experimentsList.length}`);
  
  if (experimentsList.length > 0) {
    console.log('   Experiment IDs:', experimentsList.map(e => e.experimentID || e.id).join(', '));
  } else {
    console.warn('⚠️ [useExperiment] Empty experiments list - company may have no experiments');
  }
  
  dispatch(setExperimentsList(experimentsList));
  hasFetchedRef.current = true;
  setLoading(false);
  return experimentsList;
  
} catch (err) {
  console.error('❌ [useExperiment] Error fetching experiments:', err);
  console.error('   Error details:', err.message);
  console.error('   Error stack:', err.stack);
  setError(err.message);
  setLoading(false);
  return [];
}
```

### Fix 2: Handle Empty State in UI

**File**: [components/agent/input/ExperimentSelector.js](components/agent/input/ExperimentSelector.js#L20-L32)

```javascript
// Add empty state handling
useEffect(() => {
  if (visible && (!experiments_list || experiments_list.length === 0)) {
    console.log('🔄 [ExperimentSelector] No experiments, fetching...');
    fetchExperiments();
  }
}, [visible, experiments_list, fetchExperiments]);

// After fetchExperiments completes, check if still empty
useEffect(() => {
  if (!loading && experiments_list && experiments_list.length === 0) {
    console.log('⚠️ [ExperimentSelector] No experiments available for this company');
    // Show empty state UI instead of infinite loading
  }
}, [loading, experiments_list]);
```

### Fix 3: Add Response Validation

**File**: [utils/getExperiments.js](utils/getExperiments.js#L23-L70)

```javascript
export const getAllExperiments = async (companyID) => {
  try {
    if (!companyID) {
      console.warn('[getAllExperiments] No companyID provided');
      return { experiments: [] };
    }

    const accessToken = await getAuthToken();
    const timestamp = Date.now();
    
    console.log('[getAllExperiments] Fetching experiments for company:', companyID);
    
    const url = `${apiConfig.apiBaseURL}/experimentByCompany?companyID=${companyID}&t=${timestamp}&sendHash=true`;
    console.log('[getAllExperiments] URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiConfig.apiKey || '',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      },
    });
    
    console.log('[getAllExperiments] Response status:', response.status);
    
    if (!response.ok) {
      console.warn('[getAllExperiments] Response not OK:', response.status, response.statusText);
      const errorText = await response.text();
      console.warn('[getAllExperiments] Error response:', errorText);
      return { experiments: [] };
    }
    
    const data = await response.json();
    
    // ⭐ ADD VALIDATION AND LOGGING
    console.log('[getAllExperiments] Response type:', typeof data);
    console.log('[getAllExperiments] Is array:', Array.isArray(data));
    
    if (data === null || data === undefined) {
      console.error('[getAllExperiments] Received null/undefined response');
      return { experiments: [] };
    }
    
    if (typeof data === 'object' && !Array.isArray(data)) {
      console.log('[getAllExperiments] Response keys:', Object.keys(data));
    }
    
    // Log a sample of the data structure (not full data for large responses)
    if (data.experiments && Array.isArray(data.experiments) && data.experiments.length > 0) {
      console.log('[getAllExperiments] Sample experiment:', {
        id: data.experiments[0].experimentID || data.experiments[0].id,
        name: data.experiments[0].experimentName,
        status: data.experiments[0].experimentStatus,
      });
    }
    
    return data;
  } catch (error) {
    console.error('[getAllExperiments] Error:', error);
    console.error('[getAllExperiments] Error type:', error.name);
    console.error('[getAllExperiments] Error message:', error.message);
    return { experiments: [] };
  }
};
```

---

## 📋 Expected Experiment Object Structure

Based on the filtering logic in [ExperimentSelector.js](components/agent/input/ExperimentSelector.js#L40-L49), each experiment should have:

```typescript
interface Experiment {
  experimentID?: string;        // Unique ID (or 'id')
  id?: string;                 // Alternative ID field
  experimentName: string;      // Display name
  experimentStatus: string;    // "Completed", "Running", "Failed", etc.
  experimentModuleName: string; // "demand-planning", "inventory-optimization", "price-promotion-optimization"
  inTrash: boolean;            // Whether soft-deleted
  isArchive: boolean;          // Whether archived
  data?: {                     // Dataset information
    [key: string]: {
      dataset_info?: {
        datasetName: string;
        datasetTag: string;
        sourceName: string;
        metaDataPath: string;
      };
      sample_data_path?: string;
    };
  };
  createdAt?: number;          // Timestamp
  updatedAt?: number;          // Timestamp
}
```

**Valid API Responses**:

```json
// Option 1: Object with experiments array
{
  "experiments": [
    {
      "experimentID": "abc-123",
      "experimentName": "Q1 Demand Forecast",
      "experimentStatus": "Completed",
      "experimentModuleName": "demand-planning",
      "inTrash": false,
      "isArchive": false,
      "data": {
        "sales": {
          "dataset_info": {
            "datasetName": "sales_2023",
            "datasetTag": "sales",
            "sourceName": "File Upload",
            "metaDataPath": "accounts/Company_5dfb7ae7.../metadata/sales_2023.json"
          }
        }
      }
    }
  ]
}

// Option 2: Direct array
[
  {
    "experimentID": "abc-123",
    "experimentName": "Q1 Demand Forecast",
    ...
  }
]
```

---

## ✅ Action Items

### Immediate (Debug)
1. ✅ Add the detailed logging from "Fix 1" to [hooks/useExperiment.js](hooks/useExperiment.js)
2. ✅ Add the API response logging from "Fix 3" to [utils/getExperiments.js](utils/getExperiments.js)
3. ✅ Create and run `scripts/test-experiments-api.js` to see the raw API response
4. ✅ Check the Metro/Expo logs when clicking "Experiments" to see the logged response

### Short-term (Fix)
5. ✅ Implement the robust response parsing from "Fix 1"
6. ✅ Add empty state handling from "Fix 2"
7. ✅ Contact backend team with the actual response structure you're seeing
8. ✅ Update response parsing to match the actual API structure

### Long-term (Improve)
9. ⭐ Add TypeScript types for API responses
10. ⭐ Create a response validation/normalization layer
11. ⭐ Add error boundaries in UI components
12. ⭐ Implement retry logic for failed API calls

---

## 📞 Questions for Backend Team

When you contact the backend team, ask:

1. **What is the EXACT response structure for `/experimentByCompany`?**
   - Is it `{ experiments: [...] }` or just `[...]`?
   - Are there any wrapper objects like `{ success: true, data: {...} }`?

2. **For company ID `5dfb7ae7-41ad-4922-bdf2-952139c2d42c`, how many experiments should exist?**
   - Are they in "Completed" status?
   - What are their module names?
   - Are any in trash or archived?

3. **What does an empty response look like?**
   - `{ experiments: [] }` or `[]` or `{ experiments: null }`?

4. **Is the `sendHash=true` parameter required?**
   - What does it do?
   - What happens if it's omitted?

5. **Are there any rate limiting or caching issues?**
   - Could the API be returning cached empty results?

6. **What authentication is required?**
   - Is the `x-api-key` header sufficient?
   - Do we need the Bearer token?

---

## 🎬 Next Steps

1. **Run the test script** (`scripts/test-experiments-api.js`) to see the raw response
2. **Review the Metro logs** when reproducing the issue in the app
3. **Apply Fix 1** (robust response parsing) immediately
4. **Contact backend team** with the actual response you're seeing
5. **Update this document** with findings

---

## 📝 Related Files

- [hooks/useExperiment.js](hooks/useExperiment.js) - Main experiment hook
- [utils/getExperiments.js](utils/getExperiments.js) - API calls
- [utils/apiConfig.js](utils/apiConfig.js) - API configuration
- [hooks/useDataset.js](hooks/useDataset.js) - Dataset extraction (depends on experiments)
- [components/agent/input/ExperimentSelector.js](components/agent/input/ExperimentSelector.js) - UI component
- [redux/slices/vibeSlice.js](redux/slices/vibeSlice.js) - Redux state management
- [.env](.env) - Environment configuration

---

**Report completed**: January 6, 2026
