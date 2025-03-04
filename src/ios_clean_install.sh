#!/bin/bash
# Complete clean install script for iOS

echo "🧹 Starting clean install process for iOS..."

# Navigate to project directory
cd /Users/apoorvsingh/estategpt_app

echo "🗑️ Removing node_modules..."
rm -rf node_modules

echo "🗑️ Removing iOS build artifacts..."
rm -rf ios/build
rm -rf ios/Pods
rm -f ios/Podfile.lock
rm -rf ios/EstateGPT.xcworkspace

echo "🗑️ Clearing watchman watches..."
watchman watch-del-all || echo "Watchman not installed or failed, continuing anyway..."

echo "🗑️ Clearing Metro bundler cache..."
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/haste-map-*

echo "🔄 Installing npm packages..."
npm install

echo "🔄 Installing pods..."
cd ios
pod deintegrate || echo "Pod deintegrate failed, continuing anyway..."
pod cache clean --all || echo "Pod cache clean failed, continuing anyway..."
pod install

echo "✅ Clean install completed! Now try building your app with:"
echo "cd /Users/apoorvsingh/estategpt_app"
echo "npx expo run:ios"
