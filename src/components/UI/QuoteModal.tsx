import React, { useState, useMemo } from 'react';
import { X, CheckCircle2, ArrowRight, Calculator, ShieldCheck, Clock, MapPin, Truck, Sparkles } from 'lucide-react';
import { QuoteFormData } from '../../types';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuoteModal({ isOpen, onClose }: QuoteModalProps) {
  const [formData, setFormData] = useState<QuoteFormData>({
    origin: 'Chicago, IL (60607)',
    destination: 'Dallas, TX (75201)',
    cargoType: 'General Dry Freight / Consumer Goods',
    weightLbs: 34000,
    palletsCount: 22,
    serviceSpeed: 'standard',
    temperatureControl: false,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    pickupDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuoteId, setSubmittedQuoteId] = useState<string | null>(null);

  // Dynamic Freight Rate & Transit Estimation Engine
  const estimate = useMemo(() => {
    // Distance simulation based on common city pairs
    let miles = 920;
    if (formData.origin.toLowerCase().includes('chicago') && formData.destination.toLowerCase().includes('dallas')) {
      miles = 925;
    } else if (formData.origin.toLowerCase().includes('los angeles') || formData.destination.toLowerCase().includes('los angeles')) {
      miles = 2050;
    } else if (formData.origin.toLowerCase().includes('new york') || formData.destination.toLowerCase().includes('new york')) {
      miles = 1380;
    }

    // Rate calculations
    const basePerMile = formData.serviceSpeed === 'expedited' ? 3.45 : formData.serviceSpeed === 'dedicated' ? 3.15 : 2.65;
    const reeferAdd = formData.temperatureControl ? 0.45 : 0;
    const ratePerMile = basePerMile + reeferAdd;
    const totalEst = Math.round(miles * ratePerMile);
    
    // Transit time calculations
    const averageMph = formData.serviceSpeed === 'expedited' ? 55 : 42;
    const transitHours = Math.ceil(miles / averageMph);
    const transitDays = Math.ceil(transitHours / (formData.serviceSpeed === 'expedited' ? 22 : 11));

    return {
      miles,
      ratePerMile: ratePerMile.toFixed(2),
      estimatedTotalLow: Math.round(totalEst * 0.94),
      estimatedTotalHigh: Math.round(totalEst * 1.06),
      transitHours,
      transitDays,
    };
  }, [formData.origin, formData.destination, formData.serviceSpeed, formData.temperatureControl]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const generatedId = `NL-Q${Math.floor(100000 + Math.random() * 900000)}`;
      setSubmittedQuoteId(generatedId);
    }, 800);
  };

  const handleReset = () => {
    setSubmittedQuoteId(null);
    onClose();
  };

  return (
    <div
      id="quote-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#171A1C]/70 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="quote-modal-panel"
        className="relative w-full max-w-4xl bg-[#F7F5F0] border border-[#171A1C]/15 shadow-2xl overflow-hidden my-8"
      >
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#171A1C] text-[#F7F5F0]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-[#E56B2F]"></span>
            <div>
              <h2 className="font-editorial text-base font-bold tracking-tight">
                Instant Freight Rate & Capacity Estimator
              </h2>
              <p className="text-[11px] font-mono text-[#D8D4C9]">
                FMCSA SmartWay Tier 1 Certified Carrier Network
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#D8D4C9] hover:text-white transition-colors"
            aria-label="Close quote estimator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedQuoteId ? (
          /* Confirmation View */
          <div className="p-8 sm:p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#E56B2F] font-semibold mb-2">
              Dispatch Request Confirmed
            </span>
            <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#171A1C] mb-3">
              Quote Reference: #{submittedQuoteId}
            </h3>
            <p className="max-w-xl text-sm text-[#5E6468] leading-relaxed mb-6">
              Thank you, <strong className="text-[#171A1C]">{formData.contactName || 'Valued Shipper'}</strong>. Our 24/7 central dispatch team has locked capacity for lane <strong className="text-[#171A1C]">{formData.origin}</strong> → <strong className="text-[#171A1C]">{formData.destination}</strong>. A formal Bill of Lading rate agreement has been dispatched to <strong className="text-[#171A1C]">{formData.contactEmail || 'your email'}</strong>.
            </p>

            <div className="grid grid-cols-3 gap-4 w-full max-w-lg bg-[#E9E6DE] p-4 border border-[#171A1C]/10 text-left font-mono text-xs mb-8">
              <div>
                <span className="text-[10px] text-[#5E6468] block">Estimated Lane</span>
                <span className="font-bold text-[#171A1C]">{estimate.miles} Miles</span>
              </div>
              <div>
                <span className="text-[10px] text-[#5E6468] block">Transit Target</span>
                <span className="font-bold text-[#171A1C]">{estimate.transitDays} Business Days</span>
              </div>
              <div>
                <span className="text-[10px] text-[#5E6468] block">Bracket</span>
                <span className="font-bold text-[#E56B2F]">${estimate.estimatedTotalLow} - ${estimate.estimatedTotalHigh}</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-8 py-3 bg-[#171A1C] text-[#F7F5F0] font-editorial text-xs uppercase tracking-wider font-semibold hover:bg-[#E56B2F] transition-colors"
            >
              Done & Return to Overview
            </button>
          </div>
        ) : (
          /* Main Quotation Form */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Form Column (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Lane Routing Section */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#171A1C] font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#E56B2F]" />
                    <span>Origin & Destination Route</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-[#5E6468] block mb-1">Pickup Location</span>
                      <input
                        type="text"
                        required
                        value={formData.origin}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        placeholder="City, State or ZIP"
                        className="w-full px-3 py-2 text-xs bg-white border border-[#171A1C]/20 text-[#171A1C] focus:outline-none focus:border-[#E56B2F]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-[#5E6468] block mb-1">Delivery Destination</span>
                      <input
                        type="text"
                        required
                        value={formData.destination}
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                        placeholder="City, State or ZIP"
                        className="w-full px-3 py-2 text-xs bg-white border border-[#171A1C]/20 text-[#171A1C] focus:outline-none focus:border-[#E56B2F]"
                      />
                    </div>
                  </div>
                </div>

                {/* Service Mode Selection */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#171A1C] font-semibold mb-3 flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-[#E56B2F]" />
                    <span>Capacity & Velocity Requirement</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'standard', name: 'Standard FTL', desc: '53ft Dry Van' },
                      { id: 'expedited', name: 'Expedited Team', desc: 'Non-stop 24/7' },
                      { id: 'dedicated', name: 'Dedicated Fleet', desc: 'Contract Power' },
                    ].map((mode) => (
                      <button
                        type="button"
                        key={mode.id}
                        onClick={() => setFormData({ ...formData, serviceSpeed: mode.id as any })}
                        className={`p-3 text-left border transition-all ${
                          formData.serviceSpeed === mode.id
                            ? 'bg-[#171A1C] text-[#F7F5F0] border-[#171A1C]'
                            : 'bg-white text-[#171A1C] border-[#171A1C]/15 hover:border-[#171A1C]/40'
                        }`}
                      >
                        <div className="font-editorial text-xs font-bold">{mode.name}</div>
                        <div className={`text-[10px] font-mono ${formData.serviceSpeed === mode.id ? 'text-[#D8D4C9]' : 'text-[#5E6468]'}`}>
                          {mode.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight and Temperature Control */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-[#5E6468] mb-1">
                      Estimated Payload Weight: <strong className="text-[#171A1C]">{formData.weightLbs.toLocaleString()} lbs</strong>
                    </label>
                    <input
                      type="range"
                      min="5000"
                      max="45000"
                      step="1000"
                      value={formData.weightLbs}
                      onChange={(e) => setFormData({ ...formData, weightLbs: parseInt(e.target.value) })}
                      className="w-full accent-[#E56B2F]"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-[#5E6468]">
                      <span>5,000 lbs</span>
                      <span>45,000 lbs Max</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-[#171A1C]">
                      <input
                        type="checkbox"
                        checked={formData.temperatureControl}
                        onChange={(e) => setFormData({ ...formData, temperatureControl: e.target.checked })}
                        className="w-4 h-4 accent-[#E56B2F]"
                      />
                      <span>Require Temp-Controlled (Reefer)</span>
                    </label>
                  </div>
                </div>

                {/* Contact Coordinates */}
                <div className="pt-2 border-t border-[#171A1C]/10">
                  <span className="block text-xs font-mono uppercase tracking-wider text-[#171A1C] font-semibold mb-3">
                    Shipper Contact Details
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Contact Name *"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="px-3 py-2 text-xs bg-white border border-[#171A1C]/20 text-[#171A1C] focus:outline-none focus:border-[#E56B2F]"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Work Email *"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="px-3 py-2 text-xs bg-white border border-[#171A1C]/20 text-[#171A1C] focus:outline-none focus:border-[#E56B2F]"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number *"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="px-3 py-2 text-xs bg-white border border-[#171A1C]/20 text-[#171A1C] focus:outline-none focus:border-[#E56B2F]"
                    />
                  </div>
                </div>
              </div>

              {/* Right Summary Column (5 Cols) */}
              <div className="lg:col-span-5 bg-[#E9E6DE] p-6 border border-[#171A1C]/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#E56B2F] font-bold mb-4">
                    <Calculator className="w-4 h-4" />
                    <span>Real-Time Lane Estimate</span>
                  </div>

                  {/* Pricing Output Display */}
                  <div className="bg-white p-4 border border-[#171A1C]/10 mb-4">
                    <span className="text-[10px] font-mono text-[#5E6468] uppercase block">
                      Estimated Rate Bracket
                    </span>
                    <div className="text-2xl sm:text-3xl font-editorial font-bold text-[#171A1C] mt-1">
                      ${estimate.estimatedTotalLow.toLocaleString()} – ${estimate.estimatedTotalHigh.toLocaleString()}
                    </div>
                    <span className="text-[10px] font-mono text-[#6F806D] block mt-1">
                      ~${estimate.ratePerMile}/mile inclusive of fuel surcharge
                    </span>
                  </div>

                  {/* Route Specs Breakdown */}
                  <div className="space-y-2.5 font-mono text-xs text-[#171A1C] mb-6">
                    <div className="flex justify-between py-1 border-b border-[#171A1C]/10">
                      <span className="text-[#5E6468]">Calculated Distance:</span>
                      <span className="font-bold">{estimate.miles} Miles</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#171A1C]/10">
                      <span className="text-[#5E6468]">Estimated Transit:</span>
                      <span className="font-bold">{estimate.transitDays} Business Days ({estimate.transitHours} hrs)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#171A1C]/10">
                      <span className="text-[#5E6468]">Trailer Equipment:</span>
                      <span className="font-bold">{formData.temperatureControl ? '53ft Reefer' : '53ft Dry Van'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#171A1C]/10">
                      <span className="text-[#5E6468]">Tracking Precision:</span>
                      <span className="font-bold text-[#6F806D]">Sub-minute GPS Live</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#5E6468] bg-white/60 p-2.5 border border-[#171A1C]/5">
                    <ShieldCheck className="w-4 h-4 text-[#E56B2F] shrink-0" />
                    <span>All shipments backed by $250,000 Cargo Insurance & Tier 1 Driver Certification.</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#171A1C]/10">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#E56B2F] text-white font-editorial text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#171A1C] transition-colors shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2 font-mono">
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        LOCKING CAPACITY...
                      </span>
                    ) : (
                      <>
                        <span>Confirm & Dispatch Rate Sheet</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
