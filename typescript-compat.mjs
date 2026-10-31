/**
 * TypeScript 7 is the native (Go) compiler and no longer ships the JavaScript compiler API.
 * typescript-eslint, ts-api-utils and @eslint-react all `import 'typescript'` and expect that API,
 * so in a project that installs `typescript@7` they crash while the config is being loaded.
 *
 * This registers a synchronous module resolution hook that redirects `typescript` and `typescript/lib/*`
 * to the TypeScript 6 API published by Microsoft as `@typescript/typescript6`, but only when the regular
 * resolution fails or lands on a TypeScript 7+ package. Anything resolving to TypeScript <= 6 is untouched,
 * as are TypeScript 7's own entry points such as `typescript/unstable/*` and `typescript/package.json`.
 */
import module from 'node:module'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'


const TYPESCRIPT_API_SPECIFIER = /^typescript(?:\/lib\/.+)?$/
const FIRST_NATIVE_MAJOR       = 7
const packageMajors            = new Map()
const requireFromHere          = module.createRequire(import.meta.url)

let registered = false


function typescriptMajorAt (url) {
  if (!url.startsWith('file:'))
    return null

  const packageJsonPath = module.findPackageJSON(url)

  if (!packageJsonPath)
    return null

  if (!packageMajors.has(packageJsonPath)) {
    const { name, version } = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    packageMajors.set(packageJsonPath, name === 'typescript' ? Number.parseInt(version, 10) : null)
  }

  return packageMajors.get(packageJsonPath)
}

function resolveTypescript6 (specifier) {
  const typescript6 = requireFromHere.resolve('@typescript/typescript6')

  if (specifier === 'typescript')
    return typescript6

  // `@typescript/typescript6` re-exports the real TypeScript 6 package, installed under this alias
  const requireFromTypescript6 = module.createRequire(typescript6)
  return requireFromTypescript6.resolve(specifier.replace(/^typescript/, '@typescript/old'))
}

function redirect (specifier) {
  try {
    return { url: pathToFileURL(resolveTypescript6(specifier)).href, shortCircuit: true }
  }
  catch {
    return null
  }
}

function resolve (specifier, context, nextResolve) {
  if (!TYPESCRIPT_API_SPECIFIER.test(specifier))
    return nextResolve(specifier, context)

  let resolved

  try {
    resolved = nextResolve(specifier, context)
  }
  catch (error) {
    // Not installed, or a TypeScript 7 subpath that is not exported (e.g. `typescript/lib/tsserverlibrary`)
    const fallback = redirect(specifier)

    if (fallback)
      return fallback

    throw error
  }

  const major = typescriptMajorAt(resolved.url)

  if (major === null || major < FIRST_NATIVE_MAJOR)
    return resolved

  return redirect(specifier) ?? resolved
}


/**
 * Registers the resolution hook once per process. No-op on runtimes without `module.registerHooks`
 * (Node < 22.15), where `typescript` must resolve to a version that typescript-eslint supports.
 */
export function registerTypescriptCompat () {
  if (registered || typeof module.registerHooks !== 'function' || typeof module.findPackageJSON !== 'function')
    return

  module.registerHooks({ resolve })
  registered = true
}
