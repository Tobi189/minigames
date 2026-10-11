import { describe, expect, it } from 'vitest'
import {
  isAuthFormValid,
  validateAuthField,
  validateAuthForm,
  type AuthFormValues,
} from '../src/auth/auth-validation'

const validValues: AuthFormValues = {
  username: 'Player1',
  email: 'player@example.com',
  password: 'Password1!',
  confirmPassword: 'Password1!',
}

describe('authentication validation', (): void => {
  describe('login', (): void => {
    it('accepts valid login credentials', (): void => {
      expect(validateAuthForm('login', validValues)).toEqual({})
      expect(isAuthFormValid('login', validValues)).toBe(true)
    })

    it.each([
      ['', 'Email is required.'],
      ['player-at-example.com', 'Enter a valid email address.'],
    ])('rejects invalid email %j', (email, expected): void => {
      expect(
        validateAuthField('login', 'email', { ...validValues, email }),
      ).toBe(expected)
    })

    it.each([
      ['', 'Password is required.'],
      ['12345', 'Password must contain at least 6 characters.'],
    ])('rejects invalid password %j', (password, expected): void => {
      expect(
        validateAuthField('login', 'password', {
          ...validValues,
          password,
        }),
      ).toBe(expected)
    })

    it('ignores registration-only fields', (): void => {
      expect(validateAuthField('login', 'username', validValues)).toBeNull()
      expect(
        validateAuthField('login', 'confirmPassword', validValues),
      ).toBeNull()
    })
  })

  describe('registration', (): void => {
    it.each([
      ['', 'Username is required.'],
      ['A', 'Username must contain 2–30 characters.'],
      ['A'.repeat(31), 'Username must contain 2–30 characters.'],
      ['player1', 'Username must start with an uppercase English letter.'],
      ['Player_1', 'Use English letters and digits only.'],
    ])('rejects invalid username %j', (username, expected): void => {
      expect(
        validateAuthField('register', 'username', {
          ...validValues,
          username,
        }),
      ).toBe(expected)
    })

    it.each([
      [
        'парольA1!',
        'Use English letters, digits, and special characters only.',
      ],
      ['password1!', 'Include at least one uppercase English letter.'],
      ['Password!', 'Include at least one digit.'],
      ['Password1', 'Include at least one special character.'],
    ])('rejects weak password %j', (password, expected): void => {
      expect(
        validateAuthField('register', 'password', {
          ...validValues,
          password,
        }),
      ).toBe(expected)
    })

    it.each([
      ['', 'Please confirm your password.'],
      ['Different1!', 'Passwords do not match.'],
    ])('rejects invalid confirmation %j', (confirmPassword, expected): void => {
      expect(
        validateAuthField('register', 'confirmPassword', {
          ...validValues,
          confirmPassword,
        }),
      ).toBe(expected)
    })

    it('returns all invalid fields and accepts a valid form', (): void => {
      expect(
        validateAuthForm('register', {
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        }),
      ).toEqual({
        username: 'Username is required.',
        email: 'Email is required.',
        password: 'Password is required.',
        confirmPassword: 'Please confirm your password.',
      })
      expect(isAuthFormValid('register', validValues)).toBe(true)
    })
  })
})
