import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ApiError,
  api,
  unwrapList,
  type ApplicationRecord,
  type AssignmentList,
  type Innovator,
  type InnovatorProgress,
  type Program,
  type UserProfile,
} from '../api/client'
import { HeroBackgroundSlides } from '../components/HeroBackgroundSlides'
import './Explore.css'

type AuthMode = 'login' | 'register' | 'reset'

function errorText(error: unknown) {
  return error instanceof ApiError ? error.message : 'The request could not be completed. Please try again.'
}

export function AccountPage() {
  const [searchParams] = useSearchParams()
  const resetUid = searchParams.get('uid')
  const resetToken = searchParams.get('token')
  const [mode, setMode] = useState<AuthMode>('login')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [applications, setApplications] = useState<ApplicationRecord[]>([])
  const [assignments, setAssignments] = useState<AssignmentList | null>(null)
  const [progress, setProgress] = useState<InnovatorProgress | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRecord | null>(null)
  const [loading, setLoading] = useState(() => api.hasSession())
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadAccount = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setError('')
    try {
      const profile = await api.currentUser()
      setUser(profile)
      const requests: [Promise<unknown>, Promise<unknown>, Promise<unknown>] = [
        api.myAssignments(),
        profile.role === 'innovator' ? api.myProgress() : Promise.resolve(null),
        profile.role === 'staff' ? Promise.resolve([]) : api.applicationList(),
      ]
      const [assignmentResult, progressResult, applicationResult] = await Promise.allSettled(requests)
      if (assignmentResult.status === 'fulfilled') {
        setAssignments(assignmentResult.value as AssignmentList)
      } else {
        setError(errorText(assignmentResult.reason))
      }
      if (progressResult.status === 'fulfilled') {
        setProgress(progressResult.value as InnovatorProgress | null)
      } else {
        setError(errorText(progressResult.reason))
      }
      if (applicationResult.status === 'fulfilled') {
        setApplications(
          unwrapList(applicationResult.value as ApplicationRecord[] | { results: ApplicationRecord[] }),
        )
      } else {
        setError(errorText(applicationResult.reason))
      }
    } catch (cause) {
      setError(errorText(cause))
      setUser(null)
      setApplications([])
      setAssignments(null)
      setProgress(null)
      api.logout()
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!api.hasSession()) return
    let active = true
    async function initializeAccount() {
      try {
        const profile = await api.currentUser()
        if (!active) return
        setUser(profile)
        const requests: [Promise<unknown>, Promise<unknown>, Promise<unknown>] = [
          api.myAssignments(),
          profile.role === 'innovator' ? api.myProgress() : Promise.resolve(null),
          profile.role === 'staff' ? Promise.resolve([]) : api.applicationList(),
        ]
        const [assignmentResult, progressResult, applicationResult] = await Promise.allSettled(requests)
        if (!active) return
        if (assignmentResult.status === 'fulfilled') {
          setAssignments(assignmentResult.value as AssignmentList)
        } else {
          setError(errorText(assignmentResult.reason))
        }
        if (progressResult.status === 'fulfilled') {
          setProgress(progressResult.value as InnovatorProgress | null)
        } else {
          setError(errorText(progressResult.reason))
        }
        if (applicationResult.status === 'fulfilled') {
          setApplications(
            unwrapList(applicationResult.value as ApplicationRecord[] | { results: ApplicationRecord[] }),
          )
        } else {
          setError(errorText(applicationResult.reason))
        }
      } catch (cause) {
        if (!active) return
        setError(errorText(cause))
        setUser(null)
        setApplications([])
        setAssignments(null)
        setProgress(null)
        api.logout()
      } finally {
        if (active) setLoading(false)
      }
    }
    void initializeAccount()
    return () => {
      active = false
    }
  }, [])

  async function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setError('')
    setNotice('')
    try {
      await api.login(String(data.get('email')), String(data.get('password')))
      await loadAccount()
      setNotice('You are signed in.')
    } catch (cause) {
      setError(errorText(cause))
    }
  }

  async function onRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setError('')
    setNotice('')
    try {
      const result = await api.register({
        email: String(data.get('email')),
        password: String(data.get('password')),
        full_name: String(data.get('full_name')),
        phone: String(data.get('phone')),
        country: String(data.get('country')),
        preferred_language: String(data.get('preferred_language')) as 'en' | 'fr' | 'rw',
      })
      setNotice(`${result.message} Sign in to continue.`)
      setMode('login')
      form.reset()
    } catch (cause) {
      setError(errorText(cause))
    }
  }

  async function onResetRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setError('')
    setNotice('')
    try {
      const result = await api.requestPasswordReset(String(data.get('email')))
      setNotice(result.message)
    } catch (cause) {
      setError(errorText(cause))
    }
  }

  async function onResetConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!resetUid || !resetToken) return
    const data = new FormData(event.currentTarget)
    setError('')
    setNotice('')
    try {
      const result = await api.confirmPasswordReset(
        resetUid,
        resetToken,
        String(data.get('new_password')),
      )
      setNotice(result.message)
    } catch (cause) {
      setError(errorText(cause))
    }
  }

  async function onProfileUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setError('')
    setNotice('')
    try {
      const updated = await api.updateCurrentUser({
        first_name: String(data.get('first_name')),
        last_name: String(data.get('last_name')),
        phone: String(data.get('phone')),
        country: String(data.get('country')),
        preferred_language: String(data.get('preferred_language')) as 'en' | 'fr' | 'rw',
      })
      setUser(updated)
      setNotice('Your profile has been updated.')
    } catch (cause) {
      setError(errorText(cause))
    }
  }

  async function onPasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setError('')
    setNotice('')
    try {
      const result = await api.changePassword(
        String(data.get('current_password')),
        String(data.get('new_password')),
      )
      setNotice(result.message)
      form.reset()
    } catch (cause) {
      setError(errorText(cause))
    }
  }

  async function onProgressUpdate(event: FormEvent<HTMLFormElement>, moduleId: number) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setError('')
    setNotice('')
    try {
      await api.updateMyProgress(moduleId, {
        status: String(data.get('status')) as 'not_started' | 'in_progress' | 'completed',
        notes: String(data.get('notes')),
      })
      await loadAccount()
      setNotice('Module progress has been updated.')
    } catch (cause) {
      setError(errorText(cause))
    }
  }

  function onLogout() {
    api.logout()
    setUser(null)
    setApplications([])
    setAssignments(null)
    setProgress(null)
    setSelectedApplication(null)
    setNotice('You are signed out.')
  }

  async function openApplication(id: number) {
    setError('')
    try {
      setSelectedApplication(await api.application(id))
    } catch (cause) {
      setError(errorText(cause))
    }
  }

  return (
    <>
      <section className="page-hero">
        <HeroBackgroundSlides />
        <div className="container">
          <p className="eyebrow eyebrow--on-dark">AxonAfrica account</p>
          <h1>{user ? `Welcome, ${user.first_name || user.email}` : 'Your account and program activity.'}</h1>
          <p>Sign in to access your profile, applications, assignments, and learning progress.</p>
        </div>
      </section>
      <section className="section">
        <div className="container account-page">
          {error && <p className="form-error" role="alert">{error}</p>}
          {notice && <p className="form-ok" role="status">{notice}</p>}
          {loading && <p role="status">Loading account…</p>}

          {resetUid && resetToken ? (
            <form className="card form-stack account-form" onSubmit={onResetConfirm}>
              <h2>Choose a new password</h2>
              <label>New password<input type="password" name="new_password" autoComplete="new-password" minLength={8} required /></label>
              <button type="submit" className="btn btn--gold">Reset password</button>
            </form>
          ) : !user ? (
            <div className="account-auth">
              <div className="account-tabs" role="tablist" aria-label="Account actions">
                {(['login', 'register', 'reset'] as AuthMode[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`btn ${mode === item ? 'btn--green' : 'btn--outline-dark'}`}
                    role="tab"
                    aria-selected={mode === item}
                    onClick={() => { setMode(item); setError(''); setNotice('') }}
                  >
                    {item === 'login' ? 'Sign in' : item === 'register' ? 'Create account' : 'Reset password'}
                  </button>
                ))}
              </div>
              {mode === 'login' && (
                <form className="card form-stack account-form" onSubmit={onLogin}>
                  <h2>Sign in</h2>
                  <label>Email<input name="email" type="email" autoComplete="email" required /></label>
                  <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
                  <button type="submit" className="btn btn--gold">Sign in</button>
                </form>
              )}
              {mode === 'register' && (
                <form className="card form-stack account-form" onSubmit={onRegister}>
                  <h2>Create an innovator account</h2>
                  <label>Full name<input name="full_name" autoComplete="name" required /></label>
                  <label>Email<input name="email" type="email" autoComplete="email" required /></label>
                  <label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
                  <label>Phone<input name="phone" type="tel" autoComplete="tel" /></label>
                  <label>Country<input name="country" autoComplete="country-name" /></label>
                  <label>
                    Preferred language
                    <select name="preferred_language" defaultValue="en">
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="rw">Kinyarwanda</option>
                    </select>
                  </label>
                  <button type="submit" className="btn btn--gold">Create account</button>
                </form>
              )}
              {mode === 'reset' && (
                <form className="card form-stack account-form" onSubmit={onResetRequest}>
                  <h2>Reset password</h2>
                  <p>Enter your account email. If there is an account, the API will send a reset link.</p>
                  <label>Email<input name="email" type="email" autoComplete="email" required /></label>
                  <button type="submit" className="btn btn--gold">Send reset link</button>
                </form>
              )}
            </div>
          ) : (
            <>
              <div className="account-heading">
                <h2>{user.first_name} {user.last_name}</h2>
                <p>{user.email} · {user.role}</p>
                {user.role === 'staff' && <Link className="btn btn--outline-dark" to="/staff/applications">Review applications</Link>}
                <button type="button" className="btn btn--outline-dark" onClick={onLogout}>Sign out</button>
              </div>
              <div className="account-grid">
                <form className="card form-stack" onSubmit={onProfileUpdate}>
                  <h2>Profile</h2>
                  <label>First name<input name="first_name" defaultValue={user.first_name} /></label>
                  <label>Last name<input name="last_name" defaultValue={user.last_name} /></label>
                  <label>Phone<input name="phone" defaultValue={user.phone} /></label>
                  <label>Country<input name="country" defaultValue={user.country} /></label>
                  <label>
                    Preferred language
                    <select name="preferred_language" defaultValue={user.preferred_language}>
                      <option value="en">English</option><option value="fr">French</option><option value="rw">Kinyarwanda</option>
                    </select>
                  </label>
                  <button type="submit" className="btn btn--gold">Save profile</button>
                </form>
                <form className="card form-stack" onSubmit={onPasswordChange}>
                  <h2>Change password</h2>
                  <label>Current password<input name="current_password" type="password" autoComplete="current-password" required /></label>
                  <label>New password<input name="new_password" type="password" autoComplete="new-password" minLength={8} required /></label>
                  <button type="submit" className="btn btn--gold">Change password</button>
                </form>
              </div>

              {user.role === 'innovator' && progress && (
                <section className="account-section">
                  <h2>Learning progress</h2>
                  <p>{progress.cohort.name} · {progress.current_stage || 'Stage not set'} · {progress.progress_percent}%</p>
                  <div className="grid-3">
                    {progress.module_progress.map((module) => (
                      <form
                        className="card form-stack"
                        key={module.id}
                        onSubmit={(event) => void onProgressUpdate(event, module.module)}
                      >
                        <h3>{module.module_title}</h3>
                        <p>{module.stage_name}</p>
                        <label>
                          Status
                          <select name="status" defaultValue={module.status}>
                            <option value="not_started">Not started</option>
                            <option value="in_progress">In progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </label>
                        <label>Notes<textarea name="notes" defaultValue={module.notes} /></label>
                        <button className="btn btn--outline-dark" type="submit">Save progress</button>
                      </form>
                    ))}
                  </div>
                </section>
              )}

              {assignments && (
                <section className="account-section">
                  <h2>Assignments</h2>
                  {!assignments.cohorts.length && !assignments.events.length ? (
                    <p>No cohort or event assignments are associated with this account.</p>
                  ) : (
                    <div className="grid-3">
                      {assignments.cohorts.map((item) => (
                        <article className="card" key={`cohort-${item.id}`}>
                          <h3>{item.cohort.name}</h3><p>{item.role} · {item.notes}</p>
                        </article>
                      ))}
                      {assignments.events.map((item) => (
                        <article className="card" key={`event-${item.id}`}>
                          <h3>{item.event.title}</h3><p>{item.role} · {item.notes}</p>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {['staff', 'mentor', 'judge', 'ambassador'].includes(user.role) && (
                <InnovatorModuleUpdates />
              )}

              {user.role !== 'staff' && (
                <section className="account-section">
                  <h2>Applications</h2>
                  {applications.length ? (
                    <div className="grid-3">
                      {applications.map((application) => (
                        <article className="card" key={application.id}>
                          <h3>{application.idea_title}</h3>
                          <p>{application.status.replaceAll('_', ' ')} · {new Date(application.created_at).toLocaleDateString()}</p>
                          {application.cv && <a href={application.cv} target="_blank" rel="noreferrer">View CV</a>}
                          {application.pitch_deck && <a href={application.pitch_deck} target="_blank" rel="noreferrer">View pitch deck</a>}
                          <button
                            className="btn btn--outline-dark"
                            type="button"
                            onClick={() => void openApplication(application.id)}
                          >
                            View application
                          </button>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p>No applications are linked to this account. <Link to="/apply">Start an application</Link>.</p>
                  )}
                  {selectedApplication && (
                    <article className="card account-section__application">
                      <h3>{selectedApplication.idea_title}</h3>
                      <p>Status: {selectedApplication.status.replaceAll('_', ' ')}</p>
                      <h4>Problem statement</h4>
                      <p>{selectedApplication.problem_statement}</p>
                      <h4>Idea summary</h4>
                      <p>{selectedApplication.idea_summary}</p>
                      <button
                        className="btn btn--outline-dark"
                        type="button"
                        onClick={() => setSelectedApplication(null)}
                      >
                        Close application
                      </button>
                    </article>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}

function InnovatorModuleUpdates() {
  const [innovators, setInnovators] = useState<Innovator[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [innovatorId, setInnovatorId] = useState('')
  const [moduleId, setModuleId] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [innovatorData, programData] = await Promise.all([api.innovators(), api.programs()])
        const programDetails = await Promise.all(
          unwrapList(programData).map((program) => api.program(program.slug)),
        )
        if (!active) return
        setInnovators(unwrapList(innovatorData))
        setPrograms(programDetails)
      } catch (cause) {
        if (active) setError(errorText(cause))
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [])

  const modules = programs.flatMap((program) =>
    (program.stages ?? []).flatMap((stage) =>
      stage.modules.map((module) => ({ ...module, stageName: stage.name })),
    ),
  )

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    if (!innovatorId || !moduleId) return
    setError('')
    setNotice('')
    setSaving(true)
    try {
      await api.updateInnovatorModule(Number(innovatorId), Number(moduleId), {
        status: String(data.get('status')) as 'not_started' | 'in_progress' | 'completed',
        notes: String(data.get('notes')),
      })
      setNotice('Progress update saved.')
      form.reset()
      setInnovatorId('')
      setModuleId('')
    } catch (cause) {
      setError(errorText(cause))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="account-section">
      <h2>Update an innovator’s module progress</h2>
      <p>Available innovators and modules are provided by the API. Your account can update only records it is permitted to manage.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      {notice && <p className="form-ok" role="status">{notice}</p>}
      <form className="card form-stack account-form" onSubmit={onSubmit}>
        <label>
          Innovator
          <select
            name="innovator"
            required
            value={innovatorId}
            onChange={(event) => setInnovatorId(event.target.value)}
          >
            <option value="">Select an innovator</option>
            {innovators.map((innovator) => (
              <option key={innovator.id} value={innovator.id}>{innovator.full_name}</option>
            ))}
          </select>
        </label>
        <label>
          Module
          <select
            name="module"
            required
            value={moduleId}
            onChange={(event) => setModuleId(event.target.value)}
          >
            <option value="">Select a module</option>
            {modules.map((module) => (
              <option key={module.id} value={module.id}>{module.stageName} — {module.title}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select name="status" defaultValue="in_progress">
            <option value="not_started">Not started</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <label>Notes<textarea name="notes" /></label>
        <button className="btn btn--gold" type="submit" disabled={saving || !innovators.length || !modules.length}>
          {saving ? 'Saving…' : 'Save progress'}
        </button>
      </form>
    </section>
  )
}
