### BUILD GRADLE

# debug

cd android && ./gradlew clean && ./gradlew assembleDebug && cd ..

# release

cd android && ./gradlew clean && ./gradlew assembleRelease && cd ..

### RELEASE BUILD REACT-NATIVE

# android

npx react-native run-android --variant=release

# ios

npx react-native run-ios --configuration Release

# Fix android build for AAPT error

aaptOptions {
cruncherEnabled = false
}
