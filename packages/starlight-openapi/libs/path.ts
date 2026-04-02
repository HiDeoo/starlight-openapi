import type { AstroConfig } from 'astro'
import { slug } from 'github-slugger'

import type { StarlightOpenAPISchemaConfig } from './schema'
import type { StarlightOpenAPIContext } from './vite'

export { slug } from 'github-slugger'

const astroBase = stripTrailingSlash(import.meta.env.BASE_URL)
const htmlExt = '.html'

const trailingSlashTransformers: Record<AstroConfig['trailingSlash'], TrailingSlashTransformer> = {
  always: ensureTrailingSlash,
  ignore: ensureTrailingSlash,
  never: stripTrailingSlash,
}

export function getLinkTransformer(context: StarlightOpenAPIContext) {
  if (context.build.format === 'file') {
    // Skip trailing slash handling for `build.format: 'file'`.
    return (path: string) => ensureHtmlExtension(path)
  }

  return trailingSlashTransformers[context.trailingSlash]
}

/**
 * Returns the schema base path without taking the Astro `base` configuration option into account.
 * @see {@link getSchemaBaseLink} for a link that does.
 */
export function getSchemaBasePath(config: StarlightOpenAPISchemaConfig) {
  const schemaBasePath = config.base
    .split('/')
    .map((part) => slug(part))
    .join('/')

  return `/${schemaBasePath}/`
}

/**
 * Returns a link for the schema base path with the Astro `base` configuration option taken into account.
 * @see {@link getSchemaBasePath} for a path that does not.
 */
export function getSchemaBaseLink(config: StarlightOpenAPISchemaConfig, context?: StarlightOpenAPIContext) {
  const schemaBasePath = stripLeadingSlash(getSchemaBasePath(config))
  const schemaBaseLink = schemaBasePath ? `${astroBase}/${schemaBasePath}` : `${astroBase}/`

  return context ? getLinkTransformer(context)(schemaBaseLink) : schemaBaseLink
}

// https://github.com/withastro/starlight/blob/bfcd532b3d43b68eb65366a09e9ab865eb6a55ad/packages/starlight/utils/slugs.ts#L103-L119
export function getSlugFromPathname(pathname: string): string | undefined {
  if (pathname.startsWith(astroBase)) pathname = pathname.slice(astroBase.length)

  const segments = pathname.split('/')

  if (segments.at(-1) === 'index.html') {
    // Remove trailing `index.html`.
    segments.pop()
  } else if (segments.at(-1)?.endsWith(htmlExt)) {
    // Remove trailing `.html`.
    const lastSegment = segments.pop()
    if (lastSegment) segments.push(lastSegment.slice(0, -1 * htmlExt.length))
  }

  return segments.filter(Boolean).join('/') || undefined
}

export function stripLeadingAndTrailingSlashes(path: string): string {
  return stripLeadingSlash(stripTrailingSlash(path))
}

function stripLeadingSlash(path: string) {
  if (!path.startsWith('/')) {
    return path
  }

  return path.slice(1)
}

export function stripTrailingSlash(path: string) {
  if (!path.endsWith('/')) {
    return path
  }

  return path.slice(0, -1)
}

function ensureTrailingSlash(path: string) {
  if (path.endsWith('/')) {
    return path
  }

  return `${path}/`
}

export function stripHtmlExtension(path: string) {
  const pathWithoutTrailingSlash = stripTrailingSlash(path)
  return pathWithoutTrailingSlash.endsWith('.html') ? pathWithoutTrailingSlash.slice(0, -5) : path
}

function ensureHtmlExtension(path: string) {
  path = stripTrailingSlash(path)

  if (!path.endsWith('.html')) {
    path = path ? `${path}.html` : '/index.html'
  }

  return path
}

type TrailingSlashTransformer = (path: string) => string
