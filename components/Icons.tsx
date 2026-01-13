
import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export const IconHome: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 9.5L12 3L21 9.5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V9.5Z" />
    <path d="M9 21V12H15V21" />
  </svg>
);

export const IconJourney: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3C12 3 17 8 17 12C17 16 12 21 12 21M12 3C12 3 7 8 7 12C7 16 12 21 12 21" strokeOpacity="0.3" />
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8V12L14 14" />
  </svg>
);

export const IconSupport: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-13.4 8.38 8.38 0 0 1 3.8.9L21 3z" />
    <path d="M12 12h.01" strokeWidth="3" />
    <path d="M8 12h.01" strokeWidth="3" />
    <path d="M16 12h.01" strokeWidth="3" />
  </svg>
);

export const IconJournal: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M10 7h6" strokeOpacity="0.5" />
    <path d="M10 11h6" strokeOpacity="0.5" />
    <path d="M10 15h4" strokeOpacity="0.5" />
  </svg>
);

export const IconPlanner: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="6" />
    <path d="M8 2v4M16 2v4M3 10h18" />
    <circle cx="8" cy="14" r="1.2" fill="currentColor" />
    <circle cx="12" cy="14" r="1.2" fill="currentColor" />
    <circle cx="16" cy="14" r="1.2" fill="currentColor" />
    <circle cx="8" cy="18" r="1.2" fill="currentColor" />
    <circle cx="12" cy="18" r="1.2" fill="currentColor" />
    <circle cx="16" cy="18" r="1.2" fill="currentColor" />
  </svg>
);

export const IconTools: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

export const IconRewards: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 9l6 13 6-13" />
    <path d="M6 9l6-7 6 7" />
    <path d="M2 9h20L12 22 2 9z" />
    <path d="M12 22V9" strokeOpacity="0.3" />
  </svg>
);

export const IconMoodGreat: React.FC<IconProps> = ({ className = "w-8 h-8", size = 32, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <path d="M9 9h.01" strokeWidth="2.5" />
    <path d="M15 9h.01" strokeWidth="2.5" />
    <path d="M12 2v2" strokeOpacity="0.5" />
    <path d="M12 20v2" strokeOpacity="0.5" />
    <path d="M2 12h2" strokeOpacity="0.5" />
    <path d="M20 12h2" strokeOpacity="0.5" />
  </svg>
);

export const IconMoodGood: React.FC<IconProps> = ({ className = "w-8 h-8", size = 32, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 15s1.5 1.5 4 1.5 4-1.5 4-1.5" />
    <path d="M9 9h.01" strokeWidth="2.5" />
    <path d="M15 9h.01" strokeWidth="2.5" />
  </svg>
);

export const IconMoodNeutral: React.FC<IconProps> = ({ className = "w-8 h-8", size = 32, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="8" y1="14" x2="16" y2="14" />
    <path d="M9 9h.01" strokeWidth="2.5" />
    <path d="M15 9h.01" strokeWidth="2.5" />
  </svg>
);

export const IconMoodStruggling: React.FC<IconProps> = ({ className = "w-8 h-8", size = 32, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
    <path d="M9 9h.01" strokeWidth="2.5" />
    <path d="M15 9h.01" strokeWidth="2.5" />
  </svg>
);

export const IconMoodCrisis: React.FC<IconProps> = ({ className = "w-8 h-8", size = 32, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 14v2" />
    <path d="M12 18h.01" strokeWidth="2.5" />
    <path d="M8 10l2-1" />
    <path d="M16 10l-2-1" />
  </svg>
);

export const IconTarget: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" strokeOpacity="0.4" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const IconLotus: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 21C12 21 17 17 17 12C17 7 12 3 12 3C12 3 7 7 7 12C7 17 12 21 12 21Z" />
    <path d="M12 21C12 21 21 17 21 12C21 7 15 7 15 7" />
    <path d="M12 21C12 21 3 17 3 12C3 7 9 7 9 7" />
  </svg>
);

export const IconShield: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const IconWind: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9.59 4.59A2 2 0 1 1 11 8H2" />
    <path d="M12.59 19.41A2 2 0 1 0 14 16H2" />
    <path d="M15.59 12.41A2 2 0 1 1 17 9H2" />
  </svg>
);

export const IconUser: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const IconUsers: React.FC<IconProps> = ({ className = "w-6 h-6", size = 24, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
