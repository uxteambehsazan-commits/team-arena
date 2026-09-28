const SESSION_KEY = 'mission256_admin_session'

// Credentials stored as separate parts — never exposed in UI or error messages
const _u = 'manoosi'
const _p = 'Manoos!13650515'

export function adminLogin(username: string, password: string): boolean {
  if (username === _u && password === _p) {
    sessionStorage.setItem(SESSION_KEY, '1')
    return true
  }
  return false
}

export function adminLogout() {
  sessionStorage.removeItem(SESSION_KEY)
}

export function isAdminLoggedIn(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1'
}
