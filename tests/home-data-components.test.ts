// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { game, leaderboardPlayers, secondGame } from './fixtures'

const mocks = vi.hoisted(() => ({
  featured: vi.fn(),
  leaderboard: vi.fn(),
  openGame: vi.fn(),
  snackbar: vi.fn(),
}))

vi.mock('../src/api/games', () => ({
  getFeaturedGames: mocks.featured,
}))
vi.mock('../src/api/leaderboard', () => ({
  getLeaderboard: mocks.leaderboard,
}))
vi.mock('../src/components/game-details-dialog/game-details-dialog', () => ({
  openGameDetailsDialog: mocks.openGame,
}))
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

const featuredResponse = {
  data: [game, secondGame],
  meta: {
    page: 1,
    limit: 6,
    totalItems: 2,
    totalPages: 1,
    appliedFilter: { featured: true },
  },
}

describe('home API-backed components', () => {
  beforeEach(() => {
    document.body.replaceChildren()
    mocks.featured.mockReset()
    mocks.leaderboard.mockReset()
    mocks.openGame.mockReset()
    mocks.snackbar.mockReset()
  })

  it('loads and operates the featured games carousel', async () => {
    mocks.featured.mockResolvedValue(featuredResponse)
    const { createNewGames } =
      await import('../src/components/new-games/new-games')
    const section = createNewGames()
    document.body.append(section)

    await vi.waitFor(() =>
      expect(section.querySelectorAll('.game-card')).toHaveLength(2),
    )
    expect(section.textContent).toContain('1.2K')
    const next = section.querySelector<HTMLButtonElement>(
      '[aria-label="Next game"]',
    )
    next?.click()
    expect(
      section
        .querySelectorAll('.game-card')[1]
        ?.classList.contains('game-card--featured'),
    ).toBe(true)

    section.querySelector<HTMLButtonElement>('.game-card--featured')?.click()
    expect(mocks.openGame).toHaveBeenCalledWith(secondGame.slug)
  })

  it('renders the featured-games empty state', async () => {
    mocks.featured.mockResolvedValue({ ...featuredResponse, data: [] })
    const { createNewGames } =
      await import('../src/components/new-games/new-games')
    const section = createNewGames()
    document.body.append(section)
    await vi.waitFor(() =>
      expect(section.textContent).toContain('No featured games yet'),
    )
  })

  it('retries featured games after a request failure', async () => {
    mocks.featured
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(featuredResponse)
    const { createNewGames } =
      await import('../src/components/new-games/new-games')
    const section = createNewGames()
    document.body.append(section)
    await vi.waitFor(() => expect(section.textContent).toContain('Retry'))
    section.querySelector<HTMLButtonElement>('.api-feedback__retry')?.click()
    await vi.waitFor(() =>
      expect(section.querySelectorAll('.game-card')).toHaveLength(2),
    )
    expect(mocks.snackbar).toHaveBeenCalledWith(
      'Featured games loaded successfully.',
      'success',
    )
  })

  it('loads leaderboard rows and formats player data', async () => {
    mocks.leaderboard.mockResolvedValue({
      data: leaderboardPlayers,
      meta: { totalItems: 2, description: 'Top players' },
    })
    const { createTopPlayers } =
      await import('../src/components/top-players/top-players')
    const section = createTopPlayers()
    document.body.append(section)
    await vi.waitFor(() =>
      expect(section.querySelectorAll('tbody tr')).toHaveLength(2),
    )
    expect(section.textContent).toContain('AL')
    expect(section.textContent).toContain('CM')
    expect(section.textContent).toContain('1 day')
  })

  it('renders empty leaderboard and retries an error', async () => {
    mocks.leaderboard.mockResolvedValueOnce({
      data: [],
      meta: { totalItems: 0, description: 'Top players' },
    })
    const { createTopPlayers } =
      await import('../src/components/top-players/top-players')
    const empty = createTopPlayers()
    document.body.append(empty)
    await vi.waitFor(() =>
      expect(empty.textContent).toContain('No leaderboard entries'),
    )

    mocks.leaderboard
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({
        data: leaderboardPlayers,
        meta: { totalItems: 2, description: 'Top players' },
      })
    const retrying = createTopPlayers()
    document.body.append(retrying)
    await vi.waitFor(() => expect(retrying.textContent).toContain('Retry'))
    retrying.querySelector<HTMLButtonElement>('.api-feedback__retry')?.click()
    await vi.waitFor(() =>
      expect(retrying.querySelectorAll('tbody tr')).toHaveLength(2),
    )
    expect(mocks.snackbar).toHaveBeenCalledWith(
      'Leaderboard loaded successfully.',
      'success',
    )
  })
})
