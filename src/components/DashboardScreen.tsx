import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';
import type { PlayerStats } from '../services/api';
import { fetchPlayerStats } from '../services/api';

// ═══════════════════════════════════════════════════════════
// DashboardScreen — Player performance dashboard
//
// Shows aggregated stats + score history chart.
// ═══════════════════════════════════════════════════════════

interface DashboardScreenProps {
  nickname: string;
  onBack: () => void;
}

export function DashboardScreen({ nickname, onBack }: DashboardScreenProps) {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setStats(await fetchPlayerStats(nickname));
      setLoading(false);
    })();
  }, [nickname]);

  return (
    <div className="relative w-full h-full flex flex-col items-center bg-[color:var(--color-bg-primary)] scanlines overflow-y-auto">
      <div className="relative z-10 flex flex-col items-center gap-6 pt-8 pb-12 px-4 w-full max-w-2xl">
        {/* ── Header ── */}
        <h1 className="text-3xl md:text-4xl font-black font-[family-name:var(--font-display)] text-[color:var(--color-neon-purple)] glow-pink tracking-wider">
          DASHBOARD
        </h1>
        <p className="text-sm font-mono text-[color:var(--color-text-muted)]">
          Stats for <span className="text-[color:var(--color-neon-cyan)]">{nickname}</span>
        </p>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-sm font-mono text-[color:var(--color-text-muted)] animate-pulse-glow">
              LOADING...
            </p>
          </div>
        ) : !stats ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <p className="text-sm font-mono text-[color:var(--color-text-muted)]">
              No games played yet. Start playing to see your stats!
            </p>
          </div>
        ) : (
          <>
            {/* ── Stat Cards Grid ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
              <StatCard label="Games" value={stats.totalGames} color="cyan" />
              <StatCard label="Best Score" value={stats.bestScore.toLocaleString()} color="yellow" />
              <StatCard label="Avg Score" value={stats.avgScore.toLocaleString()} color="green" />
              <StatCard label="Best Level" value={stats.bestLevel} color="purple" />
              <StatCard label="Accuracy" value={`${stats.avgAccuracy}%`} color="pink" />
              <StatCard label="Words Typed" value={stats.totalWordsCompleted} color="cyan" />
              <StatCard
                label="Hit Rate"
                value={
                  stats.totalLettersTyped > 0
                    ? `${Math.round((stats.totalCorrectLetters / stats.totalLettersTyped) * 100)}%`
                    : '—'
                }
                color="green"
              />
              <StatCard label="Total Keystrokes" value={stats.totalLettersTyped} color="purple" />
            </div>

            {/* ── Score History Chart ── */}
            {stats.scoreHistory.length > 1 && (
              <div className="w-full bg-[color:var(--color-bg-card)]/50 border border-[color:var(--color-neon-cyan)]/10 rounded-lg p-4">
                <h2 className="text-xs font-mono uppercase tracking-widest text-[color:var(--color-text-muted)] mb-4">
                  Score History
                </h2>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={stats.scoreHistory}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,240,255,0.06)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      stroke="rgba(0,240,255,0.1)"
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} stroke="rgba(0,240,255,0.1)" />
                    <Tooltip
                      contentStyle={{
                        background: '#1a1a2e',
                        border: '1px solid rgba(0,240,255,0.2)',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                      }}
                      labelFormatter={(d) => new Date(d).toLocaleDateString()}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#00f0ff"
                      fill="url(#scoreGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ── Accuracy Chart ── */}
            {stats.scoreHistory.length > 1 && (
              <div className="w-full bg-[color:var(--color-bg-card)]/50 border border-[color:var(--color-neon-pink)]/10 rounded-lg p-4">
                <h2 className="text-xs font-mono uppercase tracking-widest text-[color:var(--color-text-muted)] mb-4">
                  Accuracy Over Time
                </h2>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={stats.scoreHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,0,170,0.06)" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      stroke="rgba(255,0,170,0.1)"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      stroke="rgba(255,0,170,0.1)"
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#1a1a2e',
                        border: '1px solid rgba(255,0,170,0.2)',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                      }}
                      formatter={(value) => [`${value}%`, 'Accuracy']}
                      labelFormatter={(label) => new Date(String(label)).toLocaleDateString()}
                    />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#ff00aa"
                      strokeWidth={2}
                      dot={{ fill: '#ff00aa', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* ── Back button ── */}
        <button
          onClick={onBack}
          className="mt-4 px-6 py-2.5 font-mono font-bold text-sm uppercase tracking-widest rounded border-2 transition-all duration-200
            border-[color:var(--color-neon-cyan)] text-[color:var(--color-neon-cyan)]
            hover:bg-[color:var(--color-neon-cyan)] hover:text-[color:var(--color-bg-primary)]
            hover:shadow-[0_0_20px_rgba(0,240,255,0.5)]"
        >
          ◂ BACK
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// StatCard — Single stat display card
// ═══════════════════════════════════════════════════════════

type StatColor = 'cyan' | 'yellow' | 'green' | 'purple' | 'pink';

const colorMap: Record<StatColor, string> = {
  cyan: 'text-[color:var(--color-neon-cyan)]',
  yellow: 'text-[color:var(--color-neon-yellow)]',
  green: 'text-[color:var(--color-neon-green)]',
  purple: 'text-[color:var(--color-neon-purple)]',
  pink: 'text-[color:var(--color-neon-pink)]',
};

interface StatCardProps {
  label: string;
  value: string | number;
  color: StatColor;
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="bg-[color:var(--color-bg-card)]/50 border border-[color:var(--color-bg-card)] rounded-lg p-3 flex flex-col gap-1">
      <span className="text-[10px] font-mono uppercase tracking-widest text-[color:var(--color-text-muted)]">
        {label}
      </span>
      <span className={`text-lg font-mono font-bold tabular-nums ${colorMap[color]}`}>
        {value}
      </span>
    </div>
  );
}
