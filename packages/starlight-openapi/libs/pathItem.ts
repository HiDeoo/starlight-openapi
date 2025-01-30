import { getOperationsByTag, getWebhooksOperations, isMinimalOperationTag } from './operation'
import { getBasePath, slug } from './path'
import type { Schema } from './schema'
import { getMethodSidebarBadge, makeSidebarGroup, makeSidebarLink, type SidebarManualGroup } from './starlight'

export function getPathItemSidebarGroups({ config, document }: Schema): SidebarManualGroup['items'] {
  const baseLink = getBasePath(config)
  const operations = getOperationsByTag(document)

  return [...operations.entries()].map(([tag, operations]) => {
    const items = operations.entries.map(({ method, slug, title }) =>
      makeSidebarLink(title, baseLink + slug, config.sidebarMethodBadges ? getMethodSidebarBadge(method) : undefined),
    )

    if (!isMinimalOperationTag(operations.tag)) {
      items.unshift(makeSidebarLink('Overview', `${baseLink}operations/tags/${slug(operations.tag.name)}`))
    }

    return makeSidebarGroup(tag, items, config.collapsed)
  })
}

export function getWebhooksSidebarGroups({ config, document }: Schema): SidebarManualGroup['items'] {
  const baseLink = getBasePath(config)
  const operations = getWebhooksOperations(document)

  if (operations.length === 0) {
    return []
  }

  return [
    makeSidebarGroup(
      'Webhooks',
      operations.map(({ method, slug, title }) =>
        makeSidebarLink(title, baseLink + slug, config.sidebarMethodBadges ? getMethodSidebarBadge(method) : undefined),
      ),
      config.collapsed,
    ),
  ]
}

export function isPathItem(pathItem: unknown): pathItem is PathItem {
  return typeof pathItem === 'object'
}

type Paths = NonNullable<Schema['document']['paths']>
export type PathItem = NonNullable<Paths[string]>
