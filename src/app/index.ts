import { createFooter } from '../components/footer/footer'
import { createHeader } from '../components/header/header'
import { createHomePage } from '../pages/home/home-page'
import { createLibraryPage } from '../pages/library/library-page'
import { createNotFoundPage } from '../pages/not-found/not-found-page'
import { getCurrentRoute, ROUTE_CHANGE_EVENT, type AppRoute } from './router'

const createRoutePage = (route: AppRoute): HTMLElement => {
  if (route === 'home') {
    return createHomePage()
  }

  if (route === 'library') {
    return createLibraryPage()
  }

  return createNotFoundPage()
}

const updateActiveNavigation = (
  header: HTMLElement,
  currentRoute: AppRoute,
): void => {
  header.querySelectorAll<HTMLAnchorElement>('[data-route]').forEach((link) => {
    if (link.dataset.route === currentRoute) {
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
    const route = getCurrentRoute()
    const page = createRoutePage(route)

    main.replaceChildren(page)
    updateActiveNavigation(header, route)
  }

  window.addEventListener('popstate', renderRoute)
  window.addEventListener(ROUTE_CHANGE_EVENT, renderRoute)

  app.append(header, main, footer)
  renderRoute()

  return app
}
