const API_BASE_URL =
  'https://faxb76kxra.execute-api.eu-central-1.amazonaws.com/api'

export const apiRequest = async <T>(
  endpoint: string,
  signal?: AbortSignal,
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { signal })

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}
