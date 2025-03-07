import type { StarlightUserConfig } from '@astrojs/starlight/types'
import type { MarkdownHeading } from 'astro'

import type { OperationHttpMethod, OperationTag, PathItemOperation } from './operation'
import { getParametersByLocation } from './parameter'
import { slug } from './path'
import { hasRequestBody } from './requestBody'
import { includesDefaultResponse } from './response'
import { getSchemaSidebarGroups, type Schema } from './schema'
import { getSecurityDefinitions, getSecurityRequirements } from './security'
import { capitalize } from './utils'

const starlightOpenAPISidebarGroupsLabel = Symbol('StarlightOpenAPISidebarGroupsLabel')

export function getSidebarGroupsPlaceholder(): SidebarGroup[] {
  return [
    {
      collapsed: false,
      items: [],
      label: starlightOpenAPISidebarGroupsLabel.toString(),
    },
  ]
}

export function getPageProps(
  title: string,
  schema: Schema,
  pathItemOperation?: PathItemOperation,
  tag?: OperationTag,
): StarlightPageProps {
  const isOverview = pathItemOperation === undefined
  const isOperationTag = tag !== undefined

  return {
    frontmatter: {
      title,
    },
    headings: isOperationTag
      ? getOperationTagHeadings(tag)
      : isOverview
        ? getOverviewHeadings(schema)
        : getOperationHeadings(schema, pathItemOperation),
  }
}

export function getSidebarFromSchemas(
  sidebar: StarlightUserConfigSidebar,
  schemas: Schema[],
): StarlightUserConfigSidebar {
  if (!sidebar || sidebar.length === 0) {
    return sidebar
  }

  const sidebarGroups = schemas.map((schema) => getSchemaSidebarGroups(schema))

  function replaceSidebarGroupsPlaceholder(group: SidebarManualGroup): SidebarManualGroup | SidebarManualGroup[] {
    if (group.label === starlightOpenAPISidebarGroupsLabel.toString()) {
      return sidebarGroups
    }

    if (isSidebarManualGroup(group)) {
      return {
        ...group,
        items: group.items.flatMap((item) => {
          return isSidebarManualGroup(item) ? replaceSidebarGroupsPlaceholder(item) : item
        }),
      }
    }

    return group
  }

  return sidebar.flatMap((item) => {
    return isSidebarManualGroup(item) ? replaceSidebarGroupsPlaceholder(item) : item
  })
}

export function makeSidebarGroup(
  label: string,
  items: SidebarManualGroup['items'],
  collapsed: boolean,
): SidebarManualGroup {
  return { collapsed, items, label }
}

export function makeSidebarLink(label: string, link: string, badge?: StarlightUserConfigSidebarBadge): SidebarLink {
  return { label, link, badge }
}

export function getMethodSidebarBadge(method: OperationHttpMethod): StarlightUserConfigSidebarBadge {
  return { class: `sl-openapi-method-${method}`, text: method.toUpperCase(), variant: 'caution' }
}

function isSidebarManualGroup(item: NonNullable<StarlightUserConfigSidebar>[number]): item is SidebarManualGroup {
  return typeof item !== 'string' && 'items' in item
}

function getOverviewHeadings({ document }: Schema): MarkdownHeading[] {
  const items: MarkdownHeading[] = [makeHeading(2, `${document.info.title} (${document.info.version})`, 'overview')]

  const securityDefinitions = getSecurityDefinitions(document)

  if (securityDefinitions) {
    items.push(
      makeHeading(2, 'Authentication'),
      ...Object.keys(securityDefinitions).map((name) => makeHeading(3, name)),
    )
  }

  return makeHeadings(items)
}

function getOperationTagHeadings(tag: OperationTag): MarkdownHeading[] {
  return [makeHeading(2, tag.name, 'overview')]
}

function getOperationHeadings(schema: Schema, { operation, pathItem }: PathItemOperation): MarkdownHeading[] {
  const items: MarkdownHeading[] = []

  const securityRequirements = getSecurityRequirements(schema, operation)

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

function makeHeadings(items: MarkdownHeading[]): MarkdownHeading[] {
  return [makeHeading(1, 'Overview', '_top'), ...items]
}

function makeHeading(depth: number, text: string, customSlug?: string): MarkdownHeading {
  return { depth, slug: customSlug ?? slug(text), text }
}

type SidebarGroup =
  | SidebarManualGroup
  | {
      autogenerate: {
        collapsed?: boolean
        directory: string
      }
      collapsed?: boolean
      label: string
    }

export interface SidebarManualGroup {
  collapsed?: boolean
  items: (SidebarLink | SidebarGroup)[]
  label: string
}

interface SidebarLink {
  badge?: StarlightUserConfigSidebarBadge | undefined
  label: string
  link: string
}

interface StarlightPageProps {
  frontmatter: {
    title: string
  }
  headings: MarkdownHeading[]
}

type StarlightUserConfigSidebar = StarlightUserConfig['sidebar']
type StarlightUserConfigSidebarBadge = Exclude<
  NonNullable<Exclude<NonNullable<StarlightUserConfigSidebar>[number], string>['badge']>,
  string
>
