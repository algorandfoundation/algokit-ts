import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'

const pick = <T extends object, U extends keyof T>(object: T, ...props: U[]): Partial<T> => {
  return Object.entries(object).reduce<Partial<T>>((acc, [key, value]) => {
    if (props.includes(key as U)) acc[key as U] = value
    return acc
  }, {})
}

const standardSectionWhitelist = [
  'name',
  'version',
  'description',
  'keywords',
  'homepage',
  'bugs',
  'license',
  'author',
  'contributors',
  'funding',
  'browser',
  'bin',
  'man',
  'directories',
  'repository',
  'config',
  'dependencies',
  'peerDependencies',
  'peerDependenciesMeta',
  'bundleDependencies',
  'optionalDependencies',
  'overrides',
  'engines',
  'os',
  'cpu',
  'private',
  'publishConfig',
]

const inputFolder = '.'
const outputFolder = join('.', 'dist')
const main = 'index.js'
const types = 'index.d.ts'
const customSections = ['module', 'main', 'type', 'types', 'exports']

const packageJson = JSON.parse(readFileSync(join(inputFolder, 'package.json'), 'utf-8'))

// Releases publish with `npm publish`, which (unlike `pnpm publish`) doesn't replace pnpm's `catalog:` and `workspace:`
// protocols, so resolve catalog versions from the workspace here and refuse to emit anything npm consumers can't install
const workspace = parse(readFileSync(join(inputFolder, '..', 'pnpm-workspace.yaml'), 'utf-8'))
for (const section of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
  for (const [name, spec] of Object.entries<string>(packageJson[section] ?? {})) {
    if (spec.startsWith('catalog:')) {
      const catalogName = spec.slice('catalog:'.length) || 'default'
      const catalog = catalogName === 'default' ? (workspace.catalog ?? workspace.catalogs?.default) : workspace.catalogs?.[catalogName]
      const version = catalog?.[name]
      if (!version) throw new Error(`${section}.${name}: no entry in the '${catalogName}' catalog of pnpm-workspace.yaml`)
      packageJson[section][name] = version
    } else if (spec.startsWith('workspace:')) {
      throw new Error(`${section}.${name}: '${spec}' can't be published with npm; use a version range`)
    }
  }
}
// `directory` and `linkDirectory` only tell pnpm to link workspace dependents to dist/, so they aren't published
delete packageJson.publishConfig?.directory
delete packageJson.publishConfig?.linkDirectory
if (packageJson.publishConfig && Object.keys(packageJson.publishConfig).length === 0) delete packageJson.publishConfig
const sectionsToUse = [...standardSectionWhitelist, ...customSections]
const output = { main, types, scripts: {}, files: ['**'], ...pick(packageJson, ...(sectionsToUse as (keyof typeof packageJson)[])) }
writeFileSync(join(outputFolder, 'package.json'), `${JSON.stringify(output, undefined, 2)}\n`, 'utf-8')
