import type {
  ApiComment,
  ApiCommentsResponse,
  ApiGame,
  ApiGameDetails,
  ApiGamesResponse,
  ApiLeaderboardPlayer,
} from '../src/api/types'

export const game: ApiGame = {
  slug: 'tiny-glade',
  name: 'Tiny Glade',
  category: 'strategy',
  price: 'Free',
  shortDescription: 'Build a peaceful little kingdom.',
  rating: 4.8,
  likesCount: 1250,
  cardImage: '/images/tiny-glade.jpg',
}

export const secondGame: ApiGame = {
  ...game,
  slug: 'frost-lotus',
  name: 'Frost Lotus',
  category: 'puzzle',
  price: '$4.99',
  rating: 4.2,
  likesCount: 42,
}

export const gamesResponse: ApiGamesResponse = {
  data: [game, secondGame],
  meta: {
    page: 1,
    limit: 6,
    totalItems: 2,
    totalPages: 1,
    appliedFilter: {},
  },
}

export const gameDetails: ApiGameDetails = {
  slug: game.slug,
  name: game.name,
  heroImage: '/images/tiny-glade-hero.jpg',
  rating: 4.8,
  likesCount: 1250,
  isLikedByCurrentUser: false,
  fullDescription: 'A longer description of Tiny Glade.',
  specs: {
    genre: 'Strategy',
    players: '1',
    duration: '15 min',
    price: 'Free',
  },
  topRecords: [
    {
      position: 1,
      playerName: 'Ada',
      score: 12345,
      achievedAt: '2026-10-12T11:00:00.000Z',
    },
    {
      position: 4,
      playerName: 'Grace',
      score: 9000,
      achievedAt: 'invalid-date',
    },
  ],
}

export const comment: ApiComment = {
  commentId: 'comment-1',
  authorName: 'Ada Lovelace',
  text: 'Lovely game.',
  likesCount: 2,
  isLikedByCurrentUser: false,
  createdAt: '2026-10-12T11:59:00.000Z',
}

export const commentsResponse: ApiCommentsResponse = {
  data: [comment],
  meta: {
    totalComments: 1,
    returnedCount: 1,
    sort: 'newest',
  },
}

export const leaderboardPlayers: ApiLeaderboardPlayer[] = [
  {
    rank: 1,
    playerName: 'Ada Lovelace',
    gamesPlayed: 12,
    totalScore: 12500,
    streakDays: 1,
    favoriteGameSlug: game.slug,
    favoriteGameName: game.name,
  },
  {
    rank: 2,
    playerName: 'CodeMaster',
    gamesPlayed: 8,
    totalScore: 920,
    streakDays: 3,
    favoriteGameSlug: secondGame.slug,
    favoriteGameName: secondGame.name,
  },
]
