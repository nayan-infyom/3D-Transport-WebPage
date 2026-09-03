import { METRICS } from '../../data/companyData';
import { Award, ShieldCheck, CheckCircle2, TrendingUp } from 'lucide-react';

export function TrustSection() {
  return (
    <section
      id="trust"
      className="relative min-h-screen w-full flex flex-col justify-center py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 pointer-events-none"
    >
      <div className="bg-[#F7F5F0]/90 backdrop-blur-md border border-[#171A1C]/10 p-6 sm:p-10 lg:p-12 pointer-events-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#171A1C]/10 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E9E6DE] text-[#171A1C] text-[10px] font-mono uppercase tracking-widest font-bold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E56B2F]"></span>
              <span>SECTION 06 — TRUST & SLA PERFORMANCE</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#171A1C]">
              On the road. On schedule. <br />
              <span className="text-[#E56B2F]">On your side.</span>
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-[#5E6468] max-w-md">
            Our audited safety record, enterprise SLA contracts, and veteran driver retention rate establish Northline as the trusted carrier partner for Fortune 500 supply chains.
          </p>
        </div>

        {/* 4 Big Trust Metrics Bento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {METRICS.map((metric, idx) => (
            <div
              key={idx}
              className="bg-white/80 border border-[#171A1C]/10 p-6 space-y-2 hover:border-[#E56B2F]/60 transition-colors"
            >
              <span className="text-4xl sm:text-5xl font-editorial font-bold text-[#171A1C] tracking-tight block">
                {metric.value}
              </span>
              <h3 className="font-editorial text-sm font-bold text-[#E56B2F] uppercase tracking-wider">
                {metric.label}
              </h3>
              <p className="font-sans text-xs text-[#5E6468] leading-relaxed">
                {metric.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Safety & Enterprise Carrier Compliance Badges */}
        <div className="bg-[#171A1C] text-[#F7F5F0] p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-white/10 text-[#E56B2F]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-editorial text-sm font-bold">FMCSA Tier 1 Safety Rating</h4>
              <p className="text-xs text-[#D8D4C9] font-sans mt-0.5">
                Top decile carrier safety performance across vehicle maintenance and hours-of-service compliance.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-white/10 text-[#E56B2F]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-editorial text-sm font-bold">SmartWay Excellence Award</h4>
              <p className="text-xs text-[#D8D4C9] font-sans mt-0.5">
                EPA-verified aerodynamic equipment and low-rolling resistance technologies reducing fleet emissions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-white/10 text-[#E56B2F]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-editorial text-sm font-bold">$250K Primary Cargo Insurance</h4>
              <p className="text-xs text-[#D8D4C9] font-sans mt-0.5">
                Comprehensive primary freight insurance with optional excess value coverage certificates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
