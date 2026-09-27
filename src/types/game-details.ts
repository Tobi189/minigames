export interface GameDetailsSpecs {
  genre: string
  players: string
  duration: string
  price: string
}

export interface GameRecord {
  position: number
  playerName: string
  score: number
  timeAgo: string
}

export interface GameComment {
  id: string
  authorName: string
  text: string
  likesCount: number
  isLiked: boolean
  timeAgo: string
}

export interface GameDetails {
  slug: string
  name: string
  heroImage: string
  rating: number
  likesCount: number
  description: string
  specs: GameDetailsSpecs
  records: GameRecord[]
}
