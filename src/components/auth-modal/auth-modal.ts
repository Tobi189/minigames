import './auth-modal.scss'
import { startAppSession } from '../../auth/app-session'
import type {
  AuthField,
  AuthFormValues,
  AuthMode,
} from '../../auth/auth-validation'
import { isAuthFormValid, validateAuthField } from '../../auth/auth-validation'
import {
  getAuthenticationErrorMessage,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
} from '../../auth/firebase-auth'
import googleIcon from '../../assets/Vector.png'
import { showSnackbar } from '../api-feedback/api-feedback'

interface FieldDefinition {
  name: AuthField
  label: string
  type: 'email' | 'password' | 'text'
  placeholder: string
  autocomplete: string
}

type PendingAction = 'email' | 'google'

export interface AuthModalOptions {
  onClose?: () => void
  onModeChange?: (mode: AuthMode) => void
}

export interface AuthModalInstance {
  element: HTMLElement
  destroy: () => void
}

const EMPTY_FORM_VALUES: AuthFormValues = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const LOGIN_FIELDS: FieldDefinition[] = [
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'e.g. alex@example.com',
    autocomplete: 'email',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: '••••••••',
    autocomplete: 'current-password',
  },
]

const REGISTER_FIELDS: FieldDefinition[] = [
  {
    name: 'username',
    label: 'Username',
    type: 'text',
    placeholder: 'e.g. CozyGamer99',
    autocomplete: 'username',
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'e.g. alex@example.com',
    autocomplete: 'email',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Min. 6 characters',
    autocomplete: 'new-password',
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password',
    placeholder: 'Repeat your password',
    autocomplete: 'new-password',
  },
]

export const createAuthModal = (
  initialTab: AuthMode = 'login',
  options: AuthModalOptions = {},
): AuthModalInstance => {
  const overlay = document.createElement('div')
  overlay.className = 'auth-modal-overlay'

  const modal = document.createElement('div')
  modal.className = 'auth-modal'
  modal.setAttribute('role', 'dialog')
  modal.setAttribute('aria-modal', 'true')
  modal.setAttribute('aria-labelledby', 'auth-modal-title')

  let currentTab = initialTab
  let isPending = false
  let isClosed = false
  const previousBodyOverflow = document.body.style.overflow

  const tabsContainer = document.createElement('div')
  tabsContainer.className = 'auth-modal__tabs'
  tabsContainer.setAttribute('role', 'tablist')
  tabsContainer.setAttribute('aria-label', 'Authentication mode')

  const loginTab = document.createElement('button')
  loginTab.type = 'button'
  loginTab.className = 'auth-modal__tab'
  loginTab.textContent = 'Login'
  loginTab.setAttribute('role', 'tab')

  const registerTab = document.createElement('button')
  registerTab.type = 'button'
  registerTab.className = 'auth-modal__tab'
  registerTab.textContent = 'Register'
  registerTab.setAttribute('role', 'tab')

  tabsContainer.append(loginTab, registerTab)

  const contentContainer = document.createElement('div')
  contentContainer.className = 'auth-modal__content-wrapper'

  const setTabState = (): void => {
    const isLogin = currentTab === 'login'

    loginTab.classList.toggle('active', isLogin)
    registerTab.classList.toggle('active', !isLogin)
    loginTab.setAttribute('aria-selected', String(isLogin))
    registerTab.setAttribute('aria-selected', String(!isLogin))
  }

  const destroyModal = (): void => {
    if (isClosed) return

    isClosed = true
    document.removeEventListener('keydown', handleKeydown)
    overlay.remove()
    document.body.style.overflow = previousBodyOverflow
  }

  const closeModal = (): void => {
    if (isPending || isClosed) return

    destroyModal()
    options.onClose?.()
  }

  const finishAuthentication = (
    profile: Parameters<typeof startAppSession>[0],
  ): void => {
    startAppSession(profile)
    isPending = false
    showSnackbar('Authentication completed successfully.', 'success')
    closeModal()
  }

  const renderContent = (): void => {
    contentContainer.replaceChildren()

    const values: AuthFormValues = { ...EMPTY_FORM_VALUES }
    const errorElements = new Map<AuthField, HTMLElement>()
    const inputElements = new Map<AuthField, HTMLInputElement>()

    const header = document.createElement('div')
    header.className = 'auth-modal__header'

    const title = document.createElement('h2')
    title.id = 'auth-modal-title'
    title.className = 'auth-modal__title'
    title.textContent =
      currentTab === 'login' ? 'Welcome Back!' : 'Create Account'

    const subtitle = document.createElement('p')
    subtitle.className = 'auth-modal__subtitle'
    subtitle.textContent =
      currentTab === 'login'
        ? 'Sign in to resume your games and progress.'
        : 'Join the Minigames to track scores and save favorites.'

    header.append(title, subtitle)

    const form = document.createElement('form')
    form.className = 'auth-form'
    form.noValidate = true

    const fields = currentTab === 'login' ? LOGIN_FIELDS : REGISTER_FIELDS

    const submitButton = document.createElement('button')
    submitButton.type = 'submit'
    submitButton.className = 'btn btn--primary'

    const submitLabel = currentTab === 'login' ? 'Login' : 'Create Account'
    submitButton.textContent = submitLabel
    submitButton.disabled = true

    const updateSubmitState = (): void => {
      submitButton.disabled = isPending || !isAuthFormValid(currentTab, values)
    }

    const renderFieldError = (field: AuthField): void => {
      const input = inputElements.get(field)
      const errorElement = errorElements.get(field)

      if (!input || !errorElement) return

      const error = validateAuthField(currentTab, field, values)
      errorElement.textContent = error ?? ''
      input.setAttribute('aria-invalid', String(error !== null))
    }

    fields.forEach((definition) => {
      const group = document.createElement('div')
      group.className = 'auth-form__group'

      const inputId = `auth-${currentTab}-${definition.name}`
      const errorId = `${inputId}-error`

      const label = document.createElement('label')
      label.htmlFor = inputId
      label.textContent = definition.label

      const input = document.createElement('input')
      input.id = inputId
      input.name = definition.name
      input.type = definition.type
      input.placeholder = definition.placeholder
      input.setAttribute('autocomplete', definition.autocomplete)
      input.setAttribute('aria-describedby', errorId)
      input.setAttribute('aria-invalid', 'false')

      const error = document.createElement('span')
      error.id = errorId
      error.className = 'auth-form__error'
      error.setAttribute('aria-live', 'polite')

      const validateInput = (): void => {
        values[definition.name] = input.value
        renderFieldError(definition.name)

        if (currentTab === 'register' && definition.name === 'password') {
          renderFieldError('confirmPassword')
        }

        updateSubmitState()
      }

      input.addEventListener('input', validateInput)
      input.addEventListener('change', validateInput)
      input.addEventListener('blur', validateInput)

      inputElements.set(definition.name, input)
      errorElements.set(definition.name, error)
      group.append(label, input, error)
      form.append(group)
    })

    let forgotPasswordLink: HTMLAnchorElement | null = null

    if (currentTab === 'login') {
      const forgotPassword = document.createElement('div')
      forgotPassword.className = 'auth-form__forgot'

      forgotPasswordLink = document.createElement('a')
      forgotPasswordLink.href = '#'
      forgotPasswordLink.textContent = 'Forgot Password?'
      forgotPasswordLink.addEventListener('click', (event) => {
        event.preventDefault()
      })

      forgotPassword.append(forgotPasswordLink)
      form.append(forgotPassword)
    }

    const actions = document.createElement('div')
    actions.className = 'auth-modal__actions'

    const googleButton = document.createElement('button')
    googleButton.type = 'button'
    googleButton.className = 'btn btn--social'

    const googleImage = document.createElement('img')
    googleImage.src = googleIcon
    googleImage.alt = ''
    googleImage.width = 20
    googleImage.height = 20

    const googleLabel = document.createElement('span')
    const defaultGoogleLabel =
      currentTab === 'login' ? 'Continue with Google' : 'Sign up with Google'
    googleLabel.textContent = defaultGoogleLabel

    googleButton.append(googleImage, googleLabel)
    actions.append(submitButton, googleButton)
    form.append(actions)

    const footer = document.createElement('div')
    footer.className = 'auth-modal__footer'
    footer.append(
      currentTab === 'login'
        ? "Don't have an account? "
        : 'Already have an account? ',
    )

    const switchButton = document.createElement('button')
    switchButton.type = 'button'
    switchButton.className = 'auth-modal__switch'
    switchButton.textContent = currentTab === 'login' ? 'Register' : 'Login'
    switchButton.addEventListener('click', () => {
      setTab(currentTab === 'login' ? 'register' : 'login')
    })

    const setPending = (pending: boolean, action: PendingAction): void => {
      isPending = pending
      overlay.setAttribute('aria-busy', String(pending))
      loginTab.disabled = pending
      registerTab.disabled = pending
      switchButton.disabled = pending
      googleButton.disabled = pending
      inputElements.forEach((input) => {
        input.disabled = pending
      })

      if (forgotPasswordLink) {
        forgotPasswordLink.setAttribute('aria-disabled', String(pending))
      }

      submitButton.textContent =
        pending && action === 'email'
          ? currentTab === 'login'
            ? 'Logging in…'
            : 'Creating account…'
          : submitLabel
      googleLabel.textContent =
        pending && action === 'google' ? 'Connecting…' : defaultGoogleLabel
      updateSubmitState()
    }

    const handleAuthenticationFailure = (
      error: unknown,
      action: PendingAction,
    ): void => {
      showSnackbar(getAuthenticationErrorMessage(error), 'error')
      setPending(false, action)
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault()

      if (isPending || !isAuthFormValid(currentTab, values)) return

      setPending(true, 'email')
      const authentication =
        currentTab === 'login'
          ? loginWithEmail(values.email, values.password)
          : registerWithEmail(values.username, values.email, values.password)

      void authentication.then(finishAuthentication).catch((error: unknown) => {
        handleAuthenticationFailure(error, 'email')
      })
    })

    googleButton.addEventListener('click', () => {
      if (isPending) return

      setPending(true, 'google')
      void loginWithGoogle()
        .then(finishAuthentication)
        .catch((error: unknown) => {
          handleAuthenticationFailure(error, 'google')
        })
    })

    footer.append(switchButton)
    contentContainer.append(header, form, footer)
  }

  const setTab = (tab: AuthMode): void => {
    if (isPending || tab === currentTab) return

    currentTab = tab
    setTabState()
    renderContent()
    options.onModeChange?.(tab)
  }

  loginTab.addEventListener('click', () => setTab('login'))
  registerTab.addEventListener('click', () => setTab('register'))

  const handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') closeModal()
  }

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeModal()
  })

  setTabState()
  renderContent()
  modal.append(tabsContainer, contentContainer)
  overlay.append(modal)
  document.addEventListener('keydown', handleKeydown)
  document.body.style.overflow = 'hidden'

  return {
    element: overlay,
    destroy: destroyModal,
  }
}
