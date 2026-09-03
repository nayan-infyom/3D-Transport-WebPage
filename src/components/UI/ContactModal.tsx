import React, { useState } from 'react';
import { X, Phone, Mail, Clock, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { COMPANY_INFO } from '../../data/companyData';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    subject: 'Emergency Capacity / Spot Freight',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div
      id="contact-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#171A1C]/70 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="contact-modal-panel"
        className="relative w-full max-w-3xl bg-[#F7F5F0] border border-[#171A1C]/15 shadow-2xl overflow-hidden my-8"
      >
        <div className="flex items-center justify-between px-6 py-4 bg-[#171A1C] text-[#F7F5F0]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-[#E56B2F]"></span>
            <h2 className="font-editorial text-base font-bold tracking-tight">
              24/7 Central Fleet Command & Dispatch
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#D8D4C9] hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-editorial text-2xl font-bold text-[#171A1C] mb-2">
              Dispatch Request Logged
            </h3>
            <p className="text-sm text-[#5E6468] max-w-md mb-6">
              Our central command officer has received your priority transmission and will contact you directly within 15 minutes.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="px-6 py-2.5 bg-[#171A1C] text-[#F7F5F0] font-editorial text-xs uppercase tracking-wider font-semibold hover:bg-[#E56B2F]"
            >
              Close Window
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Quick Contacts Info */}
            <div className="md:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#E56B2F] font-bold block mb-1">
                  Direct Line
                </span>
                <a
                  href={`tel:${COMPANY_INFO.dispatchPhone}`}
                  className="font-editorial text-2xl font-bold text-[#171A1C] hover:text-[#E56B2F] transition-colors flex items-center gap-2 mt-1"
                >
                  <Phone className="w-5 h-5 text-[#E56B2F]" />
                  <span>{COMPANY_INFO.dispatchPhone}</span>
                </a>
                <span className="text-[11px] font-mono text-[#5E6468] block mt-1">
                  Direct access to active load coordinators
                </span>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#171A1C]/10 text-xs font-mono text-[#5E6468]">
                <div className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-[#171A1C] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#171A1C] font-semibold block">Email Dispatch</span>
                    <span>{COMPANY_INFO.email}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#171A1C] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#171A1C] font-semibold block">Coverage Window</span>
                    <span>{COMPANY_INFO.operatingHours}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#171A1C] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#171A1C] font-semibold block">Central Command HQ</span>
                    <span>{COMPANY_INFO.headquarters}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Message Form */}
            <form onSubmit={handleSubmit} className="md:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#5E6468] block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#171A1C]/20 text-[#171A1C] focus:outline-none focus:border-[#E56B2F]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#5E6468] block mb-1">Company Name</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#171A1C]/20 text-[#171A1C] focus:outline-none focus:border-[#E56B2F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#5E6468] block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#171A1C]/20 text-[#171A1C] focus:outline-none focus:border-[#E56B2F]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#5E6468] block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#171A1C]/20 text-[#171A1C] focus:outline-none focus:border-[#E56B2F]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#5E6468] block mb-1">Freight Inquiry / Lane Details</label>
                <textarea
                  rows={3}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Provide origin, destination, equipment needed, or timeline requirements..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#171A1C]/20 text-[#171A1C] focus:outline-none focus:border-[#E56B2F] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#171A1C] text-[#F7F5F0] font-editorial text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#E56B2F] transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit to Dispatch Officer</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
