import './developer-cta.scss'
import illustrationImage from '../../assets/illustration-side.png'

const createSubmitButton = (): HTMLButtonElement => {
  const button = document.createElement('button')
  button.className = 'developer-cta__button'
  button.type = 'button'

  const icon = document.createElement('span')
  icon.className = 'developer-cta__button-icon'
  icon.setAttribute('aria-hidden', 'true')

  button.append(icon, 'Submit Form')
  return button
}

export const createDeveloperCta = (): HTMLElement => {
  const section = document.createElement('section')
  section.className = 'developer-cta'
  section.setAttribute('aria-labelledby', 'developer-cta-title')

  const image = document.createElement('img')
  image.className = 'developer-cta__image'
  image.src = illustrationImage
  image.alt =
    'Game developer desk with a computer, a game controller and a retro game on the screen'

  const card = document.createElement('div')
  card.className = 'developer-cta__card'

  const title = document.createElement('h2')
  title.id = 'developer-cta-title'
  title.className = 'developer-cta__title'
  title.textContent = 'Are You a Game Developer?'

  const text = document.createElement('p')
  text.className = 'developer-cta__text'
  text.textContent =
    'Want to see your game on MiniGames? We’re always looking for fun, engaging mini games to add to our platform. Submit your game and reach thousands of players!'

  const contact = document.createElement('p')
  contact.className = 'developer-cta__contact'

  const email = document.createElement('a')
  email.className = 'developer-cta__email'
  email.href = 'mailto:developers@minigames.com'
  email.textContent = 'developers@minigames.com'

  contact.append('or contact us at ', email)
  card.append(title, text, createSubmitButton(), contact)
  section.append(image, card)

  return section
}
