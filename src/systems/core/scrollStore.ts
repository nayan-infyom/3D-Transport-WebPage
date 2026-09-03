/**
 * Module-level mutable scroll store.
 *
 * The 3D scene reads this every frame inside `useFrame`, which means scrolling
 * never triggers a React re-render of the WebGL tree. UI components that DO need
 * to react (chapter titles) subscribe with a coarse, quantised selector instead.
 */
export interface ScrollState {
  /** Normalised 0..1 progress through the cinematic timeline. */
  progress: number;
  /** Progress delta per second (signed). Used for motion-reactive effects. */
  velocity: number;
  /** Normalised pointer position, -1..1. */
  pointerX: number;
  pointerY: number;
  /** True once the user has interacted (required to unlock WebAudio). */
  hasInteracted: boolean;
  /** OS-level reduced-motion preference. */
  reducedMotion: boolean;
}

export const scrollState: ScrollState = {
  progress: 0,
  velocity: 0,
  pointerX: 0,
  pointerY: 0,
  hasInteracted: false,
  reducedMotion: false,
};

export interface ScrollDriver {
  scrollTo: (target: number) => void;
}

/** Set by the scroll hook so UI navigation goes through the same smoother. */
export const scrollDriver: { current: ScrollDriver | null } = { current: null };

type Listener = () => void;
const interactionListeners = new Set<Listener>();

export function markInteracted() {
  if (scrollState.hasInteracted) return;
  scrollState.hasInteracted = true;
  interactionListeners.forEach((l) => l());
  interactionListeners.clear();
}

export function onFirstInteraction(listener: Listener): () => void {
  if (scrollState.hasInteracted) {
    listener();
    return () => {};
  }
  interactionListeners.add(listener);
  return () => interactionListeners.delete(listener);
}
