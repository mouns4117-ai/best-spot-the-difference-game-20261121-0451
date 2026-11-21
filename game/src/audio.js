// Tiny WebAudio sound effects for Lantern Market. No audio files: every
// sound is a short oscillator tone, so the game loads nothing over the network.

let audioCtx = null;

function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

/** Play one tone. */
export function tone(freq, dur, type = 'sine', gain = 0.12, when = 0) {
  const ac = ctx();
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** A happy two-note chime when a difference is found. */
export function chime() {
  tone(660, 0.12, 'sine', 0.14);
  tone(990, 0.22, 'sine', 0.14, 0.09);
}

/** A low buzz for a wrong click. */
export function buzz() {
  tone(140, 0.18, 'sawtooth', 0.07);
}

/** A rising arpeggio when a scene is cleared. */
export function winJingle() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.13, i * 0.11));
}

/** A soft blip when a hint is used. */
export function hintBlip() {
  tone(880, 0.1, 'sine', 0.1);
  tone(1175, 0.14, 'sine', 0.1, 0.08);
}

/** A tick when the timer drops under ten seconds. */
export function tick() {
  tone(1200, 0.05, 'square', 0.05);
}
