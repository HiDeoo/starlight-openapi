import schemas from 'virtual:starlight-openapi-schemas'

import { getOperationsByTag } from './operation'
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
    operations.map(({ path }) => ({
      params: {
        openAPISlug: stripLeadingAndTrailingSlashes(baseLink + path),
      },
      props: {
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
  props: {
    schema: Schema
    type: 'overview' | 'operation'
  }
}
