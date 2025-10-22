import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"

/**
 * Simple Highlighter Component
 * More reliable alternative to rough-notation for text highlighting
 */
export function SimpleHighlighter({
  children,
  action = "highlight",
  color = "#ffd1dc",
  delay = 0
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-10%" })
  const [shouldAnimate, setShouldAnimate] = useState(false)

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setShouldAnimate(true), delay)
      return () => clearTimeout(timer)
    }
  }, [isInView, delay])

  const getStyles = () => {
    switch (action) {
      case "highlight":
        return {
          background: `linear-gradient(120deg, ${color}00 0%, ${color}00 50%, ${color} 50%, ${color} 100%)`,
          backgroundSize: shouldAnimate ? "200% 100%" : "200% 100%",
          backgroundPosition: shouldAnimate ? "-100% 0" : "100% 0",
          transition: "background-position 0.8s ease-out"
        }
      case "underline":
        return {
          position: "relative",
          paddingBottom: "2px"
        }
      case "box":
        return {
          border: `2px solid ${color}`,
          padding: "2px 4px",
          borderRadius: "4px"
        }
      case "circle":
        return {
          border: `2px solid ${color}`,
          padding: "2px 8px",
          borderRadius: "50px"
        }
      default:
        return {}
    }
  }

  return (
    <span
      ref={ref}
      className="relative inline-block"
      style={getStyles()}
    >
      {children}
      {action === "underline" && (
        <motion.span
          className="absolute bottom-0 left-0 h-[2px]"
          style={{ 
            backgroundColor: color,
            width: "100%"
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: shouldAnimate ? 1 : 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      )}
      {action === "strike" && (
        <motion.span
          className="absolute top-1/2 left-0 h-[2px]"
          style={{ 
            backgroundColor: color,
            width: "100%",
            transform: "translateY(-50%)"
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: shouldAnimate ? 1 : 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      )}
    </span>
  )
}
