import type {
  ApiCommentLikeBody,
  ApiCommentLikeResponse,
  ApiCommentsResponse,
  ApiCreateCommentBody,
  ApiCreateCommentResponse,
} from './types'
import { apiPost, apiRequest } from './client'

export const getGameComments = (
  gameSlug: string,
  signal?: AbortSignal,
  userEmail?: string,
): Promise<ApiCommentsResponse> => {
  const encodedSlug = encodeURIComponent(gameSlug)
  const searchParams = new URLSearchParams({
    limit: '3',
    sort: 'newest',
  })

  if (userEmail) {
    searchParams.set('userEmail', userEmail)
  }

  const path = `/games/${encodedSlug}/comments`

  const endpoint = `${path}?${searchParams.toString()}`
  const response = apiRequest<ApiCommentsResponse>(endpoint, signal)
  return response
}

export const createGameComment = (
  gameSlug: string,
  body: ApiCreateCommentBody,
  signal?: AbortSignal,
): Promise<ApiCreateCommentResponse> => {
  const endpoint = `/games/${encodeURIComponent(gameSlug)}/comments`

  return apiPost<ApiCreateCommentResponse, ApiCreateCommentBody>(
    endpoint,
    body,
    signal,
  )
}

export const toggleCommentLike = (
  commentId: string,
  userEmail: string,
  signal?: AbortSignal,
): Promise<ApiCommentLikeResponse> => {
  const endpoint = `/comments/${encodeURIComponent(commentId)}/like`

  return apiPost<ApiCommentLikeResponse, ApiCommentLikeBody>(
    endpoint,
    { userEmail },
    signal,
  )
}
