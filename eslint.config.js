import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import prettier from '@vue/eslint-config-prettier'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  prettier,
  // Configuration for TypeScript files
  {
    files: ['**/*.ts'],
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.min.js', '.husky/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: typescriptParser,
      globals: {
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Date: 'readonly',
        Math: 'readonly',
        window: 'readonly',
        document: 'readonly',
        HTMLElement: 'readonly',
        HTMLButtonElement: 'readonly',
        KeyboardEvent: 'readonly',
        NodeListOf: 'readonly',
        AudioContext: 'readonly',
        OscillatorType: 'readonly',
        performance: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      // JavaScript rules
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',

      // TypeScript rules
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-inferrable-types': 'error',

      // Code style - disabled rules handled by Prettier
      indent: 'off',
      quotes: 'off',
      semi: 'off'
    }
  },
  // Configuration for test files
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/test/**/*.ts'],
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.min.js', '.husky/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: typescriptParser,
      globals: {
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Date: 'readonly',
        Math: 'readonly',
        window: 'readonly',
        document: 'readonly',
        HTMLElement: 'readonly',
        HTMLButtonElement: 'readonly',
        KeyboardEvent: 'readonly',
        NodeListOf: 'readonly',
        AudioContext: 'readonly',
        OscillatorType: 'readonly',
        performance: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      // Allow any in test files for mocking
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error'
    }
  },
  // Configuration for Vue files
  {
    files: ['**/*.vue'],
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.min.js', '.husky/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        parser: typescriptParser,
        extraFileExtensions: ['.vue']
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Date: 'readonly',
        Math: 'readonly',
        window: 'readonly',
        document: 'readonly',
        HTMLElement: 'readonly',
        HTMLButtonElement: 'readonly',
        KeyboardEvent: 'readonly',
        NodeListOf: 'readonly',
        AudioContext: 'readonly',
        OscillatorType: 'readonly',
        performance: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      // Vue specific rules
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'error',

      // JavaScript rules
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',

      // TypeScript rules
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // Allow any in Vue components due to Vuex integration
      '@typescript-eslint/no-inferrable-types': 'error',

      // Code style - disabled rules handled by Prettier
      indent: 'off',
      quotes: 'off',
      semi: 'off'
    }
  }
]
