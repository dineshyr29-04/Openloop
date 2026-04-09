import { useState, useEffect } from 'react';

export type Phase = 'loader' | 'portal' | 'main';

export const usePhase = () => {
  const [phase, setPhase] = useState<Phase>('loader');
  const [loaderProgress, setLoaderProgress] = useState(0);

  useEffect(() => {
    if (phase !== 'loader') return;

    // Loader sequence timing
    const loaderDuration = 4500; // milliseconds
    const startTime = Date.now();

    const frame = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / loaderDuration, 1);
      setLoaderProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        // Transition to portal
        setPhase('portal');
        // Portal transition happens over 1.5s, then switch to main
        setTimeout(() => {
          setPhase('main');
          // Enable scroll after main phase
          document.documentElement.style.overflow = 'auto';
          document.body.style.overflow = 'auto';
        }, 1500);
      }
    };

    requestAnimationFrame(frame);
  }, [phase]);

  return { phase, loaderProgress };
};
