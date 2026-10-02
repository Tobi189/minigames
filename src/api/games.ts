import type { ApiGamesResponse } from './types'
import { apiRequest } from './client'

export const getFeaturedGames = (
  signal?: AbortSignal,
): Promise<ApiGamesResponse> => {
  const response = apiRequest<ApiGamesResponse>('/games?featured=true', signal)

  return response
}
