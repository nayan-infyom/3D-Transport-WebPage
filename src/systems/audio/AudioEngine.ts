import type { EnvironmentZone } from '../../config/timeline';

interface AmbienceProfile {
  /** Cutoff of the broadband bed, Hz. */
  cutoff: number;
  bedGain: number;
  /** Low industrial drone. */
  droneHz: number;
  droneGain: number;
}

const AMBIENCE: Record<EnvironmentZone, AmbienceProfile> = {
  warehouse: { cutoff: 420, bedGain: 0.05, droneHz: 58, droneGain: 0.05 },
  highway: { cutoff: 1600, bedGain: 0.05, droneHz: 42, droneGain: 0.012 },
  transfer: { cutoff: 700, bedGain: 0.05, droneHz: 66, droneGain: 0.042 },
  port: { cutoff: 520, bedGain: 0.07, droneHz: 34, droneGain: 0.075 },
};

export interface AudioInput {
  speed: number;
  rpm: number;
  load: number;
  zone: EnvironmentZone;
  /** 0..1, the world is dark and the port machinery is running. */
  night: number;
}

/**
 * Cinematic audio bed, synthesised entirely in the Web Audio graph.
 *
 * There are no audio files to ship: the diesel is a stack of detuned saws under
 * a moving low-pass, tyre roar and wind are shaped noise, and the air brake and
 * kingpin latch are one-shot envelopes. Everything tracks real vehicle state,
 * so the mix rises and falls with the truck rather than with the clock.
 *
 * Nothing is created until the user has interacted, per autoplay policy.
 */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;

  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private oscA: OscillatorNode | null = null;
  private oscB: OscillatorNode | null = null;
  private rumble: OscillatorNode | null = null;
  private rumbleGain: GainNode | null = null;

  private tyreGain: GainNode | null = null;
  private tyreFilter: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;

  private bedGain: GainNode | null = null;
  private bedFilter: BiquadFilterNode | null = null;
  private droneOsc: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;

  private noiseBuffer: AudioBuffer | null = null;
  private started = false;
  private muted = true;

  get isRunning() {
    return this.started && !this.muted;
  }

  get isStarted() {
    return this.started;
  }

  /** Must be called from a user gesture. Safe to call repeatedly. */
  start() {
    if (this.started) {
      void this.ctx?.resume();
      return;
    }
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;

    try {
      const ctx = new Ctor();
      this.ctx = ctx;

      const master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
      this.master = master;

      this.noiseBuffer = this.createNoiseBuffer(ctx);

      /* ---- Diesel engine: two detuned saws + a sub rumble ---- */
      const engineFilter = ctx.createBiquadFilter();
      engineFilter.type = 'lowpass';
      engineFilter.frequency.value = 180;
      engineFilter.Q.value = 3.2;

      const engineGain = ctx.createGain();
      engineGain.gain.value = 0.0001;
      engineFilter.connect(engineGain);
      engineGain.connect(master);

      const oscA = ctx.createOscillator();
      oscA.type = 'sawtooth';
      oscA.frequency.value = 26;
      const oscB = ctx.createOscillator();
      oscB.type = 'sawtooth';
      oscB.frequency.value = 26 * 1.503;
      const oscBGain = ctx.createGain();
      oscBGain.gain.value = 0.4;
      oscA.connect(engineFilter);
      oscB.connect(oscBGain);
      oscBGain.connect(engineFilter);
      oscA.start();
      oscB.start();

      const rumble = ctx.createOscillator();
      rumble.type = 'sine';
      rumble.frequency.value = 44;
      const rumbleGain = ctx.createGain();
      rumbleGain.gain.value = 0.0001;
      rumble.connect(rumbleGain);
      rumbleGain.connect(master);
      rumble.start();

      /* ---- Tyre roar + wind ---- */
      const tyreFilter = ctx.createBiquadFilter();
      tyreFilter.type = 'bandpass';
      tyreFilter.frequency.value = 260;
      tyreFilter.Q.value = 0.9;
      const tyreGain = ctx.createGain();
      tyreGain.gain.value = 0.0001;
      tyreFilter.connect(tyreGain);
      tyreGain.connect(master);
      this.playNoise(ctx, tyreFilter);

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'highpass';
      windFilter.frequency.value = 900;
      const windGain = ctx.createGain();
      windGain.gain.value = 0.0001;
      windFilter.connect(windGain);
      windGain.connect(master);
      this.playNoise(ctx, windFilter);

      /* ---- Location ambience bed + industrial drone ---- */
      const bedFilter = ctx.createBiquadFilter();
      bedFilter.type = 'lowpass';
      bedFilter.frequency.value = 500;
      const bedGain = ctx.createGain();
      bedGain.gain.value = 0.0001;
      bedFilter.connect(bedGain);
      bedGain.connect(master);
      this.playNoise(ctx, bedFilter);

      const droneOsc = ctx.createOscillator();
      droneOsc.type = 'triangle';
      droneOsc.frequency.value = 58;
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.0001;
      droneOsc.connect(droneGain);
      droneGain.connect(master);
      droneOsc.start();

      this.engineGain = engineGain;
      this.engineFilter = engineFilter;
      this.oscA = oscA;
      this.oscB = oscB;
      this.rumble = rumble;
      this.rumbleGain = rumbleGain;
      this.tyreGain = tyreGain;
      this.tyreFilter = tyreFilter;
      this.windGain = windGain;
      this.windFilter = windFilter;
      this.bedGain = bedGain;
      this.bedFilter = bedFilter;
      this.droneOsc = droneOsc;
      this.droneGain = droneGain;

      this.started = true;
    } catch {
      this.started = false;
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.ctx || !this.master) return;
    if (!muted) void this.ctx.resume();
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(muted ? 0 : 0.55, now, 0.4);
  }

  update(input: AudioInput) {
    if (!this.started || !this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const tau = 0.12;
    const speed = Math.min(Math.abs(input.speed), 34);
    const speedNorm = speed / 30;

    // Engine: fundamental follows firing frequency, filter opens under load.
    const fundamental = 16 + (input.rpm / 60) * 1.35;
    this.oscA?.frequency.setTargetAtTime(fundamental, now, 0.08);
    this.oscB?.frequency.setTargetAtTime(fundamental * 1.503, now, 0.08);
    this.engineFilter?.frequency.setTargetAtTime(150 + input.load * 620, now, tau);
    this.engineGain?.gain.setTargetAtTime(0.055 + input.load * 0.1, now, tau);
    this.rumble?.frequency.setTargetAtTime(fundamental * 1.9, now, 0.1);
    this.rumbleGain?.gain.setTargetAtTime(0.05 + input.load * 0.06, now, tau);

    // Tyres and wind are pure speed.
    this.tyreFilter?.frequency.setTargetAtTime(180 + speedNorm * 620, now, tau);
    this.tyreGain?.gain.setTargetAtTime(speedNorm * 0.16, now, tau);
    this.windGain?.gain.setTargetAtTime(Math.pow(speedNorm, 2) * 0.09, now, tau);

    // Location bed.
    const profile = AMBIENCE[input.zone];
    this.bedFilter?.frequency.setTargetAtTime(profile.cutoff, now, 0.9);
    this.bedGain?.gain.setTargetAtTime(profile.bedGain, now, 0.9);
    this.droneOsc?.frequency.setTargetAtTime(profile.droneHz, now, 0.9);
    this.droneGain?.gain.setTargetAtTime(profile.droneGain * (0.6 + input.night * 0.7), now, 0.9);
  }

  /** Sharp pneumatic release. */
  airBrake() {
    const ctx = this.ctx;
    if (!ctx || !this.master || this.muted || !this.noiseBuffer) return;
    const now = ctx.currentTime;

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.1;
    filter.frequency.setValueAtTime(2600, now);
    filter.frequency.exponentialRampToValueAtTime(420, now + 0.55);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.34, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start(now);
    src.stop(now + 0.8);
    src.onended = () => {
      src.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  /** Steel on steel: the kingpin dropping into the jaws. */
  couple() {
    const ctx = this.ctx;
    if (!ctx || !this.master || this.muted || !this.noiseBuffer) return;
    const now = ctx.currentTime;

    const thump = ctx.createOscillator();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(140, now);
    thump.frequency.exponentialRampToValueAtTime(48, now + 0.22);
    const thumpGain = ctx.createGain();
    thumpGain.gain.setValueAtTime(0.0001, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.5, now + 0.012);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    thump.connect(thumpGain);
    thumpGain.connect(this.master);
    thump.start(now);
    thump.stop(now + 0.5);

    const click = ctx.createBufferSource();
    click.buffer = this.noiseBuffer;
    const clickFilter = ctx.createBiquadFilter();
    clickFilter.type = 'bandpass';
    clickFilter.frequency.value = 2200;
    clickFilter.Q.value = 2.4;
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.0001, now);
    clickGain.gain.exponentialRampToValueAtTime(0.24, now + 0.006);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    click.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(this.master);
    click.start(now);
    click.stop(now + 0.2);
    click.onended = () => {
      click.disconnect();
      clickFilter.disconnect();
      clickGain.disconnect();
      thump.disconnect();
      thumpGain.disconnect();
    };
  }

  dispose() {
    try {
      this.oscA?.stop();
      this.oscB?.stop();
      this.rumble?.stop();
      this.droneOsc?.stop();
      void this.ctx?.close();
    } catch {
      /* teardown is best-effort */
    }
    this.started = false;
    this.ctx = null;
  }

  private createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099;
      b1 = 0.963 * b1 + white * 0.2965;
      b2 = 0.57 * b2 + white * 1.0526;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.16;
    }
    return buffer;
  }

  private playNoise(ctx: AudioContext, destination: AudioNode) {
    if (!this.noiseBuffer) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    src.connect(destination);
    src.start();
  }
}
