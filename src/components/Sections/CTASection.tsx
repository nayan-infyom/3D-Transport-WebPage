import { ArrowUpRight, Phone, Mail, Shield, CheckCircle } from 'lucide-react';
import { COMPANY_INFO } from '../../data/companyData';

interface CTASectionProps {
  onOpenQuote: () => void;
  onOpenContact: () => void;
}

export function CTASection({ onOpenQuote, onOpenContact }: CTASectionProps) {
  return (
    <section
      id="cta"
      className="relative min-h-screen w-full flex flex-col justify-center py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 pointer-events-none"
    >
      <div className="bg-[#F7F5F0]/90 backdrop-blur-md border border-[#171A1C]/10 p-8 sm:p-14 lg:p-16 text-center max-w-4xl mx-auto pointer-events-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E9E6DE] text-[#171A1C] text-[10px] font-mono uppercase tracking-widest font-bold mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E56B2F]"></span>
          <span>SECTION 07 — READY FOR DISPATCH</span>
        </div>

        <h2 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#171A1C] leading-[0.98] mb-6">
          Let’s Move Your <br />
          <span className="text-[#E56B2F]">Business Forward.</span>
        </h2>

        <p className="font-sans text-base sm:text-xl text-[#5E6468] max-w-2xl mx-auto leading-relaxed mb-10">
          Tell us what you’re moving, where it’s going, and when it needs to arrive. Our 24/7 centralized dispatch locks guaranteed capacity within 15 minutes.
        </p>

        {/* Dual CTA Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <button
            id="final-request-quote-btn"
            onClick={onOpenQuote}
            className="group px-8 py-4 bg-[#E56B2F] text-white font-editorial text-xs font-bold uppercase tracking-wider flex items-center gap-3 hover:bg-[#171A1C] transition-all duration-300 shadow-xl cursor-pointer"
          >
            <span>Request Instant Quote</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>

          <button
            id="final-talk-team-btn"
            onClick={onOpenContact}
            className="px-8 py-4 bg-white border border-[#171A1C]/25 text-[#171A1C] font-mono text-xs font-semibold uppercase tracking-wider hover:border-[#171A1C] hover:bg-[#F7F5F0] transition-colors cursor-pointer flex items-center gap-2"
          >
            <Phone className="w-4 h-4 text-[#E56B2F]" />
            <span>Talk to Our Team ({COMPANY_INFO.dispatchPhone})</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="pt-8 border-t border-[#171A1C]/10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 font-mono text-xs text-[#5E6468]">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Direct Asset Carrier</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>15-Minute Rate Lock</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>No Hidden Surcharges</span>
          </div>
        </div>
      </div>
    </section>
  );
}
