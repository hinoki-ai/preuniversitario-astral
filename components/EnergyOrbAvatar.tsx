'use client';

import React from 'react';

import { cn } from '@/lib/utils';

interface EnergyOrbAvatarProps {
  userId: string;
  size?: number;
  className?: string;
}

// Magical color palettes for the energy orbs
const colorPalettes = [
  // Cosmic Purple
  ['#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE', '#E9D5FF'],
  // Ocean Blue
  ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
  // Mystic Green
  ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'],
  // Ethereal Cyan
  ['#06B6D4', '#22D3EE', '#67E8F9', '#A5F3FC', '#CFFAFE'],
  // Aurora Purple
  ['#7C3AED', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'],
  // Nebula Pink
  ['#EC4899', '#F472B6', '#F9A8D4', '#FBCFE8', '#FCE7F3'],
  // Quantum Teal
  ['#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4', '#CCFBF1'],
  // Void Indigo
  ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF'],
];

function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) / 2147483647; // Normalize to [0, 1)
}

function generateOrbData(userId: string) {
  const seed = seededRandom(userId);

  // Select color palette based on seed
  const paletteIndex = Math.floor(seed * colorPalettes.length);
  const palette = colorPalettes[paletteIndex];

  // Generate unique swirling pattern parameters
  const rotation = seed * 360;
  const scale = 0.8 + seed * 0.4; // 0.8 to 1.2
  const offsetX = (seed - 0.5) * 20;
  const offsetY = (seed * 2 - 1) * 15;

  return {
    palette,
    rotation,
    scale,
    offsetX,
    offsetY,
    seed,
  };
}

export function EnergyOrbAvatar({ userId, size = 40, className }: EnergyOrbAvatarProps) {
  const orbData = generateOrbData(userId);

  // Generate unique swirling paths based on seed
  const generateSwirlPath = (index: number) => {
    const angle = (index / 8) * Math.PI * 2 + orbData.seed * Math.PI;
    const radius = 15 + Math.sin(angle * 3) * 5;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  };

  const swirlPath = Array.from({ length: 16 }, (_, i) => generateSwirlPath(i)).join(' ') + ' Z';

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden border-2 border-white/20 shadow-lg',
        className
      )}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg width={size} height={size} viewBox="-25 -25 50 50" className="absolute inset-0">
        <defs>
          {/* Radial gradient for the orb base */}
          <radialGradient id={`orb-gradient-${userId}`} cx="30%" cy="30%">
            <stop offset="0%" stopColor={orbData.palette[0]} stopOpacity="0.9" />
            <stop offset="40%" stopColor={orbData.palette[1]} stopOpacity="0.7" />
            <stop offset="70%" stopColor={orbData.palette[2]} stopOpacity="0.5" />
            <stop offset="100%" stopColor={orbData.palette[3]} stopOpacity="0.2" />
          </radialGradient>

          {/* Swirling energy pattern */}
          <radialGradient id={`energy-gradient-${userId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={orbData.palette[4]} stopOpacity="0.8" />
            <stop offset="50%" stopColor={orbData.palette[2]} stopOpacity="0.6" />
            <stop offset="100%" stopColor={orbData.palette[0]} stopOpacity="0.3" />
          </radialGradient>

          {/* Turbulence filter for organic texture */}
          <filter id={`turbulence-${userId}`}>
            <feTurbulence
              baseFrequency={`${0.01 + orbData.seed * 0.02}`}
              numOctaves="3"
              result="turbulence"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale={`${2 + orbData.seed * 3}`}
            />
          </filter>

          {/* Glow effect */}
          <filter id={`glow-${userId}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer glow ring */}
        <circle
          cx="0"
          cy="0"
          r="22"
          fill="none"
          stroke={orbData.palette[1]}
          strokeWidth="1"
          opacity="0.3"
          filter={`url(#glow-${userId})`}
        />

        {/* Main orb */}
        <circle
          cx="0"
          cy="0"
          r="18"
          fill={`url(#orb-gradient-${userId})`}
          filter={`url(#turbulence-${userId})`}
          transform={`rotate(${orbData.rotation}) scale(${orbData.scale}) translate(${orbData.offsetX} ${orbData.offsetY})`}
        />

        {/* Energy swirl overlay */}
        <path
          d={swirlPath}
          fill="none"
          stroke={orbData.palette[4]}
          strokeWidth="1.5"
          opacity="0.7"
          filter={`url(#glow-${userId})`}
          transform={`rotate(${orbData.rotation * 1.3}) scale(${orbData.scale * 0.8})`}
        />

        {/* Inner energy core */}
        <circle
          cx="0"
          cy="0"
          r="8"
          fill={`url(#energy-gradient-${userId})`}
          opacity="0.8"
          transform={`scale(${0.8 + orbData.seed * 0.4})`}
        />

        {/* Sparkle effects */}
        {Array.from({ length: 5 }, (_, i) => {
          const angle = (i / 5) * Math.PI * 2 + orbData.seed * Math.PI * 2;
          const distance = 12 + orbData.seed * 3;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={1 + orbData.seed}
              fill={orbData.palette[Math.floor(orbData.seed * 3)]}
              opacity="0.6"
            />
          );
        })}
      </svg>
    </div>
  );
}
