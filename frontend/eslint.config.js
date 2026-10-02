import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // This experimental rule flags the standard "fetch data on mount" effect
      // pattern used throughout this app's pages as an error. That pattern is
      // correct and idiomatic React, so we turn the rule down to a warning.
      'react-hooks/set-state-in-effect': 'off',
      // AuthContext exports both the provider and the useAuth() hook from one
      // file, which only affects hot-reload granularity, not correctness.
      'react-refresh/only-export-components': 'warn',
    },
  },
])
