import type { StarlightLocals } from '@astrojs/starlight'
import type { StarlightRouteData } from '@astrojs/starlight/route-data'
import type { HookParameters } from '@astrojs/starlight/types'
import type { MarkdownHeading } from 'astro'

import { getCallbacks } from './callback'
import { parameterLocationKeys } from './i18n'
import type { OperationHttpMethod, OperationTag, PathItemOperation } from './operation'
import { getParametersByLocation } from './parameter'
import { slug, stripLeadingAndTrailingSlashes } from './path'
import { hasRequestBody } from './requestBody'
import { includesDefaultResponse } from './response'
import { getSchemaSidebarGroups, type Schema } from './schema'
import { getSecurityDefinitions, getSecurityRequirements } from './security'
import { capitalize } from './utils'
import type { StarlightOpenAPIContext } from './vite'

/**
 * Translation function type from Starlight's i18n system.
 * Used to translate UI strings throughout the plugin.
 */
export type TranslationFunction = StarlightLocals['t']

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
  t?: TranslationFunction,
): StarlightPageProps {
  const isOverview = pathItemOperation === undefined
  const isOperationTag = tag !== undefined

  return {
    frontmatter: {
      title,
    },
    headings: isOperationTag
      ? getOperationTagHeadings(tag, t)
      : isOverview
        ? getOverviewHeadings(schema, t)
        : getOperationHeadings(schema, pathItemOperation, t),
  }
}

export function getSidebarFromSchemas(
  pathname: string,
  sidebar: StarlightRouteData['sidebar'],
  schemas: Schema[],
  context: StarlightOpenAPIContext,
  t: TranslationFunction,
): StarlightRouteData['sidebar'] {
  if (sidebar.length === 0) {
    return sidebar
  }

  const sidebarGroups = schemas.map((schema) =>
    getSchemaSidebarGroups(pathname, schema, context, starlightOpenAPISidebarGroupsLabel.toString(), t),
  )

  const sidebarGroupsMap: Record<string, SidebarGroup[]> = {}

  for (const [label, group] of sidebarGroups) {
    if (!sidebarGroupsMap[label]) sidebarGroupsMap[label] = []
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
  return { type: 'link', isCurrent: pathname === stripLeadingAndTrailingSlashes(href), label, href, badge, attrs: {} }
}

export function getMethodSidebarBadge(method: OperationHttpMethod): SidebarBadge {
  return { class: `sl-openapi-method-${method}`, text: method.toUpperCase(), variant: 'caution' }
}

function isSidebarGroup(item: SidebarItem): item is SidebarGroup {
  return item.type === 'group'
}

function getOverviewHeadings({ document }: Schema, t?: TranslationFunction): MarkdownHeading[] {
  const items: MarkdownHeading[] = [makeHeading(2, `${document.info.title} (${document.info.version})`, 'overview')]

  const securityDefinitions = getSecurityDefinitions(document)

  if (securityDefinitions) {
    const authLabel = t ? t('starlight-openapi.authentication') : 'Authentication'
    items.push(
      makeHeading(2, authLabel),
      ...Object.keys(securityDefinitions).map((name) => makeHeading(3, name)),
    )
  }

  return makeHeadings(items, t)
}

function getOperationTagHeadings(tag: OperationTag, _t?: TranslationFunction): MarkdownHeading[] {
  // Note: tag.name comes from OpenAPI spec and should not be translated
  return [makeHeading(2, tag.name, 'overview')]
}

function getOperationHeadings(schema: Schema, { operation, pathItem }: PathItemOperation, t?: TranslationFunction): MarkdownHeading[] {
  const items: MarkdownHeading[] = []

  const securityRequirements = getSecurityRequirements(operation, schema)

  if (securityRequirements && securityRequirements.length > 0) {
    const authLabel = t ? t('starlight-openapi.authorizations') : 'Authorizations'
    items.push(makeHeading(2, authLabel))
  }

  const parametersByLocation = getParametersByLocation(operation.parameters, pathItem.parameters)

  if (parametersByLocation.size > 0) {
    const paramsLabel = t ? t('starlight-openapi.parameters') : 'Parameters'
    items.push(
      makeHeading(2, paramsLabel),
      ...[...parametersByLocation.keys()].map((location) => {
        const key = parameterLocationKeys[location]
        const label = t && key ? t(key) : `${capitalize(location)} Parameters`
        return makeHeading(3, label)
      }),
    )
  }

  if (hasRequestBody(operation)) {
    const reqBodyLabel = t ? t('starlight-openapi.requestBody') : 'Request Body'
    items.push(makeHeading(2, reqBodyLabel))
  }

  const callbacks = getCallbacks(operation)
  const callbackIdentifiers = Object.keys(callbacks ?? {})

  if (callbackIdentifiers.length > 0) {
    const callbacksLabel = t ? t('starlight-openapi.callbacks') : 'Callbacks'
    items.push(makeHeading(2, callbacksLabel), ...callbackIdentifiers.map((identifier) => makeHeading(3, identifier)))
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

    const responsesLabel = t ? t('starlight-openapi.responses') : 'Responses'
    items.push(makeHeading(2, responsesLabel), ...responseItems)
  }

  return makeHeadings(items, t)
}

function makeHeadings(items: MarkdownHeading[], t?: TranslationFunction): MarkdownHeading[] {
  const overviewLabel = t ? t('starlight-openapi.overview') : 'Overview'
  return [makeHeading(1, overviewLabel, '_top'), ...items]
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

type SidebarBadge = SidebarItem['badge']

interface StarlightPageProps {
  frontmatter: {
    title: string
  }
  headings: MarkdownHeading[]
}
