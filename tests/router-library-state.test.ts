// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('router and library URL state', () => {
  beforeEach(() => {
    vi.resetModules()
    window.history.replaceState({}, '', '/')
  })

  it.each([
    ['/', 'home'],
    ['/home', 'home'],
    ['/library', 'library'],
    ['/unknown', 'not-found'],
  ] as const)('maps %s to %s', async (path, expectedRoute) => {
    window.history.replaceState({}, '', path)
    const { getCurrentRoute } = await import('../src/app/router')
    expect(getCurrentRoute()).toBe(expectedRoute)
  })

  it('creates normalized URLs and dispatches navigation changes', async () => {
    const { createAppUrl, navigate, ROUTE_CHANGE_EVENT } =
      await import('../src/app/router')
    const listener = vi.fn()
    window.addEventListener(ROUTE_CHANGE_EVENT, listener)

    expect(createAppUrl('library')).toMatch(/\/library$/)
    navigate('/library?category=puzzle')

    expect(window.location.pathname).toMatch(/\/library$/)
    expect(window.location.search).toBe('?category=puzzle')
    expect(listener).toHaveBeenCalledOnce()
  })

  it('reads valid library state and falls back for invalid parameters', async () => {
    const { getLibraryState } =
      await import('../src/pages/library/library-state')
    window.history.replaceState(
      {},
      '',
      '/library?category=puzzle&sort=name-desc&page=3',
    )
    expect(getLibraryState('all')).toEqual({
      category: 'puzzle',
      sort: 'name-desc',
      page: 3,
    })

    window.history.replaceState(
      {},
      '',
      '/library?category=wrong&sort=wrong&page=-2',
    )
    expect(getLibraryState('arcade')).toEqual({
      category: 'arcade',
      sort: 'rating-desc',
      page: 1,
    })
  })

  it('navigates with every library state parameter', async () => {
    const router = await import('../src/app/router')
    const navigateSpy = vi.spyOn(router, 'navigate')
    const { navigateToLibraryState } =
      await import('../src/pages/library/library-state')

    navigateToLibraryState({ category: 'card', sort: 'rating-asc', page: 2 })

    expect(navigateSpy).toHaveBeenCalledWith(
      '/library?category=card&sort=rating-asc&page=2',
    )
  })
})
