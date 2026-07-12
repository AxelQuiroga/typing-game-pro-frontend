import type { GameConfig } from './types';

// ═══════════════════════════════════════════════════════════
// Game tuning constants — adjust these to change game feel.
// All magic numbers live HERE, never in components.
// ═══════════════════════════════════════════════════════════

export const GAME_CONFIG: GameConfig = {
  canvasWidth: 800,
  canvasHeight: 600,
  maxLives: 3,
  baseFallSpeed: 0.6,
  speedIncrement: 0.12,
  wordsPerLevel: 8,
  minSpawnInterval: 800,
  maxSpawnInterval: 2200,
  fontSize: 20,
  wordPadding: 16,
} as const;

/** Points earned per word completion */
export const SCORE_PER_WORD = 100;

/** Combo multiplier thresholds */
export const COMBO_MULTIPLIERS = [
  { threshold: 5, multiplier: 1.5 },
  { threshold: 10, multiplier: 2.0 },
  { threshold: 20, multiplier: 3.0 },
] as const;

/** Programming-themed word bank, grouped by difficulty */
export const WORD_BANK: Record<'easy' | 'medium' | 'hard', readonly string[]> = {
  easy: [
    'var', 'let', 'if', 'for', 'map', 'css', 'dom', 'git',
    'npm', 'api', 'sql', 'new', 'try', 'int', 'bool', 'null',
    'void', 'this', 'self', 'enum', 'case', 'true', 'else',
  ],
  medium: [
    'async', 'await', 'fetch', 'class', 'react', 'const', 'return',
    'import', 'export', 'switch', 'while', 'break', 'Promise',
    'Record', 'Partial', 'module', 'export', 'typeof', 'keyof',
    'prisma', 'express', 'socket', 'deploy', 'docker', 'lambda',
  ],
  hard: [
    'interface', 'function', 'abstract', 'override', 'readonly',
    'typecast', 'callback', 'iterator', 'generator', 'decorator',
    'middleware', 'pagination', 'resilient', 'throttling', 'debugging',
    'refactoring', 'polymorphic', 'inheritance', 'typescript', 'webpack',
  ],
} as const;

/** Difficulty tier thresholds based on level */
export const DIFFICULTY_TIERS = {
  /** Levels 1-3: only easy words */
  easy: { minLevel: 1, maxLevel: 3 },
  /** Levels 4-6: easy + medium words */
  medium: { minLevel: 4, maxLevel: 6 },
  /** Levels 7+: easy + medium + hard words */
  hard: { minLevel: 7, maxLevel: Infinity },
} as const;

/** Color palette for the canvas rendering */
export const COLORS = {
  bgPrimary: '#0a0a0f',
  bgSecondary: '#12121a',
  neonCyan: '#00f0ff',
  neonPink: '#ff00aa',
  neonPurple: '#b026ff',
  neonGreen: '#39ff14',
  neonYellow: '#faff00',
  neonRed: '#ff2e4c',
  textMuted: '#6b7280',
  gridLine: 'rgba(0, 240, 255, 0.04)',
} as const;
