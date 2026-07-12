import type { GameState } from '../game/types';

// ═══════════════════════════════════════════════════════════
// GameHUD — Heads-Up Display overlay.
// Shows score, lives, level, combo, and current input target.
//
// Positioned absolutely over the canvas for zero-layout-shift.
// ═══════════════════════════════════════════════════════════

interface GameHUDProps {
  state: GameState;
  activeWordText: string | null;
  typedProgress: string;
}

export function GameHUD({ state, activeWordText, typedProgress }: GameHUDProps) {
  const { score, lives, level, combo } = state;

  return (
    <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4 pointer-events-none">
      {/* ── Left: Score & Level ── */}
      <div className="flex flex-col gap-1">
        <div className="text-sm text-[color:var(--color-text-muted)] font-mono uppercase tracking-widest">
          Score
        </div>
        <div
          className="text-3xl font-bold font-[family-name:var(--font-display)] text-[color:var(--color-neon-cyan)] glow-cyan tabular-nums"
          key={score} // Force re-render on score change for flash effect
        >
          {score.toLocaleString()}
        </div>
        <div className="text-xs text-[color:var(--color-neon-purple)] font-mono mt-1">
          LVL {level}
        </div>
      </div>

      {/* ── Center: Active word indicator ── */}
      {activeWordText && (
        <div className="flex flex-col items-center gap-1 mt-2">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
            typing
          </div>
          <div className="text-xl font-mono font-bold tracking-wider">
            {activeWordText.split('').map((char, i) => (
              <span
                key={`${char}-${i}`}
                className={
                  i < typedProgress.length
                    ? 'text-[color:var(--color-neon-green)] glow-green'
                    : i === typedProgress.length
                      ? 'text-[color:var(--color-neon-yellow)] animate-pulse-glow'
                      : 'text-[color:var(--color-text-muted)]'
                }
              >
                {char}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Right: Lives & Combo ── */}
      <div className="flex flex-col items-end gap-1">
        <div className="text-sm text-[color:var(--color-text-muted)] font-mono uppercase tracking-widest">
          Lives
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i < lives
                  ? 'bg-[color:var(--color-neon-red)] glow-red scale-100'
                  : 'bg-[color:var(--color-bg-card)] scale-75 opacity-30'
              }`}
            />
          ))}
        </div>
        {combo > 1 && (
          <div className="text-sm font-bold font-mono text-[color:var(--color-neon-pink)] glow-pink mt-1 animate-pulse-glow">
            {combo}x COMBO
          </div>
        )}
      </div>
    </div>
  );
}
