import { useState } from 'react';
import type { GameState } from '../game/types';
import { submitScore } from '../services/api';

// ═══════════════════════════════════════════════════════════
// GameOverScreen — Final screen with score summary.
// Shows stats, submits score, and offers replay.
// ═══════════════════════════════════════════════════════════

interface GameOverScreenProps {
  finalState: GameState;
  nickname: string;
  onRestart: () => void;
  onExit: () => void;
  onOpenLeaderboard: (score: number) => void;
}

export function GameOverScreen({ finalState, nickname, onRestart, onExit, onOpenLeaderboard }: GameOverScreenProps) {
  const { score, level, wordsCompleted, correctLetters, totalLetters } = finalState;
  const [submitted, setSubmitted] = useState(false);
  const [rank, setRank] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitScore = async () => {
    if (submitted || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await submitScore({
        nickname,
        score,
        level,
        wordsCompleted,
        correctLetters,
        totalLetters,
        timestamp: new Date().toISOString(),
      });

      if (response.success) {
        setSubmitted(true);
        setRank(response.rank ?? null);
      }
    } catch {
      // Service handles errors gracefully
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[color:var(--color-bg-primary)] scanlines overflow-hidden">
      {/* ── Background flash effect ── */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          background: `radial-gradient(circle at center, var(--color-neon-red) 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 px-4">
        {/* Game Over Title */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl md:text-6xl font-black font-[family-name:var(--font-display)] text-[color:var(--color-neon-red)] glow-red tracking-wider animate-flicker">
            GAME OVER
          </h1>
          <div className="text-sm font-mono text-[color:var(--color-text-muted)] tracking-widest">
            SYSTEM CRASH
          </div>
        </div>

        {/* Stats Card */}
        <div className="w-72 bg-[color:var(--color-bg-card)] border border-[color:var(--color-neon-red)]/20 rounded-lg p-6 flex flex-col gap-4">
          {/* Player */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono uppercase tracking-widest text-[color:var(--color-text-muted)]">
              Player
            </span>
            <span className="text-sm font-mono font-bold text-[color:var(--color-neon-cyan)]">
              {nickname}
            </span>
          </div>

          <div className="h-px bg-[color:var(--color-neon-red)]/20" />

          {/* Score */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono uppercase tracking-widest text-[color:var(--color-text-muted)]">
              Score
            </span>
            <span className="text-2xl font-mono font-black text-[color:var(--color-neon-yellow)] glow-cyan tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>

          {/* Level */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono uppercase tracking-widest text-[color:var(--color-text-muted)]">
              Level
            </span>
            <span className="text-lg font-mono font-bold text-[color:var(--color-neon-purple)]">
              {level}
            </span>
          </div>

          {/* Words */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono uppercase tracking-widest text-[color:var(--color-text-muted)]">
              Words Cleared
            </span>
            <span className="text-lg font-mono font-bold text-[color:var(--color-neon-green)]">
              {wordsCompleted}
            </span>
          </div>

          {/* Accuracy */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono uppercase tracking-widest text-[color:var(--color-text-muted)]">
              Accuracy
            </span>
            <span className="text-lg font-mono font-bold text-[color:var(--color-neon-yellow)]">
              {totalLetters > 0
                ? `${Math.round((correctLetters / totalLetters) * 100)}%`
                : '—'}
              <span className="text-xs text-[color:var(--color-text-muted)] ml-2">
                {correctLetters}/{totalLetters}
              </span>
            </span>
          </div>

          {/* Rank (if submitted) */}
          {submitted && rank !== null && (
            <>
              <div className="h-px bg-[color:var(--color-neon-cyan)]/20" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono uppercase tracking-widest text-[color:var(--color-text-muted)]">
                  Global Rank
                </span>
                <span className="text-lg font-mono font-bold text-[color:var(--color-neon-pink)] glow-pink">
                  #{rank}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-2">
          {!submitted && (
            <button
              onClick={handleSubmitScore}
              disabled={isSubmitting}
              className="px-6 py-2.5 font-mono font-bold text-sm uppercase tracking-widest rounded border-2 transition-all duration-200
                border-[color:var(--color-neon-purple)] text-[color:var(--color-neon-purple)]
                hover:bg-[color:var(--color-neon-purple)] hover:text-[color:var(--color-bg-primary)]
                hover:shadow-[0_0_20px_rgba(176,38,255,0.5)]
                disabled:opacity-30"
            >
              {isSubmitting ? 'UPLOADING...' : '▸ SUBMIT SCORE'}
            </button>
          )}

          <button
            onClick={onRestart}
            className="px-6 py-2.5 font-mono font-bold text-sm uppercase tracking-widest rounded border-2 transition-all duration-200
              border-[color:var(--color-neon-cyan)] text-[color:var(--color-neon-cyan)]
              hover:bg-[color:var(--color-neon-cyan)] hover:text-[color:var(--color-bg-primary)]
              hover:shadow-[0_0_20px_rgba(0,240,255,0.5)]"
          >
            🔄 RETRY
          </button>

          <button
            onClick={onExit}
            className="px-6 py-2.5 font-mono font-bold text-sm uppercase tracking-widest rounded border-2 transition-all duration-200
              border-[color:var(--color-neon-red)]/40 text-[color:var(--color-neon-red)]
              hover:bg-[color:var(--color-neon-red)] hover:text-[color:var(--color-bg-primary)]
              hover:shadow-[0_0_20px_rgba(255,46,76,0.4)]"
          >
            🚪 EXIT
          </button>

          <button
            onClick={() => onOpenLeaderboard(score)}
            className="px-6 py-2 font-mono font-bold text-xs uppercase tracking-widest rounded border transition-all duration-200
              border-[color:var(--color-neon-purple)]/40 text-[color:var(--color-neon-purple)]
              hover:bg-[color:var(--color-neon-purple)] hover:text-[color:var(--color-bg-primary)]
              hover:shadow-[0_0_15px_rgba(176,38,255,0.4)]"
          >
            🏆 LEADERBOARD
          </button>
        </div>
      </div>
    </div>
  );
}
