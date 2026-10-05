import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, api, unwrapList, type ApplicationRecord, type UserProfile } from '../api/client'
import { HeroBackgroundSlides } from '../components/HeroBackgroundSlides'
import './Explore.css'

function errorText(error: unknown) {
  return error instanceof ApiError ? error.message : 'The request could not be completed. Please try again.'
}

export function StaffApplicationsPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [applications, setApplications] = useState<ApplicationRecord[]>([])
  const [selected, setSelected] = useState<ApplicationRecord | null>(null)
  const [loading, setLoading] = useState(() => api.hasSession())
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!api.hasSession()) return
    let active = true
    async function loadApplications() {
      try {
        const profile = await api.currentUser()
        if (!active) return
        setUser(profile)
        if (profile.role !== 'staff') {
          setApplications([])
          setSelected(null)
          return
        }
        const data = await api.applicationList()
        if (active) setApplications(unwrapList(data))
      } catch (cause) {
        if (!active) return
        setError(errorText(cause))
        setApplications([])
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadApplications()
    return () => {
      active = false
    }
  }, [])

  async function openApplication(id: number) {
    setError('')
    setNotice('')
    try {
      setSelected(await api.application(id))
    } catch (cause) {
      setError(errorText(cause))
    }
  }

  async function updateApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected) return
    const form = event.currentTarget
    const data = new FormData(form)
    setError('')
    setNotice('')
    try {
      const updated = await api.updateApplication(selected.id, {
        status: String(data.get('status')) as ApplicationRecord['status'],
        score: data.get('score') ? Number(data.get('score')) : null,
        assigned_reviewer: data.get('assigned_reviewer')
          ? Number(data.get('assigned_reviewer'))
          : null,
        cohort: data.get('cohort') ? Number(data.get('cohort')) : null,
        reviewer_notes: String(data.get('reviewer_notes')),
      })
      setSelected(updated)
      setApplications((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      setNotice('Application review has been saved.')
    } catch (cause) {
      setError(errorText(cause))
    }
  }

  async function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected) return
    const form = event.currentTarget
    const data = new FormData(form)
    setError('')
    setNotice('')
    try {
      await api.addApplicationNote(selected.id, String(data.get('body')))
      setSelected(await api.application(selected.id))
      setNotice('Review note added.')
      form.reset()
    } catch (cause) {
      setError(errorText(cause))
    }
  }

  return (
    <>
      <section className="page-hero">
        <HeroBackgroundSlides />
        <div className="container">
          <p className="eyebrow eyebrow--on-dark">Staff workspace</p>
          <h1>Application reviews.</h1>
          <p>Review applications and record decisions using the staff API.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {loading && <p role="status">Loading staff workspace…</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          {notice && <p className="form-ok" role="status">{notice}</p>}
          {!api.hasSession() && !loading && (
            <div className="card">
              <p>Sign in with a staff account to review applications.</p>
              <Link className="btn btn--gold" to="/account">Go to sign in</Link>
            </div>
          )}
          {user && user.role !== 'staff' && (
            <div className="card">
              <h2>Staff access required</h2>
              <p>This workspace is available only to accounts with the staff role.</p>
              <Link className="btn btn--outline-dark" to="/account">Return to your account</Link>
            </div>
          )}
          {user?.role === 'staff' && (
            <div className="staff-review">
              <section aria-labelledby="application-list-title">
                <h2 id="application-list-title">Applications ({applications.length})</h2>
                {applications.length ? (
                  <div className="staff-review__list">
                    {applications.map((application) => (
                      <button
                        className={`card staff-review__item ${selected?.id === application.id ? 'is-selected' : ''}`}
                        key={application.id}
                        type="button"
                        onClick={() => void openApplication(application.id)}
                      >
                        <strong>{application.idea_title}</strong>
                        <span>{application.full_name}</span>
                        <span>{application.status.replaceAll('_', ' ')}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p>No applications are available for review.</p>
                )}
              </section>
              {selected && (
                <section className="staff-review__detail">
                  <h2>{selected.idea_title}</h2>
                  <p><strong>{selected.full_name}</strong> · {selected.email}</p>
                  <p>{selected.university} · {selected.faculty} · Year {selected.year_of_study}</p>
                  <h3>Problem statement</h3><p>{selected.problem_statement}</p>
                  <h3>Idea summary</h3><p>{selected.idea_summary}</p>
                  {selected.cv && <p><a href={selected.cv} target="_blank" rel="noreferrer">View CV</a></p>}
                  {selected.pitch_deck && <p><a href={selected.pitch_deck} target="_blank" rel="noreferrer">View pitch deck</a></p>}

                  <form className="card form-stack" onSubmit={updateApplication}>
                    <h3>Review decision</h3>
                    <label>
                      Status
                      <select name="status" defaultValue={selected.status}>
                        <option value="submitted">Submitted</option>
                        <option value="under_review">Under review</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </label>
                    <label>Score (0–100)<input name="score" type="number" min="0" max="100" defaultValue={selected.score ?? ''} /></label>
                    <label>Assigned reviewer user ID<input name="assigned_reviewer" type="number" min="1" defaultValue={selected.assigned_reviewer ?? ''} /></label>
                    <label>Cohort ID<input name="cohort" type="number" min="1" defaultValue={selected.cohort ?? ''} /></label>
                    <label>Reviewer notes<textarea name="reviewer_notes" defaultValue={selected.reviewer_notes || ''} /></label>
                    <button className="btn btn--gold" type="submit">Save review</button>
                  </form>

                  <form className="card form-stack" onSubmit={addNote}>
                    <h3>Review notes</h3>
                    {selected.review_notes?.length ? (
                      <ul className="staff-review__notes">
                        {selected.review_notes.map((note) => (
                          <li key={note.id}>
                            <p>{note.body}</p>
                            <small>{note.author_name || note.author_email} · {new Date(note.created_at).toLocaleString()}</small>
                          </li>
                        ))}
                      </ul>
                    ) : <p>No review notes yet.</p>}
                    <label>Add a note<textarea name="body" required /></label>
                    <button className="btn btn--outline-dark" type="submit">Add note</button>
                  </form>
                </section>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
