import { FirebaseError } from 'firebase/app'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createUser: vi.fn(),
  login: vi.fn(),
  popup: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
  setCustomParameters: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: mocks.createUser,
  signInWithEmailAndPassword: mocks.login,
  signInWithPopup: mocks.popup,
  signOut: mocks.signOut,
  updateProfile: mocks.updateProfile,
  GoogleAuthProvider: class {
    setCustomParameters = mocks.setCustomParameters
  },
}))

vi.mock('../src/config/firebase', () => ({
  firebaseAuth: { name: 'test-auth' },
}))

const user = {
  email: 'ada@example.com',
  displayName: ' Ada ',
  photoURL: ' https://example.com/avatar.png ',
}

describe('Firebase authentication adapter', () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset())
    mocks.signOut.mockResolvedValue(undefined)
    mocks.updateProfile.mockResolvedValue(undefined)
  })

  it('logs in with a trimmed email and maps the Firebase user', async () => {
    mocks.login.mockResolvedValue({ user })
    const { loginWithEmail } = await import('../src/auth/firebase-auth')

    await expect(
      loginWithEmail('  ada@example.com ', 'secret'),
    ).resolves.toEqual({
      displayName: 'Ada',
      email: 'ada@example.com',
      avatarUrl: 'https://example.com/avatar.png',
    })
    expect(mocks.login).toHaveBeenCalledWith(
      { name: 'test-auth' },
      'ada@example.com',
      'secret',
    )
  })

  it('registers, updates the profile and uses the requested username', async () => {
    mocks.createUser.mockResolvedValue({ user })
    const { registerWithEmail } = await import('../src/auth/firebase-auth')

    await expect(
      registerWithEmail('  Countess Ada ', ' ada@example.com ', 'secret'),
    ).resolves.toMatchObject({
      displayName: 'Countess Ada',
      email: 'ada@example.com',
    })
    expect(mocks.updateProfile).toHaveBeenCalledWith(user, {
      displayName: 'Countess Ada',
    })
  })

  it('signs out a partially created account when profile update fails', async () => {
    const failure = new Error('profile update failed')
    mocks.createUser.mockResolvedValue({ user })
    mocks.updateProfile.mockRejectedValue(failure)
    const { registerWithEmail } = await import('../src/auth/firebase-auth')

    await expect(
      registerWithEmail('Ada', 'ada@example.com', 'secret'),
    ).rejects.toBe(failure)
    expect(mocks.signOut).toHaveBeenCalledOnce()
  })

  it('maps Google sign-in and rejects users without email', async () => {
    const { loginWithGoogle } = await import('../src/auth/firebase-auth')
    mocks.popup.mockResolvedValueOnce({ user })
    await expect(loginWithGoogle()).resolves.toMatchObject({
      displayName: 'Ada',
      email: 'ada@example.com',
    })

    mocks.popup.mockResolvedValueOnce({ user: { ...user, email: null } })
    await expect(loginWithGoogle()).rejects.toThrow(
      'Firebase did not return an email address.',
    )
  })

  it.each([
    [
      'auth/email-already-in-use',
      'An account already uses this email address.',
    ],
    ['auth/invalid-credential', 'The email or password is incorrect.'],
    [
      'auth/network-request-failed',
      'A network error interrupted authentication. Please try again.',
    ],
    ['auth/popup-closed-by-user', 'Google sign-in was canceled.'],
    ['auth/unknown', 'Authentication failed. Please try again.'],
  ])('maps %s to friendly feedback', async (code, message) => {
    const { getAuthenticationErrorMessage } =
      await import('../src/auth/firebase-auth')
    expect(
      getAuthenticationErrorMessage(new FirebaseError(code, 'firebase')),
    ).toBe(message)
  })

  it('uses generic feedback for non-Firebase errors', async () => {
    const { getAuthenticationErrorMessage } =
      await import('../src/auth/firebase-auth')
    expect(getAuthenticationErrorMessage(new Error('unknown'))).toBe(
      'Authentication failed. Please try again.',
    )
  })
})
