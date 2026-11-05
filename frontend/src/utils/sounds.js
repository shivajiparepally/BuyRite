// Small synthesized sound effects (Web Audio API — no audio files to host or
// license, same technique the admin "new order" beep already uses). Each
// function is safe to call from anywhere; it no-ops quietly if audio isn't
// available.

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

function metallicTick(audioCtx, time, { freq = 1000, gain = 0.2, decay = 0.06 } = {}) {
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, time);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.6, time + decay);
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(gain, time + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, time + decay);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + decay + 0.02);
}

function glassClink(audioCtx, time, { freq = 2600, gain = 0.18, decay = 0.45 } = {}) {
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(gain, time + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, time + decay);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + decay + 0.05);
}

/**
 * Bottle cap flicked off, then clattering and bouncing on the ground —
 * played when an item is added to the cart.
 */
export function playCapPop() {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  // the cap flicking off: a sharp metallic snap
  metallicTick(audioCtx, now, { freq: 2200, gain: 0.3, decay: 0.03 });

  // the cap hitting the ground and bouncing to a stop: a series of
  // metallic taps, getting quieter and closer together (bounce physics)
  let t = now + 0.07;
  let gap = 0.09;
  let gain = 0.22;
  for (let i = 0; i < 7; i++) {
    metallicTick(audioCtx, t, { freq: 1500 - i * 60, gain, decay: 0.045 });
    t += gap;
    gap *= 0.72; // bounces land closer together as energy dissipates
    gain *= 0.72;
  }

  // a brief metallic roll/settle as it spins out
  const noise = audioCtx.createBufferSource();
  const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.25, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  noise.buffer = buf;
  const filter = audioCtx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 2000;
  const rollGain = audioCtx.createGain();
  rollGain.gain.setValueAtTime(0.06, t);
  rollGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
  noise.connect(filter).connect(rollGain).connect(audioCtx.destination);
  noise.start(t);
  noise.stop(t + 0.26);
}

/**
 * Bottles jostling and clinking together, like carrying a full bag —
 * played right after an order is placed.
 */
export function playBagClink() {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const count = 13;
  for (let i = 0; i < count; i++) {
    const t = now + Math.random() * 1.7;
    const freq = 1700 + Math.random() * 1800;
    glassClink(audioCtx, t, { freq, gain: 0.08 + Math.random() * 0.1, decay: 0.3 + Math.random() * 0.25 });
  }
}

/**
 * A fuller group "cheers" — several whiskey glasses clinking together at
 * once — played when the customer clicks the cheers button.
 */
export function playGroupCheers() {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const glasses = 7;
  for (let i = 0; i < glasses; i++) {
    const t = now + Math.random() * 0.22; // all roughly at once, like a group toast
    const freq = 2200 + Math.random() * 1400;
    glassClink(audioCtx, t, { freq, gain: 0.16 + Math.random() * 0.08, decay: 0.6 + Math.random() * 0.3 });
  }
}
