import { useState, useCallback, useEffect, useRef } from 'react';
import type { FallingWord, GamePhase, GameState } from './game/types';
import { useGameEngine } from './game/useGameEngine';

import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';

// ═══════════════════════════════════════════════════════════
// App.tsx — Game Phase Orchestrator
//
// Single responsibility: manage transitions between
// start → playing → gameover, and wire the engine to UI.
// ═══════════════════════════════════════════════════════════

function App() {
  const [phase, setPhase] = useState<GamePhase>('start');
  const [nickname, setNickname] = useState('');
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    level: 1,
    combo: 0,
    wordsCompleted: 0,
    speedMultiplier: 1,
    correctLetters: 0,
    totalLetters: 0,
  });
  const [words, setWords] = useState<FallingWord[]>([]);
  const [renderTick, setRenderTick] = useState(0);

  // Ref to access current words from the canvas render loop
  const wordsRef = useRef<FallingWord[]>([]);
  // Sync ref with state so the canvas render loop always reads fresh data
  wordsRef.current = words;

  // ── Game Engine ──
  const { startGame, handleKeyPress, togglePause } = useGameEngine({
    onStateChange: setGameState,
    onWordsChange: (newWords) => {
      wordsRef.current = newWords;
      setWords(newWords);
      setRenderTick((t) => t + 1);
    },
    onGameOver: (finalState) => {
      setGameState(finalState);
      setPhase('gameover');
    },
  });

  // ── Keyboard listener (only during gameplay) ──
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'paused') return;

    const onKeyDown = (e: KeyboardEvent) => {
      // Escape toggles pause
      if (e.key === 'Escape') {
        e.preventDefault();
        togglePause();
        setPhase((prev) => (prev === 'playing' ? 'paused' : 'playing'));
        return;
      }

      // Ignore input during pause
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length !== 1) return;

      e.preventDefault();
      handleKeyPress(e.key.toLowerCase());
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, handleKeyPress, togglePause]);

  // ── Handlers ──
  const handleStart = useCallback(
    (name: string) => {
      setNickname(name);
      setPhase('playing');
      // Small delay so React can render the game container before engine starts
      requestAnimationFrame(() => {
        startGame();
      });
    },
    [startGame],
  );

  const handleRestart = useCallback(() => {
    setPhase('playing');
    requestAnimationFrame(() => {
      startGame();
    });
  }, [startGame]);

  // ── Compute active word for HUD display ──
  const activeWord = words.find((w) => w.isActive);
  const activeWordText = activeWord?.text ?? null;
  const typedProgress = activeWord
    ? activeWord.text.slice(0, activeWord.typedIndex)
    : '';

  // ── Render ──
  return (
    <div className="w-full h-full bg-[color:var(--color-bg-primary)] flex items-center justify-center">
      {phase === 'start' && <StartScreen onStart={handleStart} />}

      {(phase === 'playing' || phase === 'paused') && (
        <div className="relative select-none">
          <GameCanvas wordsRef={wordsRef} renderTrigger={renderTick} />
          <GameHUD
            state={gameState}
            activeWordText={activeWordText}
            typedProgress={typedProgress}
          />
          {phase === 'paused' && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
              <p className="text-3xl font-bold text-[color:var(--color-neon-cyan)] tracking-widest animate-pulse-glow mb-4">
                PAUSED
              </p>
              <p className="text-sm text-[color:var(--color-text-muted)]">
                Press <kbd className="px-2 py-0.5 bg-[color:var(--color-bg-card)] rounded text-[color:var(--color-neon-yellow)]">ESC</kbd> to resume
              </p>
            </div>
          )}
        </div>
      )}

      {phase === 'gameover' && (
        <GameOverScreen
          finalState={gameState}
          nickname={nickname}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;
