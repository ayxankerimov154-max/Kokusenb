import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Database,
  Sparkles,
  Zap,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Terminal
} from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-y-auto h-[780px] p-6 lg:p-8 space-y-8 text-slate-200">
      
      {/* Title & Overview */}
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-semibold tracking-wider uppercase">
          <Cpu className="w-4 h-4" />
          <span>System Architecture & Engineering Specification</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          TechnovisAze Learning Bot: Zero-Interruption Background Architecture
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-4xl">
          An enterprise-grade autonomous Android background engine that synthesizes competitive game meta
          tactics using Google's Gemini Generative AI SDK, persisting knowledge into Room SQLite DB while guaranteeing
          zero frame rate (FPS) drops or input latency degradation for active gamers.
        </p>
      </div>

      {/* High-Level Architecture Flow Diagram */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Core Dataflow & Autonomous Sequence
        </h3>
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="text-indigo-400 font-bold">1. Queue Selector</span>
            <p className="text-slate-300 font-sans text-[11px]">
              Cycles strictly in order: <strong>PUBG Mobile</strong> → <strong>Roblox</strong> → <strong>Minecraft</strong>.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="text-amber-400 font-bold">2. WAKE_LOCK & AI Call</span>
            <p className="text-slate-300 font-sans text-[11px]">
              Acquires partial wake lock, constructs tailored JSON prompt, calls <code>gemini-3.8-flash</code> on <code>Dispatchers.IO</code>.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="text-cyan-400 font-bold">3. Room DB Ingestion</span>
            <p className="text-slate-300 font-sans text-[11px]">
              Parses key takeaways & confidence, inserts <code>BotMemoryEntity</code> into SQLite via Room DAO.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="text-emerald-400 font-bold">4. Zero-Impact Sleep</span>
            <p className="text-slate-300 font-sans text-[11px]">
              Releases WakeLock, sleeps for 30 minutes, keeping CPU load at &lt;0.1% while user games.
            </p>
          </div>
        </div>
      </div>

      {/* 4 Deep-Dive Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pillar 1: Android 14+ FGS SpecialUse */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Android 14 (API 34) SpecialUse FGS Compliance</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Google introduced strict foreground service restrictions in Android 14. To run an autonomous background bot,
            the app declares <code>foregroundServiceType="specialUse"</code> and provides the mandatory
            <code>PROPERTY_SPECIAL_USE_FGS_SUBTYPE</code> string explaining its purpose to Google Play review.
          </p>
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-400">
            &lt;property android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
            android:value="Autonomous gaming strategy analysis..." /&gt;
          </div>
        </div>

        {/* Pillar 2: WAKE_LOCK Safety */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <Zap className="w-4 h-4" />
            <span>Zero-Gaming-Impact WAKE_LOCK Strategy</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Many background services drain battery or trigger frame drops during competitive PUBG or Roblox matches.
            TechnovisAze solves this by:
          </p>
          <ul className="text-xs text-slate-300 space-y-1 font-sans">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Holding <code>PARTIAL_WAKE_LOCK</code> <strong>only</strong> during the 300ms–800ms Gemini network call.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Releasing the lock immediately during the 30-minute sleep interval.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Restricting all compute strictly to <code>Dispatchers.IO</code> background threads.</span>
            </li>
          </ul>
        </div>

        {/* Pillar 3: Room DB Schema v2 & Migrations */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Database className="w-4 h-4" />
            <span>Room DB Schema v2 & Resilient Transactions</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Schema Version 2 adds <code>game_version</code> (tracking patch-specific meta) and <code>timestamp_learned</code>,
            complete with <code>MIGRATION_1_2</code>. Database operations in <code>BackgroundLearningService</code> implement
            a 3-attempt retry loop with 500ms delay, guaranteeing that transient SQLite lock contention never crashes the service.
          </p>
        </div>

        {/* Pillar 4: Gemini SDK with Exponential Backoff */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Gemini SDK & Exponential Backoff Retries</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Uses <code>gemini-3.8-flash</code> with tailored version-specific prompts. API calls are wrapped in an exponential
            backoff loop (2s → 4s → 8s) on <code>Dispatchers.IO</code>. All exceptions are caught and logged so transient network drops
            or HTTP 429 rate limits do not disrupt the autonomous queue.
          </p>
        </div>

      </div>

      {/* Android Studio Quick Setup Guide */}
      <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileCode className="w-4 h-4 text-indigo-400" />
          How to Deploy in Android Studio (Step-by-Step)
        </h3>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center shrink-0">1</span>
            <div>
              <strong className="text-slate-100">Download or Copy Files:</strong> Click <em>"Download Project (.ZIP)"</em> in the Code tab, or copy the 5 core Kotlin & XML files into your Android Studio project.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center shrink-0">2</span>
            <div>
              <strong className="text-slate-100">Set your Gemini API Key:</strong> In your project root, open <code>local.properties</code> and add:
              <pre className="mt-1 p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300">
                GEMINI_API_KEY=AIzaSy...your_gemini_key_here
              </pre>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center shrink-0">3</span>
            <div>
              <strong className="text-slate-100">Sync & Run:</strong> Sync Gradle with project files and run on any Android 8.0+ (API 26 to 34) physical device or emulator.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 font-bold flex items-center justify-center shrink-0">4</span>
            <div>
              <strong className="text-slate-100">Grant Notification Permission:</strong> Tap <em>"Start Autonomous Learning Loop"</em>. Android 13+ will prompt for notification permission to keep the foreground service alive.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
