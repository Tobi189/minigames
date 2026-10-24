import { navigate } from '../../app/router'

export const createNotFoundPage = (): HTMLElement => {
  const page = document.createElement('section')
  page.className = 'not-found-page'

  const title = document.createElement('h1')
  title.textContent = '404 - Page Not Found'

  const message = document.createElement('p')
  message.textContent = 'The requested page does not exist.'

  const homeButton = document.createElement('button')
  homeButton.type = 'button'
  homeButton.textContent = 'Return to Home Page'

  homeButton.addEventListener('click', () => {
    navigate('/')
  })

  page.append(title, message, homeButton)

  return page
}
