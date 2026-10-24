import './hero.scss'

export const createHero = (): HTMLElement => {
  const section = document.createElement('section')
  section.className = 'hero'
  section.setAttribute('aria-labelledby', 'hero-title')

  const card = document.createElement('div')
  card.className = 'hero__card'

  const heading = document.createElement('h1')
  heading.id = 'hero-title'
  heading.className = 'hero__title'
  heading.textContent = 'Take a Short Break & Have Fun'

  const description = document.createElement('p')
  description.className = 'hero__description'
  description.textContent =
    'Discover hundreds of curated casual mini-games. Play instantly in your browser — puzzle, match 3, farm, and board classics.'

  const browseLink = document.createElement('a')
  browseLink.className = 'hero__link'
  browseLink.href = '#/library'
  browseLink.textContent = 'Browse Library'

  card.append(heading, description, browseLink)
  section.append(card)

  return section
}
