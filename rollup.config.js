import pkg from './package.json'

export default {
  input: 'src/main.js',
  output: [
    { format: 'es', file: pkg.module },
    { format: 'cjs', file: pkg.main },
    { format: 'umd', file: pkg.browser, name: pkg.name },
  ],
}
