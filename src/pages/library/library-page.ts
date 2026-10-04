import { getCategories } from '../../api/categories'
import { createLibraryFilters } from '../../components/library-filters/library-filters'
import { createLibraryGames } from '../../components/library-games/library-games'
import { createLibraryIntro } from '../../components/library-intro/library-intro'
import { createLibraryPagination } from '../../components/library-pagination/library-pagination'
import { getLibraryState, navigateToLibraryState } from './library-state'

export const createLibraryPage = (): HTMLElement => {
  const page = document.createElement('div')
  page.className = 'library-page'

  const filtersStatus = document.createElement('section')
  filtersStatus.className = 'library-filters-status'
  filtersStatus.textContent = 'Loading filters…'

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
    } catch {
      renderFiltersError()
    }
  }

  page.append(
    createLibraryIntro(),
    filtersStatus,
    createLibraryGames(),
    createLibraryPagination(),
  )

  void loadFilters()

  return page
}
