import './new-games.scss'

import islandersImage from '../../assets/games/islanders-new-shores-card.jpg'
import tailsideImage from '../../assets/games/tailside-cozy-cafe-sim-card.jpg'
import tinyGladeImage from '../../assets/games/tiny-glade-card.jpg'
import { libraryGames } from '../../data/library-games'
import { openGameDetailsDialog } from '../game-details-dialog/game-details-dialog'

import type { LibraryGame } from '../../types/library-game'

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

const additionalFeaturedGames: LibraryGame[] = [
  {
    slug: 'tiny-glade',
    name: 'Tiny Glade',
    category: 'arcade',
    price: '$3.99',
    shortDescription:
      'A small diorama builder where you doodle whimsical castles, cozy cottages and romantic ruins.',
    rating: 4.9,
    likesCount: 67300,
    cardImage: tinyGladeImage,
  },
  {
    slug: 'tailside-cozy-cafe-sim',
    name: 'Tailside: Cozy Cafe Sim',
    category: 'strategy',
    price: 'Free',
    shortDescription:
      'Run your own cozy café, brew coffee, decorate and meet charming villagers.',
    rating: 4.8,
    likesCount: 35600,
    cardImage: tailsideImage,
  },
  {
    slug: 'islanders-new-shores',
    name: 'ISLANDERS: New Shores',
    category: 'strategy',
    price: '$3.99',
    shortDescription:
      'Build peaceful island settlements in this relaxing minimalist strategy game.',
    rating: 4.9,
    likesCount: 54200,
    cardImage: islandersImage,
  },
]

const featuredGames = [...libraryGames, ...additionalFeaturedGames]

const formatLikes = (likes: number): string => {
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

const createGameCard = (game: LibraryGame): HTMLButtonElement => {
  const card = document.createElement('button')
  card.type = 'button'
  card.className = 'game-card'
  card.setAttribute('aria-label', `View details for ${game.name}`)

  const image = document.createElement('img')
  image.className = 'game-card__image'
  image.src = game.cardImage
  image.alt = ''
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

const getCircularOffset = (cardIndex: number, activeIndex: number): number => {
  let offset = cardIndex - activeIndex
  const halfLength = Math.floor(featuredGames.length / 2)

  if (offset > halfLength) offset -= featuredGames.length
  if (offset < -halfLength) offset += featuredGames.length

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

  const controls = document.createElement('div')
  controls.className = 'new-games__controls'
  controls.append(previousButton, nextButton)

  const track = document.createElement('div')
  track.className = 'new-games__track'
  track.setAttribute('aria-label', 'Featured games carousel')

  const cards = featuredGames.map((game) => createGameCard(game))

  let activeIndex = 0
  let autoplayTimer: number | undefined
  let timerStartedAt = 0
  let remainingTime = AUTOPLAY_INTERVAL
  let pointerStartX = 0
  let isPointerActive = false
  let suppressClick = false

  const updateCards = (): void => {
    cards.forEach((card, index) => {
      const offset = getCircularOffset(index, activeIndex)
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
    activeIndex = (activeIndex + 1) % featuredGames.length
    updateCards()
  }

  const showPrevious = (): void => {
    activeIndex =
      (activeIndex - 1 + featuredGames.length) % featuredGames.length
    updateCards()
  }

  const startTimer = (duration = AUTOPLAY_INTERVAL): void => {
    stopTimer()
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

  const resetTimer = (): void => {
    startTimer(AUTOPLAY_INTERVAL)
  }

  previousButton.addEventListener('click', () => {
    showPrevious()
    resetTimer()
  })

  nextButton.addEventListener('click', () => {
    showNext()
    resetTimer()
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

      if (distance < 0) {
        showNext()
      } else {
        showPrevious()
      }

      resetTimer()
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
  header.append(title, controls)
  section.append(header, track)

  updateCards()
  startTimer()

  return section
}
