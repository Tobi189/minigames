import { createHeader } from '../components/header/header'
import { createHomePage } from '../pages/home/home-page'
import { createLibraryPage } from '../pages/library/library-page'

export const createApp = (): HTMLElement => {
  const appContainer = document.createElement('div')

  const header = createHeader()
  const mainContent = document.createElement('div')

  appContainer.append(header, mainContent)

  const renderRoute = (): void => {
    // Clear out whatever is currently on the screen below the header
    mainContent.innerHTML = ''
    const hash = window.location.hash

    if (hash === '#/library') {
      mainContent.append(createLibraryPage())
    } else {
      // Default fallback is the Home page
      mainContent.append(createHomePage())
    }
  }

  // Listen for URL changes and trigger the initial render
  window.addEventListener('hashchange', renderRoute)
  renderRoute()

  return appContainer
}
