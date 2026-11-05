// Small synthesized sound effects (Web Audio API — no audio files to host,
// same technique the admin "new order" beep already uses). Each function is
// safe to call from anywhere; it no-ops quietly if audio isn't available.

let ctx = null;
function getCtx() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!ctx) ctx = new Ctx();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function noiseBuffer(audioCtx, seconds) {
  const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * seconds, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** A cork/cap "pop" + brief fizz — played when an item is added to the cart. */
export function playBottleOpen() {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  // the "pop": a quick downward pitch sweep with a sharp gain envelope
  const osc = audioCtx.createOscillator();
  const popGain = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(900, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.07);
  popGain.gain.setValueAtTime(0.0001, now);
  popGain.gain.exponentialRampToValueAtTime(0.35, now + 0.008);
  popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
  osc.connect(popGain).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.1);

  // the "fizz": filtered noise tailing off
  const noise = audioCtx.createBufferSource();
  noise.buffer = noiseBuffer(audioCtx, 0.35);
  const filter = audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 3500;
  filter.Q.value = 0.7;
  const fizzGain = audioCtx.createGain();
  fizzGain.gain.setValueAtTime(0.0001, now + 0.02);
  fizzGain.gain.exponentialRampToValueAtTime(0.1, now + 0.05);
  fizzGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
  noise.connect(filter).connect(fizzGain).connect(audioCtx.destination);
  noise.start(now + 0.02);
  noise.stop(now + 0.4);
}

/** A little glass-clink "cheers" — played once an order is successfully placed. */
export function playCheers() {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  // a handful of bright, slightly-detuned tones staggered like clinking glasses
  const clinks = [
    { freq: 2600, at: 0 },
    { freq: 3100, at: 0.06 },
    { freq: 2850, at: 0.1 },
    { freq: 3400, at: 0.16 },
  ];
  clinks.forEach(({ freq, at }) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = now + at;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.55);
  });
}
