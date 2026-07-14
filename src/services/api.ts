import type { ScorePayload, ScoreResponse, LeaderboardEntry } from '../game/types';

// ═══════════════════════════════════════════════════════════
// API Service Layer
//
// All HTTP concerns isolated here.
// When backend is unreachable, gracefully falls back to simulation
// so the game is never blocked.
// ═══════════════════════════════════════════════════════════

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

/**
 * Submit a score to the backend leaderboard.
 */
export async function submitScore(payload: ScorePayload): Promise<ScoreResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(
        errorBody?.message ?? `HTTP ${response.status}: ${response.statusText}`,
      );
    }

    const data = (await response.json()) as ScoreResponse & { rank?: number };
    return {
      success: true,
      rank: data.rank,
      message: data.message,
    };
  } catch (error) {
    // Backend not available — graceful fallback
    console.warn('[API] Backend unreachable, using simulation:', (error as Error).message);

    await new Promise((resolve) => setTimeout(resolve, 400));

    return {
      success: true,
      rank: Math.floor(Math.random() * 100) + 1,
      message: 'Score recorded (offline mode)',
    };
  }
}

/**
 * Fetch the top N scores from the leaderboard.
 */
export async function fetchLeaderboard(limit: number = 25): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scores?limit=${limit}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      success: boolean;
      data: LeaderboardEntry[];
    };

    return data.data ?? [];
  } catch {
    console.warn('[API] Could not fetch leaderboard');
    return [];
  }
}

/**
 * Fetch a player's score history.
 */
export async function fetchPlayerScores(
  nickname: string,
  limit: number = 20,
): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/scores/player/${encodeURIComponent(nickname)}?limit=${limit}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      success: boolean;
      data: LeaderboardEntry[];
    };

    return data.data ?? [];
  } catch {
    console.warn('[API] Could not fetch player scores');
    return [];
  }
}

/**
 * Fetch the global rank for a given score.
 */
export async function fetchPlayerRank(score: number): Promise<number | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scores/rank/${score}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      success: boolean;
      rank: number;
    };

    return data.rank ?? null;
  } catch {
    console.warn('[API] Could not fetch rank');
    return null;
  }
}

export interface PlayerStats {
  nickname: string;
  totalGames: number;
  bestScore: number;
  avgScore: number;
  bestLevel: number;
  avgAccuracy: number;
  totalWordsCompleted: number;
  totalCorrectLetters: number;
  totalLettersTyped: number;
  scoreHistory: Array<{ score: number; accuracy: number; level: number; date: string }>;
}

/**
 * Fetch aggregated stats for a player.
 */
export async function fetchPlayerStats(nickname: string): Promise<PlayerStats | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/scores/stats/${encodeURIComponent(nickname)}`,
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      success: boolean;
      data: PlayerStats;
    };

    return data.data ?? null;
  } catch {
    console.warn('[API] Could not fetch player stats');
    return null;
  }
}
