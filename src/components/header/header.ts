import logoUrl from '../../assets/logo.svg'
import './header.scss'
import {
  APP_SESSION_CHANGE_EVENT,
  getActiveAppSession,
  logoutAppSession,
  type AppSession,
} from '../../auth/app-session'
import { createAuthModal } from '../auth-modal/auth-modal'
import { showSnackbar } from '../api-feedback/api-feedback'

import {
  createAppUrl,
  getCurrentRoute,
  navigate,
  type AppRoute,
} from '../../app/router'

interface ProfileControls {
  root: HTMLElement
  avatar: HTMLElement
  name: HTMLElement
  logout: HTMLButtonElement
}

const getProfileName = (session: AppSession): string => {
  const displayName = session.displayName.trim()

  if (displayName) return displayName

  return session.email.split('@')[0] || session.email
}

const getInitials = (session: AppSession): string => {
  const nameParts = getProfileName(session).split(/\s+/).filter(Boolean)

  return nameParts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

const updateAvatar = (avatar: HTMLElement, session: AppSession): void => {
  const renderInitials = (): void => {
    const initials = document.createElement('span')
    initials.className = 'header__profile-initials'
    initials.textContent = getInitials(session)
    initials.setAttribute('aria-hidden', 'true')
    avatar.replaceChildren(initials)
  }

  avatar.replaceChildren()

  if (!session.avatarUrl) {
    renderInitials()
    return
  }

  const image = document.createElement('img')
  image.src = session.avatarUrl
  image.alt = ''
  image.referrerPolicy = 'no-referrer'
  image.addEventListener('error', renderInitials, { once: true })
  avatar.append(image)
}

const createProfileControls = (modifier?: 'tablet'): ProfileControls => {
  const root = document.createElement('div')
  root.className = 'header__profile'

  if (modifier) {
    root.classList.add(`header__profile--${modifier}`)
  }

  root.hidden = true

  const avatar = document.createElement('span')
  avatar.className = 'header__profile-avatar'

  const name = document.createElement('span')
  name.className = 'header__profile-name'

  const logout = document.createElement('button')
  logout.type = 'button'
  logout.className = 'header__logout'
  logout.textContent = 'Log Out'

  root.append(avatar, name, logout)

  return { root, avatar, name, logout }
}

export const createHeader = (): HTMLElement => {
  const header = document.createElement('header')
  header.className = 'header'

  const brand = document.createElement('a')
  brand.className = 'header__brand'
  brand.href = createAppUrl('/')

  brand.addEventListener('click', (event) => {
    event.preventDefault()
    navigate('/')
  })

  const logo = document.createElement('img')
  logo.src = logoUrl
  logo.alt = 'MiniGames home'
  brand.append(logo)

  const actions = document.createElement('div')
  actions.className = 'header__actions'
  actions.id = 'header-navigation'

  const nav = document.createElement('nav')
  nav.className = 'header__nav'
  nav.setAttribute('aria-label', 'Main navigation')

  const list = document.createElement('ul')
  list.className = 'header__links'

  const navItems: Array<{
    label: string
    path: string
    route: AppRoute | null
  }> = [
    { label: 'Home', path: '/', route: 'home' },
    { label: 'Library', path: '/library', route: 'library' },
    { label: 'Tournaments', path: '/', route: null },
    { label: 'Community', path: '/', route: null },
  ]

  const currentRoute = getCurrentRoute()

  navItems.forEach(({ label, path, route }) => {
    const item = document.createElement('li')
    const link = document.createElement('a')

    link.textContent = label
    link.href = createAppUrl(path)

    if (route !== null) {
      link.dataset.route = route
    }

    if (route === currentRoute) {
      link.setAttribute('aria-current', 'page')
    }

    link.addEventListener('click', (event) => {
      event.preventDefault()
      navigate(path)
    })

    item.append(link)
    list.append(item)
  })

  nav.append(list)

  const login = document.createElement('button')
  login.type = 'button'
  login.className = 'header__button header__login'
  login.textContent = 'Log In'
  login.addEventListener('click', () => {
    document.body.appendChild(createAuthModal('login'))
  })

  const signup = document.createElement('button')
  signup.type = 'button'
  signup.className = 'header__button header__button--primary header__signup'
  signup.textContent = 'Sign Up'
  signup.addEventListener('click', () => {
    document.body.appendChild(createAuthModal('register'))
  })

  const tabletSignup = document.createElement('button')
  tabletSignup.type = 'button'
  tabletSignup.className =
    'header__button header__button--primary header__tablet-signup'
  tabletSignup.textContent = 'Sign Up'
  tabletSignup.addEventListener('click', () => {
    document.body.appendChild(createAuthModal('register'))
  })

  const profile = createProfileControls()
  const tabletProfile = createProfileControls('tablet')

  const burger = document.createElement('button')
  burger.type = 'button'
  burger.className = 'header__burger'
  burger.setAttribute('aria-label', 'Open navigation menu')
  burger.setAttribute('aria-expanded', 'false')
  burger.setAttribute('aria-controls', actions.id)

  for (let index = 0; index < 3; index += 1) {
    const line = document.createElement('span')
    line.className = 'header__burger-line'
    line.setAttribute('aria-hidden', 'true')
    burger.append(line)
  }

  actions.append(nav, login, signup, profile.root)
  header.append(brand, actions, tabletSignup, tabletProfile.root, burger)

  let isMenuOpen = false

  const isMobileLayout = (): boolean =>
    window.getComputedStyle(burger).display !== 'none'

  const syncMenuAccessibility = (): void => {
    actions.inert = isMobileLayout() && !isMenuOpen
    tabletSignup.inert = isMenuOpen
    tabletProfile.root.inert = isMenuOpen
  }

  const setMenuOpen = (open: boolean, restoreFocus = false): void => {
    isMenuOpen = open

    header.classList.toggle('header--menu-open', open)
    document.body.classList.toggle('body--menu-open', open)

    burger.setAttribute('aria-expanded', String(open))
    burger.setAttribute(
      'aria-label',
      open ? 'Close navigation menu' : 'Open navigation menu',
    )

    syncMenuAccessibility()

    if (restoreFocus && isMobileLayout()) {
      burger.focus()
    }
  }

  const handleLogout = (): void => {
    logoutAppSession()
    setMenuOpen(false)
    showSnackbar('You have been logged out.', 'success')
  }

  profile.logout.addEventListener('click', handleLogout)
  tabletProfile.logout.addEventListener('click', handleLogout)

  const renderSessionControls = (session: AppSession | null): void => {
    const isAuthenticated = session !== null

    login.hidden = isAuthenticated
    signup.hidden = isAuthenticated
    tabletSignup.hidden = isAuthenticated
    profile.root.hidden = !isAuthenticated
    tabletProfile.root.hidden = !isAuthenticated

    if (!session) return

    const profileName = getProfileName(session)

    const profileViews = [profile, tabletProfile]

    profileViews.forEach((controls) => {
      controls.name.textContent = profileName
      controls.root.setAttribute('aria-label', `Signed in as ${profileName}`)
      updateAvatar(controls.avatar, session)
    })
  }

  window.addEventListener(APP_SESSION_CHANGE_EVENT, (event: Event) => {
    const sessionEvent = event as CustomEvent<AppSession | null>
    renderSessionControls(sessionEvent.detail)
  })

  renderSessionControls(getActiveAppSession())

  burger.addEventListener('click', () => {
    setMenuOpen(!isMenuOpen)
  })

  header.addEventListener('keydown', (event: KeyboardEvent) => {
    if (!isMenuOpen) return

    if (event.key === 'Escape') {
      event.preventDefault()
      setMenuOpen(false, true)
      return
    }

    if (event.key !== 'Tab') return

    const controls = Array.from(
      header.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
    ).filter(
      (element) =>
        element.getClientRects().length > 0 &&
        window.getComputedStyle(element).visibility === 'visible' &&
        !element.closest('[inert]'),
    )

    const first = controls[0]
    const last = controls[controls.length - 1]

    if (!first || !last) return

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  })

  header.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (isMenuOpen) {
        setMenuOpen(false, true)
      }
    })
  })

  window.addEventListener('resize', () => {
    if (!isMobileLayout() && isMenuOpen) {
      setMenuOpen(false)
    }

    syncMenuAccessibility()
  })

  requestAnimationFrame(syncMenuAccessibility)

  return header
}
