## Android

### With Xcode
npx expo start --clear


npx expo start --clear --reset-cache

### Without Xcode

npx expo run:ios

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

### For release
1. Increment versionCode in android/app/build.gradle

2. Test release build locally on simulator (Before uploading to Play Store): 
```
npx expo run:android --variant playRelease
```

3. Create abb for  Play Store upload
```
cd android
./gradlew bundlePlayRelease
```

The abb will generated at: 
```
android/app/build/outputs/bundle/playRelease/app-play-release.aab
```




