export const createHomePage = (): HTMLElement => {
  const main = document.createElement('main')
  const heading = document.createElement('h1')

  heading.textContent = 'MiniGames'
  main.append(heading)

  return main
}