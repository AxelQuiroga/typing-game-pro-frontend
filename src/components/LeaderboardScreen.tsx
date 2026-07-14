import { useState, useEffect, useCallback } from 'react';
import type { LeaderboardEntry } from '../game/types';
import { fetchLeaderboard, fetchPlayerScores, fetchPlayerRank } from '../services/api';
import { useSSE } from '../hooks/useSSE';

// ═══════════════════════════════════════════════════════════
// LeaderboardScreen — 3-tab leaderboard
//
// Tabs:
//   TOP      — Global top 25 scores
//   MY GAMES — Current player's score history
//   RANK     — Where the player stands globally
// ═══════════════════════════════════════════════════════════

type Tab = 'top' | 'my' | 'rank';

interface LeaderboardScreenProps {
  nickname: string;
  currentScore?: number;
  onBack: () => void;
}

export function LeaderboardScreen({ nickname, currentScore, onBack }: LeaderboardScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('top');
  const [topScores, setTopScores] = useState<LeaderboardEntry[]>([]);
  const [myScores, setMyScores] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [liveIndicator, setLiveIndicator] = useState(false);

  // ── SSE: live updates ──
  const handleSSEScore = useCallback(() => {
    // Flash the live indicator
    setLiveIndicator(true);
    setTimeout(() => setLiveIndicator(false), 2000);

    // Refresh the current tab
    if (activeTab === 'top') {
      fetchLeaderboard(25).then(setTopScores);
    } else if (activeTab === 'my') {
      fetchPlayerScores(nickname).then(setMyScores);
    }
  }, [activeTab, nickname]);

  useSSE({
    nickname,
    onScore: handleSSEScore,
    enabled: true,
  });

  // ── Fetch data per tab ──
  const loadTab = useCallback(async (tab: Tab) => {
    setLoading(true);
    try {
      switch (tab) {
        case 'top':
          setTopScores(await fetchLeaderboard(25));
          break;
        case 'my':
          setMyScores(await fetchPlayerScores(nickname));
          break;
        case 'rank':
          if (currentScore != null && currentScore > 0) {
            setMyRank(await fetchPlayerRank(currentScore));
          }
          break;
      }
    } finally {
      setLoading(false);
    }
  }, [nickname, currentScore]);

  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab, loadTab]);

  // ── Tab button class helper ──
  const tabClass = (tab: Tab) =>
    `px-4 py-2 font-mono font-bold text-xs uppercase tracking-widest rounded-t transition-all duration-200 ${
      activeTab === tab
        ? 'bg-[color:var(--color-bg-card)] text-[color:var(--color-neon-cyan)] border-b-2 border-[color:var(--color-neon-cyan)]'
        : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-neon-cyan)]/60'
    }`;

  return (
    <div className="relative w-full h-full flex flex-col items-center bg-[color:var(--color-bg-primary)] scanlines overflow-hidden">
      {/* ── Header ── */}
      <div className="relative z-10 flex flex-col items-center gap-4 pt-8 px-4 w-full max-w-lg">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl md:text-4xl font-black font-[family-name:var(--font-display)] text-[color:var(--color-neon-cyan)] glow-cyan tracking-wider">
            LEADERBOARD
          </h1>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all duration-300 ${
            liveIndicator
              ? 'bg-[color:var(--color-neon-green)]/20 text-[color:var(--color-neon-green)]'
              : 'text-[color:var(--color-text-muted)]/40'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${liveIndicator ? 'bg-[color:var(--color-neon-green)] animate-pulse' : 'bg-[color:var(--color-text-muted)]/30'}`} />
            LIVE
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex w-full border-b border-[color:var(--color-bg-card)]">
          <button className={tabClass('top')} onClick={() => setActiveTab('top')}>
            🏆 Top
          </button>
          <button className={tabClass('my')} onClick={() => setActiveTab('my')}>
            👤 My Games
          </button>
          <button className={tabClass('rank')} onClick={() => setActiveTab('rank')}>
            📍 Where Am I?
          </button>
        </div>

        {/* ── Content ── */}
        <div className="w-full bg-[color:var(--color-bg-card)]/50 border border-[color:var(--color-neon-cyan)]/10 rounded-b-lg rounded-tr-lg p-4 min-h-[300px] max-h-[420px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm font-mono text-[color:var(--color-text-muted)] animate-pulse-glow">
                LOADING...
              </p>
            </div>
          ) : (
            <>
              {/* ── TOP TAB ── */}
              {activeTab === 'top' && (
                <ScoreTable
                  entries={topScores}
                  highlightNickname={nickname}
                  emptyMessage="No scores yet. Be the first!"
                />
              )}

              {/* ── MY GAMES TAB ── */}
              {activeTab === 'my' && (
                <ScoreTable
                  entries={myScores}
                  highlightNickname={nickname}
                  showDate
                  emptyMessage={`No games played yet, ${nickname}.`}
                />
              )}

              {/* ── RANK TAB ── */}
              {activeTab === 'rank' && (
                <div className="flex flex-col items-center gap-6 py-8">
                  {currentScore != null && currentScore > 0 && myRank !== null ? (
                    <>
                      <div className="text-center">
                        <p className="text-xs font-mono uppercase tracking-widest text-[color:var(--color-text-muted)] mb-2">
                          Your Rank
                        </p>
                        <p className="text-5xl font-black font-[family-name:var(--font-display)] text-[color:var(--color-neon-pink)] glow-pink">
                          #{myRank}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-mono uppercase tracking-widest text-[color:var(--color-text-muted)] mb-1">
                          Last Score
                        </p>
                        <p className="text-2xl font-mono font-bold text-[color:var(--color-neon-yellow)] tabular-nums">
                          {currentScore.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-mono text-[color:var(--color-text-muted)]">
                          {myRank === 1
                            ? '🏆 You are #1! Unstoppable!'
                            : myRank <= 10
                              ? '🔥 Top 10! Keep climbing!'
                              : myRank <= 25
                                ? '💪 Top 25. So close to the elite.'
                                : 'Keep grinding. Every word counts.'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm font-mono text-[color:var(--color-text-muted)]">
                        Play a game to see your rank!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

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
// ScoreTable — Shared table for score lists
// ═══════════════════════════════════════════════════════════

interface ScoreTableProps {
  entries: LeaderboardEntry[];
  highlightNickname?: string;
  showDate?: boolean;
  emptyMessage: string;
}

function ScoreTable({ entries, highlightNickname, showDate, emptyMessage }: ScoreTableProps) {
  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-sm font-mono text-[color:var(--color-text-muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ── Table header ── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[color:var(--color-neon-cyan)]/10 text-[10px] font-mono uppercase tracking-widest text-[color:var(--color-text-muted)]">
        <span className="w-8">#</span>
        <span className="flex-1">Player</span>
        <span className="w-16 text-right">Score</span>
        <span className="w-10 text-right">Lvl</span>
        {showDate && <span className="w-20 text-right">Date</span>}
      </div>

      {/* ── Rows ── */}
      {entries.map((entry) => {
        const isMe = highlightNickname && entry.nickname === highlightNickname;

        return (
          <div
            key={entry.id}
            className={`flex items-center gap-2 px-3 py-2.5 border-b border-[color:var(--color-bg-card)] transition-all duration-200 ${
              isMe
                ? 'bg-[color:var(--color-neon-cyan)]/10 border-l-2 border-l-[color:var(--color-neon-cyan)]'
                : entry.rank <= 3
                  ? 'bg-[color:var(--color-neon-yellow)]/5'
                  : ''
            }`}
          >
            {/* Rank */}
            <span className={`w-8 font-mono font-bold ${
              entry.rank === 1
                ? 'text-[color:var(--color-neon-yellow)]'
                : entry.rank === 2
                  ? 'text-[color:var(--color-text-muted)]'
                  : entry.rank === 3
                    ? 'text-[color:var(--color-neon-red)]'
                    : 'text-[color:var(--color-text-muted)]'
            }`}>
              {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
            </span>

            {/* Player */}
            <span className={`flex-1 font-mono text-sm truncate ${
              isMe
                ? 'text-[color:var(--color-neon-cyan)] font-bold'
                : 'text-[color:var(--color-text-primary)]'
            }`}>
              {entry.nickname}
              {isMe && <span className="text-[10px] ml-1 text-[color:var(--color-neon-cyan)]/60">(you)</span>}
            </span>

            {/* Score */}
            <span className="w-16 text-right font-mono font-bold text-[color:var(--color-neon-yellow)] tabular-nums">
              {entry.score.toLocaleString()}
            </span>

            {/* Level */}
            <span className="w-10 text-right font-mono text-[color:var(--color-neon-purple)]">
              {entry.level}
            </span>

            {/* Date */}
            {showDate && (
              <span className="w-20 text-right font-mono text-[10px] text-[color:var(--color-text-muted)]">
                {new Date(entry.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
