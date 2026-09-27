import './game-details-dialog.scss'

import favoriteHeartIcon from '../../assets/icons/favorite-heart.svg'
import ratingStarIcon from '../../assets/icons/rating-star.svg'
import { tukoniComments, tukoniGameDetails } from '../../data/game-details'

import type { GameComment } from '../../types/game-details'

const DIALOG_ANIMATION_DURATION = 200
const TEXTAREA_MAX_HEIGHT = 88

const formatCompactNumber = (value: number): string => {
  if (value < 1000) return value.toString()

  const compactValue = Math.floor(value / 100) / 10
  return `${compactValue}K`
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

const createComment = (comment: GameComment): HTMLElement => {
  const item = document.createElement('div')
  item.className = 'game-details__comment'

  const header = document.createElement('div')
  header.className = 'game-details__comment-header'

  const avatar = createTextElement(
    'span',
    'game-details__comment-avatar',
    comment.authorName.charAt(0),
  )
  avatar.setAttribute('aria-hidden', 'true')

  const author = createTextElement(
    'span',
    'game-details__comment-author',
    comment.authorName,
  )

  const time = document.createElement('time')
  time.className = 'game-details__comment-time'
  time.textContent = comment.timeAgo

  const text = createTextElement(
    'p',
    'game-details__comment-text',
    comment.text,
  )

  const likeButton = document.createElement('button')
  likeButton.type = 'button'
  likeButton.className = 'game-details__comment-like'

  let isLiked = comment.isLiked
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

const createGameDetailsDialog = (): HTMLElement => {
  const overlay = document.createElement('div')
  overlay.className = 'game-details-overlay'

  const dialog = document.createElement('div')
  dialog.className = 'game-details'
  dialog.setAttribute('role', 'dialog')
  dialog.setAttribute('aria-modal', 'true')
  dialog.setAttribute('aria-labelledby', 'game-details-title')
  dialog.setAttribute('aria-describedby', 'game-details-description')

  const hero = document.createElement('div')
  hero.className = 'game-details__hero'

  const heroImage = document.createElement('img')
  heroImage.className = 'game-details__hero-image'
  heroImage.src = tukoniGameDetails.heroImage
  heroImage.alt = `${tukoniGameDetails.name} artwork`

  const closeButton = document.createElement('button')
  closeButton.type = 'button'
  closeButton.className = 'game-details__close'
  closeButton.setAttribute('aria-label', 'Close game details')
  closeButton.textContent = '×'

  hero.append(heroImage, closeButton)

  const body = document.createElement('div')
  body.className = 'game-details__body'

  const heading = document.createElement('div')
  heading.className = 'game-details__heading'

  const title = createTextElement(
    'h2',
    'game-details__title',
    tukoniGameDetails.name,
  )
  title.id = 'game-details-title'

  const metrics = document.createElement('div')
  metrics.className = 'game-details__metrics'
  metrics.append(
    createMetric(
      ratingStarIcon,
      tukoniGameDetails.rating.toString(),
      `Rating: ${tukoniGameDetails.rating}`,
    ),
    createMetric(
      favoriteHeartIcon,
      formatCompactNumber(tukoniGameDetails.likesCount),
      `${formatCompactNumber(tukoniGameDetails.likesCount)} likes`,
    ),
  )

  heading.append(title, metrics)

  const description = createTextElement(
    'p',
    'game-details__description',
    tukoniGameDetails.description,
  )
  description.id = 'game-details-description'

  const specs = document.createElement('dl')
  specs.className = 'game-details__specs'

  const specItems = [
    ['Genre', tukoniGameDetails.specs.genre],
    ['Players', tukoniGameDetails.specs.players],
    ['Duration', tukoniGameDetails.specs.duration],
    ['Price', tukoniGameDetails.specs.price],
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

  let isFavorite = false

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

  const medals = ['🥇', '🥈', '🥉']

  tukoniGameDetails.records.forEach((record) => {
    const item = document.createElement('li')
    item.className = 'game-details__record'

    const player = createTextElement(
      'span',
      'game-details__record-player',
      `${medals[record.position - 1]} ${record.playerName}`,
    )
    const score = createTextElement(
      'span',
      'game-details__record-score',
      `${record.score.toLocaleString('en-US')} pts`,
    )
    const time = document.createElement('time')
    time.className = 'game-details__record-time'
    time.textContent = record.timeAgo

    item.append(player, score, time)
    recordsList.append(item)
  })

  records.append(recordsTitle, recordsList)

  const comments = document.createElement('section')
  comments.className = 'game-details__section'
  comments.setAttribute('aria-labelledby', 'comments-title')

  const commentsTitle = createTextElement(
    'h3',
    'game-details__section-title',
    `Comments (${tukoniComments.length})`,
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
  commentsList.append(
    ...tukoniComments.map((comment) => createComment({ ...comment })),
  )

  comments.append(commentsTitle, commentForm, commentsList)
  body.append(heading, description, specs, actions, records, comments)
  dialog.append(hero, body)
  overlay.append(dialog)

  return overlay
}

export const openGameDetailsDialog = (): void => {
  if (document.querySelector('.game-details-overlay')) return

  const previouslyFocused =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null

  const previousBodyOverflow = document.body.style.overflow
  const overlay = createGameDetailsDialog()
  const dialog = overlay.querySelector<HTMLElement>('.game-details')
  const closeButton = overlay.querySelector<HTMLButtonElement>(
    '.game-details__close',
  )

  if (!dialog || !closeButton) return

  let isClosing = false

  const finishClosing = (): void => {
    document.removeEventListener('keydown', handleKeydown)
    overlay.remove()
    document.body.style.overflow = previousBodyOverflow

    if (previouslyFocused?.isConnected) {
      previouslyFocused.focus()
    }
  }

  const closeDialog = (): void => {
    if (isClosing) return

    isClosing = true
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

  closeButton.addEventListener('click', closeDialog)
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeDialog()
  })
  document.addEventListener('keydown', handleKeydown)

  document.body.append(overlay)
  document.body.style.overflow = 'hidden'

  window.requestAnimationFrame(() => {
    overlay.classList.add('game-details-overlay--visible')
    closeButton.focus()
  })
}
