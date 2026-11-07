import { BotMemory, LogEntry } from '../types/simulator';

export const INITIAL_BOT_MEMORIES: BotMemory[] = [
  {
    id: 1,
    gameName: 'PUBG Mobile',
    gameVersion: 'v3.5 - Icemire Frontier',
    strategyCategory: 'Meta Tactics & Loadout',
    insightContent: 'In the latest competitive weapon meta, the M416 with Half Grip and Compensator remains the primary medium-to-long spray anchor (75m–150m). Pair with an AMR or AWM for instant one-shot crate advantage, or a Vector for CQC breach inside urban compounds. In final circles, utilize vehicle high-ground pinning rather than crawling through open grass where snake-prone players get caught by low render distance.',
    keyTakeaways: [
      'M416 + Half Grip provides minimal horizontal recoil for 4x scope bursts',
      'Always reserve 4 smoke grenades for 360-degree cover during phase 5 rotations',
      'Use UAZ or Dacia as hard mobile cover; shoot out tires once parked',
      'Crouch-walk sprinting dampens audio footsteps within a 15-meter radius'
    ],
    confidenceScore: 0.96,
    cycleIteration: 1,
    executionDurationMs: 412,
    modelVersion: 'gemini-3.8-flash',
    isAiGenerated: true,
    timestamp: Date.now() - 3600000 * 2,
    timestampLearned: Date.now() - 3600000 * 2
  },
  {
    id: 2,
    gameName: 'Roblox',
    gameVersion: 'Engine 2026 / Client 620+',
    strategyCategory: 'Physics Engine & Combat Timing',
    insightContent: 'Mastering the Roblox physics engine in PvP environments (BedWars, Blade Ball, combat arenas) centers on client-side replication timing. Maintaining high tick-rate movement by combining "crouch-sliding" or velocity hops with diagonal strafing desynchronizes enemy sword hitboxes. Adjust camera tilt angle to 45 degrees downward for rapid clutching and bridge building.',
    keyTakeaways: [
      'Downward 45° camera angle increases block placement clutching speed by 35%',
      'Use Shift-Lock mode for 1:1 camera aim alignment in sword/projectile duels',
      'Pre-swing attacks 150ms before entering enemy collision bounding box',
      'In economy modes, prioritize forge tier upgrades over personal armor'
    ],
    confidenceScore: 0.94,
    cycleIteration: 1,
    executionDurationMs: 388,
    modelVersion: 'gemini-3.8-flash',
    isAiGenerated: true,
    timestamp: Date.now() - 3600000 * 1.5,
    timestampLearned: Date.now() - 3600000 * 1.5
  },
  {
    id: 3,
    gameName: 'Minecraft',
    gameVersion: '1.21 - Tricky Trials',
    strategyCategory: 'Speedrunning & Nether Navigation',
    insightContent: 'Modern Nether navigation meta centers on rapid bastion routing (Housing or Treasure bastions) for quick obsidian and ender pearl trades via piglin bartering. Utilize F3 pie chart or sound subtitles to pinpoint lava pockets and fortress spawns through chunk borders. Carry a water bucket at all times in the hotbar slot 3 for instant MLG fall-damage negation, and boat-fly over ice paths in the Nether ceiling for 8x speed travel.',
    keyTakeaways: [
      'Water bucket or boat clutch prevents lethal fall damage instantly',
      'Gold helmet prevents Piglin hostility without sacrificing core chestplate protection',
      'F3 + G chunk borders highlight portal alignment coordinates in the 1:8 Nether ratio',
      'Explosive bed mining at Y=14 in the Nether is 4x faster than diamond pickaxe strip mining'
    ],
    confidenceScore: 0.98,
    cycleIteration: 1,
    executionDurationMs: 440,
    modelVersion: 'gemini-3.8-flash',
    isAiGenerated: true,
    timestamp: Date.now() - 3600000 * 1,
    timestampLearned: Date.now() - 3600000 * 1
  }
];

export const INITIAL_LOGS: LogEntry[] = [
  {
    id: 'log-1',
    timestamp: '04:12:01.102',
    tag: 'TechnovisAzeApp',
    level: 'I',
    message: 'TechnovisAze Application starting, initializing Room Database (technovisaze_learning_bot.db)'
  },
  {
    id: 'log-2',
    timestamp: '04:12:01.320',
    tag: 'TechnovisAzeService',
    level: 'I',
    message: 'Foreground Service initialized. Channel: technovisaze_learning_service_channel'
  },
  {
    id: 'log-3',
    timestamp: '04:12:01.345',
    tag: 'TechnovisAzeService',
    level: 'D',
    message: 'PowerManager.PARTIAL_WAKE_LOCK acquired successfully (ref count: 0)'
  },
  {
    id: 'log-4',
    timestamp: '04:12:02.010',
    tag: 'TechnovisAzeGemini',
    level: 'I',
    message: 'Gemini GenerativeModel (gemini-3.8-flash) ready for autonomous cycle sequence'
  }
];
