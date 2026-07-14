// ═══════════════════════════════════════════════════════════
// useSSE — Server-Sent Events hook
//
// Connects to the SSE endpoint and provides real-time
// score and achievement events. Auto-reconnects on disconnect.
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export interface SSEScoreEvent {
  nickname: string;
  score: number;
  level: number;
  rank: number;
  accuracy: number;
}

export interface SSEAchievementEvent {
  nickname: string;
  key: string;
  name: string;
  icon: string;
}

interface UseSSEOptions {
  nickname?: string;
  onScore?: (event: SSEScoreEvent) => void;
  onAchievement?: (event: SSEAchievementEvent) => void;
  enabled?: boolean;
}

export function useSSE({ nickname, onScore, onAchievement, enabled = true }: UseSSEOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);

  const connect = useCallback(() => {
    if (!enabled) return;

    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = nickname
      ? `${API_BASE_URL}/api/sse/stream?nickname=${encodeURIComponent(nickname)}`
      : `${API_BASE_URL}/api/sse/stream`;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener('connected', () => {
      reconnectAttemptsRef.current = 0;
    });

    es.addEventListener('score', (e) => {
      try {
        const data = JSON.parse(e.data) as SSEScoreEvent;
        onScore?.(data);
      } catch {
        // Malformed event — ignore
      }
    });

    es.addEventListener('achievement', (e) => {
      try {
        const data = JSON.parse(e.data) as SSEAchievementEvent;
        onAchievement?.(data);
      } catch {
        // Malformed event — ignore
      }
    });

    es.onerror = () => {
      es.close();
      // Exponential backoff reconnect
      const delay = Math.min(1000 * 2 ** reconnectAttemptsRef.current, 30_000);
      reconnectAttemptsRef.current += 1;
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    };
  }, [enabled, nickname, onScore, onAchievement]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);
}
