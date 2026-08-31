import React from 'react';
import { FloralTheme } from '../types';

interface RoseCornerProps {
  theme: FloralTheme;
  className?: string;
  variant?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Botanical Rose & Frost Botanical Frame Corner with blooming English garden roses,
 * layered petals, frosty winter leaves, golden glitter tendrils, and crystalline sparkles.
 */
export const BotanicalRoseFrameCorner: React.FC<RoseCornerProps> = ({
  theme,
  className = '',
  variant = 'top-left',
}) => {
  let transform = '';
  if (variant === 'top-right') transform = 'scale-x-[-1]';
  if (variant === 'bottom-left') transform = 'scale-y-[-1]';
  if (variant === 'bottom-right') transform = 'scale-[-1]';

  const isWinterTone = ['frostyWinter', 'frostedRose', 'icySlate', 'dustyBlue'].includes(theme.floralTone);

  return (
    <div className={`pointer-events-none select-none overflow-visible ${transform} ${className}`}>
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id={`goldTendril-${variant}`} x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DFC186" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#F7EAC4" stopOpacity="1" />
            <stop offset="100%" stopColor="#A88242" stopOpacity="0.8" />
          </linearGradient>

          <radialGradient id={`winterRoseGrad-${variant}`} cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="40%" stopColor={isWinterTone ? '#DDE8F0' : '#FCE8EC'} stopOpacity="0.9" />
            <stop offset="85%" stopColor={isWinterTone ? '#8EAEC4' : '#E5A5B5'} stopOpacity="0.8" />
            <stop offset="100%" stopColor={isWinterTone ? '#537894' : '#C27488'} stopOpacity="0.7" />
          </radialGradient>

          <radialGradient id={`miniRoseGrad-${variant}`} cx="45%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="50%" stopColor={isWinterTone ? '#B8CEE0' : '#F4BDCA'} stopOpacity="0.85" />
            <stop offset="100%" stopColor={isWinterTone ? '#6C90AC' : '#D08498'} stopOpacity="0.75" />
          </radialGradient>

          <radialGradient id={`frostLeafGrad-${variant}`} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor={isWinterTone ? '#9AB3A8' : '#A7BFA8'} stopOpacity="0.85" />
            <stop offset="100%" stopColor={isWinterTone ? '#3B5950' : '#4E6B52'} stopOpacity="0.8" />
          </radialGradient>
        </defs>

        {/* Vintage Filigree Corner Flourish */}
        <path
          d="M 6 6 L 6 70 C 6 45, 20 20, 45 12 C 70 6, 95 6, 120 6"
          stroke={`url(#goldTendril-${variant})`}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M 12 12 L 12 55 C 12 35, 25 22, 45 16 C 65 12, 85 12, 105 12"
          stroke={`url(#goldTendril-${variant})`}
          strokeWidth="0.8"
          strokeDasharray="2 3"
          opacity="0.8"
        />

        {/* Frost Botanical Sprigs & Pine Needles */}
        <g opacity="0.75">
          <path d="M 15 15 Q 50 40 85 55" stroke="#7E9BA8" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="30" y1="26" x2="26" y2="18" stroke="#9BB2BE" strokeWidth="1" strokeLinecap="round" />
          <line x1="45" y1="36" x2="43" y2="26" stroke="#9BB2BE" strokeWidth="1" strokeLinecap="round" />
          <line x1="60" y1="44" x2="62" y2="34" stroke="#9BB2BE" strokeWidth="1" strokeLinecap="round" />
          <line x1="75" y1="50" x2="80" y2="40" stroke="#9BB2BE" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Winter/Eucalyptus Leaves */}
        <g>
          <ellipse cx="28" cy="45" rx="10" ry="18" transform="rotate(-30 28 45)" fill={`url(#frostLeafGrad-${variant})`} opacity="0.85" />
          <ellipse cx="48" cy="28" rx="10" ry="18" transform="rotate(35 48 28)" fill={`url(#frostLeafGrad-${variant})`} opacity="0.85" />
          <ellipse cx="65" cy="50" rx="9" ry="15" transform="rotate(55 65 50)" fill={`url(#frostLeafGrad-${variant})`} opacity="0.8" />
          <ellipse cx="50" cy="65" rx="8" ry="14" transform="rotate(-15 50 65)" fill={`url(#frostLeafGrad-${variant})`} opacity="0.75" />
        </g>

        {/* Golden Berries */}
        <circle cx="78" cy="36" r="2.8" fill="#DFC186" stroke="#FFFFFF" strokeWidth="0.5" />
        <circle cx="88" cy="30" r="2.2" fill="#DFC186" stroke="#FFFFFF" strokeWidth="0.5" />
        <circle cx="34" cy="78" r="2.8" fill="#DFC186" stroke="#FFFFFF" strokeWidth="0.5" />
        <circle cx="28" cy="88" r="2.2" fill="#DFC186" stroke="#FFFFFF" strokeWidth="0.5" />

        {/* Secondary Rosebud */}
        <g transform="translate(48, 48) scale(0.65)">
          <circle cx="20" cy="20" r="18" fill={`url(#miniRoseGrad-${variant})`} />
          <path d="M 12 14 C 18 8, 28 8, 30 18 C 30 26, 20 28, 14 22 Z" fill="#FFFFFF" opacity="0.6" />
          <path d="M 15 20 C 18 16, 25 18, 24 24 C 22 28, 16 26, 15 20 Z" fill={isWinterTone ? '#537894' : '#C27488'} opacity="0.65" />
          <circle cx="20" cy="20" r="2" fill="#DFC186" />
        </g>

        {/* Primary English Garden Winter Rose */}
        <g transform="translate(14, 14)">
          {/* Outer Layer of Velvety Petals */}
          <path
            d="M 22 5 C 34 0, 42 12, 40 22 C 38 34, 25 38, 15 32 C 5 26, 8 10, 22 5 Z"
            fill={`url(#winterRoseGrad-${variant})`}
          />
          <path
            d="M 10 18 C 4 28, 14 40, 26 38 C 38 36, 42 22, 34 14 C 24 6, 16 8, 10 18 Z"
            fill={`url(#winterRoseGrad-${variant})`}
            opacity="0.9"
          />
          <path
            d="M 25 10 C 36 12, 38 26, 30 34 C 22 42, 10 35, 12 24 C 14 14, 18 8, 25 10 Z"
            fill={`url(#winterRoseGrad-${variant})`}
            opacity="0.95"
          />

          {/* Intricate Swirling Rose Petal Center */}
          <path
            d="M 18 16 C 24 12, 30 16, 28 22 C 26 28, 18 28, 16 22 C 14 18, 16 14, 18 16 Z"
            fill="#FFFFFF"
            opacity="0.8"
          />
          <path
            d="M 20 18 C 24 15, 27 18, 26 22 C 24 25, 19 25, 18 21 Z"
            fill={isWinterTone ? '#43657D' : '#9E4E63'}
            opacity="0.75"
          />
          <path
            d="M 22 19 C 24 18, 26 20, 25 22 C 24 24, 21 24, 21 21 Z"
            fill="#DFC186"
          />

          {/* Frost Sparkles / Dewdrops */}
          <circle cx="28" cy="12" r="1.5" fill="#FFFFFF" opacity="0.95" />
          <circle cx="12" cy="24" r="1.2" fill="#FFFFFF" opacity="0.95" />
        </g>
      </svg>
    </div>
  );
};

/**
 * Botanical Rose & Vine Header Ornament for Section Titles
 */
export const BotanicalRoseHeaderOrnament: React.FC<{ theme: FloralTheme; className?: string }> = ({
  theme,
  className = '',
}) => {
  const isWinterTone = ['frostyWinter', 'frostedRose', 'icySlate', 'dustyBlue'].includes(theme.floralTone);

  return (
    <div className={`flex items-center justify-center gap-3 my-3 pointer-events-none select-none ${className}`}>
      {/* Left Rose Stem & Leaves */}
      <svg width="60" height="24" viewBox="0 0 60 24" fill="none" className="opacity-85">
        <path d="M 0 12 Q 35 12 55 12" stroke="#DFC186" strokeWidth="1" strokeDasharray="3 2" />
        <ellipse cx="20" cy="8" rx="5" ry="9" transform="rotate(-30 20 8)" fill={isWinterTone ? '#7895A2' : '#A3B18A'} opacity="0.75" />
        <ellipse cx="38" cy="16" rx="4" ry="7" transform="rotate(30 38 16)" fill={isWinterTone ? '#4A6B7A' : '#588157'} opacity="0.7" />
        <circle cx="10" cy="12" r="2" fill="#DFC186" />
      </svg>

      {/* Center Blooming Rose Emblem */}
      <div className="relative w-8 h-8 flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" fill="#FFFFFF" stroke="#DFC186" strokeWidth="1" />
          {/* Layered Rose Petals */}
          <ellipse cx="16" cy="12" rx="7" ry="5" fill={isWinterTone ? '#B8CEE0' : '#E8B4B8'} opacity="0.8" />
          <ellipse cx="12" cy="18" rx="6" ry="6" fill={isWinterTone ? '#8EAEC4' : '#D494A2'} opacity="0.85" />
          <ellipse cx="20" cy="18" rx="6" ry="6" fill={isWinterTone ? '#8EAEC4' : '#D494A2'} opacity="0.85" />
          <circle cx="16" cy="16" r="5" fill="#FFFFFF" opacity="0.9" />
          <circle cx="16" cy="16" r="2.5" fill={isWinterTone ? '#43657D' : '#A35368'} />
          <circle cx="16" cy="16" r="1" fill="#DFC186" />
        </svg>
      </div>

      {/* Right Rose Stem & Leaves */}
      <svg width="60" height="24" viewBox="0 0 60 24" fill="none" className="opacity-85 scale-x-[-1]">
        <path d="M 0 12 Q 35 12 55 12" stroke="#DFC186" strokeWidth="1" strokeDasharray="3 2" />
        <ellipse cx="20" cy="8" rx="5" ry="9" transform="rotate(-30 20 8)" fill={isWinterTone ? '#7895A2' : '#A3B18A'} opacity="0.75" />
        <ellipse cx="38" cy="16" rx="4" ry="7" transform="rotate(30 38 16)" fill={isWinterTone ? '#4A6B7A' : '#588157'} opacity="0.7" />
        <circle cx="10" cy="12" r="2" fill="#DFC186" />
      </svg>
    </div>
  );
};
