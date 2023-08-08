import type { z } from 'astro/zod'
import type { OpenAPI } from 'openapi-types'
import schemas from 'virtual:starlight-openapi-schemas'

import type { SchemaConfigSchema } from './config'
import { stripLeadingAndTrailingSlashes } from './path'

export function getSchemasStaticPaths() {
  return Object.values(schemas).map(({ config, schema }) => {
    return {
      params: {
        base: stripLeadingAndTrailingSlashes(config.base),
        slug: undefined,
      },
      props: {
        config,
        schema,
      },
    }
  })
}

export type StarlightOpenAPISchema = OpenAPI.Document
export type StarlightOpenAPISchemaConfig = z.infer<typeof SchemaConfigSchema>

export interface Schema {
  config: StarlightOpenAPISchemaConfig
  schema: StarlightOpenAPISchema
}

export type Schemas = Record<StarlightOpenAPISchemaConfig['base'], Schema>
