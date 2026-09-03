import React, { useState } from 'react';
import { NETWORK_HUBS } from '../../data/companyData';
import { MapPin, ArrowRight, Radio, Activity, Navigation } from 'lucide-react';
import { NetworkHub } from '../../types';

interface NetworkSectionProps {
  onQuickQuoteLane: (origin: string, dest: string) => void;
}

export function NetworkSection({ onQuickQuoteLane }: NetworkSectionProps) {
  const [selectedHub, setSelectedHub] = useState<NetworkHub>(NETWORK_HUBS[0]);

  return (
    <section
      id="network"
      className="relative min-h-screen w-full flex flex-col justify-center py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 pointer-events-none"
    >
      <div className="bg-[#F7F5F0]/90 backdrop-blur-md border border-[#171A1C]/10 p-6 sm:p-10 lg:p-12 pointer-events-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#171A1C]/10 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E9E6DE] text-[#171A1C] text-[10px] font-mono uppercase tracking-widest font-bold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E56B2F]"></span>
              <span>SECTION 05 — ROUTE ARTERIES</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#171A1C]">
              Connected Arteries. <br />
              Nationwide Reach.
            </h2>
          </div>
          <div className="font-mono text-xs text-[#5E6468] space-y-1">
            <div className="flex items-center gap-2 text-[#171A1C] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#E56B2F] animate-pulse"></span>
              <span>48 LOWER STATES ACTIVE NETWORK</span>
            </div>
            <p>Strategic intermodal terminals positioned along high-volume freight corridors.</p>
          </div>
        </div>

        {/* Interactive Hub Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Hub Directory List (5 Cols) */}
          <div className="md:col-span-5 space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#5E6468] block mb-2 font-bold">
              SELECT STRATEGIC LOGISTICS TERMINAL:
            </span>
            {NETWORK_HUBS.map((hub) => {
              const isSelected = selectedHub.id === hub.id;
              return (
                <button
                  key={hub.id}
                  onClick={() => setSelectedHub(hub)}
                  className={`w-full p-3.5 text-left border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#171A1C] text-[#F7F5F0] border-[#171A1C] shadow-md'
                      : 'bg-white/70 text-[#171A1C] border-[#171A1C]/10 hover:border-[#171A1C]/30 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 flex items-center justify-center font-mono text-xs font-bold ${
                      isSelected ? 'bg-[#E56B2F] text-white' : 'bg-[#E9E6DE] text-[#171A1C]'
                    }`}>
                      {hub.state}
                    </div>
                    <div>
                      <div className="font-editorial text-sm font-bold">{hub.name}</div>
                      <div className={`text-[10px] font-mono ${isSelected ? 'text-[#D8D4C9]' : 'text-[#5E6468]'}`}>
                        {hub.type}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className={`text-xs font-bold ${isSelected ? 'text-[#E56B2F]' : 'text-[#171A1C]'}`}>
                      {hub.activeLanes}
                    </span>
                    <span className={`text-[9px] block ${isSelected ? 'text-white/60' : 'text-[#5E6468]'}`}>
                      LANES
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Hub Deep-Dive & Lane Action (7 Cols) */}
          <div className="md:col-span-7 bg-[#E9E6DE]/90 border border-[#171A1C]/10 p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#171A1C]/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#E56B2F] font-bold block">
                  ACTIVE TERMINAL FACILITY
                </span>
                <h3 className="font-editorial text-2xl font-bold text-[#171A1C]">
                  {selectedHub.name} ({selectedHub.state})
                </h3>
                <span className="text-xs font-mono text-[#5E6468]">
                  Coordinates: {selectedHub.coordinates}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-[#171A1C] font-mono text-xs font-semibold border border-[#171A1C]/10">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>ONLINE 24/7</span>
              </span>
            </div>

            {/* Hub Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono">
              <div className="bg-white p-3 border border-[#171A1C]/5">
                <span className="text-[10px] text-[#5E6468] block">Daily Departures</span>
                <span className="text-lg font-bold text-[#171A1C]">{selectedHub.dailyDepartures} Units</span>
              </div>
              <div className="bg-white p-3 border border-[#171A1C]/5">
                <span className="text-[10px] text-[#5E6468] block">Connected Lanes</span>
                <span className="text-lg font-bold text-[#171A1C]">{selectedHub.activeLanes} Active</span>
              </div>
              <div className="bg-white p-3 border border-[#171A1C]/5 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-[#5E6468] block">Drop & Hook Pool</span>
                <span className="text-lg font-bold text-[#E56B2F]">140+ Trailers</span>
              </div>
            </div>

            {/* Major Connected Lanes from this Hub */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#5E6468] block font-bold">
                HIGH-FREQUENCY LANES OUT OF {selectedHub.state}:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { dest: 'Dallas, TX', hours: '18 hrs', rate: 'Prime Daily' },
                  { dest: 'Atlanta, GA', hours: '14 hrs', rate: 'Guaranteed Slot' },
                  { dest: 'Los Angeles, CA', hours: '38 hrs (Team)', rate: 'Express' },
                  { dest: 'New York, NY', hours: '16 hrs', rate: 'Scheduled' },
                ].map((lane, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-white/80 border border-[#171A1C]/10 text-xs font-mono"
                  >
                    <div>
                      <span className="font-bold text-[#171A1C]">→ {lane.dest}</span>
                      <span className="text-[10px] text-[#5E6468] block">{lane.hours}</span>
                    </div>
                    <button
                      onClick={() => onQuickQuoteLane(selectedHub.name, lane.dest)}
                      className="text-[10px] font-bold text-[#E56B2F] hover:underline uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <span>Quote</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
