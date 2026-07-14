import type { FallingWord } from './types';
import type { MutableRefObject } from 'react';
import { WORD_BANK, DIFFICULTY_TIERS } from './constants';

// ═══════════════════════════════════════════════════════════
// Word Pool Manager
// Selects words based on current difficulty level,
// ensures no immediate repeats.
//
// State (lastWord) is owned by the game engine hook via ref.
// This module is pure — no module-level mutable state.
// ═══════════════════════════════════════════════════════════

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
 * Uses the engine's lastWordRef for repeat prevention.
 */
export function pickWord(level: number, lastWordRef: MutableRefObject<string>): string {
  const pool = getWordPool(level);
  let word: string;

  do {
    word = pool[Math.floor(Math.random() * pool.length)]!;
  } while (word.toLowerCase() === lastWordRef.current && pool.length > 1);

  lastWordRef.current = word.toLowerCase();
  return lastWordRef.current;
}

/**
 * Create a new FallingWord entity with random X position.
 */
export function createFallingWord(
  level: number,
  canvasWidth: number,
  fontSize: number,
  lastWordRef: MutableRefObject<string>,
): FallingWord {
  const text = pickWord(level, lastWordRef);
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
