export type SharedTimerState = 'IDLE' | 'RUNNING' | 'STOPPED';

export const TOTAL_SECONDS = 24 * 60 * 60;
export const TIMER_KEY = 'openloop_challenge_timer';
export const TIMER_STATE_KEY = 'openloop_challenge_timer_state';
export const TIMER_END_AT_KEY = 'openloop_challenge_timer_end_at';
export const TIMER_SYNC_EVENT = 'openloop:timer-sync';

export interface TimerSnapshot {
  state: SharedTimerState;
  remainingSeconds: number;
  endAtMs: number | null;
}

const clampSeconds = (value: number): number => {
  if (!Number.isFinite(value)) return TOTAL_SECONDS;
  if (value < 0) return 0;
  if (value > TOTAL_SECONDS) return TOTAL_SECONDS;
  return Math.floor(value);
};

const emitSyncEvent = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(TIMER_SYNC_EVENT));
};

const setStorageItem = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

export const readTimerSnapshot = (): TimerSnapshot => {
  const stateRaw = localStorage.getItem(TIMER_STATE_KEY);
  const state: SharedTimerState =
    stateRaw === 'RUNNING' || stateRaw === 'STOPPED' ? stateRaw : 'IDLE';

  const remainingRaw = Number(localStorage.getItem(TIMER_KEY));
  const storedRemaining = clampSeconds(remainingRaw);

  const endAtRaw = Number(localStorage.getItem(TIMER_END_AT_KEY));
  const endAtMs = Number.isFinite(endAtRaw) ? endAtRaw : null;

  if (state !== 'RUNNING' || endAtMs === null) {
    return {
      state,
      remainingSeconds: storedRemaining,
      endAtMs: null,
    };
  }

  const liveRemaining = clampSeconds(Math.ceil((endAtMs - Date.now()) / 1000));

  if (liveRemaining === 0) {
    return {
      state: 'STOPPED',
      remainingSeconds: 0,
      endAtMs: null,
    };
  }

  return {
    state,
    remainingSeconds: liveRemaining,
    endAtMs,
  };
};

export const persistTimerSnapshot = (snapshot: TimerSnapshot) => {
  setStorageItem(TIMER_KEY, String(clampSeconds(snapshot.remainingSeconds)));
  setStorageItem(TIMER_STATE_KEY, snapshot.state);

  if (snapshot.endAtMs === null) {
    localStorage.removeItem(TIMER_END_AT_KEY);
  } else {
    setStorageItem(TIMER_END_AT_KEY, String(snapshot.endAtMs));
  }

  emitSyncEvent();
};

export const syncTimerStateIfExpired = (): TimerSnapshot => {
  const snapshot = readTimerSnapshot();
  const shouldPersist =
    snapshot.state !== localStorage.getItem(TIMER_STATE_KEY) ||
    String(snapshot.remainingSeconds) !== localStorage.getItem(TIMER_KEY) ||
    (snapshot.endAtMs === null && localStorage.getItem(TIMER_END_AT_KEY) !== null);

  if (shouldPersist) {
    persistTimerSnapshot(snapshot);
  }

  return snapshot;
};

export const startTimer = (remainingSeconds?: number): TimerSnapshot => {
  const base = readTimerSnapshot();
  const seconds = clampSeconds(
    typeof remainingSeconds === 'number' ? remainingSeconds : base.remainingSeconds
  );
  const startFrom = seconds > 0 ? seconds : TOTAL_SECONDS;

  const next: TimerSnapshot = {
    state: 'RUNNING',
    remainingSeconds: startFrom,
    endAtMs: Date.now() + startFrom * 1000,
  };

  persistTimerSnapshot(next);
  return next;
};

export const stopTimer = (): TimerSnapshot => {
  const base = readTimerSnapshot();
  const next: TimerSnapshot = {
    state: 'STOPPED',
    remainingSeconds: base.remainingSeconds,
    endAtMs: null,
  };
  persistTimerSnapshot(next);
  return next;
};

export const resetTimer = (): TimerSnapshot => {
  const next: TimerSnapshot = {
    state: 'IDLE',
    remainingSeconds: TOTAL_SECONDS,
    endAtMs: null,
  };
  persistTimerSnapshot(next);
  return next;
};

export const fastForwardOneHour = (): TimerSnapshot => {
  const base = readTimerSnapshot();

  if (base.state === 'RUNNING' && base.endAtMs !== null) {
    const shiftedEndAt = Math.max(Date.now(), base.endAtMs - 3600 * 1000);
    const remaining = clampSeconds(Math.ceil((shiftedEndAt - Date.now()) / 1000));
    const next: TimerSnapshot = {
      state: remaining === 0 ? 'STOPPED' : 'RUNNING',
      remainingSeconds: remaining,
      endAtMs: remaining === 0 ? null : shiftedEndAt,
    };
    persistTimerSnapshot(next);
    return next;
  }

  const reduced = clampSeconds(base.remainingSeconds - 3600);
  const next: TimerSnapshot = {
    state: base.state,
    remainingSeconds: reduced,
    endAtMs: null,
  };
  persistTimerSnapshot(next);
  return next;
};
