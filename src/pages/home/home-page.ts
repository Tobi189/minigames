import { createHero } from './hero/hero'
import { createNewGames } from '../../components/new-games/new-games'

export const createHomePage = (): HTMLElement => {
  const main = document.createElement('main')

  main.append(createHero(), createNewGames())

  return main
}
