/* ESLint 扁平配置：Vue 3 必检规则 + 最小干扰（不含风格类强制） */
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'

export default [
  { ignores: ['dist/**', 'node_modules/**', 'tests/shots/**', 'tests/smoke.bundle.cjs'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['scripts/**'],
    languageOptions: {
      globals: { Buffer: 'readonly', process: 'readonly', console: 'readonly' }
    }
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        CustomEvent: 'readonly',
        FileReader: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        TextEncoder: 'readonly',
        crypto: 'readonly',
        navigator: 'readonly',
        SpeechSynthesisUtterance: 'readonly',
        speechSynthesis: 'readonly',
        setTimeout: 'readonly',
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
    files: ['tests/**'],
    languageOptions: {
      globals: { __dirname: 'readonly', require: 'readonly', module: 'readonly', process: 'readonly', console: 'readonly' }
    },
    rules: {
      'no-unused-vars': 'off'
    }
  }
]
