import { signOut } from 'firebase/auth'

import { showSnackbar } from '../components/api-feedback/api-feedback'
import { firebaseAuth } from '../config/firebase'

export const APP_SESSION_STORAGE_KEY = 'minigames:tobi189:app-session'
export const APP_SESSION_DURATION_MS = 5 * 60 * 1000
export const APP_SESSION_CHANGE_EVENT = 'app-session-change'

export interface AppSession {
  displayName: string
  email: string
  authenticatedAt: number
  avatarUrl?: string
}

export interface AppSessionProfile {
  displayName: string
  email: string
  avatarUrl?: string
}

interface StoredSessionResult {
  session: AppSession | null
  isInvalid: boolean
}

let activeSession: AppSession | null = null
let expirationTimer: number | null = null
let isInitialized = false

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isValidSession = (value: unknown, now: number): value is AppSession => {
  if (!isRecord(value)) return false

  const allowedKeys = new Set([
    'displayName',
    'email',
    'authenticatedAt',
    'avatarUrl',
  ])

  if (Object.keys(value).some((key) => !allowedKeys.has(key))) return false

  if (typeof value.displayName !== 'string') return false
  if (typeof value.email !== 'string' || value.email.trim() === '') return false
  if (
    typeof value.authenticatedAt !== 'number' ||
    !Number.isFinite(value.authenticatedAt) ||
    value.authenticatedAt <= 0 ||
    value.authenticatedAt > now
  ) {
    return false
  }

  return (
    value.avatarUrl === undefined ||
    (typeof value.avatarUrl === 'string' && value.avatarUrl.trim() !== '')
  )
}

const isExpired = (session: AppSession, now = Date.now()): boolean =>
  now - session.authenticatedAt >= APP_SESSION_DURATION_MS

const cloneSession = (session: AppSession): AppSession => ({ ...session })

const readStoredSession = (): StoredSessionResult => {
  const storedValue = localStorage.getItem(APP_SESSION_STORAGE_KEY)

  if (storedValue === null) {
    return { session: null, isInvalid: false }
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue)

    if (!isValidSession(parsedValue, Date.now())) {
      return { session: null, isInvalid: true }
    }

    return { session: parsedValue, isInvalid: false }
  } catch {
    return { session: null, isInvalid: true }
  }
}

const dispatchSessionChange = (): void => {
  window.dispatchEvent(
    new CustomEvent<AppSession | null>(APP_SESSION_CHANGE_EVENT, {
      detail: activeSession === null ? null : cloneSession(activeSession),
    }),
  )
}

const clearExpirationTimer = (): void => {
  if (expirationTimer === null) return

  window.clearTimeout(expirationTimer)
  expirationTimer = null
}

const signOutFirebase = async (): Promise<void> => {
  try {
    await signOut(firebaseAuth)
  } catch {
    showSnackbar(
      'The local session ended, but Firebase sign-out failed.',
      'error',
    )
  }
}

const transitionToGuest = (reason: 'expired' | 'invalid' | 'logout'): void => {
  const hadSession =
    activeSession !== null ||
    localStorage.getItem(APP_SESSION_STORAGE_KEY) !== null

  clearExpirationTimer()
  activeSession = null
  localStorage.removeItem(APP_SESSION_STORAGE_KEY)

  if (hadSession) {
    dispatchSessionChange()
  }

  if (reason === 'expired' && hadSession) {
    showSnackbar('Your session has expired. Please log in again.', 'error')
  }

  if (hadSession || reason === 'invalid') {
    void signOutFirebase()
  }
}

const scheduleExpiration = (session: AppSession): void => {
  clearExpirationTimer()

  const remainingTime = Math.max(
    0,
    APP_SESSION_DURATION_MS - (Date.now() - session.authenticatedAt),
  )

  expirationTimer = window.setTimeout(() => {
    transitionToGuest('expired')
  }, remainingTime)
}

export const initializeAppSession = (): void => {
  if (isInitialized) return

  isInitialized = true
  const storedSession = readStoredSession()

  if (storedSession.isInvalid) {
    transitionToGuest('invalid')
  } else if (
    storedSession.session !== null &&
    isExpired(storedSession.session)
  ) {
    activeSession = storedSession.session
    transitionToGuest('expired')
  } else if (storedSession.session !== null) {
    activeSession = storedSession.session
    scheduleExpiration(storedSession.session)
  }

  window.addEventListener('focus', () => {
    getActiveAppSession()
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      getActiveAppSession()
    }
  })
}

export const startAppSession = (profile: AppSessionProfile): AppSession => {
  const session: AppSession = {
    displayName: profile.displayName,
    email: profile.email.trim(),
    authenticatedAt: Date.now(),
  }

  const avatarUrl = profile.avatarUrl?.trim()

  if (avatarUrl) {
    session.avatarUrl = avatarUrl
  }

  if (!isValidSession(session, session.authenticatedAt)) {
    throw new Error('Cannot create an app session from an invalid profile.')
  }

  activeSession = session
  localStorage.setItem(APP_SESSION_STORAGE_KEY, JSON.stringify(session))
  scheduleExpiration(session)
  dispatchSessionChange()

  return cloneSession(session)
}

export const getActiveAppSession = (): AppSession | null => {
  if (activeSession === null) return null

  if (isExpired(activeSession)) {
    transitionToGuest('expired')
    return null
  }

  return cloneSession(activeSession)
}

export const logoutAppSession = (): void => {
  transitionToGuest('logout')
}
