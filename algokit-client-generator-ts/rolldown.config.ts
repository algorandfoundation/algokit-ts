import createConfig from '../tooling/rolldown'
import pkg from './package.json' with { type: 'json' }

export default createConfig(pkg, ['src/index.ts', 'src/cli.ts'])
