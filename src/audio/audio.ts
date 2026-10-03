'use client';

/**
 * AudioEngine — every sound is synthesised at runtime.
 * No sample files: nothing to license, nothing to download, and the room tone
 * costs about two kilobytes of code instead of a megabyte of loop.
 */
class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambience: GainNode | null = null;
  enabled = false;

  init(): void {
    if (this.ctx) return;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    this.master = master;

    // Room tone: brown-ish noise through a low-pass. Reads as "large empty space".
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = last * 0.97 + w * 0.03;
      d[i] = last * 3.2;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 320;
    const amb = ctx.createGain();
    amb.gain.value = 0.5;
    src.connect(lp).connect(amb).connect(master);
    src.start();
    this.ambience = amb;

    // Electrical hum: two detuned sines with slow LFO on gain.
    [55, 82.4].forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = i ? 0.035 : 0.06;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07 + i * 0.05;
      const lg = ctx.createGain();
      lg.gain.value = 0.02;
      lfo.connect(lg).connect(g.gain);
      o.connect(g).connect(master);
      o.start();
      lfo.start();
    });
  }

  toggle(): boolean {
    this.init();
    if (!this.ctx || !this.master) return false;
    this.enabled = !this.enabled;
    void this.ctx.resume();
    this.master.gain.linearRampToValueAtTime(this.enabled ? 0.35 : 0, this.ctx.currentTime + 0.6);
    return this.enabled;
  }

  /** Ambience thins out in the extraction chapter — silence is a scene beat. */
  setAmbience(level: number): void {
    if (!this.ctx || !this.ambience) return;
    this.ambience.gain.linearRampToValueAtTime(level, this.ctx.currentTime + 1.2);
  }

  blip(freq = 1200, dur = 0.05, type: OscillatorType = 'square', vol = 0.06): void {
    if (!this.enabled || !this.ctx || !this.master) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
    o.connect(g).connect(this.master);
    o.start();
    o.stop(this.ctx.currentTime + dur + 0.02);
  }

  clack(): void {
    this.blip(180, 0.09, 'square', 0.1);
    window.setTimeout(() => this.blip(90, 0.14, 'triangle', 0.09), 40);
  }
  latch(i = 0): void {
    window.setTimeout(() => this.blip(2400 - i * 400, 0.04, 'square', 0.08), i * 90);
  }
  lid(): void {
    this.blip(70, 0.7, 'triangle', 0.09);
    window.setTimeout(() => this.blip(150, 0.25, 'sawtooth', 0.03), 700);
  }
  typeKey(): void {
    this.blip(1600 + Math.random() * 500, 0.02, 'square', 0.05);
    window.setTimeout(() => this.blip(220, 0.05, 'triangle', 0.04), 18);
  }
  transition(): void {
    this.blip(140, 0.5, 'sawtooth', 0.035);
  }
}

export const audio = new AudioEngine();
