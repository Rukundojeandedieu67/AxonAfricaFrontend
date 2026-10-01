import { useEffect, useRef, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  /** stagger delay in ms (motion only; content stays visible) */
  delay?: number
  variant?: 'up' | 'fade' | 'left' | 'scale'
}

/** Soft motion on enter — never hides content while waiting for hover/scroll. */
export function Reveal({ children, className = '', delay = 0, variant = 'up' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Always show immediately so nothing depends on hover or scroll to appear.
    const show = () => el.classList.add('is-visible')

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      show()
      return
    }

    const timer = window.setTimeout(show, Math.min(delay, 400))
    return () => window.clearTimeout(timer)
  }, [delay])

  return (
    <div
      ref={ref}
      className={`reveal reveal--${variant} is-visible ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
