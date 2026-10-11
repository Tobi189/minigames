import './library-page.scss'

import { getCategories } from '../../api/categories'
import { getGames } from '../../api/games'
import {
  createApiErrorBanner,
  createApiSkeleton,
  showSnackbar,
} from '../../components/api-feedback/api-feedback'
import { createLibraryFilters } from '../../components/library-filters/library-filters'
import {
  createLibraryGames,
  createLibraryGamesSkeleton,
} from '../../components/library-games/library-games'
import { createLibraryIntro } from '../../components/library-intro/library-intro'
import { createLibraryPagination } from '../../components/library-pagination/library-pagination'
import type { LibraryState } from './library-state'
import { getLibraryState, navigateToLibraryState } from './library-state'

export const createLibraryPage = (): HTMLElement => {
  const page = document.createElement('div')
  page.className = 'library-page'

  const filtersSlot = document.createElement('div')
  filtersSlot.className = 'library-page__filters-slot'

  const gamesSlot = document.createElement('section')
  gamesSlot.className = 'library-games library-page__games-slot'
  gamesSlot.setAttribute('aria-live', 'polite')

  const paginationSlot = document.createElement('div')
  paginationSlot.className = 'library-page__pagination-slot'

  const showFiltersLoading = (): void => {
    filtersSlot.replaceChildren(
      createApiSkeleton(
        'library-page__filters-skeleton',
        'Loading game filters',
      ),
    )
  }

  const showGamesLoading = (): void => {
    gamesSlot.setAttribute('aria-busy', 'true')
    gamesSlot.setAttribute('aria-label', 'Loading games')
    gamesSlot.replaceChildren(createLibraryGamesSkeleton())
    paginationSlot.replaceChildren()
  }

  const renderFiltersError = (): void => {
    showSnackbar('Unable to load game categories.', 'error')
    filtersSlot.replaceChildren(
      createApiErrorBanner('Unable to load game categories.', () => {
        void loadFilters(true)
      }),
    )
  }

  const renderGamesError = (state: LibraryState): void => {
    gamesSlot.setAttribute('aria-busy', 'false')
    gamesSlot.removeAttribute('aria-label')
    showSnackbar('Unable to load games.', 'error')
    gamesSlot.replaceChildren(
      createApiErrorBanner('Unable to load games.', () => {
        void loadGames(state, true)
      }),
    )
  }

  const loadGames = async (
    state: LibraryState,
    isRetry = false,
  ): Promise<void> => {
    showGamesLoading()

    try {
      const response = await getGames({
        page: state.page,
        limit: 6,
        category: state.category,
        sort: state.sort,
      })

      if (!page.isConnected) return

      const games = createLibraryGames(response.data)
      const hasGames = response.data.length > 0

      const pagination = createLibraryPagination({
        currentPage: hasGames ? response.meta.page : 1,
        totalPages: hasGames ? response.meta.totalPages : 1,

        onPageChange: (pageNumber) => {
          navigateToLibraryState({
            ...state,
            page: pageNumber,
          })
        },
      })

      gamesSlot.setAttribute('aria-busy', 'false')
      gamesSlot.removeAttribute('aria-label')
      gamesSlot.replaceChildren(...games.childNodes)
      paginationSlot.replaceChildren(pagination)

      if (isRetry) {
        showSnackbar('Games loaded successfully.', 'success')
      }
    } catch {
      if (!page.isConnected) return
      renderGamesError(state)
    }
  }

  const loadFilters = async (isRetry = false): Promise<void> => {
    showFiltersLoading()

    try {
      const response = await getCategories()

      if (!page.isConnected) return

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

      filtersSlot.replaceChildren(filters)
      void loadGames(state)

      if (isRetry) {
        showSnackbar('Game categories loaded successfully.', 'success')
      }
    } catch {
      if (!page.isConnected) return
      renderFiltersError()
    }
  }

  page.append(createLibraryIntro(), filtersSlot, gamesSlot, paginationSlot)

  void loadFilters()

  return page
}
