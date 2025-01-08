import { getOperationsByTag, getWebhooksOperations, isMinimalOperationTag } from './operation'
import { getBasePath, slug } from './path'
import type { Schema } from './schema'
import { makeSidebarGroup, makeSidebarLink, type SidebarManualGroup } from './starlight'

export function getPathItemSidebarGroups({ config, document }: Schema): SidebarManualGroup['items'] {
  const baseLink = getBasePath(config)
  const operations = getOperationsByTag(document)

  return [...operations.entries()].map(([tag, operations]) => {
    const items = operations.entries.map(({ slug, title }) => makeSidebarLink(title, baseLink + slug))

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
      operations.map(({ slug, title }) => makeSidebarLink(title, baseLink + slug)),
      config.collapsed,
    ),
  ]
}

export function isPathItem(pathItem: unknown): pathItem is PathItem {
  return typeof pathItem === 'object'
}

type Paths = NonNullable<Schema['document']['paths']>
export type PathItem = NonNullable<Paths[string]>
