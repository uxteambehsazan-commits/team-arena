// Admin role-based access control — frontend session model
// NOTE: This is a frontend-only app. Server-side enforcement is not available.
// All role checks are enforced in UI; they do not substitute for server authorization.

export type AdminRole = 'SYSTEM_ADMIN' | 'CONTENT_ADMIN' | 'SUPPORT_ADMIN' | 'VIEWER'

export interface AdminPermissions {
  githubCredential: boolean
  revealCredential: boolean
  copyCredential: boolean
  rotateCredential: boolean
  revokeCredential: boolean
  userMessaging: boolean
  releaseManagement: boolean
  releaseNotes: boolean
  sendReleaseAnnouncements: boolean
  viewAuditLogs: boolean
  manageAdminPermissions: boolean
  manageGameContent: boolean
  viewUsers: boolean
  viewSessions: boolean
}

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  SYSTEM_ADMIN: {
    githubCredential: true,
    revealCredential: true,
    copyCredential: true,
    rotateCredential: true,
    revokeCredential: true,
    userMessaging: true,
    releaseManagement: true,
    releaseNotes: true,
    sendReleaseAnnouncements: true,
    viewAuditLogs: true,
    manageAdminPermissions: true,
    manageGameContent: true,
    viewUsers: true,
    viewSessions: true,
  },
  CONTENT_ADMIN: {
    githubCredential: false,
    revealCredential: false,
    copyCredential: false,
    rotateCredential: false,
    revokeCredential: false,
    userMessaging: true,
    releaseManagement: false,
    releaseNotes: true,
    sendReleaseAnnouncements: true,
    viewAuditLogs: false,
    manageAdminPermissions: false,
    manageGameContent: true,
    viewUsers: false,
    viewSessions: false,
  },
  SUPPORT_ADMIN: {
    githubCredential: false,
    revealCredential: false,
    copyCredential: false,
    rotateCredential: false,
    revokeCredential: false,
    userMessaging: true,
    releaseManagement: false,
    releaseNotes: false,
    sendReleaseAnnouncements: false,
    viewAuditLogs: false,
    manageAdminPermissions: false,
    manageGameContent: false,
    viewUsers: true,
    viewSessions: true,
  },
  VIEWER: {
    githubCredential: false,
    revealCredential: false,
    copyCredential: false,
    rotateCredential: false,
    revokeCredential: false,
    userMessaging: false,
    releaseManagement: false,
    releaseNotes: false,
    sendReleaseAnnouncements: false,
    viewAuditLogs: false,
    manageAdminPermissions: false,
    manageGameContent: false,
    viewUsers: false,
    viewSessions: false,
  },
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  SYSTEM_ADMIN: 'مدیر سیستم',
  CONTENT_ADMIN: 'مدیر محتوا',
  SUPPORT_ADMIN: 'مدیر پشتیبانی',
  VIEWER: 'بیننده',
}

const ROLE_KEY = 'ta_admin_role'

// Default role — in a real system this would come from server auth token
export function getAdminRole(): AdminRole {
  const stored = sessionStorage.getItem(ROLE_KEY) as AdminRole | null
  if (stored && ROLE_PERMISSIONS[stored]) return stored
  return 'SYSTEM_ADMIN' // default for authenticated admin in this single-user setup
}

export function setAdminRole(role: AdminRole): void {
  sessionStorage.setItem(ROLE_KEY, role)
}

export function can(permission: keyof AdminPermissions): boolean {
  const role = getAdminRole()
  return ROLE_PERMISSIONS[role][permission]
}

export function getPermissions(): AdminPermissions {
  return ROLE_PERMISSIONS[getAdminRole()]
}
