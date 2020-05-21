import pkg from './package.json'
import cleanup from 'rollup-plugin-cleanup'

export default {
  input: 'src/main.js',
  plugins: [
    cleanup(),
  ],
  output: [
    { format: 'es', file: pkg.module },
    { format: 'cjs', file: pkg.main },
    { format: 'umd', file: pkg.browser, name: pkg.name },
  ],
}
