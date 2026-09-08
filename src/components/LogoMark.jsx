import { useId } from 'react'

// Brand mark: a "verified score" badge — gradient tile, partial score ring
// (echoes the ScoreRing used across the site) and a white check.
export default function LogoMark({ size = 40 }) {
  const gradId = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg
      className="logo-mark"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0d3a27" />
          <stop offset="1" stopColor="#0e7a4f" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill={`url(#${gradId})`} />
      <circle
        cx="24"
        cy="24"
        r="12.5"
        fill="none"
        stroke="#4ade80"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeDasharray="67 79"
        transform="rotate(-90 24 24)"
      />
      <path
        d="M17.6 24.4 L22.2 29 L30.8 19"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
