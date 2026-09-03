import { FLEET_SPECS } from '../../data/companyData';
import { Cpu, ShieldCheck, Zap, Crosshair, Wrench } from 'lucide-react';

export function PrecisionSection() {
  return (
    <section
      id="precision"
      className="relative min-h-screen w-full flex flex-col justify-center py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 pointer-events-none"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Empty spacing on left to allow 3D macro truck wheel & cab close-up view */}
        <div className="hidden lg:block lg:col-span-4" />

        {/* Right Precision Engineering Panel (8 cols) */}
        <div className="lg:col-span-8 bg-[#F7F5F0]/90 backdrop-blur-md border border-[#171A1C]/10 p-6 sm:p-10 pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E9E6DE] text-[#171A1C] text-[10px] font-mono uppercase tracking-widest font-bold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E56B2F]"></span>
            <span>SECTION 04 — FLEET PRECISION</span>
          </div>

          <h2 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#171A1C] mb-4">
            Every mile. Every delivery. <br />
            <span className="text-[#E56B2F]">Precisely handled.</span>
          </h2>

          <p className="font-sans text-sm sm:text-base text-[#5E6468] leading-relaxed mb-8">
            Modern logistics demands technological rigor. Our power units are custom-specified with advanced active aerodynamic fairings, real-time diagnostic sensor arrays, and computerized collision-mitigation suites.
          </p>

          {/* Technical Specs Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FLEET_SPECS.map((spec, idx) => (
              <div
                key={idx}
                className="bg-white/70 border border-[#171A1C]/10 p-5 hover:border-[#E56B2F]/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#E56B2F] font-bold">
                    {spec.category}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#171A1C] bg-[#E9E6DE] px-2 py-0.5">
                    {spec.highlight}
                  </span>
                </div>
                <h3 className="font-editorial text-base font-bold text-[#171A1C] mb-1.5">
                  {spec.title}
                </h3>
                <p className="font-sans text-xs text-[#5E6468] leading-relaxed">
                  {spec.detail}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Telemetry Micro-Bar */}
          <div className="mt-6 pt-4 border-t border-[#171A1C]/10 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-[#5E6468]">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#171A1C]" />
              <span>ENGINE DIAGNOSTICS: 100% HEALTH</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6F806D]" />
              <span>FMCSA ELD COMPLIANT</span>
            </div>
            <div className="flex items-center gap-2">
              <Crosshair className="w-3.5 h-3.5 text-[#E56B2F]" />
              <span>RADAR COLLISION MITIGATION ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
