import type { ApiLeaderboardResponse } from './types'
import { apiRequest } from './client'

export const getLeaderboard = (
  signal?: AbortSignal,
): Promise<ApiLeaderboardResponse> => {
  const promise = apiRequest<ApiLeaderboardResponse>('/leaderboard', signal)
  return promise
}
