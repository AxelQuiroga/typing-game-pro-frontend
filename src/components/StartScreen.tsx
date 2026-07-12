import { useState } from 'react';

// ═══════════════════════════════════════════════════════════
// StartScreen — Landing screen with nickname input.
// Cyberpunk aesthetic: neon glow, scanlines, flickering.
// ═══════════════════════════════════════════════════════════

interface StartScreenProps {
  onStart: (nickname: string) => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [nickname, setNickname] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (trimmed.length >= 2) {
      onStart(trimmed);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[color:var(--color-bg-primary)] scanlines overflow-hidden">
      {/* ── Background ambient grid ── */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,240,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,240,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Title */}
        <div className="flex flex-col items-center gap-2">
          <h1
            className="text-5xl md:text-7xl font-black font-[family-name:var(--font-display)] text-[color:var(--color-neon-cyan)] glow-cyan tracking-wider animate-flicker"
          >
            CODE
          </h1>
          <h1
            className="text-4xl md:text-6xl font-black font-[family-name:var(--font-display)] text-[color:var(--color-neon-pink)] glow-pink tracking-wider"
          >
            TYPIST
          </h1>
          <div className="text-sm font-mono text-[color:var(--color-neon-purple)] tracking-[0.5em] mt-2">
            ▸ ARCADE ◂
          </div>
        </div>

        {/* Description */}
        <p className="text-sm font-mono text-[color:var(--color-text-muted)] max-w-md text-center leading-relaxed">
          Words fall from above. Type them before they reach the bottom.
          <br />
          <span className="text-[color:var(--color-neon-green)]">Build combos.</span>{' '}
          <span className="text-[color:var(--color-neon-yellow)]">Level up.</span>{' '}
          <span className="text-[color:var(--color-neon-red)]">Don't crash.</span>
        </p>

        {/* How to play */}
        <div className="flex gap-6 text-xs font-mono text-[color:var(--color-text-muted)]">
          <div className="flex flex-col items-center gap-1">
            <kbd className="px-2 py-1 border border-[color:var(--color-neon-cyan)]/30 rounded bg-[color:var(--color-bg-card)] text-[color:var(--color-neon-cyan)]">
              A-Z
            </kbd>
            <span>Type letters</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <kbd className="px-2 py-1 border border-[color:var(--color-neon-green)]/30 rounded bg-[color:var(--color-bg-card)] text-[color:var(--color-neon-green)]">
              ★
            </kbd>
            <span>Build combo</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <kbd className="px-2 py-1 border border-[color:var(--color-neon-red)]/30 rounded bg-[color:var(--color-bg-card)] text-[color:var(--color-neon-red)]">
              ✕
            </kbd>
            <span>3 lives</span>
          </div>
        </div>

        {/* Nickname form */}
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 mt-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono uppercase tracking-widest text-[color:var(--color-text-muted)]">
              Enter your handle
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="h4x0r_42"
              maxLength={20}
              autoFocus
              className="w-64 px-4 py-3 text-center font-mono text-lg bg-[color:var(--color-bg-card)] border border-[color:var(--color-neon-cyan)]/30 rounded text-[color:var(--color-neon-cyan)] placeholder:text-[color:var(--color-text-muted)]/40 focus:outline-none focus:border-[color:var(--color-neon-cyan)] focus:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={nickname.trim().length < 2}
            className="px-8 py-3 font-mono font-bold text-sm uppercase tracking-widest rounded border-2 transition-all duration-200
              border-[color:var(--color-neon-cyan)] text-[color:var(--color-neon-cyan)]
              hover:bg-[color:var(--color-neon-cyan)] hover:text-[color:var(--color-bg-primary)]
              hover:shadow-[0_0_20px_rgba(0,240,255,0.5)]
              disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[color:var(--color-neon-cyan)] disabled:hover:shadow-none"
          >
            ▸ START GAME
          </button>
        </form>

        {/* Footer hint */}
        <div className="text-[10px] font-mono text-[color:var(--color-text-muted)]/40 mt-8">
          PHASE 1 // FRONTEND MODULAR
        </div>
      </div>
    </div>
  );
}
