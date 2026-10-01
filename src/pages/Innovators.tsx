import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, unwrapList, type Innovator } from '../api/client'
import { MediaFrame } from '../components/MediaFrame'
import { Reveal } from '../components/Reveal'
import { siteMedia } from '../data/siteMedia'

export function InnovatorsPage() {
  const [innovators, setInnovators] = useState<Innovator[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const data = await api.innovators()
        if (alive) setInnovators(unwrapList(data))
      } catch {
        if (alive) setInnovators([])
      } finally {
        if (alive) setLoaded(true)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow eyebrow--on-dark">Innovators</p>
          <h1>The people building health in Africa.</h1>
          <p>
            {innovators.length
              ? 'Meet the innovators whose public profiles are live.'
              : 'Meet Cohort 1 — applications are open. Profiles appear here after selection.'}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {!loaded ? (
            <p>Loading…</p>
          ) : innovators.length === 0 ? (
            <div className="media-story__grid">
              <Reveal>
                <div className="card card--soft">
                  <h2 style={{ color: 'var(--deep-green)' }}>Meet Cohort 1</h2>
                  <p>
                    The gallery grows every cycle. Until innovator profiles are published, the main
                    action is to apply.
                  </p>
                  <Link to="/apply" className="btn btn--gold">
                    Apply to Cohort 1
                  </Link>
                </div>
              </Reveal>
              <Reveal delay={120} variant="scale">
                <MediaFrame
                  videoSrc={siteMedia.innovators.introVideo || siteMedia.home.highlightVideo}
                  aspect="4/3"
                  caption="Cohort intro clip — set VITE_INNOVATORS_VIDEO_URL for your film."
                  placeholderLabel="Cohort portrait grid"
                />
              </Reveal>
            </div>
          ) : (
            <div className="grid-3">
              {innovators.map((person, i) => (
                <Reveal key={person.id} delay={i * 70}>
                  <article className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <MediaFrame
                      src={person.photo}
                      alt={person.full_name}
                      aspect="4/3"
                      placeholderLabel={person.full_name}
                    />
                    <div style={{ padding: '1.15rem 1.25rem 1.4rem' }}>
                      <p className="eyebrow eyebrow--leaf">{person.current_stage || 'Innovator'}</p>
                      <h3 style={{ color: 'var(--deep-green)', fontSize: '1.15rem' }}>
                        {person.full_name}
                      </h3>
                      <p style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                        {person.project_title}
                      </p>
                      <p style={{ margin: 0 }}>{person.project_summary}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
