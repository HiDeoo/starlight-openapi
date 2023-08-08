import { slug } from 'github-slugger'

export function stripLeadingAndTrailingSlashes(path: string): string {
  return stripLeadingSlash(stripTrailingSlash(path))
}

export function slugifyPath(path: string) {
  return path
    .split('/')
    .map((part) => slug(part))
    .join('/')
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
