import type { ApiErrorResponse } from './types'

const API_BASE_URL =
  'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api'

export class ApiError extends Error {
  public readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const errorResponse = (await response.json()) as Partial<ApiErrorResponse>

    if (typeof errorResponse.error === 'string') {
      return errorResponse.error
    }
  } catch {
    return `API request failed with status ${response.status}`
  }

  return `API request failed with status ${response.status}`
}

export const apiRequest = async <T>(
  endpoint: string,
  signal?: AbortSignal,
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { signal })

  if (!response.ok) {
    const message = await getErrorMessage(response)
    throw new ApiError(message, response.status)
  }

  return (await response.json()) as T
}
