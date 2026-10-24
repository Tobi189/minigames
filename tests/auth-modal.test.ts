// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  startSession: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  google: vi.fn(),
  errorMessage: vi.fn(() => 'Friendly authentication error.'),
  snackbar: vi.fn(),
}))

vi.mock('../src/auth/app-session', () => ({
  startAppSession: mocks.startSession,
}))

vi.mock('../src/auth/firebase-auth', () => ({
  loginWithEmail: mocks.login,
  registerWithEmail: mocks.register,
  loginWithGoogle: mocks.google,
  getAuthenticationErrorMessage: mocks.errorMessage,
}))

vi.mock('../src/components/api-feedback/api-feedback', () => ({
  showSnackbar: mocks.snackbar,
}))

const profile = { displayName: 'Ada', email: 'ada@example.com' }

const setInput = (root: HTMLElement, name: string, value: string): void => {
  const input = root.querySelector<HTMLInputElement>(`[name="${name}"]`)
  if (!input) throw new Error(`Missing ${name} input`)
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('auth modal', () => {
  beforeEach(() => {
    document.body.replaceChildren()
    document.body.style.overflow = ''
    Object.values(mocks).forEach((mock) => mock.mockReset())
    mocks.errorMessage.mockReturnValue('Friendly authentication error.')
  })

  it('validates and completes email login while locking controls', async () => {
    let resolveLogin: (value: typeof profile) => void = () => undefined
    mocks.login.mockReturnValue(
      new Promise<typeof profile>((resolve) => {
        resolveLogin = resolve
      }),
    )
    const onClose = vi.fn()
    const { createAuthModal } =
      await import('../src/components/auth-modal/auth-modal')
    const instance = createAuthModal('login', { onClose })
    document.body.append(instance.element)

    const submit = instance.element.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    )
    expect(submit?.disabled).toBe(true)
    setInput(instance.element, 'email', 'ada@example.com')
    setInput(instance.element, 'password', 'secret1')
    expect(submit?.disabled).toBe(false)

    instance.element
      .querySelector<HTMLFormElement>('form')
      ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    expect(submit?.textContent).toBe('Logging in…')
    expect(
      instance.element.querySelector<HTMLInputElement>('[name="email"]')
        ?.disabled,
    ).toBe(true)

    resolveLogin(profile)
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledOnce())
    expect(mocks.login).toHaveBeenCalledWith('ada@example.com', 'secret1')
    expect(mocks.startSession).toHaveBeenCalledWith(profile)
    expect(mocks.snackbar).toHaveBeenCalledWith(
      'Authentication completed successfully.',
      'success',
    )
    expect(instance.element.isConnected).toBe(false)
  })

  it('switches to registration, validates confirmation and reports failure', async () => {
    mocks.register.mockRejectedValue(new Error('registration failed'))
    const onModeChange = vi.fn()
    const { createAuthModal } =
      await import('../src/components/auth-modal/auth-modal')
    const instance = createAuthModal('login', { onModeChange })
    document.body.append(instance.element)

    const tabs =
      instance.element.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    tabs[1]?.click()
    expect(onModeChange).toHaveBeenCalledWith('register')
    expect(instance.element.textContent).toContain('Create Account')

    setInput(instance.element, 'username', 'AdaLovelace')
    setInput(instance.element, 'email', 'ada@example.com')
    setInput(instance.element, 'password', 'Secret1!')
    setInput(instance.element, 'confirmPassword', 'different')
    expect(instance.element.textContent).toContain('Passwords do not match')
    setInput(instance.element, 'confirmPassword', 'Secret1!')

    instance.element.querySelector<HTMLFormElement>('form')?.requestSubmit()
    await vi.waitFor(() =>
      expect(mocks.snackbar).toHaveBeenCalledWith(
        'Friendly authentication error.',
        'error',
      ),
    )
    expect(mocks.register).toHaveBeenCalledWith(
      'AdaLovelace',
      'ada@example.com',
      'Secret1!',
    )
    expect(
      instance.element.querySelector<HTMLButtonElement>('button[type="submit"]')
        ?.disabled,
    ).toBe(false)
  })

  it('supports successful Google authentication', async () => {
    mocks.google.mockResolvedValue(profile)
    const onClose = vi.fn()
    const { createAuthModal } =
      await import('../src/components/auth-modal/auth-modal')
    const instance = createAuthModal('register', { onClose })
    document.body.append(instance.element)

    const googleButton = Array.from(
      instance.element.querySelectorAll<HTMLButtonElement>('button'),
    ).find((button) => button.textContent?.includes('Google'))
    googleButton?.click()

    await vi.waitFor(() => expect(onClose).toHaveBeenCalledOnce())
    expect(mocks.google).toHaveBeenCalledOnce()
    expect(mocks.startSession).toHaveBeenCalledWith(profile)
  })

  it('unlocks the modal after Google authentication fails', async () => {
    mocks.google.mockRejectedValue(new Error('popup closed'))
    const { createAuthModal } =
      await import('../src/components/auth-modal/auth-modal')
    const instance = createAuthModal()
    document.body.append(instance.element)
    const googleButton = Array.from(
      instance.element.querySelectorAll<HTMLButtonElement>('button'),
    ).find((button) => button.textContent?.includes('Google'))
    googleButton?.click()

    await vi.waitFor(() => expect(googleButton?.disabled).toBe(false))
    expect(mocks.snackbar).toHaveBeenCalledWith(
      'Friendly authentication error.',
      'error',
    )
  })

  it('closes by Escape, overlay click and explicit destroy', async () => {
    const onClose = vi.fn()
    const { createAuthModal } =
      await import('../src/components/auth-modal/auth-modal')
    const first = createAuthModal('login', { onClose })
    document.body.append(first.element)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(onClose).toHaveBeenCalledOnce()

    const second = createAuthModal('login', { onClose })
    document.body.append(second.element)
    second.element.click()
    expect(onClose).toHaveBeenCalledTimes(2)

    const third = createAuthModal()
    document.body.append(third.element)
    third.destroy()
    third.destroy()
    expect(third.element.isConnected).toBe(false)
  })
})
