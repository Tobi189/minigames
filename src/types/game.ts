export interface Comment {
  id: string
  avatar: string
  username: string
  timeAgo: string
  text: string
  likes: number
}

export interface RecordItem {
  rank: number
  username: string
  score: string
  timeAgo: string
}

export interface Game {
  id: string
  title: string
  coverImage: string
  bannerImage: string
  rating: number
  likes: string
  description: string
  genre: string
  players: string
  duration: string
  price: string
  records: RecordItem[]
  comments: Comment[]
}
