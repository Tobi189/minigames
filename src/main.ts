import '@fontsource-variable/inter'
import '@fontsource-variable/roboto'
import './styles/main.scss'
import { createApp } from './app'
import { initializeAppSession } from './auth/app-session'
import './config/firebase'

initializeAppSession()
document.body.append(createApp())
