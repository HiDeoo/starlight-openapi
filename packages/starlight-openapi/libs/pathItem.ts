import {
  getOperationsByTag,
  getWebhooksOperations,
  isMinimalOperationTag,
  type OperationTag,
  type PathItemOperation,
} from './operation'
import { getSchemaBaseLink, getLinkTransformer, slug, type TrailingSlashTransformer } from './path'
import { isObjectLike } from './predicate'
import type { Schema } from './schemas/schema'
import {
  getMethodSidebarBadge,
  makeSidebarGroup,
  makeSidebarLink,
  type SidebarBadge,
  type SidebarGroup,
} from './starlight'
import type { StarlightOpenAPIContext } from './vite'

export function getPathItemSidebarGroups(
  pathname: string,
  schema: Schema,
  context: StarlightOpenAPIContext,
): SidebarGroup['entries'] {
  const { config } = schema
  const schemaBaseLink = getSchemaBaseLink(config)
  const transformLink = getLinkTransformer(context)

  return getSchemaNavigationGroups(schema, context)
    .filter((group): group is OperationsNavigationGroup => group.type === 'operations')
    .map((group) => {
      const items = group.links.map(({ badge, href, label }) => makeSidebarLink(pathname, label, href, badge))

      if (!isMinimalOperationTag(group.operationTag)) {
        items.unshift(
          makeSidebarLink(
            pathname,
            'Overview',
            transformLink(`${schemaBaseLink}operations/tags/${slug(group.operationTag.name)}`),
          ),
        )
      }

      return makeSidebarGroup(group.label, items, config.sidebar.collapsed)
    })
}

export function getWebhooksSidebarGroups(
  pathname: string,
  schema: Schema,
  context: StarlightOpenAPIContext,
): SidebarGroup['entries'] {
  const { config } = schema

  return getSchemaNavigationGroups(schema, context)
    .filter((group): group is WebhooksNavigationGroup => group.type === 'webhooks')
    .map((group) =>
      makeSidebarGroup(
        group.label,
        group.links.map(({ badge, href, label }) => makeSidebarLink(pathname, label, href, badge)),
        config.sidebar.collapsed,
      ),
    )
}

export function getSchemaNavigationGroups(schema: Schema, context: StarlightOpenAPIContext): SchemaNavigationGroup[] {
  const { config } = schema
  const schemaBaseLink = getSchemaBaseLink(config)
  const transformLink = getLinkTransformer(context)
  const operationsByTag = getOperationsByTag(schema)

  const operationGroups =
    config.sidebar.tags.sort === 'alphabetical'
      ? [...operationsByTag.entries()].toSorted(([a], [b]) => a.localeCompare(b))
      : [...operationsByTag.entries()]

  const groups: SchemaNavigationGroup[] = operationGroups.map(([label, operations]) => ({
    label,
    links: getSchemaNavigationLinks(operations.entries, schemaBaseLink, transformLink, config.sidebar.operations),
    operationTag: operations.tag,
    type: 'operations',
  }))

  const webhooks = getWebhooksOperations(schema)

  if (webhooks.length > 0) {
    groups.push({
      label: 'Webhooks',
      links: getSchemaNavigationLinks(webhooks, schemaBaseLink, transformLink, config.sidebar.operations),
      type: 'webhooks',
    })
  }

  return groups
}

export function isPathItem(pathItem: unknown): pathItem is PathItem {
  return isObjectLike(pathItem)
}

function getSchemaNavigationLinks(
  operations: PathItemOperation[],
  schemaBaseLink: string,
  transformLink: TrailingSlashTransformer,
  options: Schema['config']['sidebar']['operations'],
): SchemaNavigationLink[] {
  const entries =
    options.sort === 'alphabetical'
      ? operations.toSorted((a, b) => a.sidebar.label.localeCompare(b.sidebar.label))
      : operations

  return entries.map(({ method, path, sidebar, slug }) => ({
    badge: options.badges ? getMethodSidebarBadge(method) : undefined,
    href: transformLink(schemaBaseLink + slug),
    label: sidebar.label,
    method,
    path,
  }))
}

type Paths = NonNullable<Schema['document']['paths']>
export type PathItem = NonNullable<Paths[string]>

interface SchemaNavigationLink {
  badge?: SidebarBadge
  href: string
  label: string
  method: PathItemOperation['method']
  path?: PathItemOperation['path']
}

interface OperationsNavigationGroup {
  label: string
  links: SchemaNavigationLink[]
  operationTag: OperationTag
  type: 'operations'
}

interface WebhooksNavigationGroup {
  label: 'Webhooks'
  links: SchemaNavigationLink[]
  type: 'webhooks'
}

export type SchemaNavigationGroup = OperationsNavigationGroup | WebhooksNavigationGroup
