import React, { useState } from 'react';
import {
  Play,
  Square,
  Sparkles,
  Zap,
  Battery,
  Wifi,
  ChevronDown,
  ChevronUp,
  Clock,
  Trash2,
  Bell,
  Cpu,
  Layers,
  Sliders,
  CheckCircle2,
  ExternalLink,
  Timer
} from 'lucide-react';
import { BotMemory, QueueGame, SimulatorState } from '../types/simulator';

interface PhoneSimulatorProps {
  state: SimulatorState;
  memories: BotMemory[];
  onToggleService: () => void;
  onForceCycle: () => void;
  onSetIntervalMode: (mode: 'demo' | 'prod') => void;
  onSetConfiguredIntervalMinutes: (minutes: number) => void;
  onClearMemories: () => void;
  notificationDrawerOpen: boolean;
  onToggleNotificationDrawer: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  state,
  memories,
  onToggleService,
  onForceCycle,
  onSetIntervalMode,
  onSetConfiguredIntervalMinutes,
  onClearMemories,
  notificationDrawerOpen,
  onToggleNotificationDrawer,
}) => {
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>('ALL');
  const [expandedMemoryId, setExpandedMemoryId] = useState<number | null>(null);

  const filteredMemories = memories.filter(
    m => selectedGameFilter === 'ALL' || m.gameName === selectedGameFilter
  );

  const games: QueueGame[] = ['PUBG Mobile', 'Roblox', 'Minecraft'];

  return (
    <div className="flex flex-col items-center">
      {/* Emulator Outer Bezel */}
      <div className="relative w-[360px] sm:w-[390px] h-[780px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 shadow-cyan-950/20 ring-1 ring-slate-700/50 flex flex-col overflow-hidden">
        
        {/* Notch / Dynamic Island & Hardware Speaker */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30 pointer-events-none">
          <div className="w-12 h-1 bg-slate-800 rounded-full" />
          <div className="w-3.5 h-3.5 bg-black rounded-full ring-2 ring-slate-900 border border-slate-800/80" />
        </div>

        {/* Android System Status Bar */}
        <div className="w-full pt-2 px-6 pb-1 flex items-center justify-between text-[11px] font-semibold text-slate-300 z-20 select-none bg-slate-950/90 backdrop-blur-md">
          <span>04:56</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-emerald-400 font-mono tracking-wider">5G</span>
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono">98%</span>
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Foreground Notification Drawer Pull-tab */}
        <div className="w-full px-2 pt-1 pb-1 z-20">
          <button
            onClick={onToggleNotificationDrawer}
            className={`w-full py-1.5 px-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
              state.isRunning
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/60'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Bell className={`w-3.5 h-3.5 shrink-0 ${state.isRunning ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="truncate font-medium text-[11px]">
                {state.isRunning
                  ? `FGS Active: ${state.currentGame} (${state.nextRunSecondsLeft}s)`
                  : 'FGS Idle: Service Stopped'}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0 text-[10px] font-mono text-slate-400">
              <span>Drawer</span>
              {notificationDrawerOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </div>
          </button>

          {/* Expanded Android Notification */}
          {notificationDrawerOpen && (
            <div className="mt-1.5 p-3 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-lg text-xs space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[9px]">
                    TA
                  </div>
                  <span className="font-semibold text-slate-200 text-[11px]">TechnovisAze Learning Bot</span>
                </div>
                <span className="text-[10px] text-slate-400">Interval: {state.configuredIntervalMinutes}m</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-tight">
                {state.statusMessage}
              </p>
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                <button
                  onClick={onToggleService}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-medium text-[10px] flex items-center gap-1"
                >
                  <Square className="w-2.5 h-2.5" />
                  {state.isRunning ? 'Stop Service' : 'Start Service'}
                </button>
                <div className="text-[10px] text-slate-400 ml-auto flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-cyan-400" />
                  <span>specialUse · Backoff retry</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Jetpack Compose Screen Container */}
        <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-3.5 text-slate-100 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Jetpack Compose TopAppBar */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div>
              <h2 className="text-sm font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
                TechnovisAze Learning Bot
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">v1.1</span>
              </h2>
              <p className="text-[10px] text-slate-400">Autonomous Background Gaming AI</p>
            </div>
            <button
              onClick={onClearMemories}
              title="Clear Room DB"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 1. Service Control Card (Compose Material 3 Card) */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            state.isRunning
              ? 'bg-slate-900/90 border-indigo-500/40 shadow-sm shadow-indigo-950/30'
              : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  {state.isRunning && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${state.isRunning ? 'bg-emerald-400' : 'bg-rose-500'}`}></span>
                </span>
                <span className="text-[11px] font-bold tracking-wide uppercase text-slate-200">
                  {state.isRunning ? 'Foreground Service Active' : 'Service Stopped'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-medium flex items-center gap-1 ${
                  state.isWakeLockHeld
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  <Zap className="w-2.5 h-2.5" />
                  {state.isWakeLockHeld ? 'WAKELOCK' : 'LOW-POWER'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 line-clamp-2 mb-3 min-h-[32px]">
              {state.statusMessage}
            </p>

            <button
              onClick={onToggleService}
              className={`w-full py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                state.isRunning
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/40'
              }`}
            >
              {state.isRunning ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Background Service</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Autonomous Learning Loop</span>
                </>
              )}
            </button>
          </div>

          {/* 2. Configurable Learning Interval Slider (SharedPreferences) */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-cyan-400" />
                Learning Delay (SharedPreferences)
              </span>
              <span className="font-mono text-[11px] text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                {state.configuredIntervalMinutes} min
              </span>
            </div>

            <p className="text-[10px] text-slate-400 leading-tight">
              Adjusts the sleep delay between game iterations to maintain &lt;0.1% CPU impact while user games.
            </p>

            {/* Range Slider */}
            <div className="pt-1">
              <input
                type="range"
                min="1"
                max="60"
                step="1"
                value={state.configuredIntervalMinutes}
                onChange={e => onSetConfiguredIntervalMinutes(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-1">
                <span>1 min</span>
                <span>15 min</span>
                <span>30 min (default)</span>
                <span>60 min</span>
              </div>
            </div>

            {/* Quick preset chips */}
            <div className="flex items-center justify-between gap-1.5 pt-1">
              {[5, 15, 30, 60].map(mins => (
                <button
                  key={mins}
                  onClick={() => onSetConfiguredIntervalMinutes(mins)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                    state.configuredIntervalMinutes === mins
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-850 hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* 3. Sequential Queue Stepper (PUBG Mobile -> Roblox -> Minecraft) */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Sequential Queue Order
              </span>
              <span className="font-mono text-[10px] text-indigo-400 font-bold">
                Cycle #{state.cycleIteration}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {games.map((game, idx) => {
                const isActive = state.currentGame.includes(game);
                return (
                  <div
                    key={game}
                    className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 border-indigo-500/60 ring-1 ring-indigo-500/30'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 ${
                      isActive
                        ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/50'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className={`text-[10px] font-semibold leading-tight ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {game}
                    </span>
                    {isActive && (
                      <span className="mt-1 text-[8px] font-mono uppercase text-indigo-300 font-bold bg-indigo-500/30 px-1 rounded">
                        {state.isGenerating ? 'Analyzing' : 'Active'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Countdown / Progress Bar */}
            {state.isRunning && (
              <div className="pt-1.5 space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Next AI Step:</span>
                  <span className="text-indigo-300 font-semibold">{state.nextRunSecondsLeft}s</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-1000"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(
                          100,
                          100 - (state.nextRunSecondsLeft / (state.intervalMode === 'demo' ? 12 : state.configuredIntervalMinutes * 60)) * 100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Emulator Controls: Immediate Cycle & Interval Selector */}
          <div className="p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs gap-2">
            <button
              onClick={onForceCycle}
              disabled={state.isGenerating}
              className="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-[10px] flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Force Next Cycle</span>
            </button>

            {/* Interval Mode Switch */}
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-[10px]">
              <button
                onClick={() => onSetIntervalMode('demo')}
                className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                  state.intervalMode === 'demo'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                12s Demo
              </button>
              <button
                onClick={() => onSetIntervalMode('prod')}
                className={`px-2 py-1 rounded-lg font-medium transition-colors ${
                  state.intervalMode === 'prod'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {state.configuredIntervalMinutes}m Live
              </button>
            </div>
          </div>

          {/* 4. Room Database Strategies Section Header & Filters */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">
                Learned Strategies (Room DB v2)
              </span>
              <span className="text-[10px] text-cyan-400 font-mono font-medium">
                {memories.length} Indexed
              </span>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
              {['ALL', 'PUBG Mobile', 'Roblox', 'Minecraft'].map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedGameFilter(f)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedGameFilter === f
                      ? 'bg-slate-800 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Memory List with version badges */}
          <div className="space-y-2.5 pb-4">
            {filteredMemories.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-1">
                <p className="text-xs font-semibold text-slate-300">No memories recorded yet</p>
                <p className="text-[10px] text-slate-500">
                  {state.isRunning ? 'Analyzing in background...' : 'Start the service to index strategies.'}
                </p>
              </div>
            ) : (
              filteredMemories.map(memory => {
                const isExpanded = expandedMemoryId === memory.id;
                const timeString = new Date(memory.timestampLearned || memory.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                });

                return (
                  <div
                    key={memory.id}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700 transition-all text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-indigo-300 text-[11px]">
                          {memory.gameName}
                        </span>
                        {/* Version Badge */}
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                          {memory.gameVersion || 'v3.5 / 1.21'}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500">
                        {timeString}
                      </span>
                    </div>

                    <div className="text-[10px] font-semibold text-cyan-300/90">
                      {memory.strategyCategory}
                    </div>

                    <p className={`text-[11px] text-slate-300 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {memory.insightContent}
                    </p>

                    {memory.keyTakeaways && memory.keyTakeaways.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-slate-800/60">
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                          Key Takeaways
                        </span>
                        <div className="space-y-0.5">
                          {memory.keyTakeaways.map((takeaway, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                              <span className="text-indigo-400 font-bold leading-none mt-0.5">•</span>
                              <span>{takeaway}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/40 text-[9px] text-slate-500">
                      <span>Conf: {Math.round(memory.confidenceScore * 100)}% · Cycle #{memory.cycleIteration}</span>
                      <button
                        onClick={() => setExpandedMemoryId(isExpanded ? null : memory.id)}
                        className="text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        {isExpanded ? 'Show Less' : 'Show More'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Android Hardware Bottom Navigation Bar */}
        <div className="w-full pt-2 pb-1 px-8 flex items-center justify-around text-slate-500 border-t border-slate-900 bg-slate-950/95 z-20 select-none">
          <div className="w-4 h-4 flex items-center justify-center">
            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-r-[8px] border-r-slate-400 border-b-[5px] border-b-transparent" />
          </div>
          <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400" />
          <div className="w-3.5 h-3.5 rounded-sm border-2 border-slate-400" />
        </div>

      </div>
    </div>
  );
};
