import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, unwrapList, type Partner } from '../api/client'
import { AnimatedStat } from '../components/AnimatedStat'
import { HeroBackgroundControl } from '../components/HeroBackgroundControl'
import { HeroBackgroundSlides } from '../components/HeroBackgroundSlides'
import { MediaFrame } from '../components/MediaFrame'
import { Reveal } from '../components/Reveal'
import { StagePath } from '../components/StagePath'
import { getHeroBackground } from '../lib/heroBackground'
import { siteMedia } from '../data/siteMedia'
import './Home.css'

const problemCards = [
  {
    title: 'No validated problem',
    text: 'Ideas stay abstract without a path to test them against a real community need.',
  },
  {
    title: 'No capital or team',
    text: 'Scholars rarely get matched with designers, technologists, and early support.',
  },
  {
    title: 'No institutional door',
    text: 'Without a partner hospital, ministry, or lab, solutions never leave the classroom.',
  },
]

const pathway = [
  {
    title: 'Seed',
    subtitle: 'Learn & define',
    text: 'Identify a real health problem and define a solution grounded in community needs, data, and AI ethics.',
  },
  {
    title: 'Plant',
    subtitle: 'Build & test',
    text: 'Match with designers and technologists, then prototype and test inside a partner institution.',
  },
  {
    title: 'Canopy',
    subtitle: 'Grow & sustain',
    text: 'Keep building beyond the program with the AxonAfrica innovator network and alumni support.',
  },
]

const benefits = [
  'A curriculum built for digital-age health innovation',
  'Team matching when you need design, software, or data skills',
  'Access to institutions ready to test real solutions',
  'A youth-led community that stays with you after the cohort',
]

const seedModules = [
  'How to identify a real health problem',
  'Designing a solution that matches real needs',
  'Applied data & AI literacy for health innovators',
  'Rapid prototyping fundamentals',
  'AI ethics across the project lifecycle',
]

export function HomePage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [heroBgStatus, setHeroBgStatus] = useState<'loading' | 'ready' | 'empty'>('loading')
  const [heroBg, setHeroBg] = useState<string | null>(() => getHeroBackground())
  const [stats, setStats] = useState({
    scholarsReached: '—',
    cohortsRun: '—',
    institutionsPartnered: '—',
    applicationsReceived: '—',
  })

  useEffect(() => {
    const onBg = (e: Event) => {
      const detail = (e as CustomEvent<string | null>).detail
      setHeroBg(detail ?? getHeroBackground())
    }
    window.addEventListener('axonafrica:hero-bg', onBg)
    return () => window.removeEventListener('axonafrica:hero-bg', onBg)
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [partnerData, impact] = await Promise.all([
          api.partners().catch(() => []),
          api.impactStats().catch(() => null),
        ])
        if (!alive) return
        setPartners(unwrapList(partnerData).filter((p) => p.logo || p.name))
        if (impact) {
          const valueFor = (key: string) => {
            const value = impact.find((stat) => stat.key === key)?.value
            return value === undefined ? '—' : String(value)
          }
          setStats({
            scholarsReached: valueFor('scholars_reached'),
            cohortsRun: valueFor('cohorts_run'),
            institutionsPartnered: valueFor('institutions_partnered'),
            applicationsReceived: valueFor('applications_received'),
          })
        }
      } catch {
        /* offline / empty API is fine for launch */
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const showFallback = heroBgStatus === 'empty'
  const showPhotos = heroBgStatus === 'ready'
  const showCustomPhoto = showFallback && Boolean(heroBg)

  return (
    <div className="home">
      <section
        className={[
          'hero',
          showPhotos ? 'hero--bg' : '',
          showCustomPhoto ? 'hero--photo' : '',
          showFallback && !heroBg ? 'hero--fallback' : '',
          heroBgStatus === 'loading' ? 'hero--awaiting-bg' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={
          showCustomPhoto ? { ['--hero-photo' as string]: `url(${heroBg})` } : undefined
        }
      >
        <HeroBackgroundSlides variant="home" onStatusChange={setHeroBgStatus} />
        {(showPhotos || showCustomPhoto) && <div className="hero__scrim" aria-hidden />}
        {showFallback && !heroBg && (
          <div className="hero__orbs" aria-hidden>
            <span />
            <span />
            <span />
          </div>
        )}
        <div className="container hero__grid">
          <div className="hero__copy hero__copy--enter">
            <img
              className="hero__brand"
              src="/logo-axonafrica.png"
              alt="AxonAfrica"
              width={280}
              height={80}
            />
            <h1>Empowering the next generation of health leaders in the digital age.</h1>
            <p>
              Health systems that can&apos;t move at the speed of a real crisis will always fall
              behind. AxonAfrica exists to make sure the next generation of African health leaders
              doesn&apos;t wait for permission — we carry bold, digitally-native health ideas from a
              young innovator&apos;s mind to a solution tested and used into the communities that need
              them the most.
            </p>
            <div className="hero__actions">
              <Link to="/apply" className="btn btn--gold">
                Apply to Cohort 1
              </Link>
              <Link to="/program" className="btn btn--outline-light">
                See how it works
              </Link>
            </div>
            <HeroBackgroundControl onChange={setHeroBg} />
          </div>
          <div className="hero__visual hero__visual--enter">
            <StagePath />
          </div>
        </div>
      </section>

      <section className="trust-band section--tight" aria-label="Positioning">
        <div className="trust-band__track">
          <p>Youth-led. Intelligent by design. Built for Africa.</p>
          <p aria-hidden>Youth-led. Intelligent by design. Built for Africa.</p>
        </div>
      </section>

      <section className="section problem">
        <div className="container">
          <Reveal>
            <p className="eyebrow eyebrow--leaf">The gap</p>
            <h2 className="section-title">Talent without a pathway.</h2>
            <p className="section-lead">
              Every year, Africa&apos;s health faculties graduate scholars who can design a clinical
              protocol on paper. Almost none of that knowledge becomes a deployed health solution —
              not for lack of talent, but for lack of a path built for how fast the digital age
              actually moves.
            </p>
          </Reveal>
          <div className="grid-3 problem__cards">
            {problemCards.map((card, i) => (
              <Reveal key={card.title} delay={i * 100}>
                <article className="card card--soft">
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section pathway">
        <div className="container">
          <Reveal>
            <p className="eyebrow eyebrow--leaf">The pathway</p>
            <h2 className="section-title">Three stages. One journey.</h2>
            <StagePath compact animated={false} drawOnView />
          </Reveal>
          <div className="grid-3 pathway__cards">
            {pathway.map((stage, i) => (
              <Reveal key={stage.title} delay={i * 120}>
                <article className="card">
                  <p className="eyebrow eyebrow--leaf">{stage.title}</p>
                  <h3>{stage.subtitle}</h3>
                  <p>{stage.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section media-story">
        <div className="container media-story__grid">
          <Reveal variant="left">
            <p className="eyebrow eyebrow--leaf">Seen in motion</p>
            <h2 className="section-title">Stories in images and video</h2>
            <p className="section-lead">
              Cohort moments, workspace footage, and innovator portraits will live here — optimized
              for mobile networks, with lazy loading and accessible playback controls.
            </p>
          </Reveal>
          <Reveal delay={120} variant="scale">
            <MediaFrame
              videoSrc={siteMedia.home.highlightVideo}
              poster={siteMedia.home.highlightPoster || undefined}
              aspect="16/9"
              caption={siteMedia.home.highlightCaption}
              placeholderLabel="Add cohort photo or highlight reel"
            />
          </Reveal>
        </div>
      </section>

      <section className="section program-spotlight">
        <div className="container program-spotlight__grid">
          <Reveal>
            <div className="program-spotlight__main">
              <p className="eyebrow eyebrow--on-dark">Flagship</p>
              <h2>The Digital Health Leaders Program</h2>
              <p>
                For young people with a game-changing idea in health. You bring the idea — we bring
                the curriculum, the team, and the institutions.
              </p>
              <ul>
                {benefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link to="/apply" className="btn btn--gold">
                Apply to Cohort 1
              </Link>
            </div>
          </Reveal>
          <Reveal>
            <aside className="program-spotlight__side">
              <h3>What you learn in Seed</h3>
              <ul>
                {seedModules.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link to="/program" className="btn btn--outline-dark">
                Explore the program
              </Link>
            </aside>
          </Reveal>
        </div>
      </section>

      <section className="impact-strip section--tight">
        <div className="container grid-4 impact-strip__grid">
          <AnimatedStat value={stats.scholarsReached} label="scholars reached" />
          <AnimatedStat value={stats.cohortsRun} label="cohorts run" />
          <AnimatedStat value={stats.institutionsPartnered} label="institutions partnered" />
          <AnimatedStat value={stats.applicationsReceived} label="applications received" />
        </div>
      </section>

      {partners.length > 0 && (
        <section className="section partners">
          <div className="container">
            <Reveal>
              <p className="eyebrow eyebrow--leaf">In partnership with</p>
              <ul className="partners__list">
                {partners.map((partner) => (
                  <li key={partner.id}>
                    {partner.logo ? (
                      <img src={partner.logo} alt={partner.name} />
                    ) : (
                      <span>{partner.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      )}

      <section className="section get-involved-cta">
        <div className="container">
          <Reveal>
            <p className="eyebrow eyebrow--on-dark">Get involved</p>
            <h2>Help us build Africa&apos;s leading youth-led health innovation organization.</h2>
          </Reveal>
          <div className="grid-3">
            <Reveal>
              <article className="card get-involved-cta__card">
                <h3>Fund a cohort</h3>
                <p>Back the seed capital and mentorship that carries innovators through the program.</p>
                <Link to="/get-involved#fund" className="btn btn--gold">
                  Talk to us about funding
                </Link>
              </article>
            </Reveal>
            <Reveal>
              <article className="card get-involved-cta__card">
                <h3>Partner with us</h3>
                <p>
                  Open a lab, a clinical validation site, or a placement so a finished solution can
                  be tested where it matters.
                </p>
                <Link to="/get-involved#partner" className="btn btn--gold">
                  Become a partner
                </Link>
              </article>
            </Reveal>
            <Reveal>
              <article className="card get-involved-cta__card">
                <h3>Join as an innovator</h3>
                <p>Bring your idea and start at Seed.</p>
                <Link to="/apply" className="btn btn--gold">
                  Apply to Cohort 1
                </Link>
              </article>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  )
}
