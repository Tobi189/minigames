import './game-details-dialog.scss'

import { getGameComments } from '../../api/comments'
import { getGameDetails } from '../../api/games'
import type {
  ApiComment,
  ApiCommentsResponse,
  ApiGameDetails,
  ApiGameRecord,
} from '../../api/types'
import { createAppUrl } from '../../app/router'
import favoriteHeartIcon from '../../assets/icons/favorite-heart.svg'
import ratingStarIcon from '../../assets/icons/rating-star.svg'
import {
  createApiEmptyState,
  createApiErrorBanner,
  createApiSkeleton,
  showSnackbar,
} from '../api-feedback/api-feedback'

const DIALOG_ANIMATION_DURATION = 200
const TEXTAREA_MAX_HEIGHT = 88
const GAME_QUERY_PARAMETER = 'game'
const DIALOG_HISTORY_STATE = 'gameDialog'

interface ActiveGameDialog {
  gameSlug: string
  close: (updateUrl: boolean) => void
  destroy: () => void
}

let activeGameDialog: ActiveGameDialog | null = null

const getHistoryState = (): Record<string, unknown> => {
  const currentState: unknown = window.history.state

  if (typeof currentState === 'object' && currentState !== null) {
    return { ...currentState }
  }

  return {}
}

const addGameToUrl = (gameSlug: string): void => {
  const url = new URL(window.location.href)

  if (url.searchParams.get(GAME_QUERY_PARAMETER) === gameSlug) return

  url.searchParams.set(GAME_QUERY_PARAMETER, gameSlug)

  window.history.pushState(
    {
      ...getHistoryState(),
      [DIALOG_HISTORY_STATE]: true,
    },
    '',
    url,
  )
}

const removeGameFromUrl = (): void => {
  const url = new URL(window.location.href)
  const state = getHistoryState()

  url.searchParams.delete(GAME_QUERY_PARAMETER)
  delete state[DIALOG_HISTORY_STATE]
  window.history.replaceState(state, '', url)
}

const formatCompactNumber = (value: number): string => {
  if (value < 1000) return value.toString()

  const compactValue = Math.floor(value / 100) / 10
  return `${compactValue}K`
}

const formatRelativeDate = (dateValue: string): string => {
  const timestamp = Date.parse(dateValue)

  if (Number.isNaN(timestamp)) return ''

  const elapsedMilliseconds = Math.max(0, Date.now() - timestamp)
  const elapsedMinutes = Math.floor(elapsedMilliseconds / 60_000)

  if (elapsedMinutes < 1) return 'Just now'
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} minute${elapsedMinutes === 1 ? '' : 's'} ago`
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60)

  if (elapsedHours < 24) {
    return `${elapsedHours} hour${elapsedHours === 1 ? '' : 's'} ago`
  }

  const elapsedDays = Math.floor(elapsedHours / 24)

  if (elapsedDays < 7) {
    return `${elapsedDays} day${elapsedDays === 1 ? '' : 's'} ago`
  }

  const elapsedWeeks = Math.floor(elapsedDays / 7)
  return `${elapsedWeeks} week${elapsedWeeks === 1 ? '' : 's'} ago`
}

const createTextElement = (
  tag: 'span' | 'p' | 'h2' | 'h3' | 'dt' | 'dd',
  className: string,
  text: string,
): HTMLElement => {
  const element = document.createElement(tag)
  element.className = className
  element.textContent = text

  return element
}

const createMetric = (
  iconSource: string,
  value: string,
  label: string,
): HTMLElement => {
  const metric = document.createElement('span')
  metric.className = 'game-details__metric'
  metric.setAttribute('aria-label', label)

  const icon = document.createElement('img')
  icon.className = 'game-details__metric-icon'
  icon.src = iconSource
  icon.alt = ''
  icon.setAttribute('aria-hidden', 'true')

  metric.append(icon, value)

  return metric
}

const createComment = (comment: ApiComment): HTMLElement => {
  const item = document.createElement('div')
  item.className = 'game-details__comment'

  const header = document.createElement('div')
  header.className = 'game-details__comment-header'

  const avatar = createTextElement(
    'span',
    'game-details__comment-avatar',
    comment.authorName.charAt(0).toUpperCase(),
  )
  avatar.setAttribute('aria-hidden', 'true')

  const author = createTextElement(
    'span',
    'game-details__comment-author',
    comment.authorName,
  )

  const time = document.createElement('time')
  time.className = 'game-details__comment-time'
  time.dateTime = comment.createdAt
  time.textContent = formatRelativeDate(comment.createdAt)

  const text = createTextElement(
    'p',
    'game-details__comment-text',
    comment.text,
  )

  const likeButton = document.createElement('button')
  likeButton.type = 'button'
  likeButton.className = 'game-details__comment-like'

  let isLiked = comment.isLikedByCurrentUser
  let likesCount = comment.likesCount

  const updateLikeButton = (): void => {
    likeButton.classList.toggle('game-details__comment-like--active', isLiked)
    likeButton.setAttribute('aria-pressed', String(isLiked))
    likeButton.setAttribute(
      'aria-label',
      `${isLiked ? 'Unlike' : 'Like'} comment by ${comment.authorName}`,
    )
    likeButton.textContent = `${isLiked ? '♥' : '♡'} ${likesCount}`
  }

  likeButton.addEventListener('click', () => {
    isLiked = !isLiked
    likesCount += isLiked ? 1 : -1
    updateLikeButton()
  })

  updateLikeButton()
  header.append(avatar, author, time)
  item.append(header, text, likeButton)

  return item
}

const createRecord = (record: ApiGameRecord): HTMLElement => {
  const medals = ['🥇', '🥈', '🥉']
  const item = document.createElement('li')
  item.className = 'game-details__record'

  const player = createTextElement(
    'span',
    'game-details__record-player',
    `${medals[record.position - 1] ?? `#${record.position}`} ${record.playerName}`,
  )
  const score = createTextElement(
    'span',
    'game-details__record-score',
    `${record.score.toLocaleString('en-US')} pts`,
  )
  const time = document.createElement('time')
  time.className = 'game-details__record-time'
  time.dateTime = record.achievedAt
  time.textContent = formatRelativeDate(record.achievedAt)

  item.append(player, score, time)
  return item
}

const createCloseButton = (): HTMLButtonElement => {
  const closeButton = document.createElement('button')
  closeButton.type = 'button'
  closeButton.className = 'game-details__close'
  closeButton.setAttribute('aria-label', 'Close game details')
  closeButton.textContent = '×'

  return closeButton
}

const renderLoadingState = (
  dialog: HTMLElement,
  closeButton: HTMLButtonElement,
): void => {
  dialog.removeAttribute('aria-labelledby')
  dialog.removeAttribute('aria-describedby')
  dialog.setAttribute('aria-label', 'Loading game details')

  const hero = createApiSkeleton(
    'game-details__hero game-details__hero--loading',
    'Loading game artwork',
  )
  hero.append(closeButton)

  const body = document.createElement('div')
  body.className = 'game-details__body'
  body.append(
    createApiSkeleton(
      'game-details__content-skeleton',
      'Loading game information',
    ),
  )

  dialog.replaceChildren(hero, body)
}

const renderErrorState = (
  dialog: HTMLElement,
  closeButton: HTMLButtonElement,
  onRetry: () => void,
): void => {
  dialog.setAttribute('aria-label', 'Unable to load game details')

  const hero = document.createElement('div')
  hero.className = 'game-details__hero game-details__hero--error'
  hero.append(closeButton)

  const body = document.createElement('div')
  body.className = 'game-details__body'
  body.append(
    createApiErrorBanner('Unable to load the selected game.', onRetry),
  )

  dialog.replaceChildren(hero, body)
}

const renderGameDetails = (
  dialog: HTMLElement,
  closeButton: HTMLButtonElement,
  game: ApiGameDetails,
  commentsResponse: ApiCommentsResponse,
): void => {
  dialog.removeAttribute('aria-label')
  dialog.setAttribute('aria-labelledby', 'game-details-title')
  dialog.setAttribute('aria-describedby', 'game-details-description')

  const hero = document.createElement('div')
  hero.className = 'game-details__hero'

  const heroImage = document.createElement('img')
  heroImage.className = 'game-details__hero-image'
  heroImage.src = createAppUrl(game.heroImage)
  heroImage.alt = `${game.name} artwork`

  hero.append(heroImage, closeButton)

  const body = document.createElement('div')
  body.className = 'game-details__body'

  const heading = document.createElement('div')
  heading.className = 'game-details__heading'

  const title = createTextElement('h2', 'game-details__title', game.name)
  title.id = 'game-details-title'

  const metrics = document.createElement('div')
  metrics.className = 'game-details__metrics'
  metrics.append(
    createMetric(
      ratingStarIcon,
      game.rating.toString(),
      `Rating: ${game.rating}`,
    ),
    createMetric(
      favoriteHeartIcon,
      formatCompactNumber(game.likesCount),
      `${formatCompactNumber(game.likesCount)} likes`,
    ),
  )

  heading.append(title, metrics)

  const description = createTextElement(
    'p',
    'game-details__description',
    game.fullDescription,
  )
  description.id = 'game-details-description'

  const specs = document.createElement('dl')
  specs.className = 'game-details__specs'

  const specItems = [
    ['Genre', game.specs.genre],
    ['Players', game.specs.players],
    ['Duration', game.specs.duration],
    ['Price', game.specs.price],
  ]

  specItems.forEach(([label, value]) => {
    const item = document.createElement('div')
    item.className = 'game-details__spec'
    item.append(
      createTextElement('dt', 'game-details__spec-label', label),
      createTextElement('dd', 'game-details__spec-value', value),
    )
    specs.append(item)
  })

  const actions = document.createElement('div')
  actions.className = 'game-details__actions'

  const playButton = document.createElement('button')
  playButton.type = 'button'
  playButton.className = 'game-details__play'
  playButton.textContent = 'Play Now'

  const favoriteButton = document.createElement('button')
  favoriteButton.type = 'button'
  favoriteButton.className = 'game-details__favorite'

  const favoriteIcon = createTextElement(
    'span',
    'game-details__favorite-icon',
    '♡',
  )
  favoriteIcon.setAttribute('aria-hidden', 'true')

  const favoriteText = createTextElement(
    'span',
    'game-details__favorite-text',
    'Add to Favorites',
  )

  let isFavorite = game.isLikedByCurrentUser

  const updateFavoriteButton = (): void => {
    favoriteButton.classList.toggle(
      'game-details__favorite--active',
      isFavorite,
    )
    favoriteButton.setAttribute('aria-pressed', String(isFavorite))
    favoriteButton.setAttribute(
      'aria-label',
      isFavorite ? 'Remove from favorites' : 'Add to favorites',
    )
    favoriteIcon.textContent = isFavorite ? '♥' : '♡'
    favoriteText.textContent = isFavorite
      ? 'Added to Favorites'
      : 'Add to Favorites'
  }

  favoriteButton.addEventListener('click', () => {
    isFavorite = !isFavorite
    updateFavoriteButton()
  })

  updateFavoriteButton()
  favoriteButton.append(favoriteIcon, favoriteText)
  actions.append(playButton, favoriteButton)

  const records = document.createElement('section')
  records.className = 'game-details__section'
  records.setAttribute('aria-labelledby', 'top-records-title')

  const recordsTitle = createTextElement(
    'h3',
    'game-details__section-title',
    '🏆 Top Records',
  )
  recordsTitle.id = 'top-records-title'

  const recordsList = document.createElement('ol')
  recordsList.className = 'game-details__records'
  recordsList.append(...game.topRecords.map(createRecord))
  records.append(recordsTitle, recordsList)

  const comments = document.createElement('section')
  comments.className = 'game-details__section'
  comments.setAttribute('aria-labelledby', 'comments-title')

  const commentsTitle = createTextElement(
    'h3',
    'game-details__section-title',
    `Comments (${commentsResponse.meta.totalComments})`,
  )
  commentsTitle.id = 'comments-title'

  const commentForm = document.createElement('form')
  commentForm.className = 'game-details__comment-form'

  const currentUser = createTextElement(
    'span',
    'game-details__current-user',
    'U',
  )
  currentUser.setAttribute('aria-hidden', 'true')

  const textarea = document.createElement('textarea')
  textarea.className = 'game-details__comment-input'
  textarea.name = 'comment'
  textarea.rows = 1
  textarea.placeholder = 'Write a comment...'
  textarea.setAttribute('aria-label', 'Write a comment')

  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      TEXTAREA_MAX_HEIGHT,
    )}px`
    textarea.style.overflowY =
      textarea.scrollHeight > TEXTAREA_MAX_HEIGHT ? 'auto' : 'hidden'
  })

  const submitButton = document.createElement('button')
  submitButton.type = 'submit'
  submitButton.className = 'game-details__comment-submit'
  submitButton.setAttribute('aria-label', 'Submit comment')
  submitButton.textContent = '➤'

  commentForm.addEventListener('submit', (event) => {
    event.preventDefault()
  })

  commentForm.append(currentUser, textarea, submitButton)

  const commentsList = document.createElement('div')
  commentsList.className = 'game-details__comments'

  if (commentsResponse.data.length === 0) {
    commentsList.append(
      createApiEmptyState(
        'No comments yet',
        'Be the first to share your thoughts.',
      ),
    )
  } else {
    commentsList.append(...commentsResponse.data.map(createComment))
  }

  comments.append(commentsTitle, commentForm, commentsList)
  body.append(heading, description, specs, actions, records, comments)
  dialog.replaceChildren(hero, body)
}

export const openGameDetailsDialog = (
  gameSlug: string,
  updateUrl = true,
): void => {
  if (activeGameDialog?.gameSlug === gameSlug) return

  activeGameDialog?.destroy()

  if (updateUrl) {
    addGameToUrl(gameSlug)
  }

  const previouslyFocused =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null

  const previousBodyOverflow = document.body.style.overflow
  const overlay = document.createElement('div')
  overlay.className = 'game-details-overlay'

  const dialog = document.createElement('div')
  dialog.className = 'game-details'
  dialog.setAttribute('role', 'dialog')
  dialog.setAttribute('aria-modal', 'true')

  const closeButton = createCloseButton()
  let requestController: AbortController | null = null
  let isClosing = false

  const finishClosing = (): void => {
    requestController?.abort()
    document.removeEventListener('keydown', handleKeydown)
    overlay.remove()
    document.body.style.overflow = previousBodyOverflow

    if (activeGameDialog?.gameSlug === gameSlug) {
      activeGameDialog = null
    }

    if (previouslyFocused?.isConnected) {
      previouslyFocused.focus()
    }
  }

  const destroyDialog = (): void => {
    if (isClosing) return

    isClosing = true
    requestController?.abort()
    finishClosing()
  }

  const closeDialog = (shouldUpdateUrl = true): void => {
    if (isClosing) return

    if (shouldUpdateUrl) {
      const isDialogHistoryEntry =
        window.history.state?.[DIALOG_HISTORY_STATE] === true

      if (isDialogHistoryEntry) {
        window.history.back()
        return
      }

      removeGameFromUrl()
    }

    isClosing = true
    requestController?.abort()
    overlay.classList.remove('game-details-overlay--visible')
    window.setTimeout(finishClosing, DIALOG_ANIMATION_DURATION)
  }

  const handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeDialog()
      return
    }

    if (event.key !== 'Tab') return

    const focusableElements = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), textarea, [href], [tabindex]:not([tabindex="-1"])',
      ),
    )

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (!firstElement || !lastElement) return

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  const loadGame = async (isRetry = false): Promise<void> => {
    requestController?.abort()
    const controller = new AbortController()
    requestController = controller
    renderLoadingState(dialog, closeButton)

    try {
      const [detailsResponse, commentsResponse] = await Promise.all([
        getGameDetails(gameSlug, controller.signal),
        getGameComments(gameSlug, controller.signal),
      ])

      if (controller.signal.aborted || !overlay.isConnected) return

      renderGameDetails(
        dialog,
        closeButton,
        detailsResponse.data,
        commentsResponse,
      )

      if (isRetry) {
        showSnackbar('Game details loaded successfully.', 'success')
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      if (!overlay.isConnected) return

      showSnackbar('Unable to load game details.', 'error')
      renderErrorState(dialog, closeButton, () => {
        void loadGame(true)
      })
    }
  }

  closeButton.addEventListener('click', () => {
    closeDialog()
  })
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeDialog()
  })
  document.addEventListener('keydown', handleKeydown)

  overlay.append(dialog)
  document.body.append(overlay)
  document.body.style.overflow = 'hidden'
  activeGameDialog = {
    gameSlug,
    close: closeDialog,
    destroy: destroyDialog,
  }
  void loadGame()

  window.requestAnimationFrame(() => {
    overlay.classList.add('game-details-overlay--visible')
    closeButton.focus()
  })
}

export const syncGameDetailsDialogWithUrl = (): void => {
  const gameSlug = new URL(window.location.href).searchParams.get(
    GAME_QUERY_PARAMETER,
  )

  if (gameSlug) {
    openGameDetailsDialog(gameSlug, false)
    return
  }

  activeGameDialog?.close(false)
}
