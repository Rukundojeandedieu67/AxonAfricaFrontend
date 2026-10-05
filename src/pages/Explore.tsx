import { useEffect, useState, type FormEvent } from 'react'
import { ApiError, api, unwrapList } from '../api/client'
import { HeroBackgroundSlides } from '../components/HeroBackgroundSlides'
import './Explore.css'

type ApiRecord = {
  key: string
  title: string
  description: string
  detail: () => Promise<unknown>
  kind?: 'event'
}

type ApiSection = {
  id: string
  title: string
  description: string
  records: ApiRecord[]
  error?: string
}

type SelectedRecord = {
  record: ApiRecord
  data: unknown
}

const API_REFRESH_INTERVAL = 60_000

function textValue(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return ''
}

function DetailValue({ name, value }: { name: string; value: unknown }) {
  if (value === null || value === undefined || value === '') return null
  if (Array.isArray(value)) {
    return (
      <div className="explore-detail__field">
        <strong>{name.replaceAll('_', ' ')}</strong>
        {value.length ? (
          <ul>
            {value.map((entry, index) => (
              <li key={index}>
                {typeof entry === 'object' && entry !== null
                  ? Object.values(entry).map(textValue).filter(Boolean).join(' · ')
                  : textValue(entry)}
              </li>
            ))}
          </ul>
        ) : (
          <p>None listed.</p>
        )}
      </div>
    )
  }
  if (typeof value === 'object') {
    return (
      <div className="explore-detail__field">
        <strong>{name.replaceAll('_', ' ')}</strong>
        <p>{Object.values(value).map(textValue).filter(Boolean).join(' · ')}</p>
      </div>
    )
  }
  const valueText = textValue(value)
  const fieldName = name.toLowerCase()
  if (
    typeof value === 'string' &&
    /^(https?:\/\/|\/)/.test(value) &&
    /(image|photo|logo|cover)/.test(fieldName)
  ) {
    return (
      <div className="explore-detail__field">
        <strong>{name.replaceAll('_', ' ')}</strong>
        <img className="explore-detail__image" src={value} alt="" />
      </div>
    )
  }
  if (typeof value === 'string' && /^(https?:\/\/|\/)/.test(value) && /file/.test(fieldName)) {
    return (
      <div className="explore-detail__field">
        <strong>{name.replaceAll('_', ' ')}</strong>
        <a className="btn btn--outline-dark" href={value} target="_blank" rel="noreferrer">
          Open document
        </a>
      </div>
    )
  }
  return (
    <div className="explore-detail__field">
      <strong>{name.replaceAll('_', ' ')}</strong>
      <p>{valueText}</p>
    </div>
  )
}

function RecordDetail({ data }: { data: unknown }) {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return <pre className="explore-detail__raw">{JSON.stringify(data, null, 2)}</pre>
  }
  return (
    <div className="explore-detail__fields">
      {Object.entries(data).map(([name, value]) => (
        <DetailValue key={name} name={name} value={value} />
      ))}
    </div>
  )
}

function record<T extends { id: number }>(
  item: T,
  title: string,
  description: string,
  detail: (id: number) => Promise<unknown>,
): ApiRecord {
  return { key: String(item.id), title, description, detail: () => detail(item.id) }
}

async function loadSections(): Promise<ApiSection[]> {
  const loaders: { id: string; title: string; description: string; load: () => Promise<ApiRecord[]> }[] = [
    {
      id: 'api-status',
      title: 'API status',
      description: 'Live status from the documented API health endpoint.',
      load: async () => {
        const status = await api.health()
        return [{ key: 'health', title: status.status, description: 'API health check', detail: api.health }]
      },
    },
    {
      id: 'events',
      title: 'Events',
      description: 'Published events and registration details.',
      load: async () =>
        unwrapList(await api.events()).map((item) => ({
          key: item.slug,
          title: item.title,
          description: [item.city, item.country, item.kind].filter(Boolean).join(' · '),
          detail: () => api.event(item.slug),
          kind: 'event' as const,
        })),
    },
    {
      id: 'speakers',
      title: 'Speakers',
      description: 'Speakers featured at published events.',
      load: async () =>
        unwrapList(await api.speakers()).map((item) =>
          record(item, item.full_name, [item.title, item.organization].filter(Boolean).join(' · '), api.speaker),
        ),
    },
    {
      id: 'award-categories',
      title: 'Award categories',
      description: 'Award categories and their published criteria.',
      load: async () =>
        unwrapList(await api.awardCategories()).map((item) =>
          record(item, item.name, item.description || item.criteria, api.awardCategory),
        ),
    },
    {
      id: 'award-winners',
      title: 'Award winners',
      description: 'Published winners and their legacy statements.',
      load: async () =>
        unwrapList(await api.awardWinners()).map((item) =>
          record(item, item.display_name, `${item.category_name} · ${item.year}`, api.awardWinner),
        ),
    },
    {
      id: 'cohorts',
      title: 'Cohorts',
      description: 'Public cohorts and their innovators.',
      load: async () =>
        unwrapList(await api.cohorts()).map((item) => ({
          key: item.slug,
          title: item.name,
          description: `${item.year} · ${item.status}`,
          detail: () => api.cohort(item.slug),
        })),
    },
    {
      id: 'alumni',
      title: 'Alumni',
      description: 'Public alumni profiles.',
      load: async () =>
        unwrapList(await api.alumni()).map((item) =>
          record(item, item.full_name, `${item.cohort_name} · ${item.cohort_year}`, api.alumnus),
        ),
    },
    {
      id: 'innovators',
      title: 'Innovators',
      description: 'Public innovator profiles.',
      load: async () =>
        unwrapList(await api.innovators()).map((item) =>
          record(item, item.full_name, item.project_title || item.current_stage || '', api.innovator),
        ),
    },
    {
      id: 'programs',
      title: 'Programs',
      description: 'Active programs with their stages and modules.',
      load: async () =>
        unwrapList(await api.programs()).map((item) => ({
          key: item.slug,
          title: item.name,
          description: item.tagline || item.description,
          detail: () => api.program(item.slug),
        })),
    },
    {
      id: 'stages',
      title: 'Program stages',
      description: 'Published program stages and modules.',
      load: async () =>
        unwrapList(await api.stages()).map((item) =>
          record(item, item.name, item.subtitle || item.description, api.stage),
        ),
    },
    {
      id: 'news',
      title: 'News',
      description: 'Published news and stories.',
      load: async () =>
        unwrapList(await api.news()).map((item) => ({
          key: item.slug,
          title: item.title,
          description: item.excerpt || item.category || '',
          detail: () => api.newsPost(item.slug),
        })),
    },
    {
      id: 'partners',
      title: 'Partners',
      description: 'Organizations supporting AxonAfrica.',
      load: async () =>
        unwrapList(await api.partners()).map((item) =>
          record(item, item.name, [item.type, item.country].filter(Boolean).join(' · '), api.partner),
        ),
    },
    {
      id: 'team',
      title: 'Team',
      description: 'Team and governance profiles.',
      load: async () =>
        unwrapList(await api.team()).map((item) =>
          record(item, item.full_name, item.role_title, api.teamMember),
        ),
    },
    {
      id: 'press-kit',
      title: 'Press kit',
      description: 'Downloadable press kit assets.',
      load: async () =>
        unwrapList(await api.pressKit()).map((item) =>
          record(item, item.title, item.description, api.pressKitItem),
        ),
    },
    {
      id: 'impact-reports',
      title: 'Impact reports',
      description: 'Published reports from the AxonAfrica API.',
      load: async () =>
        unwrapList(await api.reports()).map((item) =>
          record(item, item.title, `${item.year} · ${item.summary}`, api.report),
        ),
    },
    {
      id: 'hero-slides',
      title: 'Hero images',
      description: 'Active background images managed by the AxonAfrica team.',
      load: async () =>
        unwrapList(await api.heroSlides()).map((item) =>
          record(item, item.alt_text || `Slide ${item.order}`, `Slide ${item.order}`, api.heroSlide),
        ),
    },
  ]

  const results = await Promise.all(
    loaders.map(async (section) => {
      try {
        return { ...section, records: await section.load() }
      } catch (error) {
        return {
          ...section,
          records: [],
          error:
            error instanceof ApiError
              ? error.message
              : 'This API section could not be loaded. Please try again.',
        }
      }
    }),
  )
  return results.map(({ load: _load, ...section }) => section)
}

export function ExplorePage() {
  const [sections, setSections] = useState<ApiSection[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [selected, setSelected] = useState<SelectedRecord | null>(null)
  const [detailError, setDetailError] = useState('')
  const [nominationMessage, setNominationMessage] = useState('')
  const [nominationError, setNominationError] = useState('')
  const [eventMessage, setEventMessage] = useState('')
  const [eventError, setEventError] = useState('')

  useEffect(() => {
    let active = true
    let inFlight = false

    async function refresh() {
      if (inFlight || document.visibilityState === 'hidden') return
      inFlight = true
      try {
        const loadedSections = await loadSections()
        if (active) {
          setSections(loadedSections)
          setLastUpdated(new Date())
        }
      } finally {
        inFlight = false
        if (active) setLoading(false)
      }
    }

    function refreshWhenVisible() {
      if (document.visibilityState === 'visible') void refresh()
    }

    void refresh()
    const timer = window.setInterval(() => void refresh(), API_REFRESH_INTERVAL)
    document.addEventListener('visibilitychange', refreshWhenVisible)
    window.addEventListener('focus', refreshWhenVisible)
    return () => {
      active = false
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
      window.removeEventListener('focus', refreshWhenVisible)
    }
  }, [])

  async function selectRecord(item: ApiRecord) {
    setSelected(null)
    setDetailError('')
    setNominationMessage('')
    setNominationError('')
    setEventMessage('')
    setEventError('')
    try {
      setSelected({ record: item, data: await item.detail() })
    } catch (error) {
      setDetailError(
        error instanceof ApiError ? error.message : 'Could not load this API record.',
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
    } catch (error) {
      setNominationError(
        error instanceof ApiError ? error.message : 'Your nomination could not be submitted.',
      )
    }
  }

  async function submitEventRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected || selected.record.kind !== 'event') return
    const form = event.currentTarget
    const formData = new FormData(form)
    setEventError('')
    setEventMessage('')
    try {
      const result = await api.registerForEvent(String((selected.data as { slug: string }).slug), {
        full_name: String(formData.get('full_name')),
        email: String(formData.get('email')),
        organization: String(formData.get('organization')),
        role: String(formData.get('role')) as 'innovator' | 'institution' | 'funder' | 'mentor' | 'media' | 'other',
      })
      setEventMessage(result.message)
      form.reset()
    } catch (error) {
      setEventError(
        error instanceof ApiError ? error.message : 'Your event registration could not be submitted.',
      )
    }
  }

  const awardCategories = sections.find((section) => section.id === 'award-categories')
  const categories = awardCategories?.records ?? []
  const publishedRecords = sections.reduce((total, section) => total + section.records.length, 0)
  const liveSections = sections.filter((section) => !section.error && section.records.length > 0).length

  return (
    <>
      <section className="page-hero explore-hero">
        <HeroBackgroundSlides />
        <div className="container">
          <div className="page-hero__content">
            <div className="page-hero__copy">
              <p className="eyebrow eyebrow--on-dark">Explore AxonAfrica</p>
              <h1>Programs, people, events, and impact.</h1>
              <p>Explore public information published by the AxonAfrica API.</p>
            </div>

            <div className="card explore-hero-panel">
              <p className="eyebrow eyebrow--on-dark">Live ecosystem</p>
              <div className="explore-stat-grid">
                <div>
                  <strong>{liveSections}</strong>
                  <span>sections live</span>
                </div>
                <div>
                  <strong>{publishedRecords}</strong>
                  <span>public records</span>
                </div>
                <div>
                  <strong>{lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'sync'}</strong>
                  <span>last refresh</span>
                </div>
              </div>
              <ul className="explore-hero-list">
                <li>Programs and cohorts</li>
                <li>Innovators and alumni</li>
                <li>Events and impact data</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="explore-summary">
            <div className="card explore-summary__card">
              <div>
                <p className="eyebrow eyebrow--leaf">Public data</p>
                <h2>Explore the AxonAfrica ecosystem</h2>
              </div>
              <div className="explore-summary__meta">
                <span>{liveSections} active sections</span>
                <span>{publishedRecords} records</span>
              </div>
            </div>
          </div>

          <nav className="explore-nav" aria-label="Explore API sections">
            {[
              {
                label: 'Programs',
                items: ['events', 'programs', 'stages', 'cohorts', 'news'],
              },
              {
                label: 'People',
                items: ['speakers', 'team', 'alumni', 'innovators', 'award-winners'],
              },
              {
                label: 'Insights',
                items: ['award-categories', 'press-kit', 'impact-reports', 'hero-slides'],
              },
              {
                label: 'Quick links',
                items: ['impact', 'nominate'],
              },
            ].map((group) => {
              const visibleItems = group.items
                .map((itemId) => {
                  if (itemId === 'impact') return { id: 'impact', title: 'Impact' }
                  if (itemId === 'nominate') return { id: 'nominate', title: 'Nominate' }
                  return sections.find((section) => section.id === itemId)
                })
                .filter((item): item is { id: string; title: string } => Boolean(item))

              if (!visibleItems.length) return null

              return (
                <details className="explore-nav__group" key={group.label}>
                  <summary className="explore-nav__trigger">
                    {group.label}
                    <span className="explore-nav__chevron" aria-hidden="true" />
                  </summary>
                  <div className="explore-nav__menu">
                    {visibleItems.map((item) => (
                      <a key={item.id} href={`#${item.id}`}>
                        {item.title}
                      </a>
                    ))}
                  </div>
                </details>
              )
            })}
          </nav>

          {loading && <p role="status">Loading public API content…</p>}
          {!loading && (
            <p className="section-lead" role="status">
              API content updates automatically every minute
              {lastUpdated && ` · Last updated ${lastUpdated.toLocaleTimeString()}`}.
            </p>
          )}
          {!loading &&
            sections.map((section) => (
              <section className="explore-section" id={section.id} key={section.id}>
                <h2 className="section-title">{section.title}</h2>
                <p className="section-lead">{section.description}</p>
                {section.error ? (
                  <p className="form-error" role="alert">{section.error}</p>
                ) : section.records.length ? (
                  <div className="grid-3 explore-section__grid">
                    {section.records.map((item) => (
                      <article className="card explore-card" key={item.key}>
                        <span className="explore-card__eyebrow">{section.title}</span>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        <button
                          type="button"
                          className="btn btn--outline-dark"
                          onClick={() => void selectRecord(item)}
                        >
                          View details
                        </button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p>There are no published records in this section yet.</p>
                )}
              </section>
            ))}

          {selected && (
            <section className="card explore-detail" aria-live="polite">
              <h2>{selected.record.title}</h2>
              <button
                type="button"
                className="btn btn--outline-dark"
                onClick={() => setSelected(null)}
              >
                Close details
              </button>
              <RecordDetail data={selected.data} />
              {selected.record.kind === 'event' &&
                (selected.data as { registration_open?: boolean }).registration_open && (
                  <form className="form-stack explore-form" onSubmit={submitEventRegistration}>
                    <h3>Register for this event</h3>
                    <label>Full name<input name="full_name" required /></label>
                    <label>Email<input name="email" type="email" required /></label>
                    <label>Organization<input name="organization" /></label>
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
                    {eventError && <p className="form-error" role="alert">{eventError}</p>}
                    <button className="btn btn--gold" type="submit">Register</button>
                  </form>
                )}
            </section>
          )}
          {detailError && <p className="form-error" role="alert">{detailError}</p>}

          <section className="explore-section" id="impact">
            <h2 className="section-title">Impact breakdown</h2>
            <ImpactBreakdown />
          </section>

          <section className="explore-section" id="nominate">
            <h2 className="section-title">Nominate an innovator</h2>
            <p className="section-lead">Send a nomination to one of the published award categories.</p>
            {awardCategories?.error ? (
              <p className="form-error" role="alert">
                Award categories could not be loaded. The page will retry automatically.
              </p>
            ) : categories.length === 0 ? (
              <p role="status">
                No award categories are currently published. This section updates automatically when categories are added.
              </p>
            ) : (
              <form className="card form-stack explore-form" onSubmit={submitNomination}>
                <label>
                  Award category
                  <select name="category" required defaultValue="">
                    <option value="" disabled>Select a category</option>
                    {categories.map((item) => (
                      <option key={item.key} value={item.key}>{item.title}</option>
                    ))}
                  </select>
                </label>
                <label>Nominee name<input name="nominee_name" required /></label>
                <label>Nominee institution<input name="nominee_institution" /></label>
                <label>Why are you nominating them?<textarea name="reason" required /></label>
                <label>Your name<input name="nominator_name" required /></label>
                <label>Your email<input name="nominator_email" type="email" required /></label>
                {nominationMessage && <p className="form-ok">{nominationMessage}</p>}
                {nominationError && <p className="form-error" role="alert">{nominationError}</p>}
                <button className="btn btn--gold" type="submit">Submit nomination</button>
              </form>
            )}
          </section>
        </div>
      </section>
    </>
  )
}

function ImpactBreakdown() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.impactBreakdown>> | null>(null)
  const [stats, setStats] = useState<Awaited<ReturnType<typeof api.impactStats>> | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    let refreshing = false

    async function refresh() {
      if (refreshing || document.visibilityState === 'hidden') return
      refreshing = true
      try {
        const [breakdown, impactStats] = await Promise.all([
          api.impactBreakdown(),
          api.impactStats(),
        ])
        if (!active) return
        setData(breakdown)
        setStats(impactStats)
        setError('')
      } catch (cause) {
        if (active) {
          setError(cause instanceof ApiError ? cause.message : 'Impact data could not be loaded.')
        }
      } finally {
        refreshing = false
      }
    }

    function refreshWhenVisible() {
      if (document.visibilityState === 'visible') void refresh()
    }

    void refresh()
    const timer = window.setInterval(() => void refresh(), API_REFRESH_INTERVAL)
    document.addEventListener('visibilitychange', refreshWhenVisible)
    window.addEventListener('focus', refreshWhenVisible)
    return () => {
      active = false
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refreshWhenVisible)
      window.removeEventListener('focus', refreshWhenVisible)
    }
  }, [])
  if (error && !data) return <p className="form-error" role="alert">{error}</p>
  if (!data || !stats) return <p role="status">Loading impact data…</p>
  return (
    <div aria-live="polite">
      {error && <p className="form-error" role="alert">{error} Showing the last successfully loaded impact data.</p>}
      <div className="grid-3">
        {stats.map((stat) => (
          <div className="card" key={stat.key}>
            <strong>{stat.value}</strong>
            <p>{stat.label}</p>
          </div>
        ))}
        <div className="card"><strong>{data.alumni_count}</strong><p>Alumni innovators</p></div>
        <div className="card"><strong>{data.active_cohort_innovators}</strong><p>Active cohort innovators</p></div>
      </div>
      <div className="grid-3" style={{ marginTop: '1rem' }}>
        <div className="card">
          <h3>By country</h3>
          {data.by_country.length ? <ul>{data.by_country.map((item) => <li key={item.label}>{item.label}: {item.count}</li>)}</ul> : <p>No country breakdown published.</p>}
        </div>
        <div className="card">
          <h3>By stage</h3>
          {data.by_stage.length ? <ul>{data.by_stage.map((item) => <li key={item.code || item.label}>{item.label}: {item.count}</li>)}</ul> : <p>No stage breakdown published.</p>}
        </div>
      </div>
    </div>
  )
}
