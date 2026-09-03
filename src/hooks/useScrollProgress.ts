import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { markInteracted, scrollDriver, scrollState } from '../systems/core/scrollStore';

gsap.registerPlugin(ScrollTrigger);

/**
 * Drives the cinematic timeline from the page scroll.
 *
 * Lenis + ScrollTrigger (kept from the original implementation - the smoothing
 * feel was already right) now write into a module-level store instead of React
 * state. Scrolling therefore never re-renders the WebGL tree; the scene reads
 * the value inside its own frame loop.
 */
export function useScrollProgress() {
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    scrollState.reducedMotion = motionQuery.matches;
    const onMotionChange = (e: MediaQueryListEvent) => {
      scrollState.reducedMotion = e.matches;
    };
    motionQuery.addEventListener('change', onMotionChange);

    let lenis: Lenis | null = null;
    let tickerCallback: ((time: number) => void) | null = null;

    if (!scrollState.reducedMotion) {
      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.9,
      });
      lenis.on('scroll', ScrollTrigger.update);
      tickerCallback = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
      const instance = lenis;
      scrollDriver.current = { scrollTo: (target) => instance.scrollTo(target, { duration: 1.6 }) };
    } else {
      scrollDriver.current = { scrollTo: (target) => window.scrollTo({ top: target }) };
    }

    let lastProgress = 0;
    let lastTime = performance.now();

    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        const now = performance.now();
        const dt = Math.max(1, now - lastTime) / 1000;
        scrollState.velocity = (self.progress - lastProgress) / dt;
        scrollState.progress = self.progress;
        lastProgress = self.progress;
        lastTime = now;
      },
    });

    const onPointerMove = (e: PointerEvent) => {
      scrollState.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      scrollState.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    const interactionEvents: (keyof WindowEventMap)[] = [
      'wheel',
      'touchstart',
      'pointerdown',
      'keydown',
    ];
    const onInteract = () => markInteracted();

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    interactionEvents.forEach((name) =>
      window.addEventListener(name, onInteract, { passive: true })
    );

    return () => {
      motionQuery.removeEventListener('change', onMotionChange);
      window.removeEventListener('pointermove', onPointerMove);
      interactionEvents.forEach((name) => window.removeEventListener(name, onInteract));
      scrollDriver.current = null;
      trigger.kill();
      if (tickerCallback) gsap.ticker.remove(tickerCallback);
      lenis?.destroy();
    };
  }, []);
}
