// ═══════════════════════════════════════════════════════════
// Code Typist Arcade — Core Type Definitions
// Strict TypeScript, no `any`, no compromises.
// ═══════════════════════════════════════════════════════════

/** Represents a single falling word instance in the game field */
export interface FallingWord {
  readonly id: string;
  readonly text: string;
  x: number;
  y: number;
  speed: number;
  /** How many characters the player has typed correctly so far */
  typedIndex: number;
  /** Whether this word is currently being typed (active target) */
  isActive: boolean;
  /** Visual state for rendering */
  status: 'idle' | 'active' | 'typed' | 'missed';
}

/** The game phases */
export type GamePhase = 'start' | 'playing' | 'paused' | 'gameover' | 'leaderboard';

/** Immutable snapshot of game state for HUD rendering */
export interface GameState {
  score: number;
  lives: number;
  level: number;
  combo: number;
  wordsCompleted: number;
  /** Current speed multiplier (increases with level) */
  speedMultiplier: number;
  /** Letters typed correctly */
  correctLetters: number;
  /** Total letters attempted */
  totalLetters: number;
}

/** Configuration constants that tune the game feel */
export interface GameConfig {
  readonly canvasWidth: number;
  readonly canvasHeight: number;
  readonly maxLives: number;
  readonly baseFallSpeed: number;
  readonly speedIncrement: number;
  readonly wordsPerLevel: number;
  /** Min spawn interval in ms */
  readonly minSpawnInterval: number;
  /** Max spawn interval in ms */
  readonly maxSpawnInterval: number;
  /** Font size for word rendering */
  readonly fontSize: number;
  /** Padding around word bounding box */
  readonly wordPadding: number;
}

/** Score submission payload for the backend API */
export interface ScorePayload {
  nickname: string;
  score: number;
  level: number;
  wordsCompleted: number;
  correctLetters: number;
  totalLetters: number;
  /** ISO timestamp */
  timestamp: string;
}

/** Score response from the backend API */
export interface ScoreResponse {
  success: boolean;
  rank?: number;
  message: string;
}

/** A single leaderboard entry from the API */
export interface LeaderboardEntry {
  id: number;
  nickname: string;
  score: number;
  level: number;
  wordsCompleted: number;
  correctLetters: number;
  totalLetters: number;
  accuracy: number;
  rank: number;
  createdAt: string;
}
