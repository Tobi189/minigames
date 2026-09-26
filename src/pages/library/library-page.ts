import { createLibraryIntro } from '../../components/library-intro/library-intro'

export const createLibraryPage = (): HTMLElement => {
  const page = document.createElement('div')
  page.className = 'library-page'

  page.append(createLibraryIntro())

  return page
}
