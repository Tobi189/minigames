export type AuthMode = 'login' | 'register'

export type AuthField = 'username' | 'email' | 'password' | 'confirmPassword'

export interface AuthFormValues {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export type AuthFormErrors = Partial<Record<AuthField, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_PATTERN = /^[A-Za-z0-9]+$/
const PASSWORD_ALLOWED_PATTERN = /^[\x21-\x7e]+$/
const UPPERCASE_PATTERN = /[A-Z]/
const DIGIT_PATTERN = /\d/
const SPECIAL_CHARACTER_PATTERN = /[^A-Za-z0-9]/

const validateEmail = (value: string): string | null => {
  const email = value.trim()

  if (email === '') return 'Email is required.'
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.'

  return null
}

const validateUsername = (value: string): string | null => {
  const username = value.trim()

  if (username === '') return 'Username is required.'
  if (username.length < 2 || username.length > 30) {
    return 'Username must contain 2–30 characters.'
  }
  if (!/^[A-Z]/.test(username)) {
    return 'Username must start with an uppercase English letter.'
  }
  if (!USERNAME_PATTERN.test(username)) {
    return 'Use English letters and digits only.'
  }

  return null
}

const validateLoginPassword = (value: string): string | null => {
  if (value === '') return 'Password is required.'
  if (value.length < 6) return 'Password must contain at least 6 characters.'

  return null
}

const validateRegistrationPassword = (value: string): string | null => {
  const basicError = validateLoginPassword(value)

  if (basicError) return basicError
  if (!PASSWORD_ALLOWED_PATTERN.test(value)) {
    return 'Use English letters, digits, and special characters only.'
  }
  if (!UPPERCASE_PATTERN.test(value)) {
    return 'Include at least one uppercase English letter.'
  }
  if (!DIGIT_PATTERN.test(value)) return 'Include at least one digit.'
  if (!SPECIAL_CHARACTER_PATTERN.test(value)) {
    return 'Include at least one special character.'
  }

  return null
}

const validateConfirmPassword = (
  value: string,
  password: string,
): string | null => {
  if (value === '') return 'Please confirm your password.'
  if (value !== password) return 'Passwords do not match.'

  return null
}

export const validateAuthField = (
  mode: AuthMode,
  field: AuthField,
  values: AuthFormValues,
): string | null => {
  if (field === 'email') return validateEmail(values.email)
  if (field === 'password') {
    return mode === 'login'
      ? validateLoginPassword(values.password)
      : validateRegistrationPassword(values.password)
  }

  if (mode === 'register' && field === 'username') {
    return validateUsername(values.username)
  }

  if (mode === 'register' && field === 'confirmPassword') {
    return validateConfirmPassword(values.confirmPassword, values.password)
  }

  return null
}

export const validateAuthForm = (
  mode: AuthMode,
  values: AuthFormValues,
): AuthFormErrors => {
  const fields: AuthField[] =
    mode === 'login'
      ? ['email', 'password']
      : ['username', 'email', 'password', 'confirmPassword']

  return fields.reduce<AuthFormErrors>((errors, field) => {
    const error = validateAuthField(mode, field, values)

    if (error) errors[field] = error

    return errors
  }, {})
}

export const isAuthFormValid = (
  mode: AuthMode,
  values: AuthFormValues,
): boolean => Object.keys(validateAuthForm(mode, values)).length === 0
