import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, apiPost, apiRequest } from '../src/api/client'

const API_BASE_URL =
  'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api'

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

describe('API client', (): void => {
  afterEach((): void => {
    vi.unstubAllGlobals()
  })

  it('performs a GET request and returns parsed JSON', async (): Promise<void> => {
    const payload = { data: ['game'] }
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(payload))
    const controller = new AbortController()
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiRequest('/games', controller.signal)).resolves.toEqual(
      payload,
    )
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/games`, {
      signal: controller.signal,
    })
  })

  it('performs a JSON POST request', async (): Promise<void> => {
    const payload = { success: true }
    const body = { userEmail: 'player@example.com' }
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(payload))
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiPost('/favorite', body)).resolves.toEqual(payload)
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/favorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: undefined,
    })
  })

  it('throws an ApiError with the API message', async (): Promise<void> => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ error: 'Game not found' }, 404)),
    )

    const request = apiRequest('/missing')

    await expect(request).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Game not found',
      status: 404,
    })
    await expect(request).rejects.toBeInstanceOf(ApiError)
  })

  it('uses a fallback for invalid error responses', async (): Promise<void> => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('Not JSON', { status: 503 })),
    )

    await expect(apiPost('/comments', {})).rejects.toThrow(
      'API request failed with status 503',
    )
  })

  it('uses a fallback when JSON has no error message', async (): Promise<void> => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse({ message: 'Unavailable' }, 500)),
    )

    await expect(apiRequest('/games')).rejects.toThrow(
      'API request failed with status 500',
    )
  })

  it('does not replace network errors', async (): Promise<void> => {
    const networkError = new TypeError('Failed to fetch')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(networkError))

    await expect(apiRequest('/games')).rejects.toBe(networkError)
  })
})
