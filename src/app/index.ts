import { createFooter } from '../components/footer/footer'
import { createHeader } from '../components/header/header'
import { createHomePage } from '../pages/home/home-page'
import { createLibraryPage } from '../pages/library/library-page'

const HOME_ROUTE = '#'
const LIBRARY_ROUTE = '#/library'

const updateActiveNavigation = (header: HTMLElement): void => {
  const currentRoute =
    window.location.hash === LIBRARY_ROUTE ? LIBRARY_ROUTE : HOME_ROUTE

  header
    .querySelectorAll<HTMLAnchorElement>('.header__links a')
    .forEach((link) => {
      if (link.getAttribute('href') === currentRoute) {
        link.setAttribute('aria-current', 'page')
      } else {
        link.removeAttribute('aria-current')
      }
    })
}

export const createApp = (): HTMLElement => {
  const app = document.createElement('div')
  app.className = 'app'

  const header = createHeader()

  const main = document.createElement('main')
  main.className = 'app__main'
  main.id = 'main-content'

  const footer = createFooter()

  const renderRoute = (): void => {
    const page =
      window.location.hash === LIBRARY_ROUTE
        ? createLibraryPage()
        : createHomePage()

    main.replaceChildren(page)
    updateActiveNavigation(header)
  }

  window.addEventListener('hashchange', renderRoute)

  app.append(header, main, footer)
  renderRoute()

  return app
}
