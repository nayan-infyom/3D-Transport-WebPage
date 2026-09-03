import { ArrowDown, ArrowUpRight, Shield, Zap, Compass } from 'lucide-react';
import { COMPANY_INFO } from '../../data/companyData';

interface HeroOverlayProps {
  onOpenQuote: () => void;
  onOpenContact: () => void;
}

export function HeroOverlay({ onOpenQuote, onOpenContact }: HeroOverlayProps) {
  const scrollToNext = () => {
    const nextSection = document.getElementById('journey');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex flex-col justify-between pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 pointer-events-none select-none"
    >
      {/* Top Editorial Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#171A1C]/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono font-semibold tracking-widest text-[#E56B2F] uppercase">
            EST. 2012
          </span>
          <span className="text-[#171A1C]/20">/</span>
          <span className="text-[11px] font-mono text-[#5E6468] uppercase tracking-wider">
            {COMPANY_INFO.dotNumber}
          </span>
          <span className="text-[#171A1C]/20">/</span>
          <span className="text-[11px] font-mono text-[#5E6468] uppercase tracking-wider">
            {COMPANY_INFO.mcNumber}
          </span>
        </div>

        <div className="flex items-center gap-6 text-[11px] font-mono text-[#5E6468]">
          <div className="hidden sm:flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#6F806D]" />
            <span>SMARTWAY CERTIFIED</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            <span>NATIONWIDE POWER ONLY & FTL</span>
          </div>
        </div>
      </div>

      {/* Main Hero Headline Typography */}
      <div className="my-auto py-12 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E9E6DE]/80 border border-[#171A1C]/10 mb-6 backdrop-blur-sm">
          <Zap className="w-3 h-3 text-[#E56B2F]" />
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#171A1C]">
            COMMERCIAL TRANSPORTATION & LOGISTICS
          </span>
        </div>

        <h1 className="font-editorial text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tighter text-[#171A1C] leading-[0.92] mb-6">
          Moving <br />
          <span className="text-[#171A1C]">What</span>{' '}
          <span className="text-[#E56B2F] italic font-serif font-normal">Matters.</span>
        </h1>

        <p className="font-sans text-base sm:text-lg text-[#5E6468] max-w-xl font-normal leading-relaxed mb-8">
          Reliable line-haul transportation solutions engineered to keep America’s critical commerce and industrial supply chains moving without interruption.
        </p>

        {/* Hero CTA Controls (Pointer events enabled on buttons) */}
        <div className="flex flex-wrap items-center gap-4 pointer-events-auto">
          <button
            id="hero-request-quote-btn"
            onClick={onOpenQuote}
            className="group px-7 py-3.5 bg-[#171A1C] text-[#F7F5F0] font-editorial text-xs font-bold uppercase tracking-wider flex items-center gap-3 hover:bg-[#E56B2F] hover:shadow-[0_8px_24px_rgba(229,107,47,0.3)] transition-all duration-300 cursor-pointer"
          >
            <span>Request Instant Quote</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>

          <button
            id="hero-contact-dispatch-btn"
            onClick={onOpenContact}
            className="px-6 py-3.5 bg-[#F7F5F0]/80 backdrop-blur-md border border-[#171A1C]/25 text-[#171A1C] font-mono text-xs font-semibold uppercase tracking-wider hover:border-[#171A1C] hover:bg-[#F7F5F0] transition-colors cursor-pointer"
          >
            <span>24/7 Command Dispatch</span>
          </button>
        </div>
      </div>

      {/* Hero Bottom Bar with Scroll Indicator & Corridor Coordinates */}
      <div className="flex flex-wrap items-end justify-between gap-6 pt-6 border-t border-[#171A1C]/10">
        <div className="flex items-center gap-4 text-xs font-mono text-[#5E6468]">
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#E56B2F]" />
            <span>INTERSTATE CORRIDOR I-80 / I-35 / I-10</span>
          </div>
        </div>

        {/* Smooth Scroll Down Prompt */}
        <button
          onClick={scrollToNext}
          className="group flex items-center gap-2 pointer-events-auto cursor-pointer"
          aria-label="Scroll down to the journey section"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#5E6468] group-hover:text-[#171A1C] transition-colors">
            SCROLL TO EXPLORE
          </span>
          <div className="w-8 h-8 rounded-none border border-[#171A1C]/20 flex items-center justify-center group-hover:border-[#E56B2F] transition-colors bg-[#F7F5F0]/60">
            <ArrowDown className="w-3.5 h-3.5 text-[#171A1C] group-hover:text-[#E56B2F] group-hover:translate-y-0.5 transition-transform" />
          </div>
        </button>
      </div>
    </section>
  );
}
