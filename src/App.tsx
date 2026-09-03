import { useScrollProgress } from './hooks/useScrollProgress';
import { MainCanvas } from './components/Scene/MainCanvas';
import { CinematicOverlay } from './components/Overlay';

export default function App() {
  const { scrollProgress, mouseCoords } = useScrollProgress();

  return (
    <div className="relative bg-[#F7F5F0] text-[#171A1C] selection:bg-[#E56B2F] selection:text-white">
      {/* 
        This is a massive scroll container that dictates the cinematic timeline.
        The user scrolls through this empty space, which drives `scrollProgress`.
      */}
      <div style={{ height: '1200vh' }}>
        
        {/* Sticky Container for the 3D Scene and UI Overlay */}
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          
          {/* Persistent 3D Three.js Transportation Scene */}
          <MainCanvas scrollProgress={scrollProgress} mouseCoords={mouseCoords} />

          {/* Cinematic UI Overlay */}
          <CinematicOverlay scrollProgress={scrollProgress} />
          
        </div>
      </div>
    </div>
  );
}
