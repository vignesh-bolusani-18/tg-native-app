# 🔴 Backend Service Health Check

## Current Issue: 502 Bad Gateway

The experiments API is returning **502 Bad Gateway** errors, which means:

- ✅ Your app is correctly calling the API
- ✅ Your authentication tokens are valid  
- ❌ The backend service (`/experimentByCompany` endpoint) is temporarily unavailable

## What Changed

1. **Enhanced Error Logging** - You'll now see detailed 502 errors in logs
2. **Retry Logic** - The app will retry 3 times with exponential backoff (1s, 2s, 4s)
3. **Timeout Detection** - UI will stop infinite loading after 10 seconds
4. **Error UI** - Shows "Service Unavailable" message with retry button instead of spinning loader

## Console Logs to Watch

```
❌ 502 Bad Gateway - Backend service may be down
   Retrying in 1000ms... (Attempt 1/3)
   Retrying in 2000ms... (Attempt 2/3)
   Retrying in 4000ms... (Attempt 3/3)
```

## What You Need to Do

### Option 1: Check Backend Status
```bash
# Check if the experiments endpoint is responsive
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api-staging-ap-south-1.truegradient.ai/experimentByCompany?companyID=YOUR_COMPANY_ID"
```

### Option 2: Contact Backend Team
Share this info:
- Endpoint: `GET /experimentByCompany`
- API: `https://api-staging-ap-south-1.truegradient.ai`
- Status: **502 Bad Gateway**
- Message: "Backend service may be down"

### Option 3: Check Infrastructure/Network
1. Is the API server running?
2. Are there any deployment issues?
3. Is there a network connectivity problem?
4. Is the endpoint misconfigured?

## How the Fix Works

### In `utils/getExperiments.js`:
- ✅ Detects 502/503 errors
- ✅ Retries automatically up to 3 times
- ✅ Logs detailed error information

### In Components:
- ✅ **ExperimentSelector** - Shows error state after 10 seconds
- ✅ **AnalysisWorkflowInitiator** - Shows error state with retry button
- ✅ No more infinite loading spinners

## Expected Behavior (Once Backend is Fixed)

```
LOG  🚀 [useExperiment] Fetching experiments from backend...
LOG  📦 [getAllExperiments] Raw API Response:
LOG     Type: object
LOG     Keys: experiments
LOG  ✅ [useExperiment] Experiments found: 5
LOG     Experiment IDs: exp-001, exp-002, exp-003
```

## Testing the Fix

After backend is restored:
1. The app will retry automatically
2. Experiments will load successfully
3. You'll see: "✅ [useExperiment] Experiments found: X"
4. No more infinite loading state

---

## Files Modified

- `utils/getExperiments.js` - Added retry logic & error detection
- `hooks/useExperiment.js` - Improved response parsing
- `components/agent/input/ExperimentSelector.js` - Added timeout + error UI
- `components/agent/ui/AnalysisWorkflowInitiator.js` - Added timeout + error UI
