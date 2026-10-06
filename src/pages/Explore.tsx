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

  const totalItems = sections.reduce((sum, section) => sum + section.items.length, 0)

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

  return (
    <>
      <section className="page-hero explore-hero">
        <HeroBackgroundSlides />
        <div className="container">
          <div className="page-hero__content">
            <div className="page-hero__copy">
              <p className="eyebrow eyebrow--on-dark">Explore</p>
              <h1>Meet the work in motion.</h1>
              <p>
                Browse programs, the innovator journey, people, and impact — only what AxonAfrica has
                published so far.
              </p>
            </div>
            <div className="card explore-hero-panel">
              <p className="eyebrow eyebrow--on-dark">Now live</p>
              <div className="explore-stat-grid">
                <div>
                  <strong>{sections.length}</strong>
                  <span>collections</span>
                </div>
                <div>
                  <strong>{totalItems}</strong>
                  <span>published</span>
                </div>
                <div>
                  <strong>{stats.length || '—'}</strong>
                  <span>impact stats</span>
                </div>
              </div>
              <ul className="explore-hero-list">
                <li>Programs &amp; journey stages</li>
                <li>People when profiles go live</li>
                <li>Impact as it is measured</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
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

          {loading && <p role="status">Loading published content…</p>}

          {!loading && sections.length === 0 && (
            <div className="card card--soft">
              <h2 style={{ color: 'var(--heading-color)' }}>Nothing published yet</h2>
              <p>
                Explore will fill in as programs, people, and stories go live on the AxonAfrica API.
              </p>
              <Link to="/program" className="btn btn--gold">
                See the program
              </Link>
            </div>
          )}

          {!loading &&
            (activeSection === 'all' ||
              (activeSection !== 'impact' && activeSection !== 'nominate')) &&
            visibleSections.map((section) => (
              <section className="explore-section" id={section.id} key={section.id}>
                <h2 className="section-title">{section.title}</h2>
                <p className="section-lead">{section.lead}</p>
                <div className="grid-3 explore-section__grid">
                  {section.items.map((item) => (
                    <article className="card explore-card" key={item.id}>
                      {item.image ? (
                        <img className="explore-card__image" src={item.image} alt="" loading="lazy" />
                      ) : null}
                      {item.meta && <span className="explore-card__eyebrow">{item.meta}</span>}
                      <h3>{item.title}</h3>
                      {item.summary && <p>{item.summary}</p>}
                      <button
                        type="button"
                        className="btn btn--outline-dark"
                        onClick={() => void openItem(item)}
                      >
                        View
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            ))}

          {selectedItem && (
            <section className="card explore-detail" aria-live="polite">
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
            <section className="explore-section" id="impact">
              <h2 className="section-title">Impact</h2>
              <p className="section-lead">Numbers published by AxonAfrica — no estimates added here.</p>
              <div className="grid-3 explore-section__grid">
                {stats.map((stat) => (
                  <article className="card explore-card" key={stat.key}>
                    <strong className="explore-stat-value">{stat.value}</strong>
                    <p>{stat.label}</p>
                  </article>
                ))}
                {breakdown && breakdown.alumni_count > 0 && (
                  <article className="card explore-card">
                    <strong className="explore-stat-value">{breakdown.alumni_count}</strong>
                    <p>Alumni innovators</p>
                  </article>
                )}
                {breakdown && breakdown.active_cohort_innovators > 0 && (
                  <article className="card explore-card">
                    <strong className="explore-stat-value">{breakdown.active_cohort_innovators}</strong>
                    <p>Active cohort innovators</p>
                  </article>
                )}
              </div>
              {breakdown && (breakdown.by_country.length > 0 || breakdown.by_stage.length > 0) && (
                <div className="grid-3 explore-section__grid" style={{ marginTop: '1rem' }}>
                  {breakdown.by_country.length > 0 && (
                    <article className="card">
                      <h3>By country</h3>
                      <ul>
                        {breakdown.by_country.map((row) => (
                          <li key={row.label}>
                            {row.label}: {row.count}
                          </li>
                        ))}
                      </ul>
                    </article>
                  )}
                  {breakdown.by_stage.length > 0 && (
                    <article className="card">
                      <h3>By stage</h3>
                      <ul>
                        {breakdown.by_stage.map((row) => (
                          <li key={row.code || row.label}>
                            {row.label}: {row.count}
                          </li>
                        ))}
                      </ul>
                    </article>
                  )}
                </div>
              )}
            </section>
          )}

          {showNominate && (
            <section className="explore-section" id="nominate">
              <h2 className="section-title">Nominate an innovator</h2>
              <p className="section-lead">Send a nomination to a published award category.</p>
              <form className="card form-stack explore-form" onSubmit={submitNomination}>
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
        </div>
      </section>
    </>
  )
}
