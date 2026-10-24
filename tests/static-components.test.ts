// @vitest-environment happy-dom

import { describe, expect, it, vi } from 'vitest'

vi.mock('../src/components/new-games/new-games', () => ({
  createNewGames: () =>
    Object.assign(document.createElement('section'), { id: 'new-games' }),
}))
vi.mock('../src/components/top-players/top-players', () => ({
  createTopPlayers: () =>
    Object.assign(document.createElement('section'), { id: 'top-players' }),
}))

describe('static application components', () => {
  it('creates the hero, developer CTA, footer and library intro', async () => {
    const [
      { createHero },
      { createDeveloperCta },
      { createFooter },
      { createLibraryIntro },
    ] = await Promise.all([
      import('../src/pages/home/hero/hero'),
      import('../src/components/developer-cta/developer-cta'),
      import('../src/components/footer/footer'),
      import('../src/components/library-intro/library-intro'),
    ])

    expect(createHero().textContent).toContain('Take a Short Break')
    expect(createDeveloperCta().textContent).toContain('Game Developer')
    const footer = createFooter()
    expect(footer.querySelectorAll('.footer__col')).toHaveLength(3)
    expect(
      footer.querySelector<HTMLAnchorElement>('a[href*="Tobi189"]')?.href,
    ).toContain('github.com/Tobi189')
    expect(createLibraryIntro().textContent).toContain('Game Library')
  })

  it('creates home and not-found pages', async () => {
    const [{ createHomePage }, { createNotFoundPage }] = await Promise.all([
      import('../src/pages/home/home-page'),
      import('../src/pages/not-found/not-found-page'),
    ])
    expect(createHomePage().children).toHaveLength(4)
    expect(createNotFoundPage().textContent).toContain('Page Not Found')
  })
})
