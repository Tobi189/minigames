import './new-games.scss'

import bubbleShooterImage from '../../assets/bubble-shooter.png'
import candyCrushImage from '../../assets/candy-crush.png'
import islandersImage from '../../assets/islanders.png'
import vacationCafeImage from '../../assets/vacation-cafe.png'
import winterBurrowImage from '../../assets/winter-burrow.png'

type Game = {
  title: string
  image: string
  rating: string
  likes: string
  cardType: 'peek' | 'side' | 'featured'
}

const games: Game[] = [
  {
    title: 'Candy Crush',
    image: candyCrushImage,
    rating: '4.7',
    likes: '31.2K',
    cardType: 'peek',
  },
  {
    title: 'ISLANDERS: New Shores',
    image: islandersImage,
    rating: '4.9',
    likes: '54.2K',
    cardType: 'side',
  },
  {
    title: 'Vacation Cafe Simulator',
    image: vacationCafeImage,
    rating: '4.8',
    likes: '28.7K',
    cardType: 'featured',
  },
  {
    title: 'Winter Burrow',
    image: winterBurrowImage,
    rating: '4.9',
    likes: '32.4K',
    cardType: 'side',
  },
  {
    title: 'Bubble Shooter',
    image: bubbleShooterImage,
    rating: '4.6',
    likes: '18.9K',
    cardType: 'peek',
  },
]

const createArrowButton = (
  direction: 'previous' | 'next',
): HTMLButtonElement => {
  const button = document.createElement('button')

  button.className = `carousel-button carousel-button--${direction}`
  button.type = 'button'
  button.ariaLabel = direction === 'previous' ? 'Previous games' : 'Next games'

  const arrow = document.createElement('span')
  arrow.className = 'carousel-button__icon'
  arrow.ariaHidden = 'true'
  arrow.textContent = direction === 'previous' ? '←' : '→'

  button.append(arrow)

  return button
}

const createGameCard = (game: Game): HTMLElement => {
  const card = document.createElement('article')
  card.className = `game-card game-card--${game.cardType}`

  const image = document.createElement('img')
  image.className = 'game-card__image'
  image.src = game.image
  image.alt = game.title

  const content = document.createElement('div')
  content.className = 'game-card__content'

  const title = document.createElement('h3')
  title.className = 'game-card__title'
  title.textContent = game.title

  const details = document.createElement('div')
  details.className = 'game-card__details'

  const rating = document.createElement('span')
  rating.className = 'game-card__rating'
  rating.innerHTML = `<span aria-hidden="true">★</span> ${game.rating}`

  const likes = document.createElement('span')
  likes.className = 'game-card__likes'
  likes.innerHTML = `<span aria-hidden="true">♡</span> ${game.likes}`

  details.append(rating, likes)
  content.append(title, details)
  card.append(image, content)

  return card
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

  const controls = document.createElement('div')
  controls.className = 'new-games__controls'
  controls.append(createArrowButton('previous'), createArrowButton('next'))

  const track = document.createElement('div')
  track.className = 'new-games__track'

  games.forEach((game) => {
    track.append(createGameCard(game))
  })

  header.append(title, controls)
  section.append(header, track)

  return section
}
