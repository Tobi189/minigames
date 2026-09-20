import type { Game } from './game'
import tukoniCover from '../assets/hero-image-header-block.png'

export const MOCK_GAMES: Game[] = [
  {
    id: 'tukoni-forest-keepers',
    title: 'Tukoni: Forest Keepers',
    coverImage: tukoniCover,
    bannerImage: tukoniCover,
    rating: 4.9,
    likes: '31.2K',
    description:
      'Tukoni: Forest Keepers — a cozy hand-drawn puzzle-adventure. You are Traveller, a little forest spirit on an important mission. Wander storybook meadows, visit mushroom villages, meet adorable inhabitants, solve gentle hand-crafted puzzles, brew herbal teas and help the Tukoni forest prepare peacefully for the coming winter.',
    genre: 'Puzzle',
    players: 'Solo',
    duration: '40–90 min',
    price: 'Free',
    records: [
      {
        rank: 1,
        username: 'ForestSpirit',
        score: '356,700 pts',
        timeAgo: '2 days ago',
      },
      {
        rank: 2,
        username: 'TeaBrewer',
        score: '332,400 pts',
        timeAgo: '5 days ago',
      },
      {
        rank: 3,
        username: 'HerbalistPath',
        score: '308,900 pts',
        timeAgo: '1 week ago',
      },
    ],
    comments: [
      {
        id: 'c1',
        avatar: 'F',
        username: 'ForestDweller',
        timeAgo: '2 hours ago',
        text: 'The hand-drawn art is absolutely magical 💖 Every location feels like a page from a children’s storybook.',
        likes: 12,
      },
      {
        id: 'c2',
        avatar: 'H',
        username: 'HerbalTeaLover',
        timeAgo: '1 day ago',
        text: 'Perfect cozy evening game — brew a cup of chamomile and help the little Tukoni prepare for winter.',
        likes: 5,
      },
    ],
  },
]
