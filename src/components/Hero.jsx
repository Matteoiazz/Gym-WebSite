import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

export default function Hero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%'])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  const go = (sel) => document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-onyx-950">
      <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-0">
        <img
          src="/images/hero-floor.jpg"
          alt="La sala attrezzi di Muscle &amp; Fitness a Spezzano Piccolo"
          className="h-full w-full object-cover"
          fetchpriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx-950 via-onyx-950/55 to-onyx-950/70" />
      </motion.div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-6 pb-20 sm:px-10 lg:pb-28"
      >
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="display max-w-5xl text-[16vw] text-onyx-50 sm:text-[12vw] lg:text-[clamp(4rem,8vw,6rem)]"
        >
          Allenati
          <br />
          quando
          <br />
          vuoi tu
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          className="mt-8 flex flex-col gap-8 border-t border-white/15 pt-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <p className="max-w-md text-base leading-relaxed text-onyx-200">
            Sala pesi Technogym, Panatta e Diamond. Piscina, ring, area
            crosstraining. Entri con il tuo badge dalle 06:00 alle 24:00, sette
            giorni su sette, a Spezzano Piccolo.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => go('#prezzi')} className="btn-primary">
              Scegli il tuo accesso
            </button>
            <button onClick={() => go('#discipline')} className="btn-ghost">
              Guarda la struttura
            </button>
          </div>
        </motion.div>
      </motion.div>

      <button
        onClick={() => go('#discipline')}
        aria-label="Scorri alla sezione successiva"
        className="absolute bottom-7 right-6 z-10 hidden h-11 w-11 items-center justify-center rounded-full border border-white/20 text-onyx-200 transition duration-300 ease-out hover:border-white/60 hover:text-onyx-50 lg:flex"
      >
        <ArrowDown className="h-4 w-4" />
      </button>
    </section>
  )
}
