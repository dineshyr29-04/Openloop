import { useEffect, useState, useCallback, useRef } from 'react';
import { safeGetTimerSnapshot, type TimerSnapshot } from '../utils/timerClient';

const BROADCAST_CHANNEL_NAME = 'openloop-timer-sync';
const POLL_INTERVAL = 500; // More aggressive polling for better responsiveness

let broadcastChannel: BroadcastChannel | null = null;

// Initialize broadcast channel once
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch {
    console.warn('BroadcastChannel not available');
  }
}

export const publishTimerSync = (snapshot: TimerSnapshot) => {
  if (!broadcastChannel) return;
  try {
    broadcastChannel.postMessage({
      type: 'timer-sync',
      timestamp: Date.now(),
      data: snapshot,
    });
  } catch (error) {
    console.warn('Failed to publish timer sync:', error);
  }
};

interface UseTimerSyncOptions {
  onUpdate?: (snapshot: TimerSnapshot) => void;
  pollInterval?: number;
}

export const useTimerSync = (options: UseTimerSyncOptions = {}) => {
  const { onUpdate, pollInterval = POLL_INTERVAL } = options;
  
  const [snapshot, setSnapshot] = useState<TimerSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // Sync from backend
  const syncFromBackend = useCallback(async () => {
    try {
      const data = await safeGetTimerSnapshot();
      if (!isMountedRef.current) return;
      
      setSnapshot(data);
      setError(null);
      onUpdate?.(data);
    } catch (err) {
      console.warn('Timer sync failed:', err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Sync failed');
      }
    }
  }, [onUpdate]);

  // Listen for broadcasts from other tabs/components
  useEffect(() => {
    if (!broadcastChannel) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'timer-sync') {
        if (!isMountedRef.current) return;
        setSnapshot(event.data.data);
        setError(null);
        onUpdate?.(event.data.data);
      }
    };

    broadcastChannel.addEventListener('message', handleMessage);
    return () => {
      broadcastChannel?.removeEventListener('message', handleMessage);
    };
  }, [onUpdate]);

  // Listen for visibility changes to refresh when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) return;
      // Tab became visible - sync immediately
      void syncFromBackend();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncFromBackend]);

  // Setup polling
  useEffect(() => {
    // Initial sync immediately
    void syncFromBackend();

    // Setup interval
    intervalRef.current = setInterval(syncFromBackend, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [syncFromBackend, pollInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { snapshot, error };
};
