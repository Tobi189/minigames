import './api-feedback.scss'

type SnackbarVariant = 'error' | 'success'

const SNACKBAR_DURATION = 3500

const getSnackbarRegion = (): HTMLElement => {
  const existing = document.querySelector<HTMLElement>('.snackbar-region')

  if (existing) return existing

  const region = document.createElement('div')
  region.className = 'snackbar-region'
  region.setAttribute('aria-live', 'polite')
  document.body.append(region)

  return region
}

export const showSnackbar = (
  message: string,
  variant: SnackbarVariant,
): void => {
  const snackbar = document.createElement('div')
  snackbar.className = `snackbar snackbar--${variant}`
  snackbar.setAttribute('role', variant === 'error' ? 'alert' : 'status')

  const text = document.createElement('span')
  text.textContent = message

  const closeButton = document.createElement('button')
  closeButton.type = 'button'
  closeButton.className = 'snackbar__close'
  closeButton.setAttribute('aria-label', 'Close notification')
  closeButton.textContent = '×'

  const dismiss = (): void => {
    window.clearTimeout(timeoutId)
    snackbar.remove()
  }

  closeButton.addEventListener('click', dismiss)
  snackbar.append(text, closeButton)
  getSnackbarRegion().append(snackbar)

  const timeoutId = window.setTimeout(dismiss, SNACKBAR_DURATION)
}

export const createApiSkeleton = (
  className: string,
  label: string,
): HTMLElement => {
  const skeleton = document.createElement('div')
  skeleton.className = `api-skeleton ${className}`
  skeleton.setAttribute('aria-label', label)
  skeleton.setAttribute('aria-busy', 'true')

  return skeleton
}

export const createApiEmptyState = (
  titleText: string,
  messageText: string,
): HTMLElement => {
  const emptyState = document.createElement('div')
  emptyState.className = 'api-feedback api-feedback--empty'
  emptyState.setAttribute('role', 'status')

  const title = document.createElement('h3')
  title.className = 'api-feedback__title'
  title.textContent = titleText

  const message = document.createElement('p')
  message.className = 'api-feedback__message'
  message.textContent = messageText

  emptyState.append(title, message)
  return emptyState
}

export const createApiErrorBanner = (
  messageText: string,
  onRetry: () => void,
): HTMLElement => {
  const banner = document.createElement('div')
  banner.className = 'api-feedback api-feedback--error'
  banner.setAttribute('role', 'alert')

  const title = document.createElement('h3')
  title.className = 'api-feedback__title'
  title.textContent = 'Something went wrong'

  const message = document.createElement('p')
  message.className = 'api-feedback__message'
  message.textContent = messageText

  const retryButton = document.createElement('button')
  retryButton.type = 'button'
  retryButton.className = 'api-feedback__retry'
  retryButton.textContent = 'Retry'
  retryButton.addEventListener('click', onRetry)

  banner.append(title, message, retryButton)
  return banner
}
