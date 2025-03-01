import { getOperationsByTag, getWebhooksOperations, isMinimalOperationTag } from './operation'
import { getBasePath, slug } from './path'
import type { Schema } from './schema'
import { getMethodSidebarBadge, makeSidebarGroup, makeSidebarLink, type SidebarManualGroup } from './starlight'

export function getPathItemSidebarGroups(schema: Schema): SidebarManualGroup['items'] {
  const { config } = schema
  const baseLink = getBasePath(config)
  const operations = getOperationsByTag(schema)

  return [...operations.entries()].map(([tag, operations]) => {
    const items = operations.entries.map(({ method, sidebar, slug }) =>
      makeSidebarLink(
        sidebar.label,
        baseLink + slug,
        config.sidebar.operations.badges ? getMethodSidebarBadge(method) : undefined,
      ),
    )

    if (!isMinimalOperationTag(operations.tag)) {
      items.unshift(makeSidebarLink('Overview', `${baseLink}operations/tags/${slug(operations.tag.name)}`))
    }

    return makeSidebarGroup(tag, items, config.sidebar.collapsed)
  })
}

export function getWebhooksSidebarGroups(schema: Schema): SidebarManualGroup['items'] {
  const { config } = schema
  const baseLink = getBasePath(config)
  const operations = getWebhooksOperations(schema)

  if (operations.length === 0) {
    return []
  }

  return [
    makeSidebarGroup(
      'Webhooks',
      operations.map(({ method, sidebar, slug }) =>
        makeSidebarLink(
          sidebar.label,
          baseLink + slug,
          config.sidebar.operations.badges ? getMethodSidebarBadge(method) : undefined,
        ),
      ),
      config.sidebar.collapsed,
    ),
  ]
}

export function isPathItem(pathItem: unknown): pathItem is PathItem {
  return typeof pathItem === 'object'
}

type Paths = NonNullable<Schema['document']['paths']>
export type PathItem = NonNullable<Paths[string]>
