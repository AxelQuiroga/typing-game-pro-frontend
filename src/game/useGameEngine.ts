import { useRef, useCallback, useEffect } from 'react';
import type { FallingWord, GameState } from './types';
import { GAME_CONFIG, SCORE_PER_WORD, COMBO_MULTIPLIERS } from './constants';
import { createFallingWord } from './wordPool';

// ═══════════════════════════════════════════════════════════
// useGameEngine — Core Game Loop & Physics
//
// Responsibilities:
// - Spawn words at intervals based on level
// - Move words downward each frame
// - Detect collisions (words reaching bottom)
// - Handle keyboard input for word completion
// - Track score, lives, combo, and level progression
//
// This hook owns the mutable game state in refs (not useState)
// to avoid re-render overhead at 60fps.
// ═══════════════════════════════════════════════════════════

export interface GameEngineCallbacks {
  onStateChange: (state: GameState) => void;
  onWordsChange: (words: FallingWord[]) => void;
  onGameOver: (finalState: GameState) => void;
}

export function useGameEngine(callbacks: GameEngineCallbacks) {
  // ── Mutable game state (refs for 60fps performance) ──
  const wordsRef = useRef<FallingWord[]>([]);
  const scoreRef = useRef(0);
  const livesRef = useRef(GAME_CONFIG.maxLives);
  const levelRef = useRef(1);
  const comboRef = useRef(0);
  const wordsCompletedRef = useRef(0);
  const gameLoopRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);
  const isRunningRef = useRef(false);
  const isPausedRef = useRef(false);
  const lastWordRef = useRef('');
  const correctLettersRef = useRef(0);
  const totalLettersRef = useRef(0);

  // ── Derived: speed multiplier ──
  const getSpeedMultiplier = useCallback(() => {
    return 1 + (levelRef.current - 1) * GAME_CONFIG.speedIncrement;
  }, []);

  // ── Derived: spawn interval (decreases with level) ──
  const getSpawnInterval = useCallback(() => {
    const progress = Math.min(levelRef.current / 10, 1);
    return (
      GAME_CONFIG.maxSpawnInterval -
      progress * (GAME_CONFIG.maxSpawnInterval - GAME_CONFIG.minSpawnInterval)
    );
  }, []);

  // ── Emit current state snapshot to consumer ──
  const emitState = useCallback(() => {
    callbacks.onStateChange({
      score: scoreRef.current,
      lives: livesRef.current,
      level: levelRef.current,
      combo: comboRef.current,
      wordsCompleted: wordsCompletedRef.current,
      speedMultiplier: getSpeedMultiplier(),
      correctLetters: correctLettersRef.current,
      totalLetters: totalLettersRef.current,
    });
    callbacks.onWordsChange([...wordsRef.current]);
  }, [callbacks, getSpeedMultiplier]);

  // ── Game Over handler ──
  const triggerGameOver = useCallback(() => {
    isRunningRef.current = false;
    cancelAnimationFrame(gameLoopRef.current);
    callbacks.onGameOver({
      score: scoreRef.current,
      lives: livesRef.current,
      level: levelRef.current,
      combo: comboRef.current,
      wordsCompleted: wordsCompletedRef.current,
      speedMultiplier: getSpeedMultiplier(),
      correctLetters: correctLettersRef.current,
      totalLetters: totalLettersRef.current,
    });
  }, [callbacks, getSpeedMultiplier]);

  // ── Main Game Loop ──
  const gameLoop = useCallback(
    (timestamp: number) => {
      if (!isRunningRef.current) return;

      // ── Pause: skip physics but keep the loop alive ──
      if (isPausedRef.current) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const config = GAME_CONFIG;
      const multiplier = getSpeedMultiplier();

      // ── Spawn new words ──
      const spawnInterval = getSpawnInterval();
      if (timestamp - lastSpawnRef.current > spawnInterval) {
        const newWord = createFallingWord(
          levelRef.current,
          config.canvasWidth,
          config.fontSize,
          lastWordRef,
        );
        newWord.speed = config.baseFallSpeed * multiplier;
        wordsRef.current.push(newWord);
        lastSpawnRef.current = timestamp;
      }

      // ── Move words & detect collisions ──
      const bottomLine = config.canvasHeight - 10;
      const wordsToRemove: string[] = [];

      for (const word of wordsRef.current) {
        word.y += word.speed;

        if (word.y >= bottomLine) {
          wordsToRemove.push(word.id);

          // Only lose life if word wasn't actively being typed
          if (!word.isActive) {
            livesRef.current = Math.max(0, livesRef.current - 1);
            comboRef.current = 0;

            if (livesRef.current <= 0) {
              triggerGameOver();
              return;
            }
          } else {
            // Active word fell — lose it and reset combo
            comboRef.current = 0;
          }
        }
      }

      // ── Remove words that hit the bottom ──
      if (wordsToRemove.length > 0) {
        wordsRef.current = wordsRef.current.filter(
          (w) => !wordsToRemove.includes(w.id),
        );
      }

      emitState();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    },
    [emitState, triggerGameOver, getSpeedMultiplier, getSpawnInterval],
  );

  // ── Complete a word: score, combo, level progression ──
  const completeWord = useCallback(
    (word: FallingWord) => {
      // Calculate combo multiplier
      comboRef.current += 1;
      let comboMultiplier = 1;
      for (const tier of COMBO_MULTIPLIERS) {
        if (comboRef.current >= tier.threshold) {
          comboMultiplier = tier.multiplier;
        }
      }

      // Score = base points * combo multiplier * level bonus
      const levelBonus = 1 + (levelRef.current - 1) * 0.1;
      const points = Math.round(
        SCORE_PER_WORD * comboMultiplier * levelBonus,
      );
      scoreRef.current += points;

      // Track completion for level progression
      wordsCompletedRef.current += 1;

      // Level up every N words
      const wordsForNextLevel = GAME_CONFIG.wordsPerLevel;
      if (wordsCompletedRef.current % wordsForNextLevel === 0) {
        levelRef.current += 1;
      }

      // Remove the word from the field
      wordsRef.current = wordsRef.current.filter((w) => w.id !== word.id);
    },
    [],
  );

  // ── Keyboard Input Handler ──
  const handleKeyPress = useCallback(
    (key: string) => {
      if (!isRunningRef.current) return;

      const words = wordsRef.current;

      // Find the currently active word, or the first word matching the key
      let target = words.find((w) => w.isActive);

      if (!target) {
        // Find a word that starts with the typed key
        target = words.find(
          (w) =>
            w.status === 'idle' &&
            w.text[0] === key &&
            w.y > 0, // Only words that have entered the field
        );

        if (target) {
          // Correct letter — starting a new word
          totalLettersRef.current += 1;
          correctLettersRef.current += 1;

          target.isActive = true;
          target.status = 'active';
          target.typedIndex = 1;

          // Check if single-char word was completed
          if (target.typedIndex >= target.text.length) {
            completeWord(target);
          }
          emitState();
          return;
        }
        return;
      }

      // Continue typing the active word
      const expectedChar = target.text[target.typedIndex];
      if (key === expectedChar) {
        // Correct letter
        totalLettersRef.current += 1;
        correctLettersRef.current += 1;

        target.typedIndex++;

        // Word completed!
        if (target.typedIndex >= target.text.length) {
          completeWord(target);
        }
      } else {
        // Wrong letter
        totalLettersRef.current += 1;

        // Wrong key — deactivate and break combo
        target.isActive = false;
        target.status = 'idle';
        target.typedIndex = 0;
        comboRef.current = 0;
      }

      emitState();
    },
    [emitState, completeWord],
  );

  // ── Start the game ──
  const startGame = useCallback(() => {
    // Reset all state
    wordsRef.current = [];
    scoreRef.current = 0;
    livesRef.current = GAME_CONFIG.maxLives;
    levelRef.current = 1;
    comboRef.current = 0;
    wordsCompletedRef.current = 0;
    correctLettersRef.current = 0;
    totalLettersRef.current = 0;
    lastSpawnRef.current = 0;
    isRunningRef.current = true;
    isPausedRef.current = false;
    lastWordRef.current = '';

    emitState();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop, emitState]);

  // ── Toggle pause (Space or Escape) ──
  const togglePause = useCallback(() => {
    if (!isRunningRef.current) return;
    isPausedRef.current = !isPausedRef.current;
    callbacks.onStateChange({
      score: scoreRef.current,
      lives: livesRef.current,
      level: levelRef.current,
      combo: comboRef.current,
      wordsCompleted: wordsCompletedRef.current,
      speedMultiplier: getSpeedMultiplier(),
      correctLetters: correctLettersRef.current,
      totalLetters: totalLettersRef.current,
    });
  }, [callbacks, getSpeedMultiplier]);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

  return {
    startGame,
    handleKeyPress,
    togglePause,
    isPausedRef,
    /** Access words for external rendering */
    getWords: () => wordsRef.current,
  };
}
