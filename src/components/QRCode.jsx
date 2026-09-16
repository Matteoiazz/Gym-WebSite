import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

/**
 * Simulated QR code: deterministically derives a module grid from a seed string
 * so the same user always gets the same visual pattern. Not a real scannable code.
 */
function seededRandom(seed) {
  let value = 0
  for (let i = 0; i < seed.length; i++) {
    value = (value * 31 + seed.charCodeAt(i)) >>> 0
  }
  return function next() {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

export default function QRCode({ seed = 'muscle-fitness', size = 200, className = '' }) {
  const grid = useMemo(() => {
    const gridSize = 21
    const rand = seededRandom(seed)
    const cells = Array.from({ length: gridSize * gridSize }, () => rand() > 0.55)
    return { cells, gridSize }
  }, [seed])

  const cellSize = size / grid.gridSize
  const finderSize = cellSize * 7

  const Finder = ({ x, y }) => (
    <g transform={`translate(${x}, ${y})`}>
      <rect width={finderSize} height={finderSize} fill="#08090a" />
      <rect x={cellSize} y={cellSize} width={finderSize - cellSize * 2} height={finderSize - cellSize * 2} fill="#f4f6f9" />
      <rect x={cellSize * 2} y={cellSize * 2} width={finderSize - cellSize * 4} height={finderSize - cellSize * 4} fill="#08090a" />
    </g>
  )

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`rounded-[14px] bg-onyx-50 p-4 ${className}`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="QR code di accesso simulato">
        <rect width={size} height={size} fill="#f4f6f9" />
        {grid.cells.map((filled, idx) => {
          const col = idx % grid.gridSize
          const row = Math.floor(idx / grid.gridSize)
          const inTopLeft = col < 7 && row < 7
          const inTopRight = col >= grid.gridSize - 7 && row < 7
          const inBottomLeft = col < 7 && row >= grid.gridSize - 7
          if (inTopLeft || inTopRight || inBottomLeft) return null
          if (!filled) return null
          return (
            <rect
              key={idx}
              x={col * cellSize}
              y={row * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#08090a"
            />
          )
        })}
        <Finder x={0} y={0} />
        <Finder x={size - finderSize} y={0} />
        <Finder x={0} y={size - finderSize} />
      </svg>
    </motion.div>
  )
}
