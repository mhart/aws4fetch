module.exports = {
  extends: 'standard',
  rules: {
    'space-before-function-paren': ['error', 'never'],
    'comma-dangle': ['error', 'always-multiline'],
  },
  env: {
    browser: true,
  },
  ignorePatterns: ['dist', 'example/worker.js'],
}
