import './new-games.scss'

import { getFeaturedGames } from '../../api/games'
import type { ApiGame } from '../../api/types'
import { createAppUrl } from '../../app/router'
import {
  createApiEmptyState,
  createApiErrorBanner,
  createApiSkeleton,
  showSnackbar,
} from '../api-feedback/api-feedback'
import { openGameDetailsDialog } from '../game-details-dialog/game-details-dialog'

const AUTOPLAY_INTERVAL = 4000
const SWIPE_THRESHOLD = 50

type CardPosition =
  | 'hidden-left'
  | 'peek-left'
  | 'side-left'
  | 'featured'
  | 'side-right'
  | 'peek-right'
  | 'hidden-right'

const formatLikes = (likes: number): string => {
  if (likes < 1000) return likes.toString()

  const compactLikes = Math.floor(likes / 100) / 10
  return `${compactLikes}K`
}

const createArrowButton = (
  direction: 'previous' | 'next',
): HTMLButtonElement => {
  const button = document.createElement('button')
  button.className = `carousel-button carousel-button--${direction}`
  button.type = 'button'
  button.setAttribute(
    'aria-label',
    direction === 'previous' ? 'Previous game' : 'Next game',
  )

  const arrow = document.createElement('span')
  arrow.className = 'carousel-button__icon'
  arrow.setAttribute('aria-hidden', 'true')
  arrow.textContent = direction === 'previous' ? '←' : '→'

  button.append(arrow)
  return button
}

const createGameCard = (game: ApiGame): HTMLButtonElement => {
  const card = document.createElement('button')
  card.type = 'button'
  card.className = 'game-card'
  card.setAttribute('aria-label', `View details for ${game.name}`)

  const image = document.createElement('img')
  image.className = 'game-card__image'
  image.src = createAppUrl(game.cardImage)
  image.alt = game.name
  image.draggable = false

  const content = document.createElement('span')
  content.className = 'game-card__content'

  const title = document.createElement('span')
  title.className = 'game-card__title'
  title.textContent = game.name

  const details = document.createElement('span')
  details.className = 'game-card__details'

  const rating = document.createElement('span')
  rating.className = 'game-card__rating'
  rating.innerHTML = `<span aria-hidden="true">★</span> ${game.rating}`

  const likes = document.createElement('span')
  likes.className = 'game-card__likes'
  likes.innerHTML = `<span aria-hidden="true">♥</span> ${formatLikes(
    game.likesCount,
  )}`

  details.append(rating, likes)
  content.append(title, details)
  card.append(image, content)

  return card
}

const getCircularOffset = (
  cardIndex: number,
  activeIndex: number,
  gamesCount: number,
): number => {
  let offset = cardIndex - activeIndex
  const halfLength = Math.floor(gamesCount / 2)

  if (offset > halfLength) offset -= gamesCount
  if (offset < -halfLength) offset += gamesCount

  return offset
}

const getCardPosition = (offset: number): CardPosition => {
  if (offset <= -3) return 'hidden-left'
  if (offset === -2) return 'peek-left'
  if (offset === -1) return 'side-left'
  if (offset === 0) return 'featured'
  if (offset === 1) return 'side-right'
  if (offset === 2) return 'peek-right'

  return 'hidden-right'
}

export const createNewGames = (): HTMLElement => {
  const section = document.createElement('section')
  section.className = 'new-games'
  section.setAttribute('aria-labelledby', 'new-games-title')

  const header = document.createElement('div')
  header.className = 'new-games__header'

  const title = document.createElement('h2')
  title.id = 'new-games-title'
  title.className = 'new-games__title'
  title.textContent = 'New Games'

  const previousButton = createArrowButton('previous')
  const nextButton = createArrowButton('next')
  previousButton.disabled = true
  nextButton.disabled = true

  const controls = document.createElement('div')
  controls.className = 'new-games__controls'
  controls.append(previousButton, nextButton)

  const content = document.createElement('div')
  content.className = 'new-games__content'

  header.append(title, controls)
  section.append(header, content)

  let stopCarousel: (() => void) | null = null

  const renderCarousel = (games: ApiGame[]): void => {
    const track = document.createElement('div')
    track.className = 'new-games__track'
    track.setAttribute('aria-label', 'Featured games carousel')

    const cards = games.map(createGameCard)
    let activeIndex = 0
    let autoplayTimer: number | undefined
    let timerStartedAt = 0
    let remainingTime = AUTOPLAY_INTERVAL
    let pointerStartX = 0
    let isPointerActive = false
    let suppressClick = false

    const updateCards = (): void => {
      cards.forEach((card, index) => {
        const offset = getCircularOffset(index, activeIndex, cards.length)
        const position = getCardPosition(offset)

        card.className = `game-card game-card--${position}`
        card.tabIndex = Math.abs(offset) <= 2 ? 0 : -1
        card.setAttribute('aria-hidden', String(Math.abs(offset) > 2))
      })
    }

    const stopTimer = (): void => {
      if (autoplayTimer !== undefined) {
        window.clearTimeout(autoplayTimer)
        autoplayTimer = undefined
      }
    }

    const showNext = (): void => {
      activeIndex = (activeIndex + 1) % cards.length
      updateCards()
    }

    const showPrevious = (): void => {
      activeIndex = (activeIndex - 1 + cards.length) % cards.length
      updateCards()
    }

    const startTimer = (duration = AUTOPLAY_INTERVAL): void => {
      stopTimer()

      if (cards.length < 2) return

      remainingTime = duration
      timerStartedAt = performance.now()

      autoplayTimer = window.setTimeout(() => {
        if (!section.isConnected) {
          stopTimer()
          return
        }

        showNext()
        startTimer()
      }, duration)
    }

    const pauseTimer = (): void => {
      if (autoplayTimer === undefined) return

      const elapsedTime = performance.now() - timerStartedAt
      remainingTime = Math.max(0, remainingTime - elapsedTime)
      stopTimer()
    }

    previousButton.addEventListener('click', () => {
      showPrevious()
      startTimer()
    })

    nextButton.addEventListener('click', () => {
      showNext()
      startTimer()
    })

    cards.forEach((card) => {
      card.addEventListener('click', () => {
        if (suppressClick) return
        openGameDetailsDialog()
      })
    })

    track.addEventListener('pointerdown', (event) => {
      isPointerActive = true
      pointerStartX = event.clientX
      suppressClick = false
      track.setPointerCapture(event.pointerId)
      pauseTimer()
    })

    track.addEventListener('pointerup', (event) => {
      if (!isPointerActive) return

      isPointerActive = false
      const distance = event.clientX - pointerStartX

      if (Math.abs(distance) >= SWIPE_THRESHOLD) {
        suppressClick = true

        if (distance < 0) showNext()
        else showPrevious()

        startTimer()
        window.setTimeout(() => {
          suppressClick = false
        })
      } else {
        startTimer(remainingTime)
      }
    })

    track.addEventListener('pointercancel', () => {
      isPointerActive = false
      startTimer(remainingTime)
    })

    track.append(...cards)
    content.replaceChildren(track)
    previousButton.disabled = cards.length < 2
    nextButton.disabled = cards.length < 2

    updateCards()
    startTimer()
    stopCarousel = stopTimer
  }

  const loadFeaturedGames = async (isRetry = false): Promise<void> => {
    stopCarousel?.()
    previousButton.disabled = true
    nextButton.disabled = true
    content.replaceChildren(
      createApiSkeleton('new-games__skeleton', 'Loading featured games'),
    )

    try {
      const response = await getFeaturedGames()

      if (!section.isConnected) return

      if (response.data.length === 0) {
        content.replaceChildren(
          createApiEmptyState(
            'No featured games yet',
            'Please check back again soon.',
          ),
        )
        return
      }

      renderCarousel(response.data)

      if (isRetry) {
        showSnackbar('Featured games loaded successfully.', 'success')
      }
    } catch {
      if (!section.isConnected) return

      showSnackbar('Unable to load featured games.', 'error')
      content.replaceChildren(
        createApiErrorBanner('Unable to load featured games.', () => {
          void loadFeaturedGames(true)
        }),
      )
    }
  }

  void loadFeaturedGames()
  return section
}
