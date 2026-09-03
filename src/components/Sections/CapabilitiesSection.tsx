import React, { useState } from 'react';
import { SERVICES } from '../../data/companyData';
import { Truck, ArrowUpRight, Check, ChevronRight, Layers, ShieldCheck } from 'lucide-react';
import { ServiceItem } from '../../types';

interface CapabilitiesSectionProps {
  onSelectService: (service: ServiceItem) => void;
}

export function CapabilitiesSection({ onSelectService }: CapabilitiesSectionProps) {
  const [activeTab, setActiveTab] = useState<string>(SERVICES[0].id);
  const currentService = SERVICES.find((s) => s.id === activeTab) || SERVICES[0];

  return (
    <section
      id="capabilities"
      className="relative min-h-screen w-full flex flex-col justify-center py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10 pointer-events-none"
    >
      <div className="bg-[#F7F5F0]/90 backdrop-blur-md border border-[#171A1C]/10 p-6 sm:p-10 lg:p-12 pointer-events-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#171A1C]/10 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E9E6DE] text-[#171A1C] text-[10px] font-mono uppercase tracking-widest font-bold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E56B2F]"></span>
              <span>SECTION 03 — CAPABILITIES</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-[#171A1C]">
              Engineered Capacity. <br className="hidden sm:inline" />
              Tailored Logistics.
            </h2>
          </div>
          <p className="font-sans text-sm sm:text-base text-[#5E6468] max-w-md">
            Whether securing contracted dedicated fleets or urgent spot expedited capacity, Northline delivers precision freight orchestration across all 48 states.
          </p>
        </div>

        {/* Interactive Capability Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
          {SERVICES.map((service) => {
            const isSelected = activeTab === service.id;
            return (
              <button
                key={service.id}
                onClick={() => setActiveTab(service.id)}
                className={`p-4 text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#171A1C] text-[#F7F5F0] border-[#171A1C] shadow-md'
                    : 'bg-white/60 text-[#171A1C] border-[#171A1C]/10 hover:border-[#171A1C]/30 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-[#E56B2F]' : 'text-[#5E6468]'}`}>
                    {service.code}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[#E56B2F]' : 'text-transparent'}`} />
                </div>
                <div className="font-editorial text-xs sm:text-sm font-bold truncate">
                  {service.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Capability Deep-Dive Card */}
        <div className="bg-[#E9E6DE]/80 border border-[#171A1C]/10 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Service Description (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#E56B2F] font-bold">
                {currentService.category}
              </span>
              <span className="text-[#171A1C]/20">•</span>
              <span className="text-xs font-mono text-[#5E6468]">
                {currentService.capacity}
              </span>
            </div>

            <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#171A1C]">
              {currentService.tagline}
            </h3>

            <p className="font-sans text-sm text-[#5E6468] leading-relaxed">
              {currentService.description}
            </p>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#171A1C]/10 font-mono text-xs">
              {currentService.specs.map((spec, idx) => (
                <div key={idx} className="bg-white/70 p-2.5 border border-[#171A1C]/5">
                  <span className="text-[10px] text-[#5E6468] block">{spec.label}</span>
                  <span className="font-bold text-[#171A1C]">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Service Action Box (5 Cols) */}
          <div className="lg:col-span-5 bg-[#171A1C] text-[#F7F5F0] p-6 sm:p-8 space-y-6 border border-[#171A1C]">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#E56B2F]">
                EQUIPMENT GUARANTEE
              </span>
              <h4 className="font-editorial text-lg font-bold">
                53' High-Cube Aerodynamic Trailer
              </h4>
              <p className="text-xs text-[#D8D4C9] font-sans">
                Full logistics E-track bars, scuff liners, and automated load securement telemetry.
              </p>
            </div>

            <div className="space-y-2 font-mono text-xs border-y border-white/10 py-3">
              <div className="flex items-center gap-2 text-white">
                <Check className="w-3.5 h-3.5 text-[#E56B2F]" />
                <span>Zero brokered third-party handoffs</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Check className="w-3.5 h-3.5 text-[#E56B2F]" />
                <span>24/7 Satellite Telematics Visibility</span>
              </div>
            </div>

            <button
              onClick={() => onSelectService(currentService)}
              className="w-full py-3 bg-[#E56B2F] text-white font-editorial text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white hover:text-[#171A1C] transition-colors cursor-pointer"
            >
              <span>Quote {currentService.title}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
