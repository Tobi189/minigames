import { createFooter } from '../components/footer/footer'
import { syncGameDetailsDialogWithUrl } from '../components/game-details-dialog/game-details-dialog'
import { createHeader } from '../components/header/header'
import {
  AUTH_DIALOG_CHANGE_EVENT,
  AUTH_QUERY_PARAMETER,
  syncAuthDialogWithUrl,
} from '../auth/auth-dialog'
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
  let renderedLocationKey = ''

  const getLocationKey = (): string => {
    const url = new URL(window.location.href)
    url.searchParams.delete('game')
    url.searchParams.delete(AUTH_QUERY_PARAMETER)

    return `${url.pathname}?${url.searchParams.toString()}`
  }

  const syncDialogsWithUrl = (): void => {
    const hasAuthState = new URL(window.location.href).searchParams.has(
      AUTH_QUERY_PARAMETER,
    )

    if (hasAuthState) {
      // Auth temporarily replaces Game Details. The second game sync restores
      // it immediately if the authenticated-user guard removes Auth state.
      syncGameDetailsDialogWithUrl()
      syncAuthDialogWithUrl()
      syncGameDetailsDialogWithUrl()
      return
    }

    syncAuthDialogWithUrl()
    syncGameDetailsDialogWithUrl()
  }

  const renderRoute = (): void => {
    const route = getCurrentRoute()
    const page = createRoutePage(route)

    main.replaceChildren(page)
    updateActiveNavigation(header, route)
    renderedLocationKey = getLocationKey()
  }

  const handlePopState = (): void => {
    if (getLocationKey() !== renderedLocationKey) {
      renderRoute()
    }

    syncDialogsWithUrl()
  }

  const handleRouteChange = (): void => {
    renderRoute()
    syncDialogsWithUrl()
  }

  window.addEventListener('popstate', handlePopState)
  window.addEventListener(ROUTE_CHANGE_EVENT, handleRouteChange)
  window.addEventListener(AUTH_DIALOG_CHANGE_EVENT, syncDialogsWithUrl)

  app.append(header, main, footer)
  renderRoute()
  window.requestAnimationFrame(syncDialogsWithUrl)

  return app
}
