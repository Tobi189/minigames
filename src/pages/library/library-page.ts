import { getCategories } from '../../api/categories'
import { getGames } from '../../api/games'
import { createLibraryFilters } from '../../components/library-filters/library-filters'
import { createLibraryGames } from '../../components/library-games/library-games'
import { createLibraryIntro } from '../../components/library-intro/library-intro'
import { createLibraryPagination } from '../../components/library-pagination/library-pagination'
import type { LibraryState } from './library-state'
import { getLibraryState, navigateToLibraryState } from './library-state'

export const createLibraryPage = (): HTMLElement => {
  const page = document.createElement('div')
  page.className = 'library-page'

  const filtersStatus = document.createElement('section')
  filtersStatus.className = 'library-filters-status'
  filtersStatus.textContent = 'Loading filters…'

  const gamesStatus = document.createElement('section')
  gamesStatus.className = 'library-games-status'
  gamesStatus.textContent = 'Waiting for filters…'

  const paginationStatus = document.createElement('div')
  paginationStatus.className = 'library-pagination-status'

  const renderFiltersError = (): void => {
    const message = document.createElement('p')
    message.textContent = 'Unable to load game categories.'

    const retryButton = document.createElement('button')
    retryButton.type = 'button'
    retryButton.textContent = 'Retry'

    retryButton.addEventListener('click', () => {
      void loadFilters()
    })

    filtersStatus.replaceChildren(message, retryButton)
  }

  const renderGamesError = (state: LibraryState): void => {
    const message = document.createElement('p')
    message.textContent = 'Unable to load games.'

    const retryButton = document.createElement('button')
    retryButton.type = 'button'
    retryButton.textContent = 'Retry'

    retryButton.addEventListener('click', () => {
      void loadGames(state)
    })

    gamesStatus.replaceChildren(message, retryButton)
  }

  const loadGames = async (state: LibraryState): Promise<void> => {
    gamesStatus.textContent = 'Loading games…'

    try {
      const response = await getGames({
        page: state.page,
        limit: 6,
        category: state.category,
        sort: state.sort,
      })

      const games = createLibraryGames(response.data)

      const pagination = createLibraryPagination({
        currentPage: response.meta.page,
        totalPages: response.meta.totalPages,

        onPageChange: (pageNumber) => {
          navigateToLibraryState({
            ...state,
            page: pageNumber,
          })
        },
      })

      gamesStatus.replaceWith(games)
      paginationStatus.replaceWith(pagination)
    } catch {
      renderGamesError(state)
    }
  }

  const loadFilters = async (): Promise<void> => {
    filtersStatus.textContent = 'Loading filters…'

    try {
      const response = await getCategories()

      const defaultCategory =
        response.data.find((category) => category.isDefault)?.slug ?? 'all'

      const state = getLibraryState(defaultCategory)

      const filters = createLibraryFilters({
        categories: response.data,
        state,

        onCategoryChange: (category) => {
          navigateToLibraryState({
            category,
            sort: state.sort,
            page: 1,
          })
        },

        onSortChange: (sort) => {
          navigateToLibraryState({
            category: state.category,
            sort,
            page: 1,
          })
        },
      })

      filtersStatus.replaceWith(filters)
      void loadGames(state)
    } catch {
      renderFiltersError()
    }
  }

  page.append(
    createLibraryIntro(),
    filtersStatus,
    gamesStatus,
    paginationStatus,
  )

  void loadFilters()

  return page
}
