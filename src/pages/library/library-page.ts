import { createFooter } from '../../components/footer/footer'

export const createLibraryPage = (): HTMLElement => {
  const container = document.createElement('div')
  container.className = 'library-page'

  // Empty main element just to keep the page structure
  // and push the footer down to the bottom of the screen
  const main = document.createElement('main')
  main.className = 'library-page__main'
  main.style.minHeight = '70vh'

  // Append ONLY the empty middle part and the footer
  container.append(main, createFooter())

  return container
}
