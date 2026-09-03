import { useState, useEffect } from 'react';
import { Gauge, Compass, Activity, ShieldCheck } from 'lucide-react';

interface TelemetryBadgeProps {
  scrollProgress: number;
}

export function TelemetryBadge({ scrollProgress }: TelemetryBadgeProps) {
  const [speed, setSpeed] = useState(65);
  const [heading, setHeading] = useState('084° ENE');
  const [lat, setLat] = useState(41.8781);
  const [lng, setLng] = useState(-87.6298);

  useEffect(() => {
    // Dynamic coordinate progression based on scroll
    const baseLat = 41.8781 + scrollProgress * 0.42;
    const baseLng = -87.6298 - scrollProgress * 1.84;
    setLat(parseFloat(baseLat.toFixed(4)));
    setLng(parseFloat(baseLng.toFixed(4)));

    // Dynamic speed based on storytelling section
    if (scrollProgress < 0.15) {
      setSpeed(64);
      setHeading('084° ENE');
    } else if (scrollProgress < 0.4) {
      setSpeed(68);
      setHeading('092° E');
    } else if (scrollProgress < 0.6) {
      setSpeed(58);
      setHeading('045° NE');
    } else {
      setSpeed(65);
      setHeading('078° ENE');
    }
  }, [scrollProgress]);

  return (
    <div
      id="live-telemetry-hud"
      className="hidden md:flex fixed bottom-6 left-6 z-40 items-center gap-4 px-4 py-2.5 bg-[#F7F5F0]/90 backdrop-blur-md border border-[#171A1C]/12 shadow-[0_4px_20px_rgba(0,0,0,0.04)] font-mono text-[11px] text-[#171A1C]"
    >
      {/* Unit Status */}
      <div className="flex items-center gap-2 border-r border-[#171A1C]/10 pr-4">
        <span className="w-2 h-2 rounded-full bg-[#E56B2F] animate-ping" />
        <span className="font-bold tracking-wider">UNIT #NL-408</span>
      </div>

      {/* Speed & Cruise */}
      <div className="flex items-center gap-1.5 border-r border-[#171A1C]/10 pr-4">
        <Gauge className="w-3.5 h-3.5 text-[#5E6468]" />
        <span>{speed} MPH</span>
        <span className="text-[9px] text-[#6F806D] font-semibold">CRUISE</span>
      </div>

      {/* Heading & GPS Coordinates */}
      <div className="flex items-center gap-1.5 border-r border-[#171A1C]/10 pr-4">
        <Compass className="w-3.5 h-3.5 text-[#5E6468]" />
        <span>{heading}</span>
        <span className="text-[#5E6468] text-[10px]">
          ({lat}°N, {Math.abs(lng)}°W)
        </span>
      </div>

      {/* TPMS & Payload */}
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-[#E56B2F]" />
        <span className="text-[10px] text-[#5E6468]">TPMS: 105 PSI NOMINAL</span>
      </div>
    </div>
  );
}
