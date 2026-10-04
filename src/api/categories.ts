import type { ApiCategoriesResponse } from './types'
import { apiRequest } from './client'

export const getCategories = (
  signal?: AbortSignal,
): Promise<ApiCategoriesResponse> => {
  const response = apiRequest<ApiCategoriesResponse>('/categories', signal)
  return response
}
