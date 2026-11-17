import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';

export const COACHING_LOGO_SRC =
  '/assets/aistudio/file_00000000557862309db94630586576a7__1__1e1303c9.png';

interface BrandLogoProps {
  /** 'badge' wraps the white logo in a deep emerald-teal container so it is crisp on light/dark backgrounds.
   *  'raw' renders the white logo directly on dark surfaces. */
  variant?: 'badge' | 'raw';
  className?: string;
  alt?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'badge',
  className = 'w-11 h-11',
  alt = 'এডুকেশন কেয়ার কোচিং সেন্টার লোগো',
}) => {
  const [hasError, setHasError] = useState(false);

  if (variant === 'raw') {
    if (hasError) {
      return (
        <div
          className={`flex items-center justify-center rounded-2xl bg-white/10 text-white ${className}`}
        >
          <GraduationCap className="w-1/2 h-1/2" />
        </div>
      );
    }

    return (
      <img
        src={COACHING_LOGO_SRC}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={`object-contain select-none ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-[#064E3B] to-[#0F766E] border border-emerald-900/20 flex items-center justify-center p-1.5 shadow-sm shrink-0 overflow-hidden ${className}`}
    >
      {hasError ? (
        <GraduationCap className="w-3/5 h-3/5 text-white" />
      ) : (
        <img
          src={COACHING_LOGO_SRC}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="w-full h-full object-contain select-none"
        />
      )}
    </div>
  );
};
