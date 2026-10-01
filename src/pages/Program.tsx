import { Link } from 'react-router-dom'
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

export function ProgramPage() {
  return (
    <>
      <section className="page-hero">
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
            <h2 className="section-title">Seed → Plant → Canopy</h2>
            <StagePath compact animated={false} drawOnView />
          </Reveal>
          <div className="grid-3" style={{ marginTop: '1.75rem' }}>
            <Reveal>
              <article className="card">
                <h3>Seed — Learn &amp; define</h3>
                <ul>
                  <li>Identify a real health problem</li>
                  <li>Design a solution that matches real needs</li>
                  <li>Applied data &amp; AI literacy</li>
                  <li>Rapid prototyping fundamentals</li>
                  <li>AI ethics across the project lifecycle</li>
                </ul>
              </article>
            </Reveal>
            <Reveal>
              <article className="card">
                <h3>Plant — Build &amp; test</h3>
                <p>
                  Matched with designers and technologists, then prototype, test, and implement
                  inside a partner institution that shares the project&apos;s mission.
                </p>
              </article>
            </Reveal>
            <Reveal>
              <article className="card">
                <h3>Canopy — Grow &amp; sustain</h3>
                <p>
                  Keep building beyond the program, backed by the AxonAfrica innovator network.
                </p>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

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
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--deep-green)' }}>{item.q}</h3>
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
