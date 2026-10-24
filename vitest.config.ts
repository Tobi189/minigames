import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/api/types.ts',
        'src/**/*.d.ts',
        'src/config/firebase.ts',
        'src/main.ts',
      ],
    },
  },
})
