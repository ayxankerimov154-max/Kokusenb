export interface BotMemory {
  id: number;
  gameName: string;
  gameVersion: string;
  strategyCategory: string;
  insightContent: string;
  keyTakeaways: string[];
  confidenceScore: number;
  cycleIteration: number;
  executionDurationMs: number;
  timestamp: number;
  timestampLearned: number;
  isAiGenerated?: boolean;
  modelVersion?: string;
}

export type QueueGame = 'PUBG Mobile' | 'Roblox' | 'Minecraft';

export interface SimulatorState {
  isRunning: boolean;
  currentGame: QueueGame;
  queueIndex: number;
  cycleIteration: number;
  isWakeLockHeld: boolean;
  statusMessage: string;
  lastRunTimestamp: number | null;
  nextRunSecondsLeft: number;
  intervalMode: 'demo' | 'prod'; // 'demo' = fast, 'prod' = user minutes
  configuredIntervalMinutes: number; // User SharedPreferences configured interval
  isGenerating: boolean;
  batteryOptimized: boolean;
  totalInsightsGenerated: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  tag: string;
  level: 'D' | 'I' | 'W' | 'E';
  message: string;
}
