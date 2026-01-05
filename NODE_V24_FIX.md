# Node.js v24 Compatibility Issue

The error you're experiencing is due to Node.js v24's stricter ESM handling on Windows.

## Solution Options:

### Option 1: Downgrade to Node.js LTS (Recommended)
```powershell
# Use nvm or download Node.js 22 LTS from nodejs.org
nvm install 22
nvm use 22
```

### Option 2: Use NODE_OPTIONS environment variable
```powershell
# Set before running expo
$env:NODE_OPTIONS="--experimental-loader=file:///$(Get-Location)/node_modules/expo/bin/expo-env"
npx expo start -c
```

### Option 3: Update Expo SDK (if available)
```powershell
npx expo install expo@latest
npx expo install --fix
```

## Current Issue
Node.js v24.12.0 has breaking changes with Windows path handling in ESM loader.
Expo SDK 54 may not fully support Node.js v24 yet.

## Recommended Action
Use Node.js 22 LTS (Long Term Support) for best compatibility with Expo.
