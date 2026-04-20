import type { StarlightRouteData } from '@astrojs/starlight/route-data'
import type { HookParameters } from '@astrojs/starlight/types'
import type { MarkdownHeading } from 'astro'

import { getCallbacks } from './callback'
import {
  getOperationsByTag,
  getWebhooksOperations,
  type OperationHttpMethod,
  type OperationTag,
  type PathItemOperation,
} from './operation'
import { getParametersByLocation } from './parameter'
import { slug, stripHtmlExtension, stripLeadingAndTrailingSlashes } from './path'
import { isObjectLike } from './predicate'
import { hasRequestBody } from './requestBody'
import { includesDefaultResponse } from './response'
import { getSchemaSidebarGroups, type Schema } from './schemas/schema'
import { getSecurityDefinitions, getSecurityRequirements } from './security'
import { capitalize } from './utils'
import type { StarlightOpenAPIContext } from './vite'

const starlightOpenAPISidebarGroupsLabel = Symbol('StarlightOpenAPISidebarGroupsLabel')

export function getSidebarGroupsPlaceholder(): SidebarManualGroupConfig[] {
  return [getSidebarGroupPlaceholder(starlightOpenAPISidebarGroupsLabel)]
}

export function getSidebarGroupPlaceholder(label: symbol): SidebarManualGroupConfig {
  return {
    collapsed: false,
    items: [],
    label: label.toString(),
  }
}

export function getPageProps(
  title: string,
  schema: Schema,
  pathItemOperation?: PathItemOperation,
  tag?: OperationTag,
): StarlightPageProps {
  const isSchemaOverview = pathItemOperation === undefined
  const isOperationTagOverview = tag !== undefined

  return {
    frontmatter: {
      title,
    },
    headings: isOperationTagOverview
      ? getOperationTagOverviewHeadings(schema, tag)
      : isSchemaOverview
        ? getSchemaOverviewHeadings(schema)
        : getOperationHeadings(schema, pathItemOperation),
  }
}

export function getSidebarFromSchemas(
  pathname: string,
  sidebar: StarlightRouteData['sidebar'],
  schemas: Schema[],
  context: StarlightOpenAPIContext,
): StarlightRouteData['sidebar'] {
  if (sidebar.length === 0) {
    return sidebar
  }

  const sidebarGroups = schemas.map((schema) =>
    getSchemaSidebarGroups(pathname, schema, context, starlightOpenAPISidebarGroupsLabel.toString()),
  )

  const sidebarGroupsMap: Record<string, SidebarGroup[]> = {}

  for (const [label, group] of sidebarGroups) {
    sidebarGroupsMap[label] ??= []
    sidebarGroupsMap[label].push(group)
  }

  function replaceSidebarGroupsPlaceholder(group: SidebarGroup): SidebarGroup | SidebarGroup[] {
    const sidebarGroups = sidebarGroupsMap[group.label]

    if (sidebarGroups) {
      return sidebarGroups
    }

    if (isSidebarGroup(group)) {
      return {
        ...group,
        entries: group.entries.flatMap((item) => {
          return isSidebarGroup(item) ? replaceSidebarGroupsPlaceholder(item) : item
        }),
      }
    }

    return group
  }

  return sidebar.flatMap((item) => {
    return isSidebarGroup(item) ? replaceSidebarGroupsPlaceholder(item) : item
  })
}

export function makeSidebarGroup(label: string, entries: SidebarItem[], collapsed: boolean): SidebarGroup {
  return { type: 'group', collapsed, entries, label, badge: undefined }
}

export function makeSidebarLink(pathname: string, label: string, href: string, badge?: SidebarBadge): SidebarLink {
  return {
    type: 'link',
    isCurrent: pathname === stripLeadingAndTrailingSlashes(stripHtmlExtension(href)),
    label,
    href,
    badge,
    attrs: {},
  }
}

export function getMethodSidebarBadge(method: OperationHttpMethod): SidebarBadge {
  return { class: `sl-openapi-method-${method}`, text: method.toUpperCase(), variant: 'caution' }
}

export function getPaginationLinks(
  sidebar: StarlightRouteData['sidebar'],
  config: Pick<StarlightRouteData['entry']['data'], 'prev' | 'next'>,
  context: StarlightOpenAPIContext,
): StarlightRouteData['pagination'] {
  const links = flattenSidebar(sidebar)
  const currentIndex = links.findIndex((entry) => entry.isCurrent)

  return {
    prev: applyPaginationLinkConfig(links[currentIndex - 1], config.prev, context),
    next: applyPaginationLinkConfig(currentIndex > -1 ? links[currentIndex + 1] : undefined, config.next, context),
  }
}

function flattenSidebar(sidebar: StarlightRouteData['sidebar']): SidebarLink[] {
  return sidebar.flatMap((entry) => (entry.type === 'group' ? flattenSidebar(entry.entries) : entry))
}

// https://github.com/withastro/starlight/blob/cb573b5410ab97620b59f71a5a6e448f13b88a7f/packages/starlight/utils/navigation.ts#L495-L526
function applyPaginationLinkConfig(
  link: SidebarLink | undefined,
  config: StarlightRouteData['entry']['data']['prev'],
  context: StarlightOpenAPIContext,
): SidebarLink | undefined {
  // Explicitly remove the link.
  if (config === false) return undefined
  // Use the generated link if any.
  if (config === true) return link
  // If a link exists, update its label if needed.
  if (typeof config === 'string' && link) return { ...link, label: config }

  if (isObjectLike(config)) {
    if (link) {
      return {
        ...link,
        label: config.label ?? link.label,
        href: config.link ?? link.href,
        // Explicitly remove sidebar link attributes for prev/next links.
        attrs: {},
      }
    }
    if (config.link && config.label) {
      // If there is no link and the frontmatter contains both a URL and a label, create a new link.
      return {
        type: 'link',
        isCurrent: false,
        label: config.label,
        href: config.link,
        badge: undefined,
        attrs: {},
      }
    }
  }

  // Otherwise, if the global config is enabled, return the generated link if any.
  return context.pagination ? link : undefined
}

function isSidebarGroup(item: SidebarItem): item is SidebarGroup {
  return item.type === 'group'
}

function getSchemaOverviewHeadings(schema: Schema): MarkdownHeading[] {
  const { document } = schema

  const items: MarkdownHeading[] = [makeHeading(2, `${document.info.title} (${document.info.version})`, 'overview')]

  const securityDefinitions = getSecurityDefinitions(document)

  if (hasSchemaNavigationItems(schema)) {
    items.push(makeHeading(2, 'Operations'))
  }

  if (securityDefinitions) {
    items.push(
      makeHeading(2, 'Authentication'),
      ...Object.keys(securityDefinitions).map((name) => makeHeading(3, name)),
    )
  }

  return makeHeadings(items)
}

function getOperationTagOverviewHeadings(schema: Schema, tag: OperationTag): MarkdownHeading[] {
  const items: MarkdownHeading[] = [makeHeading(2, tag.name, 'overview')]

  if (hasOperationTagNavigationItems(schema, tag)) {
    items.push(makeHeading(2, 'Operations'))
  }

  return makeHeadings(items)
}

function getOperationHeadings(schema: Schema, { operation, pathItem }: PathItemOperation): MarkdownHeading[] {
  const items: MarkdownHeading[] = []

  const securityRequirements = getSecurityRequirements(operation, schema)

  if (securityRequirements && securityRequirements.length > 0) {
    items.push(makeHeading(2, 'Authorizations'))
  }

  const parametersByLocation = getParametersByLocation(operation.parameters, pathItem.parameters)

  if (parametersByLocation.size > 0) {
    items.push(
      makeHeading(2, 'Parameters'),
      ...[...parametersByLocation.keys()].map((location) => makeHeading(3, `${capitalize(location)} Parameters`)),
    )
  }

  if (hasRequestBody(operation)) {
    items.push(makeHeading(2, 'Request Body'))
  }

  const callbacks = getCallbacks(operation)
  const callbackIdentifiers = Object.keys(callbacks ?? {})

  if (callbackIdentifiers.length > 0) {
    items.push(makeHeading(2, 'Callbacks'), ...callbackIdentifiers.map((identifier) => makeHeading(3, identifier)))
  }

  if (operation.responses) {
    const responseItems: MarkdownHeading[] = []

    for (const name of Object.keys(operation.responses)) {
      if (name !== 'default') {
        responseItems.push(makeHeading(3, name))
      }
    }

    if (includesDefaultResponse(operation.responses)) {
      responseItems.push(makeHeading(3, 'default'))
    }

    items.push(makeHeading(2, 'Responses'), ...responseItems)
  }

  return makeHeadings(items)
}

function hasSchemaNavigationItems(schema: Schema): boolean {
  return getOperationsByTag(schema).size > 0 || getWebhooksOperations(schema).length > 0
}

function hasOperationTagNavigationItems(schema: Schema, tag: OperationTag): boolean {
  return (getOperationsByTag(schema).get(tag.name)?.entries.length ?? 0) > 0
}

function makeHeadings(items: MarkdownHeading[]): MarkdownHeading[] {
  return [makeHeading(1, 'Overview', '_top'), ...items]
}

function makeHeading(depth: number, text: string, customSlug?: string): MarkdownHeading {
  return { depth, slug: customSlug ?? slug(text), text }
}

type SidebarUserConfig = NonNullable<HookParameters<'config:setup'>['config']['sidebar']>

type SidebarItemConfig = SidebarUserConfig[number]
type SidebarManualGroupConfig = Extract<SidebarItemConfig, { items: SidebarItemConfig[] }>
export type StarlightOpenAPISidebarGroup = SidebarManualGroupConfig

type SidebarItem = StarlightRouteData['sidebar'][number]
type SidebarLink = Extract<SidebarItem, { type: 'link' }>
export type SidebarGroup = Extract<SidebarItem, { type: 'group' }>

export type SidebarBadge = SidebarItem['badge']

interface StarlightPageProps {
  frontmatter: {
    title: string
  }
  headings: MarkdownHeading[]
}
