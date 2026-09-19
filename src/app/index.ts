import { createHeader } from '../components/header/header'
import { createHomePage } from '../pages/home/home-page'

export const createApp = (): HTMLElement => {
  const app = document.createElement('div')

  app.id = 'app'
  app.append(createHeader(), createHomePage())

  return app
}
