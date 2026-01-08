# APK Export Guide - TG React Native Mobile App

## Prerequisites
Before building the APK, ensure you have:
- ✅ EAS CLI installed globally: `npm install -g eas-cli`
- ✅ Expo account (sign up at expo.dev if needed)
- ✅ All changes committed to git

## Step-by-Step APK Build Process

### Step 1: Install EAS CLI (if not already installed)
```powershell
npm install -g eas-cli
```

### Step 2: Login to Expo
```powershell
eas login
```
Enter your Expo credentials when prompted.

### Step 3: Configure EAS Build (First Time Only)
```powershell
eas build:configure
```
This will create/update `eas.json` with build configurations.

### Step 4: Build APK for Android
```powershell
# For development APK (can install on any device without Play Store)
eas build --platform android --profile preview

# OR for production APK
eas build --platform android --profile production
```

**What happens:**
- EAS servers will build your app in the cloud
- Build process takes 5-15 minutes
- You'll see a progress URL in the terminal

### Step 5: Download the APK
After build completes:

**Option A: Download from Terminal Link**
- Click the download URL shown in terminal
- Save the `.apk` file to your computer

**Option B: Download from Expo Dashboard**
1. Go to https://expo.dev/accounts/[your-account]/projects/[project-name]/builds
2. Find your latest build
3. Click "Download" button

### Step 6: Transfer APK to Mobile Device

**Method 1: USB Transfer**
```powershell
# Connect phone via USB, enable File Transfer mode
# Copy APK to phone's Download folder
Copy-Item "path\to\downloaded.apk" "E:\Download\" # E: is your phone drive
```

**Method 2: Cloud Transfer**
- Upload APK to Google Drive / OneDrive / Dropbox
- Download from phone

**Method 3: Direct Install via ADB**
```powershell
# Install ADB if not installed
# Connect phone via USB with USB Debugging enabled
adb install path\to\downloaded.apk
```

### Step 7: Install on Android Device
1. On your phone, go to **Settings → Security**
2. Enable **Install from Unknown Sources** (or per-app for Android 8+)
3. Open File Manager → Downloads folder
4. Tap the `.apk` file
5. Tap **Install**
6. Wait for installation to complete
7. Tap **Open** to launch the app

## Build Profiles (in eas.json)

### Preview Profile (Recommended for Testing)
```json
{
  "preview": {
    "android": {
      "buildType": "apk"  // Generates installable APK
    }
  }
}
```
- ✅ Quick to build
- ✅ Easy to install on any device
- ✅ No Google Play Store required

### Production Profile (For Play Store)
```json
{
  "production": {
    "android": {
      "buildType": "app-bundle"  // Generates AAB for Play Store
    }
  }
}
```
- Used for Google Play Store submissions
- Requires signing with keystore

## Quick Command Reference

```powershell
# Check EAS CLI version
eas --version

# Login to Expo
eas login

# Build preview APK
eas build --platform android --profile preview

# Build production AAB
eas build --platform android --profile production

# Check build status
eas build:list

# View build logs
eas build:view [build-id]
```

## Troubleshooting

### "eas command not found"
```powershell
npm install -g eas-cli
# Restart terminal
```

### "Not logged in"
```powershell
eas login
```

### "Build failed"
- Check build logs in Expo dashboard
- Ensure `app.json` and `eas.json` are properly configured
- Make sure all dependencies in `package.json` are compatible

### "Can't install APK on phone"
- Enable "Install from Unknown Sources" in phone settings
- For Android 8+: Enable per-app install permission when prompted
- Check if phone storage has enough space (100+ MB)

### "App crashes on startup"
- Check if all native dependencies are properly linked
- Ensure API endpoints in config are accessible
- Check phone's Android version compatibility

## File Locations After Download

**Windows:**
```
C:\Users\[YourName]\Downloads\build-[timestamp].apk
```

**Expo Dashboard:**
```
https://expo.dev/accounts/[account]/projects/[project]/builds/[build-id]
```

## Testing Checklist

After installing APK on device:
- [ ] App launches successfully
- [ ] Login/authentication works
- [ ] AI chat sends messages
- [ ] Conversations load correctly
- [ ] WebSocket connection stable
- [ ] Background/foreground transitions work
- [ ] Stop button appears during AI processing
- [ ] Loading spinner shows TG logo
- [ ] Sidebar animations smooth

## Next Steps

1. **Run the build command:**
   ```powershell
   eas build --platform android --profile preview
   ```

2. **Wait for build to complete** (5-15 minutes)

3. **Download APK** from provided URL

4. **Transfer to phone** and install

5. **Test all features** using checklist above

## Production Release (Google Play Store)

For publishing to Google Play Store:

1. Generate upload keystore:
   ```powershell
   eas credentials
   ```

2. Build AAB (Android App Bundle):
   ```powershell
   eas build --platform android --profile production
   ```

3. Download `.aab` file

4. Upload to Google Play Console:
   - Create app listing
   - Upload AAB
   - Fill required store information
   - Submit for review

## Support

- Expo Documentation: https://docs.expo.dev/build/setup/
- EAS Build: https://docs.expo.dev/build/introduction/
- React Native: https://reactnative.dev/docs/signed-apk-android
