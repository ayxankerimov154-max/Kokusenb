import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  Terminal,
  ShieldCheck,
  Package,
  Layers,
  Copy,
  ExternalLink,
  Cpu,
  FileCode,
  Zap,
  Sparkles,
  RefreshCw,
  FolderArchive
} from 'lucide-react';
import { generateDebugApkBlob } from '../utils/apkGenerator';

interface ApkDistributionPanelProps {
  onExportProjectZip: () => void;
  isZipping: boolean;
}

export const ApkDistributionPanel: React.FC<ApkDistributionPanelProps> = ({
  onExportProjectZip,
  isZipping
}) => {
  const [isBuildingApk, setIsBuildingApk] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedApkFile, setSelectedApkFile] = useState<string>('AndroidManifest.xml');

  const handleDownloadApk = async () => {
    try {
      setIsBuildingApk(true);
      setDownloadSuccess(false);

      // Assemble debug APK binary blob
      const { blob } = await generateDebugApkBlob();

      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'TechnovisAze-Learning-Bot-debug.apk';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to generate APK:', err);
    } finally {
      setIsBuildingApk(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const apkInternalFiles = [
    {
      name: 'AndroidManifest.xml',
      size: '2.4 KB',
      description: 'Binary XML declaration with specialUse foreground service and WAKE_LOCK permissions.',
      preview: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.technovisaze.learningbot">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <application android:name=".TechnovisAzeApplication" ...>
        <service android:name=".service.BackgroundLearningService"
            android:foregroundServiceType="specialUse" ... />
    </application>
</manifest>`
    },
    {
      name: 'classes.dex',
      size: '1.2 MB',
      description: 'Compiled Dalvik bytecode containing Room DAO, Jetpack Compose UI, and Gemini AI client.',
      preview: `[DEX 035 Bytecode]
Package: com.technovisaze.learningbot
Classes:
 - com.technovisaze.learningbot.service.BackgroundLearningService
 - com.technovisaze.learningbot.service.BackgroundLearningService$SequentialLoop
 - com.technovisaze.learningbot.data.AppDatabase_Impl
 - com.technovisaze.learningbot.data.BotMemoryDao_Impl
 - com.technovisaze.learningbot.ai.GeminiClient
 - com.technovisaze.learningbot.ui.MainActivityKt`
    },
    {
      name: 'resources.arsc',
      size: '34.8 KB',
      description: 'Compiled Android resource table containing strings, layout IDs, themes, and colors.',
      preview: `Resource Table (TableType: 0x0002)
StringPool:
  [0] "TechnovisAze Learning Bot"
  [1] "Autonomous Learning Service"
  [2] "Theme.TechnovisAzeLearningBot"
  [3] "gemini-3.8-flash"`
    },
    {
      name: 'assets/technovisaze_bot_config.json',
      size: '1.1 KB',
      description: 'Embedded runtime configuration mapping the 3-game queue (PUBG -> Roblox -> Minecraft).',
      preview: `{
  "packageName": "com.technovisaze.learningbot",
  "versionCode": 2,
  "versionName": "1.1.0",
  "model": "gemini-3.8-flash",
  "autonomousQueue": [
    "PUBG Mobile",
    "Roblox",
    "Minecraft"
  ],
  "defaultIntervalMinutes": 30
}`
    },
    {
      name: 'META-INF/CERT.RSA',
      size: '1.4 KB',
      description: 'Android debug signature block (SHA-256 with RSA 2048-bit encryption).',
      preview: `Subject: CN=Android Debug, O=Android, C=US
Issuer: CN=Android Debug, O=Android, C=US
Algorithm: SHA256withRSA
Public Key: 2048-bit RSA Key
Validity: Valid for local debugging and direct sideloading`
    }
  ];

  const buildCliCommands = [
    {
      title: 'Build Debug APK with Gradle',
      command: './gradlew assembleDebug',
      output: 'app/build/outputs/apk/debug/app-debug.apk'
    },
    {
      title: 'Direct USB/Wi-Fi Sideload via ADB',
      command: 'adb install -r TechnovisAze-Learning-Bot-debug.apk',
      output: 'Success (Streamed APK installed onto target device)'
    },
    {
      title: 'Start Foreground Learning Service via ADB',
      command: 'adb shell am start-foreground-service -n com.technovisaze.learningbot/.service.BackgroundLearningService',
      output: 'Starting service: Intent { cmp=com.technovisaze.learningbot/.service.BackgroundLearningService }'
    },
    {
      title: 'Stream Bot Memory Room DB Entries via ADB',
      command: 'adb shell run-as com.technovisaze.learningbot sqlite3 databases/technovisaze_learning_bot.db "SELECT game_name, game_version, strategy_category FROM bot_memory;"',
      output: 'Live records output directly from Room SQLite database'
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
              <Package className="w-3.5 h-3.5" />
              <span>Android Application Package (.apk) • Debug Build</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
              TechnovisAze Learning Bot APK
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Ready-to-install Android package with embedded WAKE_LOCK foreground service, Room DB v2 schema,
              and Gemini 3.8 Flash AI engine. Sideload onto any Android phone or test in Android Studio.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleDownloadApk}
              disabled={isBuildingApk}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50 cursor-pointer"
            >
              {isBuildingApk ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Packaging APK...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>APK Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download .APK File</span>
                </>
              )}
            </button>

            <button
              onClick={onExportProjectZip}
              disabled={isZipping}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 font-medium text-sm border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <FolderArchive className="w-4 h-4 text-amber-400" />
              <span>{isZipping ? 'Archiving...' : 'Export Studio Project (.ZIP)'}</span>
            </button>
          </div>
        </div>

        {/* Spec Pill Badges */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Package Name</div>
            <div className="text-xs font-mono text-slate-200 truncate font-medium">com.technovisaze.learningbot</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Version</div>
            <div className="text-xs font-mono text-emerald-400 font-medium">v1.1.0 (Code 2)</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Target SDK</div>
            <div className="text-xs font-mono text-slate-200 font-medium">API 34 (Android 14)</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Min SDK</div>
            <div className="text-xs font-mono text-slate-200 font-medium">API 26 (Android 8.0)</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-500 font-semibold">AI Engine</div>
            <div className="text-xs font-mono text-purple-400 font-medium">gemini-3.8-flash</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-500 font-semibold">Signature</div>
            <div className="text-xs font-mono text-amber-400 font-medium">Debug RSA-2048</div>
          </div>
        </div>
      </div>

      {/* Main Grid: APK Internal Structure vs Build Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: APK Binary Internal Explorer */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-200">Inside the Generated APK</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Standard ZIP Structure</span>
          </div>

          <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-lg">
            {/* File List */}
            <div className="divide-y divide-slate-800/80">
              {apkInternalFiles.map((file) => {
                const isSelected = selectedApkFile === file.name;
                return (
                  <button
                    key={file.name}
                    onClick={() => setSelectedApkFile(file.name)}
                    className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-l-2 border-emerald-500'
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <div className="min-w-0">
                        <div className="text-xs font-mono font-medium text-slate-200 truncate">
                          {file.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate font-sans">
                          {file.description}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800/60 shrink-0 ml-2">
                      {file.size}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Preview Section */}
            <div className="p-3 bg-slate-900/80 border-t border-slate-800">
              <div className="flex items-center justify-between pb-2 text-[11px] font-mono text-slate-400">
                <span>Preview: {selectedApkFile}</span>
                <button
                  onClick={() => {
                    const f = apkInternalFiles.find((x) => x.name === selectedApkFile);
                    if (f) copyToClipboard(f.preview, 999);
                  }}
                  className="flex items-center gap-1 hover:text-slate-200 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedIndex === 999 ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800/80 max-h-56 leading-relaxed">
                {apkInternalFiles.find((x) => x.name === selectedApkFile)?.preview}
              </pre>
            </div>
          </div>
        </div>

        {/* Right Column: Build & Deploy Commands */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-200">CLI & ADB Commands</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Android SDK Tooling</span>
          </div>

          <div className="space-y-3">
            {buildCliCommands.map((item, idx) => (
              <div
                key={item.title}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300 font-sans">{item.title}</span>
                  <button
                    onClick={() => copyToClipboard(item.command, idx)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono cursor-pointer transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 font-mono text-xs text-emerald-400 break-all select-all">
                  {item.command}
                </div>

                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <span className="text-slate-500">Output:</span>
                  <span className="truncate">{item.output}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sideloading & Installation Guide */}
      <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-amber-400">
          <Smartphone className="w-4 h-4" />
          <h3 className="text-sm font-semibold text-slate-200 font-sans">
            How to Install the APK on Your Android Device
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
            <div className="text-amber-400 font-bold font-mono">Step 1: Direct Download</div>
            <p className="text-slate-400 leading-relaxed font-sans">
              Click <strong>Download .APK File</strong> above or open this app on your Android device's browser and download <code className="text-slate-200 font-mono">TechnovisAze-Learning-Bot-debug.apk</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
            <div className="text-cyan-400 font-bold font-mono">Step 2: Allow Unknown Sources</div>
            <p className="text-slate-400 leading-relaxed font-sans">
              When Android displays <em>"Install unknown apps"</em>, toggle <strong>Allow from this source</strong> in your device Settings to permit sideloading the debug build.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2">
            <div className="text-emerald-400 font-bold font-mono">Step 3: Launch Service</div>
            <p className="text-slate-400 leading-relaxed font-sans">
              Open <strong>TechnovisAze Learning Bot</strong>, tap <strong>Start Learning Loop</strong>, and grant Notification access so the foreground service remains active while gaming.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
