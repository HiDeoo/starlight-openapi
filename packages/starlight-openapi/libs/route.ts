import schemas from 'virtual:starlight-openapi-schemas'

import { getOperationsByTag, type PathItemOperation } from './operation'
import { getBaseLink, stripLeadingAndTrailingSlashes } from './path'
import type { Schema } from './schema'

export function getSchemaStaticPaths(): StarlighOpenAPIRoute[] {
  return Object.values(schemas).flatMap((schema) => [
    {
      params: {
        openAPISlug: stripLeadingAndTrailingSlashes(getBaseLink(schema.config)),
      },
      props: {
        schema,
        type: 'overview',
      },
    },
    ...getPathItemStaticPaths(schema),
  ])
}

function getPathItemStaticPaths(schema: Schema): StarlighOpenAPIRoute[] {
  const baseLink = getBaseLink(schema.config)
  const operations = getOperationsByTag(schema.document)

  return [...operations.entries()].flatMap(([, operations]) =>
    operations.map((operation) => ({
      params: {
        openAPISlug: stripLeadingAndTrailingSlashes(baseLink + operation.slug),
      },
      props: {
        operation,
        schema,
        type: 'operation',
      },
    })),
  )
}

interface StarlighOpenAPIRoute {
  params: {
    openAPISlug: string
  }
  props: StarlighOpenAPIRouteOverviewProps | StarlighOpenAPIRouteOperationProps
}

interface StarlighOpenAPIRouteOverviewProps {
  schema: Schema
  type: 'overview'
}

interface StarlighOpenAPIRouteOperationProps {
  operation: PathItemOperation
  schema: Schema
  type: 'operation'
}
