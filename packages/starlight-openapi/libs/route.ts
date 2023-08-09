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
      },
    },
    ...getPathItemStaticPaths(schema),
  ])
}

function getPathItemStaticPaths(schema: Schema) {
  const baseLink = getBaseLink(schema.config)
  const operations = getOperationsByTag(schema.document)

  return [...operations.entries()].flatMap(([, operations]) =>
    operations.map(({ path }) => ({
      params: {
        openAPISlug: stripLeadingAndTrailingSlashes(baseLink + path),
      },
      props: {
        schema,
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
  }
}
