import { getOperationsByTag } from './operation'
import { getBaseLink } from './path'
import type { Schema } from './schema'
import { makeSidebarGroup, makeSidebarLink, type SidebarGroup } from './starlight'

export function getPathItemSidebarGroups({ config, document }: Schema): SidebarGroup['items'] {
  const baseLink = getBaseLink(config)
  const operations = getOperationsByTag(document)

  return [...operations.entries()].map(([tag, operations]) =>
    makeSidebarGroup(
      tag,
      operations.map(({ id, operation, slug }) => makeSidebarLink(operation.summary ?? id, baseLink + slug)),
    ),
  )
}

export function isPathItem(pathItem: unknown): pathItem is PathItem {
  return typeof pathItem === 'object'
}

type Paths = NonNullable<Schema['document']['paths']>
export type PathItem = NonNullable<Paths[string]>
