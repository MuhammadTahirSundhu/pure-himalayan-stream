// New-order alerts while the admin panel is open: beep, toast, tab title and browser notification.
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const KEY = 'ow_admin_order_alerts';
const BASE_TITLE = 'OneWater Admin';

const readPref = () => {
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
};
const writePref = (on: boolean) => {
  try { localStorage.setItem(KEY, on ? '1' : '0'); } catch { /* storage blocked — alerts still work this session */ }
};

let audioCtx: AudioContext | null = null;
/** Creates/resumes the AudioContext — call from a click so browsers allow sound later. */
const unlockAudio = () => {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    audioCtx ??= new Ctx();
    if (audioCtx.state === 'suspended') void audioCtx.resume();
  } catch { /* no audio support */ }
};

/** Two short sine beeps generated with the Web Audio API (no audio files). */
export const beep = () => {
  unlockAudio();
  if (!audioCtx) return;
  const t0 = audioCtx.currentTime;
  [0, 0.22].forEach((offset, i) => {
    const osc = audioCtx!.createOscillator();
    const gain = audioCtx!.createGain();
    osc.type = 'sine';
    osc.frequency.value = i ? 1175 : 880;
    gain.gain.setValueAtTime(0.0001, t0 + offset);
    gain.gain.exponentialRampToValueAtTime(0.3, t0 + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + offset + 0.18);
    osc.connect(gain).connect(audioCtx!.destination);
    osc.start(t0 + offset);
    osc.stop(t0 + offset + 0.2);
  });
};

/**
 * Watches the pending-order count. When it rises (and alerts are on) it beeps, toasts
 * "New order!" with a View action, and shows a browser notification if permitted.
 * The tab title always mirrors the pending count.
 */
export function useOrderAlerts(pending: number | undefined, onView: () => void) {
  const [enabled, setEnabled] = useState(readPref);
  const prev = useRef<number | undefined>(undefined);
  const viewRef = useRef(onView);
  viewRef.current = onView;

  useEffect(() => {
    if (pending === undefined) return;
    document.title = pending > 0 ? `(${pending}) ${BASE_TITLE}` : BASE_TITLE;
    const before = prev.current;
    prev.current = pending;
    if (!enabled || before === undefined || pending <= before) return;
    const added = pending - before;
    const text = `${added} new order${added === 1 ? '' : 's'} waiting — ${pending} pending.`;
    beep();
    toast('New order!', { description: text, duration: 15000, action: { label: 'View', onClick: () => viewRef.current() } });
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        const n = new Notification('New order! — OneWater', { body: text, tag: 'ow-new-order' });
        n.onclick = () => { window.focus(); viewRef.current(); n.close(); };
      }
    } catch { /* some mobile browsers only allow notifications from a service worker */ }
  }, [pending, enabled]);

  useEffect(() => () => { document.title = BASE_TITLE; }, []);

  const toggle = useCallback(async () => {
    const next = !enabled;
    setEnabled(next);
    writePref(next);
    if (!next) return void toast('Order alerts turned off.');
    unlockAudio();
    let note = '';
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        try { await Notification.requestPermission(); } catch { /* ignored */ }
      }
      if (Notification.permission === 'denied') note = ' Browser notifications are blocked — you will still get the sound and on-screen alert.';
    }
    toast.success(`Order alerts on. Keep this tab open — we check for new orders every minute.${note}`);
  }, [enabled]);

  return { enabled, toggle };
}
