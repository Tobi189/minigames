export interface ApiResponse<T> {
  data: T
}

export interface ApiCollectionResponse<T, TMeta> {
  data: T[]
  meta: TMeta
}

export interface ApiErrorResponse {
  error: string
}

export type ApiGameCategory =
  'puzzle' | 'card' | 'match' | 'farm' | 'strategy' | 'arcade'

export type ApiGameSort =
  'rating-desc' | 'rating-asc' | 'name-asc' | 'name-desc'

export interface ApiGame {
  slug: string
  name: string
  category: ApiGameCategory
  price: string
  shortDescription: string
  rating: number
  likesCount: number
  cardImage: string
}

export interface GamesAppliedFilter {
  category?: ApiGameCategory | 'all'
  sort?: ApiGameSort
  featured?: boolean
}

export interface GamesMeta {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  appliedFilter: GamesAppliedFilter
}

export type GamesResponse = ApiCollectionResponse<ApiGame, GamesMeta>
