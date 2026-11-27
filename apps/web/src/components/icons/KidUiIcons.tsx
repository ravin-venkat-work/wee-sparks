"use client";

interface IconProps {
  className?: string;
}

export function HomeIconSvg({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M5 15 L16 5 L27 15"
        fill="none"
        stroke="#0369A1"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 14 V26 H24 V14"
        fill="#E0F2FE"
        stroke="#0369A1"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <rect x="13.5" y="18" width="5" height="8" rx="1.5" fill="#F59E0B" />
    </svg>
  );
}

export function StarIconSvg({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M16 3 L19.8 11.2 L28.8 12.2 L22.1 18.4 L23.9 27.3 L16 22.8 L8.1 27.3 L9.9 18.4 L3.2 12.2 L12.2 11.2 Z"
        fill="#FACC15"
        stroke="#CA8A04"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparklesIconSvg({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M14 4 L16.4 11.6 L24 14 L16.4 16.4 L14 24 L11.6 16.4 L4 14 L11.6 11.6 Z"
        fill="#F59E0B"
      />
      <path
        d="M24 18 L25.2 21.8 L29 23 L25.2 24.2 L24 28 L22.8 24.2 L19 23 L22.8 21.8 Z"
        fill="#10B981"
      />
    </svg>
  );
}

export function ChestIconSvg({ className = "h-8 w-8" }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect
        x="5"
        y="15"
        width="30"
        height="19"
        rx="4"
        fill="#B45309"
        stroke="#78350F"
        strokeWidth="2.4"
      />
      <path
        d="M5 17 C5 10 11 8 20 8 C29 8 35 10 35 17 Z"
        fill="#D97706"
        stroke="#78350F"
        strokeWidth="2.4"
      />
      <rect x="5" y="16" width="30" height="4" fill="#FACC15" />
      <rect
        x="16.5"
        y="14.5"
        width="7"
        height="9"
        rx="2"
        fill="#FDE047"
        stroke="#92400E"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function BookIconSvg({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M4 8 C9 6 13 7 16 10 C19 7 23 6 28 8 V24 C23 22 19 23 16 26 C13 23 9 22 4 24 Z"
        fill="#FEF3C7"
        stroke="#B45309"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <line x1="16" y1="10" x2="16" y2="26" stroke="#B45309" strokeWidth="2.2" />
    </svg>
  );
}

export function HintBulbIconSvg({ className = "h-8 w-8" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M16 5 C10.8 5 7 9 7 13.8 C7 17.2 9.1 19.6 11 21.3 L11.5 24 H20.5 L21 21.3 C22.9 19.6 25 17.2 25 13.8 C25 9 21.2 5 16 5 Z"
        fill="#FDE047"
        stroke="#B45309"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <rect x="12" y="24" width="8" height="3.5" rx="1.5" fill="#64748B" />
      <path d="M13 13 Q16 10 19 13" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function ArrowRightIconSvg({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M6 16 H24 M17 9 L25 16 L17 23"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SkipForwardIconSvg({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <polygon points="7,8 19,16 7,24" fill="currentColor" />
      <rect x="21" y="8" width="4" height="16" rx="1.5" fill="currentColor" />
    </svg>
  );
}

export function PlayIconSvg({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <polygon points="9,6 26,16 9,26" fill="currentColor" />
    </svg>
  );
}

export function MoonCalmIconSvg({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M21 6 C13 6.5 7.5 12.5 8 20 C8.5 26.5 15.5 30 22.5 27.5 C16.5 26 14 20.5 15 15 C15.8 10.5 18 7.8 21 6 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function LockIconSvg({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M11 14 V11 C11 7.8 13.2 6 16 6 C18.8 6 21 7.8 21 11 V14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <rect
        x="8"
        y="14"
        width="16"
        height="13"
        rx="3.5"
        fill="currentColor"
      />
    </svg>
  );
}

export function HeartIconSvg({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M16 27 C16 27 5 20.5 5 12.5 C5 8.5 8.2 6 11.5 6 C13.8 6 15.2 7.2 16 8.8 C16.8 7.2 18.2 6 20.5 6 C23.8 6 27 8.5 27 12.5 C27 20.5 16 27 16 27 Z"
        fill="#F43F5E"
      />
    </svg>
  );
}

export function RetryLoopIconSvg({ className = "h-7 w-7" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M24 14 A8.5 8.5 0 1 0 22 22.5"
        fill="none"
        stroke="#B45309"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <polygon points="26,8 25,17 18,13" fill="#B45309" />
    </svg>
  );
}

export function SoundWaveIconSvg({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <polygon points="5,12 11,12 18,7 18,25 11,20 5,20" fill="currentColor" />
      <path
        d="M22 11 C24.5 13.5 24.5 18.5 22 21"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M25.5 8 C29.5 12.2 29.5 19.8 25.5 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MedalIconSvg({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <polygon points="10,4 16,14 22,4" fill="#0284C7" />
      <circle cx="16" cy="20" r="8.5" fill="#FACC15" stroke="#B45309" strokeWidth="2.2" />
      <path
        d="M16 15.5 L17.3 18.4 L20.5 18.8 L18.1 20.9 L18.8 24 L16 22.4 L13.2 24 L13.9 20.9 L11.5 18.8 L14.7 18.4 Z"
        fill="#FEF9C3"
      />
    </svg>
  );
}
