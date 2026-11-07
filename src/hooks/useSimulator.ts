import { useState, useEffect, useRef, useCallback } from 'react';
import { BotMemory, LogEntry, QueueGame, SimulatorState } from '../types/simulator';
import { INITIAL_BOT_MEMORIES, INITIAL_LOGS } from '../services/mockInitialData';

const QUEUE_GAMES: QueueGame[] = ['PUBG Mobile', 'Roblox', 'Minecraft'];

export function useSimulator() {
  const [memories, setMemories] = useState<BotMemory[]>(() => {
    try {
      const saved = localStorage.getItem('technovisaze_bot_memories');
      return saved ? JSON.parse(saved) : INITIAL_BOT_MEMORIES;
    } catch {
      return INITIAL_BOT_MEMORIES;
    }
  });

  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);

  // SharedPreferences simulation for interval in minutes
  const [configuredIntervalMinutes, setConfiguredIntervalMinutesState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('technovisaze_learning_interval_minutes');
      return saved ? parseInt(saved, 10) : 30;
    } catch {
      return 30;
    }
  });

  const [state, setState] = useState<SimulatorState>({
    isRunning: true,
    currentGame: 'PUBG Mobile',
    queueIndex: 0,
    cycleIteration: 2,
    isWakeLockHeld: true,
    statusMessage: 'Foreground Service active. Autonomous loop running.',
    lastRunTimestamp: Date.now() - 10000,
    nextRunSecondsLeft: 12,
    intervalMode: 'demo', // 'demo' = 12s, 'prod' = configuredIntervalMinutes * 60
    configuredIntervalMinutes,
    isGenerating: false,
    batteryOptimized: true,
    totalInsightsGenerated: 3
  });

  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  // Sync memories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('technovisaze_bot_memories', JSON.stringify(memories));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  }, [memories]);

  // Sync SharedPreferences interval
  const setConfiguredIntervalMinutes = useCallback((minutes: number) => {
    const clamped = Math.max(1, Math.min(180, minutes));
    setConfiguredIntervalMinutesState(clamped);
    try {
      localStorage.setItem('technovisaze_learning_interval_minutes', clamped.toString());
    } catch (e) {
      console.warn('SharedPreferences save error:', e);
    }
    setState(prev => ({
      ...prev,
      configuredIntervalMinutes: clamped,
      nextRunSecondsLeft: prev.intervalMode === 'prod' ? clamped * 60 : prev.nextRunSecondsLeft
    }));
    addLog('SharedPreferences', 'I', `Updated "learning_interval_minutes" = ${clamped} min. Service listener notified.`);
  }, []);

  const addLog = useCallback((tag: string, level: 'D' | 'I' | 'W' | 'E', message: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: timeStr,
      tag,
      level,
      message
    };
    setLogs(prev => [newLog, ...prev.slice(0, 79)]);
  }, []);

  // Safe Room DB insertion with retry logic (3 attempts with 500ms delay)
  const safeRoomInsert = async (entity: BotMemory): Promise<boolean> => {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setMemories(prev => [entity, ...prev]);
        addLog('RoomDatabase', 'D', `Room DB insert success on attempt ${attempt} for ${entity.gameName} (rowId: ${entity.id})`);
        return true;
      } catch (err: any) {
        addLog('RoomDatabase', 'W', `Room DB insert attempt ${attempt} failed: ${err?.message}. Retrying in 500ms...`);
        if (attempt === maxRetries) {
          addLog('RoomDatabase', 'E', `All ${maxRetries} Room DB insert attempts exhausted for ${entity.gameName}`);
          return false;
        }
        await new Promise(res => setTimeout(res, 500));
      }
    }
    return false;
  };

  // Safe Gemini API call with exponential backoff retry logic (initial 2s, factor 2.0, max 3 retries)
  const fetchWithExponentialBackoff = async (gameName: string, iteration: number): Promise<any> => {
    const maxRetries = 3;
    let delayMs = 1500;
    const factor = 2.0;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        addLog('TechnovisAzeGemini', 'D', `Gemini API attempt ${attempt}/${maxRetries} on Dispatchers.IO for ${gameName}`);
        const response = await fetch('/api/learn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameName,
            cycleIteration: iteration
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (err: any) {
        addLog('TechnovisAzeGemini', 'W', `Gemini API call failed on attempt ${attempt}: ${err?.message || err}. Backoff delay: ${delayMs}ms`);
        if (attempt === maxRetries) {
          throw err;
        }
        await new Promise(res => setTimeout(res, delayMs));
        delayMs = Math.round(delayMs * factor);
      }
    }
    throw new Error('Exponential backoff retries exhausted');
  };

  const executeLearningCycle = useCallback(async () => {
    setState(prev => {
      if (!prev.isRunning || prev.isGenerating) return prev;
      return {
        ...prev,
        isGenerating: true,
        isWakeLockHeld: true,
        statusMessage: `Analyzing version-specific tactics for ${prev.currentGame} via Gemini (with exponential backoff)...`
      };
    });

    const activeGame = state.currentGame;
    const currentIteration = state.cycleIteration;

    addLog('TechnovisAzeService', 'I', `=== Starting Learning Cycle for: ${activeGame} [Iteration #${currentIteration}] ===`);
    addLog('TechnovisAzeService', 'D', `Acquired PowerManager.PARTIAL_WAKE_LOCK for ${activeGame} network task`);

    try {
      // Execute Gemini call with exponential backoff
      const data = await fetchWithExponentialBackoff(activeGame, currentIteration);

      if (data && data.success) {
        const timestampNow = Date.now();
        const newEntity: BotMemory = {
          id: timestampNow,
          gameName: data.gameName,
          gameVersion: data.gameVersion || 'Latest Meta',
          strategyCategory: data.strategyCategory,
          insightContent: data.insightContent,
          keyTakeaways: data.keyTakeaways || [],
          confidenceScore: data.confidenceScore || 0.95,
          cycleIteration: currentIteration,
          executionDurationMs: data.executionDurationMs || 350,
          timestamp: timestampNow,
          timestampLearned: data.timestampLearned || timestampNow,
          isAiGenerated: data.isAiGenerated,
          modelVersion: data.modelUsed
        };

        // Insert into Room DB with retry logic
        await safeRoomInsert(newEntity);

        addLog('TechnovisAzeService', 'I', `Strategy saved: [${data.gameVersion}] ${data.gameName} · ${newEntity.strategyCategory}`);
        addLog('TechnovisAzeService', 'D', `Execution latency: ${data.executionDurationMs}ms · ${newEntity.keyTakeaways.length} takeaways`);

        // Compute next game in queue
        const nextIdx = (state.queueIndex + 1) % QUEUE_GAMES.length;
        const nextGame = QUEUE_GAMES[nextIdx];
        const nextIteration = nextIdx === 0 ? currentIteration + 1 : currentIteration;
        const nextDelay = state.intervalMode === 'demo' ? 12 : configuredIntervalMinutes * 60;

        addLog('TechnovisAzeService', 'D', `Sequence step complete. Next queue item: ${nextGame} in ${nextDelay}s. Releasing WakeLock to low-power sleep.`);

        setState(prev => ({
          ...prev,
          queueIndex: nextIdx,
          currentGame: nextGame,
          cycleIteration: nextIteration,
          isGenerating: false,
          isWakeLockHeld: false, // Low power during sleep
          statusMessage: `Learned ${activeGame} (${data.gameVersion}). Sleeping before ${nextGame}...`,
          lastRunTimestamp: Date.now(),
          nextRunSecondsLeft: nextDelay,
          totalInsightsGenerated: prev.totalInsightsGenerated + 1
        }));
      }
    } catch (err: any) {
      addLog('TechnovisAzeService', 'E', `Learning cycle exception caught: ${err?.message || 'Network error'}. Service remains alive; will retry on next schedule.`);
      const nextDelay = state.intervalMode === 'demo' ? 12 : configuredIntervalMinutes * 60;
      setState(prev => ({
        ...prev,
        isGenerating: false,
        isWakeLockHeld: false,
        statusMessage: `Analysis error on ${activeGame}. Rescheduling next cycle safely...`,
        nextRunSecondsLeft: nextDelay
      }));
    }
  }, [state.currentGame, state.cycleIteration, state.queueIndex, state.intervalMode, configuredIntervalMinutes, addLog]);

  // Main countdown timer loop
  useEffect(() => {
    if (!state.isRunning) return;

    const timer = setInterval(() => {
      setState(prev => {
        if (!prev.isRunning || prev.isGenerating) return prev;

        if (prev.nextRunSecondsLeft <= 1) {
          setTimeout(() => {
            executeLearningCycle();
          }, 0);
          return {
            ...prev,
            nextRunSecondsLeft: prev.intervalMode === 'demo' ? 12 : prev.configuredIntervalMinutes * 60
          };
        }

        return {
          ...prev,
          nextRunSecondsLeft: prev.nextRunSecondsLeft - 1
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.isRunning, state.isGenerating, executeLearningCycle]);

  const toggleService = () => {
    setState(prev => {
      const willRun = !prev.isRunning;
      if (willRun) {
        addLog('TechnovisAzeService', 'I', 'ACTION_START: Foreground Service activated by user. Acquiring WAKE_LOCK.');
        const delay = prev.intervalMode === 'demo' ? 6 : prev.configuredIntervalMinutes * 60;
        return {
          ...prev,
          isRunning: true,
          isWakeLockHeld: true,
          statusMessage: `Foreground Service active. Autonomous loop running on ${prev.currentGame}.`,
          nextRunSecondsLeft: delay
        };
      } else {
        addLog('TechnovisAzeService', 'I', 'ACTION_STOP: Foreground Service stopped by user. WAKE_LOCK released.');
        return {
          ...prev,
          isRunning: false,
          isWakeLockHeld: false,
          isGenerating: false,
          statusMessage: 'Foreground Service stopped.'
        };
      }
    });
  };

  const forceImmediateCycle = () => {
    if (!state.isRunning) {
      setState(prev => ({ ...prev, isRunning: true }));
    }
    executeLearningCycle();
  };

  const setIntervalMode = (mode: 'demo' | 'prod') => {
    setState(prev => {
      const seconds = mode === 'demo' ? 12 : prev.configuredIntervalMinutes * 60;
      addLog('TechnovisAzeService', 'I', `Loop interval mode changed to ${mode === 'demo' ? '12s (Fast Demo)' : `${prev.configuredIntervalMinutes} minutes (Production SharedPreferences)`}`);
      return {
        ...prev,
        intervalMode: mode,
        nextRunSecondsLeft: Math.min(prev.nextRunSecondsLeft, seconds)
      };
    });
  };

  const clearMemories = () => {
    setMemories([]);
    try {
      localStorage.removeItem('technovisaze_bot_memories');
    } catch {}
    addLog('TechnovisAzeApp', 'W', 'Room DB purged: BotMemoryDao.clearAllMemories() invoked');
  };

  return {
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
  };
}
