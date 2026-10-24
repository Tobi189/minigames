// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { game, secondGame } from './fixtures'

const mocks = vi.hoisted(() => ({
  openGameDetailsDialog: vi.fn(),
}))

vi.mock('../src/components/game-details-dialog/game-details-dialog', () => ({
  openGameDetailsDialog: mocks.openGameDetailsDialog,
}))

describe('library components', () => {
  beforeEach(() => {
    document.body.replaceChildren()
    mocks.openGameDetailsDialog.mockReset()
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
      }),
    })
  })

  it('renders filters and reports category and sort changes', async () => {
    const { createLibraryFilters } =
      await import('../src/components/library-filters/library-filters')
    const categoryChange = vi.fn()
    const sortChange = vi.fn()
    const filters = createLibraryFilters({
      categories: [
        { slug: 'all', label: 'All', isDefault: true },
        { slug: 'puzzle', label: 'Puzzle', isDefault: false },
      ],
      state: { category: 'all', sort: 'rating-desc', page: 1 },
      onCategoryChange: categoryChange,
      onSortChange: sortChange,
    })

    filters
      .querySelector<HTMLButtonElement>('[data-category="puzzle"]')
      ?.click()
    const select = filters.querySelector<HTMLSelectElement>('select')
    if (!select) throw new Error('Missing sort select')
    select.value = 'name-asc'
    select.dispatchEvent(new Event('change'))

    expect(categoryChange).toHaveBeenCalledWith('puzzle')
    expect(sortChange).toHaveBeenCalledWith('name-asc')
    expect(filters.querySelector('[aria-pressed="true"]')?.textContent).toBe(
      'All',
    )
  })

  it('renders game cards, formatted values and details actions', async () => {
    const { createLibraryGames, createLibraryGamesSkeleton } =
      await import('../src/components/library-games/library-games')
    const games = createLibraryGames([game, secondGame])

    expect(games.querySelectorAll('.library-card')).toHaveLength(2)
    expect(games.textContent).toContain('1.2K')
    expect(games.querySelector('.library-card__price--free')).not.toBeNull()
    games.querySelector<HTMLButtonElement>('button')?.click()
    expect(mocks.openGameDetailsDialog).toHaveBeenCalledWith(game.slug)
    expect(
      createLibraryGamesSkeleton().querySelectorAll('.library-card'),
    ).toHaveLength(6)
  })

  it('renders the required empty games state', async () => {
    const { createLibraryGames } =
      await import('../src/components/library-games/library-games')
    const empty = createLibraryGames([])
    expect(empty.textContent).toContain('Data Not Found')
    expect(empty.getAttribute('aria-label')).toBe('Available games')
  })

  it('clamps pagination and emits valid page changes', async () => {
    const { createLibraryPagination } =
      await import('../src/components/library-pagination/library-pagination')
    const onPageChange = vi.fn()
    const pagination = createLibraryPagination({
      currentPage: 999,
      totalPages: 5,
      onPageChange,
    })

    expect(pagination.querySelector('[aria-current="page"]')?.textContent).toBe(
      '5',
    )
    expect(
      pagination.querySelector<HTMLButtonElement>('[aria-label="Next page"]')
        ?.disabled,
    ).toBe(true)
    pagination
      .querySelector<HTMLButtonElement>('[aria-label="Previous page"]')
      ?.click()
    pagination
      .querySelector<HTMLButtonElement>('[aria-label="Page 2"]')
      ?.click()
    expect(onPageChange).toHaveBeenNthCalledWith(1, 4)
    expect(onPageChange).toHaveBeenNthCalledWith(2, 2)
  })

  it('normalizes pagination with no pages to page one', async () => {
    const { createLibraryPagination } =
      await import('../src/components/library-pagination/library-pagination')
    const pagination = createLibraryPagination({
      currentPage: -1,
      totalPages: 0,
      onPageChange: vi.fn(),
    })
    expect(
      pagination.querySelectorAll('.library-pagination__page'),
    ).toHaveLength(1)
    expect(pagination.querySelector('[aria-current="page"]')?.textContent).toBe(
      '1',
    )
  })
})
