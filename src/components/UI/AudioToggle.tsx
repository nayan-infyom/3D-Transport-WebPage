import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { onFirstInteraction } from '../../systems/core/scrollStore';
import { getWorld } from '../../systems/World';

/**
 * Sound control.
 *
 * Audio is off until asked for - both because browsers require a gesture and
 * because an unrequested soundtrack is rude. The graph is only constructed on
 * the first enable, so a visitor who never turns it on never pays for it.
 */
export function AudioToggle() {
  const world = getWorld();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Resume a context that the browser suspended after a tab switch.
    return onFirstInteraction(() => {
      if (enabled) world.audio.start();
    });
  }, [world, enabled]);

  useEffect(() => () => world.audio.setMuted(true), [world]);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    if (next) world.audio.start();
    world.audio.setMuted(!next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      className="pointer-events-auto flex items-center gap-2 border border-white/25 px-3 py-2 text-[10px] font-semibold tracking-[0.24em] uppercase transition-opacity duration-300 hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      {enabled ? <Volume2 className="h-3.5 w-3.5" aria-hidden="true" /> : <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />}
      <span>{enabled ? 'Sound on' : 'Sound off'}</span>
    </button>
  );
}
