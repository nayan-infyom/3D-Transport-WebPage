import { ArrowUp, Phone, Mail, MapPin, Shield } from 'lucide-react';
import { COMPANY_INFO, SERVICES } from '../../data/companyData';

interface FooterProps {
  onOpenQuote: () => void;
  onOpenContact: () => void;
}

export function Footer({ onOpenQuote, onOpenContact }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#171A1C] text-[#F7F5F0] pt-16 pb-12 px-4 sm:px-6 lg:px-8 z-10 border-t border-[#171A1C]">
      <div className="max-w-7xl mx-auto">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Company Brand Identity (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#E56B2F] text-white font-bold flex items-center justify-center font-mono text-base">
                NL
              </div>
              <span className="font-editorial text-xl font-bold tracking-tight text-white">
                NORTHLINE TRANSPORT
              </span>
            </div>

            <p className="text-xs text-[#D8D4C9] font-sans leading-relaxed max-w-sm">
              {COMPANY_INFO.subheadline}
            </p>

            <div className="space-y-1 font-mono text-[11px] text-white/50 pt-2">
              <div>FEDERAL MOTOR CARRIER REG: {COMPANY_INFO.dotNumber}</div>
              <div>OPERATING AUTHORITY: {COMPANY_INFO.mcNumber}</div>
              <div>SMARTWAY TRANSPORT PARTNER ID: #90412</div>
            </div>
          </div>

          {/* Quick Line-Haul Services (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-[#E56B2F]">
              TRANSPORTATION MODES
            </h4>
            <ul className="space-y-2 text-xs font-sans text-[#D8D4C9]">
              {SERVICES.map((srv) => (
                <li key={srv.id}>
                  <button
                    onClick={onOpenQuote}
                    className="hover:text-[#E56B2F] transition-colors text-left"
                  >
                    {srv.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Terminal Hubs (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-[#E56B2F]">
              KEY HUBS
            </h4>
            <ul className="space-y-1.5 font-mono text-xs text-[#D8D4C9]">
              <li>Chicago Central (ORD)</li>
              <li>Dallas Logistics (DFW)</li>
              <li>Los Angeles (LAX)</li>
              <li>Atlanta Southeast (ATL)</li>
              <li>New York / NJ Port (JFK)</li>
              <li>Seattle Pacific (SEA)</li>
            </ul>
          </div>

          {/* 24/7 Command Dispatch (3 cols) */}
          <div className="lg:col-span-3 space-y-4 bg-white/5 p-5 border border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-white">
                24/7 DISPATCH COMMAND
              </h4>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-white">
                <Phone className="w-3.5 h-3.5 text-[#E56B2F]" />
                <a href={`tel:${COMPANY_INFO.dispatchPhone}`} className="hover:text-[#E56B2F] font-bold">
                  {COMPANY_INFO.dispatchPhone}
                </a>
              </div>
              <div className="flex items-center gap-2 text-[#D8D4C9]">
                <Mail className="w-3.5 h-3.5 text-[#E56B2F]" />
                <span>{COMPANY_INFO.email}</span>
              </div>
              <div className="flex items-start gap-2 text-[#D8D4C9] text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-[#E56B2F] shrink-0 mt-0.5" />
                <span>{COMPANY_INFO.headquarters}</span>
              </div>
            </div>

            <button
              onClick={onOpenQuote}
              className="w-full py-2.5 bg-[#E56B2F] text-white font-editorial text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-[#171A1C] transition-colors"
            >
              Instant Lane Quote
            </button>
          </div>
        </div>

        {/* Bottom Legal & Back to Top Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-white/50">
          <div>
            © {new Date().getFullYear()} {COMPANY_INFO.legalName}. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onOpenContact} className="hover:text-white transition-colors">
              Driver Careers
            </button>
            <button onClick={onOpenContact} className="hover:text-white transition-colors">
              Carrier Safety SLA
            </button>
            <button onClick={onOpenContact} className="hover:text-white transition-colors">
              Terms of Carriage
            </button>
            <button
              onClick={scrollToTop}
              className="p-2 border border-white/20 text-white hover:border-[#E56B2F] hover:text-[#E56B2F] transition-colors"
              aria-label="Back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
