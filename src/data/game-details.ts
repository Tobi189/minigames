import tukoniHeroImage from '../assets/games/tukoni-forest-keepers-hero.jpg'

import type { GameComment, GameDetails } from '../types/game-details'

export const tukoniGameDetails: GameDetails = {
  slug: 'tukoni-forest-keepers',
  name: 'Tukoni: Forest Keepers',
  heroImage: tukoniHeroImage,
  rating: 4.9,
  likesCount: 31200,
  description:
    'Tukoni: Forest Keepers — a cozy hand-drawn puzzle-adventure. You are Traveller, a little forest spirit on an important mission. Wander storybook meadows, visit mushroom villages, meet adorable inhabitants, solve gentle hand-crafted puzzles, brew herbal teas and help the Tukoni forest prepare peacefully for the coming winter.',
  specs: {
    genre: 'Puzzle',
    players: 'Solo',
    duration: '40-90 min',
    price: 'Free',
  },
  records: [
    {
      position: 1,
      playerName: 'ForestSpirit',
      score: 356700,
      timeAgo: '2 days ago',
    },
    {
      position: 2,
      playerName: 'TeaBrewer',
      score: 332400,
      timeAgo: '5 days ago',
    },
    {
      position: 3,
      playerName: 'HerbalistPath',
      score: 308900,
      timeAgo: '1 week ago',
    },
  ],
}

export const tukoniComments: GameComment[] = [
  {
    id: 'comment-forest-dweller',
    authorName: 'ForestDweller',
    text: "The hand-drawn art is absolutely magical 🍄 Every location feels like a page from a children's storybook. The mushroom village made me cry happy tears!",
    likesCount: 12,
    isLiked: false,
    timeAgo: '3 hours ago',
  },
  {
    id: 'comment-herbal-tea-lover',
    authorName: 'HerbalTeaLover',
    text: 'Perfect cozy evening game — brew a cup of chamomile, wrap in a blanket and help the little Tukoni prepare for winter. The puzzles are gentle but satisfying.',
    likesCount: 5,
    isLiked: false,
    timeAgo: '1 day ago',
  },
  {
    id: 'comment-cottage-core-mia',
    authorName: 'CottageCoreMia',
    text: 'I want to live inside this game forever 🌿 The NPCs are so charming, the tea recipes are real, and the atmosphere is pure warmth and calm.',
    likesCount: 8,
    isLiked: false,
    timeAgo: '3 days ago',
  },
]
