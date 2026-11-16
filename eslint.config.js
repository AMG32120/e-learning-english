/* ESLint 扁平配置：Vue 3 必检规则 + 最小干扰（不含风格类强制） */
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'

export default [
  { ignores: ['dist/**', 'node_modules/**', 'tests/shots/**', 'tests/smoke.bundle.cjs'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        Event: 'readonly',
        CustomEvent: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        FileReader: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        TextEncoder: 'readonly',
        crypto: 'readonly',
        navigator: 'readonly',
        SpeechSynthesisUtterance: 'readonly',
        speechSynthesis: 'readonly',
        fetch: 'readonly',
        AbortController: 'readonly',
        MediaRecorder: 'readonly',
        Audio: 'readonly',
        AudioContext: 'readonly',
        alert: 'readonly',
        require: 'readonly',
        process: 'readonly',
        console: 'readonly',
        module: 'readonly',
        globalThis: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'vue/multi-word-component-names': 'off'
    }
  },
  {
    files: ['scripts/**'],
    languageOptions: {
      globals: {
        Buffer: 'readonly'
      }
    }
  },
  {
    files: ['tests/**'],
    languageOptions: {
      globals: {
        Event: 'readonly',
        CustomEvent: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        __dirname: 'readonly',
        require: 'readonly',
        module: 'readonly',
        process: 'readonly',
        console: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'off'
    }
  }
]
