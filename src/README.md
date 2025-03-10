## iOS

### Development with Expo
npx expo start --clear

### With cache reset
npx expo start --clear --reset-cache

### Build and run on device/simulator (requires Xcode)
npx expo run:ios
npx expo run:ios --device "Daddy"
npx expo run:ios --device "Alka's iPhone"
npx expo run:ios --device "Alka Arcbest"

#### Clean build
```
cd ios
pod deintegrate
pod install
cd ..
npx expo run:ios
```

## Android
### For development
npx expo run:android --variant playDebug

For specific hardware device:
```
npx expo run:android --variant playDebug --device "device_id"
```

```
adb shell pm list packages | grep estategpt
adb uninstall com.singaporv.estategpt
cd android
./gradlew clean
cd ..
npx expo run:android --variant playDebug
```

#### For clean build
```
cd android
./gradlew clean
cd ..
npx expo run:android
```

### For release
1. Increment versionCode in android/app/build.gradle

2. Test release build locally on simulator (Before uploading to Play Store): 
```
npx expo run:android --variant playRelease
npx expo run:android --variant playRelease --device
```

3. Create abb for  Play Store upload
```
# Navigate to the android directory
cd android

# Clean the project
./gradlew clean

# Build the AAB file
./gradlew bundlePlayRelease
```

The abb will generated at: 
```
android/app/build/outputs/bundle/playRelease/app-play-release.aab
```


# Current Status

## IOS
npx expo run:ios --device "Daddy"


## Android
npx expo run:android


## Android Debug
Address all issues in:
```
npx expo-doctor
```

For device:
npx expo run:android --device

For simulator: 
npx expo run:android 




## Troubleshoot
Existing package com.singaporv.estategpt signatures do not match newer version; ignoring!]
```
adb uninstall com.singaporv.estategpt
npx expo run:android --variant playRelease
```