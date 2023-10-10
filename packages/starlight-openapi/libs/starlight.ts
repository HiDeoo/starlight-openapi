import type { Props } from '@astrojs/starlight/props'
import type { StarlightConfig } from '@astrojs/starlight/types'
import type { MarkdownHeading } from 'astro'

import type { PathItemOperation } from './operation'
import { getParametersByLocation } from './parameter'
import { slug } from './path'
import { hasRequestBody } from './requestBody'
import { includesDefaultResponse } from './response'
import type { Schema } from './schema'
import { getSecurityDefinitions, getSecurityRequirements } from './security'
import { capitalize } from './utils'

export function getPageProps(
  starlightConfig: StarlightConfig,
  title: string,
  schema: Schema,
  pathItemOperation?: PathItemOperation,
): Props {
  const isOverview = pathItemOperation === undefined
  const entryMeta = getEntryMeta(starlightConfig)
  const pageSlug = slug(title)

  return {
    ...entryMeta,
    editUrl: undefined,
    entry: {
      data: {
        head: [],
        pagefind: false,
        title,
      },
      slug: pageSlug,
    },
    entryMeta,
    hasSidebar: false,
    headings: [],
    id: pageSlug,
    lastUpdated: undefined,
    pagination: {
      next: undefined,
      prev: undefined,
    },
    sidebar: [],
    slug: pageSlug,
    toc: {
      items: isOverview ? getOverviewTocItems(schema) : getOperationTocItems(schema, pathItemOperation),
      minHeadingLevel: 2,
      maxHeadingLevel: 3,
    },
  }
}

export function makeSidebarGroup(label: string, items: SidebarGroup['items'], collapsed: boolean): SidebarGroup {
  return { collapsed, items, label }
}

export function makeSidebarLink(label: string, link: string): SidebarLink {
  return { label, link }
}

function getOverviewTocItems({ document }: Schema): TocItem[] {
  const items: TocItem[] = [makeTocItem(2, `${document.info.title} (${document.info.version})`, [], 'overview')]

  const securityDefinitions = getSecurityDefinitions(document)

  if (securityDefinitions) {
    items.push(
      makeTocItem(
        2,
        'Authentication',
        Object.keys(securityDefinitions).map((name) => makeTocItem(3, name)),
      ),
    )
  }

  return makeToc(items)
}

function getOperationTocItems(schema: Schema, { operation, pathItem }: PathItemOperation): TocItem[] {
  const items: TocItem[] = []

  const securityRequirements = getSecurityRequirements(schema, operation)

  if (securityRequirements && securityRequirements.length > 0) {
    items.push(makeTocItem(2, 'Authorizations'))
  }

  const parametersByLocation = getParametersByLocation(operation.parameters, pathItem.parameters)

  if (parametersByLocation.size > 0) {
    items.push(
      makeTocItem(
        2,
        'Parameters',
        [...parametersByLocation.keys()].map((location) => makeTocItem(3, `${capitalize(location)} Parameters`)),
      ),
    )
  }

  if (hasRequestBody(operation)) {
    items.push(makeTocItem(2, 'Request Body'))
  }

  if (operation.responses) {
    const responseItems: TocItem[] = []

    for (const name of Object.keys(operation.responses)) {
      if (name !== 'default') {
        responseItems.push(makeTocItem(3, name))
      }
    }

    if (includesDefaultResponse(operation.responses)) {
      responseItems.push(makeTocItem(3, 'default'))
    }

    items.push(makeTocItem(2, 'Responses', responseItems))
  }

  return makeToc(items)
}

function makeToc(items: TocItem[]): TocItem[] {
  return [makeTocItem(1, 'Overview', [], '_top'), ...items]
}

function makeTocItem(depth: number, text: string, children: TocItem[] = [], customSlug?: string): TocItem {
  return { children, depth, slug: customSlug ?? slug(text), text }
}

function getEntryMeta(starlightConfig: StarlightConfig) {
  const dir = starlightConfig.defaultLocale.dir
  const lang = starlightConfig.defaultLocale.lang ?? 'en'
  let locale = starlightConfig.defaultLocale.locale

  if (locale === 'root') {
    locale = undefined
  }

  return { dir, lang, locale }
}

export interface SidebarGroup {
  collapsed: boolean
  items: (SidebarLink | SidebarGroup)[]
  label: string
}

interface SidebarLink {
  label: string
  link: string
}

export interface TocItem extends MarkdownHeading {
  children: TocItem[]
}
