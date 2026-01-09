import { getOperationsByTag, getWebhooksOperations, isMinimalOperationTag } from './operation'
import { getBaseLink, getTrailingSlashTransformer, slug } from './path'
import type { Schema } from './schema'
import { getMethodSidebarBadge, makeSidebarGroup, makeSidebarLink, type SidebarGroup, type TranslationFunction } from './starlight'
import type { StarlightOpenAPIContext } from './vite'

export function getPathItemSidebarGroups(
  pathname: string,
  schema: Schema,
  context: StarlightOpenAPIContext,
  t?: TranslationFunction,
): SidebarGroup['entries'] {
  const { config } = schema
  const baseLink = getBaseLink(config)
  const operations = getOperationsByTag(schema)
  const overviewLabel = t ? t('starlight-openapi.overview') : 'Overview'

  const tags =
    config.sidebar.tags.sort === 'alphabetical'
      ? [...operations.entries()].sort((a, b) => a[0].localeCompare(b[0]))
      : [...operations.entries()]

  return tags.map(([tag, operations]) => {
    const entries =
      config.sidebar.operations.sort === 'alphabetical'
        ? operations.entries.sort((a, b) => a.sidebar.label.localeCompare(b.sidebar.label))
        : operations.entries

    const items = entries.map(({ method, sidebar, slug }) => {
      return makeSidebarLink(
        pathname,
        sidebar.label,
        getTrailingSlashTransformer(context)(baseLink + slug),
        config.sidebar.operations.badges ? getMethodSidebarBadge(method) : undefined,
      )
    })

    if (!isMinimalOperationTag(operations.tag)) {
      items.unshift(
        makeSidebarLink(
          pathname,
          overviewLabel,
          getTrailingSlashTransformer(context)(`${baseLink}operations/tags/${slug(operations.tag.name)}`),
        ),
      )
    }

    return makeSidebarGroup(tag, items, config.sidebar.collapsed)
  })
}

export function getWebhooksSidebarGroups(
  pathname: string,
  schema: Schema,
  context: StarlightOpenAPIContext,
  t?: TranslationFunction,
): SidebarGroup['entries'] {
  const { config } = schema
  const baseLink = getBaseLink(config)
  const operations = getWebhooksOperations(schema)

  if (operations.length === 0) {
    return []
  }

  const entries =
    config.sidebar.operations.sort === 'alphabetical'
      ? operations.sort((a, b) => a.sidebar.label.localeCompare(b.sidebar.label))
      : operations

  const webhooksLabel = t ? t('starlight-openapi.webhooks') : 'Webhooks'

  return [
    makeSidebarGroup(
      webhooksLabel,
      entries.map(({ method, sidebar, slug }) =>
        makeSidebarLink(
          pathname,
          sidebar.label,
          getTrailingSlashTransformer(context)(baseLink + slug),
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
