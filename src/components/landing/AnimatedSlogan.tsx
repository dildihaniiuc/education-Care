import React, { useEffect, useState } from 'react';

const SLOGAN_TARGETS = ['গুলিয়াখালী', 'বাংলাদেশ', 'পৃথিবী'] as const;

interface AnimatedSloganProps {
  /** Interval duration in milliseconds between each word transition */
  intervalMs?: number;
}

/**
 * Single-line animated slogan ("চলো বদলায়" + cycling target location)
 * with smooth fade-in / fade-out transitions in deep yellow and orange.
 */
export const AnimatedSlogan: React.FC<AnimatedSloganProps> = ({ intervalMs = 2600 }) => {
  const [targetIdx, setTargetIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const intervalId = setInterval(() => {
      setIsVisible(false);
      timeoutId = setTimeout(() => {
        setTargetIdx((prev) => (prev + 1) % SLOGAN_TARGETS.length);
        setIsVisible(true);
      }, 500);
    }, intervalMs);

    return () => {
      clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [intervalMs]);

  return (
    <div className="py-6 sm:py-8 border-y border-slate-100 dark:border-slate-900">
      <div className="flex flex-nowrap items-baseline justify-center lg:justify-start gap-2 sm:gap-3 whitespace-nowrap">
        <span className="text-[26px] sm:text-4xl lg:text-[42px] font-black tracking-tight text-[#CA8A04] dark:text-[#FBBF24] select-none shrink-0">
          চলো বদলায়
        </span>

        <span
          aria-live="polite"
          className={`inline-block text-[26px] sm:text-4xl lg:text-[42px] font-black tracking-tight text-[#EA580C] dark:text-[#FB923C] transition-all duration-500 ease-out will-change-[opacity,transform] shrink-0 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {SLOGAN_TARGETS[targetIdx]}
        </span>
      </div>
    </div>
  );
};
