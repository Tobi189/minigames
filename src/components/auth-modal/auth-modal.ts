import './auth-modal.scss'
import googleIcon from '../../assets/Vector.png'

type AuthTab = 'login' | 'register'

export const createAuthModal = (initialTab: AuthTab = 'login'): HTMLElement => {
  const overlay = document.createElement('div')
  overlay.className = 'auth-modal-overlay'

  const modal = document.createElement('div')
  modal.className = 'auth-modal'

  let currentTab = initialTab

  // Top Tab Switcher
  const tabsContainer = document.createElement('div')
  tabsContainer.className = 'auth-modal__tabs'

  const loginTab = document.createElement('button')
  loginTab.className = `auth-modal__tab ${currentTab === 'login' ? 'active' : ''}`
  loginTab.textContent = 'Login'

  const registerTab = document.createElement('button')
  registerTab.className = `auth-modal__tab ${currentTab === 'register' ? 'active' : ''}`
  registerTab.textContent = 'Register'

  tabsContainer.append(loginTab, registerTab)

  // Dynamic Content Wrapper
  const contentContainer = document.createElement('div')
  contentContainer.className = 'auth-modal__content-wrapper'

  const renderContent = (): void => {
    contentContainer.innerHTML = ''

    const header = document.createElement('div')
    header.className = 'auth-modal__header'

    const title = document.createElement('h2')
    title.className = 'auth-modal__title'

    const subtitle = document.createElement('p')
    subtitle.className = 'auth-modal__subtitle'

    const form = document.createElement('div')
    form.className = 'auth-form'

    const actions = document.createElement('div')
    actions.className = 'auth-modal__actions'

    const footer = document.createElement('div')
    footer.className = 'auth-modal__footer'

    if (currentTab === 'login') {
      title.textContent = 'Welcome Back!'
      subtitle.textContent = 'Sign in to resume your games and progress.'

      form.innerHTML = `
        <div class="auth-form__group">
          <label>Email Address</label>
          <input type="email" placeholder="e.g. alex@example.com" />
        </div>
        <div class="auth-form__group">
          <label>Password</label>
          <input type="password" placeholder="••••••••" />
        </div>
        <div class="auth-form__forgot">
          <a href="#">Forgot Password?</a>
        </div>
      `

      actions.innerHTML = `
        <button class="btn btn--primary">Login</button>
        <button class="btn btn--social">
          <img src="${googleIcon}" alt="Google" width="20" height="20" /> Continue with Google
        </button>
      `

      footer.innerHTML = `Don't have an account? <a href="#" class="switch-to-register">Register</a>`
    } else {
      title.textContent = 'Create Account'
      subtitle.textContent =
        'Join the Minigames to track scores and save favorites.'

      form.innerHTML = `
        <div class="auth-form__group">
          <label>Username</label>
          <input type="text" placeholder="e.g. CozyGamer_99" />
        </div>
        <div class="auth-form__group">
          <label>Email Address</label>
          <input type="email" placeholder="e.g. alex@example.com" />
        </div>
        <div class="auth-form__group">
          <label>Password</label>
          <input type="password" placeholder="Min. 8 characters" />
        </div>
        <div class="auth-form__group">
          <label>Confirm Password</label>
          <input type="password" placeholder="Repeat your password" />
        </div>
      `

      actions.innerHTML = `
        <button class="btn btn--primary">Create Account</button>
        <button class="btn btn--social">
          <img src="${googleIcon}" alt="Google" width="20" height="20" /> Sign up with Google
        </button>
      `

      footer.innerHTML = `Already have an account? <a href="#" class="switch-to-login">Login</a>`
    }

    header.append(title, subtitle)
    contentContainer.append(header, form, actions, footer)

    // Re-bind footer text toggle links
    const switchBtn = contentContainer.querySelector(
      currentTab === 'login' ? '.switch-to-register' : '.switch-to-login',
    )
    if (switchBtn) {
      switchBtn.addEventListener('click', (e) => {
        e.preventDefault()
        setTab(currentTab === 'login' ? 'register' : 'login')
      })
    }
  }

  const setTab = (tab: AuthTab): void => {
    currentTab = tab
    loginTab.className = `auth-modal__tab ${currentTab === 'login' ? 'active' : ''}`
    registerTab.className = `auth-modal__tab ${currentTab === 'register' ? 'active' : ''}`
    renderContent()
  }

  loginTab.addEventListener('click', () => setTab('login'))
  registerTab.addEventListener('click', () => setTab('register'))

  const closeModal = (): void => {
    overlay.remove()
    document.body.style.overflow = ''
  }

  // Close when clicking outside modal body
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal()
  })

  // Initial Content Load
  renderContent()

  modal.append(tabsContainer, contentContainer)
  overlay.append(modal)

  // Lock body scroll behind modal
  document.body.style.overflow = 'hidden'

  return overlay
}
