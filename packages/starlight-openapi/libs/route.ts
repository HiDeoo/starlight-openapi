import schemas from 'virtual:starlight-openapi-schemas'

import {
  getOperationsByTag,
  getWebhooksOperations,
  isMinimalOperationTag,
  type OperationTag,
  type PathItemOperation,
} from './operation'
import { getSchemaBasePath, getSlugFromPathname, slug, stripLeadingAndTrailingSlashes } from './path'
import type { Schema } from './schema'

const routes = Object.values(schemas).flatMap((schema): StarlightOpenAPIRoute[] => [
  {
    params: {
      openAPISlug: stripLeadingAndTrailingSlashes(getSchemaBasePath(schema.config)),
    },
    props: {
      schema,
      type: 'schema-overview',
    },
  },
  ...getPathItemRoutes(schema),
  ...getWebhooksRoutes(schema),
])

const routesBySlug = new Map(routes.map((route) => [route.params.openAPISlug, route]))

export function getSchemaStaticPaths(): StarlightOpenAPIRoute[] {
  return routes
}

export function getSchemaRouteFromPathname(pathname: string): StarlightOpenAPIRoute | undefined {
  const slug = getSlugFromPathname(pathname)
  return slug === undefined ? undefined : routesBySlug.get(slug)
}

function getPathItemRoutes(schema: Schema): StarlightOpenAPIRoute[] {
  const schemaBasePath = getSchemaBasePath(schema.config)
  const operations = getOperationsByTag(schema)
  return [...operations.entries()].flatMap(([, operations]) => {
    const routes: StarlightOpenAPIRoute[] = operations.entries.map((operation) => ({
      params: {
        openAPISlug: stripLeadingAndTrailingSlashes(schemaBasePath + operation.slug),
      },
      props: {
        operation,
        schema,
        type: 'operation',
      },
    }))

    if (!isMinimalOperationTag(operations.tag)) {
      routes.unshift({
        params: {
          openAPISlug: stripLeadingAndTrailingSlashes(`${schemaBasePath}operations/tags/${slug(operations.tag.name)}`),
        },
        props: {
          schema,
          tag: operations.tag,
          type: 'operation-tag-overview',
        },
      })
    }

    return routes
  })
}

function getWebhooksRoutes(schema: Schema): StarlightOpenAPIRoute[] {
  const schemaBasePath = getSchemaBasePath(schema.config)
  const operations = getWebhooksOperations(schema)

  return operations.map((operation) => ({
    params: {
      openAPISlug: stripLeadingAndTrailingSlashes(schemaBasePath + operation.slug),
    },
    props: {
      operation,
      schema,
      type: 'operation',
    },
  }))
}

export type StarlightOpenAPIRouteProps =
  | StarlightOpenAPIRouteSchemaOverviewProps
  | StarlightOpenAPIRouteOperationProps
  | StarlightOpenAPIRouteOperationTagOverviewProps

interface StarlightOpenAPIRoute {
  params: { openAPISlug: string }
  props: StarlightOpenAPIRouteProps
}

interface StarlightOpenAPIRouteSchemaOverviewProps {
  schema: Schema
  type: 'schema-overview'
}

interface StarlightOpenAPIRouteOperationTagOverviewProps {
  schema: Schema
  tag: OperationTag
  type: 'operation-tag-overview'
}

interface StarlightOpenAPIRouteOperationProps {
  operation: PathItemOperation
  schema: Schema
  type: 'operation'
}
