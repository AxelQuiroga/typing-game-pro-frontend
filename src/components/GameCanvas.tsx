import { useRef, useEffect } from 'react';
import type { FallingWord } from '../game/types';
import { GAME_CONFIG, COLORS } from '../game/constants';

// ═══════════════════════════════════════════════════════════
// GameCanvas — HTML5 Canvas renderer for falling words.
//
// Design decisions:
// - Uses a <canvas> element for 60fps performance
// - Reads words from a ref (not state) to avoid re-render overhead
// - Draws cyberpunk-styled words with neon glow effects
// ═══════════════════════════════════════════════════════════

interface GameCanvasProps {
  wordsRef: React.RefObject<FallingWord[]>;
  renderTrigger: number; // Incremented each frame to force canvas redraw
}

export function GameCanvas({ wordsRef, renderTrigger }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { canvasWidth: w, canvasHeight: h, fontSize } = GAME_CONFIG;

    // ── HiDPI scaling ──
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // ── Clear canvas ──
    ctx.clearRect(0, 0, w, h);

    // ── Draw background grid ──
    ctx.strokeStyle = COLORS.gridLine;
    ctx.lineWidth = 0.5;
    const gridSize = 40;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // ── Draw "danger zone" line at bottom ──
    const dangerY = h - 10;
    ctx.strokeStyle = COLORS.neonRed;
    ctx.lineWidth = 2;
    ctx.shadowColor = COLORS.neonRed;
    ctx.shadowBlur = 8;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    ctx.moveTo(0, dangerY);
    ctx.lineTo(w, dangerY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // ── Draw each falling word ──
    ctx.font = `600 ${fontSize}px 'Fira Code', monospace`;
    ctx.textBaseline = 'top';

    const words = wordsRef.current;

    for (const word of words) {
      const { text, x, y, typedIndex, status } = word;

      // Determine colors based on state
      let typedColor: string = COLORS.neonGreen;
      let untypedColor: string = COLORS.neonCyan;
      let glowColor: string = COLORS.neonCyan;

      if (status === 'active') {
        untypedColor = '#ffffff';
        glowColor = COLORS.neonYellow;
      }

      // ── Draw typed characters (completed portion) ──
      if (typedIndex > 0) {
        const typedText = text.slice(0, typedIndex);
        ctx.fillStyle = typedColor;
        ctx.shadowColor = typedColor;
        ctx.shadowBlur = 10;
        ctx.fillText(typedText, x, y);
        const typedWidth = ctx.measureText(typedText).width;

        // ── Draw untyped characters ──
        const untypedText = text.slice(typedIndex);
        ctx.fillStyle = untypedColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = status === 'active' ? 15 : 6;
        ctx.fillText(untypedText, x + typedWidth, y);
      } else {
        // ── Draw full word (not yet targeted) ──
        ctx.fillStyle = untypedColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 6;
        ctx.fillText(text, x, y);
      }

      ctx.shadowBlur = 0;
    }

    // ── Draw bottom label ──
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = `400 11px 'Fira Code', monospace`;
    ctx.textAlign = 'right';
    ctx.fillText('▸ DANGER ZONE', w - 8, dangerY + 14);
    ctx.textAlign = 'left';
  }, [wordsRef, renderTrigger]);

  return (
    <canvas
      ref={canvasRef}
      className="rounded-lg border border-[color:var(--color-neon-cyan)]/20 box-glow-cyan"
      style={{
        width: GAME_CONFIG.canvasWidth,
        height: GAME_CONFIG.canvasHeight,
        background: `linear-gradient(180deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 100%)`,
      }}
    />
  );
}
