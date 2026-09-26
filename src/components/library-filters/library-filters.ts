import './library-filters.scss'

type Category = {
  slug: string
  label: string
}

const categories: Category[] = [
  { slug: 'all', label: 'All Games' },
  { slug: 'puzzle', label: 'Puzzle' },
  { slug: 'card', label: 'Card' },
  { slug: 'match', label: 'Match' },
  { slug: 'farm', label: 'Farm' },
  { slug: 'strategy', label: 'Strategy' },
  { slug: 'arcade', label: 'Arcade' },
]

export const createLibraryFilters = (): HTMLElement => {
  const section = document.createElement('section')
  section.className = 'library-filters'
  section.setAttribute('aria-label', 'Game filters')

  const categoryList = document.createElement('div')
  categoryList.className = 'library-filters__categories'
  categoryList.setAttribute('role', 'group')
  categoryList.setAttribute('aria-label', 'Game categories')

  const categoryButtons = categories.map(({ slug, label }) => {
    const button = document.createElement('button')
    const isActive = slug === 'all'

    button.type = 'button'
    button.className = 'library-filters__chip'
    button.dataset.category = slug
    button.textContent = label
    button.setAttribute('aria-pressed', String(isActive))

    if (isActive) {
      button.classList.add('library-filters__chip--active')
    }

    button.addEventListener('click', () => {
      categoryButtons.forEach((categoryButton) => {
        const shouldBeActive = categoryButton === button

        categoryButton.classList.toggle(
          'library-filters__chip--active',
          shouldBeActive,
        )
        categoryButton.setAttribute('aria-pressed', String(shouldBeActive))
      })
    })

    return button
  })

  categoryList.append(...categoryButtons)
  section.append(categoryList)

  return section
}
