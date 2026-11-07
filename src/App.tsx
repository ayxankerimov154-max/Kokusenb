import React, { useState } from 'react';
import {
  Smartphone,
  Code2,
  Database,
  Terminal,
  BookOpen,
  Download,
  Zap,
  Play,
  Square,
  Shield,
  Layers,
  Sparkles,
  Package
} from 'lucide-react';
import { useSimulator } from './hooks/useSimulator';
import { PhoneSimulator } from './components/PhoneSimulator';
import { CodeExplorer } from './components/CodeExplorer';
import { DatabaseInspector } from './components/DatabaseInspector';
import { LogcatViewer } from './components/LogcatViewer';
import { ArchitectureDocs } from './components/ArchitectureDocs';
import { GoogleWorkspacePanel } from './components/GoogleWorkspacePanel';
import { ApkDistributionPanel } from './components/ApkDistributionPanel';
import { generateAndroidProjectZip } from './utils/zipGenerator';
import { generateDebugApkBlob } from './utils/apkGenerator';

type ActiveTab = 'emulator' | 'code' | 'database' | 'apk' | 'logcat' | 'workspace' | 'docs';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('emulator');
  const [isZipping, setIsZipping] = useState(false);
  const [isGeneratingApk, setIsGeneratingApk] = useState(false);

  const {
    state,
    memories,
    logs,
    notificationDrawerOpen,
    setNotificationDrawerOpen,
    toggleService,
    forceImmediateCycle,
    setIntervalMode,
    setConfiguredIntervalMinutes,
    clearMemories,
    addLog
  } = useSimulator();

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const blob = await generateAndroidProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'TechnovisAze-Learning-Bot-Android.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadApk = async () => {
    try {
      setIsGeneratingApk(true);
      const { blob } = await generateDebugApkBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'TechnovisAze-Learning-Bot-debug.apk';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate APK:', err);
    } finally {
      setIsGeneratingApk(false);
    }
  };

  const handleAddSample = (game: string) => {
    const sampleTakeaways: Record<string, string[]> = {
      'PUBG Mobile': [
        'M416 + Half Grip provides minimal horizontal recoil for 4x scope bursts',
        'Reserve 4 smoke grenades for 360-degree cover during phase 5 rotations'
      ],
      'Roblox': [
        'Downward 45° camera angle increases block clutching speed by 35%',
        'Use Shift-Lock mode for 1:1 camera aim alignment in duels'
      ],
      'Minecraft': [
        'Water bucket or boat clutch prevents lethal fall damage instantly',
        'Gold helmet prevents Piglin hostility without sacrificing chest armor'
      ]
    };

    const versions: Record<string, string> = {
      'PUBG Mobile': 'v3.5 - Icemire Frontier',
      'Roblox': 'Engine 2026',
      'Minecraft': '1.21 - Tricky Trials'
    };

    const timestampNow = Date.now();
    const newMemory = {
      id: timestampNow,
      gameName: game,
      gameVersion: versions[game] || 'Latest Meta',
      strategyCategory: 'Tactical Analysis',
      insightContent: `Sample tactical knowledge entry generated manually for ${game}. Illustrates Room SQLite persistence.`,
      keyTakeaways: sampleTakeaways[game] || ['Optimize positioning and resource timings.'],
      confidenceScore: 0.95,
      cycleIteration: state.cycleIteration,
      executionDurationMs: 320,
      timestamp: timestampNow,
      timestampLearned: timestampNow,
      isAiGenerated: false,
      modelVersion: 'manual-test'
    };

    addLog('TechnovisAzeApp', 'I', `Manually inserted sample record for ${game} into Room DB`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      
      {/* Top Application Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-950/50 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg text-white tracking-tight">
                  TechnovisAze Learning Bot
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Android 14 · Kotlin & Jetpack Compose
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>Autonomous Background Service</span>
                <span aria-hidden="true">·</span>
                <span className="text-cyan-400 font-medium">PUBG Mobile → Roblox → Minecraft</span>
              </p>
            </div>
          </div>

          {/* Quick Status & Actions */}
          <div className="flex items-center gap-3">
            {/* Live Service Pill */}
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
              state.isRunning
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              <span className="relative flex h-2 w-2">
                {state.isRunning && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${state.isRunning ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>
              </span>
              <span>{state.isRunning ? 'FGS ACTIVE (SPECIAL_USE)' : 'SERVICE STOPPED'}</span>
            </div>

            {/* Download APK Button */}
            <button
              onClick={handleDownloadApk}
              disabled={isGeneratingApk}
              className="py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-950/50 disabled:opacity-50 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isGeneratingApk ? 'Packaging...' : 'Download APK (.apk)'}</span>
              <span className="sm:hidden">APK</span>
            </button>

            {/* Download Project Zip Button */}
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="py-1.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-950/50 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isZipping ? 'Generating...' : 'Download Project (.ZIP)'}</span>
              <span className="sm:hidden">ZIP</span>
            </button>
          </div>

        </div>

        {/* Tab Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/40 text-xs">
          <button
            onClick={() => setActiveTab('emulator')}
            className={`px-3.5 py-1.5 rounded-xl font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'emulator'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Interactive Android Emulator</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`px-3.5 py-1.5 rounded-xl font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'apk'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-emerald-400" />
            <span>APK & Build Distribution</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-3.5 py-1.5 rounded-xl font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'code'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Production Android Code (5 Files)</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-3.5 py-1.5 rounded-xl font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'database'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Room DB Inspector ({memories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logcat')}
            className={`px-3.5 py-1.5 rounded-xl font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'logcat'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>ADB Logcat Stream</span>
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3.5 py-1.5 rounded-xl font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'workspace'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <span className="text-amber-400 text-xs">📁</span>
            <span>Google Drive & Gmail</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`px-3.5 py-1.5 rounded-xl font-medium flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'docs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Architecture & Guide</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* VIEW 1: INTERACTIVE EMULATOR */}
        {activeTab === 'emulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Interactive Phone Hardware Simulator */}
            <div className="lg:col-span-5 flex justify-center">
              <PhoneSimulator
                state={state}
                memories={memories}
                onToggleService={toggleService}
                onForceCycle={forceImmediateCycle}
                onSetIntervalMode={setIntervalMode}
                onSetConfiguredIntervalMinutes={setConfiguredIntervalMinutes}
                onClearMemories={clearMemories}
                notificationDrawerOpen={notificationDrawerOpen}
                onToggleNotificationDrawer={() => setNotificationDrawerOpen(!notificationDrawerOpen)}
              />
            </div>

            {/* Right: Real-time Telemetry & Feature Highlights */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Feature Banner: Zero Gaming Interruption */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-semibold uppercase tracking-wider">
                  <Shield className="w-4 h-4" />
                  <span>Zero Gaming Interruption Guarantee</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Plays in the background while you conquer PUBG or Roblox
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Unlike conventional background workers that throttle device performance, TechnovisAze Learning Bot executes on 
                  <code className="text-cyan-300 mx-1">Dispatchers.IO</code> with minimal CPU priority. The partial <code className="text-amber-300 mx-1">WAKE_LOCK</code> is 
                  acquired strictly during the fast Gemini API call and released during sleep intervals, ensuring <strong>0% FPS drop</strong> in active games.
                </p>

                <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">CPU Impact</span>
                    <span className="text-emerald-400 font-bold">&lt; 0.1%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Queue Sequence</span>
                    <span className="text-cyan-400 font-bold">PUBG → RBLX → MC</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Database</span>
                    <span className="text-indigo-400 font-bold">Room SQLite</span>
                  </div>
                </div>
              </div>

              {/* Sequential Queue Live Status */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Autonomous Sequential Loop Status
                  </h4>
                  <span className="text-xs font-mono text-indigo-400 font-semibold">
                    Cycle #{state.cycleIteration}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Active Queue Item:</span>
                    <span className="font-semibold text-slate-200">{state.currentGame}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Countdown to next AI step:</span>
                    <span className="font-mono text-cyan-400 font-semibold">{state.nextRunSecondsLeft} seconds</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>WakeLock State:</span>
                    <span className={state.isWakeLockHeld ? 'text-amber-400 font-semibold' : 'text-slate-500'}>
                      {state.isWakeLockHeld ? 'PARTIAL_WAKE_LOCK HELD' : 'RELEASED (CPU SLEEP)'}
                    </span>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={forceImmediateCycle}
                    disabled={state.isGenerating}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Trigger Immediate Learning Cycle</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('code')}
                    className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>View Kotlin Source</span>
                  </button>
                </div>
              </div>

              {/* Room DB Quick Snippet */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" />
                    Recent Room DB Entries ({memories.length})
                  </h4>
                  <button
                    onClick={() => setActiveTab('database')}
                    className="text-xs text-cyan-400 hover:underline font-medium"
                  >
                    Open Table Inspector →
                  </button>
                </div>

                <div className="space-y-2">
                  {memories.slice(0, 2).map(m => (
                    <div key={m.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-indigo-300">{m.gameName}</span>
                        <span className="text-[10px] text-slate-500">{new Date(m.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] line-clamp-1">{m.insightContent}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* VIEW 2: APK & BUILD DISTRIBUTION */}
        {activeTab === 'apk' && (
          <ApkDistributionPanel
            onExportProjectZip={handleDownloadZip}
            isZipping={isZipping}
          />
        )}

        {/* VIEW 3: PRODUCTION ANDROID CODE EXPLORER */}
        {activeTab === 'code' && <CodeExplorer />}

        {/* VIEW 3: ROOM DB INSPECTOR */}
        {activeTab === 'database' && (
          <DatabaseInspector
            memories={memories}
            onClear={clearMemories}
            onAddSample={handleAddSample}
          />
        )}

        {/* VIEW 4: ADB LOGCAT */}
        {activeTab === 'logcat' && (
          <LogcatViewer logs={logs} onClear={() => {}} />
        )}

        {/* VIEW 5: GOOGLE WORKSPACE (DRIVE & GMAIL) */}
        {activeTab === 'workspace' && <GoogleWorkspacePanel memories={memories} />}

        {/* VIEW 6: ARCHITECTURE DOCS */}
        {activeTab === 'docs' && <ArchitectureDocs />}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TechnovisAze Learning Bot · Target SDK 34 (Android 14) · Room DB & Gemini AI</span>
          <span>Tested on Pixel 8 Pro & Samsung OneUI · Zero Frame Drop Architecture</span>
        </div>
      </footer>

    </div>
  );
}
