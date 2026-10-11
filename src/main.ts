import '@fontsource-variable/inter'
import '@fontsource-variable/roboto'
import './styles/main.scss'
import { createApp } from './app'
import './config/firebase'

document.body.append(createApp())
