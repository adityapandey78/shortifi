import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Tilted Card Component
 * Cards with 3D tilt effect on hover
 */
export function TiltedCard({ className, children, tiltDegree = 5 }) {
  return (
    <motion.div
      className={cn(
        "relative perspective-1000",
        className
      )}
      whileHover={{
        rotateY: tiltDegree,
        rotateX: -tiltDegree / 2,
        scale: 1.05,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      <div className="relative bg-card border rounded-lg shadow-lg backdrop-blur-sm"
           style={{ transform: "translateZ(50px)" }}>
        {children}
      </div>
    </motion.div>
  )
}

/**
 * Tilted Cards Grid
 */
export function TiltedCardsGrid({ children, className }) {
  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
      className
    )}>
      {children}
    </div>
  )
}
