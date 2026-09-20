import './footer.scss'

import logoUrl from '../../assets/logo.svg'
import chatIcon from '../../assets/chat.png'
import rssIcon from '../../assets/rss_feed.png'
import shareIcon from '../../assets/share.png'
import rsIcon from '../../assets/RS.png'
import codeIcon from '../../assets/code.png'

type NavGroup = {
  title: string
  links: { label: string; href: string }[]
}

const navGroups: NavGroup[] = [
  {
    title: 'Explore',
    links: [
      { label: 'Home', href: '#' },
      { label: 'Library', href: '#' },
      { label: 'Categories', href: '#' },
      { label: 'Tournaments', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Contact', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
    ],
  },
]

export const createFooter = (): HTMLElement => {
  const footer = document.createElement('footer')
  footer.className = 'footer'

  const container = document.createElement('div')
  container.className = 'footer__container'

  // --- Main Top Content ---
  const topRow = document.createElement('div')
  topRow.className = 'footer__top'

  // Left Section: Brand & Description
  const brandSection = document.createElement('div')
  brandSection.className = 'footer__brand-section'

  const brandLink = document.createElement('a')
  brandLink.className = 'footer__brand'
  brandLink.href = '#'

  const logo = document.createElement('img')
  logo.src = logoUrl
  logo.alt = 'MiniGames home'
  logo.className = 'footer__logo'
  brandLink.append(logo)

  const description = document.createElement('p')
  description.className = 'footer__description'
  description.textContent =
    'Take a short break and have fun. Hundreds of curated casual mini-games right in your web browser. No download required.'

  brandSection.append(brandLink, description)

  // Right Section: Navigation Columns & Social Icons
  const navSection = document.createElement('div')
  navSection.className = 'footer__nav-section'

  // Dynamic Navigation Groups (Explore, Company)
  navGroups.forEach((group) => {
    const col = document.createElement('div')
    col.className = 'footer__col'

    const title = document.createElement('h3')
    title.className = 'footer__col-title'
    title.textContent = group.title

    const list = document.createElement('ul')
    list.className = 'footer__list'

    group.links.forEach((linkData) => {
      const item = document.createElement('li')
      const link = document.createElement('a')
      link.className = 'footer__link'
      link.href = linkData.href
      link.textContent = linkData.label
      item.append(link)
      list.append(item)
    })

    col.append(title, list)
    navSection.append(col)
  })

  // Community Column with Social Icons
  const communityCol = document.createElement('div')
  communityCol.className = 'footer__col'

  const communityTitle = document.createElement('h3')
  communityTitle.className = 'footer__col-title'
  communityTitle.textContent = 'Community'

  const socialList = document.createElement('div')
  socialList.className = 'footer__socials'

  const socials = [
    { name: 'Share', icon: shareIcon, href: '#' },
    { name: 'Chat', icon: chatIcon, href: '#' },
    { name: 'RSS Feed', icon: rssIcon, href: '#' },
  ]

  socials.forEach((social) => {
    const link = document.createElement('a')
    link.className = 'footer__social-link'
    link.href = social.href
    link.ariaLabel = social.name

    const img = document.createElement('img')
    img.src = social.icon
    img.alt = social.name
    img.className = 'footer__social-icon'

    link.append(img)
    socialList.append(link)
  })

  communityCol.append(communityTitle, socialList)
  navSection.append(communityCol)

  topRow.append(brandSection, navSection)

  // --- Bottom Sub-Footer Bar ---
  const bottomRow = document.createElement('div')
  bottomRow.className = 'footer__bottom'

  const copyright = document.createElement('p')
  copyright.className = 'footer__copyright'
  copyright.textContent = '© 2026 MiniGames. All rights reserved.'

  const schoolLink = document.createElement('a')
  schoolLink.className = 'footer__badge-link'
  schoolLink.href = 'https://rs.school'
  schoolLink.target = '_blank'
  schoolLink.rel = 'noopener noreferrer'

  const schoolIcon = document.createElement('img')
  schoolIcon.src = rsIcon
  schoolIcon.alt = 'RS School'
  schoolIcon.className = 'footer__badge-icon'

  const schoolText = document.createElement('span')
  schoolText.textContent = 'RS School'
  schoolLink.append(schoolIcon, schoolText)

  const sourceLink = document.createElement('a')
  sourceLink.className = 'footer__badge-link'
  sourceLink.href = '#'

  const sourceIcon = document.createElement('img')
  sourceIcon.src = codeIcon
  sourceIcon.alt = 'Source Code'
  sourceIcon.className = 'footer__badge-icon'

  const sourceText = document.createElement('span')
  sourceText.textContent = 'Documentation / Code'
  sourceLink.append(sourceIcon, sourceText)

  const designerCredit = document.createElement('p')
  designerCredit.className = 'footer__credit'
  designerCredit.textContent = 'Designed with love'

  bottomRow.append(copyright, schoolLink, sourceLink, designerCredit)

  container.append(topRow, bottomRow)
  footer.append(container)

  return footer
}
