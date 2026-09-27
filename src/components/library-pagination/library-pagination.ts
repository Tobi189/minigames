import './library-pagination.scss'

const TOTAL_PAGES = 4
const MOBILE_QUERY = '(max-width: 480px)'

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

export const createLibraryPagination = (): HTMLElement => {
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

  let activePage = 1

  const pageButtons = Array.from(
    { length: TOTAL_PAGES },
    (_, index): HTMLButtonElement => {
      const page = index + 1
      const button = createControlButton(
        'library-pagination__button library-pagination__page',
        `Page ${page}`,
        page.toString(),
      )

      button.addEventListener('click', () => {
        activePage = page
        updatePagination()
      })

      return button
    },
  )

  const updatePagination = (): void => {
    const maximumVisiblePages = window.matchMedia(MOBILE_QUERY).matches ? 3 : 4

    const maximumStartPage = TOTAL_PAGES - maximumVisiblePages + 1
    const startPage = Math.min(Math.max(activePage - 1, 1), maximumStartPage)
    const endPage = startPage + maximumVisiblePages - 1

    previousButton.disabled = activePage === 1
    nextButton.disabled = activePage === TOTAL_PAGES

    pageButtons.forEach((button, index) => {
      const page = index + 1
      const isActive = page === activePage

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
    if (activePage > 1) {
      activePage -= 1
      updatePagination()
    }
  })

  nextButton.addEventListener('click', () => {
    if (activePage < TOTAL_PAGES) {
      activePage += 1
      updatePagination()
    }
  })

  const mobileQuery = window.matchMedia(MOBILE_QUERY)
  mobileQuery.addEventListener('change', updatePagination)

  controls.append(previousButton, ...pageButtons, nextButton)
  pagination.append(controls)

  updatePagination()

  return pagination
}
