import type {
  ApiGamesResponse,
  ApiGameCategoryFilter,
  ApiGameSort,
  ApiGameDetailsResponse,
  ApiFavoriteResponse,
} from './types'
import { apiPost, apiRequest } from './client'

export interface GetGamesParams {
  page: number
  limit: number
  category: ApiGameCategoryFilter
  sort: ApiGameSort
}
export const getFeaturedGames = (
  signal?: AbortSignal,
): Promise<ApiGamesResponse> => {
  const response = apiRequest<ApiGamesResponse>('/games?featured=true', signal)

  return response
}

export const getGames = (
  params: GetGamesParams,
  signal?: AbortSignal,
): Promise<ApiGamesResponse> => {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    category: params.category,
    sort: params.sort,
  })

  const endpoint = `/games?${searchParams.toString()}`

  const request = apiRequest<ApiGamesResponse>(endpoint, signal)

  return request
}

export const getGameDetails = (
  gameSlug: string,
  signal?: AbortSignal,
  userEmail?: string,
): Promise<ApiGameDetailsResponse> => {
  const searchParams = new URLSearchParams()

  if (userEmail) {
    searchParams.set('userEmail', userEmail)
  }

  const query = searchParams.toString()
  const endpoint = `/games/${encodeURIComponent(gameSlug)}${query ? `?${query}` : ''}`

  const response = apiRequest<ApiGameDetailsResponse>(endpoint, signal)

  return response
}

export const toggleGameFavorite = (
  gameSlug: string,
  userEmail: string,
  signal?: AbortSignal,
): Promise<ApiFavoriteResponse> => {
  const endpoint = `/games/${encodeURIComponent(gameSlug)}/favorite`

  return apiPost<ApiFavoriteResponse, { userEmail: string }>(
    endpoint,
    { userEmail },
    signal,
  )
}
