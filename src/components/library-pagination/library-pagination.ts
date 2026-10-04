import './library-pagination.scss'

const MOBILE_QUERY = '(max-width: 480px)'

interface LibraryPaginationOptions {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const createControlButton = (
  className: string,
  label: string,
  content: string,
): HTMLButtonElement => {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = className
  button.setAttribute('aria-label', label)
  button.textContent = content

  return button
}

export const createLibraryPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: LibraryPaginationOptions): HTMLElement => {
  const pagination = document.createElement('nav')
  pagination.className = 'library-pagination'
  pagination.setAttribute('aria-label', 'Library pages')

  const controls = document.createElement('div')
  controls.className = 'library-pagination__controls'

  const previousButton = createControlButton(
    'library-pagination__button library-pagination__arrow',
    'Previous page',
    '←',
  )

  const nextButton = createControlButton(
    'library-pagination__button library-pagination__arrow',
    'Next page',
    '→',
  )

  const pageCount = Math.max(totalPages, 1)

  const pageButtons = Array.from(
    { length: pageCount },
    (_, index): HTMLButtonElement => {
      const page = index + 1
      const button = createControlButton(
        'library-pagination__button library-pagination__page',
        `Page ${page}`,
        page.toString(),
      )

      button.addEventListener('click', () => {
        if (page !== currentPage) {
          onPageChange(page)
        }
      })

      return button
    },
  )

  const updatePagination = (): void => {
    const maximumVisiblePages = window.matchMedia(MOBILE_QUERY).matches ? 3 : 4
    const visiblePageCount = Math.min(pageCount, maximumVisiblePages)

    const maximumStartPage = pageCount - visiblePageCount + 1
    const startPage = Math.min(Math.max(currentPage - 1, 1), maximumStartPage)
    const endPage = startPage + visiblePageCount - 1

    previousButton.disabled = currentPage <= 1
    nextButton.disabled = currentPage >= pageCount

    pageButtons.forEach((button, index) => {
      const page = index + 1
      const isActive = page === currentPage

      button.hidden = page < startPage || page > endPage
      button.classList.toggle('library-pagination__page--active', isActive)

      if (isActive) {
        button.setAttribute('aria-current', 'page')
      } else {
        button.removeAttribute('aria-current')
      }
    })
  }

  previousButton.addEventListener('click', () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  })

  nextButton.addEventListener('click', () => {
    if (currentPage < pageCount) {
      onPageChange(currentPage + 1)
    }
  })

  const mobileQuery = window.matchMedia(MOBILE_QUERY)
  mobileQuery.addEventListener('change', updatePagination)

  controls.append(previousButton, ...pageButtons, nextButton)
  pagination.append(controls)

  updatePagination()

  return pagination
}
