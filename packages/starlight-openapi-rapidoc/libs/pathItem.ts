import { getOperationsByTag, getWebhooksOperations } from './operation'
import { getBaseLink } from './path'
import type { Schema } from './schema'
import {
  makeSidebarGroup,
  makeSidebarLink,
  makeSidebarLinkFromPathOperation,
  type SidebarManualGroup,
} from './starlight'

export function getPathItemSidebarGroups({ config, document }: Schema): SidebarManualGroup['items'] {
  const baseLink = getBaseLink(config)
  const { showMethodBadgeSidebar } = config
  const operations = getOperationsByTag(document)

  return [...operations.entries()].map(([tag, operations]) =>
    makeSidebarGroup(
      tag,
      operations.map((operation) => makeSidebarLinkFromPathOperation(operation, { baseLink, showMethodBadgeSidebar })),
      config.collapsed,
    ),
  )
}

export function getWebhooksSidebarGroups({ config, document }: Schema): SidebarManualGroup['items'] {
  const baseLink = getBaseLink(config)
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
