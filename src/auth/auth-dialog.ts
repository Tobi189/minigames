import { getActiveAppSession } from './app-session'
import type { AuthMode } from './auth-validation'
import {
  createAuthModal,
  type AuthModalInstance,
} from '../components/auth-modal/auth-modal'
import { showSnackbar } from '../components/api-feedback/api-feedback'

export const AUTH_QUERY_PARAMETER = 'auth'
export const AUTH_DIALOG_CHANGE_EVENT = 'auth-dialog-change'

const AUTH_DIALOG_HISTORY_STATE = 'authDialog'

interface ActiveAuthDialog {
  instance: AuthModalInstance
  mode: AuthMode
}

let activeAuthDialog: ActiveAuthDialog | null = null

const getHistoryState = (): Record<string, unknown> => {
  const currentState: unknown = window.history.state

  if (typeof currentState === 'object' && currentState !== null) {
    return { ...currentState }
  }

  return {}
}

const getAuthModeFromUrl = (): AuthMode | null => {
  const value = new URL(window.location.href).searchParams.get(
    AUTH_QUERY_PARAMETER,
  )

  if (value === 'login' || value === 'register') return value

  return null
}

const dispatchDialogChange = (): void => {
  window.dispatchEvent(new Event(AUTH_DIALOG_CHANGE_EVENT))
}

const removeAuthFromUrl = (): void => {
  const url = new URL(window.location.href)
  const state = getHistoryState()

  url.searchParams.delete(AUTH_QUERY_PARAMETER)
  delete state[AUTH_DIALOG_HISTORY_STATE]
  window.history.replaceState(state, '', url)
}

const closeActiveDialog = (): void => {
  activeAuthDialog?.instance.destroy()
  activeAuthDialog = null
}

const handleDialogClose = (): void => {
  activeAuthDialog = null

  if (window.history.state?.[AUTH_DIALOG_HISTORY_STATE] === true) {
    window.history.back()
    return
  }

  removeAuthFromUrl()
  dispatchDialogChange()
}

const handleModeChange = (mode: AuthMode): void => {
  if (activeAuthDialog) {
    activeAuthDialog.mode = mode
  }

  const url = new URL(window.location.href)
  url.searchParams.set(AUTH_QUERY_PARAMETER, mode)
  window.history.replaceState(getHistoryState(), '', url)
}

const showAlreadyAuthenticatedFeedback = (): void => {
  showSnackbar('You are already authenticated.', 'success')
}

export const openAuthDialog = (mode: AuthMode): void => {
  if (getActiveAppSession() !== null) {
    if (new URL(window.location.href).searchParams.has(AUTH_QUERY_PARAMETER)) {
      removeAuthFromUrl()
      dispatchDialogChange()
    }

    showAlreadyAuthenticatedFeedback()
    return
  }

  const url = new URL(window.location.href)

  if (url.searchParams.get(AUTH_QUERY_PARAMETER) === mode) {
    syncAuthDialogWithUrl()
    return
  }

  url.searchParams.set(AUTH_QUERY_PARAMETER, mode)
  window.history.pushState(
    {
      ...getHistoryState(),
      [AUTH_DIALOG_HISTORY_STATE]: true,
    },
    '',
    url,
  )
  dispatchDialogChange()
}

export const syncAuthDialogWithUrl = (): void => {
  const url = new URL(window.location.href)
  const mode = getAuthModeFromUrl()

  if (mode === null) {
    closeActiveDialog()

    if (url.searchParams.has(AUTH_QUERY_PARAMETER)) {
      removeAuthFromUrl()
    }

    return
  }

  if (getActiveAppSession() !== null) {
    closeActiveDialog()
    removeAuthFromUrl()
    showAlreadyAuthenticatedFeedback()
    return
  }

  if (activeAuthDialog?.mode === mode) return

  closeActiveDialog()

  const instance = createAuthModal(mode, {
    onClose: handleDialogClose,
    onModeChange: handleModeChange,
  })

  activeAuthDialog = { instance, mode }
  document.body.append(instance.element)
}
