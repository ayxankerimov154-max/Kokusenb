import JSZip from 'jszip';
import { ANDROID_FILES } from '../data/androidFiles';

export async function generateAndroidProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root files
  zip.file(
    'settings.gradle.kts',
    `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "TechnovisAzeLearningBot"
include(":app")
`
  );

  zip.file(
    'gradle.properties',
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true
`
  );

  zip.file(
    'local.properties.example',
    `## This file must NOT be checked into Version Control Systems,
# as it contains information specific to your local configuration.
#
# Location of the SDK. This is only used by Gradle.
# For example:
# sdk.dir=/Users/username/Library/Android/sdk
#
# Gemini AI Studio API Key for TechnovisAze Bot:
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
`
  );

  zip.file(
    'gradle/wrapper/gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.5-bin.zip
networkTimeout=10000
validateDistributionUrl=true
`
  );

  zip.file(
    'gradlew',
    `#!/bin/sh
# Gradle start up script for POSIX systems
exec gradle "$@"
`
  );

  zip.file(
    'gradlew.bat',
    `@rem Gradle start up script for Windows
@gradle "%*"
`
  );

  zip.file(
    '.github/workflows/build-apk.yml',
    `name: Build TechnovisAze Android APK

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main" ]
  workflow_dispatch:

jobs:
  build:
    name: Build & Package APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: gradle

      - name: Grant Execute Permission to gradlew
        run: chmod +x gradlew

      - name: Build Debug APK with Gradle
        env:
          GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }}
        run: ./gradlew assembleDebug --stacktrace

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: TechnovisAze-Learning-Bot-debug.apk
          path: app/build/outputs/apk/debug/app-debug.apk
`
  );

  zip.file(
    'README.md',
    `# TechnovisAze Learning Bot (Android)

Autonomous gaming intelligence bot running silently in the background via a persistent Android **Foreground Service** with \`WAKE_LOCK\` and **Room DB** persistence. Powered by **Google Gemini Generative AI SDK**.

## Sequential Queue
The bot loops strictly in this order:
1. **PUBG Mobile**
2. **Roblox**
3. **Minecraft**
4. Sleeps (configurable via SharedPreferences, defaults to 30 minutes in production) and repeats.

## How to Build the APK
### Option 1: Terminal / Command Line (Gradle)
\`\`\`bash
# Build Debug APK
./gradlew assembleDebug

# Output APK path:
# app/build/outputs/apk/debug/app-debug.apk

# Install directly to connected phone/emulator via ADB:
adb install -r app/build/outputs/apk/debug/app-debug.apk
\`\`\`

### Option 2: Android Studio GUI
1. Open **Android Studio** (Hedgehog 2023.1.1 or Ladybug 2024.2+).
2. Click **Open** and select this directory.
3. In the top menu, go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
4. Android Studio will generate \`app-debug.apk\`. Click "locate" in the notification popup.

### Option 3: GitHub Actions (Free Cloud Build)
Push this project to a GitHub repository. The included \`.github/workflows/build-apk.yml\` will automatically build the APK on every commit and attach it as a downloadable artifact.

## Architecture Highlights
- **Service**: \`BackgroundLearningService\` with \`PARTIAL_WAKE_LOCK\` & low-priority \`Dispatchers.IO\` coroutines (0% FPS impact on games).
- **Database**: \`Room\` DB with reactive \`Flow\` queries in \`BotMemoryDao\`.
- **AI**: \`GeminiClient\` using \`gemini-3.8-flash\`.
- **UI**: 100% Jetpack Compose with Material 3.
`
  );

  // Application class
  zip.file(
    'app/src/main/java/com/technovisaze/learningbot/TechnovisAzeApplication.kt',
    `package com.technovisaze.learningbot

import android.app.Application
import android.util.Log

class TechnovisAzeApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        Log.i("TechnovisAzeApp", "TechnovisAze Learning Bot Application initialized")
    }
}
`
  );

  // String resources
  zip.file(
    'app/src/main/res/values/strings.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">TechnovisAze Learning Bot</string>
    <string name="gemini_api_key">YOUR_GEMINI_API_KEY_HERE</string>
</resources>
`
  );

  // Add all primary files from androidFiles
  for (const file of ANDROID_FILES) {
    zip.file(file.path, file.content);
  }

  return await zip.generateAsync({ type: 'blob' });
}
