import type { Game } from '../../types/game'
import './game-modal.scss'

export const createGameModal = (game: Game): HTMLElement => {
  const overlay = document.createElement('div')
  overlay.className = 'game-modal-overlay'

  const modal = document.createElement('div')
  modal.className = 'game-modal'

  // Header Banner
  const header = document.createElement('div')
  header.className = 'game-modal__header'
  header.style.backgroundImage = `url(${game.bannerImage})`

  const closeBtn = document.createElement('button')
  closeBtn.className = 'game-modal__close'
  closeBtn.innerHTML = '&#x2715;'
  closeBtn.onclick = (): void => overlay.remove()

  header.append(closeBtn)

  // Body Content
  const body = document.createElement('div')
  body.className = 'game-modal__body'

  // Title & Rating
  const title = document.createElement('h2')
  title.className = 'game-modal__title'
  title.textContent = game.title

  const meta = document.createElement('div')
  meta.className = 'game-modal__meta'
  meta.innerHTML = `<span>★ ${game.rating}</span> <span>♥ ${game.likes}</span>`

  // Description
  const desc = document.createElement('p')
  desc.className = 'game-modal__desc'
  desc.textContent = game.description

  // Stats Grid
  const stats = document.createElement('div')
  stats.className = 'game-modal__stats'
  stats.innerHTML = `
    <div class="stat-box"><span class="label">Genre</span><strong>${game.genre}</strong></div>
    <div class="stat-box"><span class="label">Players</span><strong>${game.players}</strong></div>
    <div class="stat-box"><span class="label">Duration</span><strong>${game.duration}</strong></div>
    <div class="stat-box"><span class="label">Price</span><strong>${game.price}</strong></div>
  `

  // Actions
  const actions = document.createElement('div')
  actions.className = 'game-modal__actions'
  actions.innerHTML = `
    <button class="btn btn--primary">Play Now</button>
    <button class="btn btn--outline">♡ Add to Favorites</button>
  `

  // High Scores / Top Records
  const recordsSection = document.createElement('div')
  recordsSection.className = 'game-modal__section'
  recordsSection.innerHTML = `<h3>🏆 Top Records</h3>`
  const recordsList = document.createElement('ul')
  recordsList.className = 'game-modal__records'
  game.records.forEach((r): void => {
    const li = document.createElement('li')
    li.innerHTML = `<span><strong>${r.username}</strong></span><span>${r.score}</span>`
    recordsList.append(li)
  })
  recordsSection.append(recordsList)

  // Comments Section
  const commentsSection = document.createElement('div')
  commentsSection.className = 'game-modal__section'
  commentsSection.innerHTML = `<h3>Comments (${game.comments.length})</h3>`

  const commentInputGroup = document.createElement('div')
  commentInputGroup.className = 'game-modal__comment-input'
  commentInputGroup.innerHTML = `
    <input type="text" placeholder="Write a comment..." />
    <button class="btn btn--send">➔</button>
  `

  const commentsList = document.createElement('div')
  commentsList.className = 'game-modal__comments-list'
  game.comments.forEach((c): void => {
    const item = document.createElement('div')
    item.className = 'comment-item'
    item.innerHTML = `
      <div class="comment-item__avatar">${c.avatar}</div>
      <div class="comment-item__content">
        <div class="comment-item__header"><strong>${c.username}</strong> <small>${c.timeAgo}</small></div>
        <p>${c.text}</p>
      </div>
    `
    commentsList.append(item)
  })

  commentsSection.append(commentInputGroup, commentsList)

  body.append(
    title,
    meta,
    desc,
    stats,
    actions,
    recordsSection,
    commentsSection,
  )
  modal.append(header, body)
  overlay.append(modal)

  // Close when clicking outside content
  overlay.onclick = (e: MouseEvent): void => {
    if (e.target === overlay) overlay.remove()
  }

  return overlay
}
