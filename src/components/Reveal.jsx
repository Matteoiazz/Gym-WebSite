import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

// The page's single motion signature: photos uncover while settling from a push-in; type never animates here.
export default function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-12% 0px' })

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ clipPath: 'inset(0 0 100% 0)', scale: 1.12 }}
        animate={inView ? { clipPath: 'inset(0 0 0% 0)', scale: 1 } : undefined}
        transition={{
          clipPath: { duration: 1.1, ease: [0.16, 1, 0.3, 1], delay },
          scale: { duration: 1.6, ease: [0.16, 1, 0.3, 1], delay },
        }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </div>
  )
}
