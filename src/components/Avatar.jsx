import React, { useMemo } from 'react'

const TONES = [
  'bg-onyx-700 text-onyx-50',
  'bg-accent-800 text-accent-100',
  'bg-onyx-600 text-onyx-50',
  'bg-accent-700 text-accent-50',
]

function hashSeed(seed) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return h
}

export default function Avatar({ seed = 'user', name = '', size = 44, className = '' }) {
  const tone = useMemo(() => TONES[hashSeed(seed) % TONES.length], [seed])
  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return '?'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }, [name])

  return (
    <div
      aria-hidden="true"
      className={`flex shrink-0 select-none items-center justify-center rounded-full font-display font-bold ${tone} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  )
}
