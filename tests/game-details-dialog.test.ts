// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { comment, commentsResponse, gameDetails } from './fixtures'

const mocks = vi.hoisted(() => ({
  details: vi.fn(),
  comments: vi.fn(),
  favorite: vi.fn(),
  createComment: vi.fn(),
  like: vi.fn(),
  getSession: vi.fn(),
  openAuth: vi.fn(),
  snackbar: vi.fn(),
}))

vi.mock('../src/api/games', () => ({
  getGameDetails: mocks.details,
  toggleGameFavorite: mocks.favorite,
}))
vi.mock('../src/api/comments', () => ({
  getGameComments: mocks.comments,
  createGameComment: mocks.createComment,
  toggleCommentLike: mocks.like,
}))
vi.mock('../src/auth/app-session', () => ({
  getActiveAppSession: mocks.getSession,
}))
vi.mock('../src/auth/auth-dialog', () => ({
  AUTH_QUERY_PARAMETER: 'auth',
  openAuthDialog: mocks.openAuth,
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

const session = {
  displayName: 'Ada Lovelace',
  email: 'ada@example.com',
  authenticatedAt: Date.now(),
}

const loadDialog = async () =>
  import('../src/components/game-details-dialog/game-details-dialog')

describe('game details dialog', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2026-10-12T12:00:00.000Z'))
    document.body.replaceChildren()
    document.body.style.overflow = ''
    window.history.replaceState({}, '', '/library')
    mocks.details.mockReset().mockResolvedValue({ data: gameDetails })
    mocks.comments.mockReset().mockResolvedValue(commentsResponse)
    mocks.favorite.mockReset()
    mocks.createComment.mockReset()
    mocks.like.mockReset()
    mocks.getSession.mockReset().mockReturnValue(null)
    mocks.openAuth.mockReset()
    mocks.snackbar.mockReset()
    vi.spyOn(Math, 'random').mockReturnValue(0.2)
  })

  it('loads complete game details and guards guest interactions', async () => {
    const { openGameDetailsDialog } = await loadDialog()
    openGameDetailsDialog('tiny-glade')

    await vi.waitFor(() =>
      expect(document.querySelector('.game-details__title')?.textContent).toBe(
        'Tiny Glade',
      ),
    )
    expect(window.location.search).toBe('?game=tiny-glade')
    expect(document.body.textContent).toContain('1.2K')
    expect(document.body.textContent).toContain('12,345 pts')
    expect(
      document.querySelector('.game-details__comment-avatar')?.textContent,
    ).toBe('A')

    document
      .querySelector<HTMLButtonElement>('.game-details__favorite')
      ?.click()
    document
      .querySelector<HTMLButtonElement>('.game-details__comment-like')
      ?.click()
    expect(mocks.openAuth).toHaveBeenCalledTimes(2)
    expect(mocks.favorite).not.toHaveBeenCalled()
    expect(mocks.like).not.toHaveBeenCalled()
    expect(
      document.querySelector<HTMLTextAreaElement>(
        '.game-details__comment-input',
      )?.disabled,
    ).toBe(true)
  })

  it('updates favorites and comment likes for an authenticated user', async () => {
    mocks.getSession.mockReturnValue(session)
    mocks.favorite.mockResolvedValue({
      data: { isFavorited: true, likesCount: 1300 },
    })
    mocks.like.mockResolvedValue({
      data: { isLikedByCurrentUser: true, likesCount: 3 },
    })
    const { openGameDetailsDialog } = await loadDialog()
    openGameDetailsDialog('tiny-glade')
    await vi.waitFor(() =>
      expect(document.querySelector('.game-details__favorite')).not.toBeNull(),
    )

    const favoriteButton = document.querySelector<HTMLButtonElement>(
      '.game-details__favorite',
    )
    favoriteButton?.click()
    favoriteButton?.click()
    await vi.waitFor(() =>
      expect(favoriteButton?.getAttribute('aria-pressed')).toBe('true'),
    )
    expect(mocks.favorite).toHaveBeenCalledWith('tiny-glade', 'ada@example.com')
    expect(document.querySelector('[aria-label="1.3K likes"]')).not.toBeNull()

    const likeButton = document.querySelector<HTMLButtonElement>(
      '.game-details__comment-like',
    )
    likeButton?.click()
    likeButton?.click()
    await vi.waitFor(() =>
      expect(likeButton?.getAttribute('aria-pressed')).toBe('true'),
    )
    expect(mocks.like).toHaveBeenCalledWith('comment-1', 'ada@example.com')
    expect(likeButton?.textContent).toBe('♥ 3')
  })

  it('submits a comment and refreshes the list', async () => {
    mocks.getSession.mockReturnValue(session)
    mocks.createComment.mockResolvedValue({ data: comment })
    mocks.comments
      .mockResolvedValueOnce(commentsResponse)
      .mockResolvedValueOnce({
        data: [comment, { ...comment, commentId: 'comment-2', text: 'New!' }],
        meta: { ...commentsResponse.meta, totalComments: 2, returnedCount: 2 },
      })
    const { openGameDetailsDialog } = await loadDialog()
    openGameDetailsDialog('tiny-glade')
    await vi.waitFor(() =>
      expect(
        document.querySelector('.game-details__comment-form'),
      ).not.toBeNull(),
    )

    const textarea = document.querySelector<HTMLTextAreaElement>(
      '.game-details__comment-input',
    )
    if (!textarea) throw new Error('Missing textarea')
    textarea.value = ' A new comment '
    textarea.dispatchEvent(new Event('input'))
    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    )

    await vi.waitFor(() => expect(mocks.createComment).toHaveBeenCalledOnce())
    expect(mocks.createComment).toHaveBeenCalledWith('tiny-glade', {
      userEmail: 'ada@example.com',
      authorName: 'Ada Lovelace',
      text: 'A new comment',
    })
    await vi.waitFor(() =>
      expect(document.querySelector('#comments-title')?.textContent).toBe(
        'Comments (2)',
      ),
    )
    expect(textarea.value).toBe('')
    expect(mocks.snackbar).toHaveBeenCalledWith(
      'Comment posted successfully.',
      'success',
    )
  })

  it('validates comment author and body before calling the API', async () => {
    mocks.getSession.mockReturnValue({ ...session, displayName: 'A' })
    const { openGameDetailsDialog } = await loadDialog()
    openGameDetailsDialog('tiny-glade')
    await vi.waitFor(() =>
      expect(
        document.querySelector('.game-details__comment-form'),
      ).not.toBeNull(),
    )
    const form = document.querySelector<HTMLFormElement>(
      '.game-details__comment-form',
    )
    form?.requestSubmit()
    expect(mocks.snackbar).toHaveBeenCalledWith(
      'Your display name must be 2–30 characters.',
      'error',
    )

    mocks.getSession.mockReturnValue(session)
    form?.requestSubmit()
    expect(mocks.snackbar).toHaveBeenCalledWith(
      'Comment must be 1–500 characters.',
      'error',
    )
    expect(mocks.createComment).not.toHaveBeenCalled()
  })

  it('reports mutation failures and restores interactive controls', async () => {
    mocks.getSession.mockReturnValue(session)
    mocks.favorite.mockRejectedValue(new Error('favorite failed'))
    const { openGameDetailsDialog } = await loadDialog()
    const { ApiError } = await import('../src/api/client')
    mocks.like.mockRejectedValue(
      new ApiError('like failed', 500, 'Server error'),
    )
    mocks.createComment.mockRejectedValue(
      new ApiError('comment failed', 400, 'Bad comment'),
    )
    openGameDetailsDialog('tiny-glade')
    await vi.waitFor(() =>
      expect(document.querySelector('.game-details__favorite')).not.toBeNull(),
    )

    const favorite = document.querySelector<HTMLButtonElement>(
      '.game-details__favorite',
    )
    favorite?.click()
    await vi.waitFor(() => expect(favorite?.disabled).toBe(false))
    expect(mocks.snackbar).toHaveBeenCalledWith(
      'Unable to update favorites. Please try again.',
      'error',
    )

    const like = document.querySelector<HTMLButtonElement>(
      '.game-details__comment-like',
    )
    like?.click()
    await vi.waitFor(() => expect(like?.disabled).toBe(false))
    expect(mocks.snackbar).toHaveBeenCalledWith(
      'Unable to update comment like. Please try again.',
      'error',
    )

    const textarea = document.querySelector<HTMLTextAreaElement>(
      '.game-details__comment-input',
    )
    if (!textarea) throw new Error('Missing textarea')
    textarea.value = 'Valid comment'
    document.querySelector<HTMLFormElement>('form')?.requestSubmit()
    await vi.waitFor(() =>
      expect(mocks.snackbar).toHaveBeenCalledWith(
        'Unable to post comment. Please check it and try again.',
        'error',
      ),
    )
  })

  it('distinguishes an uncertain comment result from refresh failure', async () => {
    mocks.getSession.mockReturnValue(session)
    mocks.createComment.mockRejectedValueOnce(new Error('unknown'))
    const { openGameDetailsDialog } = await loadDialog()
    openGameDetailsDialog('tiny-glade')
    await vi.waitFor(() =>
      expect(
        document.querySelector('.game-details__comment-form'),
      ).not.toBeNull(),
    )
    const textarea = document.querySelector<HTMLTextAreaElement>(
      '.game-details__comment-input',
    )
    if (!textarea) throw new Error('Missing textarea')
    textarea.value = 'First try'
    document.querySelector<HTMLFormElement>('form')?.requestSubmit()
    await vi.waitFor(() =>
      expect(mocks.snackbar).toHaveBeenCalledWith(
        'Comment submission result is unknown. Refresh comments before trying again.',
        'error',
      ),
    )

    mocks.createComment.mockResolvedValueOnce({ data: comment })
    mocks.comments.mockRejectedValueOnce(new Error('refresh failed'))
    textarea.value = 'Second try'
    document.querySelector<HTMLFormElement>('form')?.requestSubmit()
    await vi.waitFor(() =>
      expect(mocks.snackbar).toHaveBeenCalledWith(
        'Comment was posted, but comments could not be refreshed.',
        'error',
      ),
    )
  })

  it('shows an error state, retries and supports URL synchronization', async () => {
    mocks.details
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ data: gameDetails })
    const dialog = await loadDialog()
    dialog.openGameDetailsDialog('tiny-glade')
    await vi.waitFor(() => expect(document.body.textContent).toContain('Retry'))
    document.querySelector<HTMLButtonElement>('.api-feedback__retry')?.click()
    await vi.waitFor(() =>
      expect(document.querySelector('.game-details__title')).not.toBeNull(),
    )
    expect(mocks.snackbar).toHaveBeenCalledWith(
      'Game details loaded successfully.',
      'success',
    )

    window.history.replaceState({}, '', '/library?auth=login&game=tiny-glade')
    dialog.syncGameDetailsDialogWithUrl()
    expect(document.querySelector('.game-details-overlay')).toBeNull()

    window.history.replaceState({}, '', '/library?game=tiny-glade')
    dialog.syncGameDetailsDialogWithUrl()
    await vi.waitFor(() =>
      expect(document.querySelector('.game-details-overlay')).not.toBeNull(),
    )
    window.history.replaceState({}, '', '/library')
    dialog.syncGameDetailsDialogWithUrl()
    await vi.advanceTimersByTimeAsync(200)
    expect(document.querySelector('.game-details-overlay')).toBeNull()
  })

  it('closes from the button, backdrop and Escape', async () => {
    const { openGameDetailsDialog } = await loadDialog()
    openGameDetailsDialog('tiny-glade', false)
    await vi.waitFor(() =>
      expect(document.querySelector('.game-details__close')).not.toBeNull(),
    )
    document.querySelector<HTMLButtonElement>('.game-details__close')?.click()
    await vi.advanceTimersByTimeAsync(200)
    expect(document.querySelector('.game-details-overlay')).toBeNull()

    openGameDetailsDialog('tiny-glade', false)
    await vi.waitFor(() =>
      expect(document.querySelector('.game-details-overlay')).not.toBeNull(),
    )
    document.querySelector<HTMLElement>('.game-details-overlay')?.click()
    await vi.advanceTimersByTimeAsync(200)

    openGameDetailsDialog('tiny-glade', false)
    await vi.waitFor(() =>
      expect(document.querySelector('.game-details-overlay')).not.toBeNull(),
    )
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await vi.advanceTimersByTimeAsync(200)
    expect(document.querySelector('.game-details-overlay')).toBeNull()
  })
})
