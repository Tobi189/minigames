import logoUrl from '../../assets/logo.svg'
import './header.scss'

export const createHeader = (): HTMLElement => {
  const header = document.createElement('header')
  header.className = 'header'

  const brand = document.createElement('a')
  brand.className = 'header__brand'
  brand.href = '#'

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

  const labels = ['Home', 'Library', 'Tournaments', 'Community']

  labels.forEach((label) => {
    const item = document.createElement('li')
    const link = document.createElement('a')

    link.textContent = label
    link.href = '#'

    if (label === 'Home') {
      link.setAttribute('aria-current', 'page')
    }

    item.append(link)
    list.append(item)
  })

  nav.append(list)

  const login = document.createElement('button')
  login.type = 'button'
  login.className = 'header__button header__login'
  login.textContent = 'Log In'

  const signup = document.createElement('button')
  signup.type = 'button'
  signup.className = 'header__button header__button--primary header__signup'
  signup.textContent = 'Sign Up'

  const tabletSignup = document.createElement('button')
  tabletSignup.type = 'button'
  tabletSignup.className =
    'header__button header__button--primary header__tablet-signup'
  tabletSignup.textContent = 'Sign Up'

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

  actions.append(nav, login, signup)
  header.append(brand, actions, tabletSignup, burger)

  let isMenuOpen = false

  const isMobileLayout = (): boolean =>
    window.getComputedStyle(burger).display !== 'none'

  const syncMenuAccessibility = (): void => {
    actions.inert = isMobileLayout() && !isMenuOpen
    tabletSignup.inert = isMenuOpen
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

  // Read responsive styles after the header is attached to the document.
  requestAnimationFrame(syncMenuAccessibility)

  return header
}
