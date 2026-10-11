import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCategories } from '../src/api/categories'
import {
  createGameComment,
  getGameComments,
  toggleCommentLike,
} from '../src/api/comments'
import {
  getFeaturedGames,
  getGameDetails,
  getGames,
  toggleGameFavorite,
} from '../src/api/games'
import { getLeaderboard } from '../src/api/leaderboard'
import { apiPost, apiRequest } from '../src/api/client'

vi.mock('../src/api/client', () => ({
  apiRequest: vi.fn(),
  apiPost: vi.fn(),
}))

const requestMock = vi.mocked(apiRequest)
const postMock = vi.mocked(apiPost)

describe('API endpoints', (): void => {
  beforeEach((): void => {
    vi.clearAllMocks()
  })

  it('builds game collection endpoints', (): void => {
    const signal = new AbortController().signal

    getFeaturedGames(signal)
    getGames({ page: 2, limit: 9, category: 'Action', sort: 'rating' }, signal)

    expect(requestMock).toHaveBeenNthCalledWith(
      1,
      '/games?featured=true',
      signal,
    )
    expect(requestMock).toHaveBeenNthCalledWith(
      2,
      '/games?page=2&limit=9&category=Action&sort=rating',
      signal,
    )
  })

  it('encodes game details and optional user email', (): void => {
    getGameDetails('rock & roll')
    getGameDetails('rock & roll', undefined, 'player+one@example.com')

    expect(requestMock).toHaveBeenNthCalledWith(
      1,
      '/games/rock%20%26%20roll',
      undefined,
    )
    expect(requestMock).toHaveBeenNthCalledWith(
      2,
      '/games/rock%20%26%20roll?userEmail=player%2Bone%40example.com',
      undefined,
    )
  })

  it('posts favorite changes to the encoded game endpoint', (): void => {
    const signal = new AbortController().signal

    toggleGameFavorite('space game', 'player@example.com', signal)

    expect(postMock).toHaveBeenCalledWith(
      '/games/space%20game/favorite',
      { userEmail: 'player@example.com' },
      signal,
    )
  })

  it('builds comments requests with filters and identity', (): void => {
    const signal = new AbortController().signal

    getGameComments('space game', signal)
    getGameComments('space game', signal, 'player+one@example.com')

    expect(requestMock).toHaveBeenNthCalledWith(
      1,
      '/games/space%20game/comments?limit=3&sort=newest',
      signal,
    )
    expect(requestMock).toHaveBeenNthCalledWith(
      2,
      '/games/space%20game/comments?limit=3&sort=newest&userEmail=player%2Bone%40example.com',
      signal,
    )
  })

  it('posts new comments and comment likes', (): void => {
    const signal = new AbortController().signal
    const comment = {
      userEmail: 'player@example.com',
      userName: 'Player',
      text: 'Great game!',
    }

    createGameComment('space game', comment, signal)
    toggleCommentLike('comment/1', 'player@example.com', signal)

    expect(postMock).toHaveBeenNthCalledWith(
      1,
      '/games/space%20game/comments',
      comment,
      signal,
    )
    expect(postMock).toHaveBeenNthCalledWith(
      2,
      '/comments/comment%2F1/like',
      { userEmail: 'player@example.com' },
      signal,
    )
  })

  it('requests categories and leaderboard data', (): void => {
    getCategories()
    getLeaderboard()

    expect(requestMock).toHaveBeenNthCalledWith(1, '/categories', undefined)
    expect(requestMock).toHaveBeenNthCalledWith(2, '/leaderboard', undefined)
  })
})
