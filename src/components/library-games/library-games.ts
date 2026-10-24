import './library-games.scss'
import { openGameDetailsDialog } from '../game-details-dialog/game-details-dialog'
import type { ApiGame } from '../../api/types'
import { createAppUrl } from '../../app/router'

import favoriteHeartIcon from '../../assets/icons/favorite-heart.svg'
import ratingStarIcon from '../../assets/icons/rating-star.svg'

const createTextElement = (
  tag: 'span' | 'h2' | 'p',
  className: string,
  text: string,
): HTMLElement => {
  const element = document.createElement(tag)
  element.className = className
  element.textContent = text

  return element
}

const formatLikes = (likes: number): string => {
  if (likes < 1000) {
    return likes.toString()
  }

  const shortenedLikes = Math.floor(likes / 100) / 10

  return `${shortenedLikes}K`
}

const createPriceElement = (
  game: ApiGame,
  modifier: 'desktop' | 'mobile',
): HTMLElement => {
  const price = createTextElement(
    'span',
    `library-card__price library-card__price--${modifier}`,
    game.price,
  )

  if (game.price === 'Free') {
    price.classList.add('library-card__price--free')
  }

  return price
}

const createGameCard = (game: ApiGame): HTMLElement => {
  const card = document.createElement('article')
  card.className = 'library-card'
  card.dataset.gameSlug = game.slug

  const image = document.createElement('img')
  image.className = 'library-card__image'
  image.src = createAppUrl(game.cardImage)
  image.alt = game.name
  image.loading = 'lazy'

  const content = document.createElement('div')
  content.className = 'library-card__content'

  const header = document.createElement('div')
  header.className = 'library-card__header'

  const identity = document.createElement('div')
  identity.className = 'library-card__identity'

  const title = createTextElement('h2', 'library-card__title', game.name)

  const category = createTextElement(
    'span',
    'library-card__category',
    game.category,
  )

  const desktopPrice = createPriceElement(game, 'desktop')
  const mobilePrice = createPriceElement(game, 'mobile')

  const description = createTextElement(
    'p',
    'library-card__description',
    game.shortDescription,
  )

  const footer = document.createElement('div')
  footer.className = 'library-card__footer'

  const stats = document.createElement('div')
  stats.className = 'library-card__stats'

  const rating = document.createElement('span')
  rating.className = 'library-card__rating'
  rating.setAttribute('aria-label', `Rating: ${game.rating}`)

  const ratingIcon = document.createElement('img')
  ratingIcon.className = 'library-card__stat-icon'
  ratingIcon.src = ratingStarIcon
  ratingIcon.alt = ''
  ratingIcon.setAttribute('aria-hidden', 'true')

  const likes = document.createElement('span')
  likes.className = 'library-card__likes'
  likes.setAttribute('aria-label', `${formatLikes(game.likesCount)} likes`)

  const likesIcon = document.createElement('img')
  likesIcon.className = 'library-card__stat-icon'
  likesIcon.src = favoriteHeartIcon
  likesIcon.alt = ''
  likesIcon.setAttribute('aria-hidden', 'true')

  const detailsButton = document.createElement('button')
  detailsButton.className = 'library-card__details'
  detailsButton.type = 'button'
  detailsButton.textContent = 'Details'
  detailsButton.setAttribute('aria-label', `View details for ${game.name}`)
  detailsButton.addEventListener('click', () => {
    openGameDetailsDialog(game.slug)
  })

  identity.append(title, category)
  header.append(identity, desktopPrice)

  rating.append(ratingIcon, game.rating.toString())
  likes.append(likesIcon, formatLikes(game.likesCount))

  stats.append(rating, likes, mobilePrice)
  footer.append(stats, detailsButton)

  content.append(header, description, footer)
  card.append(image, content)

  return card
}

const SKELETON_CARD_COUNT = 6

export const createLibraryGamesSkeleton = (): HTMLElement => {
  const grid = document.createElement('div')
  grid.className = 'library-games__grid'
  grid.setAttribute('aria-hidden', 'true')

  const cards = Array.from({ length: SKELETON_CARD_COUNT }, (): HTMLElement => {
    const card = document.createElement('article')
    card.className = 'library-card library-card--skeleton'

    return card
  })

  grid.append(...cards)

  return grid
}

export const createLibraryGames = (games: ApiGame[]): HTMLElement => {
  const section = document.createElement('section')
  section.className = 'library-games'
  section.setAttribute('aria-label', 'Available games')

  if (games.length === 0) {
    const emptyState = document.createElement('div')
    emptyState.className = 'library-games__empty'
    emptyState.setAttribute('role', 'status')

    const title = createTextElement(
      'h2',
      'library-games__empty-title',
      'Data Not Found',
    )

    const message = createTextElement(
      'p',
      'library-games__empty-message',
      'No games were found for the selected options.',
    )

    emptyState.append(title, message)
    section.append(emptyState)

    return section
  }

  const grid = document.createElement('div')
  grid.className = 'library-games__grid'

  const cards = games.map((game) => createGameCard(game))

  grid.append(...cards)
  section.append(grid)

  return section
}
