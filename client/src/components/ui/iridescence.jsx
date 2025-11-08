import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Iridescence Effect
 * Creates a shimmering, rainbow-like effect
 */
export function Iridescence({ className, intensity = 0.5 }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              135deg,
              rgba(255, 0, 255, ${intensity}) 0%,
              rgba(0, 255, 255, ${intensity}) 25%,
              rgba(255, 255, 0, ${intensity}) 50%,
              rgba(0, 255, 0, ${intensity}) 75%,
              rgba(255, 0, 255, ${intensity}) 100%
            )
          `,
          mixBlendMode: 'color-dodge',
          filter: 'blur(60px)',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          opacity: [intensity, intensity * 1.5, intensity],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              circle at center,
              rgba(255, 255, 255, ${intensity * 0.3}) 0%,
              transparent 70%
            )
          `,
          filter: 'blur(40px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [intensity * 0.5, intensity, intensity * 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}

/**
 * Iridescence Card
 */
export function IridescenceCard({ children, className }) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      <Iridescence intensity={0.3} />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
