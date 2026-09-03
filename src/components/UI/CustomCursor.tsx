import { useEffect, useState } from 'react';

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Disable on touch / mobile devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouch(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check if hovering over clickable elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable =
          target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.tagName === 'TEXTAREA' ||
          target.closest('button') ||
          target.closest('a') ||
          target.closest('[role="button"]') ||
          target.classList.contains('cursor-pointer');
        setIsHovering(!!isClickable);
      }
    };

    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isVisible]);

  if (isTouch || !isVisible) return null;

  return (
    <>
      {/* Precision Center Dot */}
      <div
        className="fixed top-0 left-0 w-2 h-2 bg-[#E56B2F] rounded-full pointer-events-none z-50 transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        }}
      />
      {/* Outer Magnetic Ring */}
      <div
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-50 transition-all duration-300 ease-out -translate-x-1/2 -translate-y-1/2 border ${
          isHovering
            ? 'w-12 h-12 border-[#E56B2F] bg-[#E56B2F]/10 scale-110'
            : 'w-8 h-8 border-[#171A1C]/35 scale-100'
        }`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        }}
      />
    </>
  );
}
