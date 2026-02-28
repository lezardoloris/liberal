import { type SVGProps } from 'react';

/**
 * Custom chainsaw (tronçonneuse) icon — stroke-based, matches lucide style.
 * Designed for the "Tronçonneuse d'Or" ranking theme.
 */
export function ChainsawIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Blade bar */}
      <path d="M2 9.5h11a3 3 0 0 1 0 6H7" />
      {/* Chain teeth along blade */}
      <path d="M4 9.5V8m3 1.5V8m3 1.5V8" />
      <path d="M9 15.5V17m-3-1.5V17" />
      {/* Motor housing */}
      <rect x="13" y="7" width="8" height="11" rx="2" />
      {/* Handle grip */}
      <path d="M17 11v3" />
      {/* Exhaust */}
      <path d="M21 9.5h1" />
    </svg>
  );
}
