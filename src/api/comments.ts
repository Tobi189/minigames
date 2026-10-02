import type { ApiCommentsResponse } from './types'
import { apiRequest } from './client'

export const getGameComments = (
  gameSlug: string,
  signal?: AbortSignal,
): Promise<ApiCommentsResponse> => {
  const encodedSlug = encodeURIComponent(gameSlug)
  const searchParams = new URLSearchParams({
    limit: '3',
    sort: 'newest',
  })

  const path = `/games/${encodedSlug}/comments`

  const endpoint = `${path}?${searchParams.toString()}`
  const response = apiRequest<ApiCommentsResponse>(endpoint, signal)
  return response
}
