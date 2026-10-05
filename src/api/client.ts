const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://axonafrica.onrender.com'
const ACCESS_TOKEN_KEY = 'axonafrica-access-token'
const REFRESH_TOKEN_KEY = 'axonafrica-refresh-token'

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const refresh = sessionStorage.getItem(REFRESH_TOKEN_KEY)
  if (!refresh) return false
  const response = await fetch(`${API_URL}/api/v1/auth/token/refresh/`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })
  if (!response.ok) {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
    return false
  }
  const tokens = (await response.json()) as { access: string }
  sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.access)
  return true
}

async function request<T>(path: string, init?: RequestInit, retryAuth = true): Promise<T> {
  const token = sessionStorage.getItem(ACCESS_TOKEN_KEY)
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (
    res.status === 401 &&
    retryAuth &&
    !path.endsWith('/auth/token/') &&
    !path.endsWith('/auth/token/refresh/') &&
    (await refreshAccessToken())
  ) {
    return request<T>(path, init, false)
  }

  const text = await res.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  if (!res.ok) {
    const message =
      typeof body === 'object' && body && 'detail' in body
        ? String((body as { detail: unknown }).detail)
        : typeof body === 'object' && body
          ? Object.entries(body).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join('; ')
        : `Request failed (${res.status})`
    throw new ApiError(message, res.status, body)
  }

  return body as T
}

export type ImpactStat = {
  key: string
  label: string
  value: number
}

export type HeroSlide = {
  id: number
  image: string
  alt_text?: string
  order: number
}

export type Alumni = Innovator & {
  cohort_name: string
  cohort_year: number
}

export type Cohort = {
  name: string
  slug: string
  year: number
  status: 'upcoming' | 'active' | 'completed'
  start_date: string | null
  end_date: string | null
  summary: string
  innovators?: Innovator[]
}

export type AwardCategory = {
  id: number
  name: string
  slug: string
  description: string
  criteria: string
  order: number
}

export type AwardWinner = {
  id: number
  category: number
  category_name: string
  year: number
  innovator: number | null
  display_name: string
  photo: string | null
  legacy_statement: string
}

export type AwardNomination = {
  category: number
  nominee_name: string
  nominee_institution: string
  reason: string
  nominator_name: string
  nominator_email: string
}

export type EventSpeaker = {
  id: number
  full_name: string
  title: string
  organization: string
  bio: string
  photo: string | null
}

export type EventSession = {
  id: number
  title: string
  description: string
  speakers: EventSpeaker[]
  starts_at: string
  ends_at: string
  room: string
}

export type EventHighlight = {
  id: number
  title: string
  summary: string
  image: string | null
  order: number
}

export type Event = {
  id: number
  title: string
  slug: string
  kind: 'summit' | 'awards_ceremony' | 'workshop' | 'other'
  starts_at: string
  ends_at: string
  venue: string
  city: string
  country: string
  cover_image: string | null
  registration_open: boolean
  description?: string
  sessions?: EventSession[]
  speakers?: EventSpeaker[]
  highlights?: EventHighlight[]
}

export type EventRegistration = {
  full_name: string
  email: string
  organization: string
  role: 'innovator' | 'institution' | 'funder' | 'mentor' | 'media' | 'other'
}

export type ImpactCount = {
  label: string
  count: number
  code?: string
}

export type ImpactBreakdown = {
  by_country: ImpactCount[]
  by_stage: ImpactCount[]
  alumni_count: number
  active_cohort_innovators: number
}

export type ProgramModule = {
  id: number
  title: string
  description: string
  order: number
}

export type ProgramStage = {
  id: number
  code: string
  name: string
  subtitle: string
  description: string
  order: number
  modules: ProgramModule[]
}

export type Program = {
  slug: string
  kind: string
  name: string
  tagline: string
  description: string
  order: number
  stages?: ProgramStage[]
}

export type ModuleProgress = {
  id: number
  module: number
  module_title: string
  stage_code: string
  stage_name: string
  status: 'not_started' | 'in_progress' | 'completed'
  notes: string
  completed_at: string | null
  updated_at: string
}

export type InnovatorProgress = {
  id: number
  full_name: string
  cohort: Cohort
  current_stage: string | null
  progress_percent: number
  stage_history: { id: number; stage: number; stage_name: string; entered_at: string; notes: string }[]
  assignments: {
    id: number
    expert_user: number | null
    expert_name: string
    expert_email: string | null
    expert_role: string
    partner_institution: number | null
    partner_name: string | null
  }[]
  module_progress: ModuleProgress[]
}

export type UserRole = 'innovator' | 'mentor' | 'judge' | 'ambassador' | 'staff'
export type UserProfile = {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string
  country: string
  preferred_language: 'en' | 'fr' | 'rw'
  role: UserRole
}

export type RegistrationPayload = {
  email: string
  password: string
  full_name: string
  phone?: string
  country?: string
  preferred_language?: 'en' | 'fr' | 'rw'
}

export type AssignmentList = {
  cohorts: {
    id: number
    cohort: Cohort
    role: string
    notes: string
    created_at: string
  }[]
  events: {
    id: number
    event: Event
    role: string
    notes: string
    created_at: string
  }[]
}

export type Partner = {
  id: number
  name: string
  type: string
  logo?: string | null
  website?: string
  description?: string
  country?: string
  is_featured?: boolean
}

export type TeamMember = {
  id: number
  full_name: string
  role_title: string
  group?: string
  photo?: string | null
  bio?: string
  linkedin_url?: string
}

export type NewsPost = {
  id: number
  title: string
  slug: string
  excerpt?: string
  cover_image?: string | null
  published_at?: string
  body?: string
  category?: string
  author_name?: string
}

export type PressKitItem = {
  id: number
  title: string
  description: string
  file: string
  order: number
}

export type ImpactReport = {
  id: number
  year: number
  title: string
  summary: string
  file: string
  cover_image: string | null
}

export type ApplicationRecord = Omit<ApplicationPayload, 'cv' | 'pitch_deck'> & {
  id: number
  cv: string | null
  pitch_deck: string | null
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected'
  cohort: number | null
  created_at: string
  updated_at: string
  user?: number | null
  assigned_reviewer?: number | null
  score?: number | null
  reviewer_notes?: string
  review_notes?: ReviewNote[]
}

export type ReviewNote = {
  id: number
  author: number | null
  author_email: string | null
  author_name: string
  body: string
  created_at: string
}

export type ModuleProgressUpdate = {
  status: ModuleProgress['status']
  notes?: string
}

export type Innovator = {
  id: number
  full_name: string
  photo?: string | null
  faculty?: string
  university?: string
  country?: string
  project_title?: string
  project_summary?: string
  current_stage?: string
  progress_percent?: number
}

export type ApplicationPayload = {
  full_name: string
  email: string
  phone?: string
  country: string
  university: string
  faculty: string
  year_of_study: number
  idea_title: string
  problem_statement: string
  idea_summary: string
  cv?: File | null
  pitch_deck?: File | null
}

export type ApplicationWindow = {
  status: 'upcoming' | 'open' | 'closed'
  is_open: boolean
  opens_at: string | null
  deadline: string | null
}

type FundCohortPayload = {
  organization: string
  contact_name: string
  email: string
  amount_range: string
  message: string
  phone?: string
}

type PartnerRequestPayload = {
  institution_name: string
  institution_type: string
  contact_name: string
  email: string
  offer: string
  message: string
}

type VolunteerRequestPayload = {
  kind: 'mentor' | 'judge' | 'ambassador' | 'exhibitor'
  full_name: string
  email: string
  organization: string
  expertise: string
  message: string
  phone?: string
  faculty?: string
}

export const api = {
  hasSession: () => Boolean(sessionStorage.getItem(ACCESS_TOKEN_KEY)),
  health: () => request<{ status: string }>('/api/health/'),
  impactStats: () => request<ImpactStat[]>('/api/v1/impact/stats/'),
  impactBreakdown: () => request<ImpactBreakdown>('/api/v1/impact/breakdown/'),
  heroSlides: () => request<HeroSlide[]>('/api/v1/hero-slides/'),
  heroSlide: (id: number) => request<HeroSlide>(`/api/v1/hero-slides/${id}/`),
  applicationWindow: () => request<ApplicationWindow>('/api/v1/application-window/'),
  applicationList: () => request<ApplicationRecord[] | { results: ApplicationRecord[] }>('/api/v1/applications/'),
  application: (id: number) => request<ApplicationRecord>(`/api/v1/applications/${id}/`),
  updateApplication: (id: number, data: Partial<ApplicationRecord>) =>
    request<ApplicationRecord>(`/api/v1/applications/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  addApplicationNote: (id: number, body: string) =>
    request<ReviewNote>(`/api/v1/applications/${id}/notes/`, { method: 'POST', body: JSON.stringify({ body }) }),
  login: (email: string, password: string) =>
    request<{ access: string; refresh: string }>('/api/v1/auth/token/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }).then((tokens) => {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.access)
      sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh)
      return tokens
    }),
  register: (data: RegistrationPayload) =>
    request<{ message: string; id: number }>('/api/v1/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  currentUser: () => request<UserProfile>('/api/v1/auth/me/'),
  updateCurrentUser: (data: Partial<Pick<UserProfile, 'first_name' | 'last_name' | 'phone' | 'country' | 'preferred_language'>>) =>
    request<UserProfile>('/api/v1/auth/me/', { method: 'PATCH', body: JSON.stringify(data) }),
  changePassword: (current_password: string, new_password: string) =>
    request<{ message: string }>('/api/v1/auth/password-change/', {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    }),
  requestPasswordReset: (email: string) =>
    request<{ message: string }>('/api/v1/auth/password-reset/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  confirmPasswordReset: (uid: string, token: string, new_password: string) =>
    request<{ message: string }>('/api/v1/auth/password-reset/confirm/', {
      method: 'POST',
      body: JSON.stringify({ uid, token, new_password }),
    }),
  logout: () => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  },
  awardCategories: () => request<AwardCategory[] | { results: AwardCategory[] }>('/api/v1/awards/categories/'),
  awardCategory: (id: number) => request<AwardCategory>(`/api/v1/awards/categories/${id}/`),
  awardWinners: () => request<AwardWinner[] | { results: AwardWinner[] }>('/api/v1/awards/winners/'),
  awardWinner: (id: number) => request<AwardWinner>(`/api/v1/awards/winners/${id}/`),
  nominate: (data: AwardNomination) =>
    request<{ message: string; id: number }>('/api/v1/awards/nominations/', { method: 'POST', body: JSON.stringify(data) }),
  cohorts: () => request<Cohort[] | { results: Cohort[] }>('/api/v1/cohorts/'),
  cohort: (slug: string) => request<Cohort>(`/api/v1/cohorts/${encodeURIComponent(slug)}/`),
  events: () => request<Event[] | { results: Event[] }>('/api/v1/events/'),
  event: (slug: string) => request<Event>(`/api/v1/events/${encodeURIComponent(slug)}/`),
  registerForEvent: (slug: string, data: EventRegistration) =>
    request<{ message: string; id: number }>(`/api/v1/events/${encodeURIComponent(slug)}/register/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  speakers: () => request<EventSpeaker[] | { results: EventSpeaker[] }>('/api/v1/speakers/'),
  speaker: (id: number) => request<EventSpeaker>(`/api/v1/speakers/${id}/`),
  alumni: () => request<Alumni[] | { results: Alumni[] }>('/api/v1/alumni/'),
  alumnus: (id: number) => request<Alumni>(`/api/v1/alumni/${id}/`),
  partners: () => request<Partner[] | { results: Partner[] }>('/api/v1/partners/'),
  partner: (id: number) => request<Partner>(`/api/v1/partners/${id}/`),
  team: () => request<TeamMember[] | { results: TeamMember[] }>('/api/v1/team/'),
  teamMember: (id: number) => request<TeamMember>(`/api/v1/team/${id}/`),
  news: () => request<NewsPost[] | { results: NewsPost[] }>('/api/v1/news/'),
  newsPost: (slug: string) => request<NewsPost>(`/api/v1/news/${encodeURIComponent(slug)}/`),
  pressKit: () => request<PressKitItem[] | { results: PressKitItem[] }>('/api/v1/press-kit/'),
  pressKitItem: (id: number) => request<PressKitItem>(`/api/v1/press-kit/${id}/`),
  reports: () => request<ImpactReport[] | { results: ImpactReport[] }>('/api/v1/reports/'),
  report: (id: number) => request<ImpactReport>(`/api/v1/reports/${id}/`),
  programs: () => request<Program[] | { results: Program[] }>('/api/v1/programs/'),
  program: (slug: string) => request<Program>(`/api/v1/programs/${encodeURIComponent(slug)}/`),
  stages: () => request<ProgramStage[] | { results: ProgramStage[] }>('/api/v1/stages/'),
  stage: (id: number) => request<ProgramStage>(`/api/v1/stages/${id}/`),
  innovators: () => request<Innovator[] | { results: Innovator[] }>('/api/v1/innovators/'),
  innovator: (id: number) => request<Innovator>(`/api/v1/innovators/${id}/`),
  updateInnovatorModule: (id: number, moduleId: number, data: ModuleProgressUpdate) =>
    request<ModuleProgress>(`/api/v1/innovators/${id}/modules/${moduleId}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  myProgress: () => request<InnovatorProgress>('/api/v1/me/progress/'),
  updateMyProgress: (module: number, data: ModuleProgressUpdate) =>
    request<ModuleProgress>('/api/v1/me/progress/', { method: 'PATCH', body: JSON.stringify({ module, ...data }) }),
  myAssignments: () => request<AssignmentList>('/api/v1/me/assignments/'),
  submitApplication: (payload: ApplicationPayload) => {
    if (payload.cv || payload.pitch_deck) {
      const formData = new FormData()
      for (const [key, value] of Object.entries(payload)) {
        if (value instanceof File) formData.set(key, value)
        else if (value !== undefined && value !== null) formData.set(key, String(value))
      }
      return request<{ message: string; id: number }>('/api/v1/applications/', {
        method: 'POST',
        body: formData,
      })
    }
    return request<{ message: string; id: number }>('/api/v1/applications/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  fundCohort: (payload: FundCohortPayload) =>
    request('/api/v1/involvement/fund-cohort/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  partnerRequest: (payload: PartnerRequestPayload) =>
    request('/api/v1/involvement/partner/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  volunteerRequest: (payload: VolunteerRequestPayload) =>
    request('/api/v1/involvement/volunteer/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}

export function unwrapList<T>(data: T[] | { results: T[] } | null | undefined): T[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  return data.results ?? []
}
