#!/usr/bin/env pwsh
# Expo Startup Script with Node.js Compatibility Check

Write-Host "🚀 TrueGradient Mobile App Startup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check Node version
$nodeVersion = node --version
Write-Host "Node.js Version: $nodeVersion" -ForegroundColor Yellow

# Extract major version
$majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')

if ($majorVersion -ge 24) {
    Write-Host ""
    Write-Host "⚠️  WARNING: Node.js v$majorVersion detected!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Expo SDK 54 has compatibility issues with Node.js v24+." -ForegroundColor Yellow
    Write-Host "This is a known issue with Windows path handling in ESM loader." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "RECOMMENDED SOLUTIONS:" -ForegroundColor Cyan
    Write-Host "1. Downgrade to Node.js v22 LTS (Most Reliable)" -ForegroundColor Green
    Write-Host "   - Download from: https://nodejs.org/" -ForegroundColor Gray
    Write-Host "   - Or use nvm: nvm install 22 && nvm use 22" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Wait for Expo SDK update that supports Node v24" -ForegroundColor Green
    Write-Host ""
    Write-Host "3. Try experimental workaround (may have issues):" -ForegroundColor Yellow
    Write-Host "   npx expo@latest start -c" -ForegroundColor Gray
    Write-Host ""
    
    $response = Read-Host "Continue anyway? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "Exiting. Please install Node.js v22 LTS and try again." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "📦 Checking environment variables..." -ForegroundColor Cyan

# Check critical environment variables
$envVars = @(
    "EXPO_PUBLIC_API_BASE_URL",
    "EXPO_PUBLIC_VIBE_BASE_URL",
    "EXPO_PUBLIC_IDENTITY_GATEWAY_URL",
    "EXPO_PUBLIC_API_KEY"
)

$missingVars = @()
foreach ($var in $envVars) {
    $value = [System.Environment]::GetEnvironmentVariable($var, "Process")
    if (-not $value) {
        # Try loading from .env
        if (Test-Path ".env") {
            $envContent = Get-Content ".env" -Raw
            if ($envContent -match "$var=(.+)") {
                Write-Host "  ✓ $var (from .env)" -ForegroundColor Green
            } else {
                $missingVars += $var
                Write-Host "  ✗ $var - MISSING" -ForegroundColor Red
            }
        } else {
            $missingVars += $var
            Write-Host "  ✗ $var - MISSING" -ForegroundColor Red
        }
    } else {
        Write-Host "  ✓ $var" -ForegroundColor Green
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  Missing environment variables! Check your .env file." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔄 Starting Expo..." -ForegroundColor Cyan
Write-Host ""

# Clear cache and start
npx expo start -c

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Expo failed to start!" -ForegroundColor Red
    Write-Host ""
    Write-Host "If you see 'ERR_UNSUPPORTED_ESM_URL_SCHEME', you MUST:" -ForegroundColor Yellow
    Write-Host "  Install Node.js v22 LTS from https://nodejs.org/" -ForegroundColor Cyan
    Write-Host ""
    exit $LASTEXITCODE
}
