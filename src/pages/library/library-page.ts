import { createLibraryIntro } from '../../components/library-intro/library-intro'
import { createLibraryFilters } from '../../components/library-filters/library-filters'

export const createLibraryPage = (): HTMLElement => {
  const page = document.createElement('div')
  page.className = 'library-page'

  page.append(createLibraryIntro(), createLibraryFilters())

  return page
}
