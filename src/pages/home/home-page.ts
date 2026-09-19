import { createHero } from './hero/hero'

export const createHomePage = (): HTMLElement => {
  const main = document.createElement('main')

  main.append(createHero())

  return main
}
