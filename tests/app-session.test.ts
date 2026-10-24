// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  showSnackbar: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('firebase/auth', () => ({
  signOut: mocks.signOut,
}))

vi.mock('../src/config/firebase', () => ({
  firebaseAuth: { name: 'test-auth' },
}))

vi.mock('../src/components/api-feedback/api-feedback', () => ({
  showSnackbar: mocks.showSnackbar,
}))

const loadSessionModule = async () => import('../src/auth/app-session')

describe('app session', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-12T12:00:00.000Z'))
    localStorage.clear()
    mocks.showSnackbar.mockReset()
    mocks.signOut.mockReset().mockResolvedValue(undefined)
  })

  it('creates, stores and returns an isolated session copy', async () => {
    const sessionModule = await loadSessionModule()
    const changeListener = vi.fn()
    window.addEventListener(
      sessionModule.APP_SESSION_CHANGE_EVENT,
      changeListener,
    )

    const createdSession = sessionModule.startAppSession({
      displayName: 'Ada Lovelace',
      email: '  ada@example.com  ',
      avatarUrl: '  https://example.com/ada.png  ',
    })

    expect(createdSession).toEqual({
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
      authenticatedAt: Date.now(),
      avatarUrl: 'https://example.com/ada.png',
    })
    expect(
      JSON.parse(
        localStorage.getItem(sessionModule.APP_SESSION_STORAGE_KEY) ?? '',
      ),
    ).toEqual(createdSession)
    expect(changeListener).toHaveBeenCalledOnce()

    createdSession.displayName = 'Changed outside the store'
    expect(sessionModule.getActiveAppSession()?.displayName).toBe(
      'Ada Lovelace',
    )
  })

  it('omits an empty optional avatar and rejects an invalid profile', async () => {
    const sessionModule = await loadSessionModule()

    const session = sessionModule.startAppSession({
      displayName: 'Grace Hopper',
      email: 'grace@example.com',
      avatarUrl: '   ',
    })

    expect(session).not.toHaveProperty('avatarUrl')
    expect(() =>
      sessionModule.startAppSession({
        displayName: 'Invalid User',
        email: '   ',
      }),
    ).toThrow('Cannot create an app session from an invalid profile.')
  })

  it('restores a valid unexpired session from storage', async () => {
    const authenticatedAt = Date.now() - 60_000
    localStorage.setItem(
      'minigames:tobi189:app-session',
      JSON.stringify({
        displayName: 'Stored User',
        email: 'stored@example.com',
        authenticatedAt,
      }),
    )

    const sessionModule = await loadSessionModule()
    sessionModule.initializeAppSession()

    expect(sessionModule.getActiveAppSession()).toEqual({
      displayName: 'Stored User',
      email: 'stored@example.com',
      authenticatedAt,
    })
    expect(mocks.signOut).not.toHaveBeenCalled()
  })

  it.each([
    ['broken JSON', '{broken-json'],
    [
      'unexpected properties',
      JSON.stringify({
        displayName: 'Stored User',
        email: 'stored@example.com',
        authenticatedAt: Date.now() - 10_000,
        token: 'must-not-be-stored',
      }),
    ],
    [
      'a future authentication time',
      JSON.stringify({
        displayName: 'Stored User',
        email: 'stored@example.com',
        authenticatedAt: Date.now() + 10_000,
      }),
    ],
  ])('clears %s instead of restoring it', async (_label, storedValue) => {
    localStorage.setItem('minigames:tobi189:app-session', storedValue)
    const sessionModule = await loadSessionModule()

    sessionModule.initializeAppSession()
    await vi.waitFor(() => expect(mocks.signOut).toHaveBeenCalledOnce())

    expect(sessionModule.getActiveAppSession()).toBeNull()
    expect(
      localStorage.getItem(sessionModule.APP_SESSION_STORAGE_KEY),
    ).toBeNull()
  })

  it('expires a restored session at its fixed five-minute deadline', async () => {
    const authenticatedAt = Date.now() - 299_000
    localStorage.setItem(
      'minigames:tobi189:app-session',
      JSON.stringify({
        displayName: 'Expiring User',
        email: 'expiring@example.com',
        authenticatedAt,
      }),
    )

    const sessionModule = await loadSessionModule()
    sessionModule.initializeAppSession()
    expect(sessionModule.getActiveAppSession()).not.toBeNull()

    await vi.advanceTimersByTimeAsync(1_000)

    expect(sessionModule.getActiveAppSession()).toBeNull()
    expect(
      localStorage.getItem(sessionModule.APP_SESSION_STORAGE_KEY),
    ).toBeNull()
    expect(mocks.showSnackbar).toHaveBeenCalledWith(
      'Your session has expired. Please log in again.',
      'error',
    )
    expect(mocks.signOut).toHaveBeenCalledOnce()
  })

  it('logs out, clears storage and signs out from Firebase', async () => {
    const sessionModule = await loadSessionModule()
    const changeListener = vi.fn()
    window.addEventListener(
      sessionModule.APP_SESSION_CHANGE_EVENT,
      changeListener,
    )
    sessionModule.startAppSession({
      displayName: 'Logout User',
      email: 'logout@example.com',
    })
    changeListener.mockClear()

    sessionModule.logoutAppSession()
    await vi.waitFor(() => expect(mocks.signOut).toHaveBeenCalledOnce())

    expect(sessionModule.getActiveAppSession()).toBeNull()
    expect(
      localStorage.getItem(sessionModule.APP_SESSION_STORAGE_KEY),
    ).toBeNull()
    expect(changeListener).toHaveBeenCalledOnce()
  })

  it('keeps local logout complete when Firebase sign-out fails', async () => {
    mocks.signOut.mockRejectedValueOnce(new Error('Firebase unavailable'))
    const sessionModule = await loadSessionModule()
    sessionModule.startAppSession({
      displayName: 'Offline User',
      email: 'offline@example.com',
    })

    sessionModule.logoutAppSession()
    await vi.waitFor(() =>
      expect(mocks.showSnackbar).toHaveBeenCalledWith(
        'The local session ended, but Firebase sign-out failed.',
        'error',
      ),
    )

    expect(sessionModule.getActiveAppSession()).toBeNull()
  })
})
