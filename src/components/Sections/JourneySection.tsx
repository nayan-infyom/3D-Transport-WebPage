import { ShieldCheck, Navigation, Gauge, RefreshCw } from 'lucide-react';

export function JourneySection() {
  return (
    <section
      id="journey"
      className="relative min-h-screen w-full flex flex-col justify-center py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 pointer-events-none"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Editorial Narrative Column (7 cols) */}
        <div className="lg:col-span-7 bg-[#F7F5F0]/85 backdrop-blur-md p-8 sm:p-12 border border-[#171A1C]/10 pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E9E6DE] text-[#171A1C] text-[10px] font-mono uppercase tracking-widest font-bold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E56B2F]"></span>
            <span>SECTION 02 — THE JOURNEY</span>
          </div>

          <h2 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#171A1C] leading-[1.05] mb-6">
            Built for the road ahead.
          </h2>

          <p className="font-sans text-base sm:text-lg text-[#5E6468] leading-relaxed mb-8">
            From transcontinental line-hauls to high-density regional shuttles, our late-model tractor-trailers operate on rigorous, clockwork relay schedules. Every lane is optimized by algorithmic weather mapping and dynamic traffic avoidance, ensuring seamless handoffs and unwavering punctuality.
          </p>

          {/* Core Feature Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#171A1C]/10 font-mono">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#171A1C]">
                <ShieldCheck className="w-4 h-4 text-[#E56B2F]" />
                <span>Zero-Drop Cargo Integrity</span>
              </div>
              <p className="text-[11px] text-[#5E6468] font-sans">
                Sealed-at-origin dry vans with remote IoT door-sensor alarms and GPS geo-fencing.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#171A1C]">
                <RefreshCw className="w-4 h-4 text-[#E56B2F]" />
                <span>Continuous Relay Logistics</span>
              </div>
              <p className="text-[11px] text-[#5E6468] font-sans">
                Dedicated team driver options ensuring 24/7 rolling wheels across interstate arteries.
              </p>
            </div>
          </div>
        </div>

        {/* Right Floating Highway Telematics Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4 pointer-events-auto">
          <div className="bg-[#171A1C] text-[#F7F5F0] p-6 border border-[#171A1C] shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <span className="text-[10px] font-mono tracking-widest text-[#E56B2F] uppercase font-bold">
                LANE MONITORING
              </span>
              <span className="text-[10px] font-mono text-white/50">I-80 TRANSIT CORRIDOR</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-white/60">Scheduled Route:</span>
                <span className="text-white font-semibold">Chicago, IL → Salt Lake City, UT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Corridor Distance:</span>
                <span className="text-white font-semibold">1,404 Miles</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Average Velocity:</span>
                <span className="text-emerald-400 font-semibold">63.8 MPH (Optimal Fuel Band)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Carbon Intensity:</span>
                <span className="text-white font-semibold">SmartWay Tier 1 (-18% CO2)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
