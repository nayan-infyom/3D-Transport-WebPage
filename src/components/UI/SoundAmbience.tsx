import { useRef, useEffect } from 'react';

interface SoundAmbienceProps {
  isPlaying: boolean;
  scrollSpeed?: number;
}

export function SoundAmbience({ isPlaying }: SoundAmbienceProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const engineOscRef = useRef<OscillatorNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (isPlaying) {
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioContextClass) return;
          audioCtxRef.current = new AudioContextClass();
        }

        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        // Master Volume Gain
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 1.5);
        masterGain.connect(ctx.destination);
        masterGainRef.current = masterGain;

        // 1. Low-Frequency Diesel Engine Rumble (Subtle 42Hz + 84Hz harmonic)
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(46, ctx.currentTime);

        const engineFilter = ctx.createBiquadFilter();
        engineFilter.type = 'lowpass';
        engineFilter.frequency.setValueAtTime(95, ctx.currentTime);

        const engineGain = ctx.createGain();
        engineGain.gain.setValueAtTime(0.35, ctx.currentTime);

        osc.connect(engineFilter);
        engineFilter.connect(engineGain);
        engineGain.connect(masterGain);
        osc.start();
        engineOscRef.current = osc;

        // 2. Pink/Brown Highway Road & Wind Noise
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99 * b0 + white * 0.05;
          b1 = 0.95 * b1 + white * 0.03;
          b2 = 0.85 * b2 + white * 0.01;
          output[i] = (b0 + b1 + b2) * 0.5;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(220, ctx.currentTime);
        noiseFilter.Q.setValueAtTime(1.2, ctx.currentTime);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.2, ctx.currentTime);

        whiteNoise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);
        whiteNoise.start();
        noiseSourceRef.current = whiteNoise;
      } catch (err) {
        console.warn('Audio Ambience initialization deferred:', err);
      }
    } else {
      // Fade out and stop
      if (audioCtxRef.current && masterGainRef.current) {
        try {
          const ctx = audioCtxRef.current;
          masterGainRef.current.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          setTimeout(() => {
            if (engineOscRef.current) {
              try { engineOscRef.current.stop(); } catch (_) {}
              engineOscRef.current = null;
            }
            if (noiseSourceRef.current) {
              try { noiseSourceRef.current.stop(); } catch (_) {}
              noiseSourceRef.current = null;
            }
          }, 600);
        } catch (_) {}
      }
    }

    return () => {
      if (engineOscRef.current) {
        try { engineOscRef.current.stop(); } catch (_) {}
      }
      if (noiseSourceRef.current) {
        try { noiseSourceRef.current.stop(); } catch (_) {}
      }
    };
  }, [isPlaying]);

  return null;
}
