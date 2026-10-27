import eslint from '@eslint/js'
import prettier from 'eslint-config-prettier'
import unusedImports from 'eslint-plugin-unused-imports'
import tseslint from 'typescript-eslint'

export const baseIgnores = [
  'node_modules/**',
  'dist/**',
  'build/**',
  'coverage/**',
  '**/*.d.ts',
  '**/generated/types.ts',
  '.idea/**',
  '.vscode/**',
]

// Shared lint setup for the packages. A package's extra config objects apply after the shared rules (so they can
// override them) and before `eslint-config-prettier`, which must come last.
export default function config(...extra) {
  return tseslint.config(
    { ignores: baseIgnores },
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
      files: ['**/*.ts'],
      plugins: {
        'unused-imports': unusedImports,
      },
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          projectService: true,
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
      },
      rules: {
        'no-console': 'warn',
        '@typescript-eslint/no-unused-vars': 'off', // Disable base rule as it's covered by unused-imports
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
          'warn',
          { ignoreRestSiblings: true, argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/no-unused-expressions': 'off',
        'prefer-template': 'error',
      },
    },
    // Test file overrides
    {
      files: ['**/*.spec.ts'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
    ...extra,
    prettier,
  )
}
