import { useEffect, useRef, useState } from 'react'

type Props = {
  value: string
  label: string
  durationMs?: number
}

/** Animates numeric prefixes like "15–25" (uses first number) or "100%" / "3". */
export function AnimatedStat({ value, label, durationMs = 1200 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [display, setDisplay] = useState(value)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const match = value.match(/(\d+)/)
    if (reduce || !match) {
      setDisplay(value)
      return
    }

    const target = Number(match[1])
    const suffix = value.slice(match.index! + match[1].length)
    const prefix = value.slice(0, match.index)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / durationMs)
          const eased = 1 - Math.pow(1 - t, 3)
          const current = Math.round(target * eased)
          setDisplay(`${prefix}${current}${suffix}`)
          if (t < 1) requestAnimationFrame(tick)
          else setDisplay(value)
        }
        requestAnimationFrame(tick)
        observer.disconnect()
      },
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, durationMs])

  return (
    <div ref={ref}>
      <strong>{display}</strong>
      <span>{label}</span>
    </div>
  )
}
