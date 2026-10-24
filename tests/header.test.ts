// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  openAuthDialog: vi.fn(),
  getSession: vi.fn(),
  logout: vi.fn(),
  snackbar: vi.fn(),
  navigate: vi.fn(),
  getRoute: vi.fn(() => 'home'),
}))

vi.mock('../src/auth/auth-dialog', () => ({
  openAuthDialog: mocks.openAuthDialog,
}))

vi.mock('../src/auth/app-session', () => ({
  APP_SESSION_CHANGE_EVENT: 'app-session-change',
  getActiveAppSession: mocks.getSession,
  logoutAppSession: mocks.logout,
}))

vi.mock('../src/components/api-feedback/api-feedback', () => ({
  showSnackbar: mocks.snackbar,
}))

vi.mock('../src/app/router', () => ({
  createAppUrl: (path: string) => path,
  getCurrentRoute: mocks.getRoute,
  navigate: mocks.navigate,
}))

describe('header', () => {
  beforeEach(() => {
    document.body.replaceChildren()
    document.body.className = ''
    mocks.getSession.mockReset().mockReturnValue(null)
    mocks.getRoute.mockReset().mockReturnValue('home')
    mocks.openAuthDialog.mockReset()
    mocks.logout.mockReset()
    mocks.snackbar.mockReset()
    mocks.navigate.mockReset()
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      display: 'block',
      visibility: 'visible',
    } as CSSStyleDeclaration)
  })

  it('renders guest navigation and opens both auth modes', async () => {
    const { createHeader } = await import('../src/components/header/header')
    const header = createHeader()
    document.body.append(header)

    header.querySelector<HTMLButtonElement>('.header__login')?.click()
    header.querySelector<HTMLButtonElement>('.header__signup')?.click()
    expect(mocks.openAuthDialog).toHaveBeenNthCalledWith(1, 'login')
    expect(mocks.openAuthDialog).toHaveBeenNthCalledWith(2, 'register')

    const library = Array.from(header.querySelectorAll('a')).find(
      (link) => link.textContent === 'Library',
    )
    library?.click()
    expect(mocks.navigate).toHaveBeenCalledWith('/library')
    expect(header.querySelector('[aria-current="page"]')?.textContent).toBe(
      'Home',
    )
  })

  it('renders authenticated profile details and avatar fallback', async () => {
    mocks.getSession.mockReturnValue({
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
      authenticatedAt: Date.now(),
      avatarUrl: 'https://example.com/missing.png',
    })
    const { createHeader } = await import('../src/components/header/header')
    const header = createHeader()
    document.body.append(header)

    expect(header.querySelector('.header__profile-name')?.textContent).toBe(
      'Ada Lovelace',
    )
    header
      .querySelector<HTMLImageElement>('.header__profile-avatar img')
      ?.dispatchEvent(new Event('error'))
    expect(header.querySelector('.header__profile-initials')?.textContent).toBe(
      'AL',
    )

    header.querySelector<HTMLButtonElement>('.header__logout')?.click()
    expect(mocks.logout).toHaveBeenCalledOnce()
    expect(mocks.snackbar).toHaveBeenCalledWith(
      'You have been logged out.',
      'success',
    )
  })

  it('reacts to session events including email-based fallback names', async () => {
    const { createHeader } = await import('../src/components/header/header')
    const header = createHeader()
    document.body.append(header)

    window.dispatchEvent(
      new CustomEvent('app-session-change', {
        detail: {
          displayName: ' ',
          email: 'royal@example.com',
          authenticatedAt: Date.now(),
        },
      }),
    )
    expect(header.querySelector('.header__profile-name')?.textContent).toBe(
      'royal',
    )
    expect(header.querySelector('.header__profile-initials')?.textContent).toBe(
      'R',
    )

    window.dispatchEvent(
      new CustomEvent('app-session-change', { detail: null }),
    )
    expect(header.querySelector<HTMLElement>('.header__profile')?.hidden).toBe(
      true,
    )
  })

  it('opens and closes the mobile menu through burger, Escape and resize', async () => {
    const { createHeader } = await import('../src/components/header/header')
    const header = createHeader()
    document.body.append(header)
    const burger = header.querySelector<HTMLButtonElement>('.header__burger')

    burger?.click()
    expect(header.classList.contains('header--menu-open')).toBe(true)
    expect(document.body.classList.contains('body--menu-open')).toBe(true)

    header.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    expect(header.classList.contains('header--menu-open')).toBe(false)

    burger?.click()
    vi.mocked(window.getComputedStyle).mockReturnValue({
      display: 'none',
      visibility: 'visible',
    } as CSSStyleDeclaration)
    window.dispatchEvent(new Event('resize'))
    expect(header.classList.contains('header--menu-open')).toBe(false)
  })
})
