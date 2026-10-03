'use client';
import type { ChapterId } from '@/data/chapters';

export type Cue =
  | 'latch'
  | 'hinge'
  | 'leather'
  | 'thud'
  | 'unfold'
  | 'folder'
  | 'seal'
  | 'paper'
  | 'drawer'
  | 'type'
  | 'nav'
  | 'click'
  | 'key'
  | 'door';

interface RoomTone {
  /** room tone level */
  tone: number;
  /** low-pass cutoff: bigger rooms sit lower */
  cutoff: number;
  /** distant wind level */
  wind: number;
  /** mean ms between candle/fire crackles; 0 = none */
  crackle: number;
  /** reverb send */
  wet: number;
}

/**
 * Each room has its own air. The differences are small on purpose — you should
 * notice the final room going quiet, not notice the settings changing.
 */
const ROOMS: Record<ChapterId, RoomTone> = {
  entrance: { tone: 0.6, cutoff: 240, wind: 0.22, crackle: 2600, wet: 0.5 },
  skills: { tone: 0.42, cutoff: 320, wind: 0.08, crackle: 1800, wet: 0.2 },
  projects: { tone: 0.45, cutoff: 290, wind: 0.1, crackle: 3200, wet: 0.28 },
  research: { tone: 0.4, cutoff: 360, wind: 0.06, crackle: 1500, wet: 0.24 },
  certifications: { tone: 0.36, cutoff: 280, wind: 0.05, crackle: 4200, wet: 0.3 },
  build: { tone: 0.4, cutoff: 330, wind: 0.07, crackle: 2400, wet: 0.22 },
  final: { tone: 0.12, cutoff: 200, wind: 0.14, crackle: 0, wet: 0.55 },
};

const PREF_KEY = 'estate.sound';

/**
 * AudioEngine — the single place sound is made.
 *
 * Everything is synthesised with the Web Audio API: nothing to download,
 * nothing to license, nothing to fail to load. The context is created lazily on
 * the first user gesture, so autoplay policy is respected without a workaround.
 * Each cue is rate-limited so rapid clicking cannot stack a dozen latches.
 */
class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private toneGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private lowpass: BiquadFilterNode | null = null;
  private wet: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private crackleTimer: number | null = null;
  private room: ChapterId = 'entrance';
  private lastCue = new Map<Cue, number>();
  enabled = false;

  /** The visitor's last choice, restored — but still waiting for a gesture before sounding. */
  get preferred(): boolean {
    try {
      return window.localStorage.getItem(PREF_KEY) === 'on';
    } catch {
      return false;
    }
  }

  private noiseBuffer(ctx: AudioContext, seconds: number, brown = false): AudioBuffer {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (brown) {
        last = last * 0.975 + w * 0.025;
        d[i] = last * 3.4;
      } else d[i] = w;
    }
    return buf;
  }

  private init(): boolean {
    if (this.ctx) return true;
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return false;
    const ctx = new Ctor();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    this.master = master;

    // A generated impulse response: exponentially decaying noise reads as stone.
    const irLen = Math.floor(ctx.sampleRate * 2.6);
    const ir = ctx.createBuffer(2, irLen, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < irLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 3.1);
    }
    const reverb = ctx.createConvolver();
    reverb.buffer = ir;
    const wet = ctx.createGain();
    wet.gain.value = 0.3;
    reverb.connect(wet).connect(master);
    this.reverb = reverb;
    this.wet = wet;

    // Room tone.
    const tone = ctx.createBufferSource();
    tone.buffer = this.noiseBuffer(ctx, 5, true);
    tone.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 260;
    const toneGain = ctx.createGain();
    toneGain.gain.value = 0.5;
    tone.connect(lp).connect(toneGain).connect(master);
    toneGain.connect(reverb);
    tone.start();
    this.lowpass = lp;
    this.toneGain = toneGain;

    // Distant wind: band-passed noise with a slow sweep.
    const wind = ctx.createBufferSource();
    wind.buffer = this.noiseBuffer(ctx, 6);
    wind.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 480;
    bp.Q.value = 0.8;
    const sweep = ctx.createOscillator();
    sweep.frequency.value = 0.045;
    const sweepAmt = ctx.createGain();
    sweepAmt.gain.value = 220;
    sweep.connect(sweepAmt).connect(bp.frequency);
    sweep.start();
    const windGain = ctx.createGain();
    windGain.gain.value = 0.1;
    wind.connect(bp).connect(windGain).connect(master);
    wind.start();
    this.windGain = windGain;

    this.applyRoom(true);
    return true;
  }

  private applyRoom(immediate = false): void {
    if (!this.ctx || !this.toneGain || !this.windGain || !this.lowpass || !this.wet) return;
    const r = ROOMS[this.room];
    const t = this.ctx.currentTime + (immediate ? 0.01 : 2.4);
    this.toneGain.gain.linearRampToValueAtTime(r.tone, t);
    this.windGain.gain.linearRampToValueAtTime(r.wind, t);
    this.lowpass.frequency.linearRampToValueAtTime(r.cutoff, t);
    this.wet.gain.linearRampToValueAtTime(r.wet, t);
  }

  private scheduleCrackle(): void {
    if (this.crackleTimer) window.clearTimeout(this.crackleTimer);
    const mean = ROOMS[this.room].crackle;
    if (!this.enabled || mean === 0) return;
    this.crackleTimer = window.setTimeout(() => {
      this.burst(1400 + Math.random() * 2400, 0.025, 0.015 + Math.random() * 0.03, 'bandpass', 0);
      this.scheduleCrackle();
    }, mean * (0.3 + Math.random() * 1.4));
  }

  setRoom(room: ChapterId): void {
    if (room === this.room) return;
    this.room = room;
    this.applyRoom();
    this.scheduleCrackle();
  }

  toggle(): boolean {
    if (!this.init() || !this.ctx || !this.master) return false;
    this.enabled = !this.enabled;
    void this.ctx.resume();
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(this.enabled ? 0.32 : 0, this.ctx.currentTime + 1.1);
    try {
      window.localStorage.setItem(PREF_KEY, this.enabled ? 'on' : 'off');
    } catch {
      /* preference simply is not remembered */
    }
    this.scheduleCrackle();
    return this.enabled;
  }

  // ------------------------------------------------------------------ primitives

  private burst(freq: number, dur: number, vol: number, type: BiquadFilterType, send = 0.2, q = 1.4): void {
    if (!this.ctx || !this.master || !this.reverb) return;
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.value = vol;
    src.connect(f).connect(g).connect(this.master);
    if (send > 0) {
      const s = ctx.createGain();
      s.gain.value = send;
      g.connect(s).connect(this.reverb);
    }
    src.start();
  }

  private ring(freq: number, dur: number, vol: number, send = 0.25): void {
    if (!this.ctx || !this.master || !this.reverb) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(this.master);
    const s = ctx.createGain();
    s.gain.value = send;
    g.connect(s).connect(this.reverb);
    o.start();
    o.stop(ctx.currentTime + dur + 0.02);
  }

  private creak(dur: number, vol: number): void {
    if (!this.ctx || !this.master || !this.reverb) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    const base = 90 + Math.random() * 30;
    o.frequency.setValueAtTime(base, ctx.currentTime);
    // stick-slip: the pitch stutters rather than gliding
    for (let i = 1; i < 10; i++) {
      o.frequency.setValueAtTime(base * (1 + Math.sin(i * 1.7) * 0.18 + i * 0.03), ctx.currentTime + (dur * i) / 10);
    }
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1100;
    bp.Q.value = 6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.linearRampToValueAtTime(vol, ctx.currentTime + dur * 0.15);
    g.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(bp).connect(g).connect(this.master);
    const s = ctx.createGain();
    s.gain.value = 0.3;
    g.connect(s).connect(this.reverb);
    o.start();
    o.stop(ctx.currentTime + dur + 0.05);
  }

  // ------------------------------------------------------------------ cues

  cue(kind: Cue): void {
    if (!this.enabled || !this.ctx) return;
    const now = performance.now();
    const min: Partial<Record<Cue, number>> = { click: 60, paper: 90, type: 25, latch: 120 };
    if (now - (this.lastCue.get(kind) ?? 0) < (min[kind] ?? 160)) return;
    this.lastCue.set(kind, now);

    switch (kind) {
      case 'latch':
        // spring-loaded brass: sharp transient, a short metallic ring, a dull body knock
        this.burst(5200, 0.012, 0.16, 'highpass', 0.1);
        this.ring(3150 + Math.random() * 120, 0.18, 0.05);
        this.ring(4720, 0.09, 0.025);
        window.setTimeout(() => this.burst(380, 0.06, 0.1, 'lowpass', 0.15), 14);
        break;
      case 'hinge':
        this.creak(0.9, 0.035);
        break;
      case 'leather':
        this.burst(900, 0.55, 0.05, 'bandpass', 0.15, 0.7);
        break;
      case 'thud':
        this.burst(120, 0.22, 0.2, 'lowpass', 0.35);
        this.ring(68, 0.26, 0.09, 0.2);
        break;
      case 'unfold':
        this.burst(4200, 0.18, 0.05, 'highpass', 0.12);
        window.setTimeout(() => this.burst(3000, 0.24, 0.04, 'highpass', 0.12), 140);
        window.setTimeout(() => this.burst(2400, 0.2, 0.03, 'highpass', 0.12), 330);
        break;
      case 'folder':
        this.burst(700, 0.2, 0.06, 'bandpass', 0.15, 0.8);
        window.setTimeout(() => this.burst(3600, 0.12, 0.03, 'highpass', 0.1), 90);
        break;
      case 'seal':
        this.burst(1600, 0.03, 0.12, 'bandpass', 0.1, 2.4);
        window.setTimeout(() => this.burst(1100, 0.05, 0.08, 'bandpass', 0.1, 2), 38);
        break;
      case 'paper':
        this.burst(3800, 0.09, 0.03, 'highpass', 0.08);
        break;
      case 'drawer':
        this.burst(260, 0.45, 0.07, 'lowpass', 0.2);
        window.setTimeout(() => this.burst(140, 0.12, 0.08, 'lowpass', 0.25), 400);
        break;
      case 'type':
        this.burst(2600, 0.018, 0.07, 'highpass', 0.05);
        window.setTimeout(() => this.burst(240, 0.05, 0.05, 'lowpass', 0.08), 14);
        break;
      case 'key':
        this.ring(1800, 0.08, 0.03);
        break;
      case 'nav':
        this.burst(180, 0.9, 0.05, 'lowpass', 0.5);
        break;
      case 'door':
        this.creak(1.4, 0.03);
        window.setTimeout(() => this.burst(90, 0.6, 0.1, 'lowpass', 0.5), 900);
        break;
      case 'click':
        this.burst(2200, 0.01, 0.04, 'highpass', 0);
        break;
    }
  }
}

export const audio = new AudioEngine();
export const chime = (kind: Cue): void => audio.cue(kind);
/** Kept for older call sites. */
export const ambience = audio;
