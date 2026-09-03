import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CinematicOverlayProps {
  scrollProgress: number;
}

const CHAPTERS = [
  { id: '01', title: 'ORIGIN', range: [0.0, 0.15], text: "ORIGIN", sub: "Every journey starts somewhere." },
  { id: '02', title: 'PREPARATION', range: [0.15, 0.22], text: "", sub: "" }, // Silent
  { id: '03', title: 'DEPARTURE', range: [0.22, 0.32], text: "", sub: "" }, // Silent
  { id: '04', title: 'JOURNEY', range: [0.32, 0.52], text: "", sub: "" }, // Silent
  { id: '05', title: 'TRANSFER', range: [0.52, 0.68], text: "TRANSFER", sub: "Precision in motion." },
  { id: '06', title: 'JOURNEY II', range: [0.68, 0.85], text: "", sub: "" }, // Silent
  { id: '07', title: 'DESTINATION', range: [0.85, 0.95], text: "DESTINATION", sub: "Scale meets speed." },
  { id: '08', title: 'DELIVERY', range: [0.95, 1.00], text: "DELIVERED.", sub: "From origin to destination." },
];

export function CinematicOverlay({ scrollProgress }: CinematicOverlayProps) {
  const currentChapter = CHAPTERS.find(c => scrollProgress >= c.range[0] && scrollProgress <= c.range[1]) || CHAPTERS[CHAPTERS.length - 1];

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex flex-col justify-between p-6 md:p-12">
      
      {/* Top Header - Editorial & Minimal */}
      <header className="flex items-start justify-between mix-blend-difference text-white">
        <div className="flex flex-col">
          <span className="text-xl md:text-2xl font-black tracking-tighter">NORTHLINE</span>
          <span className="text-[10px] font-medium tracking-[0.3em] text-white/70 uppercase mt-1">Logistics</span>
        </div>
        
        <nav className="hidden md:flex gap-12 text-xs font-semibold tracking-[0.2em]">
          <span className="pointer-events-auto cursor-pointer hover:text-white/60 transition-colors">ABOUT</span>
          <span className="pointer-events-auto cursor-pointer hover:text-white/60 transition-colors">SERVICES</span>
          <span className="pointer-events-auto cursor-pointer hover:text-white/60 transition-colors">NETWORK</span>
          <span className="pointer-events-auto cursor-pointer hover:text-white/60 transition-colors">CONTACT</span>
        </nav>
      </header>

      {/* Cinematic Typography - Only appears for specific chapters */}
      <div className="absolute top-[20%] left-6 md:left-12 flex flex-col mix-blend-difference text-white max-w-4xl">
        <AnimatePresence mode="wait">
          {currentChapter.text && (
            <motion.div
              key={currentChapter.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-4"
            >
              <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-none">
                {currentChapter.text}
              </h1>
              {currentChapter.sub && (
                <p className="text-sm md:text-lg font-light tracking-[0.2em] text-white/80 ml-2 uppercase">
                  {currentChapter.sub}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Footer & Chapter Tracker */}
      <footer className="flex items-end justify-between mix-blend-difference text-white">
        <div className="flex flex-col gap-3">
          {CHAPTERS.map((chap) => (
            <div key={chap.id} className="flex items-center gap-6 opacity-80">
              <span className={`text-[10px] font-semibold tracking-[0.3em] transition-colors duration-700 ${currentChapter.id === chap.id ? 'text-white' : 'text-white/30'}`}>
                {chap.id}
              </span>
              <div className={`h-[1px] transition-all duration-700 ${currentChapter.id === chap.id ? 'w-12 bg-white' : 'w-4 bg-white/20'}`} />
            </div>
          ))}
        </div>
        
        {/* CTA reveals at end */}
        <AnimatePresence>
          {scrollProgress > 0.95 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pointer-events-auto flex flex-col items-end gap-6 mix-blend-normal bg-[#111315] p-8 md:p-12 text-white"
            >
              <span className="text-[10px] font-semibold tracking-[0.3em] text-white/50">READY TO MOVE?</span>
              <button className="text-lg md:text-2xl font-black tracking-tighter hover:text-[#E56B2F] transition-colors duration-300">
                START A CONVERSATION →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>

      {/* Global Scroll Indicator */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 mix-blend-difference text-white opacity-50">
        <span className="text-[9px] font-medium tracking-[0.4em] uppercase">Scroll</span>
        <div className="w-[1px] h-12 bg-white/30 overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 w-full bg-white"
            style={{ height: `${scrollProgress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
