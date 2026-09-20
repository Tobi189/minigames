import { createHero } from './hero/hero'
import { createNewGames } from '../../components/new-games/new-games'
import { createTopPlayers } from '../../components/top-players/top-players'
import { createDeveloperCta } from '../../components/developer-cta/developer-cta'
import { createFooter } from '../../components/footer/footer'

export const createHomePage = (): HTMLElement => {
  const main = document.createElement('main')

  main.append(
    createHero(),
    createNewGames(),
    createTopPlayers(),
    createDeveloperCta(),
    createFooter(),
  )

  return main
}
