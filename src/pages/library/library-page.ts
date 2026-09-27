import { createLibraryIntro } from '../../components/library-intro/library-intro'
import { createLibraryFilters } from '../../components/library-filters/library-filters'
import { createLibraryGames } from '../../components/library-games/library-games'
import { createLibraryPagination } from '../../components/library-pagination/library-pagination'

export const createLibraryPage = (): HTMLElement => {
  const page = document.createElement('div')
  page.className = 'library-page'

  page.append(
    createLibraryIntro(),
    createLibraryFilters(),
    createLibraryGames(),
    createLibraryPagination(),
  )

  return page
}
