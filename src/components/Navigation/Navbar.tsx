import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Menu, X, Radio, Phone, Volume2, VolumeX } from 'lucide-react';
import { COMPANY_INFO } from '../../data/companyData';

interface NavbarProps {
  onOpenQuote: () => void;
  onOpenContact: () => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
  scrollProgress: number;
}

export function Navbar({
  onOpenQuote,
  onOpenContact,
  isAudioPlaying,
  onToggleAudio,
  scrollProgress,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setIsScrolled(scrollProgress > 0.05);
  }, [scrollProgress]);

  const navLinks = [
    { label: 'Overview', href: '#hero' },
    { label: 'The Journey', href: '#journey' },
    { label: 'Capabilities', href: '#capabilities' },
    { label: 'Precision Tech', href: '#precision' },
    { label: 'Route Network', href: '#network' },
    { label: 'Performance', href: '#trust' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="main-nav-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'py-3 bg-[#F7F5F0]/90 backdrop-blur-md border-b border-[#171A1C]/8 shadow-[0_4px_24px_rgba(0,0,0,0.03)]'
          : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo & Live Signal */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, '#hero')}
          className="flex items-center gap-3 group"
          id="brand-logo-link"
        >
          {/* Geometric Geometric Northline Monogram */}
          <div className="w-10 h-10 bg-[#171A1C] text-[#F7F5F0] rounded-none flex items-center justify-center font-bold text-lg tracking-wider border border-[#171A1C] transition-transform duration-300 group-hover:bg-[#E56B2F] group-hover:border-[#E56B2F]">
            NL
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-editorial text-lg font-bold tracking-tight text-[#171A1C]">
                NORTHLINE
              </span>
              <span className="text-xs font-mono text-[#E56B2F] font-semibold tracking-wider">
                TRANSPORT
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="text-[10px] font-mono text-[#5E6468] tracking-widest uppercase">
                24/7 DISPATCH ACTIVE
              </span>
            </div>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8" id="desktop-nav-menu">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-xs uppercase tracking-widest font-mono text-[#171A1C]/75 hover:text-[#E56B2F] transition-colors duration-200 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#E56B2F] hover:after:w-full after:transition-all after:duration-300"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions (Sound, Phone, Quote CTA) */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Audio Synthesizer Ambience Toggle */}
          <button
            id="audio-toggle-btn"
            onClick={onToggleAudio}
            title={isAudioPlaying ? 'Mute highway ambiance' : 'Play highway ambiance'}
            className="p-2.5 rounded-none border border-[#171A1C]/15 bg-[#F7F5F0] text-[#171A1C] hover:border-[#E56B2F] hover:text-[#E56B2F] transition-colors"
            aria-label="Toggle highway audio ambience"
          >
            {isAudioPlaying ? (
              <Volume2 className="w-4 h-4 text-[#E56B2F] animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#5E6468]" />
            )}
          </button>

          {/* Quick Dispatch Hotline */}
          <button
            id="nav-dispatch-phone-btn"
            onClick={onOpenContact}
            className="hidden xl:flex items-center gap-2 text-xs font-mono text-[#171A1C] px-3 py-2 border border-[#171A1C]/15 hover:border-[#171A1C] transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#E56B2F]" />
            <span>{COMPANY_INFO.dispatchPhone}</span>
          </button>

          {/* Primary Request Quote CTA */}
          <button
            id="nav-request-quote-btn"
            onClick={onOpenQuote}
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 bg-[#171A1C] text-[#F7F5F0] font-editorial text-xs font-semibold uppercase tracking-wider overflow-hidden transition-all duration-300 hover:bg-[#E56B2F] hover:shadow-[0_4px_16px_rgba(229,107,47,0.3)] cursor-pointer"
          >
            <span>Request a Quote</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onToggleAudio}
            className="p-2 border border-[#171A1C]/15 bg-[#F7F5F0] text-[#171A1C]"
            aria-label="Toggle audio"
          >
            {isAudioPlaying ? (
              <Volume2 className="w-4 h-4 text-[#E56B2F]" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border border-[#171A1C]/20 bg-[#F7F5F0] text-[#171A1C]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-drawer-menu"
          className="sm:hidden fixed inset-x-0 top-[60px] bg-[#F7F5F0] border-b border-[#171A1C]/15 px-6 py-8 shadow-xl flex flex-col gap-6 animate-fadeIn"
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-base font-editorial font-bold text-[#171A1C] tracking-wide hover:text-[#E56B2F]"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-4 border-t border-[#171A1C]/10 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuote();
              }}
              className="w-full py-3 bg-[#E56B2F] text-white font-editorial text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span>Request Instant Quote</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContact();
              }}
              className="w-full py-3 border border-[#171A1C] text-[#171A1C] font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Phone className="w-3.5 h-3.5 text-[#E56B2F]" />
              <span>Call Dispatch ({COMPANY_INFO.dispatchPhone})</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
