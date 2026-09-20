import { createHero } from './hero/hero'
import { createNewGames } from '../../components/new-games/new-games'
import { createTopPlayers } from '../../components/top-players/top-players'

export const createHomePage = (): HTMLElement => {
  const main = document.createElement('main')

  main.append(createHero(), createNewGames(), createTopPlayers())

  return main
}
