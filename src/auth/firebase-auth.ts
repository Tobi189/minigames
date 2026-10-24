import { FirebaseError } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'

import { firebaseAuth } from '../config/firebase'
import type { AppSessionProfile } from './app-session'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

const createSessionProfile = (
  user: User,
  displayNameOverride?: string,
): AppSessionProfile => {
  if (!user.email) {
    throw new Error('Firebase did not return an email address.')
  }

  const profile: AppSessionProfile = {
    displayName: displayNameOverride ?? user.displayName?.trim() ?? '',
    email: user.email,
  }

  const avatarUrl = user.photoURL?.trim()

  if (avatarUrl) {
    profile.avatarUrl = avatarUrl
  }

  return profile
}

export const loginWithEmail = async (
  email: string,
  password: string,
): Promise<AppSessionProfile> => {
  const credential = await signInWithEmailAndPassword(
    firebaseAuth,
    email.trim(),
    password,
  )

  return createSessionProfile(credential.user)
}

export const registerWithEmail = async (
  username: string,
  email: string,
  password: string,
): Promise<AppSessionProfile> => {
  const displayName = username.trim()
  const credential = await createUserWithEmailAndPassword(
    firebaseAuth,
    email.trim(),
    password,
  )

  try {
    await updateProfile(credential.user, { displayName })
  } catch (error) {
    await signOut(firebaseAuth).catch(() => undefined)
    throw error
  }

  return createSessionProfile(credential.user, displayName)
}

export const loginWithGoogle = async (): Promise<AppSessionProfile> => {
  const credential = await signInWithPopup(firebaseAuth, googleProvider)
  return createSessionProfile(credential.user)
}

export const getAuthenticationErrorMessage = (error: unknown): string => {
  if (!(error instanceof FirebaseError)) {
    return 'Authentication failed. Please try again.'
  }

  const messages: Partial<Record<string, string>> = {
    'auth/email-already-in-use': 'An account already uses this email address.',
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/network-request-failed':
      'A network error interrupted authentication. Please try again.',
    'auth/operation-not-allowed':
      'This authentication method is currently unavailable.',
    'auth/popup-blocked':
      'The Google sign-in popup was blocked by the browser.',
    'auth/popup-closed-by-user': 'Google sign-in was canceled.',
    'auth/too-many-requests':
      'Too many attempts were made. Please wait and try again.',
    'auth/unauthorized-domain':
      'This domain is not authorized for Google sign-in.',
    'auth/weak-password': 'Choose a stronger password.',
  }

  return messages[error.code] ?? 'Authentication failed. Please try again.'
}
