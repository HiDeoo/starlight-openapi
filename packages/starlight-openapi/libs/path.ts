import { slug } from 'github-slugger'

import type { StarlightOpenAPISchemaConfig } from './schema'

export { slug } from 'github-slugger'

const base = stripTrailingSlash(import.meta.env.BASE_URL)

/**
 * Does not take the Astro `base` configuration option into account.
 * @see {@link getBaseLink} for a link that does.
 */
export function getBasePath(config: StarlightOpenAPISchemaConfig) {
  const path = config.base
    .split('/')
    .map((part) => slug(part))
    .join('/')

  return `/${path}/`
}

/**
 * Takes the Astro `base` configuration option into account.
 * @see {@link getBasePath} for a slug that does not.
 */
export function getBaseLink(config: StarlightOpenAPISchemaConfig) {
  const path = stripLeadingSlash(getBasePath(config))

  return path ? `${base}/${path}` : `${base}/`
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

function stripTrailingSlash(path: string) {
  if (!path.endsWith('/')) {
    return path
  }

  return path.slice(0, -1)
}
