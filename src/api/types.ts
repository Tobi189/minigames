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

export type ApiCommentSort = 'newest' | 'oldest'
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

export interface ApiLeaderboardPlayer {
  rank: number
  playerName: string
  gamesPlayed: number
  totalScore: number
  streakDays: number
  favoriteGameSlug: string
  favoriteGameName: string
}

export interface ApiLeaderboardMeta {
  totalItems: number
  description: string
}

export type ApiLeaderboardResponse = ApiCollectionResponse<
  ApiLeaderboardPlayer,
  ApiLeaderboardMeta
>

export interface ApiGameSpecs {
  genre: string
  players: string
  duration: string
  price: string
}

export interface ApiGameRecord {
  position: number
  playerName: string
  score: number
  achievedAt: string
}

export interface ApiGameDetails {
  slug: string
  name: string
  heroImage: string
  rating: number
  likesCount: number
  isLikedByCurrentUser: boolean
  fullDescription: string
  specs: ApiGameSpecs
  topRecords: ApiGameRecord[]
}

export type ApiGameDetailsResponse = ApiResponse<ApiGameDetails>

export interface ApiComment {
  commentId: string
  authorName: string
  text: string
  likesCount: number
  isLikedByCurrentUser: boolean
  createdAt: string
}

export interface ApiCommentsMeta {
  totalComments: number
  returnedCount: number
  sort: ApiCommentSort
}

export type ApiCommentsResponse = ApiCollectionResponse<
  ApiComment,
  ApiCommentsMeta
>
