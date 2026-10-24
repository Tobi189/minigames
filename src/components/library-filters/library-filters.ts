import type {
  ApiCategory,
  ApiGameCategoryFilter,
  ApiGameSort,
} from '../../api/types'
import type { LibraryState } from '../../pages/library/library-state'
import './library-filters.scss'

interface LibraryFiltersOptions {
  categories: ApiCategory[]
  state: LibraryState
  onCategoryChange: (category: ApiGameCategoryFilter) => void
  onSortChange: (sort: ApiGameSort) => void
}

type SortOption = {
  value: ApiGameSort
  label: string
}

const sortOptions: SortOption[] = [
  { value: 'rating-desc', label: 'Sort by: Rating ↓' },
  { value: 'rating-asc', label: 'Sort by: Rating ↑' },
  { value: 'name-asc', label: 'Sort by: Name A→Z' },
  { value: 'name-desc', label: 'Sort by: Name Z→A' },
]

export const createLibraryFilters = ({
  categories,
  state,
  onCategoryChange,
  onSortChange,
}: LibraryFiltersOptions): HTMLElement => {
  const section = document.createElement('section')
  section.className = 'library-filters'
  section.setAttribute('aria-label', 'Game filters')

  const categoryList = document.createElement('div')
  categoryList.className = 'library-filters__categories'
  categoryList.setAttribute('role', 'group')
  categoryList.setAttribute('aria-label', 'Game categories')

  const categoryButtons = categories.map(({ slug, label }) => {
    const button = document.createElement('button')
    const isActive = slug === state.category

    button.type = 'button'
    button.className = 'library-filters__chip'
    button.dataset.category = slug
    button.textContent = label
    button.setAttribute('aria-pressed', String(isActive))

    if (isActive) {
      button.classList.add('library-filters__chip--active')
    }

    button.addEventListener('click', () => {
      onCategoryChange(slug)
    })

    return button
  })

  categoryList.append(...categoryButtons)

  const sort = document.createElement('div')
  sort.className = 'library-filters__sort'

  const sortSelect = document.createElement('select')
  sortSelect.className = 'library-filters__sort-select'

  sortOptions.forEach(({ value, label }) => {
    const option = document.createElement('option')

    option.value = value
    option.textContent = label

    sortSelect.append(option)
  })

  sortSelect.value = state.sort

  sortSelect.addEventListener('change', () => {
    onSortChange(sortSelect.value as ApiGameSort)
  })

  const sortArrow = document.createElement('span')
  sortArrow.className = 'library-filters__sort-arrow'
  sortArrow.textContent = '⌄'
  sortArrow.setAttribute('aria-hidden', 'true')

  sort.append(sortSelect, sortArrow)
  section.append(categoryList, sort)

  return section
}
