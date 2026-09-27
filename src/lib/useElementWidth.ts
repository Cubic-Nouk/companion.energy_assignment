import { useCallback, useState } from 'react'

/**
 * Tracks an element's content width, so an SVG can be drawn at its real size and keep text
 * crisp and unscaled. Returns a callback ref to attach and the current width (0 until measured).
 */
export function useElementWidth(): [(node: HTMLElement | null) => void, number] {
  const [width, setWidth] = useState(0)

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return undefined
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width)
    })
    observer.observe(node)
    // React 19 runs a callback ref's returned function when the node detaches.
    return () => {
      observer.disconnect()
    }
  }, [])

  return [ref, width]
}
