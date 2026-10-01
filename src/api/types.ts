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

export type ApiGameCategoryFilter = ApiGameCategory | 'all'

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

export interface ApiGamesAppliedFilter {
  category?: ApiGameCategoryFilter
  sort?: ApiGameSort
  featured?: boolean
}

export interface ApiGamesMeta {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  appliedFilter: ApiGamesAppliedFilter
}

export type ApiGamesResponse = ApiCollectionResponse<ApiGame, ApiGamesMeta>

export interface ApiCategory {
  slug: ApiGameCategoryFilter
  label: string
  isDefault: boolean
}

export interface ApiCategoriesMeta {
  totalItems: number
  description: string
}

export type ApiCategoriesResponse = ApiCollectionResponse<
  ApiCategory,
  ApiCategoriesMeta
>
