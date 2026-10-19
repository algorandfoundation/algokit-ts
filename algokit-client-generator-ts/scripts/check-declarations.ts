import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const outputFolder = join('.', 'dist')
const packageJson = JSON.parse(readFileSync(join(outputFolder, 'package.json'), 'utf-8'))

if (typeof packageJson.types !== 'string' || !packageJson.types) {
  throw new Error('dist/package.json must specify a types entry')
}

const declarationPath = join(outputFolder, packageJson.types)
if (!statSync(declarationPath, { throwIfNoEntry: false })?.isFile()) {
  throw new Error(`Missing declaration entry: ${declarationPath}`)
}
