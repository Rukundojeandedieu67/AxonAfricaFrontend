const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
  'https://axonafrica.onrender.com'

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...init?.headers,
    },
  })

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
}

export type NewsPost = {
  id: number
  title: string
  slug: string
  excerpt?: string
  cover_image?: string | null
  published_at?: string
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
}

export const api = {
  impactStats: () => request<ImpactStat[]>('/api/v1/impact/stats/'),
  heroSlides: () => request<HeroSlide[]>('/api/v1/hero-slides/'),
  applicationWindow: () => request<ApplicationWindow>('/api/v1/application-window/'),
  partners: () => request<Partner[] | { results: Partner[] }>('/api/v1/partners/'),
  team: () => request<TeamMember[] | { results: TeamMember[] }>('/api/v1/team/'),
  news: () => request<NewsPost[] | { results: NewsPost[] }>('/api/v1/news/'),
  innovators: () => request<Innovator[] | { results: Innovator[] }>('/api/v1/innovators/'),
  submitApplication: (payload: ApplicationPayload) =>
    request<{ message: string; id: number }>('/api/v1/applications/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
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
