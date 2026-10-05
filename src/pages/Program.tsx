import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, unwrapList, type Program, type ProgramStage } from '../api/client'
import { HeroBackgroundSlides } from '../components/HeroBackgroundSlides'
import { MediaFrame } from '../components/MediaFrame'
import { Reveal } from '../components/Reveal'
import { StagePath } from '../components/StagePath'
import { siteMedia } from '../data/siteMedia'

const faqs = [
  {
    q: 'Who owns my idea?',
    a: 'You do. Nothing is used or claimed by AxonAfrica or a partner without informed consent and a formal agreement.',
  },
  {
    q: 'How many are selected?',
    a: '15–25 innovators per cohort.',
  },
  {
    q: 'Do I need a team?',
    a: 'No — the Plant stage matches you with designers and technologists when you need them.',
  },
  {
    q: 'Is there a cost?',
    a: 'To be confirmed before applications open.',
  },
]

const fallbackStages: ProgramStage[] = [
  {
    id: 1,
    code: 'seed',
    name: 'Seed',
    subtitle: 'Learn & define',
    description:
      'Identify a real health problem and define a solution grounded in community needs.',
    order: 0,
    modules: [
      { id: 1, title: 'Identify a real health problem', description: '', order: 0 },
      { id: 2, title: 'Design a solution that matches real needs', description: '', order: 1 },
      { id: 3, title: 'Applied data & AI literacy', description: '', order: 2 },
      { id: 4, title: 'Rapid prototyping fundamentals', description: '', order: 3 },
      { id: 5, title: 'AI ethics across the project lifecycle', description: '', order: 4 },
    ],
  },
  {
    id: 2,
    code: 'plant',
    name: 'Plant',
    subtitle: 'Build & test',
    description:
      'Matched with designers and technologists, then prototype, test, and implement inside a partner institution.',
    order: 1,
    modules: [],
  },
  {
    id: 3,
    code: 'canopy',
    name: 'Canopy',
    subtitle: 'Grow & sustain',
    description: 'Keep building beyond the program, backed by the AxonAfrica innovator network.',
    order: 2,
    modules: [],
  },
]

export function ProgramPage() {
  const [stages, setStages] = useState<ProgramStage[]>(fallbackStages)
  const [programs, setPrograms] = useState<Program[]>([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [stageData, programData] = await Promise.all([
        api.stages().catch(() => null),
        api.programs().catch(() => null),
      ])
      if (!alive) return
      const nextStages = unwrapList(stageData).sort((a, b) => a.order - b.order)
      if (nextStages.length) setStages(nextStages)
      setPrograms(unwrapList(programData).sort((a, b) => a.order - b.order))
    })()
    return () => {
      alive = false
    }
  }, [])

  return (
    <>
      <section className="page-hero">
        <HeroBackgroundSlides />
        <div className="container">
          <p className="eyebrow eyebrow--on-dark">Digital Health Leaders Program</p>
          <h1>Where bold health ideas become deployed solutions.</h1>
          <p>
            The Digital Health Leaders Program takes young innovators through learning,
            team-building, and real-world testing, then connects them to institutions ready to put
            their work to use.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container media-story__grid">
          <Reveal variant="left">
            <p className="eyebrow eyebrow--leaf">In the body of the program</p>
            <h2 className="section-title">See the pathway in motion</h2>
            <p className="section-lead">
              A short walkthrough of Seed, Plant, and Canopy — swap this clip for your own program
              video anytime.
            </p>
          </Reveal>
          <Reveal delay={80} variant="scale">
            <MediaFrame
              videoSrc={siteMedia.program.pathwayVideo}
              poster={siteMedia.program.pathwayPoster || undefined}
              caption={siteMedia.program.pathwayCaption}
              placeholderLabel="Program walkthrough video"
            />
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <Reveal>
            <p className="eyebrow eyebrow--leaf">How it works</p>
            <h2 className="section-title">
              {stages.map((stage) => stage.name).join(' → ') || 'Seed → Plant → Canopy'}
            </h2>
            <StagePath compact animated={false} drawOnView />
          </Reveal>
          <div className="grid-3" style={{ marginTop: '1.75rem' }}>
            {stages.map((stage, index) => (
              <Reveal key={stage.id} delay={index * 80}>
                <article className="card">
                  <h3>
                    {stage.name}
                    {stage.subtitle ? ` — ${stage.subtitle}` : ''}
                  </h3>
                  {stage.modules.length > 0 ? (
                    <ul>
                      {stage.modules
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((module) => (
                          <li key={module.id}>{module.title}</li>
                        ))}
                    </ul>
                  ) : (
                    <p>{stage.description}</p>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {programs.length > 0 && (
        <section className="section">
          <div className="container">
            <Reveal>
              <p className="eyebrow eyebrow--leaf">Programs</p>
              <h2 className="section-title">What AxonAfrica runs</h2>
              <p className="section-lead">
                Live programs from the AxonAfrica API — including AXON HUB, the summit, and awards.
              </p>
            </Reveal>
            <div className="grid-3" style={{ marginTop: '1.75rem' }}>
              {programs.map((program, index) => (
                <Reveal key={program.slug} delay={index * 80}>
                  <article className="card">
                    <p className="eyebrow eyebrow--leaf">{program.kind.replaceAll('_', ' ')}</p>
                    <h3>{program.name}</h3>
                    {program.tagline && <p style={{ fontWeight: 600 }}>{program.tagline}</p>}
                    <p style={{ marginBottom: 0 }}>{program.description}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container" style={{ display: 'grid', gap: '2rem', maxWidth: 720 }}>
          <Reveal>
            <p className="eyebrow eyebrow--leaf">Who should apply</p>
            <h2 className="section-title">Young people with a game-changing idea in health.</h2>
            <p className="section-lead">
              Cohort 1 eligibility (age, background) will be published when applications open —
              nothing is implied until confirmed.
            </p>
          </Reveal>
          <Reveal>
            <p className="eyebrow eyebrow--leaf">Timeline</p>
            <p>
              Applications open → Selection → Seed → Plant → Canopy. Dates will be announced with
              the official call — we do not invent a launch window.
            </p>
          </Reveal>
          <Reveal>
            <p className="eyebrow eyebrow--leaf">FAQ</p>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {faqs.map((item) => (
                <article key={item.q} className="card card--soft">
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--heading-color)' }}>{item.q}</h3>
                  <p style={{ margin: 0 }}>{item.a}</p>
                </article>
              ))}
            </div>
          </Reveal>
          <Link to="/apply" className="btn btn--gold" style={{ justifySelf: 'start' }}>
            Apply to Cohort 1
          </Link>
        </div>
      </section>
    </>
  )
}
