# 🚀 QUICK FIX REFERENCE CARD

## The 502 Error (In 30 seconds)

Your mobile app is sending **malformed requests** to `/experimentByCompany`:

```
❌ BEFORE (502 Error)
- x-api-key: empty string or missing
- Authorization token: corrupted (first char removed)
- Headers: incomplete

✅ AFTER (200 OK)
- x-api-key: valid API key
- Authorization token: intact and valid
- Headers: complete
```

---

## What Was Wrong (3 Issues)

| Issue | Problem | Fix |
|-------|---------|-----|
| **Empty x-api-key** | `apiConfig.apiKey \|\| ''` → empty string | Validate & reject if missing ✅ |
| **Corrupted token** | Regex `/^"+\|"+$/g` removes first char | Use safe `slice(1, -1)` ✅ |
| **Missing auth header** | Conditional: `...(accessToken ? {...} : {})` | Always include if token exists ⚠️ |

---

## Files Changed

### 1. `utils/getAccessToken.js`
```javascript
// BEFORE (BROKEN)
const accessToken = rawAccessToken.replace(/^"+|"+$/g, "");

// AFTER (FIXED)
let accessToken = rawAccessToken.trim();
if ((accessToken.startsWith('"') && accessToken.endsWith('"')) || 
    (accessToken.startsWith("'") && accessToken.endsWith("'"))) {
  accessToken = accessToken.slice(1, -1);
}
```

### 2. `utils/getExperiments.js`
```javascript
// BEFORE (BROKEN)
const headers = {
  'x-api-key': apiConfig.apiKey || '',  // Can be empty!
};

// AFTER (FIXED)
const apiKey = apiConfig.apiKey;
if (!apiKey) {
  console.error('❌ CRITICAL: x-api-key is not set!');
  return { experiments: [] };
}
const headers = {
  'x-api-key': apiKey,  // Now guaranteed non-empty
};
```

---

## Verify It Works

✅ Run the app and look for these logs:

```
LOG  🔍 [getAllExperiments] Making API request:
LOG     URL: https://api-staging-ap-south-1.truegradient.ai/experimentByCompany?...
LOG     Headers: {
LOG       'x-api-key': '***present***',     ← MUST SEE THIS
LOG       'Authorization': 'Bearer eyJ...'   ← MUST SEE THIS
LOG     }
LOG  Response status: 200                     ← Should be 200, not 502
```

❌ If you still see 502:

1. Check `.env` has: `EXPO_PUBLIC_API_KEY=FjMs3HsjQZ6KOXfznaQFu3ZP4kmvKatJa1Ywt2Ib`
2. Restart the app
3. Check log: `Token starts with 'ey': ✅ Valid JWT format`
4. See [502_ERROR_TROUBLESHOOTING.md](502_ERROR_TROUBLESHOOTING.md) for more help

---

## Why This Matters

### Before Fix
```
Request → API Gateway
  ❌ x-api-key: empty string
  ❌ Authorization: corrupted JWT
→ Gateway rejects
→ 502 Bad Gateway
→ No experiments loaded
→ Chat broken
→ App unusable
```

### After Fix
```
Request → API Gateway
  ✅ x-api-key: valid
  ✅ Authorization: valid JWT
→ Gateway accepts
→ 200 OK
→ Experiments loaded
→ Chat works
→ App functional
```

---

## 3 Most Important Things

1. **Ensure `.env` has `EXPO_PUBLIC_API_KEY`**
   ```bash
   grep EXPO_PUBLIC_API_KEY .env
   # Should output: EXPO_PUBLIC_API_KEY=FjMs3HsjQZ6KOXfznaQFu3ZP4kmvKatJa1Ywt2Ib
   ```

2. **Verify token starts with 'ey'**
   ```
   LOG  ✅ accessToken obtained!
   LOG     Token starts with 'ey': ✅ Valid JWT format
   ```

3. **Check response is 200, not 502**
   ```
   LOG  Response status: 200
   LOG  Response ok: true
   ```

If all 3 are true → Fix is working! ✅

---

## Detailed Docs

| Document | Purpose |
|----------|---------|
| [COMPARISON_TG_APP_VS_MOBILE.md](COMPARISON_TG_APP_VS_MOBILE.md) | Deep dive: why each difference causes 502 |
| [DETAILED_CODE_COMPARISON.md](DETAILED_CODE_COMPARISON.md) | Code side-by-side: before & after |
| [DIFFERENCE_CHECKLIST.md](DIFFERENCE_CHECKLIST.md) | Organized list of all 6 differences |
| [502_ERROR_TROUBLESHOOTING.md](502_ERROR_TROUBLESHOOTING.md) | Step-by-step fix guide if still broken |
| [INVESTIGATION_SUMMARY.md](INVESTIGATION_SUMMARY.md) | Full investigation report |

---

## Summary

✅ **2 Critical Bugs Fixed:**
1. Empty x-api-key header
2. Corrupted JWT token

⚠️ **1 Medium Issue Improved:**
3. Conditional authorization header (now validated)

📊 **Impact:**
- Should fix 502 errors on `/experimentByCompany`
- Chat feature should work
- Experiments should load

🧪 **Test It:** Run app, check logs for success indicators

📞 **Still Broken?** See [502_ERROR_TROUBLESHOOTING.md](502_ERROR_TROUBLESHOOTING.md)

