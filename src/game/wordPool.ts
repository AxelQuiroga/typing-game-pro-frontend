import type { FallingWord } from './types';
import { WORD_BANK, DIFFICULTY_TIERS } from './constants';

// ═══════════════════════════════════════════════════════════
// Word Pool Manager
// Selects words based on current difficulty level,
// ensures no immediate repeats.
// ═══════════════════════════════════════════════════════════

let lastWord = '';

/**
 * Get the available word pool based on the current game level.
 * Higher levels unlock harder words.
 */
function getWordPool(level: number): readonly string[] {
  const pool: string[] = [...WORD_BANK.easy];

  const { minLevel: medMin, maxLevel: medMax } = DIFFICULTY_TIERS.medium;
  if (level >= medMin && level <= medMax) {
    pool.push(...WORD_BANK.medium);
  }

  if (level >= DIFFICULTY_TIERS.hard.minLevel) {
    pool.push(...WORD_BANK.hard);
  }

  return pool;
}

/**
 * Pick a random word from the pool, avoiding immediate repeats.
 */
export function pickWord(level: number): string {
  const pool = getWordPool(level);
  let word: string;

  do {
    word = pool[Math.floor(Math.random() * pool.length)];
  } while (word === lastWord && pool.length > 1);

  lastWord = word;
  return word;
}

/**
 * Create a new FallingWord entity with random X position.
 */
export function createFallingWord(
  level: number,
  canvasWidth: number,
  fontSize: number,
): FallingWord {
  const text = pickWord(level);
  const textWidth = text.length * (fontSize * 0.6);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
    x: Math.random() * (canvasWidth - textWidth - 20) + 10,
    y: -fontSize,
    speed: 0,
    typedIndex: 0,
    isActive: false,
    status: 'idle',
  };
}
