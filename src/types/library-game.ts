export type GameCategory =
  'puzzle' | 'farm' | 'strategy' | 'card' | 'arcade' | 'match'

export interface LibraryGame {
  slug: string
  name: string
  category: GameCategory
  price: string
  shortDescription: string
  rating: number
  likesCount: number
  cardImage: string
}
