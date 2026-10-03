import type { ApiGameCategoryFilter, ApiGameSort } from '../../api/types'
import { navigate } from '../../app/router'

export interface LibraryState {
  category: ApiGameCategoryFilter
  sort: ApiGameSort
  page: number
}

export const getLibraryState = (
  defaultCategory: ApiGameCategoryFilter,
): LibraryState => {
  const searchParams = new URLSearchParams(window.location.search)

  const categoryParameter = searchParams.get('category')
  const sortParameter = searchParams.get('sort')
  const pageParameter = Number(searchParams.get('page'))

  const validCategories: ApiGameCategoryFilter[] = [
    'all',
    'puzzle',
    'card',
    'match',
    'farm',
    'strategy',
    'arcade',
  ]

  const validSorts: ApiGameSort[] = [
    'rating-desc',
    'rating-asc',
    'name-asc',
    'name-desc',
  ]

  const category =
    validCategories.find((item) => item === categoryParameter) ??
    defaultCategory

  const sort =
    validSorts.find((item) => item === sortParameter) ?? 'rating-desc'

  const page =
    Number.isInteger(pageParameter) && pageParameter > 0 ? pageParameter : 1

  return {
    category,
    sort,
    page,
  }
}

export const navigateToLibraryState = (state: LibraryState): void => {
  const searchParams = new URLSearchParams({
    category: state.category,
    sort: state.sort,
    page: state.page.toString(),
  })

  navigate(`/library?${searchParams.toString()}`)
}
