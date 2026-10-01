import { useEffect, useRef } from 'react'
import './StagePath.css'

type Props = {
  animated?: boolean
  compact?: boolean
  /** Draw line when scrolled into view */
  drawOnView?: boolean
}

const stages = [
  { id: 'seed', label: 'Seed', sub: 'Learn & define' },
  { id: 'plant', label: 'Plant', sub: 'Build & test' },
  { id: 'canopy', label: 'Canopy', sub: 'Grow & sustain' },
] as const

export function StagePath({ animated = true, compact = false, drawOnView = false }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!drawOnView || !ref.current) return
    const el = ref.current
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('stage-path--drawn')
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('stage-path--drawn')
          observer.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [drawOnView])

  return (
    <div
      ref={ref}
      className={[
        'stage-path',
        animated && !drawOnView ? 'stage-path--animated' : '',
        drawOnView ? 'stage-path--view' : '',
        compact ? 'stage-path--compact' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="Seed, Plant, Canopy pathway"
    >
      <svg className="stage-path__line" viewBox="0 0 320 24" preserveAspectRatio="none" aria-hidden>
        <path d="M8 12 H312" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <ol className="stage-path__list">
        {stages.map((stage, i) => (
          <li
            key={stage.id}
            className={`stage-path__item stage-path__item--${stage.id}`}
            style={{ animationDelay: `${0.2 + i * 0.18}s` }}
          >
            <span className="stage-path__dot" aria-hidden />
            <span className="stage-path__label">{stage.label}</span>
            {!compact && <span className="stage-path__sub">{stage.sub}</span>}
          </li>
        ))}
      </ol>
    </div>
  )
}
