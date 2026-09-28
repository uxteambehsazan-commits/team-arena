/**
 * Single authoritative source for GitHub/deployment configuration.
 * UI components must import from here — never hard-code URLs directly.
 *
 * To reconfigure (new repo, branch, owner):
 *   1. Update the constants below.
 *   2. All Admin UI cards update automatically.
 */

export const GH_OWNER  = 'uxteambehsazan-commits'
export const GH_REPO   = 'team-arena'
export const GH_BRANCH = 'main'

export const GITHUB_CONFIG = {
  owner:  GH_OWNER,
  repo:   GH_REPO,
  branch: GH_BRANCH,

  get repositoryUrl()  { return `https://github.com/${GH_OWNER}/${GH_REPO}` },
  get repositoryName() { return `${GH_OWNER}/${GH_REPO}` },
  get pagesUrl()       { return `https://${GH_OWNER}.github.io/${GH_REPO}/` },
  get releasesUrl()    { return `${this.repositoryUrl}/releases` },
  get actionsUrl()     { return `${this.repositoryUrl}/actions` },
  get apiBase()        { return `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}` },
}

/**
 * Token is stored in sessionStorage only (cleared when browser tab closes).
 * It is never written to localStorage, URLs, logs, or analytics.
 * Without a backend secret manager this is the most secure frontend option.
 * NOTE: For production security, move token management to a server-side proxy.
 */
const TOKEN_KEY = 'bm_admin_gh_token_session'

export function getStoredToken(): string | null {
  try { return sessionStorage.getItem(TOKEN_KEY) } catch { return null }
}

export function saveToken(token: string): void {
  try { sessionStorage.setItem(TOKEN_KEY, token) } catch { /* noop */ }
}

export function clearToken(): void {
  try { sessionStorage.removeItem(TOKEN_KEY) } catch { /* noop */ }
}

export function isTokenConfigured(): boolean {
  const t = getStoredToken()
  return !!t && t.length > 10
}

export function maskedToken(): string {
  const t = getStoredToken()
  if (!t) return '—'
  const prefix = t.slice(0, 4)
  return `${prefix}_${'•'.repeat(24)}`
}
