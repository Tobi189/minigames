import { createHero } from './hero/hero'
import { createNewGames } from '../../components/new-games/new-games'
import { createTopPlayers } from '../../components/top-players/top-players'
import { createDeveloperCta } from '../../components/developer-cta/developer-cta'

export const createHomePage = (): HTMLElement => {
  const main = document.createElement('main')

  main.append(
    createHero(),
    createNewGames(),
    createTopPlayers(),
    createDeveloperCta(),
  )

  return main
}
