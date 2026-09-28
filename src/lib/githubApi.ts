import { GITHUB_CONFIG, getStoredToken } from './githubConfig'

function authHeaders(): HeadersInit {
  const token = getStoredToken()
  return token
    ? { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' }
    : { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
}

async function ghFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${GITHUB_CONFIG.apiBase}${path}`, { headers: authHeaders() })
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`)
  return res.json() as Promise<T>
}

export interface GHRelease {
  tag_name: string
  name: string
  published_at: string
  html_url: string
  prerelease: boolean
  draft: boolean
}

export interface GHWorkflowRun {
  id: number
  name: string
  status: string
  conclusion: string | null
  created_at: string
  updated_at: string
  html_url: string
  head_branch: string
}

export interface GHPages {
  status: string
  url: string
  custom_domain: string | null
  source: { branch: string; path: string }
}

export interface GHRepo {
  full_name: string
  default_branch: string
  pushed_at: string
  updated_at: string
  private: boolean
}

export interface TokenPermissions {
  repo: boolean
  releases: boolean
  actions: boolean
  pages: boolean
}

export async function fetchLatestRelease(): Promise<GHRelease> {
  return ghFetch<GHRelease>('/releases/latest')
}

export async function fetchLatestWorkflowRun(): Promise<GHWorkflowRun | null> {
  const data = await ghFetch<{ workflow_runs: GHWorkflowRun[] }>('/actions/runs?per_page=1')
  return data.workflow_runs[0] ?? null
}

export async function fetchPagesInfo(): Promise<GHPages> {
  return ghFetch<GHPages>('/pages')
}

export async function fetchRepoInfo(): Promise<GHRepo> {
  return ghFetch<GHRepo>('')
}

export async function validateToken(token: string): Promise<TokenPermissions> {
  const base = GITHUB_CONFIG.apiBase
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  }

  const [repoRes, relRes, actRes, pagesRes] = await Promise.allSettled([
    fetch(`${base}`, { headers }),
    fetch(`${base}/releases/latest`, { headers }),
    fetch(`${base}/actions/runs?per_page=1`, { headers }),
    fetch(`${base}/pages`, { headers }),
  ])

  return {
    repo:     repoRes.status    === 'fulfilled' && repoRes.value.status < 400,
    releases: relRes.status     === 'fulfilled' && relRes.value.status < 400,
    actions:  actRes.status     === 'fulfilled' && actRes.value.status < 400,
    pages:    pagesRes.status   === 'fulfilled' && pagesRes.value.status < 400,
  }
}

export function formatRelativeTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const mins  = Math.floor(diff / 60_000)
    const hours = Math.floor(diff / 3_600_000)
    const days  = Math.floor(diff / 86_400_000)
    if (mins < 2)   return 'همین الان'
    if (mins < 60)  return `${mins} دقیقه پیش`
    if (hours < 24) return `${hours} ساعت پیش`
    return `${days} روز پیش`
  } catch {
    return '—'
  }
}

export function formatPersianDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch { return '—' }
}
