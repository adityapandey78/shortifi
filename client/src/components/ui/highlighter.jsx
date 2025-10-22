import { useEffect, useRef } from "react"
import { useInView } from "motion/react"
import { annotate } from "rough-notation"

/**
 * Magic UI Highlighter Component
 * Uses rough-notation for hand-drawn style annotations
 */
export function Highlighter({
  children,
  action = "highlight",
  color = "#ffd1dc",
  strokeWidth = 2,
  animationDuration = 800,
  iterations = 1,
  padding = 5,
  multiline = false,
  isView = false
}) {
  const elementRef = useRef(null)
  const annotationRef = useRef(null)

  const isInView = useInView(elementRef, {
    once: true,
    margin: "-20%",
  })

  // If isView is false, always show. If isView is true, wait for inView
  const shouldShow = !isView || isInView

  useEffect(() => {
    if (!shouldShow) return

    const element = elementRef.current
    if (!element) return

    // Wait for DOM to be fully rendered and fonts loaded
    const timeoutId = setTimeout(() => {
      if (!element || !element.offsetParent) return

      const annotationConfig = {
        type: action,
        color,
        strokeWidth,
        animationDuration,
        iterations,
        padding,
        multiline,
        // Additional config for better positioning
        brackets: action === "bracket" ? ["left", "right"] : undefined,
      }

      try {
        const annotation = annotate(element, annotationConfig)
        annotationRef.current = annotation
        
        // Use double RAF for better stability
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (annotationRef.current) {
              annotationRef.current.show()
            }
          })
        })
      } catch (error) {
        console.error("Highlighter annotation error:", error)
      }
    }, 200)

    // Handle window resize
    const handleResize = () => {
      if (annotationRef.current) {
        annotationRef.current.hide()
        setTimeout(() => {
          if (annotationRef.current) {
            annotationRef.current.show()
          }
        }, 50)
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener("resize", handleResize)
      if (annotationRef.current) {
        try {
          annotationRef.current.remove()
        } catch (error) {
          // Ignore removal errors
        }
      }
    };
  }, [
    shouldShow,
    action,
    color,
    strokeWidth,
    animationDuration,
    iterations,
    padding,
    multiline,
  ])

  return (
    <span 
      ref={elementRef}
      className="relative inline-block mx-0.5"
      style={{ 
        lineHeight: 'inherit',
        whiteSpace: multiline ? 'normal' : 'nowrap',
      }}
    >
      {children}
    </span>
  );
}
