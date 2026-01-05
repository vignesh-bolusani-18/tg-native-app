# Test OAuth Tokens - Run this in PowerShell

Write-Host "`n╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        GOOGLE OAUTH TOKEN TESTING                    ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "MANUAL TEST STEPS:" -ForegroundColor Yellow
Write-Host "1. Open app and tap 'Continue with Google'" -ForegroundColor White
Write-Host "2. Complete Google login in browser" -ForegroundColor White
Write-Host "3. Check Metro console for these logs:`n" -ForegroundColor White

Write-Host "EXPECTED CONSOLE OUTPUT:" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🔵 Google OAuth: Opening URL: https://identity-gateway-dev.truegradient.ai/login/google?redirect_uri=..." -ForegroundColor Cyan
Write-Host "🔵 Google OAuth: Redirect URI: tgreactnativemobileapp://auth/oauth-callback" -ForegroundColor Cyan
Write-Host "🔵 Full URL received: tgreactnativemobileapp://auth/oauth-callback#access_token=..." -ForegroundColor Cyan
Write-Host "🔵 Extracted tokens:" -ForegroundColor Cyan
Write-Host "   { hasAccess: true, hasRefresh: true, hasRefreshAuth: true }" -ForegroundColor Cyan
Write-Host "🔵 JWT payload:" -ForegroundColor Cyan
Write-Host "   { hasEmail: true, hasSub: true, hasName: true }" -ForegroundColor Cyan
Write-Host "✅ OAuth: Redux state updated" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Gray

Write-Host "TO CHECK STORED TOKENS:" -ForegroundColor Yellow
Write-Host "After successful login, go to Home tab and check:" -ForegroundColor White
Write-Host "- Access Token: ✅ (shows first 30 chars)" -ForegroundColor White
Write-Host "- User Token: ✅" -ForegroundColor White
Write-Host "- Refresh Token: ✅" -ForegroundColor White
Write-Host "- Refresh Auth Token: ✅`n" -ForegroundColor White

Write-Host "COMMON ISSUES:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "❌ Backend redirects to https://app.truegradient.ai" -ForegroundColor Red
Write-Host "   → Backend not respecting redirect_uri parameter" -ForegroundColor White
Write-Host "   → Need backend team to fix /login/google endpoint`n" -ForegroundColor White

Write-Host "❌ Browser doesn't redirect back to app" -ForegroundColor Red
Write-Host "   → Deep linking not working" -ForegroundColor White
Write-Host "   → Check app.json scheme: tgreactnativemobileapp`n" -ForegroundColor White

Write-Host "❌ Tokens missing in callback URL" -ForegroundColor Red
Write-Host "   → Backend not returning tokens in URL hash" -ForegroundColor White
Write-Host "   → Should be: #access_token=xxx&refresh_token=yyy`n" -ForegroundColor White

Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Press Enter to close..." -ForegroundColor Gray
Read-Host
