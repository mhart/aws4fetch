import pkg from './package.json' with { type: "json" }
import cleanup from 'rollup-plugin-cleanup'

export default {
  input: 'src/main.js',
  plugins: [
    cleanup(),
  ],
  output: [
    { format: 'es', file: pkg.module },
    { format: 'es', file: pkg.exports['.'].import.default },
    { format: 'cjs', file: pkg.main, esModule: true },
    { format: 'umd', file: pkg.browser, name: pkg.name, esModule: true },
  ],
}
