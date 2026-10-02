import type {
  ApiGamesResponse,
  ApiGameCategoryFilter,
  ApiGameSort,
} from './types'
import { apiRequest } from './client'

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
