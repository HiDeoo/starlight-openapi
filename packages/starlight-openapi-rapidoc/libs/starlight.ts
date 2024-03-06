import type { StarlightPageProps } from '@astrojs/starlight/props'
import type { StarlightUserConfig } from '@astrojs/starlight/types'
import type { MarkdownHeading } from 'astro'

import type { PathItemOperation } from './operation'
import { getParametersByLocation } from './parameter'
import { slug } from './path'
import { hasRequestBody } from './requestBody'
import { includesDefaultResponse } from './response'
import { getSchemaSidebarGroups, type Schema } from './schema'
import { getSecurityDefinitions, getSecurityRequirements } from './security'
import { capitalize, generateRandomIdentifier } from './utils'

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

export function generateSidebarGroupIdentifier(identifier: string): {
  id: symbol
  items: SidebarGroup[]
} {
  // validate if identifier is a symbol
  if (!identifier) {
    throw new Error('Identifier is required')
  }

  const id = generateRandomIdentifier(identifier)

  return {
    id,
    items: [
      {
        collapsed: false,
        items: [],
        label: id.toString(),
      },
    ],
  }
}

export function getPageProps(
  frontmatterProps: StarlightPageProps['frontmatter'] | null,
  schema: Schema,
  pathItemOperation?: PathItemOperation,
): StarlightPageProps {
  const isOverview = pathItemOperation === undefined

  let frontmatter: StarlightPageProps['frontmatter'] = {
    tableOfContents: false,
    title: '',
  }

  if (frontmatterProps) {
    frontmatter = {
      ...frontmatter,
      ...(frontmatterProps as Record<string, unknown>),
    }
  }

  return {
    frontmatter,
    headings: isOverview ? getOverviewHeadings(schema) : getOperationHeadings(schema, pathItemOperation),
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

  const sidebarGroupsByGroupIdentifier = new Map<symbol, SidebarManualGroup>()

  for (const sidebarGroup of sidebarGroups) {
    if (sidebarGroup.group) {
      sidebarGroupsByGroupIdentifier.set(sidebarGroup.group, sidebarGroup)
    }
  }

  const groups = [...sidebarGroupsByGroupIdentifier]

  function replaceSidebarGroupsPlaceholder(group: SidebarManualGroup): SidebarManualGroup | SidebarManualGroup[] {
    if (group.label === starlightOpenAPISidebarGroupsLabel.toString()) {
      return sidebarGroups
    }

    const groupToReplace = groups.find(([identifier]) => identifier.toString() === group.label)
    if (groupToReplace) {
      const [, sidebarGroup] = groupToReplace
      return sidebarGroup
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
  group?: SidebarManualGroup['group'],
): SidebarManualGroup {
  return { collapsed, items, label, group }
}

export const chooseBadgeVariant = (method: string) => {
  switch (method) {
    case 'get': {
      return 'note'
    }
    case 'post': {
      return 'success'
    }
    case 'put':
    case 'patch': {
      return 'caution'
    }
    case 'delete': {
      return 'danger'
    }
    default: {
      return 'tip'
    }
  }
}

export function makeSidebarLink(label: string, link: string): SidebarLink {
  return { label, link }
}

export function makeSidebarLinkFromPathOperation(
  operation: PathItemOperation,
  config: { baseLink: string; showMethodBadgeSidebar: boolean | undefined },
): SidebarLink {
  const { slug, title, method } = operation
  const { baseLink = '', showMethodBadgeSidebar = false } = config

  return {
    label: title,
    link: baseLink + slug,
    attrs: { class: `sord-operation-link method-${method}` },
    badge: showMethodBadgeSidebar
      ? {
          text: method.toUpperCase(),
          variant: chooseBadgeVariant(method),
        }
      : undefined,
  }
}

function isSidebarManualGroup(item: NonNullable<StarlightUserConfigSidebar>[number]): item is SidebarManualGroup {
  return 'items' in item
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

      badge?:
        | string
        | {
            text: string
            variant?: 'note' | 'danger' | 'success' | 'caution' | 'tip' | 'default' | undefined
          }
    }

export interface SidebarManualGroup {
  collapsed?: boolean
  items: (SidebarLink | SidebarGroup)[]
  label: string
  group?: symbol | undefined
}

interface SidebarLink {
  label: string
  link: string
  translations?: Record<string, string> | undefined
  attrs?: Record<string, string> | undefined
  badge?:
    | undefined
    | string
    | {
        text: string
        variant?: 'note' | 'danger' | 'success' | 'caution' | 'tip' | 'default' | undefined
      }
}

type StarlightUserConfigSidebar = StarlightUserConfig['sidebar']
