// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  route: 'home' as 'home' | 'library' | 'not-found',
  syncAuth: vi.fn(),
  syncGame: vi.fn(),
}))

vi.mock('../src/components/header/header', () => ({
  createHeader: () => {
    const header = document.createElement('header')
    for (const route of ['home', 'library']) {
      const link = document.createElement('a')
      link.dataset.route = route
      header.append(link)
    }
    return header
  },
}))
vi.mock('../src/components/footer/footer', () => ({
  createFooter: () => document.createElement('footer'),
}))
vi.mock('../src/pages/home/home-page', () => ({
  createHomePage: () =>
    Object.assign(document.createElement('div'), { id: 'home' }),
}))
vi.mock('../src/pages/library/library-page', () => ({
  createLibraryPage: () =>
    Object.assign(document.createElement('div'), { id: 'library' }),
}))
vi.mock('../src/pages/not-found/not-found-page', () => ({
  createNotFoundPage: () =>
    Object.assign(document.createElement('div'), { id: 'not-found' }),
}))
vi.mock('../src/auth/auth-dialog', () => ({
  AUTH_DIALOG_CHANGE_EVENT: 'auth-dialog-change',
  AUTH_QUERY_PARAMETER: 'auth',
  syncAuthDialogWithUrl: mocks.syncAuth,
}))
vi.mock('../src/components/game-details-dialog/game-details-dialog', () => ({
  syncGameDetailsDialogWithUrl: mocks.syncGame,
}))
vi.mock('../src/app/router', () => ({
  ROUTE_CHANGE_EVENT: 'app-route-change',
  getCurrentRoute: () => mocks.route,
}))

describe('application shell', () => {
  beforeEach(() => {
    document.body.replaceChildren()
    window.history.replaceState({}, '', '/')
    mocks.route = 'home'
    mocks.syncAuth.mockReset()
    mocks.syncGame.mockReset()
  })

  it('renders the current route and updates active navigation', async () => {
    const { createApp } = await import('../src/app/index')
    const app = createApp()
    document.body.append(app)
    expect(app.querySelector('#home')).not.toBeNull()
    expect(
      app.querySelector('[data-route="home"]')?.getAttribute('aria-current'),
    ).toBe('page')

    mocks.route = 'library'
    window.dispatchEvent(new Event('app-route-change'))
    expect(app.querySelector('#library')).not.toBeNull()
    expect(
      app.querySelector('[data-route="library"]')?.getAttribute('aria-current'),
    ).toBe('page')

    mocks.route = 'not-found'
    window.dispatchEvent(new Event('app-route-change'))
    expect(app.querySelector('#not-found')).not.toBeNull()
  })

  it('synchronizes auth before restoring game details', async () => {
    window.history.replaceState({}, '', '/?auth=login&game=tiny-glade')
    const { createApp } = await import('../src/app/index')
    createApp()
    mocks.syncAuth.mockClear()
    mocks.syncGame.mockClear()
    window.dispatchEvent(new Event('auth-dialog-change'))

    expect(mocks.syncGame).toHaveBeenCalledTimes(
      mocks.syncAuth.mock.calls.length * 2,
    )
    expect(mocks.syncAuth).toHaveBeenCalled()
    expect(mocks.syncGame.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.syncAuth.mock.invocationCallOrder[0] ?? 0,
    )
  })

  it('does not rerender route content for dialog-only popstate changes', async () => {
    const { createApp } = await import('../src/app/index')
    const app = createApp()
    const firstPage = app.querySelector('main')?.firstElementChild
    window.history.replaceState({}, '', '/?game=tiny-glade')
    window.dispatchEvent(new PopStateEvent('popstate'))

    expect(app.querySelector('main')?.firstElementChild).toBe(firstPage)
    expect(mocks.syncAuth).toHaveBeenCalled()
    expect(mocks.syncGame).toHaveBeenCalled()
  })
})
