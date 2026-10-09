import './top-players.scss'

import { getLeaderboard } from '../../api/leaderboard'
import type { ApiLeaderboardPlayer } from '../../api/types'
import {
  createApiEmptyState,
  createApiErrorBanner,
  createApiSkeleton,
  showSnackbar,
} from '../api-feedback/api-feedback'

const AVATAR_COLORS = ['yellow', 'green', 'blue', 'pink', 'purple']

const getInitials = (name: string): string => {
  const words = name.split(/[_\s-]+/).filter(Boolean)

  if (words.length > 1) {
    return words
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
  }

  const capitalLetters = name.match(/[A-Z]/g)

  if (capitalLetters && capitalLetters.length > 1) {
    return capitalLetters.slice(0, 2).join('')
  }

  return name.slice(0, 2).toUpperCase()
}

const formatCompactNumber = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)

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

const createPlayerRow = (
  player: ApiLeaderboardPlayer,
  index: number,
): HTMLTableRowElement => {
  const row = document.createElement('tr')
  row.className = 'leaderboard__row'

  const rank = document.createElement('td')
  rank.className = 'leaderboard__rank'
  rank.textContent = `#${player.rank}`

  const playerCell = document.createElement('td')
  playerCell.className = 'leaderboard__player'

  const playerContent = document.createElement('div')
  playerContent.className = 'leaderboard__player-content'

  const avatarColor =
    AVATAR_COLORS[index % AVATAR_COLORS.length] ?? AVATAR_COLORS[0]

  const avatar = createTextElement(
    'span',
    `leaderboard__avatar leaderboard__avatar--${avatarColor}`,
    getInitials(player.playerName),
  )

  const name = createTextElement(
    'span',
    'leaderboard__player-name',
    player.playerName,
  )

  playerContent.append(avatar, name)
  playerCell.append(playerContent)

  const gamesPlayed = createTextElement(
    'td',
    'leaderboard__games',
    player.gamesPlayed.toString(),
  )

  const score = document.createElement('td')
  score.className = 'leaderboard__score'
  score.append(
    createTextElement(
      'span',
      'leaderboard__desktop-value',
      player.totalScore.toLocaleString('en-US'),
    ),
    createTextElement(
      'span',
      'leaderboard__mobile-value',
      formatCompactNumber(player.totalScore),
    ),
  )

  const streak = document.createElement('td')
  streak.className = 'leaderboard__streak'

  const flame = createTextElement('span', 'leaderboard__flame', '🔥')
  flame.setAttribute('aria-hidden', 'true')

  streak.append(
    flame,
    createTextElement(
      'span',
      'leaderboard__desktop-value',
      `${player.streakDays} ${player.streakDays === 1 ? 'day' : 'days'}`,
    ),
    createTextElement(
      'span',
      'leaderboard__mobile-value',
      `${player.streakDays}d`,
    ),
  )

  const favorite = document.createElement('td')
  favorite.className = 'leaderboard__favorite'

  const gameBadge = createTextElement(
    'span',
    'leaderboard__game-badge',
    player.favoriteGameName,
  )
  favorite.append(gameBadge)

  row.append(rank, playerCell, gamesPlayed, score, streak, favorite)

  return row
}

const createLeaderboardTable = (
  players: ApiLeaderboardPlayer[],
): HTMLElement => {
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
  tableBody.append(...players.map(createPlayerRow))

  table.append(tableHead, tableBody)
  tableContainer.append(table)

  return tableContainer
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

  const content = document.createElement('div')
  content.className = 'top-players__content'

  section.append(title, content)

  const loadLeaderboard = async (isRetry = false): Promise<void> => {
    content.replaceChildren(
      createApiSkeleton('top-players__skeleton', 'Loading leaderboard'),
    )

    try {
      const response = await getLeaderboard()

      if (!section.isConnected) return

      if (response.data.length === 0) {
        content.replaceChildren(
          createApiEmptyState(
            'No leaderboard entries',
            'Scores will appear here when players join.',
          ),
        )
      } else {
        content.replaceChildren(createLeaderboardTable(response.data))
      }

      if (isRetry) {
        showSnackbar('Leaderboard loaded successfully.', 'success')
      }
    } catch {
      if (!section.isConnected) return

      showSnackbar('Unable to load the leaderboard.', 'error')
      content.replaceChildren(
        createApiErrorBanner('Unable to load the leaderboard.', () => {
          void loadLeaderboard(true)
        }),
      )
    }
  }

  void loadLeaderboard()

  return section
}
