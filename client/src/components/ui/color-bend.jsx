import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Color Bend Background
 * Creates a flowing, bending color gradient effect
 */
export function ColorBend({ className, colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'] }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${colors.join(', ')})`,
          filter: 'blur(100px)',
          opacity: 0.3,
        }}
        animate={{
          background: [
            `linear-gradient(135deg, ${colors.join(', ')})`,
            `linear-gradient(225deg, ${colors.reverse().join(', ')})`,
            `linear-gradient(315deg, ${colors.join(', ')})`,
            `linear-gradient(135deg, ${colors.reverse().join(', ')})`,
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute top-0 left-0 w-1/2 h-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,107,107,0.4) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{
          x: ['0%', '100%', '0%'],
          y: ['0%', '100%', '0%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(78,205,196,0.4) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{
          x: ['0%', '-100%', '0%'],
          y: ['0%', '-100%', '0%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  )
}
