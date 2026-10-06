import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ApiError,
  api,
  unwrapList,
  type Alumni,
  type AwardCategory,
  type AwardWinner,
  type Cohort,
  type Event,
  type ImpactReport,
  type ImpactStat,
  type Innovator,
  type NewsPost,
  type Partner,
  type PressKitItem,
  type Program,
  type ProgramStage,
  type TeamMember,
} from '../api/client'
import { HeroBackgroundSlides } from '../components/HeroBackgroundSlides'
import './Explore.css'

type SectionId =
  | 'programs'
  | 'journey'
  | 'innovators'
  | 'alumni'
  | 'cohorts'
  | 'events'
  | 'team'
  | 'partners'
  | 'news'
  | 'awards'
  | 'resources'

type ExploreItem = {
  id: string
  section: SectionId
  title: string
  summary: string
  meta?: string
  image?: string | null
  slug?: string
  detailId?: number
}

type ExploreSection = {
  id: SectionId
  title: string
  lead: string
  items: ExploreItem[]
}

const REFRESH_MS = 60_000
const HIDDEN_KEYS = new Set([
  'id',
  'slug',
  'order',
  'kind',
  'code',
  'category',
  'innovator',
  'is_public',
  'group',
  'is_featured',
])

function formatDate(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  if (children === null || children === undefined || children === '') return null
  return (
    <div className="explore-detail__field">
      <strong>{label}</strong>
      <div>{children}</div>
    </div>
  )
}

function textFields(data: Record<string, unknown>, labels: Record<string, string>) {
  return Object.entries(labels).flatMap(([key, label]) => {
    const value = data[key]
    if (value === null || value === undefined || value === '') return []
    if (typeof value === 'string' && /^(https?:\/\/|\/)/.test(value)) {
      if (/(file)/i.test(key)) {
        return [
          <Field key={key} label={label}>
            <a className="btn btn--outline-dark" href={value} target="_blank" rel="noreferrer">
              Open document
            </a>
          </Field>,
        ]
      }
      if (/(image|photo|logo|cover)/i.test(key)) {
        return [
          <Field key={key} label={label}>
            <img className="explore-detail__image" src={value} alt="" />
          </Field>,
        ]
      }
    }
    if (typeof value === 'object') return []
    return [
      <Field key={key} label={label}>
        <p>{String(value)}</p>
      </Field>,
    ]
  })
}

function ModulesList({ stages }: { stages: ProgramStage[] }) {
  return (
    <div className="explore-detail__stages">
      {stages
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((stage) => (
          <article key={stage.id} className="explore-detail__stage">
            <h4>
              {stage.name}
              {stage.subtitle ? ` — ${stage.subtitle}` : ''}
            </h4>
            {stage.description && <p>{stage.description}</p>}
            {stage.modules.length > 0 && (
              <ul>
                {stage.modules
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((module) => (
                    <li key={module.id}>
                      <strong>{module.title}</strong>
                      {module.description ? ` — ${module.description}` : ''}
                    </li>
                  ))}
              </ul>
            )}
          </article>
        ))}
    </div>
  )
}

function GenericDetail({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="explore-detail__fields">
      {Object.entries(data)
        .filter(([key, value]) => {
          if (HIDDEN_KEYS.has(key)) return false
          if (value === null || value === undefined || value === '') return false
          if (Array.isArray(value) || (typeof value === 'object' && value !== null)) return false
          return true
        })
        .map(([key, value]) => {
          const label = key.replaceAll('_', ' ')
          if (typeof value === 'string' && /^(https?:\/\/|\/)/.test(value)) {
            if (/file/i.test(key)) {
              return (
                <Field key={key} label={label}>
                  <a className="btn btn--outline-dark" href={value} target="_blank" rel="noreferrer">
                    Open document
                  </a>
                </Field>
              )
            }
            if (/(image|photo|logo|cover)/i.test(key)) {
              return (
                <Field key={key} label={label}>
                  <img className="explore-detail__image" src={value} alt="" />
                </Field>
              )
            }
          }
          return (
            <Field key={key} label={label}>
              <p>{String(value)}</p>
            </Field>
          )
        })}
    </div>
  )
}

async function loadCatalog() {
  const [
    programs,
    stages,
    innovators,
    alumni,
    cohorts,
    events,
    team,
    partners,
    news,
    winners,
    categories,
    pressKit,
    reports,
    stats,
    breakdown,
  ] = await Promise.all([
    api.programs().then(unwrapList).catch(() => [] as Program[]),
    api.stages().then(unwrapList).catch(() => [] as ProgramStage[]),
    api.innovators().then(unwrapList).catch(() => [] as Innovator[]),
    api.alumni().then(unwrapList).catch(() => [] as Alumni[]),
    api.cohorts().then(unwrapList).catch(() => [] as Cohort[]),
    api.events().then(unwrapList).catch(() => [] as Event[]),
    api.team().then(unwrapList).catch(() => [] as TeamMember[]),
    api.partners().then(unwrapList).catch(() => [] as Partner[]),
    api.news().then(unwrapList).catch(() => [] as NewsPost[]),
    api.awardWinners().then(unwrapList).catch(() => [] as AwardWinner[]),
    api.awardCategories().then(unwrapList).catch(() => [] as AwardCategory[]),
    api.pressKit().then(unwrapList).catch(() => [] as PressKitItem[]),
    api.reports().then(unwrapList).catch(() => [] as ImpactReport[]),
    api.impactStats().catch(() => [] as ImpactStat[]),
    api.impactBreakdown().catch(() => null),
  ])

  const sections: ExploreSection[] = []

  if (programs.length) {
    sections.push({
      id: 'programs',
      title: 'Programs',
      lead: 'What AxonAfrica runs — from classroom insight to institutional impact.',
      items: programs
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((program) => ({
          id: `program-${program.slug}`,
          section: 'programs' as const,
          title: program.name,
          summary: program.tagline || program.description,
          meta: program.kind.replaceAll('_', ' '),
          slug: program.slug,
        })),
    })
  }

  if (stages.length) {
    sections.push({
      id: 'journey',
      title: 'The journey',
      lead: 'Seed, Plant, and Canopy — the stages every innovator moves through.',
      items: stages
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((stage) => ({
          id: `stage-${stage.id}`,
          section: 'journey' as const,
          title: stage.name,
          summary: stage.subtitle || stage.description,
          meta: stage.modules.length ? `${stage.modules.length} modules` : undefined,
          detailId: stage.id,
        })),
    })
  }

  if (innovators.length) {
    sections.push({
      id: 'innovators',
      title: 'Innovators',
      lead: 'Young health leaders building solutions in the open.',
      items: innovators.map((person) => ({
        id: `innovator-${person.id}`,
        section: 'innovators' as const,
        title: person.full_name,
        summary: person.project_title || person.project_summary || person.current_stage || '',
        meta: [person.university, person.country].filter(Boolean).join(' · '),
        image: person.photo,
        detailId: person.id,
      })),
    })
  }

  if (alumni.length) {
    sections.push({
      id: 'alumni',
      title: 'Alumni',
      lead: 'Innovators who continue building beyond their cohort.',
      items: alumni.map((person) => ({
        id: `alumni-${person.id}`,
        section: 'alumni' as const,
        title: person.full_name,
        summary: person.project_title || '',
        meta: `${person.cohort_name} · ${person.cohort_year}`,
        image: person.photo,
        detailId: person.id,
      })),
    })
  }

  if (cohorts.length) {
    sections.push({
      id: 'cohorts',
      title: 'Cohorts',
      lead: 'Public cohorts and the innovators inside them.',
      items: cohorts.map((cohort) => ({
        id: `cohort-${cohort.slug}`,
        section: 'cohorts' as const,
        title: cohort.name,
        summary: cohort.summary,
        meta: `${cohort.year} · ${cohort.status}`,
        slug: cohort.slug,
      })),
    })
  }

  if (events.length) {
    sections.push({
      id: 'events',
      title: 'Events',
      lead: 'Summits, ceremonies, and gatherings where innovators meet institutions.',
      items: events.map((event) => ({
        id: `event-${event.slug}`,
        section: 'events' as const,
        title: event.title,
        summary: [event.city, event.country].filter(Boolean).join(' · ') || event.kind,
        meta: formatDate(event.starts_at),
        image: event.cover_image,
        slug: event.slug,
      })),
    })
  }

  if (team.length) {
    sections.push({
      id: 'team',
      title: 'Team',
      lead: 'The people building AxonAfrica.',
      items: team.map((member) => ({
        id: `team-${member.id}`,
        section: 'team' as const,
        title: member.full_name,
        summary: member.role_title,
        meta: member.group,
        image: member.photo,
        detailId: member.id,
      })),
    })
  }

  if (partners.length) {
    sections.push({
      id: 'partners',
      title: 'Partners',
      lead: 'Institutions and organizations opening doors for innovators.',
      items: partners.map((partner) => ({
        id: `partner-${partner.id}`,
        section: 'partners' as const,
        title: partner.name,
        summary: [partner.type, partner.country].filter(Boolean).join(' · '),
        image: partner.logo,
        detailId: partner.id,
      })),
    })
  }

  if (news.length) {
    sections.push({
      id: 'news',
      title: 'Stories',
      lead: 'News and updates from across the network.',
      items: news.map((post) => ({
        id: `news-${post.slug}`,
        section: 'news' as const,
        title: post.title,
        summary: post.excerpt || '',
        meta: formatDate(post.published_at),
        image: post.cover_image,
        slug: post.slug,
      })),
    })
  }

  if (winners.length) {
    sections.push({
      id: 'awards',
      title: 'Award winners',
      lead: 'Young innovators recognized for lasting contribution.',
      items: winners.map((winner) => ({
        id: `award-${winner.id}`,
        section: 'awards' as const,
        title: winner.display_name,
        summary: winner.legacy_statement,
        meta: `${winner.category_name} · ${winner.year}`,
        image: winner.photo,
        detailId: winner.id,
      })),
    })
  }

  const resources: ExploreItem[] = [
    ...pressKit.map((item) => ({
      id: `press-${item.id}`,
      section: 'resources' as const,
      title: item.title,
      summary: item.description,
      meta: 'Press kit',
      detailId: item.id,
    })),
    ...reports.map((item) => ({
      id: `report-${item.id}`,
      section: 'resources' as const,
      title: item.title,
      summary: item.summary,
      meta: String(item.year),
      detailId: item.id,
    })),
  ]
  if (resources.length) {
    sections.push({
      id: 'resources',
      title: 'Resources',
      lead: 'Press materials and impact reports you can share.',
      items: resources,
    })
  }

  return { sections, awardCategories: categories, stats, breakdown }
}

export function ExplorePage() {
  const [sections, setSections] = useState<ExploreSection[]>([])
  const [stats, setStats] = useState<ImpactStat[]>([])
  const [breakdown, setBreakdown] = useState<Awaited<ReturnType<typeof api.impactBreakdown>> | null>(
    null,
  )
  const [awardCategories, setAwardCategories] = useState<AwardCategory[]>([])
  const [activeSection, setActiveSection] = useState<SectionId | 'impact' | 'nominate' | 'all'>('all')
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<ExploreItem | null>(null)
  const [detailBody, setDetailBody] = useState<ReactNode>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [detailError, setDetailError] = useState('')
  const [eventMessage, setEventMessage] = useState('')
  const [eventError, setEventError] = useState('')
  const [nominationMessage, setNominationMessage] = useState('')
  const [nominationError, setNominationError] = useState('')

  useEffect(() => {
    let alive = true
    let inFlight = false

    async function refresh() {
      if (inFlight || document.visibilityState === 'hidden') return
      inFlight = true
      try {
        const catalog = await loadCatalog()
        if (!alive) return
        setSections(catalog.sections)
        setStats(catalog.stats)
        setBreakdown(catalog.breakdown)
        setAwardCategories(catalog.awardCategories)
      } finally {
        inFlight = false
        if (alive) setLoading(false)
      }
    }

    void refresh()
    const timer = window.setInterval(() => void refresh(), REFRESH_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      alive = false
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  const visibleSections = useMemo(() => {
    if (activeSection === 'all' || activeSection === 'impact' || activeSection === 'nominate') {
      return sections
    }
    return sections.filter((section) => section.id === activeSection)
  }, [activeSection, sections])

  async function openItem(item: ExploreItem) {
    setDetailError('')
    setEventMessage('')
    setEventError('')
    setSelectedEvent(null)
    setDetailBody(null)
    setSelectedItem(item)

    try {
      switch (item.section) {
        case 'programs': {
          const program = await api.program(item.slug!)
          setDetailBody(
            <div className="explore-detail__fields">
              {textFields(program as unknown as Record<string, unknown>, {
                tagline: 'Focus',
                description: 'About',
              })}
              {program.stages && program.stages.length > 0 && (
                <div className="explore-detail__field explore-detail__field--wide">
                  <strong>Pathway</strong>
                  <ModulesList stages={program.stages} />
                </div>
              )}
            </div>,
          )
          break
        }
        case 'journey': {
          const stage = await api.stage(item.detailId!)
          setDetailBody(
            <div className="explore-detail__fields">
              {textFields(stage as unknown as Record<string, unknown>, {
                subtitle: 'Focus',
                description: 'About',
              })}
              {stage.modules.length > 0 && (
                <div className="explore-detail__field explore-detail__field--wide">
                  <strong>Modules</strong>
                  <ul>
                    {stage.modules
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((module) => (
                        <li key={module.id}>
                          <strong>{module.title}</strong>
                          {module.description ? ` — ${module.description}` : ''}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>,
          )
          break
        }
        case 'innovators':
          setDetailBody(
            <GenericDetail
              data={(await api.innovator(item.detailId!)) as unknown as Record<string, unknown>}
            />,
          )
          break
        case 'alumni':
          setDetailBody(
            <GenericDetail
              data={(await api.alumnus(item.detailId!)) as unknown as Record<string, unknown>}
            />,
          )
          break
        case 'cohorts':
          setDetailBody(
            <GenericDetail
              data={(await api.cohort(item.slug!)) as unknown as Record<string, unknown>}
            />,
          )
          break
        case 'events': {
          const event = await api.event(item.slug!)
          setSelectedEvent(event)
          break
        }
        case 'team':
          setDetailBody(
            <GenericDetail
              data={(await api.teamMember(item.detailId!)) as unknown as Record<string, unknown>}
            />,
          )
          break
        case 'partners':
          setDetailBody(
            <GenericDetail
              data={(await api.partner(item.detailId!)) as unknown as Record<string, unknown>}
            />,
          )
          break
        case 'news':
          setDetailBody(
            <GenericDetail
              data={(await api.newsPost(item.slug!)) as unknown as Record<string, unknown>}
            />,
          )
          break
        case 'awards':
          setDetailBody(
            <GenericDetail
              data={(await api.awardWinner(item.detailId!)) as unknown as Record<string, unknown>}
            />,
          )
          break
        case 'resources':
          if (item.id.startsWith('press-')) {
            setDetailBody(
              <GenericDetail
                data={(await api.pressKitItem(item.detailId!)) as unknown as Record<string, unknown>}
              />,
            )
          } else {
            setDetailBody(
              <GenericDetail
                data={(await api.report(item.detailId!)) as unknown as Record<string, unknown>}
              />,
            )
          }
          break
      }
    } catch (cause) {
      setSelectedItem(null)
      setDetailError(cause instanceof ApiError ? cause.message : 'Could not load this item.')
    }
  }

  async function submitEventRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedEvent) return
    const form = event.currentTarget
    const formData = new FormData(form)
    setEventError('')
    setEventMessage('')
    try {
      const result = await api.registerForEvent(selectedEvent.slug, {
        full_name: String(formData.get('full_name')),
        email: String(formData.get('email')),
        organization: String(formData.get('organization')),
        role: String(formData.get('role')) as
          | 'innovator'
          | 'institution'
          | 'funder'
          | 'mentor'
          | 'media'
          | 'other',
      })
      setEventMessage(result.message)
      form.reset()
    } catch (cause) {
      setEventError(
        cause instanceof ApiError ? cause.message : 'Your event registration could not be submitted.',
      )
    }
  }

  async function submitNomination(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    setNominationError('')
    setNominationMessage('')
    try {
      const result = await api.nominate({
        category: Number(formData.get('category')),
        nominee_name: String(formData.get('nominee_name')),
        nominee_institution: String(formData.get('nominee_institution')),
        reason: String(formData.get('reason')),
        nominator_name: String(formData.get('nominator_name')),
        nominator_email: String(formData.get('nominator_email')),
      })
      setNominationMessage(result.message)
      form.reset()
    } catch (cause) {
      setNominationError(
        cause instanceof ApiError ? cause.message : 'Your nomination could not be submitted.',
      )
    }
  }

  const showImpact = activeSection === 'all' || activeSection === 'impact'
  const showNominate =
    awardCategories.length > 0 && (activeSection === 'all' || activeSection === 'nominate')
  const journeySection = sections.find((section) => section.id === 'journey')
  const programSection = sections.find((section) => section.id === 'programs')
  const otherSections = visibleSections.filter(
    (section) => section.id !== 'journey' && section.id !== 'programs',
  )

  return (
    <div className="explore-page">
      <section className="page-hero explore-hero">
        <HeroBackgroundSlides />
        <div className="container explore-hero__inner">
          <img
            className="explore-hero__brand"
            src="/logo-axonafrica.png"
            alt="AxonAfrica"
            width={220}
            height={64}
          />
          <p className="eyebrow eyebrow--on-dark">Explore the network</p>
          <h1>A place built for African health ideas that refuse to stay on paper.</h1>
          <p>
            Walk the pathway from Seed to Canopy, meet the programs carrying scholars into real
            institutions, and see what AxonAfrica is publishing now.
          </p>
          <div className="explore-hero__actions">
            <Link to="/apply" className="btn btn--gold">
              Apply to Cohort 1
            </Link>
            <a href="#journey" className="btn btn--outline-light">
              Enter the journey
            </a>
          </div>
        </div>
      </section>

      <section className="explore-invite" aria-label="Why explore">
        <div className="container explore-invite__row">
          <p>
            <strong>Youth-led.</strong> Intelligent by design. Built so talent meets a door that
            opens.
          </p>
          <div className="explore-invite__pulse" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section className="section explore-body">
        <div className="container">
          <nav className="explore-filters" aria-label="Explore collections">
            <button
              type="button"
              className={activeSection === 'all' ? 'is-active' : ''}
              onClick={() => setActiveSection('all')}
            >
              All
            </button>
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={activeSection === section.id ? 'is-active' : ''}
                onClick={() => setActiveSection(section.id)}
              >
                {section.title}
                <span>{section.items.length}</span>
              </button>
            ))}
            {stats.length > 0 && (
              <button
                type="button"
                className={activeSection === 'impact' ? 'is-active' : ''}
                onClick={() => setActiveSection('impact')}
              >
                Impact
              </button>
            )}
            {awardCategories.length > 0 && (
              <button
                type="button"
                className={activeSection === 'nominate' ? 'is-active' : ''}
                onClick={() => setActiveSection('nominate')}
              >
                Nominate
              </button>
            )}
          </nav>

          {loading && (
            <p className="explore-loading" role="status">
              Opening the live network…
            </p>
          )}

          {!loading && sections.length === 0 && (
            <div className="explore-empty">
              <h2>The room is ready.</h2>
              <p>Content will appear here as programs, people, and stories are published.</p>
              <Link to="/program" className="btn btn--gold">
                See the program
              </Link>
            </div>
          )}

          {!loading &&
            (activeSection === 'all' || activeSection === 'journey') &&
            journeySection && (
              <section className="explore-section explore-section--journey" id="journey">
                <div className="explore-section__intro">
                  <p className="eyebrow eyebrow--leaf">The pathway</p>
                  <h2 className="section-title">Three stages. One continuous climb.</h2>
                  <p className="section-lead">{journeySection.lead}</p>
                </div>
                <div className="explore-journey">
                  {journeySection.items.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      className="explore-journey__step"
                      onClick={() => void openItem(item)}
                    >
                      <span className="explore-journey__index">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="explore-journey__body">
                        {item.meta && <span className="explore-card__eyebrow">{item.meta}</span>}
                        <strong>{item.title}</strong>
                        <span>{item.summary}</span>
                        <span className="explore-journey__cta">Open stage</span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

          {!loading &&
            (activeSection === 'all' || activeSection === 'programs') &&
            programSection && (
              <section className="explore-section explore-section--programs" id="programs">
                <div className="explore-section__intro">
                  <p className="eyebrow eyebrow--leaf">Programs</p>
                  <h2 className="section-title">Where scholarship becomes a solution.</h2>
                  <p className="section-lead">{programSection.lead}</p>
                </div>
                <div className="explore-features">
                  {programSection.items.map((item, index) => (
                    <article
                      key={item.id}
                      className={`explore-feature ${index === 0 ? 'explore-feature--lead' : ''}`}
                    >
                      <div className="explore-feature__glow" aria-hidden="true" />
                      {item.meta && <span className="explore-card__eyebrow">{item.meta}</span>}
                      <h3>{item.title}</h3>
                      <p>{item.summary}</p>
                      <button
                        type="button"
                        className="btn btn--gold"
                        onClick={() => void openItem(item)}
                      >
                        Discover
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            )}

          {!loading &&
            (activeSection === 'all' ||
              (activeSection !== 'impact' &&
                activeSection !== 'nominate' &&
                activeSection !== 'journey' &&
                activeSection !== 'programs')) &&
            otherSections.map((section) => (
              <section className="explore-section" id={section.id} key={section.id}>
                <div className="explore-section__intro">
                  <p className="eyebrow eyebrow--leaf">{section.title}</p>
                  <h2 className="section-title">{section.title}</h2>
                  <p className="section-lead">{section.lead}</p>
                </div>
                <div className="explore-people">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="explore-person"
                      onClick={() => void openItem(item)}
                    >
                      {item.image ? (
                        <img
                          className="explore-person__image"
                          src={item.image}
                          alt=""
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="explore-person__fallback" aria-hidden="true">
                          {item.title.slice(0, 1)}
                        </span>
                      )}
                      <span className="explore-person__copy">
                        {item.meta && <span className="explore-card__eyebrow">{item.meta}</span>}
                        <strong>{item.title}</strong>
                        {item.summary && <span>{item.summary}</span>}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}

          {selectedItem && (
            <section className="explore-detail" aria-live="polite">
              <div className="explore-detail__header">
                <div>
                  <p className="eyebrow eyebrow--leaf">{selectedItem.meta || 'Details'}</p>
                  <h2>{selectedItem.title}</h2>
                </div>
                <button
                  type="button"
                  className="btn btn--outline-dark"
                  onClick={() => {
                    setSelectedItem(null)
                    setSelectedEvent(null)
                    setDetailBody(null)
                  }}
                >
                  Close
                </button>
              </div>

              {detailBody}

              {selectedEvent && (
                <div className="explore-detail__stack">
                  <div className="explore-detail__fields">
                    {selectedEvent.cover_image && (
                      <Field label="Cover">
                        <img
                          className="explore-detail__image"
                          src={selectedEvent.cover_image}
                          alt=""
                          referrerPolicy="no-referrer"
                        />
                      </Field>
                    )}
                    {textFields(selectedEvent as unknown as Record<string, unknown>, {
                      description: 'About',
                      venue: 'Venue',
                      city: 'City',
                      country: 'Country',
                    })}
                    <Field label="Dates">
                      <p>
                        {formatDate(selectedEvent.starts_at)}
                        {selectedEvent.ends_at ? ` → ${formatDate(selectedEvent.ends_at)}` : ''}
                      </p>
                    </Field>
                    {selectedEvent.speakers && selectedEvent.speakers.length > 0 && (
                      <div className="explore-detail__field explore-detail__field--wide">
                        <strong>Speakers</strong>
                        <ul>
                          {selectedEvent.speakers.map((speaker) => (
                            <li key={speaker.id}>
                              <strong>{speaker.full_name}</strong>
                              {[speaker.title, speaker.organization].filter(Boolean).join(' · ')}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {selectedEvent.registration_open && (
                    <form className="form-stack explore-form" onSubmit={submitEventRegistration}>
                      <h3>Register for this event</h3>
                      <label>
                        Full name
                        <input name="full_name" required />
                      </label>
                      <label>
                        Email
                        <input name="email" type="email" required />
                      </label>
                      <label>
                        Organization
                        <input name="organization" />
                      </label>
                      <label>
                        Your role
                        <select name="role" required defaultValue="other">
                          <option value="innovator">Innovator</option>
                          <option value="institution">Institution</option>
                          <option value="funder">Funder</option>
                          <option value="mentor">Mentor</option>
                          <option value="media">Media</option>
                          <option value="other">Other</option>
                        </select>
                      </label>
                      {eventMessage && <p className="form-ok">{eventMessage}</p>}
                      {eventError && (
                        <p className="form-error" role="alert">
                          {eventError}
                        </p>
                      )}
                      <button className="btn btn--gold" type="submit">
                        Register
                      </button>
                    </form>
                  )}
                </div>
              )}
            </section>
          )}

          {detailError && (
            <p className="form-error" role="alert">
              {detailError}
            </p>
          )}

          {showImpact && stats.length > 0 && (
            <section className="explore-impact" id="impact">
              <div className="explore-impact__intro">
                <p className="eyebrow eyebrow--on-dark">Impact</p>
                <h2>Measured in the open.</h2>
                <p>Live numbers from AxonAfrica — no estimates added here.</p>
              </div>
              <div className="explore-impact__grid">
                {stats.map((stat) => (
                  <article key={stat.key}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </article>
                ))}
                {breakdown && breakdown.alumni_count > 0 && (
                  <article>
                    <strong>{breakdown.alumni_count}</strong>
                    <span>Alumni innovators</span>
                  </article>
                )}
                {breakdown && breakdown.active_cohort_innovators > 0 && (
                  <article>
                    <strong>{breakdown.active_cohort_innovators}</strong>
                    <span>Active cohort innovators</span>
                  </article>
                )}
              </div>
            </section>
          )}

          {showNominate && (
            <section className="explore-section" id="nominate">
              <div className="explore-section__intro">
                <p className="eyebrow eyebrow--leaf">Awards</p>
                <h2 className="section-title">Nominate an innovator</h2>
                <p className="section-lead">Send a nomination to a published award category.</p>
              </div>
              <form className="explore-nominate form-stack" onSubmit={submitNomination}>
                <label>
                  Award category
                  <select name="category" required defaultValue="">
                    <option value="" disabled>
                      Select a category
                    </option>
                    {awardCategories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Nominee name
                  <input name="nominee_name" required />
                </label>
                <label>
                  Nominee institution
                  <input name="nominee_institution" />
                </label>
                <label>
                  Why are you nominating them?
                  <textarea name="reason" required />
                </label>
                <label>
                  Your name
                  <input name="nominator_name" required />
                </label>
                <label>
                  Your email
                  <input name="nominator_email" type="email" required />
                </label>
                {nominationMessage && <p className="form-ok">{nominationMessage}</p>}
                {nominationError && (
                  <p className="form-error" role="alert">
                    {nominationError}
                  </p>
                )}
                <button className="btn btn--gold" type="submit">
                  Submit nomination
                </button>
              </form>
            </section>
          )}

          <section className="explore-belong">
            <p className="eyebrow eyebrow--on-dark">Belong here</p>
            <h2>Bring the idea that will not leave you alone.</h2>
            <p>
              Cohort seats, institutional doors, and a youth-led network are waiting on the other
              side of Apply.
            </p>
            <div className="explore-belong__actions">
              <Link to="/apply" className="btn btn--gold">
                Apply to Cohort 1
              </Link>
              <Link to="/get-involved" className="btn btn--outline-light">
                Get involved
              </Link>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
