// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  showSnackbar: vi.fn(),
  createAuthModal: vi.fn(),
  destroy: vi.fn(),
  options: undefined as
    | {
        onClose?: () => void
        onModeChange?: (mode: 'login' | 'register') => void
      }
    | undefined,
}))

vi.mock('../src/auth/app-session', () => ({
  getActiveAppSession: mocks.getSession,
}))

vi.mock('../src/components/api-feedback/api-feedback', () => ({
  showSnackbar: mocks.showSnackbar,
}))

vi.mock('../src/components/auth-modal/auth-modal', () => ({
  createAuthModal: mocks.createAuthModal,
}))

const loadDialog = async () => import('../src/auth/auth-dialog')

describe('auth dialog URL guard', () => {
  beforeEach(() => {
    vi.resetModules()
    document.body.replaceChildren()
    window.history.replaceState({}, '', '/')
    mocks.getSession.mockReset().mockReturnValue(null)
    mocks.showSnackbar.mockReset()
    mocks.destroy.mockReset()
    mocks.options = undefined
    mocks.createAuthModal.mockReset().mockImplementation((_mode, options) => {
      mocks.options = options
      return { element: document.createElement('div'), destroy: mocks.destroy }
    })
  })

  it('opens through URL state and synchronizes the modal', async () => {
    const dialog = await loadDialog()
    const change = vi.fn()
    window.addEventListener(dialog.AUTH_DIALOG_CHANGE_EVENT, change)

    dialog.openAuthDialog('login')
    expect(window.location.search).toBe('?auth=login')
    expect(change).toHaveBeenCalledOnce()

    dialog.syncAuthDialogWithUrl()
    expect(mocks.createAuthModal).toHaveBeenCalledWith(
      'login',
      expect.any(Object),
    )
    expect(document.body.children).toHaveLength(1)
  })

  it('changes modes in place and removes invalid query values', async () => {
    const dialog = await loadDialog()
    window.history.replaceState({}, '', '/?auth=login')
    dialog.syncAuthDialogWithUrl()
    mocks.options?.onModeChange?.('register')
    expect(window.location.search).toBe('?auth=register')

    window.history.replaceState({}, '', '/?auth=wrong')
    dialog.syncAuthDialogWithUrl()
    expect(mocks.destroy).toHaveBeenCalled()
    expect(window.location.search).toBe('')
  })

  it('closes and removes URL state when the modal requests it', async () => {
    const dialog = await loadDialog()
    window.history.replaceState({}, '', '/?auth=login')
    dialog.syncAuthDialogWithUrl()
    mocks.options?.onClose?.()
    expect(window.location.search).toBe('')
  })

  it('blocks authenticated users and cleans a stale auth URL', async () => {
    mocks.getSession.mockReturnValue({ email: 'ada@example.com' })
    window.history.replaceState({}, '', '/?auth=login')
    const dialog = await loadDialog()

    dialog.openAuthDialog('register')

    expect(window.location.search).toBe('')
    expect(mocks.createAuthModal).not.toHaveBeenCalled()
    expect(mocks.showSnackbar).toHaveBeenCalledWith(
      'You are already authenticated.',
      'success',
    )
  })

  it('destroys an open modal if a session appears', async () => {
    window.history.replaceState({}, '', '/?auth=login')
    const dialog = await loadDialog()
    dialog.syncAuthDialogWithUrl()
    mocks.getSession.mockReturnValue({ email: 'ada@example.com' })

    dialog.syncAuthDialogWithUrl()

    expect(mocks.destroy).toHaveBeenCalledOnce()
    expect(window.location.search).toBe('')
  })
})
