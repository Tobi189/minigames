import { createDeveloperCta } from '../../components/developer-cta/developer-cta'
import { createNewGames } from '../../components/new-games/new-games'
import { createTopPlayers } from '../../components/top-players/top-players'
import { createHero } from './hero/hero'

export const createHomePage = (): HTMLElement => {
  const page = document.createElement('div')
  page.className = 'home-page'

  page.append(
    createHero(),
    createNewGames(),
    createTopPlayers(),
    createDeveloperCta(),
  )

  return page
}
