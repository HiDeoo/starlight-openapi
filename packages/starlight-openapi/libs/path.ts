import { slug } from 'github-slugger'

import type { StarlightOpenAPISchemaConfig } from './schema'

export { slug } from 'github-slugger'

export function getBaseLink(config: StarlightOpenAPISchemaConfig) {
  const path = config.base
    .split('/')
    .map((part) => slug(part))
    .join('/')

  return `/${path}/`
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
