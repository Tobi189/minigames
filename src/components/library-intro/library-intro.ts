import './library-intro.scss'

export const createLibraryIntro = (): HTMLElement => {
  const section = document.createElement('section')
  section.className = 'library-intro'
  section.setAttribute('aria-labelledby', 'library-title')

  const title = document.createElement('h1')
  title.id = 'library-title'
  title.className = 'library-intro__title'
  title.textContent = 'Game Library'

  const subtitle = document.createElement('p')
  subtitle.className = 'library-intro__subtitle'
  subtitle.textContent = 'Browse our colleciton of casual mini-games'

  section.append(title, subtitle)

  return section
}
