import { useEffect, useRef, useState } from 'react';
import { CHAPTERS, SCENES, type SceneDef } from '../config/timeline';
import { scrollDriver, scrollState } from '../systems/core/scrollStore';

export interface StoryState {
  chapterIndex: number;
  scene: SceneDef;
  /** True once the user has scrolled past the very first frame. */
  started: boolean;
  finished: boolean;
}

function readStory(progress: number): StoryState {
  let chapterIndex = CHAPTERS.length - 1;
  for (let i = 0; i < CHAPTERS.length; i++) {
    if (progress < CHAPTERS[i].end) {
      chapterIndex = i;
      break;
    }
  }
  let scene = SCENES[SCENES.length - 1];
  for (let i = 0; i < SCENES.length; i++) {
    if (progress < SCENES[i].end) {
      scene = SCENES[i];
      break;
    }
  }
  return {
    chapterIndex,
    scene,
    started: progress > 0.004,
    finished: progress > 0.965,
  };
}

/**
 * Story state for the interface.
 *
 * The overlay only ever needs to know which chapter is playing, so this polls
 * the scroll store on a frame loop and re-renders *only* when that changes.
 * Continuous values (the progress rail) are written straight to the DOM by the
 * components that own them, never through React state.
 */
export function useStoryState(): StoryState {
  const [state, setState] = useState<StoryState>(() => readStory(scrollState.progress));
  const previous = useRef(state);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const next = readStory(scrollState.progress);
      const prev = previous.current;
      if (
        next.chapterIndex !== prev.chapterIndex ||
        next.scene.id !== prev.scene.id ||
        next.started !== prev.started ||
        next.finished !== prev.finished
      ) {
        previous.current = next;
        setState(next);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return state;
}

/** Scrolls the page to a given point on the story timeline. */
export function seekToProgress(progress: number) {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const target = max * Math.max(0, Math.min(1, progress));
  // Route through Lenis when it is running so the smoother and the native
  // scroll position never disagree.
  if (scrollDriver.current) scrollDriver.current.scrollTo(target);
  else window.scrollTo({ top: target, behavior: scrollState.reducedMotion ? 'auto' : 'smooth' });
}
