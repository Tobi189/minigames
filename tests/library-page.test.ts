// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { gamesResponse } from './fixtures'

const mocks = vi.hoisted(() => ({
  categories: vi.fn(),
  games: vi.fn(),
  snackbar: vi.fn(),
}))

vi.mock('../src/api/categories', () => ({ getCategories: mocks.categories }))
vi.mock('../src/api/games', () => ({ getGames: mocks.games }))
vi.mock(
  '../src/components/api-feedback/api-feedback',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('../src/components/api-feedback/api-feedback')
      >()
    return { ...actual, showSnackbar: mocks.snackbar }
  },
)
vi.mock('../src/components/game-details-dialog/game-details-dialog', () => ({
  openGameDetailsDialog: vi.fn(),
}))

const categoriesResponse = {
  data: [
    { slug: 'all', label: 'All', isDefault: true },
    { slug: 'puzzle', label: 'Puzzle', isDefault: false },
  ],
  meta: { totalItems: 2, description: 'Categories' },
}

describe('library page', () => {
  beforeEach(() => {
    document.body.replaceChildren()
    window.history.replaceState({}, '', '/library')
    mocks.categories.mockReset()
    mocks.games.mockReset()
    mocks.snackbar.mockReset()
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
      }),
    })
  })

  it('loads filters, games and pagination using URL state', async () => {
    window.history.replaceState(
      {},
      '',
      '/library?category=puzzle&sort=name-asc&page=2',
    )
    mocks.categories.mockResolvedValue(categoriesResponse)
    mocks.games.mockResolvedValue({
      ...gamesResponse,
      meta: { ...gamesResponse.meta, page: 2, totalPages: 3 },
    })
    const { createLibraryPage } =
      await import('../src/pages/library/library-page')
    const page = createLibraryPage()
    document.body.append(page)

    await vi.waitFor(() =>
      expect(page.querySelectorAll('.library-card')).toHaveLength(2),
    )
    expect(mocks.games).toHaveBeenCalledWith({
      page: 2,
      limit: 6,
      category: 'puzzle',
      sort: 'name-asc',
    })
    expect(page.querySelector('[aria-current="page"]')?.textContent).toBe('2')

    page.querySelector<HTMLButtonElement>('[data-category="all"]')?.click()
    expect(window.location.search).toContain('category=all')
  })

  it('uses page one pagination for an empty result', async () => {
    mocks.categories.mockResolvedValue(categoriesResponse)
    mocks.games.mockResolvedValue({
      ...gamesResponse,
      data: [],
      meta: { ...gamesResponse.meta, page: 999, totalPages: 999 },
    })
    const { createLibraryPage } =
      await import('../src/pages/library/library-page')
    const page = createLibraryPage()
    document.body.append(page)
    await vi.waitFor(() => expect(page.textContent).toContain('Data Not Found'))
    expect(page.querySelectorAll('.library-pagination__page')).toHaveLength(1)
    expect(page.querySelector('[aria-current="page"]')?.textContent).toBe('1')
  })

  it('retries category and game request failures', async () => {
    mocks.categories
      .mockRejectedValueOnce(new Error('categories offline'))
      .mockResolvedValueOnce(categoriesResponse)
    mocks.games
      .mockRejectedValueOnce(new Error('games offline'))
      .mockResolvedValueOnce(gamesResponse)
    const { createLibraryPage } =
      await import('../src/pages/library/library-page')
    const page = createLibraryPage()
    document.body.append(page)

    await vi.waitFor(() => expect(page.textContent).toContain('Retry'))
    page.querySelector<HTMLButtonElement>('.api-feedback__retry')?.click()
    await vi.waitFor(() =>
      expect(page.querySelector('.library-filters')).not.toBeNull(),
    )
    await vi.waitFor(() =>
      expect(page.querySelector('.library-games__grid')).toBeNull(),
    )
    const gameRetry = page.querySelector<HTMLButtonElement>(
      '.library-page__games-slot .api-feedback__retry',
    )
    gameRetry?.click()
    await vi.waitFor(() =>
      expect(page.querySelectorAll('.library-card')).toHaveLength(2),
    )
    expect(mocks.snackbar).toHaveBeenCalledWith(
      'Games loaded successfully.',
      'success',
    )
  })
})
