// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createApiEmptyState,
  createApiErrorBanner,
  createApiSkeleton,
  showSnackbar,
} from '../src/components/api-feedback/api-feedback'

describe('API feedback components', () => {
  beforeEach(() => {
    document.body.replaceChildren()
    vi.useFakeTimers()
  })

  it('renders and manually closes error and success snackbars', () => {
    showSnackbar('Failed', 'error')
    showSnackbar('Saved', 'success')

    expect(document.querySelectorAll('.snackbar')).toHaveLength(2)
    expect(document.querySelector('[role="alert"]')?.textContent).toContain(
      'Failed',
    )

    document.querySelector<HTMLButtonElement>('.snackbar__close')?.click()
    expect(document.querySelectorAll('.snackbar')).toHaveLength(1)

    vi.advanceTimersByTime(3500)
    expect(document.querySelector('.snackbar')).toBeNull()
  })

  it('creates accessible skeleton and empty states', () => {
    const skeleton = createApiSkeleton('custom', 'Loading things')
    const empty = createApiEmptyState('Nothing here', 'Try again later.')

    expect(skeleton.className).toContain('custom')
    expect(skeleton.getAttribute('aria-busy')).toBe('true')
    expect(empty.getAttribute('role')).toBe('status')
    expect(empty.textContent).toContain('Nothing here')
  })

  it('invokes retry from an error banner', () => {
    const retry = vi.fn()
    const banner = createApiErrorBanner('Network unavailable', retry)
    banner.querySelector<HTMLButtonElement>('button')?.click()

    expect(banner.getAttribute('role')).toBe('alert')
    expect(banner.textContent).toContain('Network unavailable')
    expect(retry).toHaveBeenCalledOnce()
  })
})
