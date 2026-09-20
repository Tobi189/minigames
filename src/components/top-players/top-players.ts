import './top-players.scss'
import { createGameModal } from '../game-modal/game-modal'
import { MOCK_GAMES } from '../../types/games'

type Player = {
  rank: number
  initials: string
  avatarColor: string
  name: string
  gamesPlayed: number
  score: string
  shortScore: string
  streak: string
  shortStreak: string
  favoriteGame: string
}

const players: Player[] = [
  {
    rank: 1,
    initials: 'AP',
    avatarColor: 'yellow',
    name: 'Alex_Pro99',
    gamesPlayed: 142,
    score: '94,250',
    shortScore: '94.2K',
    streak: '12 days',
    shortStreak: '12d',
    favoriteGame: 'Herotopia',
  },
  {
    rank: 2,
    initials: 'CG',
    avatarColor: 'green',
    name: 'CozyGamer_x',
    gamesPlayed: 118,
    score: '81,400',
    shortScore: '81.4K',
    streak: '8 days',
    shortStreak: '8d',
    favoriteGame: 'Cat Mail Co.',
  },
  {
    rank: 3,
    initials: 'MM',
    avatarColor: 'blue',
    name: 'MatchMaster',
    gamesPlayed: 98,
    score: '72,110',
    shortScore: '72.1K',
    streak: '5 days',
    shortStreak: '5d',
    favoriteGame: 'Tiny Glade',
  },
  {
    rank: 4,
    initials: 'BP',
    avatarColor: 'pink',
    name: 'BubblePop',
    gamesPlayed: 87,
    score: '65,900',
    shortScore: '65.9K',
    streak: '3 days',
    shortStreak: '3d',
    favoriteGame: 'Whisper of the House',
  },
  {
    rank: 5,
    initials: 'SG',
    avatarColor: 'purple',
    name: 'SudokuGod',
    gamesPlayed: 74,
    score: '59,320',
    shortScore: '59.3K',
    streak: '2 days',
    shortStreak: '2d',
    favoriteGame: 'Cat Chess',
  },
]

const createTextElement = (
  tag: 'span' | 'td',
  className: string,
  text: string,
): HTMLElement => {
  const element = document.createElement(tag)
  element.className = className
  element.textContent = text

  return element
}

const createPlayerRow = (player: Player): HTMLTableRowElement => {
  const row = document.createElement('tr')
  row.className = 'leaderboard__row'

  const rank = document.createElement('td')
  rank.className = 'leaderboard__rank'
  rank.textContent = `#${player.rank}`

  const playerCell = document.createElement('td')
  playerCell.className = 'leaderboard__player'

  const avatar = createTextElement(
    'span',
    `leaderboard__avatar leaderboard__avatar--${player.avatarColor}`,
    player.initials,
  )

  const name = createTextElement(
    'span',
    'leaderboard__player-name',
    player.name,
  )

  playerCell.append(avatar, name)

  const gamesPlayed = document.createElement('td')
  gamesPlayed.className = 'leaderboard__games'
  gamesPlayed.textContent = player.gamesPlayed.toString()

  const score = document.createElement('td')
  score.className = 'leaderboard__score'
  score.append(
    createTextElement('span', 'leaderboard__desktop-value', player.score),
    createTextElement('span', 'leaderboard__mobile-value', player.shortScore),
  )

  const streak = document.createElement('td')
  streak.className = 'leaderboard__streak'

  const flame = createTextElement('span', 'leaderboard__flame', '🔥')
  flame.setAttribute('aria-hidden', 'true')

  streak.append(
    flame,
    createTextElement('span', 'leaderboard__desktop-value', player.streak),
    createTextElement('span', 'leaderboard__mobile-value', player.shortStreak),
  )

  const favorite = document.createElement('td')
  favorite.className = 'leaderboard__favorite'

  const gameBadge = createTextElement(
    'span',
    'leaderboard__game-badge',
    player.favoriteGame,
  )
  favorite.append(gameBadge)

  row.append(rank, playerCell, gamesPlayed, score, streak, favorite)

  // --- Modal Click Trigger ---
  // Attach click handler to the game badge pill (or the entire row)
  row.style.cursor = 'pointer'
  row.addEventListener('click', () => {
    // Find matching game or default to mock data
    const matchedGame =
      MOCK_GAMES.find((g) => g.title === player.favoriteGame) || MOCK_GAMES[0]
    const modalOverlay = createGameModal(matchedGame)
    document.body.append(modalOverlay)
  })

  return row
}

export const createTopPlayers = (): HTMLElement => {
  const section = document.createElement('section')
  section.className = 'top-players'
  section.setAttribute('aria-labelledby', 'top-players-title')

  const title = document.createElement('h2')
  title.id = 'top-players-title'
  title.className = 'top-players__title'
  title.append(
    document.createTextNode('Top Players'),
    createTextElement('span', 'top-players__title-suffix', ' This Week'),
  )

  const tableContainer = document.createElement('div')
  tableContainer.className = 'leaderboard'

  const table = document.createElement('table')
  table.className = 'leaderboard__table'

  const tableHead = document.createElement('thead')
  const headerRow = document.createElement('tr')

  const headings = [
    ['Rank', 'leaderboard__rank'],
    ['Player', 'leaderboard__player'],
    ['Games Played', 'leaderboard__games'],
    ['Total Score', 'leaderboard__score'],
    ['Streak', 'leaderboard__streak'],
    ['Favorite Game', 'leaderboard__favorite'],
  ]

  headings.forEach(([label, className]) => {
    const heading = document.createElement('th')
    heading.className = className
    heading.scope = 'col'
    heading.textContent = label
    headerRow.append(heading)
  })

  tableHead.append(headerRow)

  const tableBody = document.createElement('tbody')

  players.forEach((player) => {
    tableBody.append(createPlayerRow(player))
  })

  table.append(tableHead, tableBody)
  tableContainer.append(table)
  section.append(title, tableContainer)

  return section
}
