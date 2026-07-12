import { useState, useCallback, useEffect, useRef } from 'react';
import type { FallingWord, GamePhase, GameState } from './game/types';
import { useGameEngine } from './game/useGameEngine';
import { GAME_CONFIG } from './game/constants';
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
  });
  const [words, setWords] = useState<FallingWord[]>([]);
  const [renderTick, setRenderTick] = useState(0);

  // Ref to access current words from the canvas render loop
  const wordsRef = useRef<FallingWord[]>([]);
  wordsRef.current = words;

  // ── Game Engine ──
  const { startGame, handleKeyPress } = useGameEngine({
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
    if (phase !== 'playing') return;

    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore modifier keys, function keys, etc.
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length !== 1) return;

      e.preventDefault();
      handleKeyPress(e.key.toLowerCase());
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, handleKeyPress]);

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

      {phase === 'playing' && (
        <div className="relative select-none">
          <GameCanvas wordsRef={wordsRef} renderTrigger={renderTick} />
          <GameHUD
            state={gameState}
            activeWordText={activeWordText}
            typedProgress={typedProgress}
          />
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
