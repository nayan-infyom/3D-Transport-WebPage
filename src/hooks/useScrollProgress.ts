import { useState, useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // 1. Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    lenis.on('scroll', () => {
      ScrollTrigger.update();
    });

    const updateLenisTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenisTicker);
    gsap.ticker.lagSmoothing(0);

    // 2. Global ScrollTrigger for 3D Camera & Story Sync
    const globalTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      },
    });

    // 3. Normalized Mouse Parallax Listener
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      setMouseCoords({ x: normX, y: normY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      gsap.ticker.remove(updateLenisTicker);
      globalTrigger.kill();
      lenis.destroy();
    };
  }, []);

  return { scrollProgress, mouseCoords };
}
