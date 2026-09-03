import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CHAPTERS } from '../../config/timeline';
import { COMPANY_INFO } from '../../data/companyData';
import { seekToProgress, useStoryState } from '../../hooks/useStoryState';
import { scrollState } from '../../systems/core/scrollStore';
import { AudioToggle } from './AudioToggle';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The interface.
 *
 * Editorial, quiet, and deliberately not a dashboard: a wordmark, a chapter
 * rail you can actually navigate with, one headline per act and a closing
 * call to action. The continuously-changing parts write straight to the DOM so
 * that scrolling never re-renders React.
 */
export function CinematicOverlay() {
  const story = useStoryState();
  const railRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const p = scrollState.progress;
      if (railRef.current) railRef.current.style.transform = 'scaleY(' + p.toFixed(4) + ')';
      if (readoutRef.current) {
        readoutRef.current.textContent = String(Math.round(p * 100)).padStart(2, '0');
      }
      if (scrollHintRef.current) {
        scrollHintRef.current.style.opacity = String(Math.max(0, 1 - p * 18));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const chapter = CHAPTERS[story.chapterIndex];

  return (
    <div className="pointer-events-none fixed inset-0 z-40 text-[#F4F2EE]">
      {/* Legibility scrim - the type has to survive both a black warehouse
          and a white noon sky. */}
      <div
        className="absolute inset-x-0 top-0 h-44"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0))' }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-56"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))' }}
        aria-hidden="true"
      />

      <div className="relative flex h-full flex-col justify-between p-5 md:p-10">
        <header className="flex items-start justify-between">
          <a
            href="#story"
            className="pointer-events-auto flex flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            <span className="font-display text-xl font-black tracking-tighter md:text-2xl">
              NORTHLINE
            </span>
            <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.34em] opacity-70">
              Transport
            </span>
          </a>

          <div className="flex items-center gap-3 md:gap-5">
            <nav aria-label="Journey chapters" className="hidden md:block">
              <ul className="flex gap-7">
                {CHAPTERS.map((c, index) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => seekToProgress(c.start + (c.end - c.start) * 0.35)}
                      aria-current={index === story.chapterIndex ? 'true' : undefined}
                      className={
                        'pointer-events-auto text-[10px] font-semibold uppercase tracking-[0.24em] transition-opacity duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ' +
                        (index === story.chapterIndex ? 'opacity-100' : 'opacity-45 hover:opacity-80')
                      }
                    >
                      {c.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <AudioToggle />
          </div>
        </header>

        {/* Chapter headline */}
        <div className="pointer-events-none absolute left-5 top-[26%] max-w-[92vw] md:left-10 md:max-w-4xl">
          <AnimatePresence mode="wait">
            {story.scene.headline && (
              <motion.div
                key={story.scene.id}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 1.1, ease: EASE }}
                className="flex flex-col gap-3"
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.4em] opacity-70">
                  {chapter.id} — Chapter
                </span>
                <h2 className="font-display font-black tracking-tighter"
                  style={{ fontSize: 'clamp(2.75rem, 11vw, 9rem)', lineHeight: 0.86 }}>
                  {story.scene.headline}
                </h2>
                {story.scene.caption && (
                  <p className="max-w-md text-xs font-light uppercase tracking-[0.18em] opacity-80 md:text-sm">
                    {story.scene.caption}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="flex items-end justify-between gap-6">
          {/* Chapter rail */}
          <div className="flex items-center gap-4">
            <div className="relative h-28 w-[2px] bg-white/20 md:h-40" aria-hidden="true">
              <div
                ref={railRef}
                className="absolute inset-x-0 top-0 h-full origin-top bg-white"
                style={{ transform: 'scaleY(0)' }}
              />
            </div>
            <ol className="flex flex-col gap-2">
              {CHAPTERS.map((c, index) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => seekToProgress(c.start + (c.end - c.start) * 0.35)}
                    aria-current={index === story.chapterIndex ? 'step' : undefined}
                    className="pointer-events-auto flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    <span
                      className={
                        'font-mono text-[10px] tracking-[0.2em] transition-opacity duration-500 ' +
                        (index === story.chapterIndex ? 'opacity-100' : 'opacity-35')
                      }
                    >
                      {c.id}
                    </span>
                    <span
                      className={
                        'h-px bg-white transition-all duration-700 ' +
                        (index === story.chapterIndex ? 'w-10 opacity-100' : 'w-3 opacity-30')
                      }
                      aria-hidden="true"
                    />
                    <span
                      className={
                        'text-[9px] font-semibold uppercase tracking-[0.28em] transition-opacity duration-500 md:text-[10px] ' +
                        (index === story.chapterIndex ? 'opacity-90' : 'opacity-0 md:opacity-25')
                      }
                    >
                      {c.title}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col items-end gap-4 text-right">
            <span className="font-mono text-[10px] tracking-[0.2em] opacity-55">
              <span ref={readoutRef}>00</span> / 100
            </span>

            <AnimatePresence>
              {story.finished && (
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.9, ease: EASE }}
                  className="pointer-events-auto flex flex-col items-end gap-4 bg-[#111315]/92 p-6 backdrop-blur-sm md:p-9"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-[0.34em] opacity-55">
                    Ready to move freight?
                  </span>
                  <a
                    href={'mailto:' + COMPANY_INFO.email}
                    className="font-display text-xl font-black tracking-tighter transition-colors duration-300 hover:text-[#E56B2F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:text-3xl"
                  >
                    Start a conversation →
                  </a>
                  <span className="font-mono text-[10px] opacity-55">
                    {COMPANY_INFO.dispatchPhone} · {COMPANY_INFO.dotNumber}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </footer>
      </div>

      {/* Scroll invitation */}
      <div
        ref={scrollHintRef}
        className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 opacity-100"
      >
        <span className="text-[9px] font-medium uppercase tracking-[0.44em] opacity-70">Scroll</span>
        <span className="h-10 w-px bg-white/40" aria-hidden="true" />
      </div>
    </div>
  );
}
