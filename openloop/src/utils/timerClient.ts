export type SharedTimerState = 'IDLE' | 'RUNNING' | 'STOPPED';
export type TimerMode = 'EVENT' | 'CHALLENGE';

export interface TimerSnapshot {
  mode: TimerMode;
  state: SharedTimerState;
  remainingSeconds: number;
  eventRemainingSeconds: number;
}

const API_PATH = '/api/timer';

export const TOTAL_SECONDS = 24 * 60 * 60;

const fallbackSnapshot = (): TimerSnapshot => ({
  mode: 'EVENT',
  state: 'IDLE',
  remainingSeconds: TOTAL_SECONDS,
  eventRemainingSeconds: 0,
});

export const getTimerSnapshot = async (): Promise<TimerSnapshot> => {
  const res = await fetch(API_PATH, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`Timer GET failed: ${res.status}`);
  }
  return (await res.json()) as TimerSnapshot;
};

export const safeGetTimerSnapshot = async (): Promise<TimerSnapshot> => {
  try {
    return await getTimerSnapshot();
  } catch {
    return fallbackSnapshot();
  }
};

const postAction = async (action: 'start' | 'stop' | 'reset' | 'fast-forward'): Promise<TimerSnapshot> => {
  const res = await fetch(API_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });

  if (!res.ok) {
    throw new Error(`Timer action failed: ${res.status}`);
  }

  return (await res.json()) as TimerSnapshot;
};

export const startChallengeTimer = () => postAction('start');
export const stopChallengeTimer = () => postAction('stop');
export const resetChallengeTimer = () => postAction('reset');
export const fastForwardChallengeTimer = () => postAction('fast-forward');
