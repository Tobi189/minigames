export type AppRoute = 'home' | 'library' | 'not-found'

export const ROUTE_CHANGE_EVENT = 'app-route-change'

const BASE_PATH = import.meta.env.BASE_URL.replace(/\/$/, '')

const getAppPathname = (): string => {
  const { pathname } = window.location

  if (BASE_PATH === '') {
    return pathname
  }

  if (pathname === BASE_PATH) {
    return '/'
  }

  if (pathname.startsWith(`${BASE_PATH}/`)) {
    return pathname.slice(BASE_PATH.length)
  }

  return pathname
}

export const getCurrentRoute = (): AppRoute => {
  const pathname = getAppPathname()

  if (pathname === '/' || pathname === '/home') {
    return 'home'
  }

  if (pathname === '/library') {
    return 'library'
  }

  return 'not-found'
}

export const createAppUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${BASE_PATH}${normalizedPath}`
}

export const navigate = (path: string): void => {
  const url = createAppUrl(path)

  window.history.pushState({}, '', url)
  window.dispatchEvent(new Event(ROUTE_CHANGE_EVENT))
}
