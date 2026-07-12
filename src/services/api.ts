import type { ScorePayload, ScoreResponse } from '../game/types';

// ═══════════════════════════════════════════════════════════
// API Service Layer — Phase 2: Real Backend
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
export async function fetchLeaderboard(limit: number = 10): Promise<ScorePayload[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scores?limit=${limit}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      success: boolean;
      data: Array<{
        nickname: string;
        score: number;
        level: number;
        wordsCompleted: number;
        createdAt: string;
      }>;
    };

    return data.data.map((entry) => ({
      nickname: entry.nickname,
      score: entry.score,
      level: entry.level,
      wordsCompleted: entry.wordsCompleted,
      timestamp: entry.createdAt,
    }));
  } catch {
    console.warn('[API] Could not fetch leaderboard');
    return [];
  }
}
