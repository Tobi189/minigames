import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyACVx4MLs9GbDNshpHpFqcv8WMECx5KF3M',
  authDomain: 'minigames-1098d.firebaseapp.com',
  projectId: 'minigames-1098d',
  storageBucket: 'minigames-1098d.firebasestorage.app',
  messagingSenderId: '618573776591',
  appId: '1:618573776591:web:ea04896602739e4ab759ba',
}

const firebaseApp = initializeApp(firebaseConfig)

export const firebaseAuth = getAuth(firebaseApp)
